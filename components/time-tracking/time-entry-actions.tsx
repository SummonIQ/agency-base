'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Send,
  Check,
  Copy,
  Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TimeEntry {
  id: string;
  description: string;
  hours: number;
  status: string;
  billable: boolean;
  hourlyRate?: number;
  totalAmount?: number;
  date: Date;
  project: {
    name: string;
    client?: {
      name: string;
    };
  };
  task?: {
    name: string;
  };
}

interface TimeEntryActionsProps {
  entry: TimeEntry;
  userId: string;
}

export default function TimeEntryActions({
  entry,
  userId,
}: TimeEntryActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/time-tracking/${entry.id}/edit`);
  };

  const handleDuplicate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/time-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: `${entry.description} (Copy)`,
          hours: entry.hours,
          date: new Date().toISOString(),
          billable: entry.billable,
          hourlyRate: entry.hourlyRate,
          projectId: entry.project.id,
          taskId: entry.task?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate time entry');
      }

      toast.success('Time entry duplicated successfully');
      router.refresh();
    } catch (error) {
      console.error('Error duplicating time entry:', error);
      toast.error('Failed to duplicate time entry');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (entry.status !== 'DRAFT') return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/time-tracking/${entry.id}/submit`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to submit time entry');
      }

      toast.success('Time entry submitted for approval');
      router.refresh();
    } catch (error) {
      console.error('Error submitting time entry:', error);
      toast.error('Failed to submit time entry');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (entry.status !== 'SUBMITTED') return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/time-tracking/${entry.id}/approve`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to approve time entry');
      }

      toast.success('Time entry approved');
      router.refresh();
    } catch (error) {
      console.error('Error approving time entry:', error);
      toast.error('Failed to approve time entry');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/time-tracking/${entry.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete time entry');
      }

      toast.success('Time entry deleted successfully');
      router.refresh();
    } catch (error) {
      console.error('Error deleting time entry:', error);
      toast.error('Failed to delete time entry');
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const canEdit = entry.status === 'DRAFT';
  const canSubmit = entry.status === 'DRAFT';
  const canApprove = entry.status === 'SUBMITTED';
  const canDelete = entry.status === 'DRAFT';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEdit} disabled={!canEdit || isLoading}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate} disabled={isLoading}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </DropdownMenuItem>
          {canSubmit && (
            <DropdownMenuItem onClick={handleSubmit} disabled={isLoading}>
              <Send className="mr-2 h-4 w-4" />
              Submit for Approval
            </DropdownMenuItem>
          )}
          {canApprove && (
            <DropdownMenuItem onClick={handleApprove} disabled={isLoading}>
              <Check className="mr-2 h-4 w-4" />
              Approve
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-destructive"
            disabled={!canDelete || isLoading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Time Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this time entry? This action cannot be undone.
              <div className="mt-2 p-2 bg-muted rounded">
                <strong>{entry.description}</strong><br />
                {entry.hours} hours on {new Date(entry.date).toLocaleDateString()}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Deleting...' : 'Delete Time Entry'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}