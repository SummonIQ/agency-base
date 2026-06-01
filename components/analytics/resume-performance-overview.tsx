"use client";

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Target, Award, Clock, Zap } from 'lucide-react';
import { type ResumePerformanceMetrics } from '@/lib/resumes/performance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ResumePerformanceOverviewProps {
  resumeId?: string;
  resumeRevisionId?: string;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

export function ResumePerformanceOverview({
  resumeId,
  resumeRevisionId,
  dateRange
}: ResumePerformanceOverviewProps) {
  const [metrics, setMetrics] = useState<ResumePerformanceMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('90d');

  useEffect(() => {
    loadPerformanceMetrics();
  }, [resumeId, resumeRevisionId, dateRange, selectedTimeframe]);

  const loadPerformanceMetrics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (resumeId) params.append('resumeId', resumeId);
      if (resumeRevisionId) params.append('resumeRevisionId', resumeRevisionId);
      if (dateRange) {
        params.append('startDate', dateRange.startDate.toISOString());
        params.append('endDate', dateRange.endDate.toISOString());
      }
      params.append('includeComparison', 'true');

      const response = await fetch(`/api/resumes/performance-metrics?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch performance metrics');
      }
      
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load performance metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (metrics.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Performance Data</h3>
            <p className="text-muted-foreground mb-4">
              Submit applications with this resume to see performance metrics
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const primaryMetric = metrics[0];
  const hasComparison = metrics.length > 1;

  const performanceData = metrics.map((metric, index) => ({
    name: metric.resumeName?.substring(0, 20) || `Resume ${index + 1}`,
    'Response Rate': metric.responseRate,
    'Interview Rate': metric.interviewRate,
    'Offer Rate': metric.offerRate,
    'ATS Score': metric.atsScore || 0,
    applications: metric.totalApplications
  }));

  const getScoreColor = (score: number, type: 'rate' | 'ats') => {
    if (type === 'rate') {
      if (score >= 20) return 'text-green-600';
      if (score >= 10) return 'text-yellow-600';
      return 'text-red-600';
    } else {
      if (score >= 80) return 'text-green-600';
      if (score >= 60) return 'text-yellow-600';
      return 'text-red-600';
    }
  };

  const getTrendIcon = (rate: number) => {
    if (rate >= 15) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (rate >= 5) return <Zap className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            {getTrendIcon(primaryMetric.responseRate)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getScoreColor(primaryMetric.responseRate, 'rate')}>
                {primaryMetric.responseRate.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {primaryMetric.totalResponses} of {primaryMetric.totalApplications} applications
            </p>
            {primaryMetric.personalBest && (
              <Badge variant="secondary" className="mt-1">
                <Award className="h-3 w-3 mr-1" />
                Personal Best
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interview Rate</CardTitle>
            {getTrendIcon(primaryMetric.interviewRate)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getScoreColor(primaryMetric.interviewRate, 'rate')}>
                {primaryMetric.interviewRate.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {primaryMetric.totalInterviews} interviews secured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offer Rate</CardTitle>
            {getTrendIcon(primaryMetric.offerRate)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getScoreColor(primaryMetric.offerRate, 'rate')}>
                {primaryMetric.offerRate.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {primaryMetric.totalOffers} offers received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ATS Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {primaryMetric.atsScore ? (
                <span className={getScoreColor(primaryMetric.atsScore, 'ats')}>
                  {primaryMetric.atsScore}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {primaryMetric.atsScore ? 'ATS compatibility' : 'Not analyzed'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Comparison Chart */}
      {hasComparison && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Comparison</CardTitle>
            <CardDescription>
              Compare success rates across different resume versions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                  labelFormatter={(label) => {
                    const metric = performanceData.find(p => p.name === label);
                    return `${label} (${metric?.applications} applications)`;
                  }}
                />
                <Legend />
                <Bar dataKey="Response Rate" fill="#22c55e" />
                <Bar dataKey="Interview Rate" fill="#a855f7" />
                <Bar dataKey="Offer Rate" fill="#eab308" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Timing Analytics */}
      {primaryMetric.avgResponseTime && (
        <Card>
          <CardHeader>
            <CardTitle>Response Timing</CardTitle>
            <CardDescription>
              Average time to receive responses from employers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">
                  {primaryMetric.avgResponseTime.toFixed(0)} days
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Average response time
              </div>
            </div>
            
            {primaryMetric.avgInterviewTime && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-semibold">
                    {primaryMetric.avgInterviewTime.toFixed(0)} days
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Average time to interview
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sample Size Warning */}
      {primaryMetric.sampleSize < 10 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                Small Sample
              </Badge>
              <span className="text-sm text-yellow-700">
                Only {primaryMetric.sampleSize} applications tracked. Apply to more jobs for reliable insights.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}