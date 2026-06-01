import { auth } from '@/lib/auth/server';
import { deletePortfolioProject } from '@/lib/portfolio';
import { headers } from 'next/headers';

export async function DELETE(
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
    await deletePortfolioProject(params.id, session.user.id);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting portfolio project:', error);
    return Response.json(
      { error: 'Failed to delete portfolio project' },
      { status: 500 }
    );
  }
}