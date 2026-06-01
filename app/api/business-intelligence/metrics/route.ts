import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const metricsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  period: z.enum(['week', 'month', 'quarter', 'year']).default('month'),
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
    const queryParams = {
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      period: searchParams.get('period') as 'week' | 'month' | 'quarter' | 'year' || 'month',
    };

    const validatedParams = metricsQuerySchema.parse(queryParams);

    // Calculate date range
    const endDate = validatedParams.endDate ? new Date(validatedParams.endDate) : new Date();
    const startDate = validatedParams.startDate
      ? new Date(validatedParams.startDate)
      : new Date(endDate.getFullYear(), endDate.getMonth() - 6, 1); // Default to 6 months ago

    const userId = session.user.id;

    // Revenue Metrics
    const revenueRecords = await db.revenueRecord.findMany({
      where: {
        userId,
        periodStart: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalRevenue = revenueRecords
      .filter(r => r.status === 'RECEIVED')
      .reduce((sum, r) => sum + r.amount, 0);

    const pendingRevenue = revenueRecords
      .filter(r => r.status === 'PENDING')
      .reduce((sum, r) => sum + r.amount, 0);

    // Client Metrics
    const clients = await db.client.findMany({
      where: { userId },
      include: {
        projects: true,
        revenueRecords: {
          where: {
            periodStart: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    });

    const activeClients = clients.filter(c => c.status === 'ACTIVE').length;
    const totalClients = clients.length;
    const avgRevenuePerClient = totalClients > 0 ? totalRevenue / totalClients : 0;

    // Project Metrics
    const projects = await db.project.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        tasks: true,
        timeEntries: true,
      },
    });

    const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
    const inProgressProjects = projects.filter(p => p.status === 'IN_PROGRESS').length;
    const totalProjects = projects.length;

    const avgProjectValue = projects.length > 0
      ? projects.reduce((sum, p) => sum + (p.fixedPrice || p.budgetAmount || 0), 0) / projects.length
      : 0;

    // Team Metrics
    const teamMembers = await db.teamMember.findMany({
      where: { userId },
    });

    const activeTeamMembers = teamMembers.filter(tm => tm.status === 'ACTIVE').length;
    const totalTeamMembers = teamMembers.length;

    // Email Campaign Metrics
    const emailCampaigns = await db.emailCampaign.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const sentCampaigns = emailCampaigns.filter(c => c.status === 'SENT').length;
    const totalCampaigns = emailCampaigns.length;

    // Email Subscriber Metrics
    const emailSubscribers = await db.emailSubscriber.findMany({
      where: { userId },
    });

    const activeSubscribers = emailSubscribers.filter(s => s.status === 'active').length;
    const totalSubscribers = emailSubscribers.length;

    // Recruiting Metrics
    const candidates = await db.candidate.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        applications: true,
        interviews: true,
      },
    });

    const hiredCandidates = candidates.filter(c => c.status === 'hired').length;
    const activeCandidates = candidates.filter(c => c.status === 'active').length;
    const totalCandidates = candidates.length;

    // Calculate growth rates (comparing to previous period)
    const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const previousStartDate = new Date(startDate.getTime() - (periodDays * 24 * 60 * 60 * 1000));
    const previousEndDate = startDate;

    const previousRevenueRecords = await db.revenueRecord.findMany({
      where: {
        userId,
        periodStart: {
          gte: previousStartDate,
          lte: previousEndDate,
        },
        status: 'RECEIVED',
      },
    });

    const previousRevenue = previousRevenueRecords.reduce((sum, r) => sum + r.amount, 0);
    const revenueGrowthRate = previousRevenue > 0
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

    // Business Health Score (0-100)
    const healthFactors = {
      revenue: totalRevenue > 0 ? 25 : 0,
      clientRetention: activeClients > 0 ? 20 : 0,
      projectCompletion: totalProjects > 0 ? (completedProjects / totalProjects) * 20 : 0,
      teamUtilization: activeTeamMembers > 0 ? 15 : 0,
      growth: revenueGrowthRate > 0 ? 20 : 0,
    };

    const businessHealthScore = Object.values(healthFactors).reduce((sum, score) => sum + score, 0);

    const metrics = {
      // Financial Metrics
      revenue: {
        total: totalRevenue,
        pending: pendingRevenue,
        growth: revenueGrowthRate,
        avgPerClient: avgRevenuePerClient,
      },

      // Client Metrics
      clients: {
        total: totalClients,
        active: activeClients,
        retention: totalClients > 0 ? (activeClients / totalClients) * 100 : 0,
      },

      // Project Metrics
      projects: {
        total: totalProjects,
        completed: completedProjects,
        inProgress: inProgressProjects,
        completionRate: totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0,
        avgValue: avgProjectValue,
      },

      // Team Metrics
      team: {
        total: totalTeamMembers,
        active: activeTeamMembers,
        utilization: totalTeamMembers > 0 ? (activeTeamMembers / totalTeamMembers) * 100 : 0,
      },

      // Marketing Metrics
      marketing: {
        emailCampaigns: {
          total: totalCampaigns,
          sent: sentCampaigns,
          successRate: totalCampaigns > 0 ? (sentCampaigns / totalCampaigns) * 100 : 0,
        },
        subscribers: {
          total: totalSubscribers,
          active: activeSubscribers,
          engagementRate: totalSubscribers > 0 ? (activeSubscribers / totalSubscribers) * 100 : 0,
        },
      },

      // Recruiting Metrics
      recruiting: {
        candidates: {
          total: totalCandidates,
          active: activeCandidates,
          hired: hiredCandidates,
          hireRate: totalCandidates > 0 ? (hiredCandidates / totalCandidates) * 100 : 0,
        },
      },

      // Overall Business Health
      businessHealth: {
        score: Math.round(businessHealthScore),
        factors: healthFactors,
      },

      // Period Info
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days: periodDays,
      },
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error calculating business metrics:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to calculate business metrics' },
      { status: 500 }
    );
  }
}