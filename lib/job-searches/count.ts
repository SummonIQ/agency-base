'use server';

import { cacheTag } from '@/lib/cache';

import { db } from '@/lib/db';

export async function getJobSearchesCount({ userId }: { userId: string }) {
  'use cache';

  cacheTag(`user:${userId}:job-searches:count`);

  const count = await db.jobSearch.count({
    where: {
      userId,
    },
  });

  return count;
}
