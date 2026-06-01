import { auth } from '@/lib/auth/server';
import { signContract } from '@/lib/contracts';
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
    const contract = await signContract(params.id, session.user.id, body);
    return Response.json(contract);
  } catch (error) {
    console.error('Error signing contract:', error);
    return Response.json(
      { error: 'Failed to sign contract' },
      { status: 500 }
    );
  }
}