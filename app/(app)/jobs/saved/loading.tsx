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
  description: 'View saved job listings',
  title: 'Saved Jobs | gimmejob',
};

export default function SavedJobListingsLoadingPage() {
  return (
    <Page>
      <PageHeader>
        <PageSummary>
          <PageTitle className="opacity-50">Saved Jobs</PageTitle>
          <PageDescription className="opacity-50">
            View and manage Job listings you have saved.
          </PageDescription>
        </PageSummary>
      </PageHeader>
      <PageContent>
        <TableSkeleton card={true} />
      </PageContent>
    </Page>
  );
}
