'use server';

import { revalidatePath, revalidateTag as revalidateTagNext } from 'next/cache';

import { logger } from '@/lib/logger';

// const log = logger.child({ module: 'cache' });

export async function revalidateAllCacheData() {
  logger.info(`[CACHE] Revalidating path: /`);

  revalidatePath('/');
}

export async function revalidateTag(tag: string) {
  logger.info(`[CACHE] Revalidating tag: ${tag}`);

  revalidateTagNext(tag);
}
