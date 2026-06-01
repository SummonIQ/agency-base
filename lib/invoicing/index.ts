'use cache';

import { db } from '@/lib/db';
import { cacheTag, revalidateTag } from 'next/cache';
import { InvoiceStatus } from '@prisma/client';

export type CreateInvoiceData = {
  clientId: string;
  projectId?: string;
  issueDate: Date;
  dueDate: Date;
  notes?: string;
  userId: string;
  items: {
    description: string;
    quantity: number;
    rate: number;
  }[];
  taxRate?: number;
  discount?: number;
};

export type UpdateInvoiceData = Partial<Omit<CreateInvoiceData, 'userId' | 'items'>> & {
  status?: InvoiceStatus;
  items?: {
    id?: string;
    description: string;
    quantity: number;
    rate: number;
  }[];
};

export type InvoiceFilters = {
  clientId?: string;
  projectId?: string;
  status?: InvoiceStatus;
  dateFrom?: Date;
  dateTo?: Date;
  overdue?: boolean;
};

// Invoice Management
export async function getInvoices(userId: string, filters?: InvoiceFilters) {
  'use cache';
  cacheTag(`user:${userId}:invoices`);
  
  const where: any = { userId };
  
  if (filters?.clientId) where.clientId = filters.clientId;
  if (filters?.projectId) where.projectId = filters.projectId;
  if (filters?.status) where.status = filters.status;
  
  if (filters?.dateFrom || filters?.dateTo) {
    where.issueDate = {};
    if (filters.dateFrom) where.issueDate.gte = filters.dateFrom;
    if (filters.dateTo) where.issueDate.lte = filters.dateTo;
  }
  
  if (filters?.overdue) {
    where.status = { in: [InvoiceStatus.SENT, InvoiceStatus.VIEWED] };
    where.dueDate = { lt: new Date() };
  }
  
  return db.invoice.findMany({
    where,
    include: {
      client: true,
      project: true,
      items: true,
      payments: true,
    },
    orderBy: [
      { issueDate: 'desc' },
      { createdAt: 'desc' },
    ],
  });
}

export async function getInvoice(id: string, userId: string) {
  'use cache';
  cacheTag(`user:${userId}:invoice:${id}`);
  
  return db.invoice.findFirst({
    where: { id, userId },
    include: {
      client: true,
      project: true,
      items: true,
      payments: {
        orderBy: { paymentDate: 'desc' },
      },
    },
  });
}

export async function createInvoice(data: CreateInvoiceData) {
  // Calculate totals
  const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const taxAmount = subtotal * (data.taxRate || 0) / 100;
  const totalAmount = subtotal + taxAmount - (data.discount || 0);
  
  // Generate invoice number
  const invoiceNumber = await generateInvoiceNumber(data.userId);
  
  const invoice = await db.invoice.create({
    data: {
      invoiceNumber,
      clientId: data.clientId,
      projectId: data.projectId,
      userId: data.userId,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      notes: data.notes,
      subtotal,
      taxRate: data.taxRate || 0,
      taxAmount,
      discount: data.discount || 0,
      totalAmount,
      items: {
        create: data.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.quantity * item.rate,
        })),
      },
    },
    include: {
      client: true,
      project: true,
      items: true,
    },
  });
  
  revalidateTag(`user:${data.userId}:invoices`);
  return invoice;
}

export async function updateInvoice(id: string, userId: string, data: UpdateInvoiceData) {
  const updateData: any = { ...data };
  
  // Recalculate totals if items changed
  if (data.items) {
    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const taxAmount = subtotal * (data.taxRate || 0) / 100;
    const totalAmount = subtotal + taxAmount - (data.discount || 0);
    
    updateData.subtotal = subtotal;
    updateData.taxAmount = taxAmount;
    updateData.totalAmount = totalAmount;
  }
  
  const invoice = await db.invoice.update({
    where: { id, userId },
    data: {
      ...updateData,
      items: data.items ? {
        deleteMany: {},
        create: data.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.quantity * item.rate,
        })),
      } : undefined,
    },
    include: {
      client: true,
      project: true,
      items: true,
      payments: true,
    },
  });
  
  revalidateTag(`user:${userId}:invoices`);
  revalidateTag(`user:${userId}:invoice:${id}`);
  
  return invoice;
}

export async function deleteInvoice(id: string, userId: string) {
  await db.invoice.delete({
    where: { id, userId },
  });
  
  revalidateTag(`user:${userId}:invoices`);
  revalidateTag(`user:${userId}:invoice:${id}`);
}

export async function sendInvoice(id: string, userId: string) {
  const invoice = await db.invoice.update({
    where: { id, userId },
    data: { 
      status: InvoiceStatus.SENT,
      sentAt: new Date(),
    },
  });
  
  revalidateTag(`user:${userId}:invoices`);
  revalidateTag(`user:${userId}:invoice:${id}`);
  
  return invoice;
}

export async function markInvoiceViewed(id: string, userId: string) {
  const invoice = await db.invoice.update({
    where: { id, userId },
    data: { 
      status: InvoiceStatus.VIEWED,
      viewedAt: new Date(),
    },
  });
  
  revalidateTag(`user:${userId}:invoices`);
  revalidateTag(`user:${userId}:invoice:${id}`);
  
  return invoice;
}

// Payment Management
export async function addPayment(invoiceId: string, userId: string, data: {
  amount: number;
  paymentDate: Date;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
}) {
  const payment = await db.payment.create({
    data: {
      ...data,
      invoiceId,
    },
  });
  
  // Check if invoice is fully paid
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true },
  });
  
  if (invoice) {
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    
    if (totalPaid >= invoice.totalAmount) {
      await db.invoice.update({
        where: { id: invoiceId },
        data: { 
          status: InvoiceStatus.PAID,
          paidAt: new Date(),
        },
      });
    }
  }
  
  revalidateTag(`user:${userId}:invoices`);
  revalidateTag(`user:${userId}:invoice:${invoiceId}`);
  
  return payment;
}

// Invoice from Time Entries
export async function createInvoiceFromTimeEntries(
  timeEntryIds: string[],
  userId: string,
  data: {
    clientId: string;
    projectId?: string;
    issueDate: Date;
    dueDate: Date;
    notes?: string;
    taxRate?: number;
    discount?: number;
  }
) {
  // Get approved time entries
  const timeEntries = await db.timeEntry.findMany({
    where: {
      id: { in: timeEntryIds },
      userId,
      status: 'APPROVED',
      billable: true,
    },
    include: {
      project: true,
      task: true,
    },
  });
  
  if (timeEntries.length === 0) {
    throw new Error('No valid time entries found');
  }
  
  // Group entries by description/rate for invoice items
  const itemsMap = new Map<string, { description: string; quantity: number; rate: number; }>();
  
  timeEntries.forEach(entry => {
    const key = `${entry.description}-${entry.hourlyRate}`;
    const existing = itemsMap.get(key);
    
    if (existing) {
      existing.quantity += entry.hours;
    } else {
      itemsMap.set(key, {
        description: entry.description,
        quantity: entry.hours,
        rate: entry.hourlyRate || 0,
      });
    }
  });
  
  const items = Array.from(itemsMap.values());
  
  // Create invoice
  const invoice = await createInvoice({
    ...data,
    userId,
    items,
  });
  
  // Mark time entries as invoiced
  await db.timeEntry.updateMany({
    where: { id: { in: timeEntryIds } },
    data: { status: 'INVOICED' },
  });
  
  revalidateTag(`user:${userId}:time-entries`);
  return invoice;
}

// Invoice Analytics
export async function getInvoicingAnalytics(userId: string, dateRange?: {
  from: Date;
  to: Date;
}) {
  'use cache';
  cacheTag(`user:${userId}:invoicing-analytics`);
  
  const where: any = { userId };
  
  if (dateRange) {
    where.issueDate = {
      gte: dateRange.from,
      lte: dateRange.to,
    };
  }
  
  const [
    totalInvoices,
    paidInvoices,
    totalRevenue,
    outstandingAmount,
    overdueInvoices,
    invoicesByStatus,
    monthlyTrend,
    topClients,
  ] = await Promise.all([
    // Total invoices
    db.invoice.count({ where }),
    
    // Paid invoices
    db.invoice.count({ where: { ...where, status: InvoiceStatus.PAID } }),
    
    // Total revenue
    db.invoice.aggregate({
      where: { ...where, status: InvoiceStatus.PAID },
      _sum: { totalAmount: true },
    }),
    
    // Outstanding amount
    db.invoice.aggregate({
      where: { 
        ...where, 
        status: { in: [InvoiceStatus.SENT, InvoiceStatus.VIEWED] }
      },
      _sum: { totalAmount: true },
    }),
    
    // Overdue invoices
    db.invoice.count({
      where: {
        ...where,
        status: { in: [InvoiceStatus.SENT, InvoiceStatus.VIEWED] },
        dueDate: { lt: new Date() },
      },
    }),
    
    // Invoices by status
    db.invoice.groupBy({
      by: ['status'],
      where,
      _count: true,
      _sum: { totalAmount: true },
    }),
    
    // Monthly revenue trend
    db.invoice.groupBy({
      by: ['issueDate'],
      where: { ...where, status: InvoiceStatus.PAID },
      _sum: { totalAmount: true },
      _count: true,
    }),
    
    // Top clients by revenue
    db.invoice.groupBy({
      by: ['clientId'],
      where: { ...where, status: InvoiceStatus.PAID },
      _sum: { totalAmount: true },
      _count: true,
      orderBy: { _sum: { totalAmount: 'desc' } },
      take: 5,
    }),
  ]);
  
  const collectionRate = totalInvoices > 0 
    ? (paidInvoices / totalInvoices) * 100 
    : 0;
    
  const averageInvoiceValue = paidInvoices > 0 
    ? (totalRevenue._sum.totalAmount || 0) / paidInvoices
    : 0;
  
  return {
    summary: {
      totalInvoices,
      paidInvoices,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      outstandingAmount: outstandingAmount._sum.totalAmount || 0,
      overdueInvoices,
      collectionRate,
      averageInvoiceValue,
    },
    breakdowns: {
      byStatus: invoicesByStatus,
      monthlyTrend,
      topClients,
    },
  };
}

// Utility Functions
async function generateInvoiceNumber(userId: string): Promise<string> {
  const year = new Date().getFullYear();
  const lastInvoice = await db.invoice.findFirst({
    where: { 
      userId,
      invoiceNumber: { startsWith: `INV-${year}-` },
    },
    orderBy: { invoiceNumber: 'desc' },
  });
  
  let nextNumber = 1;
  if (lastInvoice) {
    const parts = lastInvoice.invoiceNumber.split('-');
    const lastNumber = parseInt(parts[2]) || 0;
    nextNumber = lastNumber + 1;
  }
  
  return `INV-${year}-${nextNumber.toString().padStart(4, '0')}`;
}

export async function getInvoiceShareUrl(invoiceId: string, baseUrl?: string): Promise<string> {
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    select: { shareToken: true },
  });
  
  if (!invoice?.shareToken) {
    // Generate share token if it doesn't exist
    const shareToken = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    await db.invoice.update({
      where: { id: invoiceId },
      data: { shareToken },
    });
    
    const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3030');
    return `${base}/shared/invoice/${shareToken}`;
  }
  
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3030');
  return `${base}/shared/invoice/${invoice.shareToken}`;
}