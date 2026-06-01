import { auth } from '@/lib/auth/server';
import { createPortfolioProject, updatePortfolioProject } from '@/lib/portfolio';
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
    const project = await createPortfolioProject(session.user.id, body);
    return Response.json(project);
  } catch (error) {
    console.error('Error creating portfolio project:', error);
    return Response.json(
      { error: 'Failed to create portfolio project' },
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
    
    const project = await updatePortfolioProject(id, session.user.id, updateData);
    return Response.json(project);
  } catch (error) {
    console.error('Error updating portfolio project:', error);
    return Response.json(
      { error: 'Failed to update portfolio project' },
      { status: 500 }
    );
  }
}