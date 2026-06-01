import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { databaseEmailService } from '@/lib/email/database-template-service';
import { EmailTemplateType } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as EmailTemplateType || undefined;
    const isActive = searchParams.get('active') === 'true' ? true : undefined;
    const search = searchParams.get('search') || undefined;

    const templates = await databaseEmailService.listTemplates(session.user.id, {
      type,
      isActive,
      search
    });

    return NextResponse.json({
      success: true,
      templates
    });

  } catch (error) {
    console.error('Templates API error:', error);
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
    const { action, data } = body;

    switch (action) {
      case 'create_template': {
        const { name, subject, content, textContent, type, variables } = data;

        if (!name || !subject || !content || !type) {
          return NextResponse.json(
            { error: 'Name, subject, content, and type are required' },
            { status: 400 }
          );
        }

        const template = await databaseEmailService.createTemplate({
          name,
          subject,
          content,
          textContent,
          type: type as EmailTemplateType,
          variables,
          userId: session.user.id
        });

        return NextResponse.json({
          success: true,
          template
        });
      }

      case 'render_template': {
        const { templateId, variables } = data;

        if (!templateId) {
          return NextResponse.json(
            { error: 'Template ID is required' },
            { status: 400 }
          );
        }

        const template = await databaseEmailService.getTemplate(templateId);
        if (!template) {
          return NextResponse.json(
            { error: 'Template not found' },
            { status: 404 }
          );
        }

        const rendered = await databaseEmailService.renderTemplate(template, variables || {});

        return NextResponse.json({
          success: true,
          rendered
        });
      }

      case 'validate_template': {
        const { subject, content, textContent } = data;

        if (!subject || !content) {
          return NextResponse.json(
            { error: 'Subject and content are required' },
            { status: 400 }
          );
        }

        const validation = await databaseEmailService.validateTemplate({
          subject,
          content,
          textContent
        });

        return NextResponse.json({
          success: true,
          validation
        });
      }

      case 'preview_template': {
        const { subject, content, textContent } = data;

        if (!subject || !content) {
          return NextResponse.json(
            { error: 'Subject and content are required' },
            { status: 400 }
          );
        }

        const preview = await databaseEmailService.generateTemplatePreview({
          subject,
          content,
          textContent
        });

        return NextResponse.json({
          success: true,
          preview
        });
      }

      case 'get_template_analysis': {
        const { templateId } = data;

        if (!templateId) {
          return NextResponse.json(
            { error: 'Template ID is required' },
            { status: 400 }
          );
        }

        const template = await databaseEmailService.getTemplate(templateId);
        if (!template) {
          return NextResponse.json(
            { error: 'Template not found' },
            { status: 404 }
          );
        }

        const analysis = await databaseEmailService.getTemplateAnalysis(template);

        return NextResponse.json({
          success: true,
          analysis
        });
      }

      case 'get_analytics': {
        const { templateId } = data;

        if (!templateId) {
          return NextResponse.json(
            { error: 'Template ID is required' },
            { status: 400 }
          );
        }

        const analytics = await databaseEmailService.getTemplateStats(templateId);

        return NextResponse.json({
          success: true,
          analytics
        });
      }

      case 'update_template': {
        const { templateId, ...updateData } = data;

        if (!templateId) {
          return NextResponse.json(
            { error: 'Template ID is required' },
            { status: 400 }
          );
        }

        const template = await databaseEmailService.updateTemplate(templateId, updateData);

        return NextResponse.json({
          success: true,
          template
        });
      }

      case 'delete_template': {
        const { templateId } = data;

        if (!templateId) {
          return NextResponse.json(
            { error: 'Template ID is required' },
            { status: 400 }
          );
        }

        await databaseEmailService.deleteTemplate(templateId);

        return NextResponse.json({
          success: true,
          message: 'Template deleted successfully'
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Templates API error:', error);
    return NextResponse.json(
      { error: 'Template operation failed' },
      { status: 500 }
    );
  }
}