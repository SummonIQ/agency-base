import { auth } from '@/lib/auth/server';
import { 
  getInvoice, 
  updateInvoice, 
  deleteInvoice 
} from '@/lib/invoicing';
import { headers } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const invoice = await getInvoice(params.id, session.user.id);
    
    if (!invoice) {
      return Response.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return Response.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return Response.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    const updateData: any = {};
    if (data.clientId !== undefined) updateData.clientId = data.clientId;
    if (data.projectId !== undefined) updateData.projectId = data.projectId;
    if (data.issueDate !== undefined) updateData.issueDate = new Date(data.issueDate);
    if (data.dueDate !== undefined) updateData.dueDate = new Date(data.dueDate);
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.items !== undefined) updateData.items = data.items;
    if (data.taxRate !== undefined) updateData.taxRate = data.taxRate;
    if (data.discount !== undefined) updateData.discount = data.discount;
    if (data.status !== undefined) updateData.status = data.status;
    
    const invoice = await updateInvoice(params.id, session.user.id, updateData);

    return Response.json(invoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return Response.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await deleteInvoice(params.id, session.user.id);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return Response.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}