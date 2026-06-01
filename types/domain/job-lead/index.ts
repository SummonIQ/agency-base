import { JobLead } from '@prisma/client';

export type WithJobLead<T> = T & { lead: JobLead };

export * from './events';
