// import { auth } from '@clerk/nextjs';
import type { PropsWithChildren } from 'react';

import {
  Page,
  PageContent,
  PageHeader,
  PageTitle,
  // PageTitle,
} from '@/components/layout/page';
import { SettingsMenu } from '@/components/user/settings-menu';
// import { Heading } from '@/components/ui/heading';

export default async function SettingsLayout({ children }: PropsWithChildren) {
  // const session = await auth();

  // if (!session || session.user) {
  //   throw new Error('User not found');
  // }

  // const user = await getUser(session.user.id);

  return (
    <Page>
      <PageHeader>
        <PageTitle>Settings</PageTitle>
      </PageHeader>
      <PageContent className="grow flex-col pt-0 md:pt-0">
        <div className="flex grow flex-col rounded-lg border border-border shadow-sm shadow-border/70 md:flex-row">
          <div className="shrink-0 border-b border-border p-3 md:w-56 md:border-b-0 md:border-r">
            <SettingsMenu />
          </div>

          <div className="flex grow flex-col p-4 px-5">{children}</div>
        </div>
      </PageContent>
    </Page>
  );
}
