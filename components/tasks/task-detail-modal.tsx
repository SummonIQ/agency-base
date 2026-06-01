'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Save,
  Calendar,
  Clock,
  Target,
  AlertCircle,
  CheckCircle2,
  Edit3,
  X
} from 'lucide-react';

interface TaskDetailModalProps {
  task: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated: (task: any) => void;
}

export function TaskDetailModal({ task, open, onOpenChange, onTaskUpdated }: TaskDetailModalProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    category: task.category,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    estimatedHours: task.estimatedHours?.toString() || '',
    actualHours: task.actualHours?.toString() || '0',
    progressPercentage: task.progressPercentage || 0,
    tags: task.tags.join(', '),
    notes: task.notes || ''
  });

  const categories = [
    'Sales',
    'Marketing',
    'Development',
    'Operations',
    'Business Development',
    'Lead Generation',
    'Customer Success',
    'Finance',
    'HR',
    'Other'
  ];

  const statusColors: Record<string, string> = {
    TODO: 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200',
    IN_PROGRESS: 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200',
    BLOCKED: 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-200',
    COMPLETED: 'bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-200',
    CANCELLED: 'bg-orange-100 dark:bg-orange-950/50 text-orange-800 dark:text-orange-200'
  };

  const priorityColors: Record<string, string> = {
    LOW: 'text-gray-600 dark:text-gray-400',
    MEDIUM: 'text-yellow-600 dark:text-yellow-400',
    HIGH: 'text-orange-600 dark:text-orange-400',
    URGENT: 'text-red-600 dark:text-red-400'
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          category: formData.category,
          priority: formData.priority,
          status: formData.status,
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
          estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
          actualHours: formData.actualHours ? parseFloat(formData.actualHours) : 0,
          progressPercentage: formData.progressPercentage,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
          notes: formData.notes.trim() || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();

      toast({
        title: 'Task updated',
        description: 'Changes have been saved'
      });

      onTaskUpdated(updatedTask);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilDue = () => {
    if (!task.dueDate) return null;
    const due = new Date(task.dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{isEditing ? 'Edit Task' : 'Task Details'}</DialogTitle>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            {isEditing ? (
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            ) : (
              <p className="text-lg font-medium">{task.title}</p>
            )}
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Status</Label>
              {isEditing ? (
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="BLOCKED">Blocked</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={statusColors[task.status]} variant="secondary">
                  {task.status.replace('_', ' ')}
                </Badge>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Priority</Label>
              {isEditing ? (
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <span className={`font-medium ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            {isEditing ? (
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {task.description || 'No description provided'}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="grid gap-2">
            <Label>Category</Label>
            {isEditing ? (
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p>{task.category}</p>
            )}
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              {isEditing ? (
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}
                  </span>
                  {daysUntilDue !== null && (
                    <span className={`text-sm ${daysUntilDue < 0 ? 'text-red-600' : daysUntilDue <= 3 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                      ({daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} days left`})
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              {isEditing ? (
                <Input
                  id="estimatedHours"
                  type="number"
                  value={formData.estimatedHours}
                  onChange={(e) => handleInputChange('estimatedHours', e.target.value)}
                  step="0.5"
                  min="0"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{task.estimatedHours || 0}h estimated</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="grid gap-2">
            <Label>Progress</Label>
            {isEditing ? (
              <div className="space-y-2">
                <Slider
                  value={[formData.progressPercentage]}
                  onValueChange={([value]) => handleInputChange('progressPercentage', value)}
                  max={100}
                  step={5}
                />
                <div className="text-right text-sm text-muted-foreground">
                  {formData.progressPercentage}%
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Progress value={task.progressPercentage} />
                <div className="text-sm text-muted-foreground">
                  {task.progressPercentage}% complete
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="grid gap-2">
            <Label htmlFor="tags">Tags</Label>
            {isEditing ? (
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="comma-separated tags"
              />
            ) : (
              <div className="flex gap-2 flex-wrap">
                {task.tags.length > 0 ? (
                  task.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No tags</span>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            {isEditing ? (
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {task.notes || 'No notes added'}
              </p>
            )}
          </div>

          {/* Metadata */}
          {!isEditing && (
            <div className="border-t pt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Created</span>
                <span>{new Date(task.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated</span>
                <span>{new Date(task.updatedAt).toLocaleString()}</span>
              </div>
              {task.completedAt && (
                <div className="flex justify-between">
                  <span>Completed</span>
                  <span>{new Date(task.completedAt).toLocaleString()}</span>
                </div>
              )}
              {task.source && (
                <div className="flex justify-between">
                  <span>Source</span>
                  <span>{task.source}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}