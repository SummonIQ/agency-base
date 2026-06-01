'use server';

import { JobLeadStatus } from '@prisma/client';
import { revalidateTag } from '@/lib/cache';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/user';

export async function dismissJobLead(id: string) {
  const user = await getCurrentUser();

  const jobLead = await db.jobLead.update({
    data: {
      status: JobLeadStatus.DISMISSED,
    },
    where: {
      id,
      userId: user.id,
    },
  });

  revalidateTag(`user:${user.id}:report:job-leads`);
  revalidateTag(`user:${user.id}:job-leads`);
  revalidateTag(`user:${user.id}:job-leads:${id}`);
  revalidateTag(`user:${user.id}:job-leads:count`);
  revalidateTag(`user:${user.id}:job-leads:dismissed`);
  revalidateTag(`user:${user.id}:job-leads:dismissed:count`);

  return jobLead;
}

export async function dismissJobLeads(ids: Array<string>) {
  const user = await getCurrentUser();

  const jobLeads = await db.jobLead.updateMany({
    data: {
      status: JobLeadStatus.DISMISSED,
    },
    where: {
      id: { in: ids },
      userId: user.id,
    },
  });

  revalidateTag(`user:${user.id}:report:job-leads`);
  revalidateTag(`user:${user.id}:job-leads`);
  revalidateTag(`user:${user.id}:job-leads:count`);
  revalidateTag(`user:${user.id}:job-leads:dismissed`);
  revalidateTag(`user:${user.id}:job-leads:dismissed:count`);

  return jobLeads;
}
