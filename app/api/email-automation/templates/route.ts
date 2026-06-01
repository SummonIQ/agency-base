import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const createTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Content is required'),
  textContent: z.string().optional(),
  type: z.enum(['WELCOME', 'PROMOTIONAL', 'NEWSLETTER', 'TRANSACTIONAL', 'FOLLOW_UP']),
  variables: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');

    const where: any = {
      userId: session.user.id,
    };

    if (type) {
      where.type = type;
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const templates = await db.emailTemplate.findMany({
      where,
      orderBy: [
        { sentCount: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    // Calculate usage statistics
    const templatesWithStats = templates.map(template => ({
      ...template,
      stats: {
        usedCount: template.sentCount,
        lastUsed: template.updatedAt,
        openRate: template.sentCount > 0 ? (template.openCount / template.sentCount) * 100 : 0,
        clickRate: template.openCount > 0 ? (template.clickCount / template.openCount) * 100 : 0,
      },
    }));

    return NextResponse.json(templatesWithStats);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createTemplateSchema.parse(body);

    // Check if template with same name exists
    const existingTemplate = await db.emailTemplate.findFirst({
      where: {
        name: validatedData.name,
        userId: session.user.id,
      },
    });

    if (existingTemplate) {
      return NextResponse.json(
        { error: 'Template with this name already exists' },
        { status: 400 }
      );
    }

    const template = await db.emailTemplate.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}