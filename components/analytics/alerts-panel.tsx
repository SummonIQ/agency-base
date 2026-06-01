'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertTriangle as AlertIcon, 
  Bell, 
  BellRing, 
  CheckCircle, 
  X, 
  Calendar,
  Filter,
  Mail,
  FileText,
  Settings,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';
import type { Alert, ReportSchedule } from '@/lib/analytics/alerts-service';
import { AlertsService } from '@/lib/analytics/alerts-service';
import { Switch } from '@/components/ui/switch';

interface AlertsPanelProps {
  alerts: Alert[];
  onAlertAction?: (alertId: string, action: string) => void;
}

export function AlertsPanel({ alerts, onAlertAction }: AlertsPanelProps) {
  const [allAlerts, setAllAlerts] = useState<Alert[]>(alerts.filter((alert) => !alert.dismissed));
  const [reportSchedules, setReportSchedules] = useState<ReportSchedule[]>(AlertsService.getReportSchedules());
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);

  useEffect(() => {
    setAllAlerts(alerts.filter((alert) => !alert.dismissed));
    setReportSchedules(AlertsService.getReportSchedules());
  }, [alerts]);

  useEffect(() => {
    if (!autoRefresh) {
      return;
    }

    const interval = setInterval(() => {
      const latestAlerts = AlertsService.getAlerts();
      setAllAlerts(latestAlerts.filter((alert) => !alert.dismissed));
      setReportSchedules(AlertsService.getReportSchedules());
    }, 15000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const uniqueTypes = useMemo(
    () => Array.from(new Set(allAlerts.map((alert) => alert.type))).sort(),
    [allAlerts],
  );

  const uniqueCategories = useMemo(
    () => Array.from(new Set(allAlerts.map((alert) => alert.category))).sort(),
    [allAlerts],
  );

  const filteredAlerts = useMemo(() => {
    return allAlerts.filter((alert) => {
      if (selectedType !== 'all' && alert.type !== selectedType) {
        return false;
      }
      if (selectedCategory !== 'all' && alert.category !== selectedCategory) {
        return false;
      }
      if (showUnreadOnly && alert.read) {
        return false;
      }
      return true;
    });
  }, [allAlerts, selectedType, selectedCategory, showUnreadOnly]);

  const unreadCount = useMemo(() => allAlerts.filter((alert) => !alert.read).length, [allAlerts]);
  const criticalCount = useMemo(
    () => allAlerts.filter((alert) => alert.type === 'critical').length,
    [allAlerts],
  );
  const insightCount = useMemo(
    () => allAlerts.filter((alert) => alert.id.startsWith('insight_')).length,
    [allAlerts],
  );

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertIcon className="h-5 w-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info': return <Info className="h-5 w-5 text-blue-600" />;
      case 'success': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      default: return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-l-red-500 bg-red-50 dark:bg-red-950/10';
      case 'warning': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/10';
      case 'info': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/10';
      case 'success': return 'border-l-green-500 bg-green-50 dark:bg-green-950/10';
      default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-950/10';
    }
  };

  const handleDismissAlert = useCallback((alertId: string) => {
    AlertsService.dismissAlert(alertId);
    setAllAlerts((previous) => previous.filter((alert) => alert.id !== alertId));
  }, []);

  const handleMarkAsRead = useCallback((alertId: string) => {
    AlertsService.markAsRead(alertId);
    setAllAlerts((previous) =>
      previous.map((alert) => (alert.id === alertId ? { ...alert, read: true } : alert)),
    );
  }, []);

  const handleAlertAction = useCallback((alert: Alert, actionType: string) => {
    if (onAlertAction) {
      onAlertAction(alert.id, actionType);
    }
    handleMarkAsRead(alert.id);
  }, [handleMarkAsRead, onAlertAction]);

  const quickTemplates = useMemo(
    () => [
      {
        id: 'exec-daily',
        name: 'Daily Executive Summary',
        type: 'executive' as const,
        frequency: 'daily' as const,
        recipients: ['steven@agencybase.com'],
        format: 'email' as const,
        description: 'Daily email with key metrics and insights',
      },
      {
        id: 'weekly-performance',
        name: 'Weekly Performance Report',
        type: 'performance' as const,
        frequency: 'weekly' as const,
        recipients: ['sales@agencybase.com', 'leadership@agencybase.com'],
        format: 'dashboard_link' as const,
        description: 'Comprehensive weekly analysis with trends',
      },
    ],
    [],
  );

  const handleQuickSchedule = useCallback(
    (templateId: string) => {
      const template = quickTemplates.find((item) => item.id === templateId);
      if (!template) {
        return;
      }

      const alreadyExists = reportSchedules.some(
        (schedule) => schedule.name === template.name && schedule.frequency === template.frequency,
      );

      if (alreadyExists) {
        return;
      }

      const created = AlertsService.createReportSchedule({
        name: template.name,
        type: template.type,
        frequency: template.frequency,
        recipients: template.recipients,
        format: template.format,
        enabled: true,
      });

      setReportSchedules((previous) => [...previous, created]);
    },
    [quickTemplates, reportSchedules],
  );

  return (
    <div className="space-y-6">
      {/* Alerts Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BellRing className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{unreadCount}</div>
                <div className="text-sm text-gray-500">Unread Alerts</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
                <div className="text-sm text-gray-500">Critical Alerts</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{reportSchedules.length}</div>
                <div className="text-sm text-gray-500">Scheduled Reports</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-600">{insightCount}</div>
                <div className="text-sm text-gray-500">AI Insights</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Active Alerts
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filter alerts</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All severities</SelectItem>
                    {uniqueTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {uniqueCategories.map((category) => (
                      <SelectItem key={category} value={category} className="capitalize">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Switch id="filter-unread" checked={showUnreadOnly} onCheckedChange={setShowUnreadOnly} />
                <Label htmlFor="filter-unread" className="text-sm font-medium">
                  Unread only
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                <Label htmlFor="auto-refresh" className="text-sm font-medium">
                  Auto-refresh
                </Label>
              </div>
            </div>
          </div>
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                All caught up!
              </div>
              <div className="text-gray-500">
                No active alerts at this time.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`border-l-4 rounded-lg p-4 ${getAlertTypeColor(alert.type)} ${
                    !alert.read ? 'ring-2 ring-blue-500/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{alert.title}</h3>
                          {!alert.read && (
                            <Badge variant="outline" className="text-xs">
                              New
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs capitalize">
                            {alert.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {alert.message}
                        </p>
                        <div className="text-xs text-gray-500">
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                        
                        {alert.actions && alert.actions.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {alert.actions.map((action, index) => (
                              <Button
                                key={index}
                                size="sm"
                                variant={action.type === 'primary' ? 'default' : 'outline'}
                                onClick={() => handleAlertAction(alert, action.action)}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-1 ml-4">
                      {!alert.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkAsRead(alert.id)}
                          className="h-8 w-8 p-0"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDismissAlert(alert.id)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Schedules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Automated Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reportSchedules.length === 0 ? (
            <div className="text-center py-6">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <div className="text-gray-500">
                No automated reports scheduled
              </div>
              <Button className="mt-4" onClick={() => handleQuickSchedule('exec-daily')}>
                Create Report Schedule
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {reportSchedules.map((schedule) => (
                <div key={schedule.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold">{schedule.name}</h3>
                      <Badge variant={schedule.enabled ? 'default' : 'secondary'}>
                        {schedule.enabled ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {schedule.frequency}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {schedule.format}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Recipients:</span>
                      <div className="font-medium">
                        {schedule.recipients.length} recipient(s)
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Next Scheduled:</span>
                      <div className="font-medium">
                        {new Date(schedule.nextScheduled).toLocaleDateString()}
                      </div>
                    </div>
                    {schedule.lastSent && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Last Sent:</span>
                        <div className="font-medium">
                          {new Date(schedule.lastSent).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sample Report Schedules */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Quick Setup: Sample Report Schedules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickTemplates.map((template) => {
              const alreadyExists = reportSchedules.some(
                (schedule) => schedule.name === template.name && schedule.frequency === template.frequency,
              );

              return (
                <div key={template.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {template.id === 'exec-daily' ? (
                      <Mail className="h-5 w-5 text-blue-600" />
                    ) : (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    )}
                    <h3 className="font-semibold">{template.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={alreadyExists}
                    onClick={() => handleQuickSchedule(template.id)}
                  >
                    {alreadyExists ? 'Scheduled' : 'Setup Report'}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
