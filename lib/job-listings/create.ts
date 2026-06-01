import { type Prisma } from '@prisma/client';
import { revalidateTag } from '@/lib/cache';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/user';

export async function createJobListing(
  jobListing: Prisma.JobListingCreateInput,
) {
  const user = await getCurrentUser();

  const result = await db.jobListing.create({
    data: jobListing,
  });

  revalidateTag(`user:${user.id}:report:job-listings`);
  revalidateTag(`user:${user.id}:job-listings`);
  revalidateTag(`user:${user.id}:job-listings:count`);

  return result;
}

export async function createJobListings(
  jobListings: Array<Prisma.JobListingCreateManyInput>,
) {
  const user = await getCurrentUser();

  const result = await db.jobListing.createMany({
    data: jobListings,
    skipDuplicates: true,
  });

  revalidateTag(`user:${user.id}:report:job-listings`);
  revalidateTag(`user:${user.id}:job-listings`);
  revalidateTag(`user:${user.id}:job-listings:count`);

  return result;
}
