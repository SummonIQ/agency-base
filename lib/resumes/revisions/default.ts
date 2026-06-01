import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/user';

export async function setDefaultResumeRevision(resumeId: string, id: string) {
  const user = await getCurrentUser();

  const resume = await db.resume.update({
    data: {
      defaultRevisionId: id,
    },
    where: {
      id: resumeId,
      userId: user.id,
    },
  });

  return resume;
}
