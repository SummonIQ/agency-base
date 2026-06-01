import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function getProjectTasks(projectId: string, userId: string) {
  return db.projectTask.findMany({
    where: { 
      projectId,
      project: { userId },
    },
    include: {
      _count: {
        select: {
          timeEntries: true,
        },
      },
    },
    orderBy: [
      { status: 'asc' }, // todo first, then in_progress, then completed
      { priority: 'desc' }, // urgent first
      { dueDate: 'asc' }, // earliest due date first
    ],
  });
}

export async function getProjectTask(id: string, userId: string) {
  return db.projectTask.findFirst({
    where: {
      id,
      project: { userId },
    },
    include: {
      project: {
        include: {
          client: true,
        },
      },
      timeEntries: {
        orderBy: { date: 'desc' },
        take: 10,
      },
    },
  });
}

export async function createProjectTask(
  userId: string,
  data: {
    title: string;
    description?: string;
    projectId: string;
    status?: string;
    priority?: string;
    dueDate?: Date;
    estimatedHours?: number;
    assignedToId?: string;
  }
) {
  // Verify user owns the project
  const project = await db.project.findFirst({
    where: { id: data.projectId, userId },
  });

  if (!project) {
    throw new Error('Project not found or access denied');
  }

  return db.projectTask.create({
    data,
    include: {
      project: {
        include: {
          client: true,
        },
      },
    },
  });
}

export async function updateProjectTask(
  id: string,
  userId: string,
  data: Prisma.ProjectTaskUpdateInput
) {
  // Verify user owns the project
  const task = await db.projectTask.findFirst({
    where: {
      id,
      project: { userId },
    },
  });

  if (!task) {
    throw new Error('Task not found or access denied');
  }

  const updatedTask = await db.projectTask.update({
    where: { id },
    data: {
      ...data,
      // If marking as completed, set completedAt
      ...(data.status === 'completed' && !task.completedAt && {
        completedAt: new Date(),
      }),
    },
    include: {
      project: {
        include: {
          client: true,
        },
      },
    },
  });

  // Update project completion percentage
  await updateProjectCompletion(task.projectId);

  return updatedTask;
}

export async function deleteProjectTask(id: string, userId: string) {
  // Verify user owns the project
  const task = await db.projectTask.findFirst({
    where: {
      id,
      project: { userId },
    },
  });

  if (!task) {
    throw new Error('Task not found or access denied');
  }

  const deletedTask = await db.projectTask.delete({
    where: { id },
  });

  // Update project completion percentage
  await updateProjectCompletion(task.projectId);

  return deletedTask;
}

async function updateProjectCompletion(projectId: string) {
  const tasks = await db.projectTask.findMany({
    where: { projectId },
  });

  if (tasks.length === 0) return;

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const completionPercentage = Math.round((completedTasks / tasks.length) * 100);

  await db.project.update({
    where: { id: projectId },
    data: { completionPercentage },
  });
}

export async function getTasksByStatus(projectId: string, userId: string) {
  const tasks = await getProjectTasks(projectId, userId);
  
  return {
    todo: tasks.filter(t => t.status === 'todo'),
    inProgress: tasks.filter(t => t.status === 'in_progress'),
    completed: tasks.filter(t => t.status === 'completed'),
  };
}

export async function getTaskStats(projectId: string, userId: string) {
  const tasks = await getProjectTasks(projectId, userId);
  
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const overdueTasks = tasks.filter(t => 
    t.dueDate && 
    new Date(t.dueDate) < new Date() && 
    t.status !== 'completed'
  ).length;

  const totalEstimatedHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  const totalActualHours = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    overdueTasks,
    totalEstimatedHours,
    totalActualHours,
    completionPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
  };
}