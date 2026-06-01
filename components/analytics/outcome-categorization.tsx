'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ApplicationStatus } from '@prisma/client';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar, 
  MessageSquare,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/css';

interface ApplicationOutcome {
  id: string;
  jobTitle: string;
  company: string;
  status: ApplicationStatus;
  submittedAt: string;
  lastStatusChangeAt?: string;
  responseReceivedAt?: string;
  daysSinceSubmission: number;
  daysToResponse?: number;
  interviewCount: number;
  notes?: string;
}

interface OutcomeCategorizationProps {
  applications?: ApplicationOutcome[];
  onStatusUpdate?: (applicationId: string, newStatus: ApplicationStatus, notes?: string) => void;
  className?: string;
}

const statusConfig = {
  [ApplicationStatus.PENDING]: {
    label: 'Pending',
    color: 'bg-gray-500',
    icon: Clock,
    description: 'Application submitted, awaiting response',
  },
  [ApplicationStatus.SUBMITTED]: {
    label: 'Submitted',
    color: 'bg-blue-500',
    icon: CheckCircle,
    description: 'Application successfully submitted',
  },
  [ApplicationStatus.UNDER_REVIEW]: {
    label: 'Under Review',
    color: 'bg-yellow-500',
    icon: Clock,
    description: 'Application is being reviewed',
  },
  [ApplicationStatus.INTERVIEW_REQUESTED]: {
    label: 'Interview Requested',
    color: 'bg-purple-500',
    icon: Calendar,
    description: 'Company has requested an interview',
  },
  [ApplicationStatus.INTERVIEW_SCHEDULED]: {
    label: 'Interview Scheduled',
    color: 'bg-indigo-500',
    icon: Calendar,
    description: 'Interview has been scheduled',
  },
  [ApplicationStatus.INTERVIEW_COMPLETED]: {
    label: 'Interview Completed',
    color: 'bg-blue-600',
    icon: CheckCircle,
    description: 'Interview has been completed',
  },
  [ApplicationStatus.OFFER_RECEIVED]: {
    label: 'Offer Received',
    color: 'bg-green-500',
    icon: TrendingUp,
    description: 'Job offer has been received',
  },
  [ApplicationStatus.OFFER_ACCEPTED]: {
    label: 'Offer Accepted',
    color: 'bg-green-600',
    icon: CheckCircle,
    description: 'Job offer has been accepted',
  },
  [ApplicationStatus.OFFER_REJECTED]: {
    label: 'Offer Rejected',
    color: 'bg-orange-500',
    icon: XCircle,
    description: 'Job offer has been rejected',
  },
  [ApplicationStatus.REJECTED]: {
    label: 'Rejected',
    color: 'bg-red-500',
    icon: XCircle,
    description: 'Application was rejected',
  },
  [ApplicationStatus.NOT_SELECTED]: {
    label: 'Not Selected',
    color: 'bg-red-400',
    icon: XCircle,
    description: 'Not selected for this position',
  },
  [ApplicationStatus.WITHDRAWN]: {
    label: 'Withdrawn',
    color: 'bg-gray-600',
    icon: XCircle,
    description: 'Application was withdrawn',
  },
  [ApplicationStatus.FAILED]: {
    label: 'Failed',
    color: 'bg-red-600',
    icon: AlertCircle,
    description: 'Application submission failed',
  },
};

export function OutcomeCategorization({ 
  applications = [], 
  onStatusUpdate,
  className 
}: OutcomeCategorizationProps) {
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | 'all'>('all');
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationOutcome | null>(null);
  const [newStatus, setNewStatus] = useState<ApplicationStatus | null>(null);
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredApplications = applications.filter(app => 
    selectedStatus === 'all' || app.status === selectedStatus
  );

  const handleStatusUpdate = async () => {
    if (!selectedApplication || !newStatus) return;

    setIsUpdating(true);
    try {
      await onStatusUpdate?.(selectedApplication.id, newStatus, notes);
      setIsUpdateDialogOpen(false);
      setSelectedApplication(null);
      setNewStatus(null);
      setNotes('');
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const openUpdateDialog = (application: ApplicationOutcome) => {
    setSelectedApplication(application);
    setNewStatus(application.status);
    setNotes('');
    setIsUpdateDialogOpen(true);
  };

  const getStatusStats = () => {
    const stats = Object.values(ApplicationStatus).map(status => ({
      status,
      count: applications.filter(app => app.status === status).length,
      config: statusConfig[status],
    })).filter(stat => stat.count > 0);

    return stats;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysColor = (days: number) => {
    if (days <= 7) return 'text-green-600';
    if (days <= 14) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Application Status Overview</CardTitle>
          <CardDescription>
            Current status of all your applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {getStatusStats().map(({ status, count, config }) => {
              const Icon = config.icon;
              return (
                <div
                  key={status}
                  className={cn(
                    "p-3 rounded-lg text-white cursor-pointer transition-all hover:scale-105",
                    config.color,
                    selectedStatus === status && "ring-2 ring-white ring-offset-2"
                  )}
                  onClick={() => setSelectedStatus(status)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{config.label}</span>
                  </div>
                  <div className="text-lg font-bold">{count}</div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4">
            <Button
              variant={selectedStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('all')}
            >
              Show All ({applications.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Applications 
            {selectedStatus !== 'all' && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({statusConfig[selectedStatus].label})
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Manage and update your application statuses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredApplications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No applications found for the selected status.
              </div>
            ) : (
              filteredApplications.map((application) => {
                const config = statusConfig[application.status];
                const Icon = config.icon;
                
                return (
                  <div
                    key={application.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{application.jobTitle}</h4>
                        <Badge variant="secondary">{application.company}</Badge>
                        <Badge 
                          variant="outline"
                          className={cn("text-white border-0", config.color)}
                        >
                          <Icon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Applied: {formatDate(application.submittedAt)}</span>
                        <span className={getDaysColor(application.daysSinceSubmission)}>
                          {application.daysSinceSubmission} days ago
                        </span>
                        {application.daysToResponse && (
                          <span>Response in {application.daysToResponse} days</span>
                        )}
                        {application.interviewCount > 0 && (
                          <span>{application.interviewCount} interview(s)</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Dialog 
                        open={isUpdateDialogOpen && selectedApplication?.id === application.id} 
                        onOpenChange={(open) => {
                          if (!open) {
                            setIsUpdateDialogOpen(false);
                            setSelectedApplication(null);
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openUpdateDialog(application)}
                          >
                            Update Status
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Application Status</DialogTitle>
                            <DialogDescription>
                              {application.jobTitle} at {application.company}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="status">New Status</Label>
                              <Select
                                value={newStatus || ''}
                                onValueChange={(value) => setNewStatus(value as ApplicationStatus)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select new status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(statusConfig).map(([status, config]) => (
                                    <SelectItem key={status} value={status}>
                                      <div className="flex items-center gap-2">
                                        <config.icon className="h-4 w-4" />
                                        {config.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label htmlFor="notes">Notes (optional)</Label>
                              <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any additional notes about this status change..."
                                rows={3}
                              />
                            </div>
                            
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setIsUpdateDialogOpen(false)}
                                disabled={isUpdating}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleStatusUpdate}
                                disabled={!newStatus || isUpdating}
                              >
                                {isUpdating ? 'Updating...' : 'Update Status'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}