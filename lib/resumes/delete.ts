import { revalidateTag } from '@/lib/cache';

import { db } from '@/lib/db';

import { getCurrentUser } from '../user';

export async function deleteResume(resumeId: string) {
  const user = await getCurrentUser();

  await db.resume.delete({
    where: { id: resumeId },
  });

  revalidateTag(`user:${user.id}:report:resumes`);
  revalidateTag(`user:${user.id}:resumes`);
  revalidateTag(`user:${user.id}:resumes:${resumeId}`);
}
