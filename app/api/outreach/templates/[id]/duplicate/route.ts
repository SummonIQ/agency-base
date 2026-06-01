import { auth } from '@/lib/auth/server';
import { duplicateOutreachTemplate } from '@/lib/outreach';
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
    const data = await request.json();
    
    const template = await duplicateOutreachTemplate(
      params.id,
      session.user.id,
      data.newName
    );

    return Response.json(template);
  } catch (error) {
    console.error('Error duplicating template:', error);
    return Response.json(
      { error: 'Failed to duplicate template' },
      { status: 500 }
    );
  }
}