'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NewTaskModal } from '@/components/projects/new-task-modal';
import { KanbanBoard } from './kanban-board';
import {
  ArrowLeft,
  Plus,
  CheckCircle,
  Circle,
  PlayCircle,
  Loader2
} from 'lucide-react';

export default function ProjectTasksPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [tasksByStatus, setTasksByStatus] = useState<any>({
    todo: [],
    inProgress: [],
    completed: []
  });
  const [newTaskModalOpen, setNewTaskModalOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      const [projectRes, tasksRes, teamRes] = await Promise.all([
        fetch(`/api/projects/${params.id}`),
        fetch(`/api/projects/${params.id}/tasks`),
        fetch('/api/team-members')
      ]);

      if (!projectRes.ok) {
        router.push('/projects');
        return;
      }

      const projectData = await projectRes.json();
      const tasksData = await tasksRes.json();
      const teamData = await teamRes.json();

      setProject(projectData);
      setTasksByStatus(tasksData);
      setTeamMembers(teamData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return null;
  }


  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/projects/${project.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Project
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Tasks: {project.name}</h1>
            <p className="text-muted-foreground">
              Manage tasks for {project.client.name}
            </p>
          </div>
        </div>
        <Button onClick={() => setNewTaskModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Task Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">To Do</CardTitle>
            <Circle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasksByStatus.todo.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasksByStatus.inProgress.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasksByStatus.completed.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <KanbanBoard
        initialTasks={tasksByStatus}
        projectId={params.id as string}
        onRefresh={fetchData}
      />

      <NewTaskModal
        open={newTaskModalOpen}
        onOpenChange={(open) => {
          setNewTaskModalOpen(open);
          if (!open) {
            fetchData(); // Refresh data when modal closes
          }
        }}
        projectId={params.id as string}
        teamMembers={teamMembers}
      />
    </div>
  );
}