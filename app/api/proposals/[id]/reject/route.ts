import { auth } from '@/lib/auth/server';
import { rejectProposal } from '@/lib/proposals';
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
    const body = await request.json();
    const proposal = await rejectProposal(params.id, session.user.id, body.reason);
    return Response.json(proposal);
  } catch (error) {
    console.error('Error rejecting proposal:', error);
    return Response.json(
      { error: 'Failed to reject proposal' },
      { status: 500 }
    );
  }
}