'use server';

import type { JobListingStatus } from '@prisma/client';
import { cacheTag } from '@/lib/cache';

import { db } from '@/lib/db';

export async function getJobListingsCount({
  statuses = [],
  userId,
}: {
  statuses?: Array<JobListingStatus>;
  userId: string;
}) {
  'use cache';

  cacheTag(`user:${userId}:job-listings:count`);

  const count = await db.jobListing.count({
    where: {
      status: statuses
        ? {
            in: statuses,
          }
        : undefined,
      userId,
    },
  });

  return count;
}
