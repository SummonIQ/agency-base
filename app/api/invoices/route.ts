import { auth } from '@/lib/auth/server';
import { createInvoice, getInvoices } from '@/lib/invoicing';
import { headers } from 'next/headers';

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const clientId = url.searchParams.get('clientId');
    const projectId = url.searchParams.get('projectId');
    const status = url.searchParams.get('status');
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');
    const overdue = url.searchParams.get('overdue');

    const filters: any = {};
    if (clientId) filters.clientId = clientId;
    if (projectId) filters.projectId = projectId;
    if (status) filters.status = status;
    if (dateFrom) filters.dateFrom = new Date(dateFrom);
    if (dateTo) filters.dateTo = new Date(dateTo);
    if (overdue === 'true') filters.overdue = true;

    const invoices = await getInvoices(session.user.id, filters);
    return Response.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return Response.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    const invoice = await createInvoice({
      clientId: data.clientId,
      projectId: data.projectId,
      issueDate: new Date(data.issueDate),
      dueDate: new Date(data.dueDate),
      notes: data.notes,
      items: data.items,
      taxRate: data.taxRate,
      discount: data.discount,
      userId: session.user.id,
    });

    return Response.json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    return Response.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}