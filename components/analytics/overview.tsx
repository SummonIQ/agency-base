'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  Calendar,
  Award,
  Briefcase,
  FileText
} from 'lucide-react';

interface OverviewData {
  totalJobLeads: number;
  appliedJobs: number;
  interviewsScheduled: number;
  offersReceived: number;
  applicationRate: number;
  interviewRate: number;
  offerRate: number;
  avgJobFitScore: number;
}

export function AnalyticsOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [timeframe, setTimeframe] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/analytics?type=overview&timeframe=${timeframe}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error?.userMessage || `HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setError(error instanceof Error ? error.message : 'Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeframe]);

  const formatPercentage = (value: number) => `${Math.round(value)}%`;
  const getPercentageColor = (value: number) => {
    if (value >= 70) return 'text-green-600';
    if (value >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (value: number, threshold: number) => {
    if (value >= threshold) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    }
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div>
            <CardTitle className="text-lg font-medium">
              <div className="h-[1.125rem] w-[160px] bg-muted rounded animate-pulse inline-block" />
            </CardTitle>
            <CardDescription>
              <div className="h-[0.875rem] w-[260px] bg-muted rounded animate-pulse inline-block" />
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-10 w-[180px] bg-muted rounded-md animate-pulse" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 card-content-blur">
          {/* First row of metric cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg p-4 metric-card-bg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 bg-muted rounded animate-pulse flex-shrink-0" />
                    <span className="text-sm font-medium">
                      <div className="h-[0.875rem] w-[110px] bg-muted rounded animate-pulse inline-block" />
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  <div className="h-[2rem] w-[48px] bg-muted rounded animate-pulse inline-block" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <div className="h-[0.75rem] w-[150px] bg-muted rounded animate-pulse inline-block" />
                </p>
              </div>
            ))}
          </div>
          {/* Second row of metric cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i + 4} className="rounded-lg p-4 metric-card-bg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      <div className="h-[0.875rem] w-[100px] bg-muted rounded animate-pulse inline-block" />
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  <div className="h-[2rem] w-[56px] bg-muted rounded animate-pulse inline-block" />
                </div>
                <div className="mt-2">
                  <Progress value={0} className="h-2">
                    <div className="h-2 w-full bg-muted rounded-full animate-pulse" />
                  </Progress>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  <div className="h-[0.75rem] w-[170px] bg-muted rounded animate-pulse inline-block" />
                </p>
              </div>
            ))}
          </div>
          {/* Bottom row with 3 cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i + 8} className="rounded-lg p-4 metric-card-bg">
                <h4 className="text-base font-semibold mb-3">
                  <div className="h-[1rem] w-[160px] bg-muted rounded animate-pulse inline-block" />
                </h4>
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="flex justify-between items-center">
                      <span className="text-sm">
                        <div className="h-[0.875rem] w-[120px] bg-muted rounded animate-pulse inline-block" />
                      </span>
                      <Badge variant="secondary">
                        <div className="h-[0.875rem] w-[80px] bg-muted rounded animate-pulse inline-block" />
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">
              {error || 'Failed to load analytics data. Please try again.'}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="text-sm text-primary hover:underline"
            >
              Refresh page
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div>
          <CardTitle className="text-lg font-medium">Performance Overview</CardTitle>
          <CardDescription>
            Track your job search performance metrics
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          {/* Card actions can be added here */}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 card-content-blur">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg p-4 metric-card-bg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Total Job Leads</span>
              </div>
            </div>
            <div className="text-2xl font-bold">{data.totalJobLeads}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Jobs you've shown interest in
            </p>
          </div>

          <div className="rounded-lg p-4 metric-card-bg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Applications Sent</span>
              </div>
            </div>
            <div className="text-2xl font-bold">{data.appliedJobs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From {data.totalJobLeads} job leads
            </p>
          </div>

          <div className="rounded-lg p-4 metric-card-bg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Interviews Scheduled</span>
              </div>
            </div>
            <div className="text-2xl font-bold">{data.interviewsScheduled}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From {data.appliedJobs} applications
            </p>
          </div>

          <div className="rounded-lg p-4 metric-card-bg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Offers Received</span>
              </div>
            </div>
            <div className="text-2xl font-bold">{data.offersReceived}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From {data.interviewsScheduled} interviews
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg p-4 metric-card-bg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Application Rate</span>
              </div>
              <div className="flex items-center space-x-1">
                {getTrendIcon(data.applicationRate, 50)}
              </div>
            </div>
            <div className={`text-2xl font-bold ${getPercentageColor(data.applicationRate)}`}>
              {formatPercentage(data.applicationRate)}
            </div>
            <div className="mt-2">
              <Progress value={data.applicationRate} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Leads converted to applications
            </p>
          </div>

          <div className="rounded-lg p-4 metric-card-bg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Interview Rate</span>
              </div>
              <div className="flex items-center space-x-1">
                {getTrendIcon(data.interviewRate, 20)}
              </div>
            </div>
            <div className={`text-2xl font-bold ${getPercentageColor(data.interviewRate)}`}>
              {formatPercentage(data.interviewRate)}
            </div>
            <div className="mt-2">
              <Progress value={data.interviewRate} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Applications leading to interviews
            </p>
          </div>

          <div className="rounded-lg p-4 metric-card-bg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Offer Rate</span>
              </div>
              <div className="flex items-center space-x-1">
                {getTrendIcon(data.offerRate, 30)}
              </div>
            </div>
            <div className={`text-2xl font-bold ${getPercentageColor(data.offerRate)}`}>
              {formatPercentage(data.offerRate)}
            </div>
            <div className="mt-2">
              <Progress value={data.offerRate} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Interviews resulting in offers
            </p>
          </div>

          <div className="rounded-lg p-4 metric-card-bg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Avg Job Fit Score</span>
              </div>
            </div>
            <div className="text-2xl font-bold">{Math.round(data.avgJobFitScore)}</div>
            <div className="mt-2">
              <Progress value={data.avgJobFitScore} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              AI-powered job compatibility score
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg p-4 metric-card-bg">
            <h4 className="text-base font-semibold mb-3">Performance Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Application Efficiency</span>
                <Badge variant={data.applicationRate >= 50 ? 'default' : 'secondary'}>
                  {data.applicationRate >= 50 ? 'Good' : 'Needs Improvement'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Interview Success</span>
                <Badge variant={data.interviewRate >= 20 ? 'default' : 'secondary'}>
                  {data.interviewRate >= 20 ? 'Excellent' : 'Room for Growth'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Job Fit Quality</span>
                <Badge variant={data.avgJobFitScore >= 70 ? 'default' : 'secondary'}>
                  {data.avgJobFitScore >= 70 ? 'High Quality' : 'Focus on Fit'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="rounded-lg p-4 metric-card-bg">
            <h4 className="text-base font-semibold mb-3">Quick Insights</h4>
            <div className="space-y-2 text-sm">
              <p>
                • You've applied to <strong>{formatPercentage(data.applicationRate)}</strong> of your job leads
              </p>
              <p>
                • <strong>{formatPercentage(data.interviewRate)}</strong> of applications led to interviews
              </p>
              <p>
                • Your average job fit score is <strong>{Math.round(data.avgJobFitScore)}/100</strong>
              </p>
            </div>
          </div>

          <div className="rounded-lg p-4 metric-card-bg">
            <h4 className="text-base font-semibold mb-3">Recommendations</h4>
            <div className="space-y-2 text-sm">
              {data.applicationRate < 50 && (
                <p>• Consider applying to more of your saved job leads</p>
              )}
              {data.avgJobFitScore < 70 && (
                <p>• Focus on jobs with higher fit scores for better results</p>
              )}
              {data.interviewRate < 20 && (
                <p>• Optimize your resume and cover letters</p>
              )}
              {data.applicationRate >= 50 && data.interviewRate >= 20 && data.avgJobFitScore >= 70 && (
                <p>• Great job! Keep up the excellent work 🎉</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
