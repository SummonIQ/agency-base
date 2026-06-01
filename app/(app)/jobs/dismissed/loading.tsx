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
  description: 'View dismissed job listings',
  title: 'Dismissed Jobs | gimmejob',
};

export default function DismissedJobListingsLoadingPage() {
  return (
    <Page>
      <PageHeader>
        <PageSummary>
          <PageTitle className="opacity-50">Dismissed Jobs</PageTitle>
          <PageDescription className="opacity-50">
            A list of Job listings you have dismissed.
          </PageDescription>
        </PageSummary>
      </PageHeader>
      <PageContent>
        <TableSkeleton card={true} />
      </PageContent>
    </Page>
  );
}
