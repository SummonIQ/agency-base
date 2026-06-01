'use server';

import type { JobLeadStatus } from '@prisma/client';

import { cacheTag } from '@/lib/cache';
import { db } from '@/lib/db';

export async function getJobLeadsCount({
  statuses,
  userId,
}: {
  statuses?: Array<JobLeadStatus>;
  userId: string;
}) {
  'use cache';

  cacheTag(`user:${userId}:job-leads:count`);

  const leadsCount = await db.jobLead.count({
    where: {
      status:
        statuses && statuses.length > 0
          ? {
              in: statuses,
            }
          : undefined,
      userId,
    },
  });

  return leadsCount;
}
