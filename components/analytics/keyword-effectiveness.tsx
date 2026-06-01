"use client";

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell } from 'recharts';
import { Hash, TrendingUp, TrendingDown, Target, Award, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface KeywordMetric {
  keyword: string;
  frequency: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
  totalApplications: number;
  industryRelevance: number;
  trendDirection: 'up' | 'down' | 'stable';
  effectiveness: 'high' | 'medium' | 'low';
}

interface KeywordEffectivenessProps {
  resumeId?: string;
  resumeRevisionId?: string;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

export function KeywordEffectiveness({
  resumeId,
  resumeRevisionId,
  dateRange
}: KeywordEffectivenessProps) {
  const [keywords, setKeywords] = useState<KeywordMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'effectiveness' | 'frequency' | 'responseRate'>('effectiveness');
  const [filterBy, setFilterBy] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadKeywordData();
  }, [resumeId, resumeRevisionId, dateRange]);

  const loadKeywordData = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - in real implementation, this would call an API
      // that analyzes the resume content and correlates keywords with application success
      const mockKeywords: KeywordMetric[] = [
        {
          keyword: 'React',
          frequency: 12,
          responseRate: 18.5,
          interviewRate: 12.3,
          offerRate: 4.2,
          totalApplications: 65,
          industryRelevance: 92,
          trendDirection: 'up',
          effectiveness: 'high'
        },
        {
          keyword: 'JavaScript',
          frequency: 8,
          responseRate: 15.2,
          interviewRate: 8.7,
          offerRate: 2.9,
          totalApplications: 52,
          industryRelevance: 89,
          trendDirection: 'stable',
          effectiveness: 'high'
        },
        {
          keyword: 'TypeScript',
          frequency: 6,
          responseRate: 22.1,
          interviewRate: 14.8,
          offerRate: 5.9,
          totalApplications: 34,
          industryRelevance: 78,
          trendDirection: 'up',
          effectiveness: 'high'
        },
        {
          keyword: 'Node.js',
          frequency: 5,
          responseRate: 16.8,
          interviewRate: 10.2,
          offerRate: 3.4,
          totalApplications: 29,
          industryRelevance: 76,
          trendDirection: 'stable',
          effectiveness: 'medium'
        },
        {
          keyword: 'AWS',
          frequency: 7,
          responseRate: 19.3,
          interviewRate: 11.5,
          offerRate: 4.8,
          totalApplications: 41,
          industryRelevance: 85,
          trendDirection: 'up',
          effectiveness: 'high'
        },
        {
          keyword: 'Docker',
          frequency: 4,
          responseRate: 13.2,
          interviewRate: 7.8,
          offerRate: 2.1,
          totalApplications: 23,
          industryRelevance: 71,
          trendDirection: 'stable',
          effectiveness: 'medium'
        },
        {
          keyword: 'MongoDB',
          frequency: 3,
          responseRate: 8.9,
          interviewRate: 4.2,
          offerRate: 1.1,
          totalApplications: 19,
          industryRelevance: 65,
          trendDirection: 'down',
          effectiveness: 'low'
        },
        {
          keyword: 'GraphQL',
          frequency: 2,
          responseRate: 25.6,
          interviewRate: 18.2,
          offerRate: 8.3,
          totalApplications: 12,
          industryRelevance: 62,
          trendDirection: 'up',
          effectiveness: 'high'
        },
        {
          keyword: 'Agile',
          frequency: 9,
          responseRate: 14.7,
          interviewRate: 9.1,
          offerRate: 3.2,
          totalApplications: 68,
          industryRelevance: 88,
          trendDirection: 'stable',
          effectiveness: 'medium'
        },
        {
          keyword: 'Leadership',
          frequency: 11,
          responseRate: 17.8,
          interviewRate: 13.4,
          offerRate: 6.1,
          totalApplications: 73,
          industryRelevance: 95,
          trendDirection: 'up',
          effectiveness: 'high'
        }
      ];

      setKeywords(mockKeywords);
    } catch (error) {
      console.error('Failed to load keyword data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedKeywords = keywords
    .filter(keyword => {
      if (filterBy !== 'all' && keyword.effectiveness !== filterBy) return false;
      if (searchTerm && !keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'frequency':
          return b.frequency - a.frequency;
        case 'responseRate':
          return b.responseRate - a.responseRate;
        case 'effectiveness':
        default:
          const effectivenessOrder = { high: 3, medium: 2, low: 1 };
          return effectivenessOrder[b.effectiveness] - effectivenessOrder[a.effectiveness];
      }
    });

  const chartData = filteredAndSortedKeywords.slice(0, 10).map(keyword => ({
    keyword: keyword.keyword.length > 10 ? `${keyword.keyword.substring(0, 10)}...` : keyword.keyword,
    fullKeyword: keyword.keyword,
    responseRate: parseFloat(keyword.responseRate.toFixed(1)),
    interviewRate: parseFloat(keyword.interviewRate.toFixed(1)),
    offerRate: parseFloat(keyword.offerRate.toFixed(1)),
    frequency: keyword.frequency,
    effectiveness: keyword.effectiveness
  }));

  const getEffectivenessColor = (effectiveness: string) => {
    switch (effectiveness) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <Target className="h-4 w-4 text-gray-600" />;
      default: return null;
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

  const topKeywords = keywords.filter(k => k.effectiveness === 'high').slice(0, 3);
  const underperformingKeywords = keywords.filter(k => k.effectiveness === 'low').slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High-Impact Keywords</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {keywords.filter(k => k.effectiveness === 'high').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Keywords driving strong responses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Response Rate</CardTitle>
            <Hash className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {(keywords.reduce((sum, k) => sum + k.responseRate, 0) / keywords.length).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all tracked keywords
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Underperforming</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {keywords.filter(k => k.effectiveness === 'low').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Keywords needing optimization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Search keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Keywords</SelectItem>
              <SelectItem value="high">High Impact</SelectItem>
              <SelectItem value="medium">Medium Impact</SelectItem>
              <SelectItem value="low">Low Impact</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="effectiveness">By Effectiveness</SelectItem>
              <SelectItem value="frequency">By Frequency</SelectItem>
              <SelectItem value="responseRate">By Response Rate</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Keyword Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Keyword Performance Overview</CardTitle>
          <CardDescription>
            Success rates for your most frequently used keywords
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="keyword" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{data.fullKeyword}</p>
                        <div className="space-y-1 mt-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-green-600">Response Rate:</span>
                            <span className="font-medium">{data.responseRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-purple-600">Interview Rate:</span>
                            <span className="font-medium">{data.interviewRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-yellow-600">Offer Rate:</span>
                            <span className="font-medium">{data.offerRate}%</span>
                          </div>
                          <div className="border-t pt-1 mt-2">
                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">Frequency:</span>
                              <span className="text-xs">{data.frequency} times</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className={`mt-2 ${getEffectivenessColor(data.effectiveness)}`}>
                          {data.effectiveness.charAt(0).toUpperCase() + data.effectiveness.slice(1)} Impact
                        </Badge>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="responseRate" fill="#22c55e" />
              <Bar dataKey="interviewRate" fill="#a855f7" />
              <Bar dataKey="offerRate" fill="#eab308" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Keyword Table */}
      <Card>
        <CardHeader>
          <CardTitle>Keyword Effectiveness Details</CardTitle>
          <CardDescription>
            Complete breakdown of each keyword's performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Keyword</th>
                  <th className="text-center py-2">Frequency</th>
                  <th className="text-center py-2">Applications</th>
                  <th className="text-center py-2">Response Rate</th>
                  <th className="text-center py-2">Interview Rate</th>
                  <th className="text-center py-2">Offer Rate</th>
                  <th className="text-center py-2">Trend</th>
                  <th className="text-center py-2">Effectiveness</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedKeywords.slice(0, 15).map((keyword) => (
                  <tr key={keyword.keyword} className="border-b hover:bg-muted/50">
                    <td className="py-3">
                      <div className="font-medium">{keyword.keyword}</div>
                      <div className="text-xs text-muted-foreground">
                        {keyword.industryRelevance}% industry relevance
                      </div>
                    </td>
                    <td className="text-center py-3">
                      {keyword.frequency}x
                    </td>
                    <td className="text-center py-3">
                      {keyword.totalApplications}
                    </td>
                    <td className="text-center py-3">
                      <span className={`font-medium ${
                        keyword.responseRate >= 20 ? 'text-green-600' :
                        keyword.responseRate >= 10 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {keyword.responseRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center py-3">
                      <span className={`font-medium ${
                        keyword.interviewRate >= 10 ? 'text-green-600' :
                        keyword.interviewRate >= 5 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {keyword.interviewRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center py-3">
                      <span className={`font-medium ${
                        keyword.offerRate >= 5 ? 'text-green-600' :
                        keyword.offerRate >= 2 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {keyword.offerRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center py-3">
                      {getTrendIcon(keyword.trendDirection)}
                    </td>
                    <td className="text-center py-3">
                      <Badge variant="outline" className={getEffectivenessColor(keyword.effectiveness)}>
                        {keyword.effectiveness.charAt(0).toUpperCase() + keyword.effectiveness.slice(1)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Performing Keywords */}
        {topKeywords.length > 0 && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-900 flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Top Performing Keywords</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topKeywords.map((keyword) => (
                  <div key={keyword.keyword} className="flex justify-between items-center">
                    <span className="font-medium text-green-800">{keyword.keyword}</span>
                    <Badge variant="secondary">
                      {keyword.responseRate.toFixed(1)}% response
                    </Badge>
                  </div>
                ))}
              </div>
              <p className="text-sm text-green-700 mt-3">
                These keywords consistently drive strong employer responses. Consider emphasizing them more.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Underperforming Keywords */}
        {underperformingKeywords.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>Keywords to Optimize</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {underperformingKeywords.map((keyword) => (
                  <div key={keyword.keyword} className="flex justify-between items-center">
                    <span className="font-medium text-red-800">{keyword.keyword}</span>
                    <Badge variant="outline">
                      {keyword.responseRate.toFixed(1)}% response
                    </Badge>
                  </div>
                ))}
              </div>
              <p className="text-sm text-red-700 mt-3">
                Consider replacing these with more industry-relevant keywords or providing better context.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}