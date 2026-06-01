'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Clock, 
  DollarSign,
  Award,
  MessageSquare,
  UserCheck,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Filter,
  Download
} from 'lucide-react';

export interface RecruitingMetrics {
  overview: {
    totalCandidates: number;
    activeCandidates: number;
    placedCandidates: number;
    averageTimeToHire: number;
    fillRate: number;
    candidateResponseRate: number;
    clientSatisfactionScore: number;
  };
  pipeline: {
    sourced: number;
    screened: number;
    interviewed: number;
    offered: number;
    hired: number;
    conversionRates: {
      sourcedToScreened: number;
      screenedToInterviewed: number;
      interviewedToOffered: number;
      offeredToHired: number;
    };
  };
  performance: {
    connectionAcceptanceRate: number;
    messageResponseRate: number;
    interviewScheduleRate: number;
    offerAcceptanceRate: number;
  };
  timeMetrics: {
    averageSourceToScreen: number;
    averageScreenToInterview: number;
    averageInterviewToOffer: number;
    averageOfferToHire: number;
  };
  trends: Array<{
    date: string;
    candidatesSourced: number;
    candidatesPlaced: number;
    revenue: number;
  }>;
  topPerformers: Array<{
    metric: string;
    value: number;
    change: number;
    period: string;
  }>;
  clientMetrics: Array<{
    clientName: string;
    openPositions: number;
    candidatesPresented: number;
    hires: number;
    fillRate: number;
    avgTimeToFill: number;
  }>;
}

interface RecruitingAnalyticsProps {
  data: RecruitingMetrics;
  onExport: (format: 'pdf' | 'csv' | 'excel') => void;
  loading?: boolean;
}

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2'];

export function RecruitingAnalytics({ data, onExport, loading = false }: RecruitingAnalyticsProps) {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  const pipelineData = [
    { name: 'Sourced', value: data.pipeline.sourced, fill: COLORS[0] },
    { name: 'Screened', value: data.pipeline.screened, fill: COLORS[1] },
    { name: 'Interviewed', value: data.pipeline.interviewed, fill: COLORS[2] },
    { name: 'Offered', value: data.pipeline.offered, fill: COLORS[3] },
    { name: 'Hired', value: data.pipeline.hired, fill: COLORS[4] }
  ];

  const performanceData = [
    { name: 'Connection Acceptance', value: data.performance.connectionAcceptanceRate },
    { name: 'Message Response', value: data.performance.messageResponseRate },
    { name: 'Interview Schedule', value: data.performance.interviewScheduleRate },
    { name: 'Offer Acceptance', value: data.performance.offerAcceptanceRate }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recruiting Analytics</h2>
          <p className="text-gray-600">Track performance and optimize your recruiting pipeline</p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => onExport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Total Candidates</span>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {data.overview.totalCandidates.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">
              {data.overview.activeCandidates} active
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Fill Rate</span>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">
              {data.overview.fillRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">
              {data.overview.placedCandidates} placements
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-600">Avg Time to Hire</span>
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {data.overview.averageTimeToHire}
            </div>
            <div className="text-sm text-gray-500">days</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Response Rate</span>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {data.overview.candidateResponseRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">candidate responses</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              Recruiting Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pipelineData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={80} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="value" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="candidatesSourced" stroke="#2563eb" strokeWidth={2} name="Sourced" />
                <Line type="monotone" dataKey="candidatesPlaced" stroke="#059669" strokeWidth={2} name="Placed" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {performanceData.map((metric, index) => (
              <div key={metric.name} className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-3">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke={COLORS[index]}
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${metric.value * 2.51}, 251`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold" style={{ color: COLORS[index] }}>
                      {metric.value.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-900">{metric.name}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversion Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Conversion Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sourced → Screened</span>
              <div className="flex items-center gap-3">
                <Progress value={data.pipeline.conversionRates.sourcedToScreened} className="w-32" />
                <span className="text-sm font-semibold w-12">
                  {data.pipeline.conversionRates.sourcedToScreened.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Screened → Interviewed</span>
              <div className="flex items-center gap-3">
                <Progress value={data.pipeline.conversionRates.screenedToInterviewed} className="w-32" />
                <span className="text-sm font-semibold w-12">
                  {data.pipeline.conversionRates.screenedToInterviewed.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Interviewed → Offered</span>
              <div className="flex items-center gap-3">
                <Progress value={data.pipeline.conversionRates.interviewedToOffered} className="w-32" />
                <span className="text-sm font-semibold w-12">
                  {data.pipeline.conversionRates.interviewedToOffered.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Offered → Hired</span>
              <div className="flex items-center gap-3">
                <Progress value={data.pipeline.conversionRates.offeredToHired} className="w-32" />
                <span className="text-sm font-semibold w-12">
                  {data.pipeline.conversionRates.offeredToHired.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Client Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Client</th>
                  <th className="text-left py-3 px-4 font-medium">Open Positions</th>
                  <th className="text-left py-3 px-4 font-medium">Candidates Presented</th>
                  <th className="text-left py-3 px-4 font-medium">Hires</th>
                  <th className="text-left py-3 px-4 font-medium">Fill Rate</th>
                  <th className="text-left py-3 px-4 font-medium">Avg Time to Fill</th>
                </tr>
              </thead>
              <tbody>
                {data.clientMetrics.map((client, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 px-4 font-medium">{client.clientName}</td>
                    <td className="py-3 px-4">{client.openPositions}</td>
                    <td className="py-3 px-4">{client.candidatesPresented}</td>
                    <td className="py-3 px-4">{client.hires}</td>
                    <td className="py-3 px-4">
                      <Badge className={client.fillRate >= 75 ? 'bg-green-100 text-green-800' : 
                                      client.fillRate >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                                      'bg-red-100 text-red-800'}>
                        {client.fillRate.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{client.avgTimeToFill} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Time Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Time to Hire Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {data.timeMetrics.averageSourceToScreen}
              </div>
              <div className="text-sm text-blue-700">Source → Screen</div>
              <div className="text-xs text-gray-500">days</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {data.timeMetrics.averageScreenToInterview}
              </div>
              <div className="text-sm text-green-700">Screen → Interview</div>
              <div className="text-xs text-gray-500">days</div>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {data.timeMetrics.averageInterviewToOffer}
              </div>
              <div className="text-sm text-yellow-700">Interview → Offer</div>
              <div className="text-xs text-gray-500">days</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {data.timeMetrics.averageOfferToHire}
              </div>
              <div className="text-sm text-purple-700">Offer → Hire</div>
              <div className="text-xs text-gray-500">days</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
