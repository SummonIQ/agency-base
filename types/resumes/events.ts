import { ResumeAnalysisStatus, ResumeOptimizationStatus } from '@prisma/client';

export type ResumeAnalysisProgressPayload = {
  id: string;
  name: string;
  progress: number;
  status: ResumeAnalysisStatus;
};

export type ResumeOptimizationProgressPayload = {
  id: string;
  name: string;
  progress: number;
  status: ResumeOptimizationStatus;
};
