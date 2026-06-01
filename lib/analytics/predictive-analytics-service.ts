import type { RevenueAnalytics, DealPipeline } from './revenue-analytics-service';

export interface PredictiveInsight {
  id: string;
  type: 'revenue' | 'churn' | 'opportunity' | 'risk';
  title: string;
  description: string;
  confidence: number; // 0-100
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
  recommendations: string[];
  data?: any;
}

export interface RevenueProjection {
  period: string;
  conservative: number;
  likely: number;
  optimistic: number;
  confidence: number;
  factors: string[];
}

export interface ChurnPrediction {
  clientId: string;
  clientName: string;
  churnProbability: number;
  riskFactors: string[];
  retentionActions: string[];
  expectedLoss: number;
}

export interface OpportunityPrediction {
  type: 'upsell' | 'cross_sell' | 'renewal' | 'new_market';
  description: string;
  potential: number;
  probability: number;
  timeline: string;
  actions: string[];
}

export class PredictiveAnalyticsService {
  
  /**
   * Generate predictive insights based on historical data
   */
  static generatePredictiveInsights(analyticsData: RevenueAnalytics): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];

    // Revenue prediction insights
    insights.push(...this.generateRevenueInsights(analyticsData));
    
    // Churn prediction insights
    insights.push(...this.generateChurnInsights(analyticsData));
    
    // Opportunity insights
    insights.push(...this.generateOpportunityInsights(analyticsData));
    
    // Risk assessment insights
    insights.push(...this.generateRiskInsights(analyticsData));

    return insights.sort((a, b) => {
      // Sort by impact and confidence
      const impactWeight = { high: 3, medium: 2, low: 1 };
      const aScore = impactWeight[a.impact] * (a.confidence / 100);
      const bScore = impactWeight[b.impact] * (b.confidence / 100);
      return bScore - aScore;
    });
  }

  /**
   * Generate advanced revenue projections
   */
  static generateRevenueProjections(analyticsData: RevenueAnalytics): RevenueProjection[] {
    const projections: RevenueProjection[] = [];
    const currentRevenue = analyticsData.metrics.totalRevenue;
    const pipelineValue = analyticsData.metrics.pipelineValue;
    const conversionRate = analyticsData.metrics.conversionRate / 100;

    // Generate projections for next 6 months
    for (let month = 1; month <= 6; month++) {
      const baseGrowthRate = this.calculateGrowthRate(analyticsData.trends);
      const seasonalFactor = this.getSeasonalFactor(month);
      const marketFactor = this.getMarketFactor();

      const baseProjection = currentRevenue * (1 + (baseGrowthRate * month / 12));
      const pipelineContribution = pipelineValue * conversionRate * (month / 6);
      
      const conservative = Math.floor(baseProjection * 0.8 + pipelineContribution * 0.6);
      const likely = Math.floor(baseProjection * seasonalFactor + pipelineContribution * 0.8);
      const optimistic = Math.floor(baseProjection * seasonalFactor * marketFactor + pipelineContribution);

      projections.push({
        period: this.getMonthName(month),
        conservative,
        likely,
        optimistic,
        confidence: Math.max(95 - (month * 10), 60), // Confidence decreases over time
        factors: [
          `Historical growth rate: ${(baseGrowthRate * 100).toFixed(1)}%`,
          `Pipeline conversion: ${(conversionRate * 100).toFixed(1)}%`,
          `Seasonal factor: ${((seasonalFactor - 1) * 100).toFixed(1)}%`,
          `Market conditions: ${((marketFactor - 1) * 100).toFixed(1)}%`
        ]
      });
    }

    return projections;
  }

  /**
   * Predict client churn risk
   */
  static predictChurnRisk(analyticsData: RevenueAnalytics): ChurnPrediction[] {
    // Mock churn predictions based on client behavior patterns
    return [
      {
        clientId: '1',
        clientName: 'StartupXYZ',
        churnProbability: 0.75,
        riskFactors: [
          'No activity in 30+ days',
          'Reduced project scope in last quarter',
          'Payment delays increasing',
          'Key contact left company'
        ],
        retentionActions: [
          'Schedule immediate check-in call',
          'Offer discounted maintenance package',
          'Introduce new stakeholder relationships',
          'Provide additional value through consultation'
        ],
        expectedLoss: 45000
      },
      {
        clientId: '2',
        clientName: 'Local Retail Co',
        churnProbability: 0.45,
        riskFactors: [
          'Budget constraints mentioned',
          'Longer decision cycles',
          'Reduced meeting frequency'
        ],
        retentionActions: [
          'Propose phased project approach',
          'Demonstrate clear ROI',
          'Offer payment plan options'
        ],
        expectedLoss: 18000
      }
    ];
  }

  /**
   * Identify growth opportunities
   */
  static identifyGrowthOpportunities(analyticsData: RevenueAnalytics): OpportunityPrediction[] {
    return [
      {
        type: 'upsell',
        description: 'Enterprise clients ready for advanced analytics package',
        potential: 150000,
        probability: 0.70,
        timeline: '2-3 months',
        actions: [
          'Prepare analytics demo',
          'Schedule stakeholder presentations',
          'Create custom ROI analysis'
        ]
      },
      {
        type: 'cross_sell',
        description: 'Growth-stage clients need mobile app development',
        potential: 85000,
        probability: 0.60,
        timeline: '1-2 months',
        actions: [
          'Showcase mobile portfolio',
          'Offer mobile strategy consultation',
          'Bundle with existing services'
        ]
      },
      {
        type: 'new_market',
        description: 'Healthcare sector showing high demand',
        potential: 200000,
        probability: 0.45,
        timeline: '6-12 months',
        actions: [
          'Develop healthcare case studies',
          'Partner with healthcare consultants',
          'Attend healthcare technology conferences'
        ]
      }
    ];
  }

  /**
   * Generate revenue prediction insights
   */
  private static generateRevenueInsights(data: RevenueAnalytics): PredictiveInsight[] {
    const growthRate = this.calculateGrowthRate(data.trends);
    const projectedRevenue = data.metrics.totalRevenue * (1 + growthRate);

    return [
      {
        id: 'revenue-growth',
        type: 'revenue',
        title: 'Strong Revenue Growth Predicted',
        description: `Based on current trends, revenue is projected to reach $${projectedRevenue.toLocaleString()} by end of quarter`,
        confidence: 82,
        impact: 'high',
        timeframe: 'Next 3 months',
        recommendations: [
          'Scale marketing efforts to capitalize on momentum',
          'Prepare infrastructure for increased capacity',
          'Consider expanding team to handle growth'
        ],
        data: { projectedRevenue, growthRate }
      }
    ];
  }

  /**
   * Generate churn prediction insights
   */
  private static generateChurnInsights(data: RevenueAnalytics): PredictiveInsight[] {
    const churnPredictions = this.predictChurnRisk(data);
    const totalRisk = churnPredictions.reduce((sum, pred) => sum + pred.expectedLoss, 0);

    return [
      {
        id: 'churn-risk',
        type: 'churn',
        title: 'Client Retention Risk Identified',
        description: `${churnPredictions.length} clients at risk, potential revenue loss of $${totalRisk.toLocaleString()}`,
        confidence: 75,
        impact: 'high',
        timeframe: 'Next 6 months',
        recommendations: [
          'Implement proactive client health monitoring',
          'Develop retention-focused service packages',
          'Schedule quarterly business reviews with at-risk clients'
        ],
        data: { churnPredictions, totalRisk }
      }
    ];
  }

  /**
   * Generate opportunity insights
   */
  private static generateOpportunityInsights(data: RevenueAnalytics): PredictiveInsight[] {
    const opportunities = this.identifyGrowthOpportunities(data);
    const totalPotential = opportunities.reduce((sum, opp) => sum + opp.potential, 0);

    return [
      {
        id: 'growth-opportunities',
        type: 'opportunity',
        title: 'High-Value Growth Opportunities Detected',
        description: `${opportunities.length} opportunities identified with $${totalPotential.toLocaleString()} potential revenue`,
        confidence: 68,
        impact: 'high',
        timeframe: 'Next 12 months',
        recommendations: [
          'Prioritize opportunities by probability and impact',
          'Allocate resources to highest-value prospects',
          'Develop specialized offerings for identified opportunities'
        ],
        data: { opportunities, totalPotential }
      }
    ];
  }

  /**
   * Generate risk assessment insights
   */
  private static generateRiskInsights(data: RevenueAnalytics): PredictiveInsight[] {
    const pipelineConcentration = this.analyzePipelineConcentration(data.pipeline);
    
    return [
      {
        id: 'pipeline-concentration',
        type: 'risk',
        title: 'Pipeline Concentration Risk',
        description: `${pipelineConcentration.riskLevel} concentration risk: top 3 deals represent ${pipelineConcentration.percentage}% of pipeline`,
        confidence: 90,
        impact: pipelineConcentration.riskLevel === 'high' ? 'high' : 'medium',
        timeframe: 'Ongoing',
        recommendations: [
          'Diversify pipeline with smaller deals',
          'Develop backup prospects for large opportunities',
          'Create contingency plans for major deals'
        ],
        data: pipelineConcentration
      }
    ];
  }

  /**
   * Calculate growth rate from historical trends
   */
  private static calculateGrowthRate(trends: any[]): number {
    if (trends.length < 2) return 0.15; // Default 15% growth

    const recentRevenues = trends.slice(-3).map(t => t.revenue);
    const growthRates = [];

    for (let i = 1; i < recentRevenues.length; i++) {
      const rate = (recentRevenues[i] - recentRevenues[i - 1]) / recentRevenues[i - 1];
      growthRates.push(rate);
    }

    return growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
  }

  /**
   * Get seasonal factor for revenue projection
   */
  private static getSeasonalFactor(month: number): number {
    // Mock seasonal factors (would be based on historical data)
    const seasonalFactors = [1.0, 0.9, 1.1, 1.2, 1.0, 0.95]; // 6 months
    return seasonalFactors[Math.min(month - 1, 5)] || 1.0;
  }

  /**
   * Get market factor for projections
   */
  private static getMarketFactor(): number {
    // Mock market conditions factor
    return 1.05; // 5% positive market conditions
  }

  /**
   * Get month name for projections
   */
  private static getMonthName(monthOffset: number): string {
    const now = new Date();
    const targetMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    return targetMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  /**
   * Analyze pipeline concentration risk
   */
  private static analyzePipelineConcentration(pipeline: DealPipeline[]) {
    const activePipeline = pipeline.filter(deal => 
      deal.stage !== 'closed-won' && deal.stage !== 'closed-lost'
    );

    const sortedDeals = activePipeline.sort((a, b) => b.value - a.value);
    const totalValue = activePipeline.reduce((sum, deal) => sum + deal.value, 0);
    const top3Value = sortedDeals.slice(0, 3).reduce((sum, deal) => sum + deal.value, 0);
    const percentage = Math.round((top3Value / totalValue) * 100);

    return {
      percentage,
      riskLevel: percentage > 70 ? 'high' : percentage > 50 ? 'medium' : 'low',
      topDeals: sortedDeals.slice(0, 3),
      totalValue,
      top3Value
    };
  }
}
