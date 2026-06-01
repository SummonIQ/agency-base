import { prisma } from '@/lib/db';
import { TimeEntry, TimeEntryStatus, Prisma } from '@prisma/client';

export interface TimeEntryWithRelations extends TimeEntry {
  project: {
    id: string;
    name: string;
    client: {
      id: string;
      name: string;
    };
  };
  task?: {
    id: string;
    title: string;
  } | null;
  invoice?: {
    id: string;
    invoiceNumber: string;
    status: string;
  } | null;
}

export async function getTimeEntries(
  userId: string,
  filters?: {
    projectId?: string;
    clientId?: string;
    status?: TimeEntryStatus;
    billable?: boolean;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<TimeEntryWithRelations[]> {
  const where: Prisma.TimeEntryWhereInput = {
    userId,
    ...(filters?.projectId && { projectId: filters.projectId }),
    ...(filters?.status && { status: filters.status }),
    ...(filters?.billable !== undefined && { billable: filters.billable }),
    ...(filters?.clientId && {
      project: { clientId: filters.clientId }
    }),
    ...((filters?.startDate || filters?.endDate) && {
      date: {
        ...(filters?.startDate && { gte: filters.startDate }),
        ...(filters?.endDate && { lte: filters.endDate }),
      }
    }),
  };

  return prisma.timeEntry.findMany({
    where,
    include: {
      project: {
        include: {
          client: true,
        },
      },
      task: true,
      invoice: true,
    },
    orderBy: { date: 'desc' },
  });
}

export async function getTimeEntryById(
  id: string,
  userId: string
): Promise<TimeEntryWithRelations | null> {
  return prisma.timeEntry.findFirst({
    where: { id, userId },
    include: {
      project: {
        include: {
          client: true,
        },
      },
      task: true,
      invoice: true,
    },
  });
}

export async function createTimeEntry(
  userId: string,
  data: {
    description: string;
    hours: number;
    date: Date;
    projectId: string;
    taskId?: string;
    billable?: boolean;
    hourlyRate?: number;
  }
): Promise<TimeEntry> {
  const totalAmount = data.hourlyRate ? data.hours * data.hourlyRate : null;

  return prisma.timeEntry.create({
    data: {
      ...data,
      userId,
      totalAmount,
      status: TimeEntryStatus.DRAFT,
    },
  });
}

export async function updateTimeEntry(
  id: string,
  userId: string,
  data: Partial<{
    description: string;
    hours: number;
    date: Date;
    projectId: string;
    taskId: string | null;
    billable: boolean;
    hourlyRate: number | null;
    status: TimeEntryStatus;
  }>
): Promise<TimeEntry> {
  // Recalculate total amount if hours or rate changed
  let totalAmount = undefined;
  if (data.hours !== undefined || data.hourlyRate !== undefined) {
    const entry = await prisma.timeEntry.findFirst({
      where: { id, userId },
    });
    if (entry) {
      const hours = data.hours ?? entry.hours;
      const rate = data.hourlyRate ?? entry.hourlyRate;
      totalAmount = rate ? hours * rate : null;
    }
  }

  return prisma.timeEntry.update({
    where: { id },
    data: {
      ...data,
      ...(totalAmount !== undefined && { totalAmount }),
    },
  });
}

export async function deleteTimeEntry(
  id: string,
  userId: string
): Promise<void> {
  await prisma.timeEntry.deleteMany({
    where: { id, userId, status: TimeEntryStatus.DRAFT },
  });
}

export async function approveTimeEntries(
  ids: string[],
  userId: string
): Promise<number> {
  const result = await prisma.timeEntry.updateMany({
    where: {
      id: { in: ids },
      userId,
      status: TimeEntryStatus.DRAFT,
    },
    data: {
      status: TimeEntryStatus.APPROVED,
    },
  });

  return result.count;
}

export async function getTimeEntryStats(
  userId: string,
  filters?: {
    startDate?: Date;
    endDate?: Date;
    projectId?: string;
    clientId?: string;
  }
) {
  const where: Prisma.TimeEntryWhereInput = {
    userId,
    ...(filters?.projectId && { projectId: filters.projectId }),
    ...(filters?.clientId && {
      project: { clientId: filters.clientId }
    }),
    ...((filters?.startDate || filters?.endDate) && {
      date: {
        ...(filters?.startDate && { gte: filters.startDate }),
        ...(filters?.endDate && { lte: filters.endDate }),
      }
    }),
  };

  const [totalHours, billableHours, totalAmount, entries] = await Promise.all([
    // Total hours
    prisma.timeEntry.aggregate({
      where,
      _sum: { hours: true },
    }),
    // Billable hours
    prisma.timeEntry.aggregate({
      where: { ...where, billable: true },
      _sum: { hours: true },
    }),
    // Total billable amount
    prisma.timeEntry.aggregate({
      where: { ...where, billable: true },
      _sum: { totalAmount: true },
    }),
    // Entry count
    prisma.timeEntry.count({ where }),
  ]);

  return {
    totalHours: totalHours._sum.hours || 0,
    billableHours: billableHours._sum.hours || 0,
    totalAmount: totalAmount._sum.totalAmount || 0,
    entryCount: entries,
    averageHoursPerEntry: entries > 0 ? (totalHours._sum.hours || 0) / entries : 0,
  };
}

// Timer-specific functions for active time tracking
export interface ActiveTimer {
  id: string;
  projectId: string;
  taskId?: string;
  description: string;
  startTime: Date;
  elapsedSeconds: number;
}

// In a real app, you might store active timers in Redis or a similar cache
// For now, we'll use in-memory storage (note: this won't persist across server restarts)
const activeTimers = new Map<string, ActiveTimer>();

export function startTimer(
  userId: string,
  data: {
    projectId: string;
    taskId?: string;
    description: string;
  }
): ActiveTimer {
  const timer: ActiveTimer = {
    id: `timer_${Date.now()}`,
    ...data,
    startTime: new Date(),
    elapsedSeconds: 0,
  };
  
  activeTimers.set(`${userId}_active`, timer);
  return timer;
}

export function stopTimer(userId: string): ActiveTimer | null {
  const timer = activeTimers.get(`${userId}_active`);
  if (!timer) return null;
  
  const now = new Date();
  const elapsed = Math.floor((now.getTime() - timer.startTime.getTime()) / 1000);
  timer.elapsedSeconds = elapsed;
  
  activeTimers.delete(`${userId}_active`);
  return timer;
}

export function getActiveTimer(userId: string): ActiveTimer | null {
  const timer = activeTimers.get(`${userId}_active`);
  if (!timer) return null;
  
  const now = new Date();
  const elapsed = Math.floor((now.getTime() - timer.startTime.getTime()) / 1000);
  return { ...timer, elapsedSeconds: elapsed };
}