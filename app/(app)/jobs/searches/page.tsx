import { JobSearch } from '@prisma/client';
import type { Metadata } from 'next';
import type { z } from 'zod';

import { JobSearchEditor } from '@/components/job-searches/job-search-editor';
import type { jobSearchFormSchema } from '@/components/job-searches/job-search-form';
import { JobSearchesReport } from '@/components/job-searches/job-searches-report';
import {
  Page,
  PageActions,
  PageContent,
  PageDescription,
  PageHeader,
  PageSummary,
  PageTitle,
} from '@/components/layout/page';
import { createJobSearch } from '@/lib/job-searches';
import { getReportData } from '@/lib/reporting';
import { getCurrentUser } from '@/lib/user';

export const metadata: Metadata = {
  description: 'Search for and view job details.',
  title: 'Job Listings | Gimme Job',
};

export default async function JobSearchesPage() {
  const user = await getCurrentUser();

  const jobSearches = await getReportData<JobSearch>({
    apiQuery: {
      include: {
        jobListings: {
          select: {
            id: true,
          },
        },
      },
      pagination: {
        count: 10,
        start: 0,
      },
      sort: [{ direction: 'desc', field: 'createdAt' }],
    },
    model: 'job-searches',
    userId: user.id,
  });

  return (
    <Page>
      <PageHeader>
        <PageSummary>
          <PageTitle>Job Searches</PageTitle>
          <PageDescription>Search for and view job details.</PageDescription>
        </PageSummary>
        <PageActions>
          <JobSearchEditor
            action={async (data: z.infer<typeof jobSearchFormSchema>) => {
              'use server';

              await createJobSearch({
                ...data,
                pageDelay: Number.parseInt(data.pageDelay),
              });
            }}
          />
        </PageActions>
      </PageHeader>
      <PageContent>
        <JobSearchesReport
          cacheKey="job-searches"
          include={{
            jobListings: {
              select: {
                id: true,
              },
            },
          }}
          initialData={jobSearches.data}
          showPagination={true}
          showSearch={true}
          showSelectedCount={false}
        />
      </PageContent>
    </Page>
  );
}
