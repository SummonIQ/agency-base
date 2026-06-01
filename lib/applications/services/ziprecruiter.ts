import { SubmissionProvider, SubmissionParams, SubmissionResult } from './index';
import { db } from '@/lib/db';
import { ApplicationStatus } from '@prisma/client';

interface ZipRecruiterJobData {
  jobId: string;
  title: string;
  company: string;
  location: string;
  jobUrl: string;
  zipId?: string;
}

interface ZipRecruiterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  resumeText?: string;
  coverLetter?: string;
  experienceLevel?: string;
  desiredSalary?: string;
  availableStartDate?: string;
  workAuthorization?: string;
  commute?: string;
  willingToRelocate?: boolean;
  screeningAnswers?: Record<string, string>;
}

export class ZipRecruiterSubmissionService implements SubmissionProvider {
  async submitApplication(params: SubmissionParams): Promise<SubmissionResult> {
    try {
      const { jobId, jobUrl, resumeData, coverLetterData, customFields } = params;
      
      // Validate required parameters
      if (!jobId) {
        throw new Error('Job ID is required for ZipRecruiter submissions');
      }

      // Get job data from database
      const jobLead = await db.jobLead.findUnique({
        where: { id: jobId },
        include: {
          jobListing: true,
          user: true,
        },
      });

      if (!jobLead) {
        throw new Error(`Job lead not found: ${jobId}`);
      }

      // Extract job information
      const jobData: ZipRecruiterJobData = {
        jobId: jobLead.id,
        title: jobLead.jobTitle,
        company: jobLead.companyName,
        location: jobLead.location || '',
        jobUrl: jobLead.jobListing?.externalUrl || jobUrl || '',
        zipId: this.extractZipId(jobLead.jobListing?.externalUrl || jobUrl || ''),
      };

      // Get user profile data
      const userProfile = await this.getUserProfile(jobLead.userId);
      
      // Prepare form data
      const formData = await this.prepareFormData(
        userProfile,
        resumeData,
        coverLetterData,
        customFields
      );

      // Attempt to apply to ZipRecruiter
      const applicationResult = await this.submitToZipRecruiter(jobData, formData);

      // Log the submission
      await this.logSubmission(jobLead.id, jobLead.userId, applicationResult);

      return {
        success: applicationResult.success,
        applicationId: applicationResult.applicationId,
        confirmationCode: applicationResult.confirmationCode,
        error: applicationResult.error,
        metadata: {
          provider: 'ZIPRECRUITER',
          jobTitle: jobData.title,
          company: jobData.company,
          submissionMethod: applicationResult.method || 'direct',
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('ZipRecruiter submission error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during ZipRecruiter submission',
        metadata: {
          provider: 'ZIPRECRUITER',
          error: error instanceof Error ? error.stack : undefined,
        },
      };
    }
  }

  private async getUserProfile(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        preferences: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      phone: (user.preferences as any)?.phone || '',
      address: (user.preferences as any)?.address || '',
      city: (user.preferences as any)?.city || '',
      state: (user.preferences as any)?.state || '',
      zipCode: (user.preferences as any)?.zipCode || '',
    };
  }

  private async prepareFormData(
    userProfile: any,
    resumeData?: Buffer | string,
    coverLetterData?: Buffer | string,
    customFields?: Record<string, any>
  ): Promise<ZipRecruiterFormData> {
    return {
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      email: userProfile.email,
      phone: userProfile.phone,
      address: userProfile.address,
      city: userProfile.city,
      state: userProfile.state,
      zipCode: userProfile.zipCode,
      resumeText: resumeData ? resumeData.toString() : undefined,
      coverLetter: coverLetterData ? coverLetterData.toString() : undefined,
      experienceLevel: customFields?.experienceLevel || '',
      desiredSalary: customFields?.desiredSalary || '',
      availableStartDate: customFields?.availableStartDate || 'Immediately',
      workAuthorization: customFields?.workAuthorization || 'yes',
      commute: customFields?.commute || '25 miles',
      willingToRelocate: customFields?.willingToRelocate === 'true',
      screeningAnswers: customFields?.screeningAnswers || {},
    };
  }

  private async submitToZipRecruiter(
    jobData: ZipRecruiterJobData,
    formData: ZipRecruiterFormData
  ): Promise<{
    success: boolean;
    applicationId?: string;
    confirmationCode?: string;
    error?: string;
    method?: string;
  }> {
    try {
      // Check if this is a ZipRecruiter hosted job or external redirect
      if (this.isZipRecruiterJob(jobData.jobUrl)) {
        return await this.handleZipRecruiterApplication(jobData, formData);
      } else {
        return await this.handleExternalRedirectApplication(jobData, formData);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit application',
      };
    }
  }

  private async handleZipRecruiterApplication(
    jobData: ZipRecruiterJobData,
    formData: ZipRecruiterFormData
  ): Promise<{
    success: boolean;
    applicationId?: string;
    confirmationCode?: string;
    error?: string;
    method: string;
  }> {
    // Simulate ZipRecruiter application process
    // In reality, this would involve:
    // - Launching a headless browser (Puppeteer/Playwright)
    // - Navigating to the specific job posting
    // - Clicking "Apply Now" or "Quick Apply"
    // - Filling out the application form with user data
    // - Uploading resume if required
    // - Answering screening questions
    // - Handling potential employer redirects
    // - Submitting the application

    // ZipRecruiter-specific considerations:
    // - Quick Apply vs Full Application flow
    // - Phone number verification requirements
    // - Resume parsing and pre-filling
    // - Employer-specific questions
    // - Follow-up email preferences

    const applicationId = `zip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate success for demonstration
    return {
      success: true,
      applicationId,
      confirmationCode: `ZR-${applicationId.slice(-8).toUpperCase()}`,
      method: 'ziprecruiter_quick_apply',
    };
  }

  private async handleExternalRedirectApplication(
    jobData: ZipRecruiterJobData,
    formData: ZipRecruiterFormData
  ): Promise<{
    success: boolean;
    applicationId?: string;
    error?: string;
    method: string;
  }> {
    // Handle cases where ZipRecruiter redirects to employer sites
    // This would involve:
    // - Following redirect chains
    // - Detecting the target ATS system
    // - Using appropriate automation strategy
    // - Falling back to manual intervention

    return {
      success: false,
      error: 'External employer applications require manual submission. Job has been added to your manual review queue.',
      method: 'external_redirect',
    };
  }

  private extractZipId(url: string): string | null {
    // Extract ZipRecruiter job ID from various URL formats
    const patterns = [
      /\/jobs\/[^\/]+\/(\w+)/,  // /jobs/title/ID
      /\/job\/(\w+)/,           // /job/ID
      /jobid=(\w+)/,            // ?jobid=ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  }

  private isZipRecruiterJob(url: string): boolean {
    return url.includes('ziprecruiter.com');
  }

  private async logSubmission(
    jobLeadId: string,
    userId: string,
    result: { success: boolean; applicationId?: string; error?: string }
  ) {
    try {
      await db.applicationSubmission.create({
        data: {
          userId,
          jobLeadId,
          status: result.success ? ApplicationStatus.SUBMITTED : ApplicationStatus.FAILED,
          submittedAt: result.success ? new Date() : undefined,
          externalId: result.applicationId || undefined,
          errorMessage: result.error || undefined,
          metadata: {
            platform: 'ZIPRECRUITER',
            submissionType: 'automated',
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      console.error('Failed to log ZipRecruiter submission:', error);
    }
  }

  // Static utility methods
  static isZipRecruiterJob(url: string): boolean {
    return url.includes('ziprecruiter.com');
  }

  static extractJobId(url: string): string | null {
    const service = new ZipRecruiterSubmissionService();
    return service.extractZipId(url);
  }

  // Method to validate user eligibility for ZipRecruiter applications
  async validateUserEligibility(userId: string): Promise<{
    eligible: boolean;
    requirements: string[];
    recommendations?: string[];
  }> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { preferences: true },
    });

    const requirements: string[] = [];
    const recommendations: string[] = [];

    if (!user?.firstName || !user?.lastName) {
      requirements.push('Complete name required');
    }

    if (!user?.email) {
      requirements.push('Valid email address required');
    }

    const preferences = user?.preferences as any;
    if (!preferences?.phone) {
      requirements.push('Phone number required (ZipRecruiter often requires phone verification)');
    }

    if (!preferences?.city || !preferences?.state || !preferences?.zipCode) {
      requirements.push('Complete location information required for job matching');
    }

    if (requirements.length === 0) {
      recommendations.push('Upload a current resume for better application success');
      recommendations.push('Set salary expectations to match relevant opportunities');
      recommendations.push('Complete profile to enable Quick Apply features');
    }

    return {
      eligible: requirements.length === 0,
      requirements,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
    };
  }

  // Method to get ZipRecruiter-specific settings
  async getZipRecruiterSettings(userId: string): Promise<{
    quickApplyEnabled: boolean;
    phoneVerificationCompleted: boolean;
    resumeUploaded: boolean;
    profileCompleteness: number;
  }> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { preferences: true },
    });

    const preferences = user?.preferences as any;
    let completeness = 0;
    
    if (user?.firstName && user?.lastName) completeness += 20;
    if (user?.email) completeness += 20;
    if (preferences?.phone) completeness += 20;
    if (preferences?.city && preferences?.state) completeness += 20;
    if (preferences?.resumeUrl) completeness += 20;

    return {
      quickApplyEnabled: completeness >= 80,
      phoneVerificationCompleted: !!preferences?.phoneVerified,
      resumeUploaded: !!preferences?.resumeUrl,
      profileCompleteness: completeness,
    };
  }
}

// Export singleton instance
export const zipRecruiterService = new ZipRecruiterSubmissionService();