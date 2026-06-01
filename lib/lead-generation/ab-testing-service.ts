import { db } from '@/lib/db';

export interface ABTestVariant {
  id: string;
  name: string;
  subject: string;
  content: string;
  weight: number; // Percentage of traffic to allocate (0-100)
}

export interface ABTestConfig {
  name: string;
  description?: string;
  variants: ABTestVariant[];
  duration: number; // Days
  sampleSize: number; // Minimum sends per variant
  primaryMetric: 'open_rate' | 'click_rate' | 'reply_rate' | 'conversion_rate';
  confidenceLevel: number; // 90, 95, or 99
}

export interface ABTestResult {
  testId: string;
  variant: ABTestVariant;
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    replied: number;
    converted: number;
    openRate: number;
    clickRate: number;
    replyRate: number;
    conversionRate: number;
  };
  isWinner?: boolean;
  confidenceInterval?: {
    lower: number;
    upper: number;
  };
  pValue?: number;
}

export interface ABTest {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  variants: ABTestVariant[];
  config: ABTestConfig;
  results: ABTestResult[];
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  winningVariant?: string;
}

export class ABTestingService {
  private static instance: ABTestingService;

  private constructor() {}

  static getInstance(): ABTestingService {
    if (!ABTestingService.instance) {
      ABTestingService.instance = new ABTestingService();
    }
    return ABTestingService.instance;
  }

  /**
   * Create a new A/B test for email templates
   */
  async createTest(userId: string, config: ABTestConfig): Promise<ABTest> {
    // Validate variants
    if (config.variants.length < 2) {
      throw new Error('A/B test requires at least 2 variants');
    }

    const totalWeight = config.variants.reduce((sum, v) => sum + v.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new Error('Variant weights must sum to 100%');
    }

    // For now, store in a mock format since we don't have ABTest table
    // In production, this would be stored in the database
    const test: ABTest = {
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      name: config.name,
      description: config.description,
      status: 'draft',
      variants: config.variants,
      config,
      results: config.variants.map(variant => ({
        testId: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        variant,
        metrics: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          replied: 0,
          converted: 0,
          openRate: 0,
          clickRate: 0,
          replyRate: 0,
          conversionRate: 0,
        },
      })),
      createdAt: new Date(),
    };

    // Store test metadata in outreach activity metadata for now
    await db.outreachActivity.create({
      data: {
        userId,
        leadId: '', // Special marker for AB test metadata
        type: 'AB_TEST_CONFIG',
        status: 'CREATED',
        scheduledAt: new Date(),
        metadata: {
          testId: test.id,
          testConfig: test,
          type: 'ab_test_config',
        },
      },
    });

    return test;
  }

  /**
   * Start running an A/B test
   */
  async startTest(userId: string, testId: string): Promise<ABTest> {
    const test = await this.getTest(userId, testId);
    if (!test) {
      throw new Error('Test not found');
    }

    if (test.status !== 'draft') {
      throw new Error('Only draft tests can be started');
    }

    test.status = 'running';
    test.startedAt = new Date();

    // Update test status in database
    await this.updateTestInDatabase(test);

    return test;
  }

  /**
   * Get variant for a specific lead (traffic allocation)
   */
  async getVariantForLead(testId: string, leadId: string): Promise<ABTestVariant | null> {
    const test = await this.getTestById(testId);
    if (!test || test.status !== 'running') {
      return null;
    }

    // Use lead ID for consistent allocation
    const hash = this.hashString(leadId + testId);
    const random = (hash % 10000) / 100; // 0-99.99

    let cumulativeWeight = 0;
    for (const variant of test.variants) {
      cumulativeWeight += variant.weight;
      if (random < cumulativeWeight) {
        return variant;
      }
    }

    return test.variants[0]; // Fallback
  }

  /**
   * Record test activity (email sent with variant)
   */
  async recordTestActivity(
    testId: string,
    variantId: string,
    leadId: string,
    activityData: {
      type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'converted';
      timestamp: Date;
      metadata?: any;
    }
  ): Promise<void> {
    // Record the activity in outreach activities table
    await db.outreachActivity.create({
      data: {
        userId: '', // Would be populated from the test
        leadId,
        type: 'AB_TEST_ACTIVITY',
        status: 'COMPLETED',
        scheduledAt: activityData.timestamp,
        metadata: {
          testId,
          variantId,
          activityType: activityData.type,
          testActivity: true,
          ...activityData.metadata,
        },
      },
    });
  }

  /**
   * Calculate test results and statistical significance
   */
  async calculateResults(userId: string, testId: string): Promise<ABTestResult[]> {
    const test = await this.getTest(userId, testId);
    if (!test) {
      throw new Error('Test not found');
    }

    // Get all activities for this test
    const activities = await db.outreachActivity.findMany({
      where: {
        metadata: {
          path: ['testId'],
          equals: testId,
        },
      },
    });

    const results: ABTestResult[] = [];

    for (const variant of test.variants) {
      const variantActivities = activities.filter(
        a => a.metadata?.variantId === variant.id
      );

      const metrics = this.calculateVariantMetrics(variantActivities);

      results.push({
        testId,
        variant,
        metrics,
      });
    }

    // Calculate statistical significance
    if (results.length >= 2) {
      this.calculateStatisticalSignificance(results, test.config.primaryMetric);
    }

    return results;
  }

  /**
   * Determine test winner and complete test
   */
  async completeTest(userId: string, testId: string): Promise<ABTest> {
    const test = await this.getTest(userId, testId);
    if (!test) {
      throw new Error('Test not found');
    }

    const results = await this.calculateResults(userId, testId);
    test.results = results;

    // Find winner based on primary metric
    const winner = this.determineWinner(results, test.config.primaryMetric);
    if (winner) {
      test.winningVariant = winner.variant.id;
    }

    test.status = 'completed';
    test.completedAt = new Date();

    await this.updateTestInDatabase(test);

    return test;
  }

  /**
   * Get all tests for a user
   */
  async getUserTests(userId: string): Promise<ABTest[]> {
    const testActivities = await db.outreachActivity.findMany({
      where: {
        userId,
        type: 'AB_TEST_CONFIG',
      },
      orderBy: { createdAt: 'desc' },
    });

    return testActivities.map(activity => activity.metadata?.testConfig as ABTest).filter(Boolean);
  }

  /**
   * Get a specific test
   */
  async getTest(userId: string, testId: string): Promise<ABTest | null> {
    const activity = await db.outreachActivity.findFirst({
      where: {
        userId,
        type: 'AB_TEST_CONFIG',
        metadata: {
          path: ['testId'],
          equals: testId,
        },
      },
    });

    return activity?.metadata?.testConfig as ABTest || null;
  }

  private async getTestById(testId: string): Promise<ABTest | null> {
    const activity = await db.outreachActivity.findFirst({
      where: {
        type: 'AB_TEST_CONFIG',
        metadata: {
          path: ['testId'],
          equals: testId,
        },
      },
    });

    return activity?.metadata?.testConfig as ABTest || null;
  }

  private async updateTestInDatabase(test: ABTest): Promise<void> {
    await db.outreachActivity.updateMany({
      where: {
        type: 'AB_TEST_CONFIG',
        metadata: {
          path: ['testId'],
          equals: test.id,
        },
      },
      data: {
        metadata: {
          testId: test.id,
          testConfig: test,
          type: 'ab_test_config',
        },
      },
    });
  }

  private calculateVariantMetrics(activities: any[]) {
    const sent = activities.filter(a => a.metadata?.activityType === 'sent').length;
    const delivered = activities.filter(a => a.metadata?.activityType === 'delivered').length;
    const opened = activities.filter(a => a.metadata?.activityType === 'opened').length;
    const clicked = activities.filter(a => a.metadata?.activityType === 'clicked').length;
    const replied = activities.filter(a => a.metadata?.activityType === 'replied').length;
    const converted = activities.filter(a => a.metadata?.activityType === 'converted').length;

    return {
      sent,
      delivered,
      opened,
      clicked,
      replied,
      converted,
      openRate: sent > 0 ? (opened / sent) * 100 : 0,
      clickRate: sent > 0 ? (clicked / sent) * 100 : 0,
      replyRate: sent > 0 ? (replied / sent) * 100 : 0,
      conversionRate: sent > 0 ? (converted / sent) * 100 : 0,
    };
  }

  private calculateStatisticalSignificance(
    results: ABTestResult[],
    primaryMetric: string
  ): void {
    // Simplified statistical significance calculation
    // In production, use proper statistical libraries

    const control = results[0];

    for (let i = 1; i < results.length; i++) {
      const variant = results[i];

      const controlRate = this.getMetricValue(control.metrics, primaryMetric);
      const variantRate = this.getMetricValue(variant.metrics, primaryMetric);

      // Simple z-test approximation
      const controlSample = control.metrics.sent;
      const variantSample = variant.metrics.sent;

      if (controlSample > 30 && variantSample > 30) {
        const pooledRate = (controlRate * controlSample + variantRate * variantSample) /
                          (controlSample + variantSample);

        const se = Math.sqrt(pooledRate * (1 - pooledRate) * (1/controlSample + 1/variantSample));
        const zScore = Math.abs(variantRate - controlRate) / se;

        // Approximate p-value (for z-score)
        variant.pValue = 2 * (1 - this.normalCDF(Math.abs(zScore)));

        // Confidence interval (approximate)
        const marginOfError = 1.96 * Math.sqrt(variantRate * (1 - variantRate) / variantSample);
        variant.confidenceInterval = {
          lower: Math.max(0, variantRate - marginOfError),
          upper: Math.min(1, variantRate + marginOfError),
        };

        // Determine if significantly better
        if (variant.pValue < 0.05 && variantRate > controlRate) {
          variant.isWinner = true;
        }
      }
    }
  }

  private determineWinner(results: ABTestResult[], primaryMetric: string): ABTestResult | null {
    const significantResults = results.filter(r => r.isWinner);

    if (significantResults.length > 0) {
      return significantResults.reduce((best, current) =>
        this.getMetricValue(current.metrics, primaryMetric) >
        this.getMetricValue(best.metrics, primaryMetric) ? current : best
      );
    }

    // If no statistically significant winner, return the best performing
    return results.reduce((best, current) =>
      this.getMetricValue(current.metrics, primaryMetric) >
      this.getMetricValue(best.metrics, primaryMetric) ? current : best
    );
  }

  private getMetricValue(metrics: any, primaryMetric: string): number {
    switch (primaryMetric) {
      case 'open_rate':
        return metrics.openRate / 100;
      case 'click_rate':
        return metrics.clickRate / 100;
      case 'reply_rate':
        return metrics.replyRate / 100;
      case 'conversion_rate':
        return metrics.conversionRate / 100;
      default:
        return metrics.openRate / 100;
    }
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private normalCDF(z: number): number {
    // Approximate normal CDF using Abramowitz and Stegun approximation
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.8212560 + t * 1.3302744))));

    return z >= 0 ? 1 - prob : prob;
  }
}