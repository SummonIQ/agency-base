import type { Event, EventType } from '@/types/events';
import type { JobLeadOptimizationProgressPayload } from '@/types/job-lead/event';
import type { JobSearchProgressPayload } from '@/types/job-search/event';
import type {
  ResumeAnalysisProgressPayload,
  ResumeOptimizationProgressPayload,
} from '@/types/resumes';

export enum DataEventType {
  JOB_LEAD_OPTIMIZATION_PROGRESS = 'job-lead-optimization-progress',
  JOB_SEARCH_PROGRESS = 'job-search-progress',
  JOB_SEARCH_UPDATED = 'job-search-updated',
  RESUME_ANALYSIS_PROGRESS = 'resume-analysis-progress',
  RESUME_OPTIMIZATION_PROGRESS = 'resume-optimization-progress',
  TEST = 'test',
}

export type DataEventPayload =
  | {
      data: JobSearchProgressPayload;
      type?: DataEventType.JOB_SEARCH_PROGRESS;
    }
  | {
      data: JobLeadOptimizationProgressPayload;
      type: DataEventType.JOB_LEAD_OPTIMIZATION_PROGRESS;
    }
  | {
      data: ResumeAnalysisProgressPayload;
      type: DataEventType.RESUME_ANALYSIS_PROGRESS;
    }
  | {
      data: ResumeOptimizationProgressPayload;
      type: DataEventType.RESUME_OPTIMIZATION_PROGRESS;
    }
  | {
      data: unknown;
      type: DataEventType.TEST;
    };

export type DataEvent = Event<EventType.DataUpdate, DataEventPayload>;
