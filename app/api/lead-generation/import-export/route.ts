import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { parse } from 'csv-parse/sync';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, data } = body;

    switch (action) {
      case 'import_leads': {
        const { csvData, format, options } = data;

        if (!csvData) {
          return NextResponse.json(
            { error: 'CSV data is required' },
            { status: 400 }
          );
        }

        const result = await importLeads(session.user.id, csvData, format, options);
        return NextResponse.json(result);
      }

      case 'export_leads': {
        const { leadIds, format, includeActivities } = data;

        const result = await exportLeads(session.user.id, leadIds, format, includeActivities);
        return NextResponse.json(result);
      }

      case 'validate_import': {
        const { csvData, format } = data;

        if (!csvData) {
          return NextResponse.json(
            { error: 'CSV data is required' },
            { status: 400 }
          );
        }

        const result = await validateImportData(csvData, format);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Import/Export error:', error);
    return NextResponse.json(
      { error: 'Failed to process import/export request' },
      { status: 500 }
    );
  }
}

async function importLeads(
  userId: string,
  csvData: string,
  format: string = 'standard',
  options: any = {}
) {
  try {
    // Parse CSV data
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const results = {
      total: records.length,
      imported: 0,
      skipped: 0,
      errors: [] as any[],
      duplicates: 0,
    };

    for (let i = 0; i < records.length; i++) {
      const record = records[i];

      try {
        // Map CSV columns to lead fields based on format
        const leadData = mapCsvToLead(record, format);

        if (!leadData.companyName && !leadData.contactEmail) {
          results.skipped++;
          results.errors.push({
            row: i + 1,
            error: 'Missing required fields: company name or contact email'
          });
          continue;
        }

        // Check for duplicates
        const existingLead = await db.agencyLead.findFirst({
          where: {
            userId,
            OR: [
              ...(leadData.contactEmail ? [{ contactEmail: leadData.contactEmail }] : []),
              ...(leadData.companyName ? [{ companyName: leadData.companyName }] : []),
            ],
          },
        });

        if (existingLead && !options.allowDuplicates) {
          results.duplicates++;
          results.errors.push({
            row: i + 1,
            error: `Duplicate lead: ${leadData.companyName || leadData.contactEmail}`
          });
          continue;
        }

        // Create the lead
        await db.agencyLead.create({
          data: {
            userId,
            title: leadData.title || `Lead from ${leadData.companyName || 'Import'}`,
            companyName: leadData.companyName || '',
            contactName: leadData.contactName,
            contactEmail: leadData.contactEmail,
            status: leadData.status || 'NEW',
            estimatedValue: leadData.estimatedValue,
            probability: leadData.probability,
            description: leadData.description,
            metadata: {
              importSource: 'csv',
              importDate: new Date().toISOString(),
              originalRow: i + 1,
              ...leadData.metadata,
            },
          },
        });

        results.imported++;
      } catch (error) {
        results.errors.push({
          row: i + 1,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    console.error('Import error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Import failed'
    };
  }
}

async function exportLeads(
  userId: string,
  leadIds?: string[],
  format: string = 'csv',
  includeActivities: boolean = false
) {
  try {
    const whereClause: any = { userId };

    if (leadIds && leadIds.length > 0) {
      whereClause.id = { in: leadIds };
    }

    const leads = await db.agencyLead.findMany({
      where: whereClause,
      include: {
        ...(includeActivities && {
          outreachActivities: {
            include: {
              communications: true,
            },
          },
        }),
      },
      orderBy: { createdAt: 'desc' },
    });

    if (format === 'csv') {
      const csvData = generateCsvData(leads, includeActivities);
      return {
        success: true,
        data: {
          content: csvData,
          filename: `leads_export_${new Date().toISOString().split('T')[0]}.csv`,
          contentType: 'text/csv',
          total: leads.length,
        },
      };
    } else if (format === 'json') {
      return {
        success: true,
        data: {
          content: JSON.stringify(leads, null, 2),
          filename: `leads_export_${new Date().toISOString().split('T')[0]}.json`,
          contentType: 'application/json',
          total: leads.length,
        },
      };
    } else {
      throw new Error('Unsupported export format');
    }
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Export failed'
    };
  }
}

async function validateImportData(csvData: string, format: string = 'standard') {
  try {
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const validation = {
      totalRows: records.length,
      validRows: 0,
      invalidRows: 0,
      warnings: [] as any[],
      errors: [] as any[],
      preview: [] as any[],
      columnMapping: {} as Record<string, string>,
    };

    // Analyze columns
    const columns = Object.keys(records[0] || {});
    validation.columnMapping = analyzeColumns(columns, format);

    // Validate first 10 rows for preview
    const previewCount = Math.min(10, records.length);

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const leadData = mapCsvToLead(record, format);

      let isValid = true;
      const rowErrors = [];
      const rowWarnings = [];

      // Required field validation
      if (!leadData.companyName && !leadData.contactEmail) {
        isValid = false;
        rowErrors.push('Missing company name or contact email');
      }

      // Email validation
      if (leadData.contactEmail && !isValidEmail(leadData.contactEmail)) {
        isValid = false;
        rowErrors.push('Invalid email format');
      }

      // Estimated value validation
      if (leadData.estimatedValue && (isNaN(leadData.estimatedValue) || leadData.estimatedValue < 0)) {
        rowWarnings.push('Invalid estimated value, will be set to 0');
      }

      // Probability validation
      if (leadData.probability && (leadData.probability < 0 || leadData.probability > 100)) {
        rowWarnings.push('Probability should be between 0-100%');
      }

      if (isValid) {
        validation.validRows++;
      } else {
        validation.invalidRows++;
        validation.errors.push({
          row: i + 1,
          errors: rowErrors,
        });
      }

      if (rowWarnings.length > 0) {
        validation.warnings.push({
          row: i + 1,
          warnings: rowWarnings,
        });
      }

      // Add to preview
      if (i < previewCount) {
        validation.preview.push({
          row: i + 1,
          original: record,
          mapped: leadData,
          valid: isValid,
          errors: rowErrors,
          warnings: rowWarnings,
        });
      }
    }

    return {
      success: true,
      data: validation,
    };
  } catch (error) {
    console.error('Validation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Validation failed'
    };
  }
}

function mapCsvToLead(record: any, format: string) {
  const mapping = getFieldMapping(format);

  const leadData: any = {};

  for (const [leadField, csvField] of Object.entries(mapping)) {
    if (record[csvField]) {
      if (leadField === 'estimatedValue') {
        leadData[leadField] = parseFloat(record[csvField]) || 0;
      } else if (leadField === 'probability') {
        leadData[leadField] = parseInt(record[csvField]) || 0;
      } else {
        leadData[leadField] = record[csvField];
      }
    }
  }

  // Handle metadata fields
  leadData.metadata = {};
  for (const [key, value] of Object.entries(record)) {
    if (!Object.values(mapping).includes(key)) {
      leadData.metadata[key] = value;
    }
  }

  return leadData;
}

function getFieldMapping(format: string): Record<string, string> {
  switch (format) {
    case 'salesforce':
      return {
        companyName: 'Account Name',
        contactName: 'Contact Name',
        contactEmail: 'Email',
        title: 'Title',
        status: 'Lead Status',
        estimatedValue: 'Annual Revenue',
        description: 'Description',
      };

    case 'hubspot':
      return {
        companyName: 'Company Name',
        contactName: 'Contact Name',
        contactEmail: 'Email',
        title: 'Job Title',
        status: 'Lead Status',
        estimatedValue: 'Deal Amount',
        description: 'About',
      };

    case 'linkedin':
      return {
        companyName: 'Company',
        contactName: 'Name',
        contactEmail: 'Email Address',
        title: 'Position',
        description: 'Summary',
      };

    default: // standard format
      return {
        companyName: 'Company Name',
        contactName: 'Contact Name',
        contactEmail: 'Email',
        title: 'Title',
        status: 'Status',
        estimatedValue: 'Estimated Value',
        probability: 'Probability',
        description: 'Description',
      };
  }
}

function analyzeColumns(columns: string[], format: string) {
  const mapping = getFieldMapping(format);
  const result: Record<string, string> = {};

  for (const [leadField, expectedColumn] of Object.entries(mapping)) {
    // Find exact match first
    let matchedColumn = columns.find(col => col === expectedColumn);

    if (!matchedColumn) {
      // Try case-insensitive match
      matchedColumn = columns.find(col =>
        col.toLowerCase() === expectedColumn.toLowerCase()
      );
    }

    if (!matchedColumn) {
      // Try partial match
      matchedColumn = columns.find(col =>
        col.toLowerCase().includes(expectedColumn.toLowerCase()) ||
        expectedColumn.toLowerCase().includes(col.toLowerCase())
      );
    }

    if (matchedColumn) {
      result[leadField] = matchedColumn;
    }
  }

  return result;
}

function generateCsvData(leads: any[], includeActivities: boolean = false): string {
  const headers = [
    'ID',
    'Company Name',
    'Contact Name',
    'Email',
    'Title',
    'Status',
    'Estimated Value',
    'Probability',
    'Description',
    'Created At',
    'Last Contacted',
  ];

  if (includeActivities) {
    headers.push('Total Activities', 'Last Activity', 'Last Activity Type');
  }

  const rows = leads.map(lead => {
    const row = [
      lead.id,
      lead.companyName || '',
      lead.contactName || '',
      lead.contactEmail || '',
      lead.title || '',
      lead.status,
      lead.estimatedValue || '',
      lead.probability || '',
      lead.description || '',
      lead.createdAt,
      lead.lastContactedAt || '',
    ];

    if (includeActivities && lead.outreachActivities) {
      const activities = lead.outreachActivities;
      const lastActivity = activities[activities.length - 1];

      row.push(
        activities.length.toString(),
        lastActivity ? lastActivity.createdAt : '',
        lastActivity ? lastActivity.type : ''
      );
    }

    return row;
  });

  // Convert to CSV format
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  return csvContent;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}