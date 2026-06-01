import {
  Page,
  PageContent,
  PageDescription,
  PageHeader,
  PageSummary,
  PageTitle,
} from '@/components/layout/page';
import { TabNavigation } from '@/components/navigation/tab-navigation';

export default function ProfileLayout({
  details,
  resumes,
  'job-preferences': jobPreferences,
  children,
}: {
  children: React.ReactNode;
  details: React.ReactNode;
  'job-preferences': React.ReactNode;
  resumes: React.ReactNode;
}) {
  return (
    <Page>
      <PageHeader>
        <PageSummary>
          <PageTitle>Profile</PageTitle>
          <PageDescription>
            Manage your profile and view your details.
          </PageDescription>
        </PageSummary>
      </PageHeader>
      <PageContent className="flex flex-col">
        {/* Render the tabs slot */}
        <TabNavigation
          defaultValue={'details'}
          tabs={[
            {
              content: details,
              href: '/profile',
              label: 'My Details',
            },
            { content: resumes, href: '/profile/resumes', label: 'Resumes' },
            {
              content: jobPreferences,
              href: '/profile/job-preferences',
              label: 'Job Preferences',
            },
          ]}
        />

        {children}
      </PageContent>
    </Page>
  );
}
