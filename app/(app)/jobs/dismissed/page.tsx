import { JobListing, JobListingStatus } from '@prisma/client';
import type { Metadata } from 'next';

import { JobListingsReport } from '@/components/job-listings/job-listings-report';
import {
  Page,
  PageContent,
  PageDescription,
  PageHeader,
  PageSummary,
  PageTitle,
} from '@/components/layout/page';
import { Card, CardContent } from '@/components/ui/card';
import { undismissJobListings } from '@/lib/job-listings/dismiss';
import { getReportData } from '@/lib/reporting';
import { getCurrentUser } from '@/lib/user';

export const metadata: Metadata = {
  description: 'View dismissed job listings',
  title: 'Dismissed Jobs | gimmejob',
};

export default async function DismissedJobListingsPage() {
  const user = await getCurrentUser();
  const jobListings = await getReportData<JobListing>({
    apiQuery: {
      filters: [
        {
          field: 'status',
          operator: 'eq',
          value: JobListingStatus.DISMISSED,
        },
      ],
    },
    cacheKey: `dismissed`,
    model: 'job-listings',
    userId: user.id,
  });

  return (
    <Page>
      <PageHeader>
        <PageSummary>
          <PageTitle>Dismissed Jobs</PageTitle>
          <PageDescription>
            A list of Job listings you have dismissed.
          </PageDescription>
        </PageSummary>
      </PageHeader>
      <PageContent>
        <Card>
          <CardContent className="bg-accent/30 p-2 md:p-2">
            <JobListingsReport
              cacheKey="dismissed"
              filters={[
                {
                  field: 'status',
                  operator: 'eq',
                  value: JobListingStatus.DISMISSED,
                },
              ]}
              initialData={jobListings.data}
              undismiss={async ids => {
                'use server';
                await undismissJobListings(ids);
              }}
            />
          </CardContent>
        </Card>
      </PageContent>
    </Page>
  );
}
