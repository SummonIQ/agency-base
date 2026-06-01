import { auth } from '@/lib/auth/server';
import { createContract, generateContractNumber, updateContract } from '@/lib/contracts';
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
    
    // Generate contract number if not provided
    if (!body.contractNumber) {
      body.contractNumber = await generateContractNumber();
    }

    const contract = await createContract(session.user.id, body);
    return Response.json(contract);
  } catch (error) {
    console.error('Error creating contract:', error);
    return Response.json(
      { error: 'Failed to create contract' },
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
    
    const contract = await updateContract(id, session.user.id, updateData);
    return Response.json(contract);
  } catch (error) {
    console.error('Error updating contract:', error);
    return Response.json(
      { error: 'Failed to update contract' },
      { status: 500 }
    );
  }
}