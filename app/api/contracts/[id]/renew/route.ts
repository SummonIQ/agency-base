import { auth } from '@/lib/auth/server';
import { renewContract } from '@/lib/contracts';
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
    const contract = await renewContract(params.id, session.user.id, body);
    return Response.json(contract);
  } catch (error) {
    console.error('Error renewing contract:', error);
    return Response.json(
      { error: 'Failed to renew contract' },
      { status: 500 }
    );
  }
}