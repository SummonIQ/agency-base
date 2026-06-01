import { Suspense } from 'react';
import type { Metadata } from 'next';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Award,
  BarChart3,
  PieChart,
  Activity,
  Filter
} from 'lucide-react';

import {
  Page,
  PageContent,
  PageDescription,
  PageHeader,
  PageSummary,
  PageTitle,
} from '@/components/layout/page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ApplicationMetricsOverview } from '@/components/analytics/application-metrics-overview';
import { ConversionFunnel } from '@/components/analytics/conversion-funnel';
import { PlatformComparison } from '@/components/analytics/platform-comparison';
import { ApplicationTimeline } from '@/components/analytics/application-timeline';
import { OutcomeDistribution } from '@/components/analytics/outcome-distribution';

export const metadata: Metadata = {
  title: 'Project Analytics | AgencyBase',
  description: 'Track your project performance with detailed analytics and insights.',
};

export default function ApplicationAnalyticsPage() {
  return (
    <Page>
      <PageHeader>
        <PageSummary>
          <PageTitle>Application Analytics</PageTitle>
          <PageDescription>
            Track your job application outcomes, response rates, and conversion metrics to optimize your job search strategy.
          </PageDescription>
        </PageSummary>
      </PageHeader>

      <PageContent>
        <Separator className="mb-6 bg-border/60" orientation="horizontal" />

        {/* Key Metrics Overview */}
        <Suspense fallback={<div>Loading metrics...</div>}>
          <ApplicationMetricsOverview />
        </Suspense>

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Conversion Funnel */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Application Conversion Funnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading funnel...</div>}>
                <ConversionFunnel />
              </Suspense>
            </CardContent>
          </Card>

          {/* Platform Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance by Platform
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading platform data...</div>}>
                <PlatformComparison />
              </Suspense>
            </CardContent>
          </Card>

          {/* Outcome Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Outcome Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading outcomes...</div>}>
                <OutcomeDistribution />
              </Suspense>
            </CardContent>
          </Card>

          {/* Application Timeline */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Application Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading timeline...</div>}>
                <ApplicationTimeline />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </Page>
  );
}