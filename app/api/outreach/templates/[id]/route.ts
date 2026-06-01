import { auth } from '@/lib/auth/server';
import { 
  getOutreachTemplate, 
  updateOutreachTemplate, 
  deleteOutreachTemplate 
} from '@/lib/outreach';
import { headers } from 'next/headers';

export async function GET(
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
    const template = await getOutreachTemplate(params.id, session.user.id);
    
    if (!template) {
      return Response.json({ error: 'Template not found' }, { status: 404 });
    }

    return Response.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    return Response.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    
    const template = await updateOutreachTemplate(
      params.id,
      session.user.id,
      {
        name: data.name,
        type: data.type,
        subject: data.subject,
        content: data.content,
        variables: data.variables,
      }
    );

    return Response.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    return Response.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

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
    await deleteOutreachTemplate(params.id, session.user.id);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return Response.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}