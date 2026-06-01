"use client";

import { useEffect, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar } from 'recharts';
import { TrendingUp, Target, BarChart3, Zap, Award, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CorrelationData {
  atsScoreCorrelation: {
    coefficient: number;
    strength: 'strong' | 'moderate' | 'weak';
    direction: 'positive' | 'negative';
    dataPoints: Array<{
      atsScore: number;
      responseRate: number;
      resumeName: string;
      applications: number;
    }>;
  };
  optimizationImpact: {
    beforeOptimization: {
      responseRate: number;
      interviewRate: number;
      offerRate: number;
      applications: number;
    };
    afterOptimization: {
      responseRate: number;
      interviewRate: number;
      offerRate: number;
      applications: number;
    };
    improvement: {
      responseRate: number;
      interviewRate: number;
      offerRate: number;
    };
  };
  keywordCorrelations: Array<{
    keyword: string;
    correlation: number;
    significance: 'high' | 'medium' | 'low';
    avgResponseRateWith: number;
    avgResponseRateWithout: number;
  }>;
  lengthAnalysis: {
    optimalRange: {
      min: number;
      max: number;
    };
    dataPoints: Array<{
      wordCount: number;
      responseRate: number;
      resumeCount: number;
    }>;
  };
  industryBenchmarks: {
    userAverage: number;
    industryAverage: number;
    topPercentile: number;
    position: 'above' | 'below' | 'at';
  };
}

interface ResumeSuccessCorrelationProps {
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

export function ResumeSuccessCorrelation({ dateRange }: ResumeSuccessCorrelationProps) {
  const [correlationData, setCorrelationData] = useState<CorrelationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCorrelationData();
  }, [dateRange]);

  const loadCorrelationData = async () => {
    try {
      setLoading(true);
      
      // Mock data - in production, this would analyze actual resume performance data
      const mockData: CorrelationData = {
        atsScoreCorrelation: {
          coefficient: 0.73,
          strength: 'strong',
          direction: 'positive',
          dataPoints: [
            { atsScore: 45, responseRate: 8.2, resumeName: 'Original Resume', applications: 23 },
            { atsScore: 62, responseRate: 12.5, resumeName: 'Updated Resume v1', applications: 31 },
            { atsScore: 78, responseRate: 18.9, resumeName: 'Optimized Resume v2', applications: 28 },
            { atsScore: 85, responseRate: 22.1, resumeName: 'Final Resume v3', applications: 34 },
            { atsScore: 72, responseRate: 16.3, resumeName: 'Industry Specific', applications: 19 },
            { atsScore: 91, responseRate: 26.8, resumeName: 'Expert Review', applications: 22 },
          ]
        },
        optimizationImpact: {
          beforeOptimization: {
            responseRate: 9.4,
            interviewRate: 4.2,
            offerRate: 1.1,
            applications: 67
          },
          afterOptimization: {
            responseRate: 19.7,
            interviewRate: 12.3,
            offerRate: 4.8,
            applications: 83
          },
          improvement: {
            responseRate: 109.6,
            interviewRate: 192.9,
            offerRate: 336.4
          }
        },
        keywordCorrelations: [
          { keyword: 'TypeScript', correlation: 0.68, significance: 'high', avgResponseRateWith: 22.1, avgResponseRateWithout: 13.2 },
          { keyword: 'AWS', correlation: 0.61, significance: 'high', avgResponseRateWith: 20.5, avgResponseRateWithout: 12.8 },
          { keyword: 'Leadership', correlation: 0.58, significance: 'high', avgResponseRateWith: 19.8, avgResponseRateWithout: 12.5 },
          { keyword: 'React', correlation: 0.54, significance: 'medium', avgResponseRateWith: 18.3, avgResponseRateWithout: 11.9 },
          { keyword: 'Agile', correlation: 0.42, significance: 'medium', avgResponseRateWith: 16.7, avgResponseRateWithout: 11.8 },
          { keyword: 'MongoDB', correlation: 0.21, significance: 'low', avgResponseRateWith: 13.9, avgResponseRateWithout: 11.5 },
        ],
        lengthAnalysis: {
          optimalRange: { min: 450, max: 650 },
          dataPoints: [
            { wordCount: 350, responseRate: 11.2, resumeCount: 8 },
            { wordCount: 450, responseRate: 16.8, resumeCount: 12 },
            { wordCount: 550, responseRate: 21.3, resumeCount: 15 },
            { wordCount: 650, responseRate: 19.7, resumeCount: 11 },
            { wordCount: 750, responseRate: 14.9, resumeCount: 7 },
            { wordCount: 850, responseRate: 10.1, resumeCount: 4 },
          ]
        },
        industryBenchmarks: {
          userAverage: 18.4,
          industryAverage: 12.3,
          topPercentile: 25.7,
          position: 'above'
        }
      };

      setCorrelationData(mockData);
    } catch (error) {
      console.error('Failed to load correlation data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!correlationData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Correlation Data Available</h3>
            <p className="text-muted-foreground">
              Submit more applications to see success correlation analysis
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getCorrelationStrength = (coefficient: number) => {
    const abs = Math.abs(coefficient);
    if (abs >= 0.7) return { label: 'Strong', color: 'text-green-600' };
    if (abs >= 0.5) return { label: 'Moderate', color: 'text-yellow-600' };
    return { label: 'Weak', color: 'text-red-600' };
  };

  const correlationStrength = getCorrelationStrength(correlationData.atsScoreCorrelation.coefficient);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ATS Score Impact</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={correlationStrength.color}>
                {correlationData.atsScoreCorrelation.coefficient.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {correlationStrength.label} correlation with success
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimization Impact</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{correlationData.optimizationImpact.improvement.responseRate.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Response rate improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimal Length</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {correlationData.lengthAnalysis.optimalRange.min}-{correlationData.lengthAnalysis.optimalRange.max}
            </div>
            <p className="text-xs text-muted-foreground">
              Word count range
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Industry Benchmark</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {correlationData.industryBenchmarks.position === 'above' ? '+' : ''}
              {(correlationData.industryBenchmarks.userAverage - correlationData.industryBenchmarks.industryAverage).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Above industry average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="ats-correlation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ats-correlation">ATS Correlation</TabsTrigger>
          <TabsTrigger value="optimization-impact">Optimization Impact</TabsTrigger>
          <TabsTrigger value="keyword-analysis">Keyword Impact</TabsTrigger>
          <TabsTrigger value="length-analysis">Length Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="ats-correlation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ATS Score vs Response Rate Correlation</CardTitle>
              <CardDescription>
                How your ATS compatibility score correlates with employer response rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart data={correlationData.atsScoreCorrelation.dataPoints}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="atsScore" 
                    name="ATS Score"
                    domain={[0, 100]}
                    label={{ value: 'ATS Score', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="responseRate" 
                    name="Response Rate"
                    label={{ value: 'Response Rate (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-popover border rounded-lg p-3 shadow-lg">
                            <p className="font-medium">{data.resumeName}</p>
                            <div className="space-y-1 mt-2">
                              <div className="flex justify-between">
                                <span className="text-sm">ATS Score:</span>
                                <span className="font-medium">{data.atsScore}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Response Rate:</span>
                                <span className="font-medium">{data.responseRate}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Applications:</span>
                                <span className="font-medium">{data.applications}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter dataKey="responseRate" fill="#3b82f6" />
                </ScatterChart>
              </ResponsiveContainer>
              
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Correlation Analysis</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className={correlationStrength.color}>
                    {correlationStrength.label} {correlationData.atsScoreCorrelation.direction} correlation
                  </span> (r = {correlationData.atsScoreCorrelation.coefficient.toFixed(2)}) between ATS score and response rates.
                  Higher ATS scores consistently lead to better employer responses.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization-impact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resume Optimization Impact</CardTitle>
              <CardDescription>
                Performance before and after resume optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Before Optimization</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Response Rate:</span>
                      <span className="font-medium">{correlationData.optimizationImpact.beforeOptimization.responseRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Interview Rate:</span>
                      <span className="font-medium">{correlationData.optimizationImpact.beforeOptimization.interviewRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Offer Rate:</span>
                      <span className="font-medium">{correlationData.optimizationImpact.beforeOptimization.offerRate}%</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Based on {correlationData.optimizationImpact.beforeOptimization.applications} applications
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">After Optimization</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Response Rate:</span>
                      <span className="font-medium text-green-600">
                        {correlationData.optimizationImpact.afterOptimization.responseRate}%
                        <span className="text-xs ml-1">
                          (+{correlationData.optimizationImpact.improvement.responseRate.toFixed(0)}%)
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Interview Rate:</span>
                      <span className="font-medium text-green-600">
                        {correlationData.optimizationImpact.afterOptimization.interviewRate}%
                        <span className="text-xs ml-1">
                          (+{correlationData.optimizationImpact.improvement.interviewRate.toFixed(0)}%)
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Offer Rate:</span>
                      <span className="font-medium text-green-600">
                        {correlationData.optimizationImpact.afterOptimization.offerRate}%
                        <span className="text-xs ml-1">
                          (+{correlationData.optimizationImpact.improvement.offerRate.toFixed(0)}%)
                        </span>
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Based on {correlationData.optimizationImpact.afterOptimization.applications} applications
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900">Optimization Results</span>
                </div>
                <p className="text-sm text-green-700">
                  Resume optimization led to significant improvements across all metrics, with the biggest impact on offer rates 
                  ({correlationData.optimizationImpact.improvement.offerRate.toFixed(0)}% increase). This demonstrates the 
                  importance of tailoring your resume for ATS compatibility and content optimization.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keyword-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>High-Impact Keywords</CardTitle>
              <CardDescription>
                Keywords with the strongest correlation to application success
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {correlationData.keywordCorrelations.map((keyword) => (
                  <div key={keyword.keyword} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{keyword.keyword}</h4>
                      <Badge variant={
                        keyword.significance === 'high' ? 'default' :
                        keyword.significance === 'medium' ? 'secondary' : 'outline'
                      }>
                        {keyword.significance} impact
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Correlation:</span>
                        <span className={`ml-2 font-medium ${
                          keyword.correlation >= 0.6 ? 'text-green-600' :
                          keyword.correlation >= 0.4 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {keyword.correlation.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">With keyword:</span>
                        <span className="ml-2 font-medium text-green-600">
                          {keyword.avgResponseRateWith.toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Without keyword:</span>
                        <span className="ml-2 font-medium">
                          {keyword.avgResponseRateWithout.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="length-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resume Length vs Success Rate</CardTitle>
              <CardDescription>
                How resume length correlates with response rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={correlationData.lengthAnalysis.dataPoints}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="wordCount" 
                    label={{ value: 'Word Count', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    label={{ value: 'Response Rate (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'responseRate' ? `${value}%` : value,
                      name === 'responseRate' ? 'Response Rate' : 'Resume Count'
                    ]}
                    labelFormatter={(label) => `${label} words`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="responseRate" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Optimal Length Analysis</span>
                </div>
                <p className="text-sm text-blue-700">
                  The optimal resume length appears to be between {correlationData.lengthAnalysis.optimalRange.min} and {correlationData.lengthAnalysis.optimalRange.max} words. 
                  Resumes in this range show the highest response rates, balancing comprehensiveness with readability.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}