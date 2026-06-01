'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  ResponsiveContainer 
} from 'recharts';
import { 
  Mail, 
  TrendingUp, 
  Users, 
  Target, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  MousePointer,
  Reply,
  UserMinus
} from 'lucide-react';

export interface EmailAnalyticsData {
  overview: {
    totalSent: number;
    delivered: number;
    opened: number;
    clicked: number;
    replied: number;
    unsubscribed: number;
    bounced: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    replyRate: number;
  };
  campaigns: Array<{
    id: string;
    name: string;
    sent: number;
    openRate: number;
    clickRate: number;
    replyRate: number;
    status: string;
  }>;
  trends: Array<{
    date: string;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  }>;
  templates: Array<{
    id: string;
    name: string;
    sent: number;
    openRate: number;
    clickRate: number;
    replyRate: number;
  }>;
}

interface EmailAnalyticsDashboardProps {
  data: EmailAnalyticsData;
  loading?: boolean;
}

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626'];

export function EmailAnalyticsDashboard({ data, loading = false }: EmailAnalyticsDashboardProps) {
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

  const pieData = [
    { name: 'Delivered', value: data.overview.delivered, color: '#059669' },
    { name: 'Opened', value: data.overview.opened, color: '#2563eb' },
    { name: 'Clicked', value: data.overview.clicked, color: '#7c3aed' },
    { name: 'Replied', value: data.overview.replied, color: '#d97706' },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Total Sent</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {data.overview.totalSent.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">
              {data.overview.deliveryRate.toFixed(1)}% delivered
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <MousePointer className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Open Rate</span>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">
              {data.overview.openRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">
              {data.overview.opened.toLocaleString()} opens
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Click Rate</span>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {data.overview.clickRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">
              {data.overview.clicked.toLocaleString()} clicks
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Reply className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-600">Reply Rate</span>
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {data.overview.replyRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">
              {data.overview.replied.toLocaleString()} replies
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Email Performance Trends
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
                <Line type="monotone" dataKey="sent" stroke="#2563eb" strokeWidth={2} name="Sent" />
                <Line type="monotone" dataKey="opened" stroke="#059669" strokeWidth={2} name="Opened" />
                <Line type="monotone" dataKey="clicked" stroke="#7c3aed" strokeWidth={2} name="Clicked" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              Email Engagement Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            Campaign Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.campaigns.map((campaign) => (
              <div key={campaign.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{campaign.name}</h3>
                    <p className="text-sm text-gray-600">{campaign.sent} emails sent</p>
                  </div>
                  <Badge className={
                    campaign.status === 'completed' ? 'bg-green-100 text-green-800' :
                    campaign.status === 'active' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {campaign.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Open Rate:</span>
                    <div className="font-semibold text-green-600">{campaign.openRate.toFixed(1)}%</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Click Rate:</span>
                    <div className="font-semibold text-purple-600">{campaign.clickRate.toFixed(1)}%</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Reply Rate:</span>
                    <div className="font-semibold text-orange-600">{campaign.replyRate.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Template Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6" />
            Top Performing Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.templates.slice(0, 5).map((template, index) => (
              <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold">{template.name}</h4>
                  <p className="text-sm text-gray-600">{template.sent} emails sent</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{template.openRate.toFixed(1)}%</div>
                    <div className="text-gray-500">Opens</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-purple-600">{template.clickRate.toFixed(1)}%</div>
                    <div className="text-gray-500">Clicks</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-orange-600">{template.replyRate.toFixed(1)}%</div>
                    <div className="text-gray-500">Replies</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
