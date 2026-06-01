import { db } from '@/lib/db';
import { ApplicationStatus } from '@prisma/client';

export interface ApplicationMetrics {
  totalApplications: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
  successRate: number;
  avgResponseTime: number;
  avgInterviewTime: number;
  avgOfferTime: number;
  conversionFunnel: ConversionFunnel;
  statusDistribution: StatusDistribution[];
  timelineTrends: TimelineTrend[];
  benchmarkComparison?: BenchmarkData;
}

export interface ConversionFunnel {
  applications: number;
  responses: number;
  interviews: number;
  offers: number;
  accepted: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
  acceptanceRate: number;
}

export interface StatusDistribution {
  status: ApplicationStatus;
  count: number;
  percentage: number;
}

export interface TimelineTrend {
  period: string;
  applications: number;
  responses: number;
  interviews: number;
  offers: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
}

export interface BenchmarkData {
  industryResponseRate: number;
  industryInterviewRate: number;
  industryOfferRate: number;
  userPerformance: 'above' | 'at' | 'below';
  recommendations: string[];
}

export class ApplicationAnalytics {
  constructor(private userId: string) {}

  async getMetrics(options: {
    timeframe?: '7d' | '30d' | '90d' | '1y' | 'all';
    resumeId?: string;
    jobTitle?: string;
    location?: string;
    includeBenchmarks?: boolean;
  } = {}): Promise<ApplicationMetrics> {
    const { timeframe = '30d', resumeId, jobTitle, location, includeBenchmarks = false } = options;

    const dateRange = this.getDateRange(timeframe);
    const whereClause = this.buildWhereClause(dateRange, resumeId, jobTitle, location);

    const [
      applications,
      statusDistribution,
      timelineData,
      benchmarkData,
    ] = await Promise.all([
      this.getApplicationData(whereClause),
      this.getStatusDistribution(whereClause),
      this.getTimelineData(whereClause, timeframe),
      includeBenchmarks ? this.getBenchmarkData() : null,
    ]);

    const metrics = this.calculateMetrics(applications, statusDistribution, timelineData);
    
    if (benchmarkData) {
      metrics.benchmarkComparison = this.compareToBenchmarks(metrics, benchmarkData);
    }

    return metrics;
  }

  private getDateRange(timeframe: string): { start?: Date; end: Date } {
    const now = new Date();
    let start: Date | undefined;

    switch (timeframe) {
      case '7d':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        start = undefined; // All time
    }

    return { start, end: now };
  }

  private buildWhereClause(
    dateRange: { start?: Date; end: Date },
    resumeId?: string,
    jobTitle?: string,
    location?: string
  ) {
    return {
      userId: this.userId,
      submittedAt: dateRange.start ? { gte: dateRange.start, lte: dateRange.end } : { lte: dateRange.end },
      resumeId: resumeId || undefined,
      jobLead: {
        title: jobTitle ? { contains: jobTitle, mode: 'insensitive' as const } : undefined,
        jobListing: {
          location: location ? { contains: location, mode: 'insensitive' as const } : undefined,
        },
      },
    };
  }

  private async getApplicationData(whereClause: any) {
    return db.applicationSubmission.findMany({
      where: whereClause,
      include: {
        outcomeEvents: {
          orderBy: { createdAt: 'asc' },
        },
        jobLead: {
          include: {
            jobListing: {
              select: {
                title: true,
                company: true,
                location: true,
              },
            },
          },
        },
      },
    });
  }

  private async getStatusDistribution(whereClause: any) {
    return db.applicationSubmission.groupBy({
      by: ['status'],
      where: whereClause,
      _count: { status: true },
    });
  }

  private async getTimelineData(whereClause: any, timeframe: string) {
    const applications = await db.applicationSubmission.findMany({
      where: whereClause,
      select: {
        submittedAt: true,
        status: true,
        responseReceivedAt: true,
        daysToResponse: true,
        daysToFinalOutcome: true,
        interviewCount: true,
      },
      orderBy: { submittedAt: 'asc' },
    });

    return this.groupByTimePeriod(applications, timeframe);
  }

  private groupByTimePeriod(applications: any[], timeframe: string) {
    const groupSize = timeframe === '7d' ? 1 : timeframe === '30d' ? 7 : 30; // days per group
    const groups: Record<string, any> = {};

    applications.forEach(app => {
      if (!app.submittedAt) return;

      const date = new Date(app.submittedAt);
      const groupKey = this.getGroupKey(date, groupSize);

      if (!groups[groupKey]) {
        groups[groupKey] = {
          period: groupKey,
          applications: 0,
          responses: 0,
          interviews: 0,
          offers: 0,
        };
      }

      groups[groupKey].applications++;
      if (app.responseReceivedAt) groups[groupKey].responses++;
      if (app.interviewCount > 0) groups[groupKey].interviews++;
      if ([ApplicationStatus.OFFER_RECEIVED, ApplicationStatus.OFFER_ACCEPTED].includes(app.status)) {
        groups[groupKey].offers++;
      }
    });

    return Object.values(groups).map((group: any) => ({
      ...group,
      responseRate: group.applications > 0 ? (group.responses / group.applications) * 100 : 0,
      interviewRate: group.applications > 0 ? (group.interviews / group.applications) * 100 : 0,
      offerRate: group.applications > 0 ? (group.offers / group.applications) * 100 : 0,
    }));
  }

  private getGroupKey(date: Date, groupSize: number): string {
    if (groupSize === 1) {
      return date.toISOString().split('T')[0]; // Daily
    } else if (groupSize === 7) {
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      return `Week of ${weekStart.toISOString().split('T')[0]}`;
    } else {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
  }

  private calculateMetrics(
    applications: any[],
    statusDistribution: any[],
    timelineData: any[]
  ): ApplicationMetrics {
    const total = applications.length;
    
    // Count different types of outcomes
    const responses = applications.filter(app => app.responseReceivedAt).length;
    const interviews = applications.filter(app => app.interviewCount > 0).length;
    const offers = applications.filter(app => 
      [ApplicationStatus.OFFER_RECEIVED, ApplicationStatus.OFFER_ACCEPTED, ApplicationStatus.OFFER_REJECTED].includes(app.status)
    ).length;
    const accepted = applications.filter(app => app.status === ApplicationStatus.OFFER_ACCEPTED).length;

    // Calculate rates
    const responseRate = total > 0 ? (responses / total) * 100 : 0;
    const interviewRate = total > 0 ? (interviews / total) * 100 : 0;
    const offerRate = total > 0 ? (offers / total) * 100 : 0;
    const acceptanceRate = offers > 0 ? (accepted / offers) * 100 : 0;
    const successRate = total > 0 ? (accepted / total) * 100 : 0;

    // Calculate timing averages
    const responseApps = applications.filter(app => app.daysToResponse !== null);
    const avgResponseTime = responseApps.length > 0
      ? responseApps.reduce((sum, app) => sum + app.daysToResponse, 0) / responseApps.length
      : 0;

    const interviewApps = applications.filter(app => app.interviewCount > 0);
    const avgInterviewTime = interviewApps.length > 0
      ? interviewApps.reduce((sum, app) => sum + (app.daysToFinalOutcome || 0), 0) / interviewApps.length
      : 0;

    const offerApps = applications.filter(app => app.daysToFinalOutcome !== null);
    const avgOfferTime = offerApps.length > 0
      ? offerApps.reduce((sum, app) => sum + app.daysToFinalOutcome, 0) / offerApps.length
      : 0;

    // Build conversion funnel
    const conversionFunnel: ConversionFunnel = {
      applications: total,
      responses,
      interviews,
      offers,
      accepted,
      responseRate,
      interviewRate,
      offerRate,
      acceptanceRate,
    };

    // Build status distribution
    const statusBreakdown: StatusDistribution[] = statusDistribution.map(item => ({
      status: item.status,
      count: item._count.status,
      percentage: total > 0 ? (item._count.status / total) * 100 : 0,
    }));

    return {
      totalApplications: total,
      responseRate: Math.round(responseRate * 100) / 100,
      interviewRate: Math.round(interviewRate * 100) / 100,
      offerRate: Math.round(offerRate * 100) / 100,
      successRate: Math.round(successRate * 100) / 100,
      avgResponseTime: Math.round(avgResponseTime * 10) / 10,
      avgInterviewTime: Math.round(avgInterviewTime * 10) / 10,
      avgOfferTime: Math.round(avgOfferTime * 10) / 10,
      conversionFunnel,
      statusDistribution: statusBreakdown,
      timelineTrends: timelineData,
    };
  }

  private async getBenchmarkData(): Promise<BenchmarkData> {
    // In a real application, this would come from industry data
    // For now, we'll use reasonable industry averages
    return {
      industryResponseRate: 15, // 15% industry average
      industryInterviewRate: 8,  // 8% industry average  
      industryOfferRate: 3,      // 3% industry average
      userPerformance: 'at',
      recommendations: [
        'Consider tailoring your resume more specifically to job requirements',
        'Follow up on applications after 1-2 weeks if no response',
        'Optimize your LinkedIn profile for better visibility',
      ],
    };
  }

  private compareToBenchmarks(metrics: ApplicationMetrics, benchmarks: BenchmarkData): BenchmarkData {
    const userResponseRate = metrics.responseRate;
    const userInterviewRate = metrics.interviewRate;
    const userOfferRate = metrics.offerRate;

    let performance: 'above' | 'at' | 'below' = 'at';
    const recommendations: string[] = [];

    // Compare to benchmarks (allowing 20% tolerance for "at" performance)
    const responseComparison = userResponseRate / benchmarks.industryResponseRate;
    const interviewComparison = userInterviewRate / benchmarks.industryInterviewRate;
    const offerComparison = userOfferRate / benchmarks.industryOfferRate;

    const avgComparison = (responseComparison + interviewComparison + offerComparison) / 3;

    if (avgComparison > 1.2) {
      performance = 'above';
      recommendations.push('Excellent performance! Consider sharing your strategies with others.');
    } else if (avgComparison < 0.8) {
      performance = 'below';
      
      if (responseComparison < 0.8) {
        recommendations.push('Focus on improving your application response rate through better resume optimization.');
      }
      if (interviewComparison < 0.8) {
        recommendations.push('Work on interview skills and preparation to improve conversion rates.');
      }
      if (offerComparison < 0.8) {
        recommendations.push('Consider salary negotiation strategies and follow-up techniques.');
      }
    } else {
      recommendations.push('Performance is within industry standards. Focus on consistency and gradual improvements.');
    }

    return {
      ...benchmarks,
      userPerformance: performance,
      recommendations,
    };
  }

  async getSuccessFactors(userId: string): Promise<{
    topPerformingResumes: Array<{ resumeId: string; successRate: number; title: string }>;
    effectiveKeywords: Array<{ keyword: string; successRate: number }>;
    optimalTiming: { bestDayOfWeek: string; bestTimeOfDay: string };
    companySizes: Array<{ size: string; successRate: number }>;
  }> {
    // This would analyze successful applications to identify patterns
    // Implementation would involve complex queries and data analysis
    return {
      topPerformingResumes: [],
      effectiveKeywords: [],
      optimalTiming: { bestDayOfWeek: 'Tuesday', bestTimeOfDay: '10:00 AM' },
      companySizes: [],
    };
  }
}