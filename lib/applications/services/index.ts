import { JobBoard } from '@prisma/client';
import * as linkedinService from './linkedin';
import { submitIndeedApplication } from './indeed-submission';
import { glassdoorService } from './glassdoor';
import { zipRecruiterService } from './ziprecruiter';
import { angelListService } from './angellist';
import { companyDirectService } from './company-direct';

export interface SubmissionProvider {
  submitApplication: (params: SubmissionParams) => Promise<SubmissionResult>;
}

export interface SubmissionParams {
  jobId: string;
  jobUrl?: string;
  resumeData?: Buffer | string;
  coverLetterData?: Buffer | string;
  customFields?: Record<string, any>;
}

export interface SubmissionResult {
  success: boolean;
  applicationId?: string;
  confirmationCode?: string;
  error?: string;
  metadata?: Record<string, any>;
}

const providers: Record<JobBoard, SubmissionProvider> = {
  [JobBoard.LINKEDIN]: linkedinService,
  [JobBoard.GOOGLE]: {
    submitApplication: async () => {
      throw new Error('Google Jobs submission not yet implemented');
    }
  },
  [JobBoard.INDEED]: {
    submitApplication: async (params) => {
      const { jobId, resumeData, coverLetterData, customFields } = params;
      try {
        const result = await submitIndeedApplication({
          jobLeadId: jobId,
          resumeId: customFields?.resumeId || '',
          coverLetterId: customFields?.coverLetterId,
          additionalInfo: customFields?.additionalFields,
        });
        
        return {
          success: result.success,
          applicationId: result.applicationId,
          error: result.success ? undefined : result.message,
          metadata: { provider: 'INDEED' }
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error during Indeed submission',
          metadata: { provider: 'INDEED' }
        };
      }
    }
  },
  [JobBoard.GLASSDOOR]: glassdoorService,
  [JobBoard.ZIPRECRUITER]: zipRecruiterService,
  [JobBoard.ANGELLIST]: angelListService,
  [JobBoard.WELLFOUND]: angelListService, // Wellfound is the new name for AngelList
  [JobBoard.MONSTER]: {
    submitApplication: async () => {
      throw new Error('Monster submission not yet implemented');
    }
  },
  [JobBoard.DICE]: {
    submitApplication: async () => {
      throw new Error('Dice submission not yet implemented');
    }
  },
  [JobBoard.FLEXJOBS]: {
    submitApplication: async () => {
      throw new Error('FlexJobs submission not yet implemented');
    }
  },
  [JobBoard.REMOTE_OK]: {
    submitApplication: async () => {
      throw new Error('Remote.co submission not yet implemented');
    }
  },
  [JobBoard.WE_WORK_REMOTELY]: {
    submitApplication: async () => {
      throw new Error('We Work Remotely submission not yet implemented');
    }
  },
  [JobBoard.COMPANY_DIRECT]: companyDirectService,
  [JobBoard.CAREER_BUILDER]: {
    submitApplication: async () => {
      throw new Error('CareerBuilder submission not yet implemented');
    }
  },
  [JobBoard.OTHER]: {
    submitApplication: async () => {
      throw new Error('This job board is not supported for automated submissions');
    }
  },
};

export async function getSubmissionProvider(jobBoard: JobBoard): Promise<SubmissionProvider> {
  const provider = providers[jobBoard];
  if (!provider) {
    throw new Error(`No submission provider available for job board: ${jobBoard}`);
  }
  return provider;
}

export async function submitToJobBoard(
  jobBoard: JobBoard,
  params: SubmissionParams
): Promise<SubmissionResult> {
  const provider = await getSubmissionProvider(jobBoard);
  return provider.submitApplication(params);
}
