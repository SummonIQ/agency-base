import { cacheTag } from '../cache';
import { getDatabaseUser } from './query';

export async function getUserDefaultResumeId(userId: string) {
  'use cache';

  cacheTag(`user:${userId}:resumes:default`);

  const user = await getDatabaseUser(userId);

  return user.defaultResumeId;
}
