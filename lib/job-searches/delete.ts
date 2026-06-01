import { revalidateTag } from '@/lib/cache';

import { db } from '../db';
import { getCurrentUser } from '../user';

export async function deleteJobSearch(id: string) {
  const user = await getCurrentUser();

  await db.jobSearch.delete({
    where: {
      id,
      userId: user.id,
    },
  });

  revalidateTag(`user:${user.id}:report:job-searches`);
  revalidateTag(`user:${user.id}:job-searches`);
  revalidateTag(`user:${user.id}:job-searches:queue`);
  revalidateTag(`user:${user.id}:job-searches:count`);
}
