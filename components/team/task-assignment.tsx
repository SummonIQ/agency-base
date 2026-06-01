'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserPlus, User, Loader2 } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role?: string;
  skills: string[];
  image?: string;
  _count: {
    assignedTasks: number;
  };
}

interface Task {
  id: string;
  title: string;
  assignee?: {
    id: string;
    name: string;
    image?: string;
  };
}

interface TaskAssignmentProps {
  task: Task;
  onTaskUpdate?: (updatedTask: Task) => void;
}

export function TaskAssignment({ task, onTaskUpdate }: TaskAssignmentProps) {
  const [open, setOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');

  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/team-members');
      if (response.ok) {
        const members = await response.json();
        setTeamMembers(members);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchTeamMembers();
      setSelectedMemberId(task.assignee?.id || '');
    }
  }, [open, task.assignee?.id]);

  const handleAssign = async () => {
    if (!selectedMemberId) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamMemberId: selectedMemberId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        onTaskUpdate?.(result.task);
        setOpen(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to assign task');
      }
    } catch (error) {
      console.error('Error assigning task:', error);
      alert('Failed to assign task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassign = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}/assign`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        onTaskUpdate?.(result.task);
        setOpen(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to unassign task');
      }
    } catch (error) {
      console.error('Error unassigning task:', error);
      alert('Failed to unassign task');
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {task.assignee ? (
            <>
              <Avatar className="h-4 w-4 mr-2">
                <AvatarImage src={task.assignee.image || undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(task.assignee.name)}
                </AvatarFallback>
              </Avatar>
              {task.assignee.name}
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Assign
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Task</DialogTitle>
          <DialogDescription>
            Assign "{task.title}" to a team member.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a team member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unassigned</SelectItem>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.image || undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span>{member.name}</span>
                          {member.role && (
                            <Badge variant="outline" className="text-xs">
                              {member.role}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {member._count.assignedTasks} active tasks
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {selectedMemberId && (
            <div className="p-3 bg-muted rounded-md">
              {(() => {
                const selectedMember = teamMembers.find(m => m.id === selectedMemberId);
                if (!selectedMember) return null;
                return (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedMember.image || undefined} />
                      <AvatarFallback>
                        {getInitials(selectedMember.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{selectedMember.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedMember.role} • {selectedMember._count.assignedTasks} active tasks
                      </div>
                      {selectedMember.skills.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {selectedMember.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {selectedMember.skills.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{selectedMember.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {task.assignee && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleUnassign}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Unassign'}
            </Button>
          )}
          <Button
            type="button"
            onClick={handleAssign}
            disabled={!selectedMemberId || submitting}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Assign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}