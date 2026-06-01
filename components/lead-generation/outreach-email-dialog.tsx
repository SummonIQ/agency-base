'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2 } from 'lucide-react';

interface OutreachEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: {
    id: string;
    companyName: string;
    contactName?: string;
    contactEmail?: string;
  };
  onEmailSent?: () => void;
}

export function OutreachEmailDialog({
  open,
  onOpenChange,
  lead,
  onEmailSent
}: OutreachEmailDialogProps) {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [useTemplate, setUseTemplate] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState('tech-startup-intro');

  const [emailForm, setEmailForm] = useState({
    subject: '',
    content: ''
  });

  const templates = [
    { id: 'tech-startup-intro', name: 'Tech Startup Introduction' },
    { id: 'follow-up-no-response', name: 'Follow-up (No Response)' },
    { id: 'value-first-approach', name: 'Value-First Approach' }
  ];

  const handleSendEmail = async () => {
    if (!lead.contactEmail) {
      toast({
        title: 'No email address',
        description: 'This lead does not have an email address',
        variant: 'destructive'
      });
      return;
    }

    if (!useTemplate && (!emailForm.subject.trim() || !emailForm.content.trim())) {
      toast({
        title: 'Email content required',
        description: 'Please provide both subject and content for your email',
        variant: 'destructive'
      });
      return;
    }

    setSending(true);

    try {
      const response = await fetch('/api/lead-generation/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_email',
          data: {
            leadId: lead.id,
            ...(useTemplate ? {
              templateId: selectedTemplate
            } : {
              customSubject: emailForm.subject,
              customContent: emailForm.content
            })
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send email');
      }

      const result = await response.json();

      toast({
        title: 'Email sent successfully',
        description: `Outreach email sent to ${lead.contactEmail}`,
        variant: 'default'
      });

      onOpenChange(false);
      onEmailSent?.();

      // Reset form
      setEmailForm({ subject: '', content: '' });
      setUseTemplate(true);
      setSelectedTemplate('tech-startup-intro');

    } catch (error) {
      console.error('Failed to send email:', error);
      toast({
        title: 'Failed to send email',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Outreach Email
          </DialogTitle>
          <DialogDescription>
            Send a personalized email to {lead.contactName || 'the contact'} at {lead.companyName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Email recipient */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium">To:</div>
            <div className="text-sm text-muted-foreground">
              {lead.contactEmail} ({lead.contactName} at {lead.companyName})
            </div>
          </div>

          {/* Template or Custom toggle */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={useTemplate}
                onChange={() => setUseTemplate(true)}
                className="w-4 h-4"
              />
              <span className="text-sm">Use template</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={!useTemplate}
                onChange={() => setUseTemplate(false)}
                className="w-4 h-4"
              />
              <span className="text-sm">Write custom email</span>
            </label>
          </div>

          {useTemplate ? (
            <div className="space-y-2">
              <Label htmlFor="template">Email Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Templates are automatically personalized with the lead's information
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm(prev => ({...prev, subject: e.target.value}))}
                  placeholder="Enter email subject"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Email Content</Label>
                <Textarea
                  id="content"
                  value={emailForm.content}
                  onChange={(e) => setEmailForm(prev => ({...prev, content: e.target.value}))}
                  placeholder="Write your email content..."
                  rows={10}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSendEmail} disabled={sending}>
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}