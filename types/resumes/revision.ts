import { ResumeRevision as DBResumeRevision } from '@prisma/client';

import { ResumeAnalysis } from '@/types/domain/resume';

export interface ResumeRevision extends DBResumeRevision {
  analysis: ResumeAnalysis;
}
