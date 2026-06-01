import type { RevenueAnalytics } from './revenue-analytics-service';
import type { PredictiveInsight } from './predictive-analytics-service';

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  category: 'revenue' | 'pipeline' | 'churn' | 'opportunity' | 'performance';
  title: string;
  message: string;
  timestamp: string;
  data?: any;
  actions?: AlertAction[];
  read: boolean;
  dismissed: boolean;
}

export interface AlertAction {
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  action: string;
  url?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  category: string;
  condition: (data: RevenueAnalytics) => boolean;
  severity: 'critical' | 'warning' | 'info';
  enabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  lastTriggered?: string;
}

export interface ReportSchedule {
  id: string;
  name: string;
  type: 'executive' | 'performance' | 'pipeline' | 'custom';
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  format: 'pdf' | 'email' | 'dashboard_link';
  enabled: boolean;
  lastSent?: string;
  nextScheduled: string;
}

export class AlertsService {
  private static alerts: Alert[] = [];
  private static alertRules: AlertRule[] = [];
  private static reportSchedules: ReportSchedule[] = [];

  /**
   * Initialize default alert rules
   */
  static initializeDefaultRules(): AlertRule[] {
    return [
      {
        id: 'revenue-decline',
        name: 'Revenue Decline Alert',
        description: 'Triggered when revenue drops by more than 10% compared to previous period',
        category: 'revenue',
        condition: (data) => {
          // Mock condition - in real implementation would compare with historical data
          return data.metrics.totalRevenue < 100000;
        },
        severity: 'critical',
        enabled: true,
        frequency: 'immediate'
      },
      {
        id: 'pipeline-low',
        name: 'Low Pipeline Alert',
        description: 'Triggered when pipeline value falls below $200K',
        category: 'pipeline',
        condition: (data) => data.metrics.pipelineValue < 200000,
        severity: 'warning',
        enabled: true,
        frequency: 'daily'
      },
      {
        id: 'conversion-rate-drop',
        name: 'Conversion Rate Drop',
        description: 'Triggered when conversion rate drops below 10%',
        category: 'performance',
        condition: (data) => data.metrics.conversionRate < 10,
        severity: 'warning',
        enabled: true,
        frequency: 'immediate'
      },
      {
        id: 'deal-stagnation',
        name: 'Deal Stagnation Alert',
        description: 'Triggered when deals stay in same stage for more than 30 days',
        category: 'pipeline',
        condition: (data) => {
          const stagnantDeals = data.pipeline.filter(deal => {
            const lastActivity = new Date(deal.lastActivity);
            const daysSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceActivity > 30 && deal.stage !== 'closed-won' && deal.stage !== 'closed-lost';
          });
          return stagnantDeals.length > 0;
        },
        severity: 'warning',
        enabled: true,
        frequency: 'weekly'
      },
      {
        id: 'high-value-opportunity',
        name: 'High-Value Opportunity',
        description: 'Triggered when a deal exceeds $50K in value',
        category: 'opportunity',
        condition: (data) => data.pipeline.some(deal => deal.value > 50000),
        severity: 'info',
        enabled: true,
        frequency: 'immediate'
      }
    ];
  }

  /**
   * Generate alerts based on current analytics data
   */
  static generateAlerts(analyticsData: RevenueAnalytics, insights: PredictiveInsight[]): Alert[] {
    const newAlerts: Alert[] = [];
    const rules = this.getActiveAlertRules();

    // Check alert rules
    rules.forEach(rule => {
      if (rule.condition(analyticsData)) {
        const alert = this.createAlert(rule, analyticsData);
        if (alert) {
          newAlerts.push(alert);
        }
      }
    });

    // Generate alerts from predictive insights
    insights.forEach(insight => {
      if (insight.impact === 'high' && insight.confidence > 70) {
        const insightAlert = this.createInsightAlert(insight);
        if (insightAlert) {
          newAlerts.push(insightAlert);
        }
      }
    });

    // Add to alerts collection without duplicating existing entries
    newAlerts.forEach(alert => {
      const alreadyTracked = this.alerts.some(existing => existing.id === alert.id);
      if (!alreadyTracked) {
        this.alerts.push(alert);
      }
    });
    
    return newAlerts;
  }

  /**
   * Get all alerts with filtering options
   */
  static getAlerts(options: {
    type?: string;
    category?: string;
    unreadOnly?: boolean;
    limit?: number;
  } = {}): Alert[] {
    let filtered = [...this.alerts];

    if (options.type) {
      filtered = filtered.filter(alert => alert.type === options.type);
    }

    if (options.category) {
      filtered = filtered.filter(alert => alert.category === options.category);
    }

    if (options.unreadOnly) {
      filtered = filtered.filter(alert => !alert.read);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  /**
   * Mark alert as read
   */
  static markAsRead(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.read = true;
    }
  }

  /**
   * Dismiss alert
   */
  static dismissAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.dismissed = true;
    }
  }

  /**
   * Get unread alerts count
   */
  static getUnreadCount(): number {
    return this.alerts.filter(alert => !alert.read && !alert.dismissed).length;
  }

  /**
   * Create automated report schedules
   */
  static createReportSchedule(schedule: Omit<ReportSchedule, 'id' | 'nextScheduled'>): ReportSchedule {
    const newSchedule: ReportSchedule = {
      ...schedule,
      id: `schedule_${Date.now()}`,
      nextScheduled: this.calculateNextScheduledTime(schedule.frequency)
    };

    this.reportSchedules.push(newSchedule);
    return newSchedule;
  }

  /**
   * Get all report schedules
   */
  static getReportSchedules(): ReportSchedule[] {
    return [...this.reportSchedules];
  }

  /**
   * Generate executive summary report
   */
  static generateExecutiveSummary(analyticsData: RevenueAnalytics): {
    summary: string;
    keyMetrics: any;
    insights: string[];
    actions: string[];
  } {
    const summary = `Revenue Analytics Summary for ${new Date().toLocaleDateString()}

Total Revenue: $${analyticsData.metrics.totalRevenue.toLocaleString()}
Pipeline Value: $${analyticsData.metrics.pipelineValue.toLocaleString()}
Active Deals: ${analyticsData.metrics.activeDeals}
Conversion Rate: ${analyticsData.metrics.conversionRate.toFixed(1)}%

Top performing lead source: ${analyticsData.leadSources.sort((a, b) => b.conversionRate - a.conversionRate)[0]?.source}
Largest deal in pipeline: ${Math.max(...analyticsData.pipeline.map(d => d.value)).toLocaleString()}`;

    return {
      summary,
      keyMetrics: {
        revenue: analyticsData.metrics.totalRevenue,
        pipeline: analyticsData.metrics.pipelineValue,
        deals: analyticsData.metrics.activeDeals,
        conversion: analyticsData.metrics.conversionRate
      },
      insights: [
        `${analyticsData.leadSources.length} lead sources tracked`,
        `${analyticsData.pipeline.length} deals in pipeline`,
        `$${(analyticsData.metrics.pipelineValue / analyticsData.metrics.activeDeals).toFixed(0)} average deal size`
      ],
      actions: [
        'Review pipeline for stagnant deals',
        'Focus on top-performing lead sources',
        'Schedule follow-ups for high-value prospects'
      ]
    };
  }

  /**
   * Private: Create alert from rule
   */
  private static createAlert(rule: AlertRule, data: RevenueAnalytics): Alert | null {
    // Check if alert was recently triggered to avoid spam
    if (rule.lastTriggered) {
      const lastTriggered = new Date(rule.lastTriggered);
      const now = new Date();
      const timeDiff = now.getTime() - lastTriggered.getTime();

      // Don't trigger immediate alerts within 1 hour
      if (rule.frequency === 'immediate' && timeDiff < 3600000) {
        return null;
      }
    }

    const existingAlert = this.alerts.find(
      alert => alert.data?.rule === rule.id && !alert.dismissed,
    );
    if (existingAlert) {
      return null;
    }

    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: rule.severity === 'critical' ? 'critical' : rule.severity === 'warning' ? 'warning' : 'info',
      category: rule.category as any,
      title: rule.name,
      message: rule.description,
      timestamp: new Date().toISOString(),
      data: { rule: rule.id, analyticsSnapshot: data.metrics },
      actions: this.getActionsForRule(rule),
      read: false,
      dismissed: false
    };

    // Update rule's last triggered time
    rule.lastTriggered = alert.timestamp;

    return alert;
  }

  /**
   * Private: Create alert from predictive insight
   */
  private static createInsightAlert(insight: PredictiveInsight): Alert | null {
    const existing = this.alerts.find(alert => alert.data?.insight?.id === insight.id && !alert.dismissed);
    if (existing) {
      return null;
    }

    return {
      id: `insight_${insight.id}_${Date.now()}`,
      type: insight.impact === 'high' ? 'warning' : 'info',
      category: insight.type as any,
      title: `AI Insight: ${insight.title}`,
      message: insight.description,
      timestamp: new Date().toISOString(),
      data: { insight },
      actions: insight.recommendations.slice(0, 2).map(rec => ({
        label: rec,
        type: 'primary' as const,
        action: 'implement_recommendation'
      })),
      read: false,
      dismissed: false
    };
  }

  /**
   * Private: Get actions for alert rule
   */
  private static getActionsForRule(rule: AlertRule): AlertAction[] {
    switch (rule.id) {
      case 'revenue-decline':
        return [
          { label: 'Review Revenue Analytics', type: 'primary', action: 'navigate', url: '/revenue-analytics' },
          { label: 'Check Pipeline', type: 'secondary', action: 'navigate', url: '/revenue-analytics?tab=pipeline' }
        ];
      case 'pipeline-low':
        return [
          { label: 'Add New Prospects', type: 'primary', action: 'navigate', url: '/lead-generation' },
          { label: 'Review Lead Sources', type: 'secondary', action: 'navigate', url: '/revenue-analytics?tab=sources' }
        ];
      case 'deal-stagnation':
        return [
          { label: 'Review Stagnant Deals', type: 'primary', action: 'navigate', url: '/revenue-analytics?tab=pipeline' },
          { label: 'Schedule Follow-ups', type: 'secondary', action: 'create_tasks' }
        ];
      default:
        return [];
    }
  }

  /**
   * Private: Get active alert rules
   */
  private static getActiveAlertRules(): AlertRule[] {
    if (this.alertRules.length === 0) {
      this.alertRules = this.initializeDefaultRules();
    }
    return this.alertRules.filter(rule => rule.enabled);
  }

  /**
   * Private: Calculate next scheduled time
   */
  private static calculateNextScheduledTime(frequency: string): string {
    const now = new Date();
    
    switch (frequency) {
      case 'daily':
        now.setDate(now.getDate() + 1);
        now.setHours(9, 0, 0, 0); // 9 AM next day
        break;
      case 'weekly':
        now.setDate(now.getDate() + (7 - now.getDay() + 1)); // Next Monday
        now.setHours(9, 0, 0, 0);
        break;
      case 'monthly':
        now.setMonth(now.getMonth() + 1, 1); // First day of next month
        now.setHours(9, 0, 0, 0);
        break;
    }
    
    return now.toISOString();
  }
}
