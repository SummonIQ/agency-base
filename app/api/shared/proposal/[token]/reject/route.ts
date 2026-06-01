import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const body = await request.json();
    
    const proposal = await db.proposal.findFirst({
      where: { shareToken: params.token },
    });

    if (!proposal) {
      return Response.json({ error: 'Proposal not found' }, { status: 404 });
    }

    if (!['SENT', 'VIEWED', 'NEGOTIATING'].includes(proposal.status)) {
      return Response.json({ error: 'Proposal cannot be rejected' }, { status: 400 });
    }

    const updatedProposal = await db.proposal.update({
      where: { id: proposal.id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectionReason: body.reason || null,
        clientFeedback: body.reason || null,
      },
    });

    return Response.json(updatedProposal);
  } catch (error) {
    console.error('Error rejecting proposal:', error);
    return Response.json(
      { error: 'Failed to reject proposal' },
      { status: 500 }
    );
  }
}