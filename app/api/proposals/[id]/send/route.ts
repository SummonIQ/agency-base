import { auth } from '@/lib/auth/server';
import { sendProposal } from '@/lib/proposals';
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
    const proposal = await sendProposal(params.id, session.user.id);
    return Response.json(proposal);
  } catch (error) {
    console.error('Error sending proposal:', error);
    return Response.json(
      { error: 'Failed to send proposal' },
      { status: 500 }
    );
  }
}