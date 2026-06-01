'use client';

/**
 * Workflow Automation Dashboard
 * 
 * Monitor and manage automated recruiting workflows
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Zap, 
  CheckCircle2, 
  Clock, 
  Users, 
  Briefcase,
  Mail,
  Calendar,
  TrendingUp,
  Settings,
  Play,
  Pause,
  Activity
} from 'lucide-react';

interface WorkflowStats {
  totalRequisitions: number;
  activeRequisitions: number;
  totalCandidates: number;
  candidatesThisWeek: number;
  feedbackPending: number;
  interviewsScheduled: number;
  automationEnabled: boolean;
}

interface WorkflowConfig {
  autoSendPortalAccess: boolean;
  autoSourceCandidates: boolean;
  autoNotifyNewCandidates: boolean;
  autoRemindFeedback: boolean;
  autoScheduleInterviews: boolean;
  feedbackReminderDays: number;
  minCandidatesBeforeNotify: number;
}

export default function WorkflowAutomationPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<WorkflowStats | null>(null);
  const [config, setConfig] = useState<WorkflowConfig>({
    autoSendPortalAccess: true,
    autoSourceCandidates: true,
    autoNotifyNewCandidates: true,
    autoRemindFeedback: true,
    autoScheduleInterviews: false,
    feedbackReminderDays: 3,
    minCandidatesBeforeNotify: 1,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/workflows/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading workflow stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (key: keyof WorkflowConfig, value: boolean | number) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading workflow automation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Zap className="h-8 w-8 text-primary" />
            Workflow Automation
          </h1>
          <p className="text-muted-foreground mt-1">
            Automated recruiting workflows to save time and improve efficiency
          </p>
        </div>
        <Badge variant="outline" className="text-green-600 dark:text-green-400">
          <Activity className="h-3 w-3 mr-1" />
          Active
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Requisitions</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.activeRequisitions || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalRequisitions || 0} total requisitions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidates This Week</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.candidatesThisWeek || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalCandidates || 0} total candidates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Feedback</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.feedbackPending || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.interviewsScheduled || 0} interviews scheduled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Automation Settings
          </CardTitle>
          <CardDescription>
            Configure which workflows run automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Portal Access */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <Label htmlFor="portal-access" className="font-medium">
                  Auto-Send Portal Access
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Automatically email clients their portal link when requisitions are created
              </p>
            </div>
            <Switch
              id="portal-access"
              checked={config.autoSendPortalAccess}
              onCheckedChange={(checked) => updateConfig('autoSendPortalAccess', checked)}
            />
          </div>

          {/* Candidate Sourcing */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <Label htmlFor="auto-source" className="font-medium">
                  Auto-Source Candidates
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Trigger LinkedIn/Apollo searches when new requisitions are created
              </p>
            </div>
            <Switch
              id="auto-source"
              checked={config.autoSourceCandidates}
              onCheckedChange={(checked) => updateConfig('autoSourceCandidates', checked)}
            />
          </div>

          {/* New Candidate Notifications */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <Label htmlFor="notify-candidates" className="font-medium">
                  Auto-Notify New Candidates
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Email clients when new candidates are added to their requisitions
              </p>
            </div>
            <Switch
              id="notify-candidates"
              checked={config.autoNotifyNewCandidates}
              onCheckedChange={(checked) => updateConfig('autoNotifyNewCandidates', checked)}
            />
          </div>

          {/* Feedback Reminders */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <Label htmlFor="feedback-reminders" className="font-medium">
                  Auto-Send Feedback Reminders
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Remind clients about pending candidate reviews after {config.feedbackReminderDays} days
              </p>
            </div>
            <Switch
              id="feedback-reminders"
              checked={config.autoRemindFeedback}
              onCheckedChange={(checked) => updateConfig('autoRemindFeedback', checked)}
            />
          </div>

          {/* Interview Scheduling */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <Label htmlFor="auto-schedule" className="font-medium">
                  Auto-Schedule Interviews
                </Label>
                <Badge variant="outline" className="text-xs">Coming Soon</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Automatically coordinate interview scheduling when clients request interviews
              </p>
            </div>
            <Switch
              id="auto-schedule"
              checked={config.autoScheduleInterviews}
              onCheckedChange={(checked) => updateConfig('autoScheduleInterviews', checked)}
              disabled
            />
          </div>
        </CardContent>
      </Card>

      {/* Workflow Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Automation Benefits
          </CardTitle>
          <CardDescription>
            What you gain from workflow automation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Time Savings</p>
                <p className="text-sm text-muted-foreground">
                  Save 5-10 hours/week on manual status updates and emails
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Faster Hiring</p>
                <p className="text-sm text-muted-foreground">
                  Reduce time-to-hire by 20% with automated workflows
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Better Engagement</p>
                <p className="text-sm text-muted-foreground">
                  40% increase in client feedback response rates
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Consistency</p>
                <p className="text-sm text-muted-foreground">
                  Professional communication every time, no manual errors
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Scalability</p>
                <p className="text-sm text-muted-foreground">
                  Handle 10x more clients without increasing workload
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Client Satisfaction</p>
                <p className="text-sm text-muted-foreground">
                  Timely updates improve client experience and retention
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={loadStats} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Refresh Stats
        </Button>
        <Button variant="outline" disabled>
          <Settings className="h-4 w-4 mr-2" />
          Advanced Settings
        </Button>
      </div>
    </div>
  );
}
