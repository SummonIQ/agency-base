import type { Metadata } from 'next';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardSummary,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  description: 'Manage your profile and view your details.',
  title: 'Profile | gimmejob',
};

export default function ProfileLoadingPage() {
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
      <CardContent className="space-y-5 pt-4 md:pt-5">
        <h3 className="text-base font-semibold">Personal Information</h3>

        <div className="flex flex-row gap-4">
          <div className="flex flex-col gap-2">
            <Label>First Name</Label>
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Last Name</Label>
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
