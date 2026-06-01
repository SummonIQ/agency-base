import type { Metadata } from 'next';

import { PageActions } from '@/components/layout/page';
import {
  Page,
  PageContent,
  PageDescription,
  PageHeader,
  PageSummary,
  PageTitle,
} from '@/components/layout/page';
import { TableSkeleton } from '@/components/skeletons/table-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

/* TODO: Make this dyanmic with generateMetadata() */
export const metadata: Metadata = {
  description: 'Search details',
  title: 'Job Search | Gimme Job',
};

export default function JobScrapersLoadingPage() {
  return (
    <Page>
      <PageHeader>
        <PageSummary>
          <PageTitle className="opacity-50">
            <Skeleton className="h-4 w-32" />
          </PageTitle>
          <PageDescription className="opacity-50">
            <Skeleton className="h-4 w-56" />
          </PageDescription>
        </PageSummary>
        <PageActions />
      </PageHeader>

      <PageContent>
        <TableSkeleton />
      </PageContent>
    </Page>
  );
}
