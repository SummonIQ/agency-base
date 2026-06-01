'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NewTaskModal } from '@/components/projects/new-task-modal';
import { LogTimeModal } from '@/components/projects/log-time-modal';
import { useToast } from '@/hooks/use-toast';
import {
  Building2,
  DollarSign,
  Clock,
  Calendar,
  Target,
  CheckCircle,
  AlertTriangle,
  Users,
  FileText,
  Timer,
  Receipt,
  Edit3,
  Plus,
  ArrowLeft,
  Trash2
} from 'lucide-react';

interface ProjectDetailClientProps {
  project: any;
}

export function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showLogTimeModal, setShowLogTimeModal] = useState(false);
  const [tasks, setTasks] = useState(project.tasks || []);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [timeStats, setTimeStats] = useState({
    totalHours: 0,
    billableHours: 0,
    nonBillableHours: 0
  });

  const statusColors = {
    DRAFT: 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200',
    PROPOSED: 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200',
    NEGOTIATING: 'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-800 dark:text-yellow-200',
    ACTIVE: 'bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-200',
    ON_HOLD: 'bg-orange-100 dark:bg-orange-950/50 text-orange-800 dark:text-orange-200',
    COMPLETED: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200',
    CANCELLED: 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-200',
  };

  const serviceTypeIcons = {
    CONSULTING: '🧠',
    DEVELOPMENT: '💻',
    DESIGN: '🎨',
    MAINTENANCE: '🔧',
    SUPPORT: '🆘',
    TRAINING: '📚',
    OTHER: '📋',
  };

  const isOverdue = project.endDate && new Date(project.endDate) < new Date() && project.status === 'ACTIVE';
  const daysUntilDue = project.endDate ? Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

  const completedTasks = tasks.filter((task: any) => task.status === 'COMPLETED').length;
  const totalTasks = tasks.length;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const completedMilestones = project.milestones?.filter((milestone: any) => milestone.completedAt).length || 0;
  const totalMilestones = project.milestones?.length || 0;
  const milestoneProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  // Fetch time entries on mount
  useEffect(() => {
    fetchTimeEntries();
  }, [project.id]);

  const fetchTimeEntries = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}/time-entries`);
      if (response.ok) {
        const data = await response.json();
        setTimeEntries(data.entries || []);
        setTimeStats({
          totalHours: data.totalHours || 0,
          billableHours: data.billableHours || 0,
          nonBillableHours: data.nonBillableHours || 0
        });
      }
    } catch (error) {
      console.error('Error fetching time entries:', error);
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/projects/${project.id}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      toast({
        title: "Task updated",
        description: `Task status changed to ${newStatus.replace('_', ' ').toLowerCase()}`,
      });

      router.refresh();
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${project.id}/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));

      toast({
        title: "Task deleted",
        description: "The task has been removed from the project",
      });

      router.refresh();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-200';
      case 'HIGH': return 'bg-orange-100 dark:bg-orange-950/50 text-orange-800 dark:text-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-800 dark:text-yellow-200';
      case 'LOW': return 'bg-gray-100 dark:bg-gray-950/50 text-gray-800 dark:text-gray-200';
      default: return 'bg-gray-100 dark:bg-gray-950/50 text-gray-800 dark:text-gray-200';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-200';
      case 'IN_PROGRESS': return 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200';
      case 'IN_REVIEW': return 'bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-200';
      case 'TODO': return 'bg-gray-100 dark:bg-gray-950/50 text-gray-800 dark:text-gray-200';
      case 'CANCELLED': return 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-200';
      default: return 'bg-gray-100 dark:bg-gray-950/50 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Back Button and Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/projects">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <Badge className={statusColors[project.status]}>
              {project.status.replace(/_/g, ' ')}
            </Badge>
            {isOverdue && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Overdue
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {project.client.name}
            </span>
            {project.startDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Started {new Date(project.startDate).toLocaleDateString()}
              </span>
            )}
            {daysUntilDue !== null && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {daysUntilDue > 0 ? `${daysUntilDue} days remaining` : `${Math.abs(daysUntilDue)} days overdue`}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit3 className="mr-2 h-4 w-4" />
            Edit Project
          </Button>
        </div>
      </div>

      {/* Project Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.completionPercentage}%</div>
            <Progress value={project.completionPercentage} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(project.budgetAmount || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              of {totalTasks} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Logged</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeStats.totalHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              {timeStats.billableHours.toFixed(1)}h billable
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Project Details Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({totalTasks})</TabsTrigger>
          <TabsTrigger value="milestones">Milestones ({totalMilestones})</TabsTrigger>
          <TabsTrigger value="deliverables">Deliverables ({project.deliverables?.length || 0})</TabsTrigger>
          <TabsTrigger value="time">Time Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p>{project.description || 'No description provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Service Type</label>
                  <p className="flex items-center gap-2">
                    <span>{serviceTypeIcons[project.serviceType]}</span>
                    {project.serviceType}
                  </p>
                </div>
                {project.budgetAmount && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Budget</label>
                    <p>${project.budgetAmount.toLocaleString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timeline & Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tasks</span>
                      <span>{taskProgress}%</span>
                    </div>
                    <Progress value={taskProgress} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Milestones</span>
                      <span>{milestoneProgress}%</span>
                    </div>
                    <Progress value={milestoneProgress} className="h-2" />
                  </div>
                </div>
                {project.endDate && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                    <p className={isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                      {new Date(project.endDate).toLocaleDateString()}
                      {daysUntilDue !== null && (
                        <span className="text-xs ml-2">
                          ({daysUntilDue > 0 ? `${daysUntilDue} days left` : `${Math.abs(daysUntilDue)} days overdue`})
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Project Tasks</h3>
            <Button onClick={() => setShowNewTaskModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>

          <div className="grid gap-4">
            {totalTasks === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Users className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No tasks yet</p>
                  <Button className="mt-2" onClick={() => setShowNewTaskModal(true)}>Add First Task</Button>
                </CardContent>
              </Card>
            ) : (
              tasks.map((task: any) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3 flex-1">
                        <Checkbox
                          checked={task.status === 'COMPLETED'}
                          onCheckedChange={(checked) => {
                            handleTaskStatusChange(task.id, checked ? 'COMPLETED' : 'TODO');
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <h4 className={`font-medium ${task.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                          )}
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <Badge className={getTaskStatusColor(task.status)}>
                              {task.status.replace(/_/g, ' ')}
                            </Badge>
                            <Badge className={getTaskPriorityColor(task.priority || 'MEDIUM')}>
                              {task.priority || 'MEDIUM'}
                            </Badge>
                            {task.assignee && (
                              <Badge variant="outline">
                                {task.assignee.name}
                              </Badge>
                            )}
                            {task.dueDate && (
                              <Badge variant={new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' ? 'destructive' : 'outline'}>
                                Due {new Date(task.dueDate).toLocaleDateString()}
                              </Badge>
                            )}
                            {task.estimatedHours && (
                              <Badge variant="outline">
                                {task.estimatedHours}h estimated
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={task.status}
                          onValueChange={(value) => handleTaskStatusChange(task.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TODO">To Do</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="IN_REVIEW">In Review</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Project Milestones</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Milestone
            </Button>
          </div>

          <div className="grid gap-4">
            {totalMilestones === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Target className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No milestones yet</p>
                  <Button className="mt-2">Add First Milestone</Button>
                </CardContent>
              </Card>
            ) : (
              project.milestones.map((milestone: any) => (
                <Card key={milestone.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{milestone.name}</h4>
                        {milestone.description && (
                          <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                        )}
                        <div className="flex gap-2 mt-2">
                          <Badge variant={milestone.completedAt ? 'default' : 'secondary'}>
                            {milestone.completedAt ? 'Completed' : 'Pending'}
                          </Badge>
                          <Badge variant="outline">
                            Due {new Date(milestone.dueDate).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        {milestone.completedAt && (
                          <p className="text-xs text-muted-foreground">
                            Completed {new Date(milestone.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="deliverables" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Project Deliverables</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Deliverable
            </Button>
          </div>

          <div className="grid gap-4">
            {(project.deliverables?.length || 0) === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No deliverables yet</p>
                  <Button className="mt-2">Add First Deliverable</Button>
                </CardContent>
              </Card>
            ) : (
              project.deliverables.map((deliverable: any) => (
                <Card key={deliverable.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{deliverable.name}</h4>
                        {deliverable.description && (
                          <p className="text-sm text-muted-foreground mt-1">{deliverable.description}</p>
                        )}
                        <div className="flex gap-2 mt-2">
                          <Badge variant={deliverable.status === 'ACCEPTED' ? 'default' : 'secondary'}>
                            {deliverable.status.replace(/_/g, ' ')}
                          </Badge>
                          {deliverable.dueDate && (
                            <Badge variant="outline">
                              Due {new Date(deliverable.dueDate).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="time" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Time Entries</h3>
            <Button onClick={() => setShowLogTimeModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Log Time
            </Button>
          </div>

          {/* Time Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3 mb-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{timeStats.totalHours.toFixed(1)}h</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Billable Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {timeStats.billableHours.toFixed(1)}h
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Non-Billable Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {timeStats.nonBillableHours.toFixed(1)}h
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4">
            {timeEntries.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Timer className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No time entries yet</p>
                  <Button className="mt-2" onClick={() => setShowLogTimeModal(true)}>
                    Log First Time Entry
                  </Button>
                </CardContent>
              </Card>
            ) : (
              timeEntries.map((entry: any) => (
                <Card key={entry.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{entry.description}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{new Date(entry.date).toLocaleDateString()}</span>
                          {entry.task && (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              {entry.task.title}
                            </span>
                          )}
                          {entry.user && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {entry.user.name || entry.user.email}
                            </span>
                          )}
                        </div>
                        <Badge variant={entry.billable ? 'default' : 'secondary'} className="mt-2">
                          {entry.billable ? 'Billable' : 'Non-billable'}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium">{entry.hours}h</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Task Modal */}
      <NewTaskModal
        open={showNewTaskModal}
        onOpenChange={setShowNewTaskModal}
        projectId={project.id}
      />

      {/* Log Time Modal */}
      <LogTimeModal
        open={showLogTimeModal}
        onOpenChange={(open) => {
          setShowLogTimeModal(open);
          if (!open) {
            // Refresh time entries when modal closes
            fetchTimeEntries();
          }
        }}
        projectId={project.id}
        tasks={tasks.map((task: any) => ({ id: task.id, title: task.title }))}
      />
    </div>
  );
}