import { emailComplianceService } from './email-compliance';

export interface DeliverabilityScore {
  overall: number; // 0-100
  breakdown: {
    reputation: number;
    authentication: number;
    content: number;
    engagement: number;
  };
  recommendations: string[];
  warnings: string[];
}

export interface DeliverabilityMetrics {
  deliveredRate: number;
  bounceRate: number;
  complaintsRate: number;
  openRate: number;
  clickRate: number;
  unsubscribeRate: number;
  spamRate: number;
}

export interface EmailContentAnalysis {
  spamScore: number;
  issues: Array<{
    type: 'warning' | 'error';
    category: 'content' | 'structure' | 'headers';
    message: string;
    suggestion?: string;
  }>;
  suggestions: string[];
}

export interface DomainReputation {
  domain: string;
  reputation: 'excellent' | 'good' | 'poor' | 'unknown';
  isBlacklisted: boolean;
  metrics: DeliverabilityMetrics;
  lastChecked: Date;
}

export class EmailDeliverabilityService {
  private domainReputations: Map<string, DomainReputation> = new Map();

  async analyzeEmailContent(html: string, text: string, subject: string): Promise<EmailContentAnalysis> {
    const issues: EmailContentAnalysis['issues'] = [];
    const suggestions: string[] = [];
    let spamScore = 0;

    // Content analysis
    const spamWords = [
      'free', 'urgent', 'limited time', 'act now', 'click here',
      'make money', 'earn cash', 'get paid', 'work from home',
      'no cost', '100% free', 'risk free', 'satisfaction guaranteed'
    ];

    const contentToAnalyze = `${subject} ${html} ${text}`.toLowerCase();

    spamWords.forEach(word => {
      if (contentToAnalyze.includes(word)) {
        spamScore += 5;
        if (spamScore <= 20) { // Don't repeat warnings
          issues.push({
            type: 'warning',
            category: 'content',
            message: `Contains spam trigger word: "${word}"`,
            suggestion: `Consider replacing "${word}" with alternative phrasing`
          });
        }
      }
    });

    // Subject line analysis
    if (subject.length > 50) {
      spamScore += 3;
      issues.push({
        type: 'warning',
        category: 'content',
        message: 'Subject line is too long (>50 characters)',
        suggestion: 'Keep subject lines under 50 characters for better deliverability'
      });
    }

    if (subject.includes('!!!') || subject.includes('???')) {
      spamScore += 5;
      issues.push({
        type: 'warning',
        category: 'content',
        message: 'Excessive punctuation in subject line',
        suggestion: 'Avoid excessive punctuation marks'
      });
    }

    if (/[A-Z]{5,}/.test(subject)) {
      spamScore += 5;
      issues.push({
        type: 'warning',
        category: 'content',
        message: 'Too much capitalization in subject line',
        suggestion: 'Avoid excessive capitalization'
      });
    }

    // HTML structure analysis
    if (html) {
      const imageCount = (html.match(/<img/g) || []).length;
      const textLength = html.replace(/<[^>]*>/g, '').length;

      if (imageCount > textLength / 100) {
        spamScore += 10;
        issues.push({
          type: 'warning',
          category: 'structure',
          message: 'High image-to-text ratio detected',
          suggestion: 'Balance images with text content'
        });
      }

      // Check for missing alt text
      const imagesWithoutAlt = (html.match(/<img(?![^>]*alt=)[^>]*>/g) || []).length;
      if (imagesWithoutAlt > 0) {
        issues.push({
          type: 'warning',
          category: 'structure',
          message: 'Images missing alt text',
          suggestion: 'Add descriptive alt text to all images'
        });
      }

      // Check for suspicious links
      const shortLinks = (html.match(/https?:\/\/(?:bit\.ly|tinyurl|t\.co|goo\.gl)/g) || []).length;
      if (shortLinks > 0) {
        spamScore += 10;
        issues.push({
          type: 'warning',
          category: 'content',
          message: 'Contains shortened URLs',
          suggestion: 'Use full URLs instead of link shorteners'
        });
      }
    }

    // Generate suggestions based on issues
    if (spamScore > 30) {
      suggestions.push('Content has high spam risk - consider revising');
    }

    if (spamScore > 15) {
      suggestions.push('Review content for spam trigger words');
    }

    if (!text && html) {
      suggestions.push('Include plain text version for better deliverability');
    }

    return {
      spamScore: Math.min(spamScore, 100),
      issues,
      suggestions
    };
  }

  async getDeliverabilityScore(
    fromDomain: string,
    contentAnalysis: EmailContentAnalysis,
    recipientCount: number
  ): Promise<DeliverabilityScore> {
    const domainReputation = await this.getDomainReputation(fromDomain);

    // Calculate scores (0-100)
    const reputationScore = this.calculateReputationScore(domainReputation);
    const authenticationScore = 85; // Would integrate with SPF/DKIM/DMARC check
    const contentScore = Math.max(0, 100 - contentAnalysis.spamScore);
    const engagementScore = this.calculateEngagementScore(domainReputation.metrics);

    const overallScore = Math.round(
      (reputationScore * 0.3) +
      (authenticationScore * 0.25) +
      (contentScore * 0.25) +
      (engagementScore * 0.2)
    );

    const recommendations: string[] = [];
    const warnings: string[] = [];

    // Generate recommendations
    if (reputationScore < 70) {
      recommendations.push('Improve sender reputation by reducing bounces and complaints');
    }

    if (contentScore < 70) {
      recommendations.push('Review email content to reduce spam score');
      recommendations.push(...contentAnalysis.suggestions);
    }

    if (engagementScore < 60) {
      recommendations.push('Improve engagement by personalizing content and optimizing send times');
    }

    if (recipientCount > 10000) {
      recommendations.push('Consider segmenting large sends to improve deliverability');
    }

    // Generate warnings
    if (overallScore < 50) {
      warnings.push('High risk of landing in spam folder');
    }

    if (domainReputation.isBlacklisted) {
      warnings.push('Sending domain is blacklisted');
    }

    return {
      overall: overallScore,
      breakdown: {
        reputation: reputationScore,
        authentication: authenticationScore,
        content: contentScore,
        engagement: engagementScore
      },
      recommendations,
      warnings
    };
  }

  async getDomainReputation(domain: string): Promise<DomainReputation> {
    const cached = this.domainReputations.get(domain);

    // Return cached if recent (within 24 hours)
    if (cached && (Date.now() - cached.lastChecked.getTime()) < 24 * 60 * 60 * 1000) {
      return cached;
    }

    // In real implementation, this would check against reputation services
    // For now, return mock data
    const reputation: DomainReputation = {
      domain,
      reputation: 'good',
      isBlacklisted: false,
      metrics: {
        deliveredRate: 0.95,
        bounceRate: 0.02,
        complaintsRate: 0.001,
        openRate: 0.22,
        clickRate: 0.03,
        unsubscribeRate: 0.005,
        spamRate: 0.01
      },
      lastChecked: new Date()
    };

    this.domainReputations.set(domain, reputation);
    return reputation;
  }

  private calculateReputationScore(reputation: DomainReputation): number {
    const metrics = reputation.metrics;

    let score = 100;

    // Penalize high bounce rate
    if (metrics.bounceRate > 0.05) score -= 30;
    else if (metrics.bounceRate > 0.02) score -= 15;

    // Penalize high complaint rate
    if (metrics.complaintsRate > 0.001) score -= 25;

    // Penalize high spam rate
    if (metrics.spamRate > 0.02) score -= 20;

    // Reward good engagement
    if (metrics.openRate > 0.25) score += 5;
    if (metrics.clickRate > 0.05) score += 5;

    // Reputation modifier
    switch (reputation.reputation) {
      case 'excellent': score += 10; break;
      case 'poor': score -= 30; break;
      case 'unknown': score -= 10; break;
    }

    if (reputation.isBlacklisted) score -= 50;

    return Math.max(0, Math.min(100, score));
  }

  private calculateEngagementScore(metrics: DeliverabilityMetrics): number {
    let score = 50; // Base score

    // Open rate contribution (0-40 points)
    score += Math.min(40, metrics.openRate * 160);

    // Click rate contribution (0-30 points)
    score += Math.min(30, metrics.clickRate * 600);

    // Unsubscribe rate penalty
    if (metrics.unsubscribeRate > 0.01) score -= 20;
    else if (metrics.unsubscribeRate > 0.005) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  async warmUpDomain(domain: string, warmUpPlan: {
    startVolume: number;
    maxVolume: number;
    incrementDays: number;
    incrementAmount: number;
  }): Promise<{
    currentDay: number;
    recommendedVolume: number;
    nextIncrement: Date;
  }> {
    // Domain warm-up logic
    const currentDay = 1; // Would track this in database
    const recommendedVolume = Math.min(
      warmUpPlan.maxVolume,
      warmUpPlan.startVolume + (Math.floor(currentDay / warmUpPlan.incrementDays) * warmUpPlan.incrementAmount)
    );

    return {
      currentDay,
      recommendedVolume,
      nextIncrement: new Date(Date.now() + warmUpPlan.incrementDays * 24 * 60 * 60 * 1000)
    };
  }

  async checkBlacklists(domain: string): Promise<{
    isBlacklisted: boolean;
    blacklists: Array<{
      name: string;
      listed: boolean;
      details?: string;
    }>;
  }> {
    // In real implementation, check against major blacklists
    const blacklists = [
      { name: 'Spamhaus', listed: false },
      { name: 'SURBL', listed: false },
      { name: 'Barracuda', listed: false }
    ];

    return {
      isBlacklisted: blacklists.some(bl => bl.listed),
      blacklists
    };
  }

  generateDeliverabilityReport(
    deliverabilityScore: DeliverabilityScore,
    contentAnalysis: EmailContentAnalysis,
    domainReputation: DomainReputation
  ): string {
    return `
## Deliverability Report

### Overall Score: ${deliverabilityScore.overall}/100

### Breakdown:
- **Reputation**: ${deliverabilityScore.breakdown.reputation}/100
- **Authentication**: ${deliverabilityScore.breakdown.authentication}/100
- **Content Quality**: ${deliverabilityScore.breakdown.content}/100
- **Engagement**: ${deliverabilityScore.breakdown.engagement}/100

### Domain Reputation: ${domainReputation.reputation}
- Delivered Rate: ${(domainReputation.metrics.deliveredRate * 100).toFixed(1)}%
- Bounce Rate: ${(domainReputation.metrics.bounceRate * 100).toFixed(2)}%
- Open Rate: ${(domainReputation.metrics.openRate * 100).toFixed(1)}%

### Recommendations:
${deliverabilityScore.recommendations.map(rec => `- ${rec}`).join('\n')}

### Warnings:
${deliverabilityScore.warnings.map(warn => `⚠️ ${warn}`).join('\n')}
`;
  }
}

export const emailDeliverabilityService = new EmailDeliverabilityService();