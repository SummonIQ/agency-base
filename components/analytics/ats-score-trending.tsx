"use client";

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target } from 'lucide-react';
import { format } from 'date-fns';
import { type ATSScoreTrend } from '@/lib/resumes/performance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ATSScoreTrendingProps {
  resumeId?: string;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

export function ATSScoreTrending({ resumeId, dateRange }: ATSScoreTrendingProps) {
  const [trends, setTrends] = useState<ATSScoreTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('90d');

  useEffect(() => {
    loadATSTrends();
  }, [resumeId, dateRange, timeframe]);

  const loadATSTrends = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (resumeId) params.append('resumeId', resumeId);
      if (dateRange) {
        params.append('startDate', dateRange.startDate.toISOString());
        params.append('endDate', dateRange.endDate.toISOString());
      }
      params.append('timeframe', timeframe);

      const response = await fetch(`/api/resumes/ats-analysis?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ATS trends');
      }
      
      const data = await response.json();
      setTrends(data);
    } catch (error) {
      console.error('Failed to load ATS trends:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="h-4 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (trends.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No ATS Analysis Data</h3>
            <p className="text-muted-foreground mb-4">
              Run resume analysis to see ATS score trends
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const latestScore = trends[trends.length - 1];
  const firstScore = trends[0];
  const overallImprovement = trends.length > 1 
    ? ((latestScore.score - firstScore.score) / firstScore.score) * 100 
    : 0;

  const chartData = trends.map(trend => ({
    date: format(trend.date, 'MMM d'),
    score: trend.score,
    change: trend.changeFromPrevious || 0,
    resumeName: trend.resumeName,
    fullDate: trend.date
  }));

  const getScoreStatus = (score: number) => {
    if (score >= 80) return { icon: CheckCircle, color: 'text-green-600', label: 'Excellent' };
    if (score >= 60) return { icon: Target, color: 'text-yellow-600', label: 'Good' };
    return { icon: AlertTriangle, color: 'text-red-600', label: 'Needs Work' };
  };

  const getTrendIcon = () => {
    if (overallImprovement > 5) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (overallImprovement < -5) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Target className="h-4 w-4 text-muted-foreground" />;
  };

  const scoreStatus = getScoreStatus(latestScore.score);
  const StatusIcon = scoreStatus.icon;

  return (
    <div className="space-y-6">
      {/* Current Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current ATS Score</CardTitle>
            <StatusIcon className={`h-4 w-4 ${scoreStatus.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={scoreStatus.color}>
                {latestScore.score}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {scoreStatus.label} ATS compatibility
            </p>
            <Badge variant="secondary" className="mt-1">
              {format(latestScore.date, 'MMM d, yyyy')}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Trend</CardTitle>
            {getTrendIcon()}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={overallImprovement >= 0 ? 'text-green-600' : 'text-red-600'}>
                {overallImprovement >= 0 ? '+' : ''}{overallImprovement.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Change over {timeframe}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analyses</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trends.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Total ATS analyses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Timeframe Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">ATS Score History</h3>
          <p className="text-sm text-muted-foreground">
            Track how your resume's ATS compatibility has improved over time
          </p>
        </div>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="180d">Last 6 months</SelectItem>
            <SelectItem value="365d">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Score Trend Chart */}
      <Card>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={[0, 100]}
                label={{ value: 'ATS Score', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                labelFormatter={(value, payload) => {
                  if (payload && payload[0]) {
                    return format(payload[0].payload.fullDate, 'MMMM d, yyyy');
                  }
                  return value;
                }}
                formatter={(value: number, name: string) => [
                  `${value} points`,
                  'ATS Score'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Score Improvements */}
      {trends.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Score Changes</CardTitle>
            <CardDescription>
              Track improvements and regressions in your ATS score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trends.slice(-5).reverse().map((trend, index) => {
                const isImprovement = (trend.changeFromPrevious || 0) > 0;
                const isSignificant = Math.abs(trend.changeFromPrevious || 0) >= 5;
                
                return (
                  <div key={trend.date.toISOString()} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium">
                        {format(trend.date, 'MMM d, yyyy')}
                      </div>
                      <Badge variant="outline">
                        Score: {trend.score}
                      </Badge>
                      {trend.resumeName && (
                        <span className="text-xs text-muted-foreground truncate max-w-32">
                          {trend.resumeName}
                        </span>
                      )}
                    </div>
                    
                    {trend.changeFromPrevious !== undefined && (
                      <div className="flex items-center space-x-2">
                        {isImprovement ? (
                          <TrendingUp className={`h-4 w-4 ${isSignificant ? 'text-green-600' : 'text-green-400'}`} />
                        ) : (
                          <TrendingDown className={`h-4 w-4 ${isSignificant ? 'text-red-600' : 'text-red-400'}`} />
                        )}
                        <span className={`text-sm font-medium ${
                          isImprovement 
                            ? isSignificant ? 'text-green-600' : 'text-green-500'
                            : isSignificant ? 'text-red-600' : 'text-red-500'
                        }`}>
                          {isImprovement ? '+' : ''}{trend.changeFromPrevious.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Target className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">ATS Optimization Tips</h4>
              <div className="text-sm text-blue-700 space-y-1">
                {latestScore.score < 60 && (
                  <p>• Consider restructuring your resume with standard sections and simpler formatting</p>
                )}
                {latestScore.score >= 60 && latestScore.score < 80 && (
                  <p>• Add more relevant keywords and quantify your achievements</p>
                )}
                {latestScore.score >= 80 && (
                  <p>• Great ATS compatibility! Focus on content quality and relevance</p>
                )}
                <p>• Regularly analyze your resume after making changes to track improvements</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}