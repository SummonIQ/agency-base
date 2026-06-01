import { db } from '@/lib/db';
import { InvoiceStatus } from '@prisma/client';

export interface CreateInvoiceData {
  clientId: string;
  projectId?: string;
  issueDate: Date;
  dueDate: Date;
  notes?: string;
  terms?: string;
  items: InvoiceItemData[];
  taxRate?: number;
  discount?: number;
  userId: string;
}

export interface InvoiceItemData {
  description: string;
  quantity: number;
  rate: number;
}

export interface InvoiceFilters {
  clientId?: string;
  projectId?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  overdue?: boolean;
}

export async function createInvoice(data: CreateInvoiceData) {
  // Generate invoice number
  const lastInvoice = await db.invoice.findFirst({
    where: { userId: data.userId },
    orderBy: { createdAt: 'desc' },
    select: { invoiceNumber: true },
  });

  let nextNumber = 1;
  if (lastInvoice?.invoiceNumber) {
    const match = lastInvoice.invoiceNumber.match(/INV-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }

  const invoiceNumber = `INV-${nextNumber.toString().padStart(4, '0')}`;

  // Calculate totals
  const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const taxAmount = subtotal * ((data.taxRate || 0) / 100);
  const totalAmount = subtotal + taxAmount - (data.discount || 0);
  const balanceDue = totalAmount;

  // Create invoice with items
  const invoice = await db.invoice.create({
    data: {
      invoiceNumber,
      clientId: data.clientId,
      projectId: data.projectId,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      subtotal,
      taxRate: data.taxRate || 0,
      taxAmount,
      discount: data.discount || 0,
      totalAmount,
      balanceDue,
      notes: data.notes,
      terms: data.terms,
      userId: data.userId,
      invoiceItems: {
        create: data.items.map((item) => ({
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
      invoiceItems: true,
      payments: true,
    },
  });

  return invoice;
}

export async function getInvoices(userId: string, filters: InvoiceFilters = {}) {
  const where: any = { userId };

  if (filters.clientId) {
    where.clientId = filters.clientId;
  }

  if (filters.projectId) {
    where.projectId = filters.projectId;
  }

  if (filters.status) {
    where.status = filters.status as InvoiceStatus;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.issueDate = {};
    if (filters.dateFrom) {
      where.issueDate.gte = filters.dateFrom;
    }
    if (filters.dateTo) {
      where.issueDate.lte = filters.dateTo;
    }
  }

  if (filters.overdue) {
    where.dueDate = {
      lt: new Date(),
    };
    where.status = {
      in: ['SENT', 'VIEWED'],
    };
  }

  const invoices = await db.invoice.findMany({
    where,
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      invoiceItems: true,
      payments: true,
      _count: {
        select: {
          invoiceItems: true,
          payments: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return invoices;
}

export async function getInvoice(id: string, userId: string) {
  const invoice = await db.invoice.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      client: true,
      project: true,
      contract: true,
      invoiceItems: true,
      payments: {
        orderBy: { paymentDate: 'desc' },
      },
      timeEntries: {
        include: {
          task: true,
        },
      },
    },
  });

  return invoice;
}

export async function updateInvoiceStatus(id: string, userId: string, status: InvoiceStatus) {
  const invoice = await db.invoice.findFirst({
    where: { id, userId },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  const updatedInvoice = await db.invoice.update({
    where: { id },
    data: {
      status,
      ...(status === 'PAID' && { paidAt: new Date() }),
    },
    include: {
      client: true,
      project: true,
      invoiceItems: true,
      payments: true,
    },
  });

  return updatedInvoice;
}

export async function updateInvoice(id: string, userId: string, updateData: {
  clientId?: string;
  projectId?: string;
  issueDate?: Date;
  dueDate?: Date;
  notes?: string;
  terms?: string;
  items?: InvoiceItemData[];
  taxRate?: number;
  discount?: number;
  status?: InvoiceStatus;
}) {
  const invoice = await db.invoice.findFirst({
    where: { id, userId },
    include: { invoiceItems: true },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // If invoice is not in draft, only allow status updates
  if (invoice.status !== 'DRAFT' && Object.keys(updateData).some(key => key !== 'status')) {
    throw new Error('Only draft invoices can be edited');
  }

  const updatePayload: any = {};

  // Copy basic fields
  if (updateData.clientId) updatePayload.clientId = updateData.clientId;
  if (updateData.projectId) updatePayload.projectId = updateData.projectId;
  if (updateData.issueDate) updatePayload.issueDate = updateData.issueDate;
  if (updateData.dueDate) updatePayload.dueDate = updateData.dueDate;
  if (updateData.notes !== undefined) updatePayload.notes = updateData.notes;
  if (updateData.terms !== undefined) updatePayload.terms = updateData.terms;
  if (updateData.status) updatePayload.status = updateData.status;

  // If items are provided, recalculate totals
  if (updateData.items) {
    const subtotal = updateData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const taxAmount = subtotal * ((updateData.taxRate || invoice.taxRate) / 100);
    const totalAmount = subtotal + taxAmount - (updateData.discount || invoice.discount);
    const balanceDue = totalAmount - invoice.amountPaid;

    updatePayload.subtotal = subtotal;
    updatePayload.taxRate = updateData.taxRate !== undefined ? updateData.taxRate : invoice.taxRate;
    updatePayload.taxAmount = taxAmount;
    updatePayload.discount = updateData.discount !== undefined ? updateData.discount : invoice.discount;
    updatePayload.totalAmount = totalAmount;
    updatePayload.balanceDue = Math.max(0, balanceDue);

    // Delete existing items and create new ones
    await db.invoiceItem.deleteMany({
      where: { invoiceId: id },
    });

    updatePayload.invoiceItems = {
      create: updateData.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.quantity * item.rate,
      })),
    };
  }

  // Handle status-related updates
  if (updateData.status === 'PAID') {
    updatePayload.paidAt = new Date();
  }

  const updatedInvoice = await db.invoice.update({
    where: { id },
    data: updatePayload,
    include: {
      client: true,
      project: true,
      invoiceItems: true,
      payments: true,
    },
  });

  return updatedInvoice;
}

export async function addPayment(invoiceId: string, userId: string, paymentData: {
  amount: number;
  paymentDate: Date;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
}) {
  // Verify invoice belongs to user
  const invoice = await db.invoice.findFirst({
    where: { id: invoiceId, userId },
    include: { payments: true },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // Create payment
  const payment = await db.payment.create({
    data: {
      ...paymentData,
      invoiceId,
    },
  });

  // Update invoice amounts
  const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0) + paymentData.amount;
  const balanceDue = invoice.totalAmount - totalPaid;

  // Update invoice status and amounts
  let status = invoice.status;
  if (balanceDue <= 0) {
    status = 'PAID';
  } else if (totalPaid > 0) {
    status = 'VIEWED'; // Partially paid
  }

  await db.invoice.update({
    where: { id: invoiceId },
    data: {
      amountPaid: totalPaid,
      balanceDue: Math.max(0, balanceDue),
      status,
      ...(status === 'PAID' && { paidAt: new Date() }),
    },
  });

  return payment;
}

export async function deleteInvoice(id: string, userId: string) {
  const invoice = await db.invoice.findFirst({
    where: { id, userId },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  if (invoice.status !== 'DRAFT') {
    throw new Error('Only draft invoices can be deleted');
  }

  await db.invoice.delete({
    where: { id },
  });

  return { success: true };
}

export async function duplicateInvoice(id: string, userId: string) {
  const originalInvoice = await db.invoice.findFirst({
    where: { id, userId },
    include: {
      invoiceItems: true,
    },
  });

  if (!originalInvoice) {
    throw new Error('Invoice not found');
  }

  // Generate new invoice number
  const lastInvoice = await db.invoice.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { invoiceNumber: true },
  });

  let nextNumber = 1;
  if (lastInvoice?.invoiceNumber) {
    const match = lastInvoice.invoiceNumber.match(/INV-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }

  const invoiceNumber = `INV-${nextNumber.toString().padStart(4, '0')}`;

  // Create duplicate invoice
  const duplicateInvoice = await db.invoice.create({
    data: {
      invoiceNumber,
      clientId: originalInvoice.clientId,
      projectId: originalInvoice.projectId,
      contractId: originalInvoice.contractId,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      subtotal: originalInvoice.subtotal,
      taxRate: originalInvoice.taxRate,
      taxAmount: originalInvoice.taxAmount,
      discount: originalInvoice.discount,
      totalAmount: originalInvoice.totalAmount,
      balanceDue: originalInvoice.totalAmount,
      notes: originalInvoice.notes,
      terms: originalInvoice.terms,
      status: 'DRAFT',
      userId,
      invoiceItems: {
        create: originalInvoice.invoiceItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
        })),
      },
    },
    include: {
      client: true,
      project: true,
      invoiceItems: true,
    },
  });

  return duplicateInvoice;
}

export function getInvoiceStats(invoices: any[]) {
  const stats = {
    total: invoices.length,
    draft: 0,
    sent: 0,
    viewed: 0,
    paid: 0,
    overdue: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0,
  };

  const now = new Date();

  for (const invoice of invoices) {
    stats.totalAmount += invoice.totalAmount;
    stats.paidAmount += invoice.amountPaid;
    stats.pendingAmount += invoice.balanceDue;

    switch (invoice.status) {
      case 'DRAFT':
        stats.draft++;
        break;
      case 'SENT':
        stats.sent++;
        if (new Date(invoice.dueDate) < now) {
          stats.overdue++;
          stats.overdueAmount += invoice.balanceDue;
        }
        break;
      case 'VIEWED':
        stats.viewed++;
        if (new Date(invoice.dueDate) < now) {
          stats.overdue++;
          stats.overdueAmount += invoice.balanceDue;
        }
        break;
      case 'PAID':
        stats.paid++;
        break;
    }
  }

  return stats;
}

export async function getInvoicingAnalytics(userId: string) {
  const invoices = await getInvoices(userId);

  const totalRevenue = invoices
    .filter(invoice => invoice.status === 'PAID')
    .reduce((sum, invoice) => sum + invoice.totalAmount, 0);

  const outstandingAmount = invoices
    .filter(invoice => ['SENT', 'VIEWED'].includes(invoice.status))
    .reduce((sum, invoice) => sum + invoice.balanceDue, 0);

  const paidInvoices = invoices.filter(invoice => invoice.status === 'PAID').length;
  const totalInvoices = invoices.filter(invoice => invoice.status !== 'DRAFT').length;
  const collectionRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;

  const overdueInvoices = invoices.filter(invoice => {
    if (!['SENT', 'VIEWED'].includes(invoice.status)) return false;
    return new Date(invoice.dueDate) < new Date();
  }).length;

  const averageInvoiceValue = invoices.length > 0
    ? invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0) / invoices.length
    : 0;

  return {
    summary: {
      totalRevenue,
      outstandingAmount,
      paidInvoices,
      overdueInvoices,
      collectionRate,
      averageInvoiceValue,
    },
    invoices
  };
}