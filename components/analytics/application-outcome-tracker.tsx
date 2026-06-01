"use client";

import { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Calendar, 
  UserCheck, 
  Mail,
  PhoneCall,
  DollarSign,
  AlertCircle,
  Clock,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ApplicationStatus } from '@prisma/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Application {
  id: string;
  status: ApplicationStatus;
  jobLead: {
    title: string;
    companyName?: string;
  };
  submittedAt?: Date;
  lastStatusChangeAt?: Date;
  responseReceivedAt?: Date;
  interviewCount: number;
}

interface ApplicationOutcomeTrackerProps {
  application: Application;
  onUpdate?: () => void;
}

const STATUS_CONFIG: Record<ApplicationStatus, {
  label: string;
  icon: React.ReactNode;
  color: string;
  next?: ApplicationStatus[];
}> = {
  PENDING: {
    label: 'Pending',
    icon: <Clock className="h-4 w-4" />,
    color: 'secondary',
    next: ['SUBMITTED', 'FAILED', 'WITHDRAWN'],
  },
  SUBMITTED: {
    label: 'Submitted',
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'default',
    next: ['UNDER_REVIEW', 'REJECTED', 'WITHDRAWN'],
  },
  FAILED: {
    label: 'Failed',
    icon: <XCircle className="h-4 w-4" />,
    color: 'destructive',
    next: [],
  },
  REJECTED: {
    label: 'Rejected',
    icon: <XCircle className="h-4 w-4" />,
    color: 'destructive',
    next: [],
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    icon: <Mail className="h-4 w-4" />,
    color: 'warning',
    next: ['INTERVIEW_REQUESTED', 'REJECTED', 'NOT_SELECTED', 'WITHDRAWN'],
  },
  INTERVIEW_REQUESTED: {
    label: 'Interview Requested',
    icon: <PhoneCall className="h-4 w-4" />,
    color: 'warning',
    next: ['INTERVIEW_SCHEDULED', 'REJECTED', 'WITHDRAWN'],
  },
  INTERVIEW_SCHEDULED: {
    label: 'Interview Scheduled',
    icon: <Calendar className="h-4 w-4" />,
    color: 'warning',
    next: ['INTERVIEW_COMPLETED', 'REJECTED', 'WITHDRAWN'],
  },
  INTERVIEW_COMPLETED: {
    label: 'Interview Completed',
    icon: <UserCheck className="h-4 w-4" />,
    color: 'success',
    next: ['INTERVIEW_SCHEDULED', 'OFFER_RECEIVED', 'REJECTED', 'NOT_SELECTED', 'WITHDRAWN'],
  },
  OFFER_RECEIVED: {
    label: 'Offer Received',
    icon: <DollarSign className="h-4 w-4" />,
    color: 'success',
    next: ['OFFER_ACCEPTED', 'OFFER_REJECTED'],
  },
  OFFER_ACCEPTED: {
    label: 'Offer Accepted',
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'success',
    next: [],
  },
  OFFER_REJECTED: {
    label: 'Offer Rejected',
    icon: <XCircle className="h-4 w-4" />,
    color: 'secondary',
    next: [],
  },
  WITHDRAWN: {
    label: 'Withdrawn',
    icon: <AlertCircle className="h-4 w-4" />,
    color: 'secondary',
    next: [],
  },
  NOT_SELECTED: {
    label: 'Not Selected',
    icon: <XCircle className="h-4 w-4" />,
    color: 'destructive',
    next: [],
  },
};

export function ApplicationOutcomeTracker({ application, onUpdate }: ApplicationOutcomeTrackerProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | ''>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const currentConfig = STATUS_CONFIG[application.status];
  const availableStatuses = currentConfig.next || [];

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/applications/${application.id}/outcome`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: selectedStatus,
          notes,
          eventType: 'status_change',
        }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      toast({
        title: 'Status Updated',
        description: `Application status changed to ${STATUS_CONFIG[selectedStatus].label}`,
      });

      setIsOpen(false);
      setSelectedStatus('');
      setNotes('');
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update application status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const daysSinceSubmission = application.submittedAt
    ? Math.floor((Date.now() - new Date(application.submittedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{application.jobLead.title}</CardTitle>
            <CardDescription>{application.jobLead.companyName}</CardDescription>
          </div>
          <Badge variant={currentConfig.color as any}>
            <span className="flex items-center gap-1">
              {currentConfig.icon}
              {currentConfig.label}
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timeline Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Days Since Applied</p>
            <p className="font-medium">{daysSinceSubmission} days</p>
          </div>
          {application.responseReceivedAt && (
            <div>
              <p className="text-muted-foreground">Response Received</p>
              <p className="font-medium">
                {new Date(application.responseReceivedAt).toLocaleDateString()}
              </p>
            </div>
          )}
          {application.interviewCount > 0 && (
            <div>
              <p className="text-muted-foreground">Interviews</p>
              <p className="font-medium">{application.interviewCount}</p>
            </div>
          )}
        </div>

        {/* Update Status Button */}
        {availableStatuses.length > 0 && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                Update Status
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Application Status</DialogTitle>
                <DialogDescription>
                  Track the progress of your application to {application.jobLead.companyName}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="status">New Status</Label>
                  <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as ApplicationStatus)}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          <span className="flex items-center gap-2">
                            {STATUS_CONFIG[status].icon}
                            {STATUS_CONFIG[status].label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any relevant details about this status change..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleStatusUpdate} 
                  disabled={!selectedStatus || loading}
                >
                  {loading ? 'Updating...' : 'Update Status'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}