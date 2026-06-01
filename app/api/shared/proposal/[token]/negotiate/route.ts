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

    if (!['SENT', 'VIEWED'].includes(proposal.status)) {
      return Response.json({ error: 'Cannot start negotiation' }, { status: 400 });
    }

    const updatedProposal = await db.proposal.update({
      where: { id: proposal.id },
      data: {
        status: 'NEGOTIATING',
        clientFeedback: body.feedback,
      },
    });

    return Response.json(updatedProposal);
  } catch (error) {
    console.error('Error starting negotiation:', error);
    return Response.json(
      { error: 'Failed to start negotiation' },
      { status: 500 }
    );
  }
}