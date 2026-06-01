'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertTriangle,
  CheckCircle,
  Circle,
  PlayCircle,
  Timer,
  Edit,
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: string | null;
  estimatedHours?: number | null;
  actualHours?: number;
  _count: {
    timeEntries: number;
  };
}

interface KanbanBoardProps {
  initialTasks: {
    todo: Task[];
    inProgress: Task[];
    completed: Task[];
  };
  projectId: string;
  onRefresh: () => void;
}

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

const statusIcons = {
  TODO: Circle,
  IN_PROGRESS: PlayCircle,
  COMPLETED: CheckCircle,
};

function SortableTaskCard({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';
  const StatusIcon = statusIcons[task.status as keyof typeof statusIcons] || Circle;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-move"
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <StatusIcon className="h-4 w-4" />
                <h4 className="font-medium">{task.title}</h4>
                {isOverdue && <AlertTriangle className="h-4 w-4 text-red-500" />}
              </div>

              {task.description && (
                <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
              )}

              <div className="flex gap-2 flex-wrap">
                <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>
                  {task.priority}
                </Badge>

                {task.dueDate && (
                  <Badge variant={isOverdue ? 'destructive' : 'outline'}>
                    Due {new Date(task.dueDate).toLocaleDateString()}
                  </Badge>
                )}

                {task.estimatedHours && (
                  <Badge variant="outline">
                    {task.estimatedHours}h estimated
                  </Badge>
                )}

                {task._count.timeEntries > 0 && (
                  <Badge variant="secondary">
                    {task._count.timeEntries} time entries
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex gap-2 ml-4">
              <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                <Timer className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {task.actualHours > 0 && task.estimatedHours && (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span>Progress ({task.actualHours}h / {task.estimatedHours}h)</span>
                <span>{Math.round((task.actualHours / task.estimatedHours) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min((task.actualHours / task.estimatedHours) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DroppableColumn({
  columnId,
  title,
  icon: Icon,
  tasks,
  iconColor
}: {
  columnId: string;
  title: string;
  icon: any;
  tasks: Task[];
  iconColor: string;
}) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <h2 className="text-lg font-semibold">{title} ({tasks.length})</h2>
      </div>
      <div className="space-y-3">
        <SortableContext
          items={tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Icon className="h-8 w-8 mb-2" />
              <p>No tasks {columnId === 'todo' ? 'to do' : columnId === 'inProgress' ? 'in progress' : 'completed'}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ initialTasks, projectId, onRefresh }: KanbanBoardProps) {
  const { toast } = useToast();
  const [tasks, setTasks] = useState(initialTasks);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const taskId = active.id as string;
    const targetColumn = over.id as string;

    // Find the task
    let sourceColumn: 'todo' | 'inProgress' | 'completed' | null = null;
    let task: Task | undefined;

    for (const [column, columnTasks] of Object.entries(tasks)) {
      const found = columnTasks.find(t => t.id === taskId);
      if (found) {
        sourceColumn = column as 'todo' | 'inProgress' | 'completed';
        task = found;
        break;
      }
    }

    if (!task || !sourceColumn || sourceColumn === targetColumn) {
      setActiveId(null);
      return;
    }

    // Optimistically update UI
    const newTasks = { ...tasks };
    newTasks[sourceColumn] = newTasks[sourceColumn].filter(t => t.id !== taskId);

    // Map column to status
    const statusMap = {
      todo: 'TODO',
      inProgress: 'IN_PROGRESS',
      completed: 'COMPLETED',
    };

    const updatedTask = { ...task, status: statusMap[targetColumn as keyof typeof statusMap] };
    newTasks[targetColumn as keyof typeof tasks].push(updatedTask);
    setTasks(newTasks);

    // Update on server
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: statusMap[targetColumn as keyof typeof statusMap],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      toast({
        title: 'Task updated',
        description: `Task moved to ${targetColumn === 'todo' ? 'To Do' : targetColumn === 'inProgress' ? 'In Progress' : 'Completed'}`,
      });

      onRefresh();
    } catch (error) {
      // Revert on error
      console.error('Error updating task:', error);
      setTasks(initialTasks);
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        variant: 'destructive',
      });
    }

    setActiveId(null);
  };

  const activeTask = activeId
    ? Object.values(tasks).flat().find(t => t.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-6 md:grid-cols-3">
        <DroppableColumn
          columnId="todo"
          title="To Do"
          icon={Circle}
          iconColor="text-gray-500"
          tasks={tasks.todo}
        />
        <DroppableColumn
          columnId="inProgress"
          title="In Progress"
          icon={PlayCircle}
          iconColor="text-blue-500"
          tasks={tasks.inProgress}
        />
        <DroppableColumn
          columnId="completed"
          title="Completed"
          icon={CheckCircle}
          iconColor="text-green-500"
          tasks={tasks.completed}
        />
      </div>

      <DragOverlay>
        {activeTask && <SortableTaskCard task={activeTask} />}
      </DragOverlay>
    </DndContext>
  );
}