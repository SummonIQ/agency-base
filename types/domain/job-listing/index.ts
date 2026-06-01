import { JobListing } from '@prisma/client';

export type WithJobListing<T> = T & { jobListing: JobListing };
