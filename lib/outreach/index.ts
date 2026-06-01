import { db } from '@/lib/db';
import { cacheTag, revalidateTag } from 'next/cache';
import { CommunicationType } from '@prisma/client';

export type OutreachTemplateType = 
  | 'cold_email' 
  | 'follow_up' 
  | 'proposal_follow_up' 
  | 'linkedin_connect' 
  | 'linkedin_message' 
  | 'thank_you' 
  | 'check_in'
  | 'referral_request';

export type OutreachActivityType = 
  | 'email' 
  | 'linkedin' 
  | 'call' 
  | 'meeting' 
  | 'text' 
  | 'direct_mail';

export type OutreachStatus = 
  | 'scheduled' 
  | 'sent' 
  | 'delivered' 
  | 'opened' 
  | 'responded' 
  | 'ignored' 
  | 'bounced';

// Template management
export async function getOutreachTemplates(userId: string) {
  'use cache';
  cacheTag(`user:${userId}:outreach-templates`);
  
  return db.outreachTemplate.findMany({
    where: { userId },
    orderBy: [
      { type: 'asc' },
      { name: 'asc' },
    ],
  });
}

export async function getOutreachTemplate(id: string, userId: string) {
  'use cache';
  cacheTag(`user:${userId}:outreach-template:${id}`);
  
  return db.outreachTemplate.findFirst({
    where: { id, userId },
    include: {
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
}

export async function createOutreachTemplate(data: {
  name: string;
  type: OutreachTemplateType;
  subject?: string;
  content: string;
  variables?: string[];
  userId: string;
}) {
  const template = await db.outreachTemplate.create({
    data: {
      ...data,
      variables: data.variables || [],
    },
  });
  
  revalidateTag(`user:${data.userId}:outreach-templates`);
  return template;
}

export async function updateOutreachTemplate(
  id: string,
  userId: string,
  data: {
    name?: string;
    type?: OutreachTemplateType;
    subject?: string;
    content?: string;
    variables?: string[];
  }
) {
  const template = await db.outreachTemplate.update({
    where: { id, userId },
    data: {
      ...data,
      variables: data.variables || undefined,
    },
  });
  
  revalidateTag(`user:${userId}:outreach-templates`);
  revalidateTag(`user:${userId}:outreach-template:${id}`);
  return template;
}

export async function deleteOutreachTemplate(id: string, userId: string) {
  await db.outreachTemplate.delete({
    where: { id, userId },
  });
  
  revalidateTag(`user:${userId}:outreach-templates`);
  revalidateTag(`user:${userId}:outreach-template:${id}`);
}

export async function duplicateOutreachTemplate(id: string, userId: string, newName?: string) {
  const original = await db.outreachTemplate.findFirst({
    where: { id, userId },
  });
  
  if (!original) {
    throw new Error('Template not found');
  }
  
  const template = await db.outreachTemplate.create({
    data: {
      name: newName || `${original.name} (Copy)`,
      type: original.type,
      subject: original.subject,
      content: original.content,
      variables: original.variables,
      userId: original.userId,
    },
  });
  
  revalidateTag(`user:${userId}:outreach-templates`);
  return template;
}

// Activity management
export async function getOutreachActivities(userId: string, filters?: {
  status?: OutreachStatus;
  type?: OutreachActivityType;
  leadId?: string;
  clientId?: string;
  templateId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}) {
  'use cache';
  cacheTag(`user:${userId}:outreach-activities`);
  
  const where: any = {
    lead: { userId },
  };
  
  if (filters?.status) where.status = filters.status;
  if (filters?.type) where.type = filters.type;
  if (filters?.leadId) where.leadId = filters.leadId;
  if (filters?.templateId) where.templateId = filters.templateId;
  
  if (filters?.dateFrom || filters?.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
    if (filters.dateTo) where.createdAt.lte = filters.dateTo;
  }
  
  return db.outreachActivity.findMany({
    where,
    include: {
      template: true,
      lead: {
        include: {
          client: true,
        },
      },
    },
    orderBy: [
      { scheduledFor: 'asc' },
      { createdAt: 'desc' },
    ],
  });
}

export async function createOutreachActivity(data: {
  type: OutreachActivityType;
  leadId?: string;
  clientId?: string;
  templateId?: string;
  subject?: string;
  content?: string;
  scheduledFor?: Date;
  userId: string;
}) {
  const activity = await db.outreachActivity.create({
    data: {
      type: data.type,
      leadId: data.leadId,
      clientId: data.clientId,
      templateId: data.templateId,
      subject: data.subject,
      content: data.content,
      scheduledFor: data.scheduledFor,
      lead: data.leadId ? undefined : {
        create: {
          userId: data.userId,
          source: 'MANUAL',
          status: 'NEW',
          score: 0,
        },
      },
    },
    include: {
      template: true,
      lead: {
        include: {
          client: true,
        },
      },
    },
  });
  
  revalidateTag(`user:${data.userId}:outreach-activities`);
  return activity;
}

export async function updateOutreachActivityStatus(
  id: string,
  userId: string,
  status: OutreachStatus,
  metadata?: {
    sentAt?: Date;
    respondedAt?: Date;
    notes?: string;
  }
) {
  const activity = await db.outreachActivity.update({
    where: { 
      id,
      lead: { userId },
    },
    data: {
      status,
      sentAt: metadata?.sentAt,
      respondedAt: metadata?.respondedAt,
    },
  });
  
  // Update template performance metrics if this was sent
  if (status === 'sent' && activity.templateId) {
    await db.outreachTemplate.update({
      where: { id: activity.templateId },
      data: {
        timesSent: { increment: 1 },
      },
    });
  }
  
  // Update response rate if this was a response
  if (status === 'responded' && activity.templateId) {
    const template = await db.outreachTemplate.findUnique({
      where: { id: activity.templateId },
    });
    
    if (template) {
      const newResponseCount = template.responsesReceived + 1;
      const newResponseRate = template.timesSent > 0 
        ? (newResponseCount / template.timesSent) * 100 
        : 0;
      
      await db.outreachTemplate.update({
        where: { id: activity.templateId },
        data: {
          responsesReceived: newResponseCount,
          responseRate: newResponseRate,
        },
      });
    }
  }
  
  revalidateTag(`user:${userId}:outreach-activities`);
  revalidateTag(`user:${userId}:outreach-templates`);
  
  return activity;
}

// Campaign management
export async function createOutreachCampaign(data: {
  name: string;
  templateIds: string[];
  leadIds: string[];
  scheduleSettings: {
    startDate: Date;
    daysBetween: number;
    skipWeekends: boolean;
  };
  userId: string;
}) {
  const activities = [];
  
  for (const leadId of data.leadIds) {
    let currentDate = new Date(data.scheduleSettings.startDate);
    
    for (let i = 0; i < data.templateIds.length; i++) {
      const templateId = data.templateIds[i];
      
      // Skip weekends if requested
      if (data.scheduleSettings.skipWeekends) {
        while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
      
      const activity = await db.outreachActivity.create({
        data: {
          type: 'email',
          leadId,
          templateId,
          scheduledFor: new Date(currentDate),
          status: 'scheduled',
        },
      });
      
      activities.push(activity);
      
      // Add days between activities
      if (i < data.templateIds.length - 1) {
        currentDate.setDate(currentDate.getDate() + data.scheduleSettings.daysBetween);
      }
    }
  }
  
  revalidateTag(`user:${data.userId}:outreach-activities`);
  return activities;
}

// Analytics
export async function getOutreachAnalytics(userId: string, dateRange?: {
  from: Date;
  to: Date;
}) {
  'use cache';
  cacheTag(`user:${userId}:outreach-analytics`);
  
  const where: any = {
    lead: { userId },
  };
  
  if (dateRange) {
    where.createdAt = {
      gte: dateRange.from,
      lte: dateRange.to,
    };
  }
  
  const [
    totalActivities,
    sentActivities,
    respondedActivities,
    activitiesByType,
    activitiesByStatus,
    topTemplates,
  ] = await Promise.all([
    db.outreachActivity.count({ where }),
    db.outreachActivity.count({ where: { ...where, status: 'sent' } }),
    db.outreachActivity.count({ where: { ...where, status: 'responded' } }),
    db.outreachActivity.groupBy({
      by: ['type'],
      where,
      _count: true,
    }),
    db.outreachActivity.groupBy({
      by: ['status'],
      where,
      _count: true,
    }),
    db.outreachTemplate.findMany({
      where: { userId },
      orderBy: { responseRate: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        type: true,
        timesSent: true,
        responsesReceived: true,
        responseRate: true,
      },
    }),
  ]);
  
  const responseRate = sentActivities > 0 ? (respondedActivities / sentActivities) * 100 : 0;
  
  return {
    overview: {
      totalActivities,
      sentActivities,
      respondedActivities,
      responseRate,
    },
    breakdowns: {
      byType: activitiesByType,
      byStatus: activitiesByStatus,
    },
    topTemplates,
  };
}

// Template variable processing
export function processTemplateVariables(
  content: string,
  variables: Record<string, string>
): string {
  let processedContent = content;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processedContent = processedContent.replace(regex, value);
  });
  
  return processedContent;
}

export function extractTemplateVariables(content: string): string[] {
  const regex = /{{([^}]+)}}/g;
  const variables = [];
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }
  
  return variables;
}