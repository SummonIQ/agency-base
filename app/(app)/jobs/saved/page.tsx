import { JobListing } from '@prisma/client';
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
import { createJobLeads } from '@/lib/job-leads';
import { dismissJobListings, unsaveJobListings } from '@/lib/job-listings';
import { getReportData } from '@/lib/reporting';
import { getCurrentUser } from '@/lib/user';

export const metadata: Metadata = {
  description: 'View saved job listings',
  title: 'Saved Jobs | gimmejob',
};

export default async function SavedJobListingsPage() {
  const user = await getCurrentUser();
  const jobListings = await getReportData<JobListing>({
    apiQuery: {
      filters: [
        {
          field: 'saved',
          operator: 'eq',
          value: true,
        },
      ],
      pagination: {
        count: 10,
        start: 0,
      },
      sort: [{ direction: 'desc', field: 'updatedAt' }],
    },
    model: 'job-listings',
    userId: user.id,
  });

  return (
    <Page>
      <PageHeader>
        <PageSummary>
          <PageTitle>Saved Jobs</PageTitle>
          <PageDescription>
            View and manage Job listings you have saved.
          </PageDescription>
        </PageSummary>
      </PageHeader>
      <PageContent>
        <Card>
          <Card>
            <CardContent className="bg-accent/30 p-2 md:p-2">
              <JobListingsReport
                addToLeads={async ids => {
                  'use server';
                  await createJobLeads(ids);
                }}
                cacheKey="saved"
                dismiss={async ids => {
                  'use server';
                  await dismissJobListings(ids);
                }}
                filters={[
                  {
                    field: 'saved',
                    operator: 'eq',
                    value: true,
                  },
                ]}
                initialData={jobListings.data}
                pagination={{
                  count: 10,
                  start: 0,
                }}
                showExport={false}
                sort={[{ direction: 'desc', field: 'updatedAt' }]}
                unsave={async ids => {
                  'use server';
                  await unsaveJobListings(ids);
                }}
              />
            </CardContent>
          </Card>
        </Card>
      </PageContent>
    </Page>
  );
}
