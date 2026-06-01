import type { Metadata } from 'next';

import {
  Page,
  PageContent,
  PageDescription,
  PageHeader,
  PageSummary,
  PageTitle,
} from '@/components/layout/page';
import { TableSkeleton } from '@/components/skeletons/table-skeleton';

export const metadata: Metadata = {
  description: 'Search for jobs and view job details.',
  title: 'Job Search | gimmejob',
};

export default function JobListingsLoadingPage() {
  return (
    <Page>
      <PageHeader>
        <PageSummary>
          <PageTitle>Job Searches</PageTitle>
          <PageDescription>Search for and view job details.</PageDescription>
        </PageSummary>
      </PageHeader>
      <PageContent>
        <TableSkeleton card={true} />
      </PageContent>
    </Page>
  );
}
