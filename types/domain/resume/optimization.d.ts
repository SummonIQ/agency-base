import { ResumeOptimization } from '@prisma/client';

import { WithOptionalResumeRevision } from './revision';

export type WithResumeOptimization<T> = T & {
  optimization: ResumeOptimization;
};

export type WithOptionalResumeOptimization<T> = T & {
  optimization?: WithOptionalResumeRevision<ResumeOptimization>;
};
