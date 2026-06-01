import { Prisma } from '@prisma/client';
import { cacheTag } from '@/lib/cache';

import { db } from '@/lib/db';
export async function getResumeRevision({
  id,
  include = {},
  userId,
}: {
  id: string;
  include?: Prisma.ResumeRevisionInclude;
  userId: string;
}) {
  'use cache';

  cacheTag(`user:${userId}:resume-revisions:${id}`);

  const revision = await db.resumeRevision.findUnique({
    include,
    where: {
      id,
      userId,
    },
  });

  return revision;
}
