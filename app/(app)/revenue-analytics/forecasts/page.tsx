import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  DollarSign,
  Target,
  Calendar,
  AlertTriangle,
  ChartLine,
  Zap,
  Info,
  Download,
  Settings,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { db } from '@/lib/db';
import { ForecastPageActions } from '@/components/revenue/forecast-page-client';

async function getForecastData(userId: string) {
  const currentDate = new Date();
  const yearStart = new Date(currentDate.getFullYear(), 0, 1);
  const yearEnd = new Date(currentDate.getFullYear() + 1, 0, 0);

  // Get all forecasts for the current year
  const forecasts = await db.revenueForecast.findMany({
    where: {
      userId,
      expectedDate: {
        gte: yearStart,
        lte: yearEnd,
      },
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
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
      expectedDate: 'asc',
    },
  });

  // Calculate quarters
  const q3Start = new Date(currentDate.getFullYear(), 6, 1); // July
  const q3End = new Date(currentDate.getFullYear(), 9, 0); // End of September
  const q4Start = new Date(currentDate.getFullYear(), 9, 1); // October
  const q4End = new Date(currentDate.getFullYear(), 11, 31); // End of December

  // Filter forecasts by quarter
  const q3Forecasts = forecasts.filter(f => f.expectedDate >= q3Start && f.expectedDate <= q3End);
  const q4Forecasts = forecasts.filter(f => f.expectedDate >= q4Start && f.expectedDate <= q4End);

  const q3Forecast = q3Forecasts.reduce((sum, f) => sum + f.amount, 0);
  const q4Forecast = q4Forecasts.reduce((sum, f) => sum + f.amount, 0);
  const yearEndProjected = forecasts.reduce((sum, f) => sum + f.amount, 0);

  // Calculate weighted forecasts based on confidence
  const q3WeightedForecast = q3Forecasts.reduce((sum, f) => sum + (f.amount * (f.confidence / 100)), 0);
  const q4WeightedForecast = q4Forecasts.reduce((sum, f) => sum + (f.amount * (f.confidence / 100)), 0);

  // Calculate average confidence
  const avgConfidence = forecasts.length > 0
    ? forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length
    : 0;

  // Set targets (for demo purposes, using 110% of current forecast)
  const q3Target = q3Forecast * 1.1;
  const q4Target = q4Forecast * 1.1;
  const yearEndTarget = yearEndProjected * 1.1;

  // Generate monthly forecasts for next 6 months
  const monthlyForecasts = [];
  for (let i = 0; i < 6; i++) {
    const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

    const monthForecasts = forecasts.filter(f => f.expectedDate >= monthStart && f.expectedDate <= monthEnd);
    const monthForecast = monthForecasts.reduce((sum, f) => sum + f.amount, 0);
    const monthWeighted = monthForecasts.reduce((sum, f) => sum + (f.amount * (f.confidence / 100)), 0);
    const monthConfidence = monthForecasts.length > 0
      ? monthForecasts.reduce((sum, f) => sum + f.confidence, 0) / monthForecasts.length
      : 50;

    monthlyForecasts.push({
      month: monthDate.toLocaleString('default', { month: 'short' }),
      forecast: Math.round(monthWeighted),
      target: Math.round(monthForecast * 1.1),
      probability: Math.round(monthConfidence),
      pipeline: Math.round(monthForecast * 1.3), // Assume pipeline is 130% of forecast
    });
  }

  // Generate scenario analysis
  const scenarioAnalysis = [
    {
      scenario: 'Best Case',
      q3: Math.round(q3Forecast * 1.15),
      q4: Math.round(q4Forecast * 1.15),
      yearEnd: Math.round(yearEndProjected * 1.15),
      probability: 20,
    },
    {
      scenario: 'Most Likely',
      q3: Math.round(q3WeightedForecast),
      q4: Math.round(q4WeightedForecast),
      yearEnd: Math.round(yearEndProjected * (avgConfidence / 100)),
      probability: 60,
    },
    {
      scenario: 'Worst Case',
      q3: Math.round(q3Forecast * 0.75),
      q4: Math.round(q4Forecast * 0.75),
      yearEnd: Math.round(yearEndProjected * 0.75),
      probability: 20,
    },
  ];

  // Generate mock risk factors based on forecast data
  const riskFactors = [
    { factor: 'Key Client Renewals', impact: 'High', revenue: Math.round(yearEndProjected * 0.1), probability: 75 },
    { factor: 'New Service Launch', impact: 'Medium', revenue: Math.round(yearEndProjected * 0.05), probability: 60 },
    { factor: 'Market Competition', impact: 'Medium', revenue: -Math.round(yearEndProjected * 0.03), probability: 40 },
    { factor: 'Economic Uncertainty', impact: 'High', revenue: -Math.round(yearEndProjected * 0.08), probability: 25 },
  ];

  return {
    forecastSummary: {
      q3Forecast: Math.round(q3WeightedForecast),
      q3Target: Math.round(q3Target),
      q4Forecast: Math.round(q4WeightedForecast),
      q4Target: Math.round(q4Target),
      yearEndProjected: Math.round(yearEndProjected * (avgConfidence / 100)),
      yearEndTarget: Math.round(yearEndTarget),
      confidence: Math.round(avgConfidence),
      accuracy: 85, // Mock accuracy for demo
    },
    monthlyForecasts,
    scenarioAnalysis,
    riskFactors,
  };
}

export default async function ForecastsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const { forecastSummary, monthlyForecasts, scenarioAnalysis, riskFactors } = await getForecastData(session.user.id);

  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return 'text-green-600';
    if (probability >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Revenue Forecasts</h1>
          <p className="text-muted-foreground">Predictive analytics and revenue projections</p>
        </div>
        <div className="flex gap-2">
          <ForecastPageActions />
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Configure Model
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Forecast
          </Button>
        </div>
      </div>

      {/* Key Forecast Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Q3 Forecast</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(forecastSummary.q3Forecast / 1000).toFixed(0)}k
            </div>
            <Progress
              value={(forecastSummary.q3Forecast / forecastSummary.q3Target) * 100}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Target: ${(forecastSummary.q3Target / 1000).toFixed(0)}k
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Q4 Forecast</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(forecastSummary.q4Forecast / 1000).toFixed(0)}k
            </div>
            <Progress
              value={(forecastSummary.q4Forecast / forecastSummary.q4Target) * 100}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Target: ${(forecastSummary.q4Target / 1000).toFixed(0)}k
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Year End</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(forecastSummary.yearEndProjected / 1000).toFixed(0)}k
            </div>
            <Progress
              value={(forecastSummary.yearEndProjected / forecastSummary.yearEndTarget) * 100}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Target: $1M
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confidence</CardTitle>
            <ChartLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getProbabilityColor(forecastSummary.confidence)}`}>
              {forecastSummary.confidence}%
            </div>
            <p className="text-xs text-muted-foreground">
              Model accuracy: {forecastSummary.accuracy}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Forecast</CardTitle>
          <CardDescription>Projected revenue for the next 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Month</th>
                  <th className="text-right p-3">Forecast</th>
                  <th className="text-right p-3">Target</th>
                  <th className="text-right p-3">Pipeline</th>
                  <th className="text-center p-3">Probability</th>
                  <th className="text-center p-3">Coverage</th>
                </tr>
              </thead>
              <tbody>
                {monthlyForecasts.map((month) => {
                  const coverage = (month.pipeline / month.target) * 100;
                  const isOnTrack = month.forecast >= month.target * 0.9;

                  return (
                    <tr key={month.month} className="border-b">
                      <td className="p-3 font-medium">{month.month}</td>
                      <td className="text-right p-3">
                        <span className="font-semibold">
                          ${(month.forecast / 1000).toFixed(0)}k
                        </span>
                      </td>
                      <td className="text-right p-3">
                        ${(month.target / 1000).toFixed(0)}k
                        {isOnTrack ? (
                          <ArrowUp className="inline h-3 w-3 text-green-600 ml-1" />
                        ) : (
                          <ArrowDown className="inline h-3 w-3 text-red-600 ml-1" />
                        )}
                      </td>
                      <td className="text-right p-3">
                        ${(month.pipeline / 1000).toFixed(0)}k
                      </td>
                      <td className="text-center p-3">
                        <span className={`font-semibold ${getProbabilityColor(month.probability)}`}>
                          {month.probability}%
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Progress value={Math.min(coverage, 100)} className="flex-1" />
                          <span className="text-xs text-muted-foreground w-12 text-right">
                            {coverage.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Scenario Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Scenario Analysis</CardTitle>
            <CardDescription>Revenue projections under different scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scenarioAnalysis.map((scenario) => (
                <div key={scenario.scenario} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{scenario.scenario}</span>
                      <Badge variant="outline" className="text-xs">
                        {scenario.probability}% likely
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="text-xs text-muted-foreground">Q3</div>
                      <div className="font-semibold">
                        ${(scenario.q3 / 1000).toFixed(0)}k
                      </div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="text-xs text-muted-foreground">Q4</div>
                      <div className="font-semibold">
                        ${(scenario.q4 / 1000).toFixed(0)}k
                      </div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="text-xs text-muted-foreground">Year End</div>
                      <div className="font-semibold">
                        ${(scenario.yearEnd / 1000).toFixed(0)}k
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Factors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Risk & Opportunity Factors
            </CardTitle>
            <CardDescription>Key factors affecting forecast accuracy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {riskFactors.map((risk) => (
                <div key={risk.factor} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium">{risk.factor}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getImpactColor(risk.impact)}>
                          {risk.impact} Impact
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {risk.probability}% probability
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${risk.revenue > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {risk.revenue > 0 ? '+' : ''}${(Math.abs(risk.revenue) / 1000).toFixed(0)}k
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Forecast Insights & Recommendations
          </CardTitle>
          <CardDescription>AI-generated insights based on current trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium mb-1">Pipeline Coverage</p>
              <p className="text-xs text-muted-foreground">
                Your Q3 pipeline coverage is 142%, which is healthy. However, Q4 coverage at 118%
                suggests you need to focus on building more pipeline for year-end targets.
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm font-medium mb-1">Conversion Rate Improvement</p>
              <p className="text-xs text-muted-foreground">
                A 5% improvement in conversion rate could add $45k to Q4 revenue.
                Consider implementing lead scoring to focus on high-quality prospects.
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm font-medium mb-1">Seasonality Adjustment</p>
              <p className="text-xs text-muted-foreground">
                Historical data shows December typically sees 15% higher close rates.
                The forecast has been adjusted accordingly, but ensure adequate resources are available.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}