"use server";

import { SubmissionParams, SubmissionResult } from './index';
import { applyToJob, refreshTokenIfNeeded } from '@/lib/api/linkedin-client';
import { getCurrentUser } from '@/lib/user';
import { db } from '@/lib/db';
import { ApplicationStatus } from '@prisma/client';

/**
 * Submit an application to LinkedIn using the LinkedIn API
 * This provides a more reliable application process compared to browser automation
 */
export async function submitApplication(params: SubmissionParams): Promise<SubmissionResult> {
  const { jobId, jobUrl, resumeId, coverLetterId } = params;
  
  try {
    // Ensure the user has LinkedIn credentials
    const credentials = await refreshTokenIfNeeded();
    if (!credentials) {
      return {
        success: false,
        error: 'LinkedIn authentication required. Please connect your LinkedIn account.',
        authRequired: true,
      };
    }
    
    // Get user
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    // Extract LinkedIn job ID from URL or use the provided jobId
    let linkedInJobId = jobId;
    if (!linkedInJobId && jobUrl) {
      const match = jobUrl.match(/\/view\/(\d+)/);
      if (match && match[1]) {
        linkedInJobId = match[1];
      } else {
        return {
          success: false,
          error: 'Could not extract job ID from URL',
        };
      }
    }
    
    if (!linkedInJobId) {
      return {
        success: false,
        error: 'Job ID is required for LinkedIn application submission',
      };
    }
    
    // Use resumeId or get the default resume
    let actualResumeId = resumeId;
    if (!actualResumeId) {
      const defaultResume = await db.resume.findFirst({
        where: {
          userId: user.id,
          isDefault: true,
        },
      });
      
      if (!defaultResume) {
        return {
          success: false,
          error: 'No resume available for application submission',
        };
      }
      
      actualResumeId = defaultResume.id;
    }
    
    // Apply to job using LinkedIn API
    const result = await applyToJob(linkedInJobId, actualResumeId, coverLetterId);
    
    if (!result.success && result.redirectUrl) {
      // For jobs that don't support Easy Apply, return the redirect URL
      return {
        success: false,
        error: result.message,
        redirectUrl: result.redirectUrl,
      };
    }
    
    if (!result.success) {
      return {
        success: false,
        error: result.message || 'Application submission failed',
      };
    }
    
    // Create a unique confirmation code
    const confirmationCode = `LinkedIn-${Date.now()}-${linkedInJobId.substring(0, 6)}`;
    
    // Return success result
    return {
      success: true,
      message: 'Application submitted successfully via LinkedIn',
      confirmationCode,
      status: ApplicationStatus.SUBMITTED,
    };
  } catch (error) {
    console.error('LinkedIn API application submission error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during LinkedIn application submission',
    };
  }
}
