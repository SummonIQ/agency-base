import { prisma } from '@/lib/db';
import { Invoice, InvoiceStatus, TimeEntryStatus, Prisma } from '@prisma/client';

export interface InvoiceWithRelations extends Invoice {
  client: {
    id: string;
    name: string;
    email: string | null;
    address: string | null;
  };
  project?: {
    id: string;
    name: string;
  } | null;
  invoiceItems: {
    id: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }[];
  timeEntries: {
    id: string;
    description: string;
    hours: number;
    date: Date;
    hourlyRate: number | null;
    totalAmount: number | null;
  }[];
  payments: {
    id: string;
    amount: number;
    paymentDate: Date;
    paymentMethod: string | null;
  }[];
}

// Generate a unique invoice number
async function generateInvoiceNumber(userId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count({
    where: {
      userId,
      invoiceNumber: {
        startsWith: `INV-${year}-`,
      },
    },
  });
  
  const nextNumber = (count + 1).toString().padStart(4, '0');
  return `INV-${year}-${nextNumber}`;
}

// Get all invoices for a user
export async function getInvoices(
  userId: string,
  filters?: {
    clientId?: string;
    projectId?: string;
    status?: InvoiceStatus;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<InvoiceWithRelations[]> {
  const where: Prisma.InvoiceWhereInput = {
    userId,
    ...(filters?.clientId && { clientId: filters.clientId }),
    ...(filters?.projectId && { projectId: filters.projectId }),
    ...(filters?.status && { status: filters.status }),
    ...((filters?.startDate || filters?.endDate) && {
      issueDate: {
        ...(filters?.startDate && { gte: filters.startDate }),
        ...(filters?.endDate && { lte: filters.endDate }),
      }
    }),
  };

  return prisma.invoice.findMany({
    where,
    include: {
      client: true,
      project: true,
      invoiceItems: true,
      timeEntries: true,
      payments: true,
    },
    orderBy: { issueDate: 'desc' },
  });
}

// Get a single invoice
export async function getInvoiceById(
  id: string,
  userId: string
): Promise<InvoiceWithRelations | null> {
  return prisma.invoice.findFirst({
    where: { id, userId },
    include: {
      client: true,
      project: true,
      invoiceItems: true,
      timeEntries: true,
      payments: true,
    },
  });
}

// Create invoice from time entries
export async function createInvoiceFromTimeEntries(
  userId: string,
  data: {
    clientId: string;
    projectId?: string;
    timeEntryIds: string[];
    issueDate?: Date;
    dueDate?: Date;
    taxRate?: number;
    discount?: number;
    notes?: string;
    terms?: string;
  }
): Promise<Invoice> {
  // Get time entries to calculate totals
  const timeEntries = await prisma.timeEntry.findMany({
    where: {
      id: { in: data.timeEntryIds },
      userId,
      status: TimeEntryStatus.APPROVED,
      billable: true,
      invoiceId: null, // Not already invoiced
    },
  });

  if (timeEntries.length === 0) {
    throw new Error('No eligible time entries found for invoicing');
  }

  // Calculate totals
  const subtotal = timeEntries.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);
  const taxRate = data.taxRate || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const discount = data.discount || 0;
  const totalAmount = subtotal + taxAmount - discount;

  // Generate invoice number
  const invoiceNumber = await generateInvoiceNumber(userId);

  // Create the invoice and link time entries in a transaction
  return prisma.$transaction(async (tx) => {
    // Create invoice
    const invoice = await tx.invoice.create({
      data: {
        invoiceNumber,
        status: InvoiceStatus.DRAFT,
        issueDate: data.issueDate || new Date(),
        dueDate: data.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        subtotal,
        taxRate,
        taxAmount,
        discount,
        totalAmount,
        amountPaid: 0,
        balanceDue: totalAmount,
        notes: data.notes,
        terms: data.terms || 'Net 30',
        clientId: data.clientId,
        projectId: data.projectId,
        userId,
      },
    });

    // Update time entries to link to invoice
    await tx.timeEntry.updateMany({
      where: {
        id: { in: data.timeEntryIds },
      },
      data: {
        invoiceId: invoice.id,
        status: TimeEntryStatus.INVOICED,
      },
    });

    // Create invoice items from time entries
    const invoiceItems = timeEntries.map((entry) => ({
      invoiceId: invoice.id,
      description: entry.description,
      quantity: entry.hours,
      rate: entry.hourlyRate || 0,
      amount: entry.totalAmount || 0,
    }));

    await tx.invoiceItem.createMany({
      data: invoiceItems,
    });

    return invoice;
  });
}

// Create manual invoice
export async function createManualInvoice(
  userId: string,
  data: {
    clientId: string;
    projectId?: string;
    issueDate?: Date;
    dueDate?: Date;
    taxRate?: number;
    discount?: number;
    notes?: string;
    terms?: string;
    items: {
      description: string;
      quantity: number;
      rate: number;
    }[];
  }
): Promise<Invoice> {
  // Calculate totals from items
  const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const taxRate = data.taxRate || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const discount = data.discount || 0;
  const totalAmount = subtotal + taxAmount - discount;

  // Generate invoice number
  const invoiceNumber = await generateInvoiceNumber(userId);

  // Create invoice with items
  return prisma.invoice.create({
    data: {
      invoiceNumber,
      status: InvoiceStatus.DRAFT,
      issueDate: data.issueDate || new Date(),
      dueDate: data.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      subtotal,
      taxRate,
      taxAmount,
      discount,
      totalAmount,
      amountPaid: 0,
      balanceDue: totalAmount,
      notes: data.notes,
      terms: data.terms || 'Net 30',
      clientId: data.clientId,
      projectId: data.projectId,
      userId,
      invoiceItems: {
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
      invoiceItems: true,
    },
  });
}

// Update invoice status
export async function updateInvoiceStatus(
  id: string,
  userId: string,
  status: InvoiceStatus
): Promise<Invoice> {
  const updateData: Prisma.InvoiceUpdateInput = { status };

  // If marking as paid, update the paid date
  if (status === InvoiceStatus.PAID) {
    const invoice = await prisma.invoice.findFirst({
      where: { id, userId },
    });
    
    if (invoice) {
      updateData.paidAt = new Date();
      updateData.amountPaid = invoice.totalAmount;
      updateData.balanceDue = 0;
    }
  }

  return prisma.invoice.update({
    where: { id },
    data: updateData,
  });
}

// Record a payment
export async function recordPayment(
  invoiceId: string,
  userId: string,
  data: {
    amount: number;
    paymentDate?: Date;
    paymentMethod?: string;
    transactionId?: string;
    notes?: string;
  }
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Create payment record
    await tx.payment.create({
      data: {
        amount: data.amount,
        paymentDate: data.paymentDate || new Date(),
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId,
        notes: data.notes,
        invoiceId,
      },
    });

    // Update invoice amounts
    const invoice = await tx.invoice.findFirst({
      where: { id: invoiceId, userId },
    });

    if (invoice) {
      const newAmountPaid = invoice.amountPaid + data.amount;
      const newBalanceDue = invoice.totalAmount - newAmountPaid;
      
      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          amountPaid: newAmountPaid,
          balanceDue: newBalanceDue,
          status: newBalanceDue <= 0 ? InvoiceStatus.PAID : invoice.status,
          paidAt: newBalanceDue <= 0 ? new Date() : null,
        },
      });
    }
  });
}

// Get invoice statistics
export async function getInvoiceStats(
  userId: string,
  filters?: {
    startDate?: Date;
    endDate?: Date;
  }
) {
  const where: Prisma.InvoiceWhereInput = {
    userId,
    ...((filters?.startDate || filters?.endDate) && {
      issueDate: {
        ...(filters?.startDate && { gte: filters.startDate }),
        ...(filters?.endDate && { lte: filters.endDate }),
      }
    }),
  };

  const [totalInvoiced, totalPaid, totalPending, overdueInvoices] = await Promise.all([
    // Total invoiced amount
    prisma.invoice.aggregate({
      where,
      _sum: { totalAmount: true },
    }),
    // Total paid amount
    prisma.invoice.aggregate({
      where: { ...where, status: InvoiceStatus.PAID },
      _sum: { totalAmount: true },
    }),
    // Total pending amount
    prisma.invoice.aggregate({
      where: { 
        ...where, 
        status: { in: [InvoiceStatus.SENT, InvoiceStatus.VIEWED] },
      },
      _sum: { balanceDue: true },
    }),
    // Overdue invoices
    prisma.invoice.count({
      where: {
        ...where,
        status: { in: [InvoiceStatus.SENT, InvoiceStatus.VIEWED] },
        dueDate: { lt: new Date() },
      },
    }),
  ]);

  return {
    totalInvoiced: totalInvoiced._sum.totalAmount || 0,
    totalPaid: totalPaid._sum.totalAmount || 0,
    totalPending: totalPending._sum.balanceDue || 0,
    overdueCount: overdueInvoices,
  };
}

// Delete invoice (only if draft)
export async function deleteInvoice(
  id: string,
  userId: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Check if invoice is draft
    const invoice = await tx.invoice.findFirst({
      where: { id, userId, status: InvoiceStatus.DRAFT },
    });

    if (!invoice) {
      throw new Error('Invoice not found or cannot be deleted');
    }

    // Unlink time entries
    await tx.timeEntry.updateMany({
      where: { invoiceId: id },
      data: { 
        invoiceId: null,
        status: TimeEntryStatus.APPROVED,
      },
    });

    // Delete invoice (will cascade delete items and payments)
    await tx.invoice.delete({
      where: { id },
    });
  });
}