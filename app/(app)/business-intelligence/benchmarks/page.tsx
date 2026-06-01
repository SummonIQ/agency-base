import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  TrendingUp,
  Target,
  Award,
  Users,
  DollarSign,
  Clock,
  Zap,
  ChevronUp,
  ChevronDown,
  Minus,
  Info,
  Download,
  Filter
} from 'lucide-react';

export default async function BenchmarksPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  // Mock data for benchmarks
  const industryBenchmarks = [
    {
      metric: 'Revenue per Client',
      yourValue: '$5,200',
      industryAvg: '$4,800',
      topPerformers: '$7,500',
      percentile: 65,
      trend: 'up',
      comparison: 'above',
    },
    {
      metric: 'Client Retention Rate',
      yourValue: '92%',
      industryAvg: '85%',
      topPerformers: '95%',
      percentile: 78,
      trend: 'up',
      comparison: 'above',
    },
    {
      metric: 'Project Margin',
      yourValue: '42%',
      industryAvg: '38%',
      topPerformers: '48%',
      percentile: 70,
      trend: 'neutral',
      comparison: 'above',
    },
    {
      metric: 'Team Utilization',
      yourValue: '78%',
      industryAvg: '82%',
      topPerformers: '90%',
      percentile: 45,
      trend: 'down',
      comparison: 'below',
    },
    {
      metric: 'Time to Delivery',
      yourValue: '21 days',
      industryAvg: '28 days',
      topPerformers: '18 days',
      percentile: 72,
      trend: 'up',
      comparison: 'above',
    },
    {
      metric: 'Client Satisfaction',
      yourValue: '4.5/5',
      industryAvg: '4.2/5',
      topPerformers: '4.8/5',
      percentile: 68,
      trend: 'up',
      comparison: 'above',
    },
  ];

  const competitorComparison = [
    { name: 'Your Agency', score: 82, revenue: 125000, clients: 24, projects: 45 },
    { name: 'Competitor A', score: 78, revenue: 110000, clients: 20, projects: 38 },
    { name: 'Competitor B', score: 85, revenue: 145000, clients: 28, projects: 52 },
    { name: 'Competitor C', score: 75, revenue: 95000, clients: 18, projects: 35 },
    { name: 'Industry Leader', score: 92, revenue: 250000, clients: 45, projects: 85 },
  ];

  const getComparisonColor = (comparison: string) => {
    switch (comparison) {
      case 'above':
        return 'text-green-600';
      case 'below':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getComparisonIcon = (comparison: string) => {
    switch (comparison) {
      case 'above':
        return <ChevronUp className="h-4 w-4" />;
      case 'below':
        return <ChevronDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 75) return 'bg-green-100 text-green-800';
    if (percentile >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Industry Benchmarks</h1>
          <p className="text-muted-foreground">Compare your performance against industry standards</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter Industry
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overall Performance */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82/100</div>
            <p className="text-xs text-muted-foreground">Top 35% in industry</p>
            <Progress value={82} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Industry Rank</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#42</div>
            <p className="text-xs text-green-600">↑ 8 positions this quarter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metrics Above Avg</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5/6</div>
            <p className="text-xs text-muted-foreground">83% above average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+15%</div>
            <p className="text-xs text-muted-foreground">vs 12% industry avg</p>
          </CardContent>
        </Card>
      </div>

      {/* Benchmark Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Performance vs Industry</CardTitle>
          <CardDescription>How you compare to industry averages and top performers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Metric</th>
                  <th className="text-right p-3">Your Value</th>
                  <th className="text-right p-3">Industry Avg</th>
                  <th className="text-right p-3">Top 10%</th>
                  <th className="text-center p-3">Percentile</th>
                  <th className="text-center p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {industryBenchmarks.map((benchmark) => (
                  <tr key={benchmark.metric} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">{benchmark.metric}</td>
                    <td className="text-right p-3">
                      <span className="font-semibold">{benchmark.yourValue}</span>
                    </td>
                    <td className="text-right p-3 text-muted-foreground">
                      {benchmark.industryAvg}
                    </td>
                    <td className="text-right p-3 text-muted-foreground">
                      {benchmark.topPerformers}
                    </td>
                    <td className="text-center p-3">
                      <Badge className={getPercentileColor(benchmark.percentile)}>
                        {benchmark.percentile}th
                      </Badge>
                    </td>
                    <td className="text-center p-3">
                      <div className={`flex items-center justify-center gap-1 ${getComparisonColor(benchmark.comparison)}`}>
                        {getComparisonIcon(benchmark.comparison)}
                        <span className="text-xs font-medium">
                          {benchmark.comparison}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Competitor Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Competitor Analysis</CardTitle>
          <CardDescription>Direct comparison with similar agencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Agency</th>
                  <th className="text-right p-3">Score</th>
                  <th className="text-right p-3">Revenue</th>
                  <th className="text-right p-3">Clients</th>
                  <th className="text-right p-3">Projects</th>
                  <th className="text-center p-3">Performance</th>
                </tr>
              </thead>
              <tbody>
                {competitorComparison.map((competitor) => (
                  <tr
                    key={competitor.name}
                    className={`border-b hover:bg-muted/50 ${
                      competitor.name === 'Your Agency' ? 'bg-primary/5' : ''
                    }`}
                  >
                    <td className="p-3 font-medium">
                      {competitor.name}
                      {competitor.name === 'Your Agency' && (
                        <Badge className="ml-2" variant="outline">You</Badge>
                      )}
                    </td>
                    <td className="text-right p-3">
                      <span className="font-semibold">{competitor.score}</span>
                    </td>
                    <td className="text-right p-3">
                      ${(competitor.revenue / 1000).toFixed(0)}k
                    </td>
                    <td className="text-right p-3">{competitor.clients}</td>
                    <td className="text-right p-3">{competitor.projects}</td>
                    <td className="p-3">
                      <Progress value={competitor.score} className="h-2" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Improvement Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Improvement Opportunities
          </CardTitle>
          <CardDescription>Areas where you can improve to match top performers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Team Utilization</p>
                  <p className="text-xs text-muted-foreground">
                    Current: 78% | Industry: 82% | Potential gain: $15k/month
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                <Info className="h-3 w-3 mr-1" />
                Learn More
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Delivery Speed</p>
                  <p className="text-xs text-muted-foreground">
                    Current: 21 days | Top 10%: 18 days | Impact: +2 projects/month
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                <Info className="h-3 w-3 mr-1" />
                Learn More
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Project Margin</p>
                  <p className="text-xs text-muted-foreground">
                    Current: 42% | Top 10%: 48% | Potential gain: $8k/project
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                <Info className="h-3 w-3 mr-1" />
                Learn More
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}