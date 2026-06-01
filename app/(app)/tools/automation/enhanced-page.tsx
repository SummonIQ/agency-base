"use client";

import { useState, useEffect, Suspense } from 'react';
import type { Metadata } from 'next';
import { 
  Bot, 
  Settings, 
  Play, 
  Pause, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  Filter,
  Eye,
  Shield,
  StopCircle
} from 'lucide-react';
import Link from 'next/link';

import {
  Page,
  PageContent,
  PageDescription,
  PageHeader,
  PageSummary,
  PageTitle,
} from '@/components/layout/page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AutomationSetupWizard } from '@/components/automation/automation-setup-wizard';
import { AutomationStatusPanel } from '@/components/automation/automation-status-panel';
import { AutomationHistory } from '@/components/automation/automation-history';
import { AutomationApprovalQueue } from '@/components/automation/automation-approval-queue';
import { AutomationEmergencyControls } from '@/components/automation/automation-emergency-controls';
import { useToast } from '@/hooks/use-toast';

export default function EnhancedAutomationPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<any>(null);
  const [stats, setStats] = useState({
    totalAutomated: 0,
    successRate: 0,
    pending: 0,
    activeRules: 0,
  });

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/automation/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadStats = async () => {
    try {
      // This would be a real API call in production
      // For now, using placeholder data
      setStats({
        totalAutomated: 0,
        successRate: 0,
        pending: 0,
        activeRules: settings?.enableCompanyBlacklist ? 1 : 0 + settings?.enableKeywordBlacklist ? 1 : 0,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  return (
    <Page>
      <PageHeader>
        <PageSummary>
          <PageTitle>Application Automation</PageTitle>
          <PageDescription>
            Set up automated job application workflows with smart filtering, approval controls, and real-time monitoring.
          </PageDescription>
        </PageSummary>
      </PageHeader>

      <PageContent>
        <Separator className="mb-6 bg-border/60" orientation="horizontal" />

        {/* Emergency Controls at Top */}
        <div className="mb-6">
          <AutomationEmergencyControls 
            settings={settings} 
            onSettingsUpdate={loadSettings}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Automated</p>
                  <p className="text-2xl font-bold">{stats.totalAutomated}</p>
                </div>
                <Bot className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{stats.successRate}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Rules</p>
                  <p className="text-2xl font-bold">{stats.activeRules}</p>
                </div>
                <Filter className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Setup & Status */}
              <div className="lg:col-span-2 space-y-6">
                {/* Automation Setup */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Automation Setup
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Suspense fallback={<div>Loading setup wizard...</div>}>
                      <AutomationSetupWizard />
                    </Suspense>
                  </CardContent>
                </Card>

                {/* Current Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      Automation Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Suspense fallback={<div>Loading status...</div>}>
                      <AutomationStatusPanel />
                    </Suspense>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Safety Controls */}
              <div className="space-y-6">
                {/* Safety Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Safety Controls
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">User Approval</span>
                      <Badge variant={settings?.requireUserApproval ? "success" : "secondary"}>
                        {settings?.requireUserApproval ? "Required" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Rate Limiting</span>
                      <Badge variant="secondary">
                        {settings?.applicationsPerHour}/hr, {settings?.applicationsPerDay}/day
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Duplicate Protection</span>
                      <Badge variant={settings?.preventDuplicateApplications ? "success" : "secondary"}>
                        {settings?.preventDuplicateApplications ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Company Blacklist</span>
                      <Badge variant={settings?.enableCompanyBlacklist ? "success" : "secondary"}>
                        {settings?.enableCompanyBlacklist 
                          ? `${settings?.companyBlacklist?.length || 0} companies` 
                          : "Disabled"}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href="/tools/automation/settings">
                        Configure Safety Settings
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Audit Log Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Recent Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      View recent automation events and actions
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      View Audit Log
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="approvals" className="space-y-6">
            <AutomationApprovalQueue />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <AutomationHistory />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Settings Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/tools/automation/settings">
                    <Shield className="h-4 w-4 mr-2" />
                    Safety Controls & Filters
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/tools/automation/settings">
                    <Clock className="h-4 w-4 mr-2" />
                    Rate Limits & Scheduling
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/tools/automation/settings">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Notifications & Alerts
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageContent>
    </Page>
  );
}