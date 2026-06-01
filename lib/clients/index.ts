import { db } from '@/lib/db';
import { Client, ClientStatus, LeadSource, Prisma } from '@prisma/client';

export async function getClients(userId: string) {
  return db.client.findMany({
    where: { userId },
    include: {
      projects: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
      _count: {
        select: {
          projects: true,
          invoices: true,
          proposals: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getClient(id: string, userId: string) {
  return db.client.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      projects: true,
      invoices: true,
      proposals: true,
      contracts: true,
      leads: true,
      communications: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      contacts: true,
    },
  });
}

export async function createClient(
  userId: string,
  data: {
    name: string;
    email?: string;
    phone?: string;
    website?: string;
    industry?: string;
    status?: ClientStatus;
    source?: LeadSource;
    notes?: string;
    primaryContactName?: string;
    primaryContactEmail?: string;
    primaryContactPhone?: string;
    primaryContactRole?: string;
  }
) {
  return db.client.create({
    data: {
      ...data,
      userId,
    },
  });
}

export async function updateClient(
  id: string,
  userId: string,
  data: Prisma.ClientUpdateInput
) {
  return db.client.update({
    where: {
      id,
      userId,
    },
    data,
  });
}

export async function deleteClient(id: string, userId: string) {
  return db.client.delete({
    where: {
      id,
      userId,
    },
  });
}

export async function getClientStats(userId: string) {
  const [totalClients, activeClients, totalRevenue, activeProjects] = await Promise.all([
    db.client.count({ where: { userId } }),
    db.client.count({ where: { userId, status: 'ACTIVE' } }),
    db.client.aggregate({
      where: { userId },
      _sum: { totalRevenue: true },
    }),
    db.project.count({
      where: {
        userId,
        status: { in: ['ACTIVE', 'NEGOTIATING'] },
      },
    }),
  ]);

  return {
    totalClients,
    activeClients,
    totalRevenue: totalRevenue._sum.totalRevenue || 0,
    activeProjects,
  };
}