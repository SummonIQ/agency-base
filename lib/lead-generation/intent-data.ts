/**
 * Intent Data Service for Warm Prospect Identification
 * Identifies prospects showing buying signals and active research behavior
 */

export interface IntentSignal {
  type: 'search' | 'content_engagement' | 'competitor_research' | 'job_posting' |
        'funding_activity' | 'tech_adoption' | 'hiring_activity' | 'product_research';
  strength: 'low' | 'medium' | 'high' | 'very_high';
  timestamp: string;
  source: string;
  description: string;
  keywords: string[];
  confidence: number; // 0-1 score
  relevance_score: number; // 0-1 how relevant to your offering
}

export interface IntentProfile {
  companyId: string;
  companyName: string;
  domain: string;
  overallScore: number; // 0-100 composite intent score
  signals: IntentSignal[];
  categories: {
    buying_stage: 'awareness' | 'consideration' | 'decision' | 'post_purchase';
    urgency: 'low' | 'medium' | 'high';
    fit_score: number; // How good a fit this prospect is
    engagement_level: 'cold' | 'warm' | 'hot' | 'red_hot';
  };
  recommendations: {
    timing: 'immediate' | 'within_week' | 'within_month' | 'nurture';
    approach: 'direct_outreach' | 'content_marketing' | 'social_engagement' | 'referral';
    messaging: string[];
    priority: number; // 1-10 priority ranking
  };
  lastUpdated: string;
  trends: {
    score_change_7d: number;
    score_change_30d: number;
    trending: 'up' | 'down' | 'stable';
  };
}

export interface WarmProspectAlert {
  id: string;
  companyName: string;
  domain: string;
  alertType: 'new_signal' | 'score_increase' | 'buying_stage_change' | 'competitor_mention';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  message: string;
  actionable: boolean;
  recommendedActions: string[];
  createdAt: string;
  expiresAt: string;
}

/**
 * Intent data aggregator and analyzer
 * Combines multiple data sources to identify buying intent
 */
export class IntentDataService {
  private intentProviders: Map<string, any> = new Map();
  private scoringWeights = {
    search: 0.3,
    content_engagement: 0.25,
    competitor_research: 0.2,
    job_posting: 0.15,
    funding_activity: 0.1,
    tech_adoption: 0.15,
    hiring_activity: 0.1,
    product_research: 0.2
  };

  constructor() {
    this.initializeProviders();
  }

  /**
   * Get intent profile for a specific company
   */
  async getIntentProfile(domain: string): Promise<IntentProfile | null> {
    try {
      const signals = await this.collectIntentSignals(domain);

      if (signals.length === 0) {
        return null;
      }

      const overallScore = this.calculateOverallScore(signals);
      const categories = this.categorizeIntent(signals, overallScore);
      const recommendations = this.generateRecommendations(signals, categories);
      const trends = await this.calculateTrends(domain);

      return {
        companyId: this.generateCompanyId(domain),
        companyName: await this.getCompanyName(domain),
        domain,
        overallScore,
        signals: signals.sort((a, b) => b.confidence - a.confidence),
        categories,
        recommendations,
        lastUpdated: new Date().toISOString(),
        trends
      };

    } catch (error) {
      console.error('Error getting intent profile:', error);
      return null;
    }
  }

  /**
   * Find warm prospects based on intent signals
   */
  async findWarmProspects(filters: {
    minScore?: number;
    buyingStage?: string[];
    urgency?: string[];
    industries?: string[];
    companySize?: string;
    limit?: number;
  } = {}): Promise<IntentProfile[]> {
    try {
      // In a real implementation, this would query a database of intent profiles
      // For now, we'll simulate with some example data
      const mockProfiles = await this.generateMockWarmProspects(filters);

      return mockProspects
        .filter(profile => {
          if (filters.minScore && profile.overallScore < filters.minScore) return false;
          if (filters.buyingStage && !filters.buyingStage.includes(profile.categories.buying_stage)) return false;
          if (filters.urgency && !filters.urgency.includes(profile.categories.urgency)) return false;
          return true;
        })
        .sort((a, b) => b.overallScore - a.overallScore)
        .slice(0, filters.limit || 50);

    } catch (error) {
      console.error('Error finding warm prospects:', error);
      return [];
    }
  }

  /**
   * Get real-time alerts for warm prospects
   */
  async getWarmProspectAlerts(filters: {
    priority?: string[];
    alertType?: string[];
    since?: string;
    limit?: number;
  } = {}): Promise<WarmProspectAlert[]> {
    try {
      const mockAlerts = this.generateMockAlerts();

      return mockAlerts
        .filter(alert => {
          if (filters.priority && !filters.priority.includes(alert.priority)) return false;
          if (filters.alertType && !filters.alertType.includes(alert.alertType)) return false;
          if (filters.since && alert.createdAt < filters.since) return false;
          return true;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, filters.limit || 20);

    } catch (error) {
      console.error('Error getting alerts:', error);
      return [];
    }
  }

  /**
   * Analyze intent signals for a company
   */
  async analyzeCompanyIntent(domain: string, context: {
    yourSolution?: string;
    targetPersonas?: string[];
    competitors?: string[];
  } = {}): Promise<{
    score: number;
    insights: string[];
    nextBestActions: string[];
    timing: string;
    personalization: string[];
  }> {
    const profile = await this.getIntentProfile(domain);

    if (!profile) {
      return {
        score: 0,
        insights: ['No intent data available for this company'],
        nextBestActions: ['Add to nurture campaign', 'Monitor for future signals'],
        timing: 'future',
        personalization: []
      };
    }

    const insights = this.generateIntentInsights(profile, context);
    const nextBestActions = this.generateNextBestActions(profile, context);
    const timing = this.determineTiming(profile);
    const personalization = this.generatePersonalization(profile, context);

    return {
      score: profile.overallScore,
      insights,
      nextBestActions,
      timing,
      personalization
    };
  }

  /**
   * Collect intent signals from multiple sources
   */
  private async collectIntentSignals(domain: string): Promise<IntentSignal[]> {
    const signals: IntentSignal[] = [];

    // Simulate collecting from different sources
    // In production, these would be real API calls

    // Search intent signals
    const searchSignals = await this.getSearchIntentSignals(domain);
    signals.push(...searchSignals);

    // Content engagement signals
    const contentSignals = await this.getContentEngagementSignals(domain);
    signals.push(...contentSignals);

    // Job posting signals
    const jobSignals = await this.getJobPostingSignals(domain);
    signals.push(...jobSignals);

    // Tech adoption signals
    const techSignals = await this.getTechAdoptionSignals(domain);
    signals.push(...techSignals);

    // Funding activity signals
    const fundingSignals = await this.getFundingActivitySignals(domain);
    signals.push(...fundingSignals);

    return signals;
  }

  /**
   * Calculate overall intent score
   */
  private calculateOverallScore(signals: IntentSignal[]): number {
    let totalScore = 0;
    let totalWeight = 0;

    for (const signal of signals) {
      const weight = this.scoringWeights[signal.type] || 0.1;
      const signalScore = this.getSignalNumericScore(signal);
      totalScore += signalScore * weight * signal.confidence;
      totalWeight += weight;
    }

    return totalWeight > 0 ? Math.min(100, Math.round((totalScore / totalWeight) * 100)) : 0;
  }

  /**
   * Categorize intent based on signals
   */
  private categorizeIntent(signals: IntentSignal[], overallScore: number): IntentProfile['categories'] {
    const recentHighValueSignals = signals.filter(s =>
      s.strength === 'high' || s.strength === 'very_high'
    ).length;

    const buyingStage = this.determineBuyingStage(signals);
    const urgency = overallScore > 80 ? 'high' : overallScore > 60 ? 'medium' : 'low';
    const fitScore = this.calculateFitScore(signals);
    const engagementLevel = this.determineEngagementLevel(overallScore, recentHighValueSignals);

    return {
      buying_stage: buyingStage,
      urgency,
      fit_score: fitScore,
      engagement_level: engagementLevel
    };
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(signals: IntentSignal[], categories: IntentProfile['categories']): IntentProfile['recommendations'] {
    const timing = categories.urgency === 'high' ? 'immediate' :
                  categories.urgency === 'medium' ? 'within_week' : 'within_month';

    const approach = categories.engagement_level === 'hot' || categories.engagement_level === 'red_hot'
      ? 'direct_outreach' : 'content_marketing';

    const messagingThemes = this.generateMessagingThemes(signals, categories);
    const priority = this.calculatePriority(categories);

    return {
      timing,
      approach,
      messaging: messagingThemes,
      priority
    };
  }

  /**
   * Mock data generators for development
   */
  private async generateMockWarmProspects(filters: any): Promise<IntentProfile[]> {
    const mockCompanies = [
      { domain: 'acme-corp.com', name: 'Acme Corporation' },
      { domain: 'techstart.io', name: 'TechStart' },
      { domain: 'growthco.com', name: 'Growth Co' },
      { domain: 'innovatetech.com', name: 'InnovateTech' },
      { domain: 'scaleup.ai', name: 'ScaleUp AI' }
    ];

    const profiles: IntentProfile[] = [];

    for (const company of mockCompanies) {
      const profile = await this.getIntentProfile(company.domain);
      if (profile) {
        profiles.push(profile);
      }
    }

    return profiles;
  }

  private generateMockAlerts(): WarmProspectAlert[] {
    return [
      {
        id: '1',
        companyName: 'Acme Corporation',
        domain: 'acme-corp.com',
        alertType: 'score_increase',
        priority: 'high',
        message: 'Intent score increased by 35 points in the last 7 days',
        actionable: true,
        recommendedActions: ['Send personalized email', 'Connect on LinkedIn'],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        companyName: 'TechStart',
        domain: 'techstart.io',
        alertType: 'new_signal',
        priority: 'medium',
        message: 'New job posting for VP of Engineering detected',
        actionable: true,
        recommendedActions: ['Research hiring manager', 'Prepare growth-focused pitch'],
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  /**
   * Mock signal generators
   */
  private async getSearchIntentSignals(domain: string): Promise<IntentSignal[]> {
    // Mock search intent based on domain
    if (Math.random() > 0.3) {
      return [{
        type: 'search',
        strength: 'medium',
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'Search Intelligence',
        description: 'Company employees searched for CRM solutions',
        keywords: ['CRM software', 'sales automation', 'lead management'],
        confidence: 0.7,
        relevance_score: 0.8
      }];
    }
    return [];
  }

  private async getContentEngagementSignals(domain: string): Promise<IntentSignal[]> {
    if (Math.random() > 0.4) {
      return [{
        type: 'content_engagement',
        strength: 'high',
        timestamp: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'Content Analytics',
        description: 'Multiple employees engaged with industry whitepapers',
        keywords: ['digital transformation', 'automation', 'efficiency'],
        confidence: 0.8,
        relevance_score: 0.9
      }];
    }
    return [];
  }

  private async getJobPostingSignals(domain: string): Promise<IntentSignal[]> {
    if (Math.random() > 0.6) {
      return [{
        type: 'job_posting',
        strength: 'high',
        timestamp: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'Job Board Monitor',
        description: 'Posted VP of Sales position indicating growth phase',
        keywords: ['VP Sales', 'revenue growth', 'team expansion'],
        confidence: 0.9,
        relevance_score: 0.8
      }];
    }
    return [];
  }

  private async getTechAdoptionSignals(domain: string): Promise<IntentSignal[]> {
    if (Math.random() > 0.5) {
      return [{
        type: 'tech_adoption',
        strength: 'medium',
        timestamp: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'Tech Stack Analysis',
        description: 'Recently adopted new marketing automation platform',
        keywords: ['marketing automation', 'tech stack', 'integration'],
        confidence: 0.6,
        relevance_score: 0.7
      }];
    }
    return [];
  }

  private async getFundingActivitySignals(domain: string): Promise<IntentSignal[]> {
    if (Math.random() > 0.8) {
      return [{
        type: 'funding_activity',
        strength: 'very_high',
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'Funding Database',
        description: 'Completed Series B funding round',
        keywords: ['Series B', 'growth funding', 'expansion'],
        confidence: 0.95,
        relevance_score: 0.9
      }];
    }
    return [];
  }

  /**
   * Helper methods
   */
  private initializeProviders(): void {
    // In production, initialize real intent data providers
    // G2, Bombora, TechTarget, etc.
  }

  private generateCompanyId(domain: string): string {
    return `intent_${domain.replace(/\./g, '_')}_${Date.now()}`;
  }

  private async getCompanyName(domain: string): Promise<string> {
    // In production, would lookup company name
    return domain.split('.')[0].replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  private getSignalNumericScore(signal: IntentSignal): number {
    const strengthScores = { low: 25, medium: 50, high: 75, very_high: 100 };
    return strengthScores[signal.strength];
  }

  private determineBuyingStage(signals: IntentSignal[]): 'awareness' | 'consideration' | 'decision' | 'post_purchase' {
    const hasHighIntentSignals = signals.some(s => s.strength === 'high' || s.strength === 'very_high');
    const hasCompetitorResearch = signals.some(s => s.type === 'competitor_research');
    const hasFundingActivity = signals.some(s => s.type === 'funding_activity');

    if (hasFundingActivity || hasCompetitorResearch) return 'decision';
    if (hasHighIntentSignals) return 'consideration';
    return 'awareness';
  }

  private calculateFitScore(signals: IntentSignal[]): number {
    const avgRelevance = signals.reduce((sum, s) => sum + s.relevance_score, 0) / signals.length;
    return Math.round(avgRelevance * 100);
  }

  private determineEngagementLevel(score: number, highValueSignals: number): 'cold' | 'warm' | 'hot' | 'red_hot' {
    if (score > 85 && highValueSignals > 2) return 'red_hot';
    if (score > 70) return 'hot';
    if (score > 50) return 'warm';
    return 'cold';
  }

  private async calculateTrends(domain: string): Promise<IntentProfile['trends']> {
    // Mock trend calculation
    return {
      score_change_7d: Math.round((Math.random() - 0.5) * 30),
      score_change_30d: Math.round((Math.random() - 0.5) * 50),
      trending: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable'
    };
  }

  private generateIntentInsights(profile: IntentProfile, context: any): string[] {
    const insights = [];

    if (profile.categories.engagement_level === 'red_hot') {
      insights.push('🔥 This prospect is extremely hot - showing multiple high-value buying signals');
    }

    if (profile.signals.some(s => s.type === 'funding_activity')) {
      insights.push('💰 Recent funding activity indicates budget availability for new solutions');
    }

    if (profile.signals.some(s => s.type === 'job_posting')) {
      insights.push('👥 Active hiring suggests growth phase and potential tool adoption');
    }

    return insights;
  }

  private generateNextBestActions(profile: IntentProfile, context: any): string[] {
    const actions = [];

    if (profile.categories.urgency === 'high') {
      actions.push('Send personalized outreach within 24 hours');
      actions.push('Connect with decision makers on LinkedIn');
    } else {
      actions.push('Add to nurture sequence');
      actions.push('Monitor for additional signals');
    }

    return actions;
  }

  private determineTiming(profile: IntentProfile): string {
    if (profile.categories.urgency === 'high') return 'immediate';
    if (profile.categories.urgency === 'medium') return 'within_week';
    return 'nurture';
  }

  private generatePersonalization(profile: IntentProfile, context: any): string[] {
    const personalization = [];

    const fundingSignal = profile.signals.find(s => s.type === 'funding_activity');
    if (fundingSignal) {
      personalization.push(`Congratulations on your recent funding round`);
    }

    const jobSignal = profile.signals.find(s => s.type === 'job_posting');
    if (jobSignal) {
      personalization.push(`I noticed you're scaling your team`);
    }

    return personalization;
  }

  private generateMessagingThemes(signals: IntentSignal[], categories: IntentProfile['categories']): string[] {
    const themes = [];

    if (categories.buying_stage === 'decision') {
      themes.push('ROI and implementation timeline focus');
      themes.push('Competitive differentiation');
    } else if (categories.buying_stage === 'consideration') {
      themes.push('Feature comparison and case studies');
      themes.push('Integration capabilities');
    } else {
      themes.push('Educational content and industry insights');
      themes.push('Problem identification and solution awareness');
    }

    return themes;
  }

  private calculatePriority(categories: IntentProfile['categories']): number {
    let priority = 5; // Base priority

    if (categories.engagement_level === 'red_hot') priority += 3;
    if (categories.engagement_level === 'hot') priority += 2;
    if (categories.urgency === 'high') priority += 2;
    if (categories.fit_score > 80) priority += 1;

    return Math.min(10, priority);
  }
}