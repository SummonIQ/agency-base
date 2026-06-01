'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Mail, 
  Send, 
  AlertCircle, 
  CheckCircle, 
  User, 
  Building,
  Eye,
  Loader2
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'recruiting' | 'lead_gen' | 'follow_up' | 'client';
  variables: string[];
}

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: EmailTemplate;
  onEmailSent?: (result: any) => void;
}

export function SendEmailModal({ isOpen, onClose, template, onEmailSent }: SendEmailModalProps) {
  const [formData, setFormData] = useState({
    to: '',
    subject: template?.subject || '',
    content: template?.content || '',
    variables: {} as Record<string, string>,
    trackingEnabled: true,
    scheduleFor: '',
  });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; messageId?: string } | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Extract variables from template content
  const templateVariables = template?.variables || [];
  const contentVariables = (template?.content || formData.content).match(/\{\{(\w+)\}\}/g)?.map(v => v.replace(/[{}]/g, '')) || [];
  const allVariables = [...new Set([...templateVariables, ...contentVariables])];

  const handleVariableChange = (variable: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      variables: {
        ...prev.variables,
        [variable]: value
      }
    }));
  };

  const renderPreview = () => {
    let previewSubject = formData.subject;
    let previewContent = formData.content;

    // Replace variables with actual values
    Object.entries(formData.variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      previewSubject = previewSubject.replace(regex, value);
      previewContent = previewContent.replace(regex, value);
    });

    return { subject: previewSubject, content: previewContent };
  };

  const handleSendEmail = async () => {
    setSending(true);
    setResult(null);

    try {
      // Validate required fields
      if (!formData.to || !formData.subject || !formData.content) {
        throw new Error('Please fill in all required fields');
      }

      // Check for missing variables
      const missingVariables = allVariables.filter(variable => !formData.variables[variable]);
      if (missingVariables.length > 0) {
        throw new Error(`Please provide values for: ${missingVariables.join(', ')}`);
      }

      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_email',
          data: {
            to: formData.to.split(',').map(email => email.trim()),
            templateId: template?.id,
            subject: formData.subject,
            content: formData.content,
            variables: formData.variables,
            tracking: {
              enabled: formData.trackingEnabled,
              template_type: template?.type,
            },
            scheduledFor: formData.scheduleFor || undefined,
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: 'Email sent successfully!',
          messageId: data.messageId
        });
        onEmailSent?.(data);
        
        // Reset form after successful send
        setTimeout(() => {
          onClose();
          setResult(null);
          setFormData({
            to: '',
            subject: template?.subject || '',
            content: template?.content || '',
            variables: {},
            trackingEnabled: true,
            scheduleFor: '',
          });
        }, 2000);
      } else {
        throw new Error(data.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Send email error:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send email'
      });
    } finally {
      setSending(false);
    }
  };

  const preview = renderPreview();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Email
            {template && (
              <Badge variant="secondary">{template.name}</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Send a personalized email using {template ? 'this template' : 'custom content'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Toggle between compose and preview */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                checked={previewMode}
                onCheckedChange={setPreviewMode}
              />
              <Label>Preview Mode</Label>
            </div>
            {template && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Building className="h-3 w-3" />
                {template.type.replace('_', ' ').toUpperCase()}
              </Badge>
            )}
          </div>

          {!previewMode ? (
            <div className="grid gap-4">
              {/* Recipient */}
              <div className="space-y-2">
                <Label htmlFor="to">
                  To <span className="text-red-500 dark:text-red-400">*</span>
                </Label>
                <Input
                  id="to"
                  placeholder="recipient@example.com (separate multiple emails with commas)"
                  value={formData.to}
                  onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
                />
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">
                  Subject <span className="text-red-500 dark:text-red-400">*</span>
                </Label>
                <Input
                  id="subject"
                  placeholder="Email subject line"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>

              {/* Variables */}
              {allVariables.length > 0 && (
                <div className="space-y-3">
                  <Label>Template Variables</Label>
                  <div className="grid gap-3 md:grid-cols-2">
                    {allVariables.map((variable) => (
                      <div key={variable} className="space-y-1">
                        <Label htmlFor={`var-${variable}`} className="text-sm">
                          {variable}
                        </Label>
                        <Input
                          id={`var-${variable}`}
                          placeholder={`Enter ${variable}`}
                          value={formData.variables[variable] || ''}
                          onChange={(e) => handleVariableChange(variable, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">
                  Email Content <span className="text-red-500 dark:text-red-400">*</span>
                </Label>
                <Textarea
                  id="content"
                  placeholder="Email content..."
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={12}
                />
              </div>

              {/* Options */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Tracking</Label>
                    <p className="text-sm text-muted-foreground">Track opens and clicks</p>
                  </div>
                  <Switch
                    checked={formData.trackingEnabled}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, trackingEnabled: checked }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule For (Optional)</Label>
                  <Input
                    id="schedule"
                    type="datetime-local"
                    value={formData.scheduleFor}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduleFor: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">To:</Label>
                    <p className="text-sm">{formData.to || 'recipient@example.com'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Subject:</Label>
                    <p className="text-sm font-semibold">{preview.subject || 'No subject'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Content:</Label>
                    <div className="text-sm whitespace-pre-wrap bg-background p-3 rounded border">
                      {preview.content || 'No content'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Missing variables warning */}
              {allVariables.some(v => !formData.variables[v]) && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Missing variables: {allVariables.filter(v => !formData.variables[v]).join(', ')}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Result */}
          {result && (
            <Alert className={result.success ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : 'border-red-200 bg-red-50 dark:bg-red-950/20'}>
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
                {result.message}
                {result.messageId && (
                  <div className="text-xs mt-1 opacity-75 text-muted-foreground">
                    Message ID: {result.messageId}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendEmail} 
            disabled={sending || !formData.to || !formData.subject || !formData.content}
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {formData.scheduleFor ? 'Schedule Email' : 'Send Email'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
