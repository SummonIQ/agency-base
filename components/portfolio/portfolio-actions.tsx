'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Eye,
  EyeOff,
  Star,
  StarOff,
  Trash2,
  Copy
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PortfolioActionsProps {
  project: any;
  userId: string;
}

export default function PortfolioActions({ project, userId }: PortfolioActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleTogglePublished = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/portfolio/${project.id}/publish`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle publish status');
      }
      
      router.refresh();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('Failed to update publish status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFeatured = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/portfolio/${project.id}/feature`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle featured status');
      }
      
      router.refresh();
    } catch (error) {
      console.error('Error toggling featured status:', error);
      alert('Failed to update featured status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/portfolio/${project.id}/duplicate`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to duplicate project');
      }
      
      const newProject = await response.json();
      router.push(`/portfolio/${newProject.slug}/edit`);
    } catch (error) {
      console.error('Error duplicating project:', error);
      alert('Failed to duplicate project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/portfolio/${project.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
      
      router.refresh();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleTogglePublished}
        disabled={isLoading}
        title={project.isPublished ? 'Unpublish' : 'Publish'}
      >
        {project.isPublished ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleFeatured}
        disabled={isLoading}
        title={project.isFeatured ? 'Unfeature' : 'Feature'}
      >
        {project.isFeatured ? (
          <StarOff className="h-4 w-4" />
        ) : (
          <Star className="h-4 w-4" />
        )}
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDuplicate}
        disabled={isLoading}
        title="Duplicate"
      >
        <Copy className="h-4 w-4" />
      </Button>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={isLoading}
            title="Delete"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Portfolio Project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{project.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}