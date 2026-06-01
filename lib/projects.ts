import { db } from '@/lib/db';
import { ProjectStatus } from '@prisma/client';

export interface CreateProjectData {
  name: string;
  clientId: string;
  serviceType: string;
  status?: ProjectStatus;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  budgetAmount?: number;
  budgetCurrency?: string;
  userId: string;
}

export interface UpdateProjectData {
  name?: string;
  clientId?: string;
  serviceType?: string;
  status?: ProjectStatus;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  budgetAmount?: number;
  budgetCurrency?: string;
  completionPercentage?: number;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: Date;
  estimatedHours?: number;
  assigneeId?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: Date;
  completedAt?: Date;
  estimatedHours?: number;
  actualHours?: number;
  assigneeId?: string | null;
}

export async function getProjects(userId: string, filters: {
  status?: ProjectStatus;
  clientId?: string;
  serviceType?: string;
} = {}) {
  const where: any = { userId };

  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.clientId) {
    where.clientId = filters.clientId;
  }
  if (filters.serviceType) {
    where.serviceType = filters.serviceType;
  }

  const projects = await db.project.findMany({
    where,
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      contract: {
        select: {
          id: true,
          contractNumber: true,
          status: true,
        },
      },
      tasks: {
        select: {
          id: true,
          status: true,
          assignee: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
      milestones: {
        select: {
          id: true,
          completedAt: true,
        },
      },
      deliverables: true,
      timeEntries: {
        select: {
          hours: true,
          billable: true,
        },
      },
      _count: {
        select: {
          tasks: true,
          milestones: true,
          deliverables: true,
          timeEntries: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Calculate additional stats for each project
  return projects.map(project => {
    const totalHours = project.timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const billableHours = project.timeEntries
      .filter(entry => entry.billable)
      .reduce((sum, entry) => sum + entry.hours, 0);

    const completedTasks = project.tasks.filter(task => task.status === 'COMPLETED').length;
    const totalTasks = project.tasks.length;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      ...project,
      totalHours,
      billableHours,
      taskCompletionRate,
      completedTasks,
      totalTasks,
    };
  });
}

export async function getProject(id: string, userId: string) {
  const project = await db.project.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      client: true,
      contract: true,
      tasks: {
        include: {
          assignee: true,
          timeEntries: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: [
          { status: 'asc' },
          { priority: 'desc' },
          { dueDate: 'asc' },
        ],
      },
      milestones: {
        orderBy: { targetDate: 'asc' },
      },
      deliverables: {
        orderBy: { dueDate: 'asc' },
      },
      timeEntries: {
        include: {
          task: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { date: 'desc' },
      },
      invoices: {
        include: {
          invoiceItems: true,
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      proposals: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return project;
}

export async function createProject(data: CreateProjectData) {
  const project = await db.project.create({
    data: {
      name: data.name,
      clientId: data.clientId,
      serviceType: data.serviceType,
      status: data.status || 'DRAFT',
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      budgetAmount: data.budgetAmount,
      budgetCurrency: data.budgetCurrency || 'USD',
      completionPercentage: 0,
      userId: data.userId,
    },
    include: {
      client: true,
      tasks: true,
      milestones: true,
    },
  });

  return project;
}

export async function updateProject(id: string, userId: string, updateData: UpdateProjectData) {
  const project = await db.project.findFirst({
    where: { id, userId },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  const updatedProject = await db.project.update({
    where: { id },
    data: updateData,
    include: {
      client: true,
      tasks: {
        include: {
          assignee: true,
        },
      },
      milestones: true,
    },
  });

  return updatedProject;
}

export async function deleteProject(id: string, userId: string) {
  const project = await db.project.findFirst({
    where: { id, userId },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  // Check if project has any related data that should prevent deletion
  const hasInvoices = await db.invoice.count({
    where: { projectId: id },
  });

  if (hasInvoices > 0) {
    throw new Error('Cannot delete project with invoices. Please delete invoices first.');
  }

  await db.project.delete({
    where: { id },
  });

  return { success: true };
}

export async function getProjectStats(userId: string) {
  const projects = await db.project.findMany({
    where: { userId },
    select: {
      status: true,
      budgetAmount: true,
    },
  });

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'ACTIVE').length,
    completedProjects: projects.filter(p => p.status === 'COMPLETED').length,
    onHoldProjects: projects.filter(p => p.status === 'ON_HOLD').length,
    totalBudget: projects.reduce((sum, p) => sum + (p.budgetAmount || 0), 0),
  };

  return stats;
}

// Task Management Functions
export async function createTask(projectId: string, userId: string, taskData: CreateTaskData) {
  // Verify project belongs to user
  const project = await db.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  const task = await db.task.create({
    data: {
      title: taskData.title,
      description: taskData.description,
      status: taskData.status || 'TODO',
      priority: taskData.priority || 'MEDIUM',
      dueDate: taskData.dueDate,
      estimatedHours: taskData.estimatedHours,
      projectId,
      assigneeId: taskData.assigneeId,
    },
    include: {
      assignee: true,
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return task;
}

export async function updateTask(taskId: string, userId: string, updateData: UpdateTaskData) {
  // Verify task's project belongs to user
  const task = await db.task.findFirst({
    where: {
      id: taskId,
      project: {
        userId,
      },
    },
  });

  if (!task) {
    throw new Error('Task not found');
  }

  const updatedTask = await db.task.update({
    where: { id: taskId },
    data: {
      ...(updateData.title !== undefined && { title: updateData.title }),
      ...(updateData.description !== undefined && { description: updateData.description }),
      ...(updateData.status !== undefined && { status: updateData.status }),
      ...(updateData.priority !== undefined && { priority: updateData.priority }),
      ...(updateData.dueDate !== undefined && { dueDate: updateData.dueDate }),
      ...(updateData.completedAt !== undefined && { completedAt: updateData.completedAt }),
      ...(updateData.estimatedHours !== undefined && { estimatedHours: updateData.estimatedHours }),
      ...(updateData.actualHours !== undefined && { actualHours: updateData.actualHours }),
      ...(updateData.assigneeId !== undefined && { assigneeId: updateData.assigneeId }),
    },
    include: {
      assignee: true,
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // If task is marked as completed, update the completion date
  if (updateData.status === 'COMPLETED' && !updatedTask.completedAt) {
    await db.task.update({
      where: { id: taskId },
      data: { completedAt: new Date() },
    });
  }

  return updatedTask;
}

export async function deleteTask(taskId: string, userId: string) {
  // Verify task's project belongs to user
  const task = await db.task.findFirst({
    where: {
      id: taskId,
      project: {
        userId,
      },
    },
  });

  if (!task) {
    throw new Error('Task not found');
  }

  // Check if task has time entries
  const hasTimeEntries = await db.timeEntry.count({
    where: { taskId },
  });

  if (hasTimeEntries > 0) {
    throw new Error('Cannot delete task with time entries. Please delete time entries first.');
  }

  await db.task.delete({
    where: { id: taskId },
  });

  return { success: true };
}

export async function getTasksForProject(projectId: string, userId: string) {
  const tasks = await db.task.findMany({
    where: {
      projectId,
      project: {
        userId,
      },
    },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          availability: true,
        },
      },
      timeEntries: {
        select: {
          hours: true,
          billable: true,
        },
      },
      _count: {
        select: {
          timeEntries: true,
        },
      },
    },
    orderBy: [
      { status: 'asc' },
      { priority: 'desc' },
      { dueDate: 'asc' },
    ],
  });

  // Calculate total hours for each task
  return tasks.map(task => {
    const totalHours = task.timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
    return {
      ...task,
      totalHours,
    };
  });
}

export async function getProjectDashboardData(userId: string) {
  const [projects, teamMembers, recentTasks, upcomingDeadlines] = await Promise.all([
    // Active projects with task counts
    db.project.findMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        tasks: {
          select: {
            id: true,
            status: true,
            priority: true,
            assignee: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
            milestones: true,
            timeEntries: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    }),

    // Team members with current workload
    db.teamMember.findMany({
      where: { userId },
      include: {
        assignedTasks: {
          where: {
            status: {
              notIn: ['COMPLETED', 'CANCELLED'],
            },
          },
          include: {
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            assignedTasks: {
              where: {
                status: {
                  notIn: ['COMPLETED', 'CANCELLED'],
                },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    }),

    // Recent tasks across all projects
    db.task.findMany({
      where: {
        project: {
          userId,
          status: 'ACTIVE',
        },
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            client: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    }),

    // Upcoming deadlines (tasks due in next 7 days)
    db.task.findMany({
      where: {
        project: {
          userId,
          status: 'ACTIVE',
        },
        status: {
          not: 'COMPLETED',
        },
        dueDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            client: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    }),
  ]);

  // Calculate statistics
  const stats = {
    activeProjects: projects.length,
    totalTasks: projects.reduce((sum, p) => sum + p._count.tasks, 0),
    teamMembers: teamMembers.length,
    availableMembers: teamMembers.filter(m => m.availability === 'available').length,
    upcomingDeadlines: upcomingDeadlines.length,

    // Task status breakdown
    tasksByStatus: projects.reduce((acc, project) => {
      project.tasks.forEach(task => {
        acc[task.status] = (acc[task.status] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>),

    // Task priority breakdown
    tasksByPriority: projects.reduce((acc, project) => {
      project.tasks.forEach(task => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>),
  };

  return {
    projects,
    teamMembers,
    recentTasks,
    upcomingDeadlines,
    stats,
  };
}