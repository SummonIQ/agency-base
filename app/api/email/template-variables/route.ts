import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { EmailTemplateEngineService } from '@/lib/email/template-engine-service';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    let variables;
    if (category) {
      variables = EmailTemplateEngineService.getVariablesByCategory(category);
    } else {
      variables = EmailTemplateEngineService.getAvailableVariables();
    }

    // Group variables by category for easier frontend consumption
    const groupedVariables = variables.reduce((acc, variable) => {
      if (!acc[variable.category]) {
        acc[variable.category] = [];
      }
      acc[variable.category].push(variable);
      return acc;
    }, {} as Record<string, typeof variables>);

    return NextResponse.json({
      success: true,
      variables,
      groupedVariables,
      categories: ['personal', 'company', 'job', 'custom']
    });

  } catch (error) {
    console.error('Template Variables API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template variables' },
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
      case 'generate_sample_context': {
        const sampleContext = EmailTemplateEngineService.generateSampleContext();

        return NextResponse.json({
          success: true,
          sampleContext
        });
      }

      case 'extract_variables': {
        const { template } = data;

        if (!template) {
          return NextResponse.json(
            { error: 'Template content is required' },
            { status: 400 }
          );
        }

        const usedVariables = EmailTemplateEngineService.extractUsedVariables(template);
        const availableVariables = EmailTemplateEngineService.getAvailableVariables();
        
        // Match used variables with their definitions
        const matchedVariables = usedVariables.map(varKey => {
          const definition = availableVariables.find(v => v.key === varKey);
          return {
            key: varKey,
            definition,
            isKnown: !!definition
          };
        });

        return NextResponse.json({
          success: true,
          usedVariables,
          matchedVariables,
          unknownVariables: matchedVariables.filter(v => !v.isKnown).map(v => v.key)
        });
      }

      case 'validate_context': {
        const { context, requiredVariables } = data;

        if (!context || !requiredVariables) {
          return NextResponse.json(
            { error: 'Context and required variables are required' },
            { status: 400 }
          );
        }

        const missingVariables = requiredVariables.filter((varKey: string) => {
          const value = context[varKey];
          return value === undefined || value === null || value === '';
        });

        const isValid = missingVariables.length === 0;

        return NextResponse.json({
          success: true,
          isValid,
          missingVariables,
          providedVariables: Object.keys(context).filter(key => {
            const value = context[key];
            return value !== undefined && value !== null && value !== '';
          })
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Template Variables API error:', error);
    return NextResponse.json(
      { error: 'Template variables operation failed' },
      { status: 500 }
    );
  }
}
