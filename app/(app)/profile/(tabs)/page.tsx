import { User } from '@prisma/client';
import { UserProfile } from '@prisma/client';

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardSummary,
  CardTitle,
} from '@/components/ui/card';
import { Card } from '@/components/ui/card';
import { UserDetailsForm } from '@/components/user/user-details-form';
import { updateUserProfile } from '@/lib/user';
import { getCurrentUser } from '@/lib/user';
import { WithOptionalUserProfile } from '@/types/domain/user';

export default async function ProfileDetails() {
  const user = (await getCurrentUser({
    include: {
      profile: true,
    },
  })) as WithOptionalUserProfile<User>;
  return (
    // <Page>
    //   <PageHeader>
    //     <PageSummary>
    //       <PageTitle>Profile</PageTitle>
    //       <PageDescription>
    //         Manage your profile and view your details.
    //       </PageDescription>
    //     </PageSummary>
    //   </PageHeader>
    //   <PageContent className="flex flex-col gap-4">
    //     {/* Render the tabs slot */}
    //     <TabNavigation
    //       defaultValue={'details'}
    //       tabs={[
    //         {
    //           content: details,
    //           href: '/profile',
    //           label: 'My Details',
    //         },
    //         { content: resumes, href: '/profile/resumes', label: 'Resumes' },
    //         {
    //           content: jobPreferences,
    //           href: '/profile/job-preferences',
    //           label: 'Job Preferences',
    //         },
    //       ]}
    //     />

    //     {children}
    //   </PageContent>
    // </Page>

    <Card>
      <CardHeader>
        <CardSummary>
          <CardTitle>My Details</CardTitle>
          <CardDescription>
            Edit your personal details so that resume optimization results are
            more accurate; this information is used to personalize your resume
            and cover letter and fill in any missing information.
          </CardDescription>
        </CardSummary>
      </CardHeader>
      <CardContent className="pt-4 md:pt-5">
        <UserDetailsForm
          action={async values => {
            'use server';

            await updateUserProfile({
              profile: values,
              userId: user.id as string,
            });
          }}
          user={user}
          userProfile={user.profile as UserProfile}
        />
      </CardContent>
    </Card>
  );
}
