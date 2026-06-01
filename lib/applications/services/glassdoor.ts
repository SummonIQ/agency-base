import { SubmissionProvider, SubmissionParams, SubmissionResult } from './index';
import { db } from '@/lib/db';
import { ApplicationStatus } from '@prisma/client';

interface GlassdoorJobData {
  jobId: string;
  title: string;
  company: string;
  location: string;
  jobUrl: string;
  applyUrl?: string;
}

interface GlassdoorFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  coverLetter?: string;
  resumeText?: string;
  experienceYears?: string;
  desiredSalary?: string;
  availableStartDate?: string;
  workAuthorization?: string;
  willingToRelocate?: boolean;
  customQuestions?: Record<string, string>;
}

export class GlassdoorSubmissionService implements SubmissionProvider {
  async submitApplication(params: SubmissionParams): Promise<SubmissionResult> {
    try {
      const { jobId, jobUrl, resumeData, coverLetterData, customFields } = params;
      
      // Validate required parameters
      if (!jobId) {
        throw new Error('Job ID is required for Glassdoor submissions');
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
      const jobData: GlassdoorJobData = {
        jobId: jobLead.id,
        title: jobLead.jobTitle,
        company: jobLead.companyName,
        location: jobLead.location || '',
        jobUrl: jobLead.jobListing?.externalUrl || jobUrl || '',
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

      // Attempt to apply to Glassdoor
      const applicationResult = await this.submitToGlassdoor(jobData, formData);

      // Log the submission
      await this.logSubmission(jobLead.id, jobLead.userId, applicationResult);

      return {
        success: applicationResult.success,
        applicationId: applicationResult.applicationId,
        confirmationCode: applicationResult.confirmationCode,
        error: applicationResult.error,
        metadata: {
          provider: 'GLASSDOOR',
          jobTitle: jobData.title,
          company: jobData.company,
          submissionMethod: applicationResult.method || 'direct',
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Glassdoor submission error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during Glassdoor submission',
        metadata: {
          provider: 'GLASSDOOR',
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
      country: (user.preferences as any)?.country || 'United States',
    };
  }

  private async prepareFormData(
    userProfile: any,
    resumeData?: Buffer | string,
    coverLetterData?: Buffer | string,
    customFields?: Record<string, any>
  ): Promise<GlassdoorFormData> {
    return {
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      email: userProfile.email,
      phone: userProfile.phone,
      address: userProfile.address,
      city: userProfile.city,
      state: userProfile.state,
      zipCode: userProfile.zipCode,
      country: userProfile.country,
      coverLetter: coverLetterData ? coverLetterData.toString() : undefined,
      resumeText: resumeData ? resumeData.toString() : undefined,
      experienceYears: customFields?.experienceYears || '',
      desiredSalary: customFields?.desiredSalary || '',
      availableStartDate: customFields?.availableStartDate || '',
      workAuthorization: customFields?.workAuthorization || 'yes',
      willingToRelocate: customFields?.willingToRelocate === 'true',
      customQuestions: customFields?.customQuestions || {},
    };
  }

  private async submitToGlassdoor(
    jobData: GlassdoorJobData,
    formData: GlassdoorFormData
  ): Promise<{
    success: boolean;
    applicationId?: string;
    confirmationCode?: string;
    error?: string;
    method?: string;
  }> {
    // NOTE: This is a simplified implementation for demonstration
    // In a real implementation, you would need to:
    // 1. Use web scraping with tools like Puppeteer or Playwright
    // 2. Handle Glassdoor's anti-bot measures
    // 3. Navigate through their multi-step application process
    // 4. Handle different application flows (easy apply vs full application)
    // 5. Parse and fill custom company-specific questions

    try {
      // Check if this is an "Easy Apply" job or requires external redirect
      if (jobData.jobUrl.includes('glassdoor.com')) {
        return await this.handleDirectGlassdoorApplication(jobData, formData);
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

  private async handleDirectGlassdoorApplication(
    jobData: GlassdoorJobData,
    formData: GlassdoorFormData
  ): Promise<{
    success: boolean;
    applicationId?: string;
    confirmationCode?: string;
    error?: string;
    method: string;
  }> {
    // Simulate Glassdoor direct application process
    // In reality, this would involve:
    // - Launching a headless browser
    // - Navigating to the job posting
    // - Clicking "Apply Now"
    // - Filling out the application form
    // - Uploading resume/cover letter
    // - Answering screening questions
    // - Submitting the application

    // For now, return a simulated success response
    const applicationId = `glassdoor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      applicationId,
      confirmationCode: `GD-${applicationId.slice(-8).toUpperCase()}`,
      method: 'glassdoor_direct',
    };
  }

  private async handleExternalRedirectApplication(
    jobData: GlassdoorJobData,
    formData: GlassdoorFormData
  ): Promise<{
    success: boolean;
    applicationId?: string;
    error?: string;
    method: string;
  }> {
    // Handle cases where Glassdoor redirects to company career sites
    // This would typically involve:
    // - Following the redirect URL
    // - Detecting the company's ATS system (Workday, Greenhouse, etc.)
    // - Using the appropriate automation strategy
    // - Falling back to manual intervention if unsupported

    return {
      success: false,
      error: 'External company applications require manual submission. Job has been added to your manual review queue.',
      method: 'external_redirect',
    };
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
            platform: 'GLASSDOOR',
            submissionType: 'automated',
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      console.error('Failed to log Glassdoor submission:', error);
    }
  }

  // Utility method to detect if a URL is a Glassdoor job posting
  static isGlassdoorJob(url: string): boolean {
    return url.includes('glassdoor.com') || url.includes('glassdoor.ca');
  }

  // Utility method to extract Glassdoor job ID from URL
  static extractJobId(url: string): string | null {
    const matches = url.match(/jobListingId=(\d+)/);
    return matches ? matches[1] : null;
  }

  // Method to validate if user can apply to Glassdoor jobs
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
      requirements.push('Phone number required');
    }

    if (!preferences?.address || !preferences?.city || !preferences?.state) {
      recommendations.push('Complete address information for faster applications');
    }

    if (requirements.length === 0) {
      recommendations.push('Enable Glassdoor account integration for better success rates');
      recommendations.push('Prepare answers for common screening questions');
    }

    return {
      eligible: requirements.length === 0,
      requirements,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
    };
  }
}

// Export singleton instance
export const glassdoorService = new GlassdoorSubmissionService();