import { auth } from '@/lib/auth/server';
import { sendInvoice } from '@/lib/invoicing';
import { headers } from 'next/headers';

export async function POST(
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
    const invoice = await sendInvoice(params.id, session.user.id);
    return Response.json(invoice);
  } catch (error) {
    console.error('Error sending invoice:', error);
    return Response.json(
      { error: 'Failed to send invoice' },
      { status: 500 }
    );
  }
}