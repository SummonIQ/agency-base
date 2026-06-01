import { auth } from '@/lib/auth/server';
import { acceptProposal } from '@/lib/proposals';
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
    const proposal = await acceptProposal(params.id, session.user.id);
    return Response.json(proposal);
  } catch (error) {
    console.error('Error accepting proposal:', error);
    return Response.json(
      { error: 'Failed to accept proposal' },
      { status: 500 }
    );
  }
}