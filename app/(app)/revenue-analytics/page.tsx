'use client';

import { useCallback, useEffect, useMemo, useState, type ComponentType } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { AlertsPanel } from '@/components/analytics/alerts-panel';
import { PredictiveAnalyticsDashboard } from '@/components/analytics/predictive-analytics';
import {
  ClientSegmentationDashboard,
  type ClientBehavior,
  type ClientSegment,
} from '@/components/analytics/client-segmentation';
import {
  ActivityChart,
  ForecastChart,
  LeadSourcePieChart,
  PipelineBarChart,
  RevenueLineChart,
} from '@/components/analytics/revenue-charts';
import type {
  RevenueAnalytics,
  RevenueStream,
  ReportingAutomation,
  ReportExportOption,
} from '@/lib/analytics/revenue-analytics-service';
import { PredictiveAnalyticsService } from '@/lib/analytics/predictive-analytics-service';
import { AnalyticsExportService } from '@/lib/analytics/export-service';
import { AlertsService, type Alert } from '@/lib/analytics/alerts-service';
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Bell,
  BellRing,
  Brain,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  DollarSign,
  FileText,
  Gauge,
  LineChart,
  Mail,
  Minus,
  PieChart,
  RefreshCcw,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';

interface RevenueMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: ComponentType<{ className?: string }>;
}

interface ActivityMetric {
  activity: string;
  count: number;
  target: number;
  completion: number;
}

interface Deal {
  id: string;
  client: string;
  type: 'recruiting' | 'agency' | 'consulting';
  value: number;
  stage: 'prospect' | 'proposal' | 'negotiation' | 'closed' | 'lost';
  probability: number;
  closeDate: string;
  source: string;
  score?: number;
  priority?: 'High' | 'Medium' | 'Low';
}

const STREAM_LABELS: Record<RevenueStream['stream'], string> = {
  development: 'Development Services',
  recruiting: 'Recruiting & Talent',
  consulting: 'Consulting Engagements',
};

const DEFAULT_ANALYTICS: RevenueAnalytics = {
  metrics: {
    totalRevenue: 127500,
    pipelineValue: 485000,
    activeDeals: 23,
    conversionRate: 15.2,
    averageDealSize: 42500,
    monthlyRecurring: 38250,
    annualRecurring: 459000,
    clientLifetimeValue: 127500,
  },
  revenueStreams: [
    {
      stream: 'development',
      revenue: 35500,
      recurring: 14500,
      growthRate: 14,
      pipelineContribution: 180000,
      avgDealSize: 65000,
    },
    {
      stream: 'recruiting',
      revenue: 77000,
      recurring: 18250,
      growthRate: 21,
      pipelineContribution: 210000,
      avgDealSize: 32000,
    },
    {
      stream: 'consulting',
      revenue: 15000,
      recurring: 5500,
      growthRate: 9,
      pipelineContribution: 95000,
      avgDealSize: 18000,
    },
  ],
  leadSources: [
    {
      source: 'Network Referrals',
      leads: 156,
      qualified: 122,
      converted: 18,
      conversionRate: 78.2,
      revenue: 234000,
      spend: 4500,
      costPerAcquisition: 250,
    },
    {
      source: 'LinkedIn',
      leads: 234,
      qualified: 145,
      converted: 12,
      conversionRate: 62.0,
      revenue: 156000,
      spend: 2200,
      costPerAcquisition: 183,
    },
    {
      source: 'Apollo.io',
      leads: 1247,
      qualified: 337,
      converted: 8,
      conversionRate: 27.0,
      revenue: 89000,
      spend: 3800,
      costPerAcquisition: 475,
    },
    {
      source: 'Cold Outreach',
      leads: 892,
      qualified: 107,
      converted: 3,
      conversionRate: 12.0,
      revenue: 67000,
      spend: 1500,
      costPerAcquisition: 500,
    },
  ],
  activities: {
    emailsSent: 1247,
    emailsOpened: 423,
    emailsReplied: 89,
    linkedinConnections: 234,
    linkedinAccepted: 166,
    callsScheduled: 23,
    proposalsSent: 8,
  },
  pipeline: [
    {
      id: 'deal_1',
      clientName: 'TechCorp Inc.',
      value: 45000,
      stage: 'proposal',
      probability: 75,
      expectedCloseDate: '2024-02-15',
      source: 'LinkedIn',
      lastActivity: '2024-01-10T14:30:00Z',
    },
    {
      id: 'deal_2',
      clientName: 'StartupXYZ',
      value: 28000,
      stage: 'negotiation',
      probability: 60,
      expectedCloseDate: '2024-02-28',
      source: 'Network Referral',
      lastActivity: '2024-01-12T09:15:00Z',
    },
    {
      id: 'deal_3',
      clientName: 'InnovateTech',
      value: 67000,
      stage: 'discovery',
      probability: 40,
      expectedCloseDate: '2024-03-15',
      source: 'Cold Outreach',
      lastActivity: '2024-01-14T16:45:00Z',
    },
    {
      id: 'deal_4',
      clientName: 'CloudScale',
      value: 52000,
      stage: 'closed-won',
      probability: 100,
      expectedCloseDate: '2024-01-05',
      source: 'Apollo.io',
      lastActivity: '2024-01-05T11:20:00Z',
    },
  ],
  forecast: { q1: 185000, q2: 220000, q3: 195000, q4: 275000 },
  trends: [
    { period: 'Jan 2024', revenue: 45000, leads: 234, conversion: 12.5 },
    { period: 'Feb 2024', revenue: 67000, leads: 289, conversion: 15.2 },
    { period: 'Mar 2024', revenue: 52000, leads: 312, conversion: 13.8 },
    { period: 'Apr 2024', revenue: 78000, leads: 356, conversion: 17.1 },
    { period: 'May 2024', revenue: 89000, leads: 423, conversion: 19.4 },
    { period: 'Jun 2024', revenue: 94000, leads: 445, conversion: 21.2 },
  ],
  performance: {
    leadConversionRate: 15.2,
    costPerAcquisition: 268,
    recruitingPlacementRate: 68,
    averageTimeToFill: 32,
    email: { openRate: 34, clickRate: 15, replyRate: 9 },
    network: { utilization: 82, referralSuccess: 74 },
    clientSuccess: { satisfactionScore: 4.6, retentionRate: 91, churnRisk: 6 },
  },
  intelligence: {
    marketTrends: [
      {
        title: 'Enterprise cloud modernization spend',
        impact: 'positive',
        change: '+18% YoY',
        recommendation: 'Position agency offers around migration accelerators',
      },
      {
        title: 'Technical talent demand (staff augmentation)',
        impact: 'positive',
        change: '+12% QoQ',
        recommendation: 'Double down on senior engineer recruiting retainer packages',
      },
      {
        title: 'Startup funding pullback',
        impact: 'negative',
        change: '-9% new seed rounds',
        recommendation: 'Focus prospecting on profitable Series B+ companies',
      },
    ],
    clientSegments: [
      {
        segment: 'Enterprise',
        accounts: 6,
        revenueShare: 48,
        averageValue: 78000,
        retentionRate: 95,
        notes: 'High ARR, strong upsell potential',
      },
      {
        segment: 'Scale-up SaaS',
        accounts: 11,
        revenueShare: 34,
        averageValue: 52000,
        retentionRate: 88,
        notes: 'Responds best to hybrid dev + recruiting bundles',
      },
      {
        segment: 'Boutique agencies',
        accounts: 9,
        revenueShare: 18,
        averageValue: 23000,
        retentionRate: 74,
        notes: 'Higher churn risk, price-sensitive',
      },
    ],
    opportunityScores: [
      {
        id: 'deal_1',
        client: 'TechCorp Inc.',
        score: 88,
        priority: 'High',
        factors: ['Executive sponsor engaged', 'Budget approved', 'Timeline critical'],
      },
      {
        id: 'deal_2',
        client: 'StartupXYZ',
        score: 73,
        priority: 'Medium',
        factors: ['Awaiting legal review', 'Strong champion'],
      },
      {
        id: 'deal_3',
        client: 'InnovateTech',
        score: 61,
        priority: 'Medium',
        factors: ['Needs technical validation', 'Early discovery stage'],
      },
    ],
    resourceAllocation: [
      {
        function: 'Engineering Delivery',
        utilization: 84,
        target: 80,
        status: 'Overallocated',
        recommendation: 'Spin up bench capacity via contractor network',
      },
      {
        function: 'Recruiting Pod',
        utilization: 68,
        target: 75,
        status: 'Underutilized',
        recommendation: 'Shift to high-priority CTO search workstreams',
      },
      {
        function: 'Growth & Partnerships',
        utilization: 72,
        target: 70,
        status: 'Balanced',
        recommendation: 'Maintain focus on referral partnerships',
      },
    ],
  },
  reporting: {
    exports: [
      {
        label: 'Executive KPI Summary',
        format: 'pdf',
        description: 'Board-ready snapshot of revenue, margin, and forecast highlights',
      },
      {
        label: 'Lead Source Performance',
        format: 'csv',
        description: 'Detailed lead source performance with CPA and ROI figures',
      },
      {
        label: 'Forecast & Pipeline Workbook',
        format: 'excel',
        description: 'Weighted pipeline, scenario planning, and activity KPIs',
      },
      {
        label: 'Revenue Intelligence Dataset',
        format: 'json',
        description: 'Machine-readable dataset for BI tooling and notebooks',
      },
    ],
    automations: [
      {
        name: 'Weekly Revenue Pulse',
        frequency: 'Weekly',
        recipients: ['steven@agencybase.com'],
        nextRun: new Date().toISOString(),
        status: 'Active',
      },
      {
        name: 'Monthly Client Health',
        frequency: 'Monthly',
        recipients: ['leadership@agencybase.com'],
        nextRun: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
        status: 'Active',
      },
      {
        name: 'Pipeline Risk Alerts',
        frequency: 'Daily',
        recipients: ['sales@agencybase.com'],
        nextRun: new Date().toISOString(),
        status: 'Paused',
      },
    ],
  },
};

const formatCurrency = (value: number) =>
  `$${value.toLocaleString(undefined, { maximumFractionDigits: value >= 100000 ? 0 : 1 })}`;

const calculateChange = (current: number, previous?: number) => {
  if (!previous || previous === 0) {
    return { change: '+0.0%', trend: 'neutral' as const };
  }
  const delta = ((current - previous) / Math.abs(previous)) * 100;
  if (!Number.isFinite(delta)) {
    return { change: '+0.0%', trend: 'neutral' as const };
  }
  if (Math.abs(delta) < 0.5) {
    return {
      change: `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`,
      trend: 'neutral' as const,
    };
  }
  return {
    change: `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`,
    trend: delta > 0 ? ('up' as const) : ('down' as const),
  };
};

const getTrendIcon = (trend: RevenueMetric['trend']) => {
  switch (trend) {
    case 'up':
      return <ArrowUp className="h-4 w-4 text-green-600 dark:text-green-400" />;
    case 'down':
      return <ArrowDown className="h-4 w-4 text-red-600 dark:text-red-400" />;
    default:
      return <Minus className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
  }
};

const getStageStyles = (stage: Deal['stage']) => {
  switch (stage) {
    case 'prospect':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/60 dark:text-gray-100';
    case 'proposal':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-200';
    case 'negotiation':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-200';
    case 'closed':
      return 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-200';
    case 'lost':
      return 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/60 dark:text-gray-100';
  }
};

const getTypeStyles = (type: Deal['type']) => {
  switch (type) {
    case 'recruiting':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-200';
    case 'agency':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200';
    case 'consulting':
      return 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/60 dark:text-gray-100';
  }
};

const getImpactBadgeStyles = (impact: 'positive' | 'neutral' | 'negative') => {
  switch (impact) {
    case 'positive':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
    case 'negative':
      return 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-900/60 dark:text-slate-200';
  }
};

const deriveDealType = (source: string): Deal['type'] => {
  const normalized = source.toLowerCase();
  if (normalized.includes('recruit') || normalized.includes('talent')) {
    return 'recruiting';
  }
  if (normalized.includes('referral') || normalized.includes('partnership')) {
    return 'consulting';
  }
  if (normalized.includes('linkedin') || normalized.includes('cold')) {
    return 'recruiting';
  }
  if (normalized.includes('apollo') || normalized.includes('project')) {
    return 'agency';
  }
  return 'agency';
};

const fileBaseName = (label: string) =>
  label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '') || 'analytics-report';

const RevenueAnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('90d');
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState<RevenueAnalytics | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [reportingToggles, setReportingToggles] = useState<Record<string, boolean>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const { toast } = useToast();

  const loadAnalyticsData = useCallback(async () => {
    try {
      const response = await fetch('/api/analytics/revenue');
      const payload = await response.json();

      if (payload.success) {
        const data: RevenueAnalytics = payload.data;
        setAnalyticsData(data);
        setLastUpdated(new Date());
        setReportingToggles((previous) => {
          if (Object.keys(previous).length > 0) {
            return previous;
          }
          const initial: Record<string, boolean> = {};
          data.reporting.automations.forEach((automation: ReportingAutomation) => {
            initial[automation.name] = automation.status === 'Active';
          });
          return initial;
        });
      }
    } catch (error) {
      console.error('Failed to load revenue analytics', error);
      toast({
        title: 'Analytics unavailable',
        description: 'Showing cached insights until live data is reachable.',
      });
    }
  }, [toast]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  useEffect(() => {
    if (!autoRefresh) {
      return;
    }

    const intervalId = setInterval(() => {
      loadAnalyticsData();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [autoRefresh, loadAnalyticsData]);

  useEffect(() => {
    if (AlertsService.getReportSchedules().length === 0) {
      AlertsService.createReportSchedule({
        name: 'Weekly Revenue Pulse',
        type: 'executive',
        frequency: 'weekly',
        recipients: ['steven@agencybase.com'],
        format: 'email',
        enabled: true,
      });
      AlertsService.createReportSchedule({
        name: 'Monthly Client Health',
        type: 'performance',
        frequency: 'monthly',
        recipients: ['leadership@agencybase.com'],
        format: 'dashboard_link',
        enabled: true,
      });
    }
  }, []);

  const analytics = analyticsData ?? DEFAULT_ANALYTICS;

  const predictiveInsights = useMemo(
    () => PredictiveAnalyticsService.generatePredictiveInsights(analytics),
    [analytics],
  );
  const revenueProjections = useMemo(
    () => PredictiveAnalyticsService.generateRevenueProjections(analytics),
    [analytics],
  );
  const churnPredictions = useMemo(
    () => PredictiveAnalyticsService.predictChurnRisk(analytics),
    [analytics],
  );
  const opportunityPredictions = useMemo(
    () => PredictiveAnalyticsService.identifyGrowthOpportunities(analytics),
    [analytics],
  );

  useEffect(() => {
    AlertsService.generateAlerts(analytics, predictiveInsights);
    setAlerts(AlertsService.getAlerts());
  }, [analytics, predictiveInsights]);

  const opportunityIndex = useMemo(() => {
    const map = new Map<string, { score: number; priority: 'High' | 'Medium' | 'Low' }>();
    analytics.intelligence.opportunityScores.forEach((entry) => {
      map.set(entry.id, { score: entry.score, priority: entry.priority });
    });
    return map;
  }, [analytics.intelligence.opportunityScores]);

  const deals: Deal[] = useMemo(
    () =>
      analytics.pipeline.map((deal) => ({
        id: deal.id,
        client: deal.clientName,
        type: deriveDealType(deal.source),
        value: deal.value,
        stage:
          deal.stage === 'discovery'
            ? 'prospect'
            : deal.stage === 'proposal'
            ? 'proposal'
            : deal.stage === 'negotiation'
            ? 'negotiation'
            : deal.stage === 'closed-won'
            ? 'closed'
            : 'lost',
        probability: deal.probability,
        closeDate: deal.expectedCloseDate.split('T')[0],
        source: deal.source,
        score: opportunityIndex.get(deal.id)?.score,
        priority: opportunityIndex.get(deal.id)?.priority,
      })),
    [analytics.pipeline, opportunityIndex],
  );

  const revenueMetrics: RevenueMetric[] = useMemo(() => {
    const latestTrend = analytics.trends.at(-1);
    const previousTrend = analytics.trends.at(-2);

    const revenueDelta = calculateChange(analytics.metrics.totalRevenue, previousTrend?.revenue);
    const pipelineDelta = calculateChange(
      analytics.metrics.pipelineValue,
      analytics.metrics.pipelineValue - 45000,
    );
    const mrrDelta = calculateChange(
      analytics.metrics.monthlyRecurring,
      latestTrend ? latestTrend.revenue * 0.3 : undefined,
    );
    const arrDelta = calculateChange(
      analytics.metrics.annualRecurring,
      analytics.metrics.annualRecurring * 0.92,
    );
    const clvDelta = calculateChange(
      analytics.metrics.clientLifetimeValue,
      analytics.metrics.clientLifetimeValue * 0.95,
    );

    return [
      {
        label: 'Total Revenue',
        value: formatCurrency(analytics.metrics.totalRevenue),
        change: revenueDelta.change,
        trend: revenueDelta.trend,
        icon: DollarSign,
      },
      {
        label: 'Monthly Recurring Revenue',
        value: formatCurrency(analytics.metrics.monthlyRecurring),
        change: mrrDelta.change,
        trend: mrrDelta.trend,
        icon: RefreshCcw,
      },
      {
        label: 'Annual Recurring Revenue',
        value: formatCurrency(analytics.metrics.annualRecurring),
        change: arrDelta.change,
        trend: arrDelta.trend,
        icon: Calendar,
      },
      {
        label: 'Pipeline Value (weighted)',
        value: formatCurrency(analytics.metrics.pipelineValue),
        change: pipelineDelta.change,
        trend: pipelineDelta.trend,
        icon: TrendingUp,
      },
      {
        label: 'Client Lifetime Value',
        value: formatCurrency(analytics.metrics.clientLifetimeValue),
        change: clvDelta.change,
        trend: clvDelta.trend,
        icon: Users,
      },
    ];
  }, [analytics.metrics, analytics.trends]);

  const activityMetrics: ActivityMetric[] = useMemo(
    () => [
      {
        activity: 'Outreach Emails',
        count: analytics.activities.emailsSent,
        target: 200,
        completion: Math.min(100, Math.round((analytics.activities.emailsSent / 200) * 100)),
      },
      {
        activity: 'Discovery Calls',
        count: analytics.activities.callsScheduled,
        target: 30,
        completion: Math.min(100, Math.round((analytics.activities.callsScheduled / 30) * 100)),
      },
      {
        activity: 'Proposals Sent',
        count: analytics.activities.proposalsSent,
        target: 12,
        completion: Math.min(100, Math.round((analytics.activities.proposalsSent / 12) * 100)),
      },
      {
        activity: 'LinkedIn Connections',
        count: analytics.activities.linkedinConnections,
        target: 50,
        completion: Math.min(100, Math.round((analytics.activities.linkedinConnections / 50) * 100)),
      },
      {
        activity: 'Email Replies',
        count: analytics.activities.emailsReplied,
        target: 40,
        completion: Math.min(100, Math.round((analytics.activities.emailsReplied / 40) * 100)),
      },
    ],
    [analytics.activities],
  );

  const revenueTrendData = useMemo(
    () =>
      analytics.trends.map((trend) => ({
        period: trend.period,
        revenue: trend.revenue,
        leads: trend.leads,
        conversion: trend.conversion,
      })),
    [analytics.trends],
  );

  const pipelineChartData = useMemo(() => {
    const stageMap = new Map<string, { stage: string; count: number; value: number }>();
    deals.forEach((deal) => {
      const entry = stageMap.get(deal.stage) ?? { stage: deal.stage, count: 0, value: 0 };
      entry.count += 1;
      entry.value += deal.value;
      stageMap.set(deal.stage, entry);
    });
    return Array.from(stageMap.values());
  }, [deals]);

  const forecastChartData = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentQuarterIndex = Math.floor(currentMonth / 3);
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

    return Object.entries(analytics.forecast).map(([quarter, value], index) => ({
      quarter: quarter.toUpperCase(),
      conservative: Math.round(value * 0.82),
      optimistic: Math.round(value * 1.18),
      actual: index === currentQuarterIndex ? analytics.metrics.totalRevenue : undefined,
    }));
  }, [analytics.forecast, analytics.metrics.totalRevenue]);

  const activityChartData = useMemo(
    () =>
      activityMetrics.map((metric) => ({
        activity: metric.activity,
        count: metric.count,
        target: metric.target,
        completion: metric.completion,
      })),
    [activityMetrics],
  );

  const clientSegments: ClientSegment[] = useMemo(() => {
    const palette = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2'];
    return analytics.intelligence.clientSegments.map((segment, index) => {
      const riskLevel = segment.retentionRate >= 90 ? 'low' : segment.retentionRate >= 80 ? 'medium' : 'high';
      return {
        id: segment.segment.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: segment.segment,
        description: segment.notes,
        clients: segment.accounts,
        totalRevenue: Math.round(analytics.metrics.totalRevenue * (segment.revenueShare / 100)),
        averageValue: segment.averageValue,
        retentionRate: segment.retentionRate,
        satisfactionScore: Number(analytics.performance.clientSuccess.satisfactionScore.toFixed(1)),
        color: palette[index % palette.length],
        characteristics: [
          `${segment.revenueShare}% revenue contribution`,
          `${segment.accounts} active accounts`,
        ],
        riskLevel,
      } satisfies ClientSegment;
    });
  }, [analytics.intelligence.clientSegments, analytics.metrics.totalRevenue, analytics.performance.clientSuccess.satisfactionScore]);

  const clientBehaviors: ClientBehavior[] = useMemo(() => {
    if (clientSegments.length === 0) {
      return [];
    }

    return analytics.pipeline.map((deal, index) => {
      const segment = clientSegments[index % clientSegments.length];
      const engagementScore = Math.min(100, Math.round(deal.probability + segment.retentionRate / 2));
      const projectsCompleted = Math.max(1, Math.round(deal.value / 20000));
      const totalSpent = deal.stage === 'closed-won' ? deal.value : Math.round(deal.value * (deal.probability / 100));
      const averageProjectValue = Math.round(totalSpent / Math.max(projectsCompleted, 1));
      const lastActivity = deal.lastActivity ? new Date(deal.lastActivity).toLocaleDateString() : 'N/A';

      const communicationFreq = deal.probability >= 70 ? 'high' : deal.probability >= 45 ? 'medium' : 'low';
      const paymentHistory = deal.stage === 'closed-won' ? 'excellent' : deal.stage === 'negotiation' ? 'good' : 'needs_attention';

      const riskFactors: string[] = [];
      if (deal.probability < 40) {
        riskFactors.push('Low win probability');
      }
      if (deal.stage === 'prospect') {
        riskFactors.push('Early-stage opportunity');
      }
      if (deal.lastActivity) {
        const daysSinceActivity = Math.round(
          (Date.now() - new Date(deal.lastActivity).getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysSinceActivity > 21) {
          riskFactors.push('No recent touchpoints');
        }
      }

      const opportunities: string[] = [];
      if (deal.value > 50000) {
        opportunities.push('Upsell retainer tier');
      }
      if (segment.riskLevel === 'low') {
        opportunities.push('Expand multi-team engagement');
      }

      return {
        clientId: deal.id,
        clientName: deal.clientName,
        segment: segment.name,
        lastActivity,
        engagementScore,
        projectsCompleted,
        totalSpent,
        avgProjectValue: averageProjectValue,
        communicationFreq,
        paymentHistory,
        riskFactors,
        opportunities,
      } satisfies ClientBehavior;
    });
  }, [analytics.pipeline, clientSegments]);

  const totalPipelineValue = useMemo(
    () =>
      deals
        .filter((deal) => deal.stage !== 'closed' && deal.stage !== 'lost')
        .reduce((sum, deal) => sum + (deal.value * deal.probability) / 100, 0),
    [deals],
  );

  const closedRevenue = useMemo(
    () => deals.filter((deal) => deal.stage === 'closed').reduce((sum, deal) => sum + deal.value, 0),
    [deals],
  );

  const averageDealSize = useMemo(
    () => (deals.length ? deals.reduce((sum, deal) => sum + deal.value, 0) / deals.length : 0),
    [deals],
  );

  const handleRefreshData = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/analytics/revenue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'refresh_data' }),
      });
      const payload = await response.json();
      if (payload.success) {
        const data: RevenueAnalytics = payload.data;
        setAnalyticsData(data);
        setLastUpdated(payload.refreshedAt ? new Date(payload.refreshedAt) : new Date());
        setReportingToggles((previous) => {
          const initial: Record<string, boolean> = { ...previous };
          data.reporting.automations.forEach((automation: ReportingAutomation) => {
            initial[automation.name] = automation.status === 'Active';
          });
          return initial;
        });
        toast({
          title: 'Analytics updated',
          description: 'Live revenue and pipeline insights are refreshed.',
        });
      }
    } catch (error) {
      console.error('Failed to refresh analytics', error);
      toast({
        title: 'Refresh failed',
        description: 'We kept cached analytics so you can keep working.',
      });
    } finally {
      setRefreshing(false);
    }
  }, [toast]);

  const handleExport = useCallback(
    async (option: ReportExportOption) => {
      const base = fileBaseName(option.label);
      try {
        switch (option.format) {
          case 'csv':
            AnalyticsExportService.exportToCSV(analytics, base);
            break;
          case 'excel':
            AnalyticsExportService.exportToExcel(analytics, base);
            break;
          case 'pdf':
            await AnalyticsExportService.exportToPDF('revenue-analytics-report', base);
            break;
          case 'json':
            AnalyticsExportService.exportToJSON(analytics, base);
            break;
          default:
            return;
        }
        toast({
          title: 'Report exported',
          description: `${option.label} downloaded successfully.`,
        });
      } catch (error) {
        console.error('Export failed', error);
        toast({
          title: 'Export failed',
          description: 'Please retry or contact support if the issue persists.',
          variant: 'destructive',
        });
      }
    },
    [analytics, toast],
  );

  const handleAutomationToggle = useCallback(
    (name: string, enabled: boolean) => {
      setReportingToggles((previous) => ({
        ...previous,
        [name]: enabled,
      }));
      toast({
        title: enabled ? 'Automation enabled' : 'Automation paused',
        description: `${name} ${enabled ? 'will resume sending updates.' : 'is paused until you re-enable it.'}`,
      });
    },
    [toast],
  );

  const handleAlertAction = useCallback(
    (alertId: string, action: string) => {
      toast({
        title: 'Action logged',
        description: `Alert ${alertId} requested action: ${action}.`,
      });
    },
    [toast],
  );

  const formattedLastUpdated = lastUpdated ? lastUpdated.toLocaleTimeString() : '—';

  const forecastEntries = useMemo(
    () =>
      Object.entries(analytics.forecast).map(([quarter, value]) => ({
        quarter: quarter.toUpperCase(),
        value,
      })),
    [analytics.forecast],
  );

  return (
    <div
      id="revenue-analytics-report"
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950/20 dark:via-gray-950 dark:to-purple-950/20 p-6"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center gap-3 md:justify-start">
              <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                Revenue Analytics &amp; Intelligence
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Track lead generation, recruiting placements, and consulting revenue in one executive dashboard.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
            <div className="flex items-center justify-between gap-3 text-sm text-gray-500 dark:text-gray-400 md:justify-end">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Last update: {formattedLastUpdated}</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                <Label htmlFor="auto-refresh" className="flex items-center gap-1 text-sm font-medium">
                  <Activity className="h-4 w-4" /> Realtime
                </Label>
              </div>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <Button
                variant="outline"
                onClick={handleRefreshData}
                disabled={refreshing}
                size="sm"
                className="w-full md:w-auto"
              >
                {refreshing ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" /> Refreshing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" /> Refresh Data
                  </>
                )}
              </Button>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-wrap justify-start gap-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Pipeline
            </TabsTrigger>
            <TabsTrigger value="activities" className="flex items-center gap-2">
              <Target className="h-4 w-4" /> Activities
            </TabsTrigger>
            <TabsTrigger value="forecasting" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" /> Forecasting
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Intelligence
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" /> Alerts
            </TabsTrigger>
            <TabsTrigger value="reporting" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Reporting
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
              {revenueMetrics.map((metric) => (
                <Card key={metric.label} className="overflow-hidden">
                  <CardContent className="space-y-3 p-6">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      <metric.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      {metric.label}
                    </div>
                    <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                      {metric.value}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {getTrendIcon(metric.trend)}
                      <span
                        className={
                          metric.trend === 'up'
                            ? 'text-green-600 dark:text-green-400'
                            : metric.trend === 'down'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-600 dark:text-gray-300'
                        }
                      >
                        {metric.change}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Revenue Streams
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analytics.revenueStreams.map((stream) => (
                    <div
                      key={stream.stream}
                      className="rounded-xl border border-gray-200 bg-white/70 p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950/60"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {STREAM_LABELS[stream.stream]}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatCurrency(stream.revenue)} total • {formatCurrency(stream.recurring)} recurring
                          </p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-200">
                          +{stream.growthRate}% YoY
                        </Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <div>
                          Pipeline Contribution
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {formatCurrency(stream.pipelineContribution)}
                          </p>
                        </div>
                        <div>
                          Avg. Deal Size
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {formatCurrency(stream.avgDealSize)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Lead Source Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                    <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
                      <thead className="bg-gray-50 dark:bg-gray-900/60">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          <th className="px-4 py-3">Source</th>
                          <th className="px-4 py-3">Leads</th>
                          <th className="px-4 py-3">Qualified</th>
                          <th className="px-4 py-3">Conversion</th>
                          <th className="px-4 py-3">Revenue</th>
                          <th className="px-4 py-3">CPA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {analytics.leadSources.map((source) => (
                          <tr key={source.source} className="bg-white/80 dark:bg-gray-950/40">
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                              {source.source}
                            </td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{source.leads}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{source.qualified}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                              {source.conversionRate.toFixed(1)}%
                            </td>
                            <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                              {formatCurrency(source.revenue)}
                            </td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                              ${source.costPerAcquisition}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Revenue Trend (12 months)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RevenueLineChart data={revenueTrendData} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Lead Source Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LeadSourcePieChart data={analytics.leadSources} />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="h-5 w-5" />
                    Performance Snapshot
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/40">
                    <p className="text-sm text-blue-800 dark:text-blue-200">Lead Conversion</p>
                    <p className="text-2xl font-semibold text-blue-900 dark:text-blue-100">
                      {analytics.performance.leadConversionRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-blue-700/80 dark:text-blue-300">
                      Cost per acquisition ${analytics.performance.costPerAcquisition}
                    </p>
                  </div>
                  <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-950/40">
                    <p className="text-sm text-purple-800 dark:text-purple-200">Recruiting Placements</p>
                    <p className="text-2xl font-semibold text-purple-900 dark:text-purple-100">
                      {analytics.performance.recruitingPlacementRate}%
                    </p>
                    <p className="text-xs text-purple-700/80 dark:text-purple-300">
                      Avg. time-to-fill {analytics.performance.averageTimeToFill} days
                    </p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950/40">
                    <p className="text-sm text-emerald-800 dark:text-emerald-200">Client Success</p>
                    <p className="text-2xl font-semibold text-emerald-900 dark:text-emerald-100">
                      {analytics.performance.clientSuccess.satisfactionScore.toFixed(1)} ★
                    </p>
                    <p className="text-xs text-emerald-700/80 dark:text-emerald-300">
                      Retention {analytics.performance.clientSuccess.retentionRate}% • Churn{' '}
                      {analytics.performance.clientSuccess.churnRisk}%
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Recent Wins & Hot Deals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {deals.map((deal) => (
                    <div
                      key={deal.id}
                      className="rounded-lg border border-gray-200 bg-white/60 p-3 dark:border-gray-800 dark:bg-gray-950/40"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 dark:text-gray-100">{deal.client}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={getTypeStyles(deal.type)}>{deal.type}</Badge>
                          <Badge className={getStageStyles(deal.stage)}>{deal.stage}</Badge>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
                        <span>Value {formatCurrency(deal.value)}</span>
                        <span>Probability {deal.probability}%</span>
                        <span>Expected {deal.closeDate}</span>
                        {deal.score && (
                          <Badge
                            className={
                              deal.priority === 'High'
                                ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-200'
                                : deal.priority === 'Medium'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-200'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-200'
                            }
                          >
                            Score {deal.score}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Weighted Pipeline</p>
                  <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(totalPipelineValue)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Closed Revenue (YTD)</p>
                  <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(closedRevenue)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Average Deal Size</p>
                  <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(averageDealSize)}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Pipeline Health Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PipelineBarChart data={pipelineChartData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Active Deals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="rounded-lg border border-gray-200 bg-white/70 p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-950/40"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{deal.client}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{deal.source}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeStyles(deal.type)}>{deal.type}</Badge>
                        <Badge className={getStageStyles(deal.stage)}>{deal.stage}</Badge>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-4 text-sm md:grid-cols-4">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Value</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {formatCurrency(deal.value)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Probability</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{deal.probability}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Weighted</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {formatCurrency(Math.round((deal.value * deal.probability) / 100))}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Expected Close</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{deal.closeDate}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Activity Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {activityMetrics.map((activity) => (
                  <div key={activity.activity} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{activity.activity}</span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {activity.count} / {activity.target}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800">
                      <div
                        className={`h-2 rounded-full ${
                          activity.completion >= 80
                            ? 'bg-green-600 dark:bg-green-500'
                            : activity.completion >= 60
                            ? 'bg-yellow-600 dark:bg-yellow-500'
                            : 'bg-red-600 dark:bg-red-500'
                        }`}
                        style={{ width: `${activity.completion}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{activity.completion}% complete</span>
                      <span>{Math.max(0, activity.target - activity.count)} remaining</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activity Mix vs. Targets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityChart data={activityChartData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecasting" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Scenario Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ForecastChart data={forecastChartData} />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Quarterly Forecast (Likely Scenario)
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4">
                  {forecastEntries.map((entry) => (
                    <div
                      key={entry.quarter}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40"
                    >
                      <span className="font-medium text-gray-700 dark:text-gray-200">{entry.quarter}</span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(entry.value)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Forecast Assumptions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    Retainer expansion win rate 65%
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    Recruiting fees average 25%
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    Deal cycle 6± weeks
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    Enterprise budget approvals drive variance
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="intelligence" className="space-y-6">
            <PredictiveAnalyticsDashboard
              insights={predictiveInsights}
              projections={revenueProjections}
              churnPredictions={churnPredictions}
              opportunities={opportunityPredictions}
            />

            <ClientSegmentationDashboard segments={clientSegments} clientBehaviors={clientBehaviors} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Market Trends
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analytics.intelligence.marketTrends.map((trend) => (
                    <div key={trend.title} className="rounded-lg bg-white/70 p-4 dark:bg-gray-950/40">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{trend.title}</p>
                        <Badge className={getImpactBadgeStyles(trend.impact)}>{trend.change}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{trend.recommendation}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Resource Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analytics.intelligence.resourceAllocation.map((resource) => (
                    <div key={resource.function} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {resource.function}
                        </p>
                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-200">
                          Target {resource.target}%
                        </Badge>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800">
                        <div
                          className={`h-2 rounded-full ${
                            resource.status === 'Overallocated'
                              ? 'bg-red-500'
                              : resource.status === 'Underutilized'
                              ? 'bg-blue-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${resource.utilization}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{resource.recommendation}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <AlertsPanel alerts={alerts} onAlertAction={handleAlertAction} />
          </TabsContent>

          <TabsContent value="reporting" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {analytics.reporting.exports.map((option) => (
                  <div
                    key={option.label}
                    className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white/70 p-4 dark:border-gray-800 dark:bg-gray-950/40"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{option.label}</p>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{option.description}</p>
                    </div>
                    <Button className="mt-4" variant="secondary" onClick={() => void handleExport(option)}>
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BellRing className="h-5 w-5" />
                  Automated Alerts & Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.reporting.automations.map((automation) => (
                  <div
                    key={automation.name}
                    className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white/70 p-4 dark:border-gray-800 dark:bg-gray-950/40 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{automation.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {automation.frequency} • Next run {new Date(automation.nextRun).toLocaleDateString()} •{' '}
                        {automation.recipients.join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        className={
                          reportingToggles[automation.name]
                            ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-200'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-900/60 dark:text-gray-300'
                        }
                      >
                        {reportingToggles[automation.name] ? 'Active' : 'Paused'}
                      </Badge>
                      <Switch
                        checked={Boolean(reportingToggles[automation.name])}
                        onCheckedChange={(value) => handleAutomationToggle(automation.name, value)}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RevenueAnalyticsPage;
