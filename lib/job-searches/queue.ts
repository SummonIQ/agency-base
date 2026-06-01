'use cache';

import { JobSearchStatus } from '@prisma/client';

import { cacheLife, cacheTag } from '@/lib/cache';
import { db } from '@/lib/db';

export async function getQueuedJobSearches({
  include,
  sortBy = {
    updatedAt: 'desc',
  },
  userId,
}: {
  include?: {
    jobListings?: boolean;
    jobListingsCount?: boolean;
  };
  sortBy?: Record<string, 'asc' | 'desc'>;
  userId: string;
}) {
  // 'use cache' directive is now at the top of the file

  cacheTag(`user:${userId}:job-searches:queue`);
  cacheLife('seconds');

  const searches = await db.jobSearch.findMany({
    include: include
      ? {
          _count: include.jobListingsCount
            ? {
                select: {
                  jobListings: true,
                },
              }
            : undefined,
          jobListings: include.jobListings ? true : undefined,
        }
      : undefined,
    orderBy: sortBy,
    where: {
      status: { in: [JobSearchStatus.PROCESSING] },
      userId: userId,
    },
  });

  return searches;
}
