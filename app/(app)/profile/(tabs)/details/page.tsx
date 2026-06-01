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

export default async function ProfileDetails() {
  const user = await getCurrentUser({
    include: {
      profile: true,
    },
  });

  return (
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
