import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { addPayment } from '@/lib/invoicing';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { amount, paymentDate, paymentMethod, transactionId, notes } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid payment amount is required' },
        { status: 400 }
      );
    }

    const payment = await addPayment(params.id, session.user.id, {
      amount: parseFloat(amount),
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      paymentMethod,
      transactionId,
      notes,
    });

    return NextResponse.json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error('Error adding payment:', error);
    const message = error instanceof Error ? error.message : 'Failed to add payment';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}