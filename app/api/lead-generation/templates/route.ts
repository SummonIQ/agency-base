import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { outreachTemplateEngine, EMAIL_TEMPLATES } from '@/lib/lead-generation/outreach-templates';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as 'email' | 'linkedin' | null;
    const industry = searchParams.get('industry');
    const companySize = searchParams.get('companySize');
    const useCase = searchParams.get('useCase');

    // Get built-in templates
    const builtInTemplates = outreachTemplateEngine.getTemplates({
      type: type || undefined,
      industry: industry || undefined,
      companySize: companySize || undefined,
      useCase: useCase || undefined
    });

    // Get user custom templates
    const customTemplates = await db.outreachTemplate.findMany({
      where: {
        userId: session.user.id,
        ...(type && { type })
      },
      orderBy: {
        responseRate: 'desc'
      }
    });

    return NextResponse.json({
      builtIn: builtInTemplates,
      custom: customTemplates,
      total: builtInTemplates.length + customTemplates.length
    });
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      type,
      subject,
      content,
      variables = []
    } = body;

    // Create custom template
    const template = await db.outreachTemplate.create({
      data: {
        userId: session.user.id,
        name,
        type,
        subject,
        content,
        variables: variables
      }
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Failed to create template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, subject, content, variables } = body;

    // Update custom template
    const template = await db.outreachTemplate.update({
      where: {
        id,
        userId: session.user.id
      },
      data: {
        ...(name && { name }),
        ...(subject && { subject }),
        ...(content && { content }),
        ...(variables && { variables })
      }
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Failed to update template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID required' },
        { status: 400 }
      );
    }

    // Delete custom template
    await db.outreachTemplate.delete({
      where: {
        id,
        userId: session.user.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}