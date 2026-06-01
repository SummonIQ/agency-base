import { JobLead, JobLeadStatus, Prisma } from '@prisma/client';
import type { Metadata } from 'next';

import { JobLeadsReport } from '@/components/job-leads/job-leads-report';
import {
  Page,
  PageContent,
  PageDescription,
  PageHeader,
  PageSummary,
  PageTitle,
} from '@/components/layout/page';
import { Card, CardContent } from '@/components/ui/card';
import { dismissJobLeads } from '@/lib/job-leads';
import { getReportData } from '@/lib/reporting';
import { getCurrentUser } from '@/lib/user';
import { ApiQuery } from '@/types/reporting/query';

export const metadata: Metadata = {
  description: 'View your job leads.',
  title: 'Job Leads | gimmejob',
};

export default async function JobLeadsPage() {
  const user = await getCurrentUser();
  const initialQuery: ApiQuery<JobLead, Prisma.JobLeadInclude> = {
    filters: [
      {
        field: 'status',
        operator: 'in',
        // all statuses except DISMISSED
        value: [JobLeadStatus.APPLIED],
      },
    ],
    include: {
      jobFitAnalysis: true,
      jobListing: true,
      optimization: {
        include: {
          resumeRevision: true,
        },
      },
      // resumeRevisions: true,
    },
    pagination: {
      count: 10,
      start: 0,
    },
    sort: [{ direction: 'desc', field: 'createdAt' }],
  };

  const { data: leads } = await getReportData({
    apiQuery: initialQuery,
    model: 'job-leads',
    userId: user.id,
    cacheKey: 'applied',
  });

  return (
    <Page>
      <PageHeader>
        <PageSummary>
          <PageTitle>Applied Job Leads</PageTitle>
          <PageDescription>Leads that you have applied to.</PageDescription>
        </PageSummary>
      </PageHeader>
      <PageContent>
        <Card>
          <CardContent className="bg-accent/30 p-2 md:p-2">
            <JobLeadsReport
              dismiss={async ids => {
                'use server';
                await dismissJobLeads(ids);
              }}
              initialData={leads}
              initialQuery={initialQuery}
              showPagination={true}
              showSearch={true}
              showSelectedCount={false}
            />
          </CardContent>
        </Card>
      </PageContent>
    </Page>
  );
}
