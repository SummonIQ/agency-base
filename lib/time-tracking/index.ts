'use cache';

import { db } from '@/lib/db';
import { cacheTag, revalidateTag } from 'next/cache';
import { TimeEntryStatus } from '@prisma/client';

export type CreateTimeEntryData = {
  description: string;
  hours: number;
  date: Date;
  billable?: boolean;
  hourlyRate?: number;
  projectId: string;
  taskId?: string;
  userId: string;
};

export type UpdateTimeEntryData = Partial<CreateTimeEntryData> & {
  status?: TimeEntryStatus;
};

export type TimeEntryFilters = {
  projectId?: string;
  taskId?: string;
  status?: TimeEntryStatus;
  billable?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
};

// Time Entry Management
export async function getTimeEntries(userId: string, filters?: TimeEntryFilters) {
  'use cache';
  cacheTag(`user:${userId}:time-entries`);
  
  const where: any = { userId };
  
  if (filters?.projectId) where.projectId = filters.projectId;
  if (filters?.taskId) where.taskId = filters.taskId;
  if (filters?.status) where.status = filters.status;
  if (filters?.billable !== undefined) where.billable = filters.billable;
  
  if (filters?.dateFrom || filters?.dateTo) {
    where.date = {};
    if (filters.dateFrom) where.date.gte = filters.dateFrom;
    if (filters.dateTo) where.date.lte = filters.dateTo;
  }
  
  return db.timeEntry.findMany({
    where,
    include: {
      project: {
        include: {
          client: true,
        },
      },
      task: true,
    },
    orderBy: [
      { date: 'desc' },
      { createdAt: 'desc' },
    ],
  });
}

export async function getTimeEntry(id: string, userId: string) {
  'use cache';
  cacheTag(`user:${userId}:time-entry:${id}`);
  
  return db.timeEntry.findFirst({
    where: { id, userId },
    include: {
      project: {
        include: {
          client: true,
        },
      },
      task: true,
    },
  });
}

export async function createTimeEntry(data: CreateTimeEntryData) {
  const totalAmount = data.hourlyRate ? data.hours * data.hourlyRate : null;
  
  const timeEntry = await db.timeEntry.create({
    data: {
      ...data,
      totalAmount,
    },
    include: {
      project: {
        include: {
          client: true,
        },
      },
      task: true,
    },
  });
  
  revalidateTag(`user:${data.userId}:time-entries`);
  return timeEntry;
}

export async function updateTimeEntry(id: string, userId: string, data: UpdateTimeEntryData) {
  const updateData: any = { ...data };
  
  // Recalculate total amount if hours or rate changed
  if (data.hours !== undefined || data.hourlyRate !== undefined) {
    const existing = await db.timeEntry.findFirst({
      where: { id, userId },
      select: { hours: true, hourlyRate: true },
    });
    
    if (existing) {
      const hours = data.hours ?? existing.hours;
      const rate = data.hourlyRate ?? existing.hourlyRate;
      updateData.totalAmount = rate ? hours * rate : null;
    }
  }
  
  const timeEntry = await db.timeEntry.update({
    where: { id, userId },
    data: updateData,
    include: {
      project: {
        include: {
          client: true,
        },
      },
      task: true,
    },
  });
  
  revalidateTag(`user:${userId}:time-entries`);
  revalidateTag(`user:${userId}:time-entry:${id}`);
  
  return timeEntry;
}

export async function deleteTimeEntry(id: string, userId: string) {
  await db.timeEntry.delete({
    where: { id, userId },
  });
  
  revalidateTag(`user:${userId}:time-entries`);
  revalidateTag(`user:${userId}:time-entry:${id}`);
}

export async function submitTimeEntries(ids: string[], userId: string) {
  const updated = await db.timeEntry.updateMany({
    where: { 
      id: { in: ids },
      userId,
      status: TimeEntryStatus.DRAFT,
    },
    data: { status: TimeEntryStatus.SUBMITTED },
  });
  
  revalidateTag(`user:${userId}:time-entries`);
  return updated;
}

export async function approveTimeEntries(ids: string[], userId: string) {
  const updated = await db.timeEntry.updateMany({
    where: { 
      id: { in: ids },
      userId,
      status: TimeEntryStatus.SUBMITTED,
    },
    data: { status: TimeEntryStatus.APPROVED },
  });
  
  revalidateTag(`user:${userId}:time-entries`);
  return updated;
}

// Time Tracking Analytics
export async function getTimeTrackingAnalytics(userId: string, dateRange?: {
  from: Date;
  to: Date;
}) {
  'use cache';
  cacheTag(`user:${userId}:time-analytics`);
  
  const where: any = { userId };
  
  if (dateRange) {
    where.date = {
      gte: dateRange.from,
      lte: dateRange.to,
    };
  }
  
  const [
    totalHours,
    billableHours,
    totalRevenue,
    entriesByProject,
    entriesByStatus,
    dailyHours,
  ] = await Promise.all([
    // Total hours
    db.timeEntry.aggregate({
      where,
      _sum: { hours: true },
    }),
    
    // Billable hours
    db.timeEntry.aggregate({
      where: { ...where, billable: true },
      _sum: { hours: true },
    }),
    
    // Total revenue
    db.timeEntry.aggregate({
      where: { ...where, billable: true },
      _sum: { totalAmount: true },
    }),
    
    // Hours by project
    db.timeEntry.groupBy({
      by: ['projectId'],
      where,
      _sum: { hours: true, totalAmount: true },
      include: {
        project: {
          select: {
            name: true,
            client: {
              select: { name: true },
            },
          },
        },
      },
    }),
    
    // Entries by status
    db.timeEntry.groupBy({
      by: ['status'],
      where,
      _count: true,
      _sum: { hours: true },
    }),
    
    // Daily hours (last 30 days)
    db.timeEntry.groupBy({
      by: ['date'],
      where: {
        ...where,
        date: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      _sum: { hours: true },
      orderBy: { date: 'asc' },
    }),
  ]);
  
  const utilizationRate = totalHours._sum.hours 
    ? ((billableHours._sum.hours || 0) / totalHours._sum.hours) * 100 
    : 0;
    
  const averageHourlyRate = billableHours._sum.hours 
    ? (totalRevenue._sum.totalAmount || 0) / billableHours._sum.hours
    : 0;
  
  return {
    summary: {
      totalHours: totalHours._sum.hours || 0,
      billableHours: billableHours._sum.hours || 0,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      utilizationRate,
      averageHourlyRate,
    },
    breakdowns: {
      byProject: entriesByProject,
      byStatus: entriesByStatus,
      dailyTrend: dailyHours,
    },
  };
}

// Time Entry Templates
export async function getTimeEntryTemplates(userId: string) {
  'use cache';
  cacheTag(`user:${userId}:time-templates`);
  
  // Get common time entry patterns for quick entry
  return db.timeEntry.groupBy({
    by: ['description', 'hourlyRate'],
    where: { userId },
    _avg: { hours: true },
    _count: true,
    orderBy: { _count: { _all: 'desc' } },
    take: 10,
  });
}

// Project Time Summary
export async function getProjectTimeSupmary(projectId: string, userId: string) {
  'use cache';
  cacheTag(`user:${userId}:project:${projectId}:time-summary`);
  
  const [summary, recentEntries] = await Promise.all([
    db.timeEntry.aggregate({
      where: { projectId, userId },
      _sum: { hours: true, totalAmount: true },
      _count: true,
    }),
    
    db.timeEntry.findMany({
      where: { projectId, userId },
      include: {
        task: true,
      },
      orderBy: { date: 'desc' },
      take: 5,
    }),
  ]);
  
  return {
    totalHours: summary._sum.hours || 0,
    totalRevenue: summary._sum.totalAmount || 0,
    entryCount: summary._count,
    recentEntries,
  };
}