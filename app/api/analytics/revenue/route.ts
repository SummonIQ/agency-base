import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { revenueAnalyticsService } from '@/lib/analytics/revenue-analytics-service';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dataType = searchParams.get('type');

    switch (dataType) {
      case 'overview': {
        const analytics = await revenueAnalyticsService.getRevenueAnalytics();
        return NextResponse.json({
          success: true,
          data: {
            metrics: analytics.metrics,
            leadSources: analytics.leadSources,
            activities: analytics.activities,
          },
        });
      }

      case 'pipeline': {
        const analytics = await revenueAnalyticsService.getRevenueAnalytics();
        return NextResponse.json({
          success: true,
          data: {
            pipeline: analytics.pipeline,
            forecast: analytics.forecast,
          },
        });
      }

      case 'trends': {
        const analytics = await revenueAnalyticsService.getRevenueAnalytics();
        return NextResponse.json({
          success: true,
          data: {
            trends: analytics.trends,
            forecast: analytics.forecast,
          },
        });
      }

      case 'sources': {
        const analytics = await revenueAnalyticsService.getRevenueAnalytics();
        return NextResponse.json({
          success: true,
          data: {
            leadSources: analytics.leadSources,
            activities: analytics.activities,
          },
        });
      }

      default: {
        // Return complete analytics data
        const analytics = await revenueAnalyticsService.getRevenueAnalytics();
        return NextResponse.json({
          success: true,
          data: analytics,
        });
      }
    }

  } catch (error) {
    console.error('Revenue analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
      case 'update_deal': {
        const { dealId, stage, value, probability } = data;

        if (!dealId) {
          return NextResponse.json(
            { error: 'Deal ID is required' },
            { status: 400 }
          );
        }

        // In a real implementation, you would update the database
        // For now, just return success
        return NextResponse.json({
          success: true,
          dealId,
          updatedAt: new Date().toISOString(),
        });
      }

      case 'add_deal': {
        const { clientName, value, stage, source, expectedCloseDate } = data;

        if (!clientName || !value) {
          return NextResponse.json(
            { error: 'Client name and value are required' },
            { status: 400 }
          );
        }

        // In a real implementation, you would save to database
        const newDeal = {
          id: `deal_${Date.now()}`,
          clientName,
          value,
          stage: stage || 'discovery',
          probability: stage === 'discovery' ? 25 : stage === 'proposal' ? 50 : stage === 'negotiation' ? 75 : 100,
          expectedCloseDate: expectedCloseDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          source: source || 'Manual',
          lastActivity: new Date().toISOString(),
        };

        return NextResponse.json({
          success: true,
          deal: newDeal,
        });
      }

      case 'refresh_data': {
        // Force refresh of analytics data from all sources
        const analytics = await revenueAnalyticsService.getRevenueAnalytics();
        
        return NextResponse.json({
          success: true,
          data: analytics,
          refreshedAt: new Date().toISOString(),
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Revenue analytics POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
