import { auth } from '@/lib/auth/server';
import { updateContract } from '@/lib/contracts';
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
    const contract = await updateContract(params.id, session.user.id, {
      status: 'SENT',
    });
    return Response.json(contract);
  } catch (error) {
    console.error('Error sending contract:', error);
    return Response.json(
      { error: 'Failed to send contract' },
      { status: 500 }
    );
  }
}