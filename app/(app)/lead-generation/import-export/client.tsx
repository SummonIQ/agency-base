'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Upload,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Eye,
  ArrowRight,
  Database,
} from 'lucide-react';

interface ValidationResult {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  warnings: Array<{ row: number; warnings: string[] }>;
  errors: Array<{ row: number; errors: string[] }>;
  preview: Array<{
    row: number;
    original: Record<string, any>;
    mapped: Record<string, any>;
    valid: boolean;
    errors: string[];
    warnings: string[];
  }>;
  columnMapping: Record<string, string>;
}

interface ImportResult {
  total: number;
  imported: number;
  skipped: number;
  errors: Array<{ row: number; error: string }>;
  duplicates: number;
}

export default function ImportExportClient() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState<string>('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const [importSettings, setImportSettings] = useState({
    format: 'standard',
    allowDuplicates: false,
    updateExisting: false,
  });

  const [exportSettings, setExportSettings] = useState({
    format: 'csv',
    includeActivities: true,
    selectedLeadsOnly: false,
  });

  const formatOptions = [
    { value: 'standard', label: 'Standard Format' },
    { value: 'salesforce', label: 'Salesforce Export' },
    { value: 'hubspot', label: 'HubSpot Export' },
    { value: 'linkedin', label: 'LinkedIn Sales Navigator' },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a CSV file',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvData(content);
      setValidationResult(null);
      setImportResult(null);
    };
    reader.readAsText(file);
  };

  const validateImport = async () => {
    if (!csvData) {
      toast({
        title: 'No data to validate',
        description: 'Please upload a CSV file first',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/lead-generation/import-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'validate_import',
          data: {
            csvData,
            format: importSettings.format,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setValidationResult(result.data);
          toast({
            title: 'Validation completed',
            description: `${result.data.validRows} valid rows, ${result.data.invalidRows} invalid rows`,
          });
        } else {
          throw new Error(result.error || 'Validation failed');
        }
      } else {
        throw new Error('Validation request failed');
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: 'Validation failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const importLeads = async () => {
    if (!csvData || !validationResult) {
      toast({
        title: 'Cannot import',
        description: 'Please validate your data first',
        variant: 'destructive',
      });
      return;
    }

    if (validationResult.invalidRows > 0) {
      toast({
        title: 'Cannot import',
        description: 'Please fix validation errors before importing',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/lead-generation/import-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'import_leads',
          data: {
            csvData,
            format: importSettings.format,
            options: {
              allowDuplicates: importSettings.allowDuplicates,
              updateExisting: importSettings.updateExisting,
            },
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setImportResult(result.data);
          toast({
            title: 'Import completed',
            description: `${result.data.imported} leads imported successfully`,
          });
          // Clear data after successful import
          setCsvData('');
          setValidationResult(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } else {
          throw new Error(result.error || 'Import failed');
        }
      } else {
        throw new Error('Import request failed');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportLeads = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/lead-generation/import-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'export_leads',
          data: {
            format: exportSettings.format,
            includeActivities: exportSettings.includeActivities,
            // TODO: Add selected leads if selectedLeadsOnly is true
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Create and download the file
          const blob = new Blob([result.data.content], {
            type: result.data.contentType,
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = result.data.filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          toast({
            title: 'Export completed',
            description: `${result.data.total} leads exported successfully`,
          });
        } else {
          throw new Error(result.error || 'Export failed');
        }
      } else {
        throw new Error('Export request failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Import & Export
          </h1>
          <p className="text-muted-foreground">Import leads from CSV files or export your lead data</p>
        </div>
      </div>

      <Tabs defaultValue="import" className="space-y-4">
        <TabsList>
          <TabsTrigger value="import">Import Leads</TabsTrigger>
          <TabsTrigger value="export">Export Leads</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4">
          {/* Import Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import Settings
              </CardTitle>
              <CardDescription>
                Configure how your CSV data should be processed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="import-format">Data Format</Label>
                  <Select
                    value={importSettings.format}
                    onValueChange={(value) =>
                      setImportSettings(prev => ({ ...prev, format: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formatOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allow-duplicates"
                      checked={importSettings.allowDuplicates}
                      onCheckedChange={(checked) =>
                        setImportSettings(prev => ({ ...prev, allowDuplicates: !!checked }))
                      }
                    />
                    <Label htmlFor="allow-duplicates">Allow duplicate leads</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="update-existing"
                      checked={importSettings.updateExisting}
                      onCheckedChange={(checked) =>
                        setImportSettings(prev => ({ ...prev, updateExisting: !!checked }))
                      }
                    />
                    <Label htmlFor="update-existing">Update existing leads</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
              <CardDescription>
                Select a CSV file containing your lead data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="max-w-xs mx-auto"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Upload a CSV file with lead data
                </p>
              </div>

              {csvData && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    CSV file loaded successfully. Ready for validation.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={validateImport}
                  disabled={!csvData || loading}
                  variant="outline"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Validate Data
                    </>
                  )}
                </Button>

                <Button
                  onClick={importLeads}
                  disabled={!validationResult || validationResult.invalidRows > 0 || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Import Leads
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Validation Results */}
          {validationResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Validation Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{validationResult.totalRows}</div>
                    <div className="text-sm text-muted-foreground">Total Rows</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{validationResult.validRows}</div>
                    <div className="text-sm text-muted-foreground">Valid</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{validationResult.invalidRows}</div>
                    <div className="text-sm text-muted-foreground">Invalid</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{validationResult.warnings.length}</div>
                    <div className="text-sm text-muted-foreground">Warnings</div>
                  </div>
                </div>

                {validationResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-red-600">Errors:</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {validationResult.errors.slice(0, 10).map((error) => (
                        <div key={error.row} className="text-sm text-red-600">
                          Row {error.row}: {error.errors.join(', ')}
                        </div>
                      ))}
                      {validationResult.errors.length > 10 && (
                        <div className="text-sm text-muted-foreground">
                          ... and {validationResult.errors.length - 10} more errors
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {validationResult.warnings.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-yellow-600">Warnings:</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {validationResult.warnings.slice(0, 5).map((warning) => (
                        <div key={warning.row} className="text-sm text-yellow-600">
                          Row {warning.row}: {warning.warnings.join(', ')}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preview */}
                {validationResult.preview.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Preview (first 5 rows):</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse border border-gray-200">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-200 p-2 text-left">Row</th>
                            <th className="border border-gray-200 p-2 text-left">Company</th>
                            <th className="border border-gray-200 p-2 text-left">Contact</th>
                            <th className="border border-gray-200 p-2 text-left">Email</th>
                            <th className="border border-gray-200 p-2 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {validationResult.preview.slice(0, 5).map((row) => (
                            <tr key={row.row} className={row.valid ? '' : 'bg-red-50'}>
                              <td className="border border-gray-200 p-2">
                                {row.row}
                                {!row.valid && <XCircle className="inline ml-1 h-3 w-3 text-red-500" />}
                              </td>
                              <td className="border border-gray-200 p-2">{row.mapped.companyName || '-'}</td>
                              <td className="border border-gray-200 p-2">{row.mapped.contactName || '-'}</td>
                              <td className="border border-gray-200 p-2">{row.mapped.contactEmail || '-'}</td>
                              <td className="border border-gray-200 p-2">{row.mapped.status || 'NEW'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Import Results */}
          {importResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Import Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{importResult.total}</div>
                    <div className="text-sm text-muted-foreground">Total Rows</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{importResult.imported}</div>
                    <div className="text-sm text-muted-foreground">Imported</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{importResult.skipped}</div>
                    <div className="text-sm text-muted-foreground">Skipped</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{importResult.duplicates}</div>
                    <div className="text-sm text-muted-foreground">Duplicates</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          {/* Export Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Settings
              </CardTitle>
              <CardDescription>
                Configure your lead data export
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="export-format">Export Format</Label>
                  <Select
                    value={exportSettings.format}
                    onValueChange={(value) =>
                      setExportSettings(prev => ({ ...prev, format: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV File</SelectItem>
                      <SelectItem value="json">JSON File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-activities"
                      checked={exportSettings.includeActivities}
                      onCheckedChange={(checked) =>
                        setExportSettings(prev => ({ ...prev, includeActivities: !!checked }))
                      }
                    />
                    <Label htmlFor="include-activities">Include activity data</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="selected-only"
                      checked={exportSettings.selectedLeadsOnly}
                      onCheckedChange={(checked) =>
                        setExportSettings(prev => ({ ...prev, selectedLeadsOnly: !!checked }))
                      }
                    />
                    <Label htmlFor="selected-only">Selected leads only</Label>
                  </div>
                </div>
              </div>

              <Button onClick={exportLeads} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export Leads
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Export Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Import Templates</CardTitle>
              <CardDescription>
                Download CSV templates for different data sources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {formatOptions.map(format => (
                <div key={format.value} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div className="font-medium">{format.label}</div>
                    <div className="text-sm text-muted-foreground">
                      Template for importing from {format.label.toLowerCase()}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}