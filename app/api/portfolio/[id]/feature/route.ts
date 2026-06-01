import { auth } from '@/lib/auth/server';
import { togglePortfolioProjectFeatured } from '@/lib/portfolio';
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
    const project = await togglePortfolioProjectFeatured(params.id, session.user.id);
    return Response.json(project);
  } catch (error) {
    console.error('Error toggling featured status:', error);
    return Response.json(
      { error: 'Failed to toggle featured status' },
      { status: 500 }
    );
  }
}