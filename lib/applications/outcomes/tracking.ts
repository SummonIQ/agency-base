import { db } from '@/lib/db';
import { ApplicationStatus } from '@prisma/client';

export interface ResponseTimeMetrics {
  avgFirstResponse: number;
  avgInterviewScheduling: number;
  avgOfferDelivery: number;
  fastestResponse: number;
  slowestResponse: number;
  responseTimeDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
}

export class ResponseTimeTracker {
  constructor(private userId: string) {}

  async trackApplicationUpdate(
    applicationId: string,
    newStatus: ApplicationStatus,
    previousStatus?: ApplicationStatus
  ): Promise<void> {
    const application = await db.applicationSubmission.findUnique({
      where: { id: applicationId },
      include: { outcomeEvents: true },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    const now = new Date();
    const submissionDate = application.submittedAt || application.createdAt;

    // Calculate timing metrics
    const daysSinceSubmission = Math.floor(
      (now.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let updateData: any = {
      status: newStatus,
      lastStatusChangeAt: now,
      daysSinceSubmission,
    };

    // Detect and track response events
    const eventType = this.detectEventType(newStatus, previousStatus);
    const isFirstResponse = this.isFirstResponse(application.outcomeEvents, newStatus);

    if (isFirstResponse && !application.responseReceivedAt) {
      updateData.responseReceivedAt = now;
      updateData.daysToResponse = daysSinceSubmission;
    }

    // Track interview events
    if (this.isInterviewEvent(newStatus) && !application.outcomeEvents.some(e => 
      e.eventType === 'interview_scheduled' || e.eventType === 'interview_completed'
    )) {
      updateData.interviewCount = application.interviewCount + 1;
    }

    // Track final outcomes
    const finalStatuses = [
      ApplicationStatus.OFFER_ACCEPTED,
      ApplicationStatus.OFFER_REJECTED,
      ApplicationStatus.REJECTED,
      ApplicationStatus.NOT_SELECTED,
      ApplicationStatus.WITHDRAWN,
    ];

    if (finalStatuses.includes(newStatus) && !application.finalOutcomeAt) {
      updateData.finalOutcomeAt = now;
      updateData.daysToFinalOutcome = daysSinceSubmission;
    }

    // Create outcome event and update application
    await db.$transaction(async (tx) => {
      await tx.applicationOutcomeEvent.create({
        data: {
          applicationSubmissionId: applicationId,
          eventType,
          newStatus,
          previousStatus: previousStatus || application.status,
          createdBy: 'system',
        },
      });

      await tx.applicationSubmission.update({
        where: { id: applicationId },
        data: updateData,
      });
    });
  }

  async getResponseTimeMetrics(timeframe: '30d' | '90d' | '1y' | 'all' = '30d'): Promise<ResponseTimeMetrics> {
    const dateRange = this.getDateRange(timeframe);
    
    const applications = await db.applicationSubmission.findMany({
      where: {
        userId: this.userId,
        submittedAt: dateRange.start ? { gte: dateRange.start } : undefined,
        daysToResponse: { not: null },
      },
      select: {
        daysToResponse: true,
        daysToFinalOutcome: true,
        interviewCount: true,
        responseReceivedAt: true,
        finalOutcomeAt: true,
        status: true,
      },
    });

    const responseTimes = applications
      .filter(app => app.daysToResponse !== null)
      .map(app => app.daysToResponse!);

    const interviewTimes = applications
      .filter(app => app.interviewCount > 0 && app.daysToFinalOutcome !== null)
      .map(app => app.daysToFinalOutcome!);

    const offerTimes = applications
      .filter(app => 
        [ApplicationStatus.OFFER_RECEIVED, ApplicationStatus.OFFER_ACCEPTED].includes(app.status) &&
        app.daysToFinalOutcome !== null
      )
      .map(app => app.daysToFinalOutcome!);

    return {
      avgFirstResponse: this.calculateAverage(responseTimes),
      avgInterviewScheduling: this.calculateAverage(interviewTimes),
      avgOfferDelivery: this.calculateAverage(offerTimes),
      fastestResponse: Math.min(...responseTimes, Infinity) === Infinity ? 0 : Math.min(...responseTimes),
      slowestResponse: Math.max(...responseTimes, -Infinity) === -Infinity ? 0 : Math.max(...responseTimes),
      responseTimeDistribution: this.calculateDistribution(responseTimes),
    };
  }

  private detectEventType(newStatus: ApplicationStatus, previousStatus?: ApplicationStatus): string {
    if (!previousStatus || previousStatus === ApplicationStatus.PENDING) {
      if (newStatus === ApplicationStatus.SUBMITTED) return 'application_submitted';
      if (newStatus === ApplicationStatus.UNDER_REVIEW) return 'under_review';
      if (newStatus === ApplicationStatus.REJECTED) return 'rejected';
    }

    switch (newStatus) {
      case ApplicationStatus.UNDER_REVIEW:
        return 'response_received';
      case ApplicationStatus.INTERVIEW_REQUESTED:
        return 'interview_requested';
      case ApplicationStatus.INTERVIEW_SCHEDULED:
        return 'interview_scheduled';
      case ApplicationStatus.INTERVIEW_COMPLETED:
        return 'interview_completed';
      case ApplicationStatus.OFFER_RECEIVED:
        return 'offer_received';
      case ApplicationStatus.OFFER_ACCEPTED:
        return 'offer_accepted';
      case ApplicationStatus.OFFER_REJECTED:
        return 'offer_rejected';
      case ApplicationStatus.REJECTED:
        return 'rejected';
      case ApplicationStatus.NOT_SELECTED:
        return 'not_selected';
      case ApplicationStatus.WITHDRAWN:
        return 'withdrawn';
      default:
        return 'status_change';
    }
  }

  private isFirstResponse(outcomeEvents: any[], newStatus: ApplicationStatus): boolean {
    const responseStatuses = [
      ApplicationStatus.UNDER_REVIEW,
      ApplicationStatus.INTERVIEW_REQUESTED,
      ApplicationStatus.INTERVIEW_SCHEDULED,
      ApplicationStatus.INTERVIEW_COMPLETED,
      ApplicationStatus.OFFER_RECEIVED,
      ApplicationStatus.REJECTED,
      ApplicationStatus.NOT_SELECTED,
    ];

    const hasExistingResponse = outcomeEvents.some(event => 
      responseStatuses.includes(event.newStatus)
    );

    return !hasExistingResponse && responseStatuses.includes(newStatus);
  }

  private isInterviewEvent(status: ApplicationStatus): boolean {
    return [
      ApplicationStatus.INTERVIEW_REQUESTED,
      ApplicationStatus.INTERVIEW_SCHEDULED,
      ApplicationStatus.INTERVIEW_COMPLETED,
    ].includes(status);
  }

  private getDateRange(timeframe: string): { start?: Date } {
    const now = new Date();
    let start: Date | undefined;

    switch (timeframe) {
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
        start = undefined;
    }

    return { start };
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return Math.round((sum / values.length) * 10) / 10;
  }

  private calculateDistribution(responseTimes: number[]): Array<{
    range: string;
    count: number;
    percentage: number;
  }> {
    const ranges = [
      { label: '0-1 days', min: 0, max: 1 },
      { label: '2-7 days', min: 2, max: 7 },
      { label: '1-2 weeks', min: 8, max: 14 },
      { label: '2-4 weeks', min: 15, max: 28 },
      { label: '1+ months', min: 29, max: Infinity },
    ];

    const total = responseTimes.length;
    
    return ranges.map(range => {
      const count = responseTimes.filter(time => time >= range.min && time <= range.max).length;
      return {
        range: range.label,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      };
    });
  }

  /**
   * Automatically detect outcome changes based on external data
   * This could be integrated with email parsing, job board APIs, etc.
   */
  async detectOutcomeChanges(applicationId: string, emailContent?: string): Promise<ApplicationStatus | null> {
    // Simple keyword-based detection
    if (!emailContent) return null;

    const emailLower = emailContent.toLowerCase();

    // Rejection patterns
    const rejectionKeywords = [
      'unfortunately', 'not selected', 'decided to move forward with other candidates',
      'position has been filled', 'thank you for your interest', 'we have chosen',
      'not be moving forward', 'other applicants', 'different direction'
    ];

    // Interview patterns
    const interviewKeywords = [
      'schedule an interview', 'would like to interview', 'next step is an interview',
      'phone interview', 'video interview', 'in-person interview', 'technical interview',
      'meet with our team', 'discussion about the role'
    ];

    // Offer patterns
    const offerKeywords = [
      'pleased to offer', 'job offer', 'we would like to offer', 'extend an offer',
      'offer of employment', 'compensation package', 'start date', 'salary offer'
    ];

    // Under review patterns
    const reviewKeywords = [
      'received your application', 'reviewing your application', 'under review',
      'our team is reviewing', 'we are currently reviewing'
    ];

    if (rejectionKeywords.some(keyword => emailLower.includes(keyword))) {
      return ApplicationStatus.REJECTED;
    }

    if (interviewKeywords.some(keyword => emailLower.includes(keyword))) {
      return ApplicationStatus.INTERVIEW_REQUESTED;
    }

    if (offerKeywords.some(keyword => emailLower.includes(keyword))) {
      return ApplicationStatus.OFFER_RECEIVED;
    }

    if (reviewKeywords.some(keyword => emailLower.includes(keyword))) {
      return ApplicationStatus.UNDER_REVIEW;
    }

    return null;
  }

  /**
   * Bulk update applications based on automated detection
   */
  async processAutomatedUpdates(): Promise<{
    updated: number;
    errors: Array<{ applicationId: string; error: string }>;
  }> {
    // This would integrate with email APIs, job board webhooks, etc.
    // For now, return a placeholder
    return {
      updated: 0,
      errors: [],
    };
  }
}

export const responseTimeTracker = new ResponseTimeTracker('');