'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter
} from 'recharts';
import { Users, TrendingUp, DollarSign, Clock, Star, AlertCircle } from 'lucide-react';

export interface ClientSegment {
  id: string;
  name: string;
  description: string;
  clients: number;
  totalRevenue: number;
  averageValue: number;
  retentionRate: number;
  satisfactionScore: number;
  color: string;
  characteristics: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ClientBehavior {
  clientId: string;
  clientName: string;
  segment: string;
  lastActivity: string;
  engagementScore: number;
  projectsCompleted: number;
  totalSpent: number;
  avgProjectValue: number;
  communicationFreq: 'high' | 'medium' | 'low';
  paymentHistory: 'excellent' | 'good' | 'needs_attention';
  riskFactors: string[];
  opportunities: string[];
}

interface ClientSegmentationProps {
  segments: ClientSegment[];
  clientBehaviors: ClientBehavior[];
}

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2'];

export function ClientSegmentationDashboard({ segments, clientBehaviors }: ClientSegmentationProps) {
  // Calculate segment distribution data
  const segmentData = segments.map(segment => ({
    name: segment.name,
    clients: segment.clients,
    revenue: segment.totalRevenue,
    value: segment.clients
  }));

  // Calculate behavior scoring data
  const behaviorScoreData = clientBehaviors.map(client => ({
    name: client.clientName,
    engagement: client.engagementScore,
    value: client.totalSpent,
    projects: client.projectsCompleted
  }));

  // Risk assessment data
  const riskData = segments.map(segment => ({
    segment: segment.name,
    low: segment.riskLevel === 'low' ? segment.clients : 0,
    medium: segment.riskLevel === 'medium' ? segment.clients : 0,
    high: segment.riskLevel === 'high' ? segment.clients : 0
  }));

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-800 dark:text-yellow-200';
      case 'high': return 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-200';
      default: return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
    }
  };

  const getEngagementColor = (freq: string) => {
    switch (freq) {
      case 'high': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Segment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {segments.map((segment) => (
          <Card key={segment.id} className="border-l-4" style={{ borderLeftColor: segment.color }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">{segment.name}</h3>
                <Badge className={getRiskColor(segment.riskLevel)}>
                  {segment.riskLevel}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-2xl font-bold">{segment.clients}</span>
                  <span className="text-sm text-gray-500">clients</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-lg font-semibold">${segment.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Retention Rate</span>
                    <span>{segment.retentionRate}%</span>
                  </div>
                  <Progress value={segment.retentionRate} className="h-1" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Satisfaction</span>
                    <span>{segment.satisfactionScore}/5</span>
                  </div>
                  <Progress value={(segment.satisfactionScore / 5) * 100} className="h-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Segmentation Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              Client Distribution by Segment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={segmentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="clients"
                  label={(entry: any) => `${entry.name} (${entry.clients})`}
                >
                  {segmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Revenue by Segment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={segmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Client Behavior Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-6 w-6" />
            Client Engagement vs. Value Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                type="number" 
                dataKey="engagement" 
                name="Engagement Score"
                domain={[0, 100]}
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                type="number" 
                dataKey="value" 
                name="Total Value"
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value: any, name: string) => [
                  name === 'value' ? `$${value.toLocaleString()}` : value,
                  name === 'value' ? 'Total Value' : 'Engagement Score'
                ]}
                labelFormatter={(label) => `Client: ${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Scatter 
                name="Clients" 
                data={behaviorScoreData} 
                fill="#2563eb"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Client Behaviors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6" />
            Client Behavior Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clientBehaviors.slice(0, 10).map((client) => (
              <div key={client.clientId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{client.clientName}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Segment: {client.segment} • Last Activity: {client.lastActivity}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={`${getEngagementColor(client.communicationFreq)} bg-opacity-10`}>
                      {client.communicationFreq} engagement
                    </Badge>
                    <Badge variant={client.paymentHistory === 'excellent' ? 'default' : 
                                 client.paymentHistory === 'good' ? 'secondary' : 'destructive'}>
                      {client.paymentHistory}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Engagement Score:</span>
                    <div className="font-semibold">{client.engagementScore}/100</div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Projects:</span>
                    <div className="font-semibold">{client.projectsCompleted}</div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Total Spent:</span>
                    <div className="font-semibold">${client.totalSpent.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Avg Project:</span>
                    <div className="font-semibold">${client.avgProjectValue.toLocaleString()}</div>
                  </div>
                </div>

                {client.riskFactors.length > 0 && (
                  <div className="mt-3">
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">Risk Factors:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {client.riskFactors.map((risk, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {risk}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {client.opportunities.length > 0 && (
                  <div className="mt-2">
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">Opportunities:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {client.opportunities.map((opp, index) => (
                        <Badge key={index} className="bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-200 text-xs">
                          {opp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
