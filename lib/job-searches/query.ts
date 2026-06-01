'use cache';

import { JobSearchStatus } from '@prisma/client';
import { cacheTag } from '@/lib/cache';

import { db } from '@/lib/db';

export async function getJobSearches({
  include,
  sortBy = {
    updatedAt: 'desc',
  },
  statuses,
  userId,
}: {
  include?: {
    jobListings?: boolean;
    jobListingsCount?: boolean;
  };
  sortBy?: Record<string, 'asc' | 'desc'>;
  statuses?: Array<JobSearchStatus>;
  userId: string;
}) {
  'use cache';

  cacheTag(`user:${userId}:job-searches`);

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
      status: statuses ? { in: statuses } : undefined,
      userId: userId,
    },
  });

  return searches;
}

export async function getJobSearch({
  id,
  include,
  userId,
}: {
  id: string;
  include?: {
    jobListings: boolean;
  };
  userId: string;
}) {
  // 'use cache' directive is now at the top of the file

  cacheTag(`user:${userId}:job-searches:${id}`);

  const jobSearch = await db.jobSearch.findUnique({
    include: include ?? {
      jobListings: false,
    },
    where: {
      id,
      userId,
    },
  });

  return jobSearch;
}
