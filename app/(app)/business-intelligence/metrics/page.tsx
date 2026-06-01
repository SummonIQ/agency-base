import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Activity,
  BarChart3,
  PieChart,
  Clock,
  Zap,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Download
} from 'lucide-react';

async function getBusinessMetrics(userId: string) {
  try {
    // For server components, we'll use our business metrics API internally
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3030'}/api/business-intelligence/metrics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `session=${userId}`, // Simplified for demo
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch metrics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching business metrics:', error);
    // Return fallback data if API fails
    return {
      revenue: { total: 0, growth: 0 },
      clients: { total: 0, active: 0, retention: 0 },
      projects: { total: 0, completed: 0, completionRate: 0 },
      team: { total: 0, active: 0, utilization: 0 },
      marketing: { emailCampaigns: { total: 0, sent: 0, successRate: 0 }, subscribers: { total: 0, active: 0, engagementRate: 0 } },
      recruiting: { candidates: { total: 0, active: 0, hired: 0, hireRate: 0 } },
      businessHealth: { score: 0, factors: {} },
    };
  }
}

export default async function MetricsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const metrics = await getBusinessMetrics(session.user.id);

  const keyMetrics = [
    {
      name: 'Revenue',
      value: `$${(metrics.revenue.total / 1000).toFixed(0)}k`,
      change: metrics.revenue.growth || 0,
      trend: (metrics.revenue.growth || 0) > 0 ? 'up' : (metrics.revenue.growth || 0) < 0 ? 'down' : 'neutral',
      target: metrics.revenue.total * 1.2, // 20% growth target
      actual: metrics.revenue.total,
      period: 'This Period',
    },
    {
      name: 'Active Clients',
      value: metrics.clients.active.toString(),
      change: metrics.clients.retention - 80, // Assuming 80% baseline retention
      trend: metrics.clients.retention > 80 ? 'up' : metrics.clients.retention < 80 ? 'down' : 'neutral',
      target: Math.max(metrics.clients.total, 30),
      actual: metrics.clients.active,
      period: 'Current',
    },
    {
      name: 'Project Completion',
      value: `${Math.round(metrics.projects.completionRate)}%`,
      change: metrics.projects.completionRate - 90, // Assuming 90% baseline
      trend: metrics.projects.completionRate > 90 ? 'up' : metrics.projects.completionRate < 90 ? 'down' : 'neutral',
      target: 95,
      actual: Math.round(metrics.projects.completionRate),
      period: 'Average',
    },
    {
      name: 'Team Utilization',
      value: `${Math.round(metrics.team.utilization)}%`,
      change: metrics.team.utilization - 75, // Assuming 75% baseline
      trend: metrics.team.utilization > 75 ? 'up' : metrics.team.utilization < 75 ? 'down' : 'neutral',
      target: 85,
      actual: Math.round(metrics.team.utilization),
      period: 'Current',
    },
  ];

  const performanceMetrics = [
    { category: 'Client Retention', score: metrics.clients.retention, max: 100, percentage: Math.round(metrics.clients.retention) },
    { category: 'Project Delivery', score: metrics.projects.completionRate, max: 100, percentage: Math.round(metrics.projects.completionRate) },
    { category: 'Email Campaigns', score: metrics.marketing.emailCampaigns.successRate, max: 100, percentage: Math.round(metrics.marketing.emailCampaigns.successRate) },
    { category: 'Team Utilization', score: metrics.team.utilization, max: 100, percentage: Math.round(metrics.team.utilization) },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-4 w-4" />;
      case 'down':
        return <ArrowDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendColor = (trend: string, value: number) => {
    if (trend === 'up') return value > 0 ? 'text-green-600' : 'text-red-600';
    if (trend === 'down') return value < 0 ? 'text-red-600' : 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Business Metrics</h1>
          <p className="text-muted-foreground">Real-time performance indicators</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        {keyMetrics.map((metric) => (
          <Card key={metric.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              <div className={`flex items-center gap-1 ${getTrendColor(metric.trend, metric.change)}`}>
                {getTrendIcon(metric.trend)}
                <span className="text-xs font-medium">
                  {Math.abs(metric.change)}%
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mb-2">{metric.period}</p>
              <Progress
                value={(metric.actual / metric.target) * 100}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Target: {typeof metric.target === 'number' && metric.target > 1000
                  ? `$${(metric.target / 1000).toFixed(0)}k`
                  : metric.target}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance Indicators</CardTitle>
            <CardDescription>Key performance metrics across categories</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {performanceMetrics.map((metric) => (
              <div key={metric.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{metric.category}</span>
                  <span className="text-sm font-semibold">{metric.percentage}%</span>
                </div>
                <Progress value={metric.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
            <CardDescription>Recent activity and engagement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Active Candidates</span>
                </div>
                <span className="text-lg font-semibold">{metrics.recruiting.candidates.active}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Email Campaigns Sent</span>
                </div>
                <span className="text-lg font-semibold">{metrics.marketing.emailCampaigns.sent}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Active Subscribers</span>
                </div>
                <span className="text-lg font-semibold">{metrics.marketing.subscribers.active}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Business Health Score</span>
                </div>
                <span className="text-lg font-semibold">{metrics.businessHealth.score}/100</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Department Performance</CardTitle>
          <CardDescription>Metrics breakdown by department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Department</th>
                  <th className="text-right p-2">Projects</th>
                  <th className="text-right p-2">Revenue</th>
                  <th className="text-right p-2">Efficiency</th>
                  <th className="text-right p-2">Trend</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">Engineering</td>
                  <td className="text-right p-2">8</td>
                  <td className="text-right p-2">$45,000</td>
                  <td className="text-right p-2">
                    <Badge className="bg-green-100 text-green-800">92%</Badge>
                  </td>
                  <td className="text-right p-2">
                    <TrendingUp className="h-4 w-4 text-green-600 ml-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Design</td>
                  <td className="text-right p-2">5</td>
                  <td className="text-right p-2">$28,000</td>
                  <td className="text-right p-2">
                    <Badge className="bg-yellow-100 text-yellow-800">85%</Badge>
                  </td>
                  <td className="text-right p-2">
                    <TrendingUp className="h-4 w-4 text-green-600 ml-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Marketing</td>
                  <td className="text-right p-2">6</td>
                  <td className="text-right p-2">$32,000</td>
                  <td className="text-right p-2">
                    <Badge className="bg-green-100 text-green-800">88%</Badge>
                  </td>
                  <td className="text-right p-2">
                    <Minus className="h-4 w-4 text-gray-600 ml-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Sales</td>
                  <td className="text-right p-2">4</td>
                  <td className="text-right p-2">$20,000</td>
                  <td className="text-right p-2">
                    <Badge className="bg-yellow-100 text-yellow-800">78%</Badge>
                  </td>
                  <td className="text-right p-2">
                    <TrendingDown className="h-4 w-4 text-red-600 ml-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Metrics Alerts
          </CardTitle>
          <CardDescription>Items requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">Project Completion Below Target</p>
                  <p className="text-xs text-muted-foreground">Current: 87% | Target: 95%</p>
                </div>
              </div>
              <Button size="sm" variant="outline">Review</Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">3 Projects Behind Schedule</p>
                  <p className="text-xs text-muted-foreground">Average delay: 5 days</p>
                </div>
              </div>
              <Button size="sm" variant="outline">View Projects</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}