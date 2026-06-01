import { Suspense } from 'react';
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
  BarChart
} from 'lucide-react';

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
import { AutomationSetupWizard } from '@/components/automation/automation-setup-wizard';
import { AutomationStatusPanel } from '@/components/automation/automation-status-panel';
import { AutomationHistory } from '@/components/automation/automation-history';
import { AutomationSchedulingDashboard } from '@/components/automation/automation-scheduling-dashboard';

export const metadata: Metadata = {
  title: 'Application Automation | gimme job',
  description: 'Automate your job application process with intelligent workflows and safety controls.',
};

export default function AutomationPage() {
  return (
    <Page>
      <PageHeader>
        <PageSummary>
          <PageTitle>Application Automation</PageTitle>
          <PageDescription>
            Set up automated job application workflows with smart filtering, approval controls, and real-time monitoring.
          </PageDescription>
        </PageSummary>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/tools/automation/analytics">
              <BarChart className="mr-2 h-4 w-4" />
              Analytics
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/tools/automation/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </a>
          </Button>
        </div>
      </PageHeader>

      <PageContent>
        <Separator className="mb-6 bg-border/60" orientation="horizontal" />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Automated</p>
                  <p className="text-2xl font-bold">0</p>
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
                  <p className="text-2xl font-bold">0%</p>
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
                  <p className="text-2xl font-bold">0</p>
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
                  <p className="text-2xl font-bold">0</p>
                </div>
                <Filter className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Setup & Controls */}
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

            {/* Scheduled Applications */}
            <Suspense fallback={<div>Loading scheduling dashboard...</div>}>
              <AutomationSchedulingDashboard />
            </Suspense>

            {/* Application History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading history...</div>}>
                  <AutomationHistory />
                </Suspense>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Status & Monitoring */}
          <div className="space-y-6">
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

            {/* Safety Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Safety Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">User Approval Required</span>
                  <Badge variant="secondary">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Rate Limiting</span>
                  <Badge variant="secondary">10/hour, 50/day</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Duplicate Protection</span>
                  <Badge variant="secondary">Enabled</Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Configure Safety Settings
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Start Automation
                </Button>
                <Button variant="secondary" className="w-full" size="sm">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause All
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContent>
    </Page>
  );
}