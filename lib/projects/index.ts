import { db } from '@/lib/db';
import { ProjectStatus, ServiceType, Prisma } from '@prisma/client';

export async function getProjects(userId: string) {
  return db.project.findMany({
    where: { userId },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
      contract: {
        select: {
          id: true,
          contractNumber: true,
          status: true,
        },
      },
      _count: {
        select: {
          tasks: true,
          timeEntries: true,
          milestones: true,
          deliverables: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getProject(id: string, userId: string) {
  return db.project.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      client: true,
      contract: true,
      tasks: {
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              timeEntries: true,
            },
          },
        },
      },
      milestones: {
        orderBy: { dueDate: 'asc' },
      },
      deliverables: {
        orderBy: { dueDate: 'asc' },
      },
      timeEntries: {
        orderBy: { date: 'desc' },
        take: 10,
      },
      invoices: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });
}

export async function createProject(
  userId: string,
  data: {
    name: string;
    description?: string;
    serviceType: ServiceType;
    clientId: string;
    startDate?: Date;
    endDate?: Date;
    budgetAmount?: number;
    hourlyRate?: number;
    fixedPrice?: number;
    contractId?: string;
  }
) {
  return db.project.create({
    data: {
      ...data,
      userId,
    },
    include: {
      client: true,
    },
  });
}

export async function updateProject(
  id: string,
  userId: string,
  data: Prisma.ProjectUpdateInput
) {
  return db.project.update({
    where: {
      id,
      userId,
    },
    data,
    include: {
      client: true,
    },
  });
}

export async function deleteProject(id: string, userId: string) {
  return db.project.delete({
    where: {
      id,
      userId,
    },
  });
}

export async function getProjectStats(userId: string) {
  const [totalProjects, activeProjects, totalBudget, completedProjects] = await Promise.all([
    db.project.count({ where: { userId } }),
    db.project.count({ 
      where: { 
        userId, 
        status: { in: ['ACTIVE', 'NEGOTIATING'] } 
      } 
    }),
    db.project.aggregate({
      where: { userId },
      _sum: { budgetAmount: true },
    }),
    db.project.count({ 
      where: { userId, status: 'COMPLETED' } 
    }),
  ]);

  const avgBudget = totalProjects > 0 
    ? (totalBudget._sum.budgetAmount || 0) / totalProjects 
    : 0;

  return {
    totalProjects,
    activeProjects,
    completedProjects,
    avgBudget,
    totalBudget: totalBudget._sum.budgetAmount || 0,
  };
}

export async function getProjectProgress(projectId: string, userId: string) {
  const project = await db.project.findFirst({
    where: { id: projectId, userId },
    include: {
      tasks: true,
      milestones: true,
      deliverables: true,
    },
  });

  if (!project) return null;

  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter(t => t.status === 'completed').length;
  
  const totalMilestones = project.milestones.length;
  const completedMilestones = project.milestones.filter(m => m.completedAt).length;
  
  const totalDeliverables = project.deliverables.length;
  const acceptedDeliverables = project.deliverables.filter(d => d.status === 'accepted').length;

  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const milestoneProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
  const deliverableProgress = totalDeliverables > 0 ? (acceptedDeliverables / totalDeliverables) * 100 : 0;

  // Weighted average of all progress indicators
  const overallProgress = Math.round(
    (taskProgress * 0.4 + milestoneProgress * 0.3 + deliverableProgress * 0.3)
  );

  return {
    overallProgress,
    taskProgress: Math.round(taskProgress),
    milestoneProgress: Math.round(milestoneProgress), 
    deliverableProgress: Math.round(deliverableProgress),
    stats: {
      totalTasks,
      completedTasks,
      totalMilestones,
      completedMilestones,
      totalDeliverables,
      acceptedDeliverables,
    },
  };
}