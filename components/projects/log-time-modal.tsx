'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Clock } from 'lucide-react';

interface LogTimeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  tasks?: Array<{ id: string; title: string }>;
}

interface TimeEntryFormData {
  hours: string;
  date: string;
  description: string;
  taskId: string;
  billable: boolean;
}

export function LogTimeModal({ open, onOpenChange, projectId, tasks = [] }: LogTimeModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TimeEntryFormData>({
    hours: '',
    date: new Date().toISOString().split('T')[0], // Today's date
    description: '',
    taskId: '',
    billable: true
  });

  const handleInputChange = (field: keyof TimeEntryFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.hours || parseFloat(formData.hours) <= 0) {
      toast({
        title: "Invalid hours",
        description: "Please enter a valid number of hours.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Missing description",
        description: "Please describe what you worked on.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/time-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hours: parseFloat(formData.hours),
          date: new Date(formData.date).toISOString(),
          description: formData.description.trim(),
          taskId: formData.taskId || null,
          billable: formData.billable
        })
      });

      if (!response.ok) {
        throw new Error('Failed to log time');
      }

      const timeEntry = await response.json();

      toast({
        title: "Time logged",
        description: `${formData.hours} hours logged for ${formData.date}`
      });

      onOpenChange(false);
      setFormData({
        hours: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        taskId: '',
        billable: true
      });

      router.refresh();
    } catch (error) {
      console.error('Error logging time:', error);
      toast({
        title: "Error",
        description: "Failed to log time. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Quick time buttons for common durations
  const quickTimes = [
    { label: '15 min', value: '0.25' },
    { label: '30 min', value: '0.5' },
    { label: '1 hour', value: '1' },
    { label: '2 hours', value: '2' },
    { label: '4 hours', value: '4' },
    { label: '8 hours', value: '8' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <DialogTitle>Log Time</DialogTitle>
          </div>
          <DialogDescription>
            Track time spent on this project.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="hours">Hours Worked *</Label>
              <div className="flex gap-2">
                <Input
                  id="hours"
                  type="number"
                  value={formData.hours}
                  onChange={(e) => handleInputChange('hours', e.target.value)}
                  placeholder="0.00"
                  step="0.25"
                  min="0"
                  max="24"
                  required
                  className="flex-1"
                />
              </div>
              <div className="flex gap-2 mt-2">
                {quickTimes.map(({ label, value }) => (
                  <Button
                    key={value}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleInputChange('hours', value)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {tasks.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="task">Associated Task (Optional)</Label>
                <Select value={formData.taskId} onValueChange={(value) => handleInputChange('taskId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a task" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No specific task</SelectItem>
                    {tasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="What did you work on?"
                rows={3}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="billable"
                checked={formData.billable}
                onCheckedChange={(checked) => handleInputChange('billable', checked as boolean)}
              />
              <Label
                htmlFor="billable"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Billable time
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Log Time
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}