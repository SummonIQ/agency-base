import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { ABTestingService } from '@/lib/lead-generation/ab-testing-service';

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

    const abTestingService = ABTestingService.getInstance();

    switch (action) {
      case 'create_test': {
        const { name, description, variants, duration, sampleSize, primaryMetric, confidenceLevel } = data;

        if (!name || !variants || !Array.isArray(variants) || variants.length < 2) {
          return NextResponse.json(
            { error: 'Test name and at least 2 variants are required' },
            { status: 400 }
          );
        }

        const config = {
          name,
          description,
          variants,
          duration: duration || 7,
          sampleSize: sampleSize || 100,
          primaryMetric: primaryMetric || 'open_rate',
          confidenceLevel: confidenceLevel || 95,
        };

        const test = await abTestingService.createTest(session.user.id, config);

        return NextResponse.json({
          success: true,
          data: test,
        });
      }

      case 'start_test': {
        const { testId } = data;

        if (!testId) {
          return NextResponse.json(
            { error: 'Test ID is required' },
            { status: 400 }
          );
        }

        const test = await abTestingService.startTest(session.user.id, testId);

        return NextResponse.json({
          success: true,
          data: test,
        });
      }

      case 'complete_test': {
        const { testId } = data;

        if (!testId) {
          return NextResponse.json(
            { error: 'Test ID is required' },
            { status: 400 }
          );
        }

        const test = await abTestingService.completeTest(session.user.id, testId);

        return NextResponse.json({
          success: true,
          data: test,
        });
      }

      case 'get_variant': {
        const { testId, leadId } = data;

        if (!testId || !leadId) {
          return NextResponse.json(
            { error: 'Test ID and Lead ID are required' },
            { status: 400 }
          );
        }

        const variant = await abTestingService.getVariantForLead(testId, leadId);

        return NextResponse.json({
          success: true,
          data: { variant },
        });
      }

      case 'record_activity': {
        const { testId, variantId, leadId, activityType, metadata } = data;

        if (!testId || !variantId || !leadId || !activityType) {
          return NextResponse.json(
            { error: 'Test ID, Variant ID, Lead ID, and Activity Type are required' },
            { status: 400 }
          );
        }

        await abTestingService.recordTestActivity(testId, variantId, leadId, {
          type: activityType,
          timestamp: new Date(),
          metadata,
        });

        return NextResponse.json({
          success: true,
          message: 'Activity recorded',
        });
      }

      case 'get_results': {
        const { testId } = data;

        if (!testId) {
          return NextResponse.json(
            { error: 'Test ID is required' },
            { status: 400 }
          );
        }

        const results = await abTestingService.calculateResults(session.user.id, testId);

        return NextResponse.json({
          success: true,
          data: results,
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('A/B Testing API error:', error);
    return NextResponse.json(
      { error: 'Failed to process A/B testing request' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const testId = searchParams.get('testId');

    const abTestingService = ABTestingService.getInstance();

    if (testId) {
      // Get specific test
      const test = await abTestingService.getTest(session.user.id, testId);

      if (!test) {
        return NextResponse.json(
          { error: 'Test not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: test,
      });
    } else {
      // Get all tests for user
      const tests = await abTestingService.getUserTests(session.user.id);

      return NextResponse.json({
        success: true,
        data: tests,
      });
    }
  } catch (error) {
    console.error('A/B Testing API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch A/B testing data' },
      { status: 500 }
    );
  }
}