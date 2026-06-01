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
  Copy, 
  Trash2, 
  Send,
  Eye,
  Edit
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OutreachTemplate {
  id: string;
  name: string;
  type: string;
  timesSent: number;
  responsesReceived: number;
  responseRate: number;
}

interface OutreachTemplateActionsProps {
  template: OutreachTemplate;
  userId: string;
}

export default function OutreachTemplateActions({
  template,
  userId,
}: OutreachTemplateActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDuplicate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/outreach/templates/${template.id}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate template');
      }

      const newTemplate = await response.json();
      toast.success('Template duplicated successfully');
      router.push(`/outreach/templates/${newTemplate.id}/edit`);
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast.error('Failed to duplicate template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/outreach/templates/${template.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      toast.success('Template deleted successfully');
      router.refresh();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleUseTemplate = () => {
    // Navigate to compose new outreach activity with this template
    router.push(`/outreach/new?templateId=${template.id}`);
  };

  return (
    <>
      <div className="flex gap-1">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleUseTemplate}
          className="text-xs"
        >
          <Send className="h-3 w-3 mr-1" />
          Use
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/outreach/templates/${template.id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/outreach/templates/${template.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Template
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDuplicate} disabled={isLoading}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-destructive"
              disabled={isLoading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{template.name}"? This action cannot be undone.
              {template.timesSent > 0 && (
                <div className="mt-2 p-2 bg-muted rounded">
                  <strong>Warning:</strong> This template has been used {template.timesSent} times 
                  with {template.responsesReceived} responses ({Math.round(template.responseRate)}% response rate).
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Deleting...' : 'Delete Template'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}