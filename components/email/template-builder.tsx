'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Eye, 
  Save, 
  Code, 
  Type, 
  User, 
  Building, 
  Briefcase, 
  Settings,
  CheckCircle,
  AlertCircle,
  Plus,
  X
} from 'lucide-react';
import { EmailTemplateType } from '@prisma/client';

interface TemplateVariable {
  key: string;
  label: string;
  description: string;
  category: 'personal' | 'company' | 'job' | 'custom';
  required?: boolean;
  defaultValue?: string;
}

interface TemplateBuilderProps {
  templateId?: string;
  initialData?: {
    name: string;
    subject: string;
    content: string;
    textContent?: string;
    type: EmailTemplateType;
  };
  onSave?: (templateData: any) => void;
  onCancel?: () => void;
}

const TEMPLATE_TYPES: { value: EmailTemplateType; label: string; description: string }[] = [
  { value: 'RECRUITING', label: 'Recruiting', description: 'Candidate outreach and recruitment' },
  { value: 'LEAD_GEN', label: 'Lead Generation', description: 'Prospect outreach and lead generation' },
  { value: 'FOLLOW_UP', label: 'Follow Up', description: 'Follow-up and nurturing sequences' },
  { value: 'CLIENT', label: 'Client', description: 'Client communication and updates' },
  { value: 'NURTURING', label: 'Nurturing', description: 'Long-term relationship building' },
  { value: 'NOTIFICATION', label: 'Notification', description: 'System and transactional emails' },
];

const CATEGORY_ICONS = {
  personal: User,
  company: Building,
  job: Briefcase,
  custom: Settings,
};

export function TemplateBuilder({ 
  templateId, 
  initialData, 
  onSave, 
  onCancel 
}: TemplateBuilderProps) {
  const [templateData, setTemplateData] = useState({
    name: initialData?.name || '',
    subject: initialData?.subject || '',
    content: initialData?.content || '',
    textContent: initialData?.textContent || '',
    type: initialData?.type || 'LEAD_GEN' as EmailTemplateType,
  });

  const [variables, setVariables] = useState<Record<string, TemplateVariable[]>>({});
  const [preview, setPreview] = useState<any>(null);
  const [validation, setValidation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');

  // Load available variables
  useEffect(() => {
    fetchVariables();
  }, []);

  // Auto-validate when content changes
  useEffect(() => {
    if (templateData.subject || templateData.content) {
      validateTemplate();
    }
  }, [templateData.subject, templateData.content, templateData.textContent]);

  const fetchVariables = async () => {
    try {
      const response = await fetch('/api/email/template-variables');
      const data = await response.json();
      
      if (data.success) {
        setVariables(data.groupedVariables);
      }
    } catch (error) {
      console.error('Failed to fetch variables:', error);
    }
  };

  const validateTemplate = async () => {
    try {
      const response = await fetch('/api/email/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'validate_template',
          data: {
            subject: templateData.subject,
            content: templateData.content,
            textContent: templateData.textContent,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setValidation(data.validation);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const generatePreview = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/email/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'preview_template',
          data: {
            subject: templateData.subject,
            content: templateData.content,
            textContent: templateData.textContent,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPreview(data.preview);
        setActiveTab('preview');
      }
    } catch (error) {
      console.error('Preview generation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const insertVariable = (variableKey: string) => {
    const variable = `{{${variableKey}}}`;
    
    // Insert into content at cursor position (simplified)
    setTemplateData(prev => ({
      ...prev,
      content: prev.content + variable
    }));
  };

  const insertConditional = (variableKey: string) => {
    const conditional = `{{#if ${variableKey}}}Content when ${variableKey} exists{{/if}}`;
    
    setTemplateData(prev => ({
      ...prev,
      content: prev.content + conditional
    }));
  };

  const handleSave = async () => {
    if (!validation?.isValid) {
      alert('Please fix validation errors before saving');
      return;
    }

    setIsLoading(true);
    try {
      const action = templateId ? 'update_template' : 'create_template';
      const requestData = templateId 
        ? { templateId, ...templateData }
        : templateData;

      const response = await fetch('/api/email/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          data: requestData,
        }),
      });

      const data = await response.json();
      if (data.success) {
        onSave?.(data.template);
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {templateId ? 'Edit Template' : 'Create Email Template'}
          </h1>
          <p className="text-muted-foreground">
            Build dynamic email templates with variable substitution and conditional logic
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={generatePreview} disabled={isLoading}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !validation?.isValid}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Template'}
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Variables Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Template Variables</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(variables).map(([category, categoryVariables]) => {
                const Icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Icon className="h-4 w-4" />
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </div>
                    <div className="space-y-1">
                      {categoryVariables.map((variable) => (
                        <div key={variable.key} className="group">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-xs h-8 px-2"
                            onClick={() => insertVariable(variable.key)}
                          >
                            <Code className="h-3 w-3 mr-2" />
                            {variable.label}
                            {variable.required && (
                              <Badge variant="secondary" className="ml-auto text-xs">
                                Required
                              </Badge>
                            )}
                          </Button>
                          <p className="text-xs text-muted-foreground px-2 mb-1">
                            {variable.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">Quick Actions</p>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-8"
                    onClick={() => insertConditional('firstName')}
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Add Conditional
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Editor */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="editor">
                <Type className="h-4 w-4 mr-2" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-4">
              {/* Validation Status */}
              {validation && (
                <Alert variant={validation.isValid ? "default" : "destructive"}>
                  {validation.isValid ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {validation.isValid 
                      ? 'Template syntax is valid'
                      : `Validation errors: ${validation.errors.join(', ')}`
                    }
                  </AlertDescription>
                </Alert>
              )}

              {/* Template Form */}
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Template Name</Label>
                      <Input
                        id="name"
                        value={templateData.name}
                        onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter template name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Template Type</Label>
                      <Select
                        value={templateData.type}
                        onValueChange={(value: EmailTemplateType) => 
                          setTemplateData(prev => ({ ...prev, type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TEMPLATE_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-xs text-muted-foreground">{type.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject Line</Label>
                    <Input
                      id="subject"
                      value={templateData.subject}
                      onChange={(e) => setTemplateData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Enter email subject with {{variables}}"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Email Content (HTML)</Label>
                    <Textarea
                      id="content"
                      value={templateData.content}
                      onChange={(e) => setTemplateData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Enter email content with {{variables}} and {{#if variable}}conditional content{{/if}}"
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="textContent">Plain Text Version (Optional)</Label>
                    <Textarea
                      id="textContent"
                      value={templateData.textContent}
                      onChange={(e) => setTemplateData(prev => ({ ...prev, textContent: e.target.value }))}
                      placeholder="Plain text version (auto-generated if empty)"
                      rows={6}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              {preview ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Email Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Subject</Label>
                        <p className="font-medium">{preview.subject}</p>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-muted-foreground">HTML Content</Label>
                        <div 
                          className="border rounded-md p-4 bg-background"
                          dangerouslySetInnerHTML={{ __html: preview.htmlContent }}
                        />
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Plain Text</Label>
                        <pre className="text-sm bg-muted p-4 rounded-md whitespace-pre-wrap">
                          {preview.textContent}
                        </pre>
                      </div>

                      {preview.missingVariables.length > 0 && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Missing variables: {preview.missingVariables.join(', ')}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Click "Preview" to see your template with sample data</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Template Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Additional template configuration options will be available here.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
