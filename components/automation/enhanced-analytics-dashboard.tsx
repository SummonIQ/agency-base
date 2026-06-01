'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Activity,
  Minus,
  Circle,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/css';

interface StreamedMetrics {
  totalAutomated: number;
  totalManual: number;
  successRate: number;
  failureRate: number;
  pendingCount: number;
  averageProcessingTime: number;
  recentActivity: any[];
  alerts: any[];
  platformComparison: any;
  performanceMetrics: any;
  roiMetrics: {
    totalTimeSaved: number;
    dollarValueSaved: number;
    applicationsPerHour: number;
  };
}

export function EnhancedAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<StreamedMetrics | null>(null);
  const [dateRange, setDateRange] = useState<'day' | 'week' | 'month'>('week');
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'json' | 'pdf'>('excel');
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; timestamp: Date }>>([]);

  // Connect to SSE stream for real-time updates
  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connectToStream = () => {
      eventSource = new EventSource(`/api/automation/analytics/stream?range=${dateRange}`);

      eventSource.onopen = () => {
        setConnected(true);
        console.log('Connected to analytics stream');
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'metrics-update') {
            setMetrics(data.metrics);
            setLastUpdate(new Date(data.timestamp));
            setLoading(false);
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };

      eventSource.addEventListener('notification', (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'new-submission') {
            const notification = {
              id: `notif-${Date.now()}`,
              message: `${data.count} new submission(s) processed`,
              timestamp: new Date(data.timestamp),
            };
            setNotifications(prev => [notification, ...prev].slice(0, 5));
            
            // Show browser notification if permitted
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Automation Update', {
                body: notification.message,
                icon: '/icon.png',
              });
            }
          }
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      });

      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        setConnected(false);
        eventSource?.close();
        
        // Reconnect after 5 seconds
        setTimeout(connectToStream, 5000);
      };
    };

    connectToStream();

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      eventSource?.close();
    };
  }, [dateRange]);

  const handleExport = async () => {
    try {
      const response = await fetch(
        `/api/automation/analytics/export/enhanced?format=${exportFormat}&range=${dateRange}`
      );
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `automation-analytics-${dateRange}.${exportFormat === 'excel' ? 'xlsx' : exportFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Report exported successfully');
      }
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export report');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading real-time analytics...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Data Available</AlertTitle>
        <AlertDescription>
          Waiting for analytics data stream...
        </AlertDescription>
      </Alert>
    );
  }

  const automationRate = metrics.totalAutomated + metrics.totalManual > 0
    ? (metrics.totalAutomated / (metrics.totalAutomated + metrics.totalManual)) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header with real-time status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Analytics Dashboard</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={connected ? 'success' : 'destructive'} className="text-xs">
              <Circle className={cn('h-2 w-2 mr-1', connected && 'animate-pulse')} />
              {connected ? 'Live' : 'Disconnected'}
            </Badge>
            {lastUpdate && (
              <span className="text-xs text-muted-foreground">
                Last update: {format(lastUpdate, 'HH:mm:ss')}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Real-time notifications */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Live Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-24">
              <div className="space-y-2">
                {notifications.map(notif => (
                  <div key={notif.id} className="flex items-center justify-between text-sm">
                    <span>{notif.message}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(notif.timestamp, 'HH:mm:ss')}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Critical Alerts */}
      {metrics.alerts.filter(a => a.type === 'critical' || a.type === 'error').length > 0 && (
        <div className="space-y-2">
          {metrics.alerts
            .filter(a => a.type === 'critical' || a.type === 'error')
            .map(alert => (
              <Alert key={alert.id} variant={alert.type === 'critical' ? 'destructive' : 'default'}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription>
                  {alert.message}
                  {alert.suggestedAction && (
                    <div className="mt-2">
                      <strong>Action:</strong> {alert.suggestedAction}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            ))}
        </div>
      )}

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Automation Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{automationRate.toFixed(1)}%</div>
            <Progress value={automationRate} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.totalAutomated} of {metrics.totalAutomated + metrics.totalManual}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {metrics.successRate.toFixed(1)}%
              {metrics.performanceMetrics?.trend === 'improving' ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : metrics.performanceMetrics?.trend === 'declining' ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : (
                <Minus className="h-4 w-4 text-gray-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.performanceMetrics?.trend} trend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.roiMetrics.totalTimeSaved.toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ${metrics.roiMetrics.dollarValueSaved.toFixed(0)} value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Processing Speed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.averageProcessingTime.toFixed(1)}min
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.roiMetrics.applicationsPerHour.toFixed(2)}/hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              pending applications
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Performance Comparison */}
      {metrics.platformComparison && (
        <Card>
          <CardHeader>
            <CardTitle>Platform Performance Ranking</CardTitle>
            <CardDescription>
              Real-time platform effectiveness scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.platformComparison.platformRankings.map((platform, index) => (
                <div key={platform.platform} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={index === 0 ? 'default' : 'secondary'}>
                      #{index + 1}
                    </Badge>
                    <span className="font-medium">{platform.platform}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-right">
                      <div>Score: {platform.score.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">
                        {platform.successRate.toFixed(0)}% success
                      </div>
                    </div>
                    <Progress value={platform.score} className="w-32 h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Scores */}
      {metrics.performanceMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              System health and efficiency scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <CircularProgress value={metrics.performanceMetrics.performanceScore} />
                <p className="mt-2 text-sm font-medium">Performance</p>
              </div>
              <div className="text-center">
                <CircularProgress value={metrics.performanceMetrics.reliabilityScore} />
                <p className="mt-2 text-sm font-medium">Reliability</p>
              </div>
              <div className="text-center">
                <CircularProgress value={metrics.performanceMetrics.efficiencyScore} />
                <p className="mt-2 text-sm font-medium">Efficiency</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Live Activity Feed</CardTitle>
          <CardDescription>
            Real-time application submission status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {metrics.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{activity.jobTitle}</h4>
                    <p className="text-sm text-muted-foreground">
                      {activity.companyName} · {activity.platform}
                    </p>
                    {activity.submittedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(activity.submittedAt), 'MMM d, h:mm a')}
                        {activity.processingTime && ` · ${activity.processingTime}min`}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {activity.status === 'SUBMITTED' && (
                      <Badge variant="success">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Submitted
                      </Badge>
                    )}
                    {activity.status === 'FAILED' && (
                      <Badge variant="destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        Failed
                      </Badge>
                    )}
                    {activity.status === 'PENDING' && (
                      <Badge variant="secondary">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending
                      </Badge>
                    )}
                    {activity.optimalityScore && (
                      <Badge variant="outline">
                        {activity.optimalityScore}% optimal
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// Circular progress component for scores
function CircularProgress({ value }: { value: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  
  const getColor = () => {
    if (value >= 80) return 'text-green-500';
    if (value >= 60) return 'text-blue-500';
    if (value >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="transform -rotate-90 w-24 h-24">
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-gray-200"
        />
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn('transition-all duration-300', getColor())}
        />
      </svg>
      <span className="absolute text-xl font-semibold">{value}</span>
    </div>
  );
}