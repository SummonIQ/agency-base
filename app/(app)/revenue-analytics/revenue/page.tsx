import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  FileText,
  Users,
  Briefcase,
  PieChart,
  BarChart3,
  Download,
  Filter,
  ChevronRight
} from 'lucide-react';
import { db } from '@/lib/db';
import { RevenuePageActions } from '@/components/revenue/revenue-page-client';

async function getRevenueData(userId: string) {
  // Get revenue records for the last 12 months
  const endDate = new Date();
  const startDate = new Date(endDate.getFullYear() - 1, endDate.getMonth(), 1);

  const revenueRecords = await db.revenueRecord.findMany({
    where: {
      userId,
      periodStart: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      periodStart: 'desc',
    },
  });

  // Get clients with revenue data
  const clients = await db.client.findMany({
    where: { userId },
    include: {
      revenueRecords: {
        where: {
          status: 'RECEIVED',
          periodStart: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      projects: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Calculate stats
  const receivedRevenue = revenueRecords.filter(r => r.status === 'RECEIVED');
  const totalRevenue = receivedRevenue.reduce((sum, r) => sum + r.amount, 0);
  const totalDeals = receivedRevenue.length;
  const avgDealSize = totalDeals > 0 ? totalRevenue / totalDeals : 0;

  // Calculate YTD revenue
  const yearStart = new Date(endDate.getFullYear(), 0, 1);
  const ytdRevenue = receivedRevenue
    .filter(r => r.periodStart >= yearStart)
    .reduce((sum, r) => sum + r.amount, 0);

  // Calculate monthly recurring revenue (subscription type)
  const recurringRevenue = revenueRecords
    .filter(r => r.type === 'SUBSCRIPTION' && r.status === 'RECEIVED')
    .reduce((sum, r) => sum + r.amount, 0);

  // Calculate quarterly growth
  const currentQuarterStart = new Date(endDate.getFullYear(), Math.floor(endDate.getMonth() / 3) * 3, 1);
  const previousQuarterStart = new Date(currentQuarterStart);
  previousQuarterStart.setMonth(previousQuarterStart.getMonth() - 3);

  const currentQuarterRevenue = receivedRevenue
    .filter(r => r.periodStart >= currentQuarterStart)
    .reduce((sum, r) => sum + r.amount, 0);

  const previousQuarterRevenue = receivedRevenue
    .filter(r => r.periodStart >= previousQuarterStart && r.periodStart < currentQuarterStart)
    .reduce((sum, r) => sum + r.amount, 0);

  const quarterlyGrowth = previousQuarterRevenue > 0
    ? ((currentQuarterRevenue - previousQuarterRevenue) / previousQuarterRevenue) * 100
    : 0;

  // Group revenue by month for chart
  const monthlyData = new Map<string, { revenue: number; target: number }>();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1);
    const monthKey = date.toLocaleString('default', { month: 'short' });
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const monthlyRevenue = receivedRevenue
      .filter(r => r.periodStart >= monthStart && r.periodStart <= monthEnd)
      .reduce((sum, r) => sum + r.amount, 0);

    monthlyData.set(monthKey, {
      revenue: monthlyRevenue,
      target: monthlyRevenue * 1.1 // 10% growth target for demo
    });
  }

  // Group revenue by type/source
  const revenueByType = receivedRevenue.reduce((acc, record) => {
    const type = record.type;
    if (!acc[type]) {
      acc[type] = { amount: 0, count: 0 };
    }
    acc[type].amount += record.amount;
    acc[type].count += 1;
    return acc;
  }, {} as Record<string, { amount: number; count: number }>);

  const revenueBySource = Object.entries(revenueByType).map(([type, data]) => ({
    source: type.charAt(0) + type.slice(1).toLowerCase(),
    amount: data.amount,
    percentage: totalRevenue > 0 ? (data.amount / totalRevenue) * 100 : 0,
    count: data.count,
  })).sort((a, b) => b.amount - a.amount);

  // Top clients by revenue
  const topClients = clients
    .map(client => ({
      name: client.name,
      revenue: client.revenueRecords.reduce((sum, r) => sum + r.amount, 0),
      projects: client.projects.length,
      status: client.status.toLowerCase(),
    }))
    .filter(client => client.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    revenueStats: {
      totalRevenue,
      monthlyRecurring: recurringRevenue,
      quarterlyGrowth,
      yearToDate: ytdRevenue,
      avgDealSize,
      totalDeals,
    },
    revenueByMonth: Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      ...data,
    })),
    revenueBySource,
    topClients,
  };
}

export default async function RevenuePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const { revenueStats, revenueByMonth, revenueBySource, topClients } = await getRevenueData(session.user.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'churned':
        return 'bg-red-100 text-red-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Revenue Overview</h1>
          <p className="text-muted-foreground">Track and analyze your revenue streams</p>
        </div>
        <div className="flex gap-2">
          <RevenuePageActions />
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(revenueStats.totalRevenue / 1000).toFixed(0)}k
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(revenueStats.monthlyRecurring / 1000).toFixed(0)}k
            </div>
            <p className="text-xs text-green-600">
              <ArrowUp className="inline h-3 w-3" />
              12% vs last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Q Growth</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueStats.quarterlyGrowth}%</div>
            <p className="text-xs text-muted-foreground">This quarter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YTD</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(revenueStats.yearToDate / 1000).toFixed(0)}k
            </div>
            <p className="text-xs text-muted-foreground">Year to date</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Deal</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(revenueStats.avgDealSize / 1000).toFixed(1)}k
            </div>
            <p className="text-xs text-muted-foreground">Per deal</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueStats.totalDeals}</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Trend</CardTitle>
          <CardDescription>Revenue vs target for the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenueByMonth.map((month) => {
              const percentage = (month.revenue / month.target) * 100;
              const isAboveTarget = month.revenue >= month.target;

              return (
                <div key={month.month} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium w-12">{month.month}</span>
                    <div className="flex-1 mx-4">
                      <Progress
                        value={Math.min(percentage, 100)}
                        className={`h-3 ${isAboveTarget ? '[&>div]:bg-green-600' : ''}`}
                      />
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold">
                        ${(month.revenue / 1000).toFixed(0)}k
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        / ${(month.target / 1000).toFixed(0)}k
                      </span>
                      {isAboveTarget ? (
                        <ArrowUp className="inline h-3 w-3 text-green-600 ml-1" />
                      ) : (
                        <ArrowDown className="inline h-3 w-3 text-red-600 ml-1" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue by Source */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Source</CardTitle>
            <CardDescription>Breakdown of revenue sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueBySource.map((source) => (
                <div key={source.source} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PieChart className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{source.source}</span>
                      <Badge variant="outline" className="text-xs">
                        {source.count} deals
                      </Badge>
                    </div>
                    <span className="text-sm font-semibold">
                      ${(source.amount / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={source.percentage} className="flex-1" />
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {source.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Clients */}
        <Card>
          <CardHeader>
            <CardTitle>Top Revenue Clients</CardTitle>
            <CardDescription>Highest revenue generating clients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topClients.map((client, index) => (
                <div key={client.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{client.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {client.projects} projects
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      ${(client.revenue / 1000).toFixed(0)}k
                    </span>
                    <Badge className={getStatusColor(client.status)}>
                      {client.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" size="sm">
              View All Clients
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Service Revenue Breakdown</CardTitle>
          <CardDescription>Revenue by service type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Service</th>
                  <th className="text-right p-3">Projects</th>
                  <th className="text-right p-3">Revenue</th>
                  <th className="text-right p-3">Avg Project</th>
                  <th className="text-right p-3">Growth</th>
                  <th className="text-center p-3">Contribution</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">Web Development</td>
                  <td className="text-right p-3">12</td>
                  <td className="text-right p-3 font-semibold">$145k</td>
                  <td className="text-right p-3">$12.1k</td>
                  <td className="text-right p-3">
                    <span className="text-green-600">+18%</span>
                  </td>
                  <td className="p-3">
                    <Progress value={32} className="h-2" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Mobile Apps</td>
                  <td className="text-right p-3">8</td>
                  <td className="text-right p-3 font-semibold">$98k</td>
                  <td className="text-right p-3">$12.3k</td>
                  <td className="text-right p-3">
                    <span className="text-green-600">+25%</span>
                  </td>
                  <td className="p-3">
                    <Progress value={21} className="h-2" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Consulting</td>
                  <td className="text-right p-3">15</td>
                  <td className="text-right p-3 font-semibold">$87k</td>
                  <td className="text-right p-3">$5.8k</td>
                  <td className="text-right p-3">
                    <span className="text-red-600">-5%</span>
                  </td>
                  <td className="p-3">
                    <Progress value={19} className="h-2" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Design Services</td>
                  <td className="text-right p-3">10</td>
                  <td className="text-right p-3 font-semibold">$75k</td>
                  <td className="text-right p-3">$7.5k</td>
                  <td className="text-right p-3">
                    <span className="text-green-600">+12%</span>
                  </td>
                  <td className="p-3">
                    <Progress value={16} className="h-2" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Maintenance</td>
                  <td className="text-right p-3">20</td>
                  <td className="text-right p-3 font-semibold">$53k</td>
                  <td className="text-right p-3">$2.7k</td>
                  <td className="text-right p-3">
                    <span className="text-green-600">+8%</span>
                  </td>
                  <td className="p-3">
                    <Progress value={12} className="h-2" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}