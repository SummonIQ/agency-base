/**
 * Email Analytics & Tracking System
 * Comprehensive email performance tracking and reporting
 */

export interface EmailAnalytics {
  timeRange: {
    from: string;
    to: string;
  };
  overview: AnalyticsOverview;
  campaigns: CampaignAnalytics[];
  sequences: SequenceAnalytics[];
  templates: TemplateAnalytics[];
  deliverability: DeliverabilityAnalytics;
  engagement: EngagementAnalytics;
  conversions: ConversionAnalytics;
  trends: TrendData[];
}

export interface AnalyticsOverview {
  totalEmailsSent: number;
  totalDelivered: number;
  totalOpens: number;
  totalClicks: number;
  totalReplies: number;
  totalConversions: number;
  totalUnsubscribes: number;
  totalBounces: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
  conversionRate: number;
  unsubscribeRate: number;
  bounceRate: number;
  engagementScore: number;
  roi: number;
  costPerConversion: number;
}

export interface CampaignAnalytics {
  campaignId: string;
  campaignName: string;
  type: 'one_time' | 'sequence' | 'drip' | 'broadcast';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'completed';
  recipients: number;
  sent: number;
  delivered: number;
  opens: number;
  clicks: number;
  replies: number;
  conversions: number;
  unsubscribes: number;
  bounces: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
  conversionRate: number;
  engagementScore: number;
  revenue?: number;
  cost?: number;
  roi?: number;
  startedAt: string;
  completedAt?: string;
  topPerformingVariant?: string;
  geography: GeographyBreakdown[];
  devices: DeviceBreakdown[];
  timeOfDay: TimeOfDayBreakdown[];
}

export interface SequenceAnalytics {
  sequenceId: string;
  sequenceName: string;
  totalRecipients: number;
  activeRecipients: number;
  completedRecipients: number;
  averageCompletionTime: number; // in days
  stepPerformance: StepPerformance[];
  dropoffAnalysis: DropoffPoint[];
  bestPerformingStep: number;
  worstPerformingStep: number;
  conversionFunnel: ConversionFunnelData[];
}

export interface TemplateAnalytics {
  templateId: string;
  templateName: string;
  category: string;
  totalUses: number;
  avgDeliveryRate: number;
  avgOpenRate: number;
  avgClickRate: number;
  avgReplyRate: number;
  avgConversionRate: number;
  variants: TemplateVariantPerformance[];
  subjectLinePerformance: SubjectLineAnalysis[];
  contentPerformance: ContentAnalysis;
  bestSendTimes: SendTimeAnalysis[];
}

export interface DeliverabilityAnalytics {
  overallScore: number;
  domainReputation: DomainReputationData[];
  ipReputation: IPReputationData[];
  authenticationStatus: {
    spf: 'pass' | 'fail' | 'neutral' | 'not_configured';
    dkim: 'pass' | 'fail' | 'neutral' | 'not_configured';
    dmarc: 'pass' | 'fail' | 'neutral' | 'not_configured';
  };
  bounceAnalysis: BounceAnalysis;
  spamComplaintRate: number;
  listHygiene: ListHygieneData;
  recommendations: DeliverabilityRecommendation[];
}

export interface EngagementAnalytics {
  overallEngagementScore: number;
  heatmaps: EmailHeatmapData[];
  clickMaps: ClickMapData[];
  readingPatterns: ReadingPatternData[];
  timeSpentReading: TimeSpentData[];
  deviceEngagement: DeviceEngagementData[];
  locationEngagement: LocationEngagementData[];
  mostEngagedSegments: SegmentEngagementData[];
}

export interface ConversionAnalytics {
  totalConversions: number;
  conversionRate: number;
  revenue: number;
  averageOrderValue: number;
  conversionsByType: ConversionTypeData[];
  conversionFunnel: ConversionFunnelStep[];
  attributionModels: AttributionModelData[];
  timeToConversion: TimeToConversionData[];
  topConvertingCampaigns: CampaignConversionData[];
  customerLifetimeValue: number;
}

export interface TrendData {
  date: string;
  sent: number;
  delivered: number;
  opens: number;
  clicks: number;
  replies: number;
  conversions: number;
  unsubscribes: number;
  bounces: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
  conversionRate: number;
}

// Supporting interfaces
export interface StepPerformance {
  stepNumber: number;
  stepName: string;
  sent: number;
  delivered: number;
  opens: number;
  clicks: number;
  replies: number;
  conversions: number;
  dropoffRate: number;
  avgTimeToNextStep: number;
}

export interface DropoffPoint {
  stepNumber: number;
  dropoffRate: number;
  reasons: string[];
  recommendations: string[];
}

export interface ConversionFunnelData {
  step: string;
  count: number;
  conversionRate: number;
  dropoff: number;
}

export interface TemplateVariantPerformance {
  variantId: string;
  variantName: string;
  testType: 'subject' | 'content' | 'send_time' | 'from_name';
  sent: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  isWinner: boolean;
  confidenceLevel: number;
}

export interface SubjectLineAnalysis {
  subjectLine: string;
  openRate: number;
  wordCount: number;
  characterCount: number;
  hasEmoji: boolean;
  hasPersonalization: boolean;
  sentimentScore: number;
  spamScore: number;
}

export interface ContentAnalysis {
  readabilityScore: number;
  sentimentScore: number;
  wordCount: number;
  imageCount: number;
  linkCount: number;
  ctaCount: number;
  personalizationElements: number;
  mostClickedLinks: LinkPerformanceData[];
  mostEffectiveCTAs: CTAPerformanceData[];
}

export interface GeographyBreakdown {
  country: string;
  region?: string;
  city?: string;
  recipients: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

export interface DeviceBreakdown {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser?: string;
  recipients: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

export interface TimeOfDayBreakdown {
  hour: number;
  sent: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

export interface BounceAnalysis {
  totalBounces: number;
  hardBounces: number;
  softBounces: number;
  bounceRate: number;
  topBounceReasons: BounceReasonData[];
}

export interface BounceReasonData {
  reason: string;
  count: number;
  percentage: number;
}

export interface ListHygieneData {
  totalSubscribers: number;
  activeSubscribers: number;
  inactiveSubscribers: number;
  invalidEmails: number;
  duplicateEmails: number;
  riskScore: number;
  recommendations: string[];
}

export interface DeliverabilityRecommendation {
  type: 'critical' | 'important' | 'suggestion';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  actionItems: string[];
}

/**
 * Email analytics engine
 */
export class EmailAnalyticsEngine {
  private eventStore: Map<string, any[]> = new Map();
  private campaignData: Map<string, any> = new Map();
  private aggregatedStats: Map<string, any> = new Map();

  constructor() {
    this.initializeAnalytics();
  }

  /**
   * Record email event for analytics
   */
  async recordEvent(event: {
    type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'unsubscribed' | 'complained';
    timestamp: string;
    messageId?: string;
    campaignId?: string;
    sequenceId?: string;
    templateId?: string;
    recipientEmail: string;
    recipientId?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const eventKey = `${event.campaignId || 'unknown'}_${event.type}`;

    if (!this.eventStore.has(eventKey)) {
      this.eventStore.set(eventKey, []);
    }

    this.eventStore.get(eventKey)!.push({
      ...event,
      recordedAt: new Date().toISOString()
    });

    // Update real-time aggregated stats
    await this.updateAggregatedStats(event);
  }

  /**
   * Get comprehensive analytics for date range
   */
  async getAnalytics(options: {
    from: string;
    to: string;
    campaignIds?: string[];
    sequenceIds?: string[];
    templateIds?: string[];
    includeBreakdowns?: boolean;
  }): Promise<EmailAnalytics> {
    const { from, to } = options;

    // Get overview metrics
    const overview = await this.getOverviewAnalytics(from, to, options);

    // Get campaign analytics
    const campaigns = await this.getCampaignAnalytics(from, to, options.campaignIds);

    // Get sequence analytics
    const sequences = await this.getSequenceAnalytics(from, to, options.sequenceIds);

    // Get template analytics
    const templates = await this.getTemplateAnalytics(from, to, options.templateIds);

    // Get deliverability analytics
    const deliverability = await this.getDeliverabilityAnalytics(from, to);

    // Get engagement analytics
    const engagement = await this.getEngagementAnalytics(from, to);

    // Get conversion analytics
    const conversions = await this.getConversionAnalytics(from, to);

    // Get trend data
    const trends = await this.getTrendData(from, to);

    return {
      timeRange: { from, to },
      overview,
      campaigns,
      sequences,
      templates,
      deliverability,
      engagement,
      conversions,
      trends
    };
  }

  /**
   * Get real-time dashboard metrics
   */
  async getRealTimeMetrics(): Promise<{
    emailsSentToday: number;
    openRateToday: number;
    clickRateToday: number;
    recentCampaigns: any[];
    topPerformingTemplates: any[];
    deliverabilityAlerts: any[];
  }> {
    const today = new Date().toISOString().split('T')[0];

    return {
      emailsSentToday: this.getEventCount('sent', today),
      openRateToday: this.calculateRate('opened', 'sent', today),
      clickRateToday: this.calculateRate('clicked', 'sent', today),
      recentCampaigns: this.getRecentCampaigns(),
      topPerformingTemplates: await this.getTopPerformingTemplates(),
      deliverabilityAlerts: await this.getDeliverabilityAlerts()
    };
  }

  /**
   * Generate email performance report
   */
  async generateReport(options: {
    type: 'campaign' | 'sequence' | 'template' | 'overview';
    id?: string;
    from: string;
    to: string;
    format: 'json' | 'csv' | 'pdf';
  }): Promise<any> {
    const analytics = await this.getAnalytics({
      from: options.from,
      to: options.to,
      includeBreakdowns: true
    });

    switch (options.type) {
      case 'campaign':
        return this.generateCampaignReport(analytics, options.id);
      case 'sequence':
        return this.generateSequenceReport(analytics, options.id);
      case 'template':
        return this.generateTemplateReport(analytics, options.id);
      case 'overview':
        return this.generateOverviewReport(analytics);
      default:
        throw new Error(`Unsupported report type: ${options.type}`);
    }
  }

  /**
   * Get A/B test results
   */
  async getABTestResults(testId: string): Promise<{
    testId: string;
    testName: string;
    status: 'running' | 'completed' | 'stopped';
    startDate: string;
    endDate?: string;
    variants: TemplateVariantPerformance[];
    winner?: string;
    confidenceLevel: number;
    statisticalSignificance: boolean;
    recommendations: string[];
  }> {
    // Mock implementation - in production would query actual A/B test data
    return {
      testId,
      testName: 'Subject Line Test',
      status: 'completed',
      startDate: '2024-01-01',
      endDate: '2024-01-07',
      variants: [
        {
          variantId: 'variant_a',
          variantName: 'Control',
          testType: 'subject',
          sent: 1000,
          openRate: 22.5,
          clickRate: 3.2,
          conversionRate: 1.8,
          isWinner: false,
          confidenceLevel: 95
        },
        {
          variantId: 'variant_b',
          variantName: 'Variant B',
          testType: 'subject',
          sent: 1000,
          openRate: 28.7,
          clickRate: 4.1,
          conversionRate: 2.3,
          isWinner: true,
          confidenceLevel: 95
        }
      ],
      winner: 'variant_b',
      confidenceLevel: 95,
      statisticalSignificance: true,
      recommendations: [
        'Implement winning variant for all campaigns',
        'Continue testing similar subject line patterns',
        'Monitor long-term performance'
      ]
    };
  }

  /**
   * Private helper methods
   */
  private async getOverviewAnalytics(from: string, to: string, options: any): Promise<AnalyticsOverview> {
    // In production, this would aggregate from actual event data
    return {
      totalEmailsSent: 15420,
      totalDelivered: 14908,
      totalOpens: 3378,
      totalClicks: 473,
      totalReplies: 156,
      totalConversions: 78,
      totalUnsubscribes: 23,
      totalBounces: 312,
      deliveryRate: 96.7,
      openRate: 22.7,
      clickRate: 3.1,
      replyRate: 1.0,
      conversionRate: 0.5,
      unsubscribeRate: 0.15,
      bounceRate: 2.0,
      engagementScore: 8.2,
      roi: 450.5,
      costPerConversion: 12.50
    };
  }

  private async getCampaignAnalytics(from: string, to: string, campaignIds?: string[]): Promise<CampaignAnalytics[]> {
    // Mock implementation
    return [
      {
        campaignId: 'camp_001',
        campaignName: 'Q1 Lead Generation',
        type: 'sequence',
        status: 'completed',
        recipients: 2500,
        sent: 2485,
        delivered: 2401,
        opens: 552,
        clicks: 73,
        replies: 18,
        conversions: 9,
        unsubscribes: 3,
        bounces: 84,
        deliveryRate: 96.6,
        openRate: 23.0,
        clickRate: 3.0,
        replyRate: 0.7,
        conversionRate: 0.4,
        engagementScore: 8.1,
        revenue: 45000,
        cost: 1250,
        roi: 3500,
        startedAt: '2024-01-01T00:00:00Z',
        completedAt: '2024-01-31T23:59:59Z',
        geography: [
          { country: 'US', recipients: 1500, openRate: 24.5, clickRate: 3.2, conversionRate: 0.5 },
          { country: 'CA', recipients: 600, openRate: 21.8, clickRate: 2.8, conversionRate: 0.3 },
          { country: 'UK', recipients: 400, openRate: 20.1, clickRate: 2.5, conversionRate: 0.2 }
        ],
        devices: [
          { deviceType: 'desktop', os: 'Windows', recipients: 1200, openRate: 25.3, clickRate: 3.5, conversionRate: 0.6 },
          { deviceType: 'mobile', os: 'iOS', recipients: 800, openRate: 22.1, clickRate: 2.8, conversionRate: 0.3 },
          { deviceType: 'mobile', os: 'Android', recipients: 500, openRate: 20.5, clickRate: 2.6, conversionRate: 0.3 }
        ],
        timeOfDay: [
          { hour: 9, sent: 312, openRate: 26.8, clickRate: 3.8, conversionRate: 0.6 },
          { hour: 10, sent: 298, openRate: 25.2, clickRate: 3.4, conversionRate: 0.5 },
          { hour: 14, sent: 287, openRate: 21.4, clickRate: 2.9, conversionRate: 0.4 }
        ]
      }
    ];
  }

  private async getSequenceAnalytics(from: string, to: string, sequenceIds?: string[]): Promise<SequenceAnalytics[]> {
    // Mock implementation
    return [
      {
        sequenceId: 'seq_001',
        sequenceName: 'Cold Outreach - Tech Companies',
        totalRecipients: 1000,
        activeRecipients: 250,
        completedRecipients: 650,
        averageCompletionTime: 14,
        stepPerformance: [
          {
            stepNumber: 1,
            stepName: 'Initial Outreach',
            sent: 1000,
            delivered: 968,
            opens: 235,
            clicks: 32,
            replies: 8,
            conversions: 2,
            dropoffRate: 5.2,
            avgTimeToNextStep: 3.2
          },
          {
            stepNumber: 2,
            stepName: 'Follow-up',
            sent: 850,
            delivered: 831,
            opens: 178,
            clicks: 24,
            replies: 12,
            conversions: 6,
            dropoffRate: 12.1,
            avgTimeToNextStep: 7.5
          }
        ],
        dropoffAnalysis: [
          {
            stepNumber: 1,
            dropoffRate: 5.2,
            reasons: ['Hard bounces', 'Immediate unsubscribes'],
            recommendations: ['Improve email validation', 'Refine targeting']
          }
        ],
        bestPerformingStep: 2,
        worstPerformingStep: 3,
        conversionFunnel: [
          { step: 'Sent', count: 1000, conversionRate: 100, dropoff: 0 },
          { step: 'Delivered', count: 968, conversionRate: 96.8, dropoff: 32 },
          { step: 'Opened', count: 235, conversionRate: 24.3, dropoff: 733 },
          { step: 'Clicked', count: 32, conversionRate: 3.3, dropoff: 203 },
          { step: 'Replied', count: 8, conversionRate: 0.8, dropoff: 24 }
        ]
      }
    ];
  }

  private async getTemplateAnalytics(from: string, to: string, templateIds?: string[]): Promise<TemplateAnalytics[]> {
    // Mock implementation
    return [
      {
        templateId: 'cold_outreach_tech',
        templateName: 'Cold Outreach - Tech Companies',
        category: 'lead_generation',
        totalUses: 145,
        avgDeliveryRate: 96.8,
        avgOpenRate: 23.5,
        avgClickRate: 3.2,
        avgReplyRate: 1.1,
        avgConversionRate: 0.6,
        variants: [],
        subjectLinePerformance: [
          {
            subjectLine: 'Quick question about {{company_name}}\'s tech stack',
            openRate: 24.8,
            wordCount: 7,
            characterCount: 45,
            hasEmoji: false,
            hasPersonalization: true,
            sentimentScore: 0.1,
            spamScore: 0.2
          }
        ],
        contentPerformance: {
          readabilityScore: 8.5,
          sentimentScore: 0.3,
          wordCount: 156,
          imageCount: 0,
          linkCount: 2,
          ctaCount: 1,
          personalizationElements: 5,
          mostClickedLinks: [],
          mostEffectiveCTAs: []
        },
        bestSendTimes: [
          { hour: 9, openRate: 26.8, clickRate: 3.8, conversionRate: 0.7 },
          { hour: 10, openRate: 25.2, clickRate: 3.4, conversionRate: 0.6 }
        ]
      }
    ];
  }

  private async getDeliverabilityAnalytics(from: string, to: string): Promise<DeliverabilityAnalytics> {
    return {
      overallScore: 87.5,
      domainReputation: [],
      ipReputation: [],
      authenticationStatus: {
        spf: 'pass',
        dkim: 'pass',
        dmarc: 'pass'
      },
      bounceAnalysis: {
        totalBounces: 312,
        hardBounces: 89,
        softBounces: 223,
        bounceRate: 2.0,
        topBounceReasons: [
          { reason: 'Invalid email address', count: 89, percentage: 28.5 },
          { reason: 'Mailbox full', count: 67, percentage: 21.5 },
          { reason: 'Temporary server error', count: 45, percentage: 14.4 }
        ]
      },
      spamComplaintRate: 0.05,
      listHygiene: {
        totalSubscribers: 25000,
        activeSubscribers: 22500,
        inactiveSubscribers: 2000,
        invalidEmails: 345,
        duplicateEmails: 155,
        riskScore: 0.15,
        recommendations: [
          'Remove inactive subscribers older than 12 months',
          'Implement double opt-in for new subscribers'
        ]
      },
      recommendations: [
        {
          type: 'important',
          title: 'Reduce Hard Bounce Rate',
          description: 'Your hard bounce rate is above the recommended 2% threshold',
          impact: 'high',
          effort: 'medium',
          actionItems: [
            'Implement real-time email validation',
            'Remove hard bounced addresses immediately',
            'Review data collection processes'
          ]
        }
      ]
    };
  }

  private async getEngagementAnalytics(from: string, to: string): Promise<EngagementAnalytics> {
    return {
      overallEngagementScore: 8.2,
      heatmaps: [],
      clickMaps: [],
      readingPatterns: [],
      timeSpentReading: [],
      deviceEngagement: [],
      locationEngagement: [],
      mostEngagedSegments: []
    };
  }

  private async getConversionAnalytics(from: string, to: string): Promise<ConversionAnalytics> {
    return {
      totalConversions: 78,
      conversionRate: 0.5,
      revenue: 195000,
      averageOrderValue: 2500,
      conversionsByType: [],
      conversionFunnel: [],
      attributionModels: [],
      timeToConversion: [],
      topConvertingCampaigns: [],
      customerLifetimeValue: 7500
    };
  }

  private async getTrendData(from: string, to: string): Promise<TrendData[]> {
    // Mock trend data
    const trends: TrendData[] = [];
    const start = new Date(from);
    const end = new Date(to);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      trends.push({
        date: d.toISOString().split('T')[0],
        sent: Math.floor(Math.random() * 1000) + 500,
        delivered: Math.floor(Math.random() * 950) + 450,
        opens: Math.floor(Math.random() * 200) + 100,
        clicks: Math.floor(Math.random() * 30) + 10,
        replies: Math.floor(Math.random() * 10) + 2,
        conversions: Math.floor(Math.random() * 5) + 1,
        unsubscribes: Math.floor(Math.random() * 5),
        bounces: Math.floor(Math.random() * 20) + 5,
        deliveryRate: 95 + Math.random() * 4,
        openRate: 20 + Math.random() * 8,
        clickRate: 2 + Math.random() * 3,
        replyRate: 0.5 + Math.random() * 1.5,
        conversionRate: 0.2 + Math.random() * 0.8
      });
    }

    return trends;
  }

  private async updateAggregatedStats(event: any): Promise<void> {
    // Update real-time aggregated statistics
    const today = new Date().toISOString().split('T')[0];
    const key = `${today}_${event.type}`;

    const currentCount = this.aggregatedStats.get(key) || 0;
    this.aggregatedStats.set(key, currentCount + 1);
  }

  private getEventCount(eventType: string, date: string): number {
    const key = `${date}_${eventType}`;
    return this.aggregatedStats.get(key) || 0;
  }

  private calculateRate(numeratorEvent: string, denominatorEvent: string, date: string): number {
    const numerator = this.getEventCount(numeratorEvent, date);
    const denominator = this.getEventCount(denominatorEvent, date);
    return denominator > 0 ? (numerator / denominator) * 100 : 0;
  }

  private getRecentCampaigns(): any[] {
    return Array.from(this.campaignData.values()).slice(0, 5);
  }

  private async getTopPerformingTemplates(): Promise<any[]> {
    // Mock implementation
    return [
      { templateId: 'cold_outreach_tech', name: 'Cold Outreach - Tech', openRate: 24.8 },
      { templateId: 'follow_up_interested', name: 'Follow-up - Interested', openRate: 31.2 }
    ];
  }

  private async getDeliverabilityAlerts(): Promise<any[]> {
    return [
      {
        type: 'warning',
        message: 'Bounce rate increasing',
        severity: 'medium',
        timestamp: new Date().toISOString()
      }
    ];
  }

  private generateCampaignReport(analytics: EmailAnalytics, campaignId?: string): any {
    const campaign = analytics.campaigns.find(c => c.campaignId === campaignId);
    return campaign || analytics.campaigns[0];
  }

  private generateSequenceReport(analytics: EmailAnalytics, sequenceId?: string): any {
    const sequence = analytics.sequences.find(s => s.sequenceId === sequenceId);
    return sequence || analytics.sequences[0];
  }

  private generateTemplateReport(analytics: EmailAnalytics, templateId?: string): any {
    const template = analytics.templates.find(t => t.templateId === templateId);
    return template || analytics.templates[0];
  }

  private generateOverviewReport(analytics: EmailAnalytics): any {
    return {
      summary: analytics.overview,
      trends: analytics.trends,
      topCampaigns: analytics.campaigns.slice(0, 5),
      deliverabilityStatus: analytics.deliverability
    };
  }

  private initializeAnalytics(): void {
    // Initialize with some default data
    this.aggregatedStats.set(new Date().toISOString().split('T')[0] + '_sent', 0);
  }

  // GDPR compliance - export user data
  async exportUserData(userId: string): Promise<any> {
    const userEvents = this.events.filter(event => event.recipientId === userId);

    return {
      userId,
      emailEvents: userEvents,
      aggregatedStats: this.generateUserStats(userEvents),
      exportDate: new Date().toISOString()
    };
  }

  // GDPR compliance - delete user data
  async deleteUserData(userId: string): Promise<void> {
    this.events = this.events.filter(event => event.recipientId !== userId);
  }

  // Get tracking data for a specific email address
  async getEmailTrackingData(email: string): Promise<any[]> {
    return this.events.filter(event => event.recipientEmail === email);
  }

  // Delete tracking data for a specific email address
  async deleteEmailTrackingData(email: string): Promise<void> {
    this.events = this.events.filter(event => event.recipientEmail !== email);
  }

  private generateUserStats(events: any[]): any {
    const stats = {
      totalEvents: events.length,
      eventsByType: {} as Record<string, number>,
      firstEvent: null as string | null,
      lastEvent: null as string | null
    };

    events.forEach(event => {
      stats.eventsByType[event.type] = (stats.eventsByType[event.type] || 0) + 1;

      if (!stats.firstEvent || event.timestamp < stats.firstEvent) {
        stats.firstEvent = event.timestamp.toISOString();
      }

      if (!stats.lastEvent || event.timestamp > stats.lastEvent) {
        stats.lastEvent = event.timestamp.toISOString();
      }
    });

    return stats;
  }
}

// Export singleton instance
export const emailAnalyticsEngine = new EmailAnalyticsEngine();