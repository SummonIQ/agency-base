import { Suspense } from 'react';
import type { Metadata } from 'next';
import { BarChart, Activity } from 'lucide-react';

import {
  Page,
  PageContent,
  PageDescription,
  PageHeader,
  PageSummary,
  PageTitle,
} from '@/components/layout/page';
import { Separator } from '@/components/ui/separator';
import { AutomationAnalyticsDashboard } from '@/components/automation/automation-analytics-dashboard';

export const metadata: Metadata = {
  title: 'Automation Analytics | gimme job',
  description: 'Track your automation performance, success rates, and ROI with comprehensive analytics.',
};

export default function AutomationAnalyticsPage() {
  return (
    <Page>
      <PageHeader>
        <PageSummary>
          <PageTitle>Automation Analytics</PageTitle>
          <PageDescription>
            Monitor your automation performance with real-time metrics, platform insights, and ROI tracking.
          </PageDescription>
        </PageSummary>
      </PageHeader>

      <PageContent>
        <Separator className="mb-6 bg-border/60" orientation="horizontal" />
        
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <Activity className="h-8 w-8 animate-pulse text-muted-foreground" />
          </div>
        }>
          <AutomationAnalyticsDashboard />
        </Suspense>
      </PageContent>
    </Page>
  );
}