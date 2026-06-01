import { db } from '@/lib/db';
import { LeadSource, LeadStatus, Prisma } from '@prisma/client';

export async function getAgencyLeads(userId: string) {
  return db.agencyLead.findMany({
    where: { userId },
    include: {
      client: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          proposals: true,
          communications: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAgencyLead(id: string, userId: string) {
  return db.agencyLead.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      client: true,
      proposals: true,
      communications: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
}

export async function createAgencyLead(
  userId: string,
  data: {
    title: string;
    description?: string;
    source: LeadSource;
    status?: LeadStatus;
    estimatedValue?: number;
    estimatedStartDate?: Date;
    estimatedDuration?: string;
    probability?: number;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    companyName?: string;
    clientId?: string;
  }
) {
  return db.agencyLead.create({
    data: {
      ...data,
      userId,
    },
  });
}

export async function updateAgencyLead(
  id: string,
  userId: string,
  data: Prisma.AgencyLeadUpdateInput
) {
  return db.agencyLead.update({
    where: {
      id,
      userId,
    },
    data,
  });
}

export async function deleteAgencyLead(id: string, userId: string) {
  return db.agencyLead.delete({
    where: {
      id,
      userId,
    },
  });
}

export async function convertLeadToClient(leadId: string, userId: string) {
  const lead = await db.agencyLead.findFirst({
    where: { id: leadId, userId },
  });

  if (!lead) {
    throw new Error('Lead not found');
  }

  // Create client from lead data
  const client = await db.client.create({
    data: {
      name: lead.companyName || lead.contactName || 'Unknown',
      email: lead.contactEmail,
      phone: lead.contactPhone,
      status: 'ACTIVE',
      source: lead.source,
      primaryContactName: lead.contactName,
      primaryContactEmail: lead.contactEmail,
      primaryContactPhone: lead.contactPhone,
      userId,
    },
  });

  // Update lead status and link to client
  await db.agencyLead.update({
    where: { id: leadId },
    data: {
      status: 'WON',
      wonDate: new Date(),
      clientId: client.id,
    },
  });

  return client;
}

export async function getLeadStats(userId: string) {
  const [totalLeads, qualifiedLeads, totalPipeline, conversionRate] = await Promise.all([
    db.agencyLead.count({ where: { userId } }),
    db.agencyLead.count({ 
      where: { 
        userId, 
        status: { in: ['QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATING'] } 
      } 
    }),
    db.agencyLead.aggregate({
      where: { 
        userId,
        status: { not: { in: ['LOST', 'WON'] } }
      },
      _sum: { estimatedValue: true },
    }),
    db.agencyLead.groupBy({
      by: ['status'],
      where: { userId },
      _count: true,
    }),
  ]);

  const wonCount = conversionRate.find(s => s.status === 'WON')?._count || 0;
  const totalClosed = conversionRate
    .filter(s => ['WON', 'LOST'].includes(s.status))
    .reduce((sum, s) => sum + s._count, 0);

  return {
    totalLeads,
    qualifiedLeads,
    totalPipeline: totalPipeline._sum.estimatedValue || 0,
    conversionRate: totalClosed > 0 ? (wonCount / totalClosed) * 100 : 0,
  };
}