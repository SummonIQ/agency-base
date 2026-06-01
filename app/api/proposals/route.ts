import { auth } from '@/lib/auth/server';
import { createProposal, updateProposal } from '@/lib/proposals';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const proposal = await createProposal(session.user.id, body);
    return Response.json(proposal);
  } catch (error) {
    console.error('Error creating proposal:', error);
    return Response.json(
      { error: 'Failed to create proposal' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    const proposal = await updateProposal(id, session.user.id, updateData);
    return Response.json(proposal);
  } catch (error) {
    console.error('Error updating proposal:', error);
    return Response.json(
      { error: 'Failed to update proposal' },
      { status: 500 }
    );
  }
}