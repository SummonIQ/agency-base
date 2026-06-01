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

    if (proposal.status !== 'SENT' && proposal.status !== 'VIEWED' && proposal.status !== 'NEGOTIATING') {
      return Response.json({ error: 'Proposal cannot be accepted' }, { status: 400 });
    }

    // Check if expired
    if (new Date(proposal.validUntil) < new Date()) {
      return Response.json({ error: 'Proposal has expired' }, { status: 400 });
    }

    const updatedProposal = await db.proposal.update({
      where: { id: proposal.id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
        clientFeedback: body.feedback || null,
      },
    });

    return Response.json(updatedProposal);
  } catch (error) {
    console.error('Error accepting proposal:', error);
    return Response.json(
      { error: 'Failed to accept proposal' },
      { status: 500 }
    );
  }
}