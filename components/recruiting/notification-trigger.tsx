'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Mail, Send, Clock, Calendar, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface NotificationTriggerProps {
  requisitionId: string;
  requisitionTitle: string;
  candidateId?: string;
  candidateName?: string;
  candidateCount?: number;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function NotificationTrigger({
  requisitionId,
  requisitionTitle,
  candidateId,
  candidateName,
  candidateCount,
  variant = 'outline',
  size = 'sm',
}: NotificationTriggerProps) {
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const sendNotification = async (action: string) => {
    try {
      setSending(true);

      const response = await fetch(
        `/api/recruiting/requisitions/${requisitionId}/notify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action,
            candidateId,
            candidateCount,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      toast({
        title: 'Notification Sent',
        description: `Email notification sent successfully.`,
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to send notification. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={sending}>
          <Bell className="h-4 w-4 mr-2" />
          {sending ? 'Sending...' : 'Send Notification'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Client Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => sendNotification('portal_access')}>
          <Send className="h-4 w-4 mr-2" />
          Send Portal Access
        </DropdownMenuItem>

        {candidateId && candidateName && (
          <DropdownMenuItem onClick={() => sendNotification('new_candidate')}>
            <Mail className="h-4 w-4 mr-2" />
            New Candidate Alert
          </DropdownMenuItem>
        )}

        {candidateCount && candidateCount > 1 && (
          <DropdownMenuItem onClick={() => sendNotification('candidate_batch')}>
            <Mail className="h-4 w-4 mr-2" />
            Batch Candidate Alert ({candidateCount})
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={() => sendNotification('feedback_reminder')}>
          <Clock className="h-4 w-4 mr-2" />
          Feedback Reminder
        </DropdownMenuItem>

        {candidateId && candidateName && (
          <DropdownMenuItem onClick={() => sendNotification('interview_requested')}>
            <Calendar className="h-4 w-4 mr-2" />
            Interview Requested
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem disabled className="text-xs text-muted-foreground">
          <CheckCircle className="h-3 w-3 mr-2" />
          Emails sent to client contact
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
