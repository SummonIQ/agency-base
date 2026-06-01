'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Mail,
  Target,
  DollarSign,
  Calendar,
  Activity,
  Zap,
  Eye,
  MousePointer,
  MessageSquare,
  Trophy,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';

interface Analytics {
  summary: {
    totalLeads: number;
    leadsGrowth: number;
    totalPipelineValue: number;
    pipelineGrowth: number;
    totalEmails: number;
    totalCampaigns: number;
    qualifiedLeads: number;
    wonLeads: number;
  };
  performance: {
    openRate: number;
    clickRate: number;
    replyRate: number;
    conversionRate: number;
    winRate: number;
  };
  distribution: {
    leadsByStatus: Record<string, number>;
    leadsBySource: Record<string, number>;
    leadsByIndustry: Record<string, number>;
  };
  chartData?: Array<{
    date: string;
    leads: number;
    emails: number;
    pipelineValue: number;
  }>;
  templatePerformance?: Array<{
    templateId: string;
    sent: number;
    openRate: number;
    clickRate: number;
    replyRate: number;
  }>;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

const timeRangeOptions = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '3m', label: 'Last 3 months' },
  { value: 'this_week', label: 'This week' },
  { value: 'this_month', label: 'This month' },
];

export default function AnalyticsClient() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [includeDetails, setIncludeDetails] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, includeDetails]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        range: timeRange,
        details: includeDetails.toString(),
      });

      const response = await fetch(`/api/lead-generation/analytics?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    return (
      <div className={`flex items-center gap-1 ${color}`}>
        <Icon className="h-3 w-3" />
        <span className="text-xs">{Math.abs(growth).toFixed(1)}%</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">No analytics data available</p>
        </div>
      </div>
    );
  }

  // Transform data for charts
  const statusData = Object.entries(analytics.distribution.leadsByStatus).map(([status, count]) => ({
    name: status.replace('_', ' '),
    value: count,
    fill: COLORS[Object.keys(analytics.distribution.leadsByStatus).indexOf(status) % COLORS.length],
  }));

  const sourceData = Object.entries(analytics.distribution.leadsBySource).map(([source, count]) => ({
    name: source,
    value: count,
    fill: COLORS[Object.keys(analytics.distribution.leadsBySource).indexOf(source) % COLORS.length],
  }));

  const industryData = Object.entries(analytics.distribution.leadsByIndustry).map(([industry, count]) => ({
    name: industry,
    count,
  }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your lead generation and outreach performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRangeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setIncludeDetails(!includeDetails)}
          >
            {includeDetails ? 'Simple View' : 'Detailed View'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary.totalLeads}</div>
            {formatGrowth(analytics.summary.leadsGrowth)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics.summary.totalPipelineValue.toLocaleString()}
            </div>
            {formatGrowth(analytics.summary.pipelineGrowth)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary.totalEmails}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.summary.totalCampaigns} active campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.performance.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.summary.qualifiedLeads} qualified leads
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.performance.openRate}%</div>
            <p className="text-xs text-muted-foreground">Industry avg: 22%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.performance.clickRate}%</div>
            <p className="text-xs text-muted-foreground">Industry avg: 3%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reply Rate</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.performance.replyRate}%</div>
            <p className="text-xs text-muted-foreground">Industry avg: 8.5%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.performance.winRate}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.summary.wonLeads} deals won
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="charts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          {includeDetails && <TabsTrigger value="templates">Templates</TabsTrigger>}
        </TabsList>

        <TabsContent value="charts" className="space-y-4">
          {analytics.chartData && analytics.chartData.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Lead Generation Over Time</CardTitle>
                  <CardDescription>New leads and outreach activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => format(new Date(value), 'MM/dd')}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                      />
                      <Line
                        type="monotone"
                        dataKey="leads"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        name="New Leads"
                      />
                      <Line
                        type="monotone"
                        dataKey="emails"
                        stroke="#10B981"
                        strokeWidth={2}
                        name="Emails Sent"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pipeline Value Trend</CardTitle>
                  <CardDescription>Daily pipeline value accumulation</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => format(new Date(value), 'MM/dd')}
                      />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                      <Tooltip
                        labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Pipeline Value']}
                      />
                      <Area
                        type="monotone"
                        dataKey="pipelineValue"
                        stroke="#F59E0B"
                        fill="#FEF3C7"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No chart data available</h3>
                <p className="text-sm text-muted-foreground">
                  Generate more leads and outreach activity to see trends
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Leads by Status</CardTitle>
                <CardDescription>Current lead distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lead Sources</CardTitle>
                <CardDescription>Where leads come from</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Industries</CardTitle>
                <CardDescription>Lead distribution by industry</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={industryData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {includeDetails && analytics.templatePerformance && (
          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Template Performance</CardTitle>
                <CardDescription>How your email templates are performing</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.templatePerformance.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.templatePerformance.map((template) => (
                      <div key={template.templateId} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold">{template.templateId.replace('-', ' ')}</h4>
                          <Badge variant="outline">{template.sent} sent</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Open Rate</div>
                            <div className="font-semibold">{template.openRate.toFixed(1)}%</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Click Rate</div>
                            <div className="font-semibold">{template.clickRate.toFixed(1)}%</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Reply Rate</div>
                            <div className="font-semibold">{template.replyRate.toFixed(1)}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No template data</h3>
                    <p className="text-sm text-muted-foreground">
                      Start sending emails with templates to see performance metrics
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}