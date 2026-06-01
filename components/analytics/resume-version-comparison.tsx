"use client";

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Trophy, Target, TrendingUp, AlertCircle, CheckCircle2, Lightbulb } from 'lucide-react';
import { type ResumeComparison } from '@/lib/resumes/performance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface ResumeVersionComparisonProps {
  resumeIds?: string[];
  revisionIds?: string[];
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

export function ResumeVersionComparison({
  resumeIds = [],
  revisionIds = [],
  dateRange
}: ResumeVersionComparisonProps) {
  const [comparison, setComparison] = useState<ResumeComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedResumes, setSelectedResumes] = useState<string[]>([]);
  const [selectedRevisions, setSelectedRevisions] = useState<string[]>([]);

  useEffect(() => {
    if (resumeIds.length > 0) setSelectedResumes(resumeIds);
    if (revisionIds.length > 0) setSelectedRevisions(revisionIds);
  }, [resumeIds, revisionIds]);

  useEffect(() => {
    if (selectedResumes.length > 0 || selectedRevisions.length > 0) {
      loadComparison();
    }
  }, [selectedResumes, selectedRevisions, dateRange]);

  const loadComparison = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedResumes.length > 0) {
        params.append('resumeIds', selectedResumes.join(','));
      }
      if (selectedRevisions.length > 0) {
        params.append('revisionIds', selectedRevisions.join(','));
      }
      if (dateRange) {
        params.append('startDate', dateRange.startDate.toISOString());
        params.append('endDate', dateRange.endDate.toISOString());
      }

      const response = await fetch(`/api/resumes/performance-comparison?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch comparison data');
      }
      
      const data = await response.json();
      setComparison(data);
    } catch (error) {
      console.error('Failed to load comparison:', error);
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

  if (!comparison || comparison.resumes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select Resumes to Compare</h3>
            <p className="text-muted-foreground mb-4">
              Choose at least 2 resume versions to see performance comparison
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = comparison.resumes.map(resume => ({
    name: resume.name.length > 15 ? `${resume.name.substring(0, 15)}...` : resume.name,
    fullName: resume.name,
    'Response Rate': parseFloat(resume.metrics.responseRate.toFixed(1)),
    'Interview Rate': parseFloat(resume.metrics.interviewRate.toFixed(1)),
    'Offer Rate': parseFloat(resume.metrics.offerRate.toFixed(1)),
    'ATS Score': resume.metrics.atsScore || 0,
    applications: resume.metrics.totalApplications,
    isWinner: resume.id === comparison.winner.id
  }));

  const radarData = comparison.resumes.map(resume => ({
    subject: 'Response',
    [resume.name]: resume.metrics.responseRate,
    fullMark: 100
  }));

  const winner = comparison.resumes.find(r => r.id === comparison.winner.id);

  return (
    <div className="space-y-6">
      {/* Winner Announcement */}
      {winner && (
        <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-900">
                  Top Performing Resume
                </h3>
                <p className="text-yellow-700">
                  <strong>{winner.name}</strong> performs {comparison.winner.value.toFixed(1)}% better overall
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant="secondary">
                    {winner.metrics.responseRate.toFixed(1)}% response rate
                  </Badge>
                  <Badge variant="secondary">
                    {winner.metrics.totalApplications} applications
                  </Badge>
                  {winner.metrics.personalBest && (
                    <Badge variant="default">Personal Best</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Success Rate Comparison</CardTitle>
          <CardDescription>
            Compare response, interview, and offer rates across resume versions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value: number) => `${value}%`}
                labelFormatter={(label) => {
                  const resume = chartData.find(r => r.name === label);
                  return `${resume?.fullName} (${resume?.applications} applications)`;
                }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{data.fullName}</p>
                        <div className="space-y-1 mt-2">
                          {payload.map((entry, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className="text-sm" style={{ color: entry.color }}>
                                {entry.dataKey}:
                              </span>
                              <span className="font-medium">
                                {entry.dataKey === 'ATS Score' ? entry.value : `${entry.value}%`}
                              </span>
                            </div>
                          ))}
                          <div className="border-t pt-1 mt-2">
                            <span className="text-xs text-muted-foreground">
                              {data.applications} applications tracked
                            </span>
                          </div>
                        </div>
                        {data.isWinner && (
                          <Badge variant="default" className="mt-2">
                            <Trophy className="h-3 w-3 mr-1" />
                            Winner
                          </Badge>
                        )}
                      </div>
                    );
                  }
                  return null;
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

      {/* Detailed Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Performance Metrics</CardTitle>
          <CardDescription>
            Complete breakdown of each resume's performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Resume</th>
                  <th className="text-center py-2">Applications</th>
                  <th className="text-center py-2">Response Rate</th>
                  <th className="text-center py-2">Interview Rate</th>
                  <th className="text-center py-2">Offer Rate</th>
                  <th className="text-center py-2">ATS Score</th>
                  <th className="text-center py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {comparison.resumes.map((resume) => (
                  <tr key={resume.id} className="border-b">
                    <td className="py-3">
                      <div className="font-medium">{resume.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {resume.type === 'revision' ? 'Revision' : 'Original'}
                      </div>
                    </td>
                    <td className="text-center py-3">
                      {resume.metrics.totalApplications}
                    </td>
                    <td className="text-center py-3">
                      <span className={`font-medium ${
                        resume.metrics.responseRate >= 15 ? 'text-green-600' :
                        resume.metrics.responseRate >= 5 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {resume.metrics.responseRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center py-3">
                      <span className={`font-medium ${
                        resume.metrics.interviewRate >= 10 ? 'text-green-600' :
                        resume.metrics.interviewRate >= 3 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {resume.metrics.interviewRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center py-3">
                      <span className={`font-medium ${
                        resume.metrics.offerRate >= 5 ? 'text-green-600' :
                        resume.metrics.offerRate >= 1 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {resume.metrics.offerRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center py-3">
                      {resume.metrics.atsScore ? (
                        <span className={`font-medium ${
                          resume.metrics.atsScore >= 80 ? 'text-green-600' :
                          resume.metrics.atsScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {resume.metrics.atsScore}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="text-center py-3">
                      <div className="flex justify-center space-x-1">
                        {resume.id === comparison.winner.id && (
                          <Badge variant="default">
                            <Trophy className="h-3 w-3 mr-1" />
                            Winner
                          </Badge>
                        )}
                        {resume.metrics.personalBest && (
                          <Badge variant="secondary">Best</Badge>
                        )}
                        {resume.metrics.totalApplications < 10 && (
                          <Badge variant="outline">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Small Sample
                          </Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5" />
            <span>Insights & Recommendations</span>
          </CardTitle>
          <CardDescription>
            AI-generated insights based on your resume performance comparison
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {comparison.insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{insight}</span>
              </div>
            ))}
            
            {/* Additional recommendations based on data */}
            {winner && winner.metrics.totalApplications >= 20 && (
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-blue-700">
                  Consider using <strong>{winner.name}</strong> as your primary resume template for future applications.
                </span>
              </div>
            )}
            
            {comparison.resumes.some(r => r.metrics.totalApplications < 10) && (
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-yellow-700">
                  Some resumes have limited data. Consider applying to more positions for more reliable comparisons.
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}