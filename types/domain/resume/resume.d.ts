import { Resume as DBResume } from '@prisma/client';

import { ResumeAnalysis } from './analysis';

export interface Resume extends DBResume {
  analysis: ResumeAnalysis;
}
