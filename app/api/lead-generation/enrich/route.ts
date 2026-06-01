import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { enrichmentService } from '@/lib/lead-generation/enrichment-service';

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
      case 'enrich_company': {
        const { domain } = data;

        if (!domain) {
          return NextResponse.json(
            { error: 'Domain is required' },
            { status: 400 }
          );
        }

        const enrichedData = await enrichmentService.enrichCompany(domain);

        return NextResponse.json({
          success: true,
          data: enrichedData
        });
      }

      case 'enrich_contact': {
        const { email, domain } = data;

        if (!email) {
          return NextResponse.json(
            { error: 'Email is required' },
            { status: 400 }
          );
        }

        const enrichedData = await enrichmentService.enrichContact(email, domain);

        return NextResponse.json({
          success: true,
          data: enrichedData
        });
      }

      case 'find_contacts': {
        const { domain, filters, limit, offset } = data;

        if (!domain) {
          return NextResponse.json(
            { error: 'Domain is required' },
            { status: 400 }
          );
        }

        // Use new search capabilities if available
        if (enrichmentService.searchContacts) {
          const searchCriteria = {
            domain,
            limit: limit || 25,
            offset: offset || 0,
            ...filters
          };

          const searchResult = await enrichmentService.searchContacts(searchCriteria);

          if (searchResult.success) {
            return NextResponse.json({
              success: true,
              data: {
                contacts: searchResult.data || [],
                total: searchResult.total || 0
              }
            });
          }
        }

        // Fallback to existing method
        const contacts = await enrichmentService.findContacts(domain, filters);

        return NextResponse.json({
          success: true,
          data: { contacts, total: contacts.length }
        });
      }

      case 'enrich_lead': {
        const { leadId } = data;

        // Verify lead exists and belongs to user
        const lead = await db.agencyLead.findFirst({
          where: {
            id: leadId,
            userId: session.user.id
          }
        });

        if (!lead) {
          return NextResponse.json(
            { error: 'Lead not found' },
            { status: 404 }
          );
        }

        const enrichmentPromises = [];

        // Enrich company data if we have a domain
        if (lead.companyName) {
          // Try to extract domain from company name or use a mock domain
          const mockDomain = `${lead.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
          enrichmentPromises.push(
            enrichmentService.enrichCompany(mockDomain).catch(() => null)
          );
        }

        // Enrich contact data if we have an email
        if (lead.contactEmail) {
          enrichmentPromises.push(
            enrichmentService.enrichContact(lead.contactEmail).catch(() => null)
          );
        }

        const [companyData, contactData] = await Promise.all(enrichmentPromises);

        // Update lead with enriched data
        const updateData: any = {};

        if (companyData) {
          updateData.description = companyData.description || lead.description;

          // Update estimated value based on company size
          if (companyData.employees && !lead.estimatedValue) {
            updateData.estimatedValue = calculateEstimatedValue(companyData.employees);
          }
        }

        if (contactData && contactData.jobTitle && !lead.title.includes(contactData.jobTitle)) {
          updateData.title = `${lead.companyName} - ${contactData.jobTitle}`;
        }

        // Only update if we have new data
        if (Object.keys(updateData).length > 0) {
          await db.agencyLead.update({
            where: { id: leadId },
            data: updateData
          });
        }

        return NextResponse.json({
          success: true,
          data: {
            company: companyData,
            contact: contactData,
            updated: Object.keys(updateData).length > 0
          }
        });
      }

      case 'search_companies': {
        const { filters, limit, offset } = data;

        if (!enrichmentService.searchCompanies) {
          return NextResponse.json(
            { error: 'Company search not available' },
            { status: 501 }
          );
        }

        const searchCriteria = {
          limit: limit || 25,
          offset: offset || 0,
          ...filters
        };

        const searchResult = await enrichmentService.searchCompanies(searchCriteria);

        return NextResponse.json({
          success: searchResult.success,
          data: {
            companies: searchResult.data || [],
            total: searchResult.total || 0
          },
          error: searchResult.error
        });
      }

      case 'verify_configuration': {
        if (!enrichmentService.verifyConfiguration) {
          return NextResponse.json(
            { error: 'Configuration verification not available' },
            { status: 501 }
          );
        }

        const isConfigured = await enrichmentService.verifyConfiguration();

        return NextResponse.json({
          success: true,
          data: {
            configured: isConfigured,
            providers: enrichmentService.getProviderStatus ?
              enrichmentService.getProviderStatus() :
              { apollo: false, zoominfo: false, mock: true }
          }
        });
      }

      case 'boolean_search': {
        const { query, limit, offset, includeCompanies, includeContacts } = data;

        if (!query || typeof query !== 'string') {
          return NextResponse.json(
            { error: 'Search query is required' },
            { status: 400 }
          );
        }

        // Validate query first
        if (enrichmentService.validateBooleanQuery) {
          const validation = enrichmentService.validateBooleanQuery(query);
          if (!validation.isValid) {
            return NextResponse.json({
              success: false,
              error: 'Invalid boolean search query',
              validation
            });
          }
        }

        // Perform boolean search
        if (enrichmentService.booleanSearchProspects) {
          const searchResult = await enrichmentService.booleanSearchProspects(query, {
            limit: limit || 25,
            offset: offset || 0,
            includeCompanies: includeCompanies !== false,
            includeContacts: includeContacts !== false
          });

          return NextResponse.json({
            success: searchResult.success,
            data: searchResult.data,
            error: searchResult.error
          });
        }

        return NextResponse.json(
          { error: 'Boolean search not available' },
          { status: 501 }
        );
      }

      case 'validate_boolean_query': {
        const { query } = data;

        if (!query || typeof query !== 'string') {
          return NextResponse.json(
            { error: 'Search query is required' },
            { status: 400 }
          );
        }

        if (!enrichmentService.validateBooleanQuery) {
          return NextResponse.json(
            { error: 'Query validation not available' },
            { status: 501 }
          );
        }

        const validation = enrichmentService.validateBooleanQuery(query);

        return NextResponse.json({
          success: true,
          data: validation
        });
      }

      case 'get_intent_profile': {
        const { domain } = data;

        if (!domain) {
          return NextResponse.json(
            { error: 'Domain is required' },
            { status: 400 }
          );
        }

        if (!enrichmentService.getIntentProfile) {
          return NextResponse.json(
            { error: 'Intent data not available' },
            { status: 501 }
          );
        }

        const intentProfile = await enrichmentService.getIntentProfile(domain);

        return NextResponse.json({
          success: !!intentProfile,
          data: intentProfile,
          error: !intentProfile ? 'No intent data found for this domain' : undefined
        });
      }

      case 'find_warm_prospects': {
        const { filters } = data;

        if (!enrichmentService.findWarmProspects) {
          return NextResponse.json(
            { error: 'Warm prospect identification not available' },
            { status: 501 }
          );
        }

        const warmProspects = await enrichmentService.findWarmProspects(filters || {});

        return NextResponse.json({
          success: true,
          data: {
            prospects: warmProspects,
            total: warmProspects.length
          }
        });
      }

      case 'get_warm_alerts': {
        const { filters } = data;

        if (!enrichmentService.getWarmProspectAlerts) {
          return NextResponse.json(
            { error: 'Warm prospect alerts not available' },
            { status: 501 }
          );
        }

        const alerts = await enrichmentService.getWarmProspectAlerts(filters || {});

        return NextResponse.json({
          success: true,
          data: {
            alerts,
            total: alerts.length
          }
        });
      }

      case 'analyze_company_intent': {
        const { domain, context } = data;

        if (!domain) {
          return NextResponse.json(
            { error: 'Domain is required' },
            { status: 400 }
          );
        }

        if (!enrichmentService.analyzeCompanyIntent) {
          return NextResponse.json(
            { error: 'Intent analysis not available' },
            { status: 501 }
          );
        }

        const analysis = await enrichmentService.analyzeCompanyIntent(domain, context || {});

        return NextResponse.json({
          success: true,
          data: analysis
        });
      }

      case 'enrich_with_intent': {
        const { domain } = data;

        if (!domain) {
          return NextResponse.json(
            { error: 'Domain is required' },
            { status: 400 }
          );
        }

        if (!enrichmentService.enrichWithIntent) {
          return NextResponse.json(
            { error: 'Enhanced enrichment not available' },
            { status: 501 }
          );
        }

        const result = await enrichmentService.enrichWithIntent(domain);

        return NextResponse.json({
          success: result.enrichment.success,
          data: result,
          error: result.enrichment.error
        });
      }

      case 'bulk_enrich': {
        const { leadIds } = data;

        if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
          return NextResponse.json(
            { error: 'Lead IDs array is required' },
            { status: 400 }
          );
        }

        // Verify all leads belong to user
        const leads = await db.agencyLead.findMany({
          where: {
            id: { in: leadIds },
            userId: session.user.id
          }
        });

        if (leads.length !== leadIds.length) {
          return NextResponse.json(
            { error: 'Some leads not found or not accessible' },
            { status: 404 }
          );
        }

        const results = [];

        // Process leads in batches to avoid overwhelming the API
        const batchSize = 5;
        for (let i = 0; i < leads.length; i += batchSize) {
          const batch = leads.slice(i, i + batchSize);

          const batchPromises = batch.map(async (lead) => {
            try {
              const enrichmentPromises = [];

              if (lead.companyName) {
                const mockDomain = `${lead.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
                enrichmentPromises.push(
                  enrichmentService.enrichCompany(mockDomain).catch(() => null)
                );
              }

              if (lead.contactEmail) {
                enrichmentPromises.push(
                  enrichmentService.enrichContact(lead.contactEmail).catch(() => null)
                );
              }

              const [companyData, contactData] = await Promise.all(enrichmentPromises);

              return {
                leadId: lead.id,
                success: true,
                company: companyData,
                contact: contactData
              };
            } catch (error) {
              return {
                leadId: lead.id,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
              };
            }
          });

          const batchResults = await Promise.all(batchPromises);
          results.push(...batchResults);

          // Add delay between batches to respect rate limits
          if (i + batchSize < leads.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        return NextResponse.json({
          success: true,
          data: {
            results,
            processed: results.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length
          }
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Enrichment error:', error);
    return NextResponse.json(
      { error: 'Failed to process enrichment request' },
      { status: 500 }
    );
  }
}

// Helper function to calculate estimated value based on company size
function calculateEstimatedValue(employees: number): number {
  if (employees <= 10) return 15000;
  if (employees <= 50) return 35000;
  if (employees <= 200) return 75000;
  if (employees <= 500) return 150000;
  if (employees <= 1000) return 250000;
  return 500000;
}