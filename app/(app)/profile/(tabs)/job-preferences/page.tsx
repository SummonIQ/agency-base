import { User } from '@prisma/client';

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardSummary,
  CardTitle,
} from '@/components/ui/card';
import { Card } from '@/components/ui/card';
import { JobPreferencesForm } from '@/components/user/job-preferences-form';
import { updateUserJobPreferences } from '@/lib/user';
import { getCurrentUser } from '@/lib/user';
import { WithUserJobPreferences } from '@/types/domain/user';

export default async function JobPreferences() {
  const user = (await getCurrentUser({
    include: {
      jobPreferences: true,
    },
  })) as WithUserJobPreferences<User>;
  return (
    <Card>
      <CardHeader>
        <CardSummary>
          <CardTitle>Job Preferences</CardTitle>
          <CardDescription>
            Edit your job preferences so that resume optimization results are
            more accurate.
          </CardDescription>
        </CardSummary>
      </CardHeader>
      <CardContent className="pt-4 md:pt-5">
        <JobPreferencesForm
          action={async values => {
            'use server';

            await updateUserJobPreferences({
              jobPreferences: values,
              userId: user.id as string,
            });
          }}
          jobPreferences={user.jobPreferences}
        />
      </CardContent>
    </Card>
  );
}
