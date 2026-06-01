'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { NewProjectModal } from '@/components/projects/new-project-modal';
import {
  FolderOpen,
  DollarSign,
  Clock,
  Plus,
  Building2,
  Calendar,
  Users,
  CheckCircle,
  AlertTriangle,
  Target
} from 'lucide-react';

interface ProjectsClientProps {
  projects: any[];
  stats: any;
  clients: Array<{ id: string; name: string }>;
}

export function ProjectsClient({ projects, stats, clients }: ProjectsClientProps) {
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage your active client projects</p>
        </div>
        <Button onClick={() => setShowNewProjectModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalBudget.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedProjects}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalProjects > 0 ? Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0}% completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <div className="grid gap-4">
        {projects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
              <p className="text-muted-foreground mb-4">
                Start your first client project
              </p>
              <Button onClick={() => setShowNewProjectModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-lg">{serviceTypeIcons[project.serviceType]}</span>
                      <Link
                        href={`/projects/${project.id}`}
                        className="hover:underline"
                      >
                        {project.name}
                      </Link>
                      <Badge className={statusColors[project.status]}>
                        {project.status.replace(/_/g, ' ')}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-2 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {project.client.name}
                      </span>
                      {project.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(project.startDate).toLocaleDateString()}
                        </span>
                      )}
                      {project.description && (
                        <span className="text-sm">{project.description}</span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    {project.budgetAmount && (
                      <div className="flex items-center text-green-600 dark:text-green-400 mb-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold">
                          ${project.budgetAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="w-24">
                      <div className="text-xs text-muted-foreground mb-1">
                        {project.completionPercentage}% complete
                      </div>
                      <Progress value={project.completionPercentage} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {project._count.tasks} tasks
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {project._count.timeEntries} time entries
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {project._count.milestones} milestones
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {project._count.deliverables} deliverables
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    {project.contract && (
                      <Badge variant="outline">
                        Contract: {project.contract.contractNumber}
                      </Badge>
                    )}
                    {project.endDate && new Date(project.endDate) < new Date() && project.status === 'ACTIVE' && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Overdue
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/projects/${project.id}/tasks`}>
                      <Button variant="outline" size="sm">
                        Tasks
                      </Button>
                    </Link>
                    <Link href={`/projects/${project.id}`}>
                      <Button size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* New Project Modal */}
      <NewProjectModal
        open={showNewProjectModal}
        onOpenChange={setShowNewProjectModal}
        clients={clients}
      />
    </div>
  );
}