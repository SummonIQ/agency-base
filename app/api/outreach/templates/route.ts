import { auth } from '@/lib/auth/server';
import { createOutreachTemplate, getOutreachTemplates } from '@/lib/outreach';
import { headers } from 'next/headers';

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const templates = await getOutreachTemplates(session.user.id);
    return Response.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return Response.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    const template = await createOutreachTemplate({
      name: data.name,
      type: data.type,
      subject: data.subject,
      content: data.content,
      variables: data.variables,
      userId: session.user.id,
    });

    return Response.json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    return Response.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}