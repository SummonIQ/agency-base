'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { NewTaskModal } from '@/components/tasks/new-task-modal';
import { TaskDetailModal } from '@/components/tasks/task-detail-modal';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpCircle,
  Target,
  Briefcase,
  Code,
  Megaphone,
  TrendingUp,
  Users,
  Settings,
  MoreVertical,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface ActionTask {
  id: string;
  title: string;
  description?: string;
  category: string;
  status: 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  completedAt?: string;
  estimatedHours?: number;
  actualHours: number;
  source?: string;
  sourceId?: string;
  tags: string[];
  progressPercentage: number;
  notes?: string;
  assignedTo?: {
    id: string;
    name: string;
    image?: string;
  };
  parentTaskId?: string;
  subTasks?: ActionTask[];
  createdAt: string;
  updatedAt: string;
}

const categoryIcons: Record<string, JSX.Element> = {
  Sales: <TrendingUp className="h-4 w-4" />,
  Marketing: <Megaphone className="h-4 w-4" />,
  Development: <Code className="h-4 w-4" />,
  Operations: <Settings className="h-4 w-4" />,
  'Business Development': <Briefcase className="h-4 w-4" />,
  'Lead Generation': <Users className="h-4 w-4" />,
  Other: <Target className="h-4 w-4" />
};

const statusColors = {
  TODO: 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200',
  IN_PROGRESS: 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200',
  BLOCKED: 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-200',
  COMPLETED: 'bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-200',
  CANCELLED: 'bg-orange-100 dark:bg-orange-950/50 text-orange-800 dark:text-orange-200'
};

const priorityIcons = {
  LOW: null,
  MEDIUM: <ArrowUpCircle className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />,
  HIGH: <ArrowUpCircle className="h-3 w-3 text-orange-600 dark:text-orange-400" />,
  URGENT: <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
};

export function TasksClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<ActionTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<ActionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ActionTask | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchQuery, categoryFilter, priorityFilter, statusFilter]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tasks',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = [...tasks];

    // Only show root tasks (tasks without a parent)
    filtered = filtered.filter(task => !task.parentTaskId);

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(task => task.category === categoryFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(task => ['TODO', 'IN_PROGRESS', 'BLOCKED'].includes(task.status));
    } else if (statusFilter === 'completed') {
      filtered = filtered.filter(task => task.status === 'COMPLETED');
    } else if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Sort by priority and due date
    filtered.sort((a, b) => {
      const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    });

    setFilteredTasks(filtered);
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(prev => prev.map(task =>
          task.id === taskId ? updatedTask : task
        ));
        toast({
          title: 'Task updated',
          description: `Status changed to ${newStatus.toLowerCase().replace('_', ' ')}`
        });
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTasks(prev => prev.filter(task => task.id !== taskId));
        toast({
          title: 'Task deleted',
          description: 'The task has been removed'
        });
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive'
      });
    }
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const blocked = tasks.filter(t => t.status === 'BLOCKED').length;
    const overdue = tasks.filter(t =>
      t.dueDate &&
      new Date(t.dueDate) < new Date() &&
      t.status !== 'COMPLETED' &&
      t.status !== 'CANCELLED'
    ).length;

    return { total, completed, inProgress, blocked, overdue };
  };

  const stats = getTaskStats();

  const categories = ['all', ...Array.from(new Set(tasks.map(t => t.category)))];

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const TaskItem = ({ task, depth = 0 }: { task: ActionTask; depth?: number }) => {
    const hasSubTasks = task.subTasks && task.subTasks.length > 0;
    const isExpanded = expandedTasks.has(task.id);
    const indentClass = depth > 0 ? 'ml-8 border-l-2 border-muted pl-4' : '';

    return (
      <div className={indentClass}>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={task.status === 'COMPLETED'}
                      onCheckedChange={(checked) =>
                        handleStatusChange(task.id, checked ? 'COMPLETED' : 'TODO')
                      }
                      className="mt-1"
                    />
                    {hasSubTasks && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0"
                        onClick={() => toggleTaskExpansion(task.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {categoryIcons[task.category] || categoryIcons.Other}
                      <h3
                        className="font-medium hover:text-primary cursor-pointer"
                        onClick={() => setSelectedTask(task)}
                      >
                        {task.title}
                      </h3>
                      {priorityIcons[task.priority]}
                      <Badge className={statusColors[task.status]} variant="secondary">
                        {task.status.replace('_', ' ')}
                      </Badge>
                      {hasSubTasks && (
                        <Badge variant="outline" className="text-xs">
                          {task.subTasks!.length} subtask{task.subTasks!.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{task.category}</span>
                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      {task.estimatedHours && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.estimatedHours}h estimated
                        </span>
                      )}
                      {task.progressPercentage > 0 && (
                        <span>{task.progressPercentage}% complete</span>
                      )}
                    </div>
                    {task.tags.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {task.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={task.status}
                  onValueChange={(value) => handleStatusChange(task.id, value)}
                >
                  <SelectTrigger className="w-[140px] h-8">
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteTask(task.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Render sub-tasks */}
        {hasSubTasks && isExpanded && (
          <div className="mt-2 space-y-2">
            {task.subTasks!.map(subTask => (
              <TaskItem key={subTask.id} task={subTask} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading tasks...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tasks & Action Items</h1>
          <p className="text-muted-foreground mt-1">
            Manage your tasks and track progress across all projects
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              try {
                const response = await fetch('/api/tasks/import-action-plans', {
                  method: 'POST'
                });
                const data = await response.json();
                if (response.ok) {
                  toast({
                    title: 'Tasks imported',
                    description: `${data.count} action items have been added`
                  });
                  fetchTasks();
                } else {
                  toast({
                    title: 'Info',
                    description: data.message || 'Action plan tasks already exist'
                  });
                }
              } catch (error) {
                toast({
                  title: 'Error',
                  description: 'Failed to import tasks',
                  variant: 'destructive'
                });
              }
            }}
          >
            <Target className="mr-2 h-4 w-4" />
            {tasks.length === 0 ? 'Import Action Plan' : 'Add Action Plan Tasks'}
          </Button>
          <Button onClick={() => setShowNewTaskModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.inProgress}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.completed}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Blocked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.blocked}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats.overdue}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="TODO">To Do</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="BLOCKED">Blocked</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No tasks found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery || categoryFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first task to get started'}
              </p>
              {!searchQuery && categoryFilter === 'all' && priorityFilter === 'all' && (
                <Button className="mt-4" onClick={() => setShowNewTaskModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Task
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map(task => (
            <TaskItem key={task.id} task={task} />
          ))
        )}
      </div>

      {/* Modals */}
      <NewTaskModal
        open={showNewTaskModal}
        onOpenChange={setShowNewTaskModal}
        onTaskCreated={(newTask) => {
          setTasks(prev => [newTask, ...prev]);
          setShowNewTaskModal(false);
        }}
      />

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
          onTaskUpdated={(updatedTask) => {
            setTasks(prev => prev.map(t =>
              t.id === updatedTask.id ? updatedTask : t
            ));
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}