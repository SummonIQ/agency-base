'use server';

import { unstable_cacheTag } from 'next/cache';

import { logger } from '@/lib/logger';

// const log = logger.child({ module: 'cache' });

export async function cacheTag(tag: string) {
  'use cache';

  logger.info(`[CACHE] ${tag}`);

  return unstable_cacheTag(tag);
}
