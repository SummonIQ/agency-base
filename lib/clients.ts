import { db } from '@/lib/db';
import { ClientStatus } from '@prisma/client';

export interface CreateClientData {
  name: string;
  email: string;
  phone?: string;
  website?: string;
  industry?: string;
  status?: ClientStatus;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  notes?: string;
  userId: string;
}

export interface UpdateClientData {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  status?: ClientStatus;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  notes?: string;
}

export async function getClients(userId: string, filters: {
  status?: ClientStatus;
  industry?: string;
} = {}) {
  const where: any = { userId };

  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.industry) {
    where.industry = { contains: filters.industry, mode: 'insensitive' };
  }

  const clients = await db.client.findMany({
    where,
    include: {
      projects: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
      invoices: {
        select: {
          id: true,
          status: true,
          totalAmount: true,
          balanceDue: true,
        },
      },
      _count: {
        select: {
          projects: true,
          invoices: true,
          contacts: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return clients;
}

export async function getClient(id: string, userId: string) {
  const client = await db.client.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      projects: {
        include: {
          tasks: {
            select: {
              id: true,
              status: true,
            },
          },
          _count: {
            select: {
              tasks: true,
              milestones: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      invoices: {
        include: {
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      contacts: {
        orderBy: { isPrimary: 'desc' },
      },
      communications: {
        orderBy: { date: 'desc' },
        take: 10,
      },
      contracts: {
        orderBy: { startDate: 'desc' },
      },
      proposals: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return client;
}

export async function createClient(data: CreateClientData) {
  const client = await db.client.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      website: data.website,
      industry: data.industry,
      status: data.status || 'LEAD',
      company: data.company,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      postalCode: data.postalCode,
      notes: data.notes,
      userId: data.userId,
    },
    include: {
      projects: true,
      _count: {
        select: {
          projects: true,
          invoices: true,
          contacts: true,
        },
      },
    },
  });

  return client;
}

export async function updateClient(id: string, userId: string, updateData: UpdateClientData) {
  const client = await db.client.findFirst({
    where: { id, userId },
  });

  if (!client) {
    throw new Error('Client not found');
  }

  const updatedClient = await db.client.update({
    where: { id },
    data: updateData,
    include: {
      projects: true,
      _count: {
        select: {
          projects: true,
          invoices: true,
          contacts: true,
        },
      },
    },
  });

  return updatedClient;
}

export async function deleteClient(id: string, userId: string) {
  const client = await db.client.findFirst({
    where: { id, userId },
  });

  if (!client) {
    throw new Error('Client not found');
  }

  // Check if client has any projects
  const hasProjects = await db.project.count({
    where: { clientId: id },
  });

  if (hasProjects > 0) {
    throw new Error('Cannot delete client with projects. Please delete or reassign projects first.');
  }

  // Check if client has any invoices
  const hasInvoices = await db.invoice.count({
    where: { clientId: id },
  });

  if (hasInvoices > 0) {
    throw new Error('Cannot delete client with invoices. Please delete invoices first.');
  }

  await db.client.delete({
    where: { id },
  });

  return { success: true };
}

export async function getClientStats(userId: string) {
  const clients = await db.client.findMany({
    where: { userId },
    select: {
      status: true,
      projects: {
        select: {
          budgetAmount: true,
          status: true,
        },
      },
      invoices: {
        select: {
          totalAmount: true,
          amountPaid: true,
          status: true,
        },
      },
    },
  });

  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === 'ACTIVE').length,
    prospects: clients.filter(c => c.status === 'PROSPECT').length,
    leads: clients.filter(c => c.status === 'LEAD').length,
    totalRevenue: clients.reduce((sum, client) =>
      sum + client.invoices.reduce((invSum, inv) => invSum + inv.amountPaid, 0), 0
    ),
    totalOutstanding: clients.reduce((sum, client) =>
      sum + client.invoices
        .filter(inv => inv.status !== 'PAID' && inv.status !== 'CANCELLED')
        .reduce((invSum, inv) => invSum + (inv.totalAmount - inv.amountPaid), 0), 0
    ),
  };

  return stats;
}