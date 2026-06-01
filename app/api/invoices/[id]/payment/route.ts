import { auth } from '@/lib/auth/server';
import { addPayment } from '@/lib/invoicing';
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
    const data = await request.json();
    
    const payment = await addPayment(params.id, session.user.id, {
      amount: data.amount,
      paymentDate: new Date(data.paymentDate),
      paymentMethod: data.paymentMethod,
      transactionId: data.transactionId,
      notes: data.notes,
    });

    return Response.json(payment);
  } catch (error) {
    console.error('Error adding payment:', error);
    return Response.json(
      { error: 'Failed to add payment' },
      { status: 500 }
    );
  }
}