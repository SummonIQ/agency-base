import { revalidateTag } from '@/lib/cache';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/user';

export async function setUserDefaultResume(id: string) {
  const user = await getCurrentUser();

  await db.user.update({
    data: {
      defaultResumeId: id,
    },
    where: {
      id: user.id,
    },
  });

  revalidateTag(`user:${user.id}:report:resumes`);
  revalidateTag(`user:${user.id}:resumes`);
  revalidateTag(`user:${user.id}:resumes:${id}`);

  return user;
}
