import { auth } from '@/lib/auth/server';
import { createContractFromProposal } from '@/lib/proposals';
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
    const contract = await createContractFromProposal(params.id, session.user.id);
    return Response.json(contract);
  } catch (error) {
    console.error('Error creating contract from proposal:', error);
    return Response.json(
      { error: 'Failed to create contract' },
      { status: 500 }
    );
  }
}