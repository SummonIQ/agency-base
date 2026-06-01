import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { subDays, subMonths, subWeeks, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('range') || '30d';
    const includeDetails = searchParams.get('details') === 'true';

    // Calculate date ranges
    const now = new Date();
    let dateFrom: Date;
    let dateTo = now;
    let previousDateFrom: Date;
    let previousDateTo: Date;

    switch (timeRange) {
      case '7d':
        dateFrom = subDays(now, 7);
        previousDateFrom = subDays(dateFrom, 7);
        previousDateTo = dateFrom;
        break;
      case '30d':
        dateFrom = subDays(now, 30);
        previousDateFrom = subDays(dateFrom, 30);
        previousDateTo = dateFrom;
        break;
      case '3m':
        dateFrom = subMonths(now, 3);
        previousDateFrom = subMonths(dateFrom, 3);
        previousDateTo = dateFrom;
        break;
      case 'this_month':
        dateFrom = startOfMonth(now);
        previousDateFrom = startOfMonth(subMonths(now, 1));
        previousDateTo = endOfMonth(subMonths(now, 1));
        break;
      case 'this_week':
        dateFrom = startOfWeek(now);
        previousDateFrom = startOfWeek(subWeeks(now, 1));
        previousDateTo = endOfWeek(subWeeks(now, 1));
        break;
      default:
        dateFrom = subDays(now, 30);
        previousDateFrom = subDays(dateFrom, 30);
        previousDateTo = dateFrom;
    }

    // Fetch all leads for the user
    const leads = await db.agencyLead.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        outreachActivities: {
          include: {
            communications: true,
          },
        },
      },
    });

    // Filter leads by date range
    const currentPeriodLeads = leads.filter(
      lead => new Date(lead.createdAt) >= dateFrom && new Date(lead.createdAt) <= dateTo
    );

    const previousPeriodLeads = leads.filter(
      lead => new Date(lead.createdAt) >= previousDateFrom && new Date(lead.createdAt) <= previousDateTo
    );

    // Calculate metrics
    const totalLeads = currentPeriodLeads.length;
    const previousTotalLeads = previousPeriodLeads.length;

    // Lead status distribution
    const leadsByStatus = currentPeriodLeads.reduce((acc: Record<string, number>, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {});

    // Pipeline value metrics
    const totalPipelineValue = currentPeriodLeads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0);
    const previousPipelineValue = previousPeriodLeads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0);

    // Outreach activity metrics
    const allOutreachActivities = currentPeriodLeads.flatMap(lead => lead.outreachActivities);
    const totalEmails = allOutreachActivities.filter(activity => activity.type === 'EMAIL').length;
    const totalCampaigns = [...new Set(allOutreachActivities.map(activity => activity.campaignId).filter(Boolean))].length;

    // Email performance metrics
    const emailActivities = allOutreachActivities.filter(activity => activity.type === 'EMAIL');
    const sentEmails = emailActivities.filter(activity => activity.status === 'SENT').length;
    const openedEmails = emailActivities.filter(activity => activity.metadata?.opened).length;
    const clickedEmails = emailActivities.filter(activity => activity.metadata?.clicked).length;
    const repliedEmails = emailActivities.filter(activity => activity.metadata?.replied).length;

    // Conversion metrics
    const qualifiedLeads = currentPeriodLeads.filter(lead =>
      ['QUALIFIED', 'MEETING', 'PROPOSAL', 'WON'].includes(lead.status)
    ).length;

    const wonLeads = currentPeriodLeads.filter(lead => lead.status === 'WON').length;

    // Calculate rates
    const openRate = sentEmails > 0 ? (openedEmails / sentEmails) * 100 : 0;
    const clickRate = sentEmails > 0 ? (clickedEmails / sentEmails) * 100 : 0;
    const replyRate = sentEmails > 0 ? (repliedEmails / sentEmails) * 100 : 0;
    const conversionRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;
    const winRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

    // Calculate percentage changes
    const leadsGrowth = previousTotalLeads > 0 ? ((totalLeads - previousTotalLeads) / previousTotalLeads) * 100 : 0;
    const pipelineGrowth = previousPipelineValue > 0 ? ((totalPipelineValue - previousPipelineValue) / previousPipelineValue) * 100 : 0;

    // Time series data for charts (if details requested)
    let chartData: any[] = [];
    if (includeDetails) {
      const days: string[] = [];
      let current = new Date(dateFrom);
      while (current <= dateTo) {
        days.push(format(current, 'yyyy-MM-dd'));
        current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
      }

      chartData = days.map(day => {
        const dayLeads = currentPeriodLeads.filter(lead =>
          format(new Date(lead.createdAt), 'yyyy-MM-dd') === day
        );
        const dayEmails = allOutreachActivities.filter(activity =>
          activity.scheduledAt && format(new Date(activity.scheduledAt), 'yyyy-MM-dd') === day
        );

        return {
          date: day,
          leads: dayLeads.length,
          emails: dayEmails.length,
          pipelineValue: dayLeads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0),
        };
      });
    }

    // Lead source analysis
    const leadsBySource = currentPeriodLeads.reduce((acc: Record<string, number>, lead) => {
      const source = lead.metadata?.source as string || 'Direct';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    // Industry analysis
    const leadsByIndustry = currentPeriodLeads.reduce((acc: Record<string, number>, lead) => {
      const industry = lead.metadata?.industry as string || 'Unknown';
      acc[industry] = (acc[industry] || 0) + 1;
      return acc;
    }, {});

    // Top performing templates (if details requested)
    let templatePerformance: any[] = [];
    if (includeDetails) {
      const templateStats = emailActivities.reduce((acc: Record<string, any>, activity) => {
        const templateId = activity.metadata?.templateId as string;
        if (templateId) {
          if (!acc[templateId]) {
            acc[templateId] = {
              templateId,
              sent: 0,
              opened: 0,
              clicked: 0,
              replied: 0,
            };
          }
          acc[templateId].sent++;
          if (activity.metadata?.opened) acc[templateId].opened++;
          if (activity.metadata?.clicked) acc[templateId].clicked++;
          if (activity.metadata?.replied) acc[templateId].replied++;
        }
        return acc;
      }, {});

      templatePerformance = Object.values(templateStats).map((stats: any) => ({
        ...stats,
        openRate: stats.sent > 0 ? (stats.opened / stats.sent) * 100 : 0,
        clickRate: stats.sent > 0 ? (stats.clicked / stats.sent) * 100 : 0,
        replyRate: stats.sent > 0 ? (stats.replied / stats.sent) * 100 : 0,
      }));
    }

    const analytics = {
      summary: {
        totalLeads,
        leadsGrowth: Number(leadsGrowth.toFixed(1)),
        totalPipelineValue,
        pipelineGrowth: Number(pipelineGrowth.toFixed(1)),
        totalEmails,
        totalCampaigns,
        qualifiedLeads,
        wonLeads,
      },
      performance: {
        openRate: Number(openRate.toFixed(1)),
        clickRate: Number(clickRate.toFixed(1)),
        replyRate: Number(replyRate.toFixed(1)),
        conversionRate: Number(conversionRate.toFixed(1)),
        winRate: Number(winRate.toFixed(1)),
      },
      distribution: {
        leadsByStatus,
        leadsBySource,
        leadsByIndustry,
      },
      ...(includeDetails && {
        chartData,
        templatePerformance,
      }),
      meta: {
        dateRange: {
          from: dateFrom.toISOString(),
          to: dateTo.toISOString(),
        },
        timeRange,
      },
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}