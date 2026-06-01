import type { Metadata } from 'next';

import {
  Page,
  PageDescription,
  PageHeader,
  PageSummary,
  PageTitle,
} from '@/components/layout/page';

export const metadata: Metadata = {
  description: 'A collection of tools to help you with your job search.',
  title: 'Tools | gimmejob',
};

export default function ToolsPage() {
  return (
    <Page>
      <PageHeader>
        <PageSummary>
          <PageTitle className="opacity-50">Tools</PageTitle>
          <PageDescription className="opacity-50">
            A collection of tools to help you with your job search.
          </PageDescription>
        </PageSummary>
      </PageHeader>
    </Page>
  );
}
