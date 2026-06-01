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
  description: 'View your job leads.',
  title: 'Job Leads | gimmejob',
};

export default function JobLeadsLoadingPage() {
  return (
    <Page>
      <PageHeader>
        <PageSummary>
          <PageTitle className="opacity-50">Job Leads</PageTitle>
          <PageDescription className="opacity-50">
            Leads are potential job opportunities that you are interested in.
          </PageDescription>
        </PageSummary>
      </PageHeader>
      <PageContent>
        <TableSkeleton card={true} />
      </PageContent>
    </Page>
  );
}
