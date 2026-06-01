import { SubmissionProvider, SubmissionParams, SubmissionResult } from './index';
import { db } from '@/lib/db';
import { ApplicationStatus } from '@prisma/client';

interface AngelListJobData {
  jobId: string;
  title: string;
  company: string;
  location: string;
  jobUrl: string;
  angelListId?: string;
  isStartup?: boolean;
}

interface AngelListFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location: string;
  resumeText?: string;
  coverLetter?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  personalWebsite?: string;
  expectedSalary?: string;
  equityInterest?: boolean;
  remoteWork?: boolean;
  willingToRelocate?: boolean;
  workAuthorization?: string;
  availableStartDate?: string;
  startupExperience?: string;
  motivationLetter?: string;
  skills: string[];
  industries: string[];
}

export class AngelListSubmissionService implements SubmissionProvider {
  async submitApplication(params: SubmissionParams): Promise<SubmissionResult> {
    try {
      const { jobId, jobUrl, resumeData, coverLetterData, customFields } = params;
      
      // Validate required parameters
      if (!jobId) {
        throw new Error('Job ID is required for AngelList submissions');
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
      const jobData: AngelListJobData = {
        jobId: jobLead.id,
        title: jobLead.jobTitle,
        company: jobLead.companyName,
        location: jobLead.location || '',
        jobUrl: jobLead.jobListing?.externalUrl || jobUrl || '',
        angelListId: this.extractAngelListId(jobLead.jobListing?.externalUrl || jobUrl || ''),
        isStartup: this.isStartupJob(jobLead.companyName, jobLead.jobTitle),
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

      // Attempt to apply to AngelList/Wellfound
      const applicationResult = await this.submitToAngelList(jobData, formData);

      // Log the submission
      await this.logSubmission(jobLead.id, jobLead.userId, applicationResult);

      return {
        success: applicationResult.success,
        applicationId: applicationResult.applicationId,
        confirmationCode: applicationResult.confirmationCode,
        error: applicationResult.error,
        metadata: {
          provider: 'ANGELLIST',
          jobTitle: jobData.title,
          company: jobData.company,
          submissionMethod: applicationResult.method || 'direct',
          isStartup: jobData.isStartup,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('AngelList submission error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during AngelList submission',
        metadata: {
          provider: 'ANGELLIST',
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
        linkedinProfile: true,
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
      location: (user.preferences as any)?.location || '',
      portfolioUrl: (user.preferences as any)?.portfolioUrl || '',
      githubUrl: (user.preferences as any)?.githubUrl || '',
      personalWebsite: (user.preferences as any)?.personalWebsite || '',
      linkedinUrl: user.linkedinProfile?.profileUrl || '',
      skills: user.linkedinProfile?.skills || [],
      industries: (user.preferences as any)?.industries || [],
    };
  }

  private async prepareFormData(
    userProfile: any,
    resumeData?: Buffer | string,
    coverLetterData?: Buffer | string,
    customFields?: Record<string, any>
  ): Promise<AngelListFormData> {
    return {
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      email: userProfile.email,
      phone: userProfile.phone,
      location: userProfile.location,
      resumeText: resumeData ? resumeData.toString() : undefined,
      coverLetter: coverLetterData ? coverLetterData.toString() : undefined,
      portfolioUrl: userProfile.portfolioUrl,
      linkedinUrl: userProfile.linkedinUrl,
      githubUrl: userProfile.githubUrl,
      personalWebsite: userProfile.personalWebsite,
      expectedSalary: customFields?.expectedSalary || '',
      equityInterest: customFields?.equityInterest === 'true',
      remoteWork: customFields?.remoteWork === 'true',
      willingToRelocate: customFields?.willingToRelocate === 'true',
      workAuthorization: customFields?.workAuthorization || 'yes',
      availableStartDate: customFields?.availableStartDate || 'Immediately',
      startupExperience: customFields?.startupExperience || '',
      motivationLetter: customFields?.motivationLetter || '',
      skills: userProfile.skills || [],
      industries: userProfile.industries || [],
    };
  }

  private async submitToAngelList(
    jobData: AngelListJobData,
    formData: AngelListFormData
  ): Promise<{
    success: boolean;
    applicationId?: string;
    confirmationCode?: string;
    error?: string;
    method?: string;
  }> {
    try {
      // Check if this is an AngelList/Wellfound hosted job
      if (this.isAngelListJob(jobData.jobUrl)) {
        return await this.handleAngelListApplication(jobData, formData);
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

  private async handleAngelListApplication(
    jobData: AngelListJobData,
    formData: AngelListFormData
  ): Promise<{
    success: boolean;
    applicationId?: string;
    confirmationCode?: string;
    error?: string;
    method: string;
  }> {
    // Simulate AngelList/Wellfound application process
    // In reality, this would involve:
    // - Launching a headless browser
    // - Navigating to the job posting on AngelList/Wellfound
    // - Logging in or creating account if needed
    // - Clicking "Apply" button
    // - Filling out startup-specific application form
    // - Answering questions about equity, remote work, startup experience
    // - Uploading portfolio/GitHub links
    // - Submitting application

    // AngelList/Wellfound-specific considerations:
    // - Startup culture fit questions
    // - Equity vs salary preferences
    // - Remote work preferences
    // - Portfolio and GitHub integration
    // - Founder/startup experience questions
    // - Mission alignment questions

    const applicationId = `angel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check for startup-specific requirements
    if (jobData.isStartup && !formData.startupExperience) {
      return {
        success: false,
        error: 'Startup experience information required for this position',
        method: 'angellist_direct',
      };
    }

    // Simulate success for demonstration
    return {
      success: true,
      applicationId,
      confirmationCode: `AL-${applicationId.slice(-8).toUpperCase()}`,
      method: 'angellist_direct',
    };
  }

  private async handleExternalRedirectApplication(
    jobData: AngelListJobData,
    formData: AngelListFormData
  ): Promise<{
    success: boolean;
    applicationId?: string;
    error?: string;
    method: string;
  }> {
    // Handle external applications (often startup career pages)
    return {
      success: false,
      error: 'External startup applications require manual submission. Job has been added to your manual review queue.',
      method: 'external_redirect',
    };
  }

  private extractAngelListId(url: string): string | null {
    // Extract AngelList job ID from various URL formats
    const patterns = [
      /wellfound\.com\/l\/(\w+)/,           // Wellfound job link
      /angel\.co\/company\/[^\/]+\/jobs\/(\d+)/, // Old AngelList format
      /wellfound\.com\/company\/[^\/]+\/jobs\/(\d+)/, // New Wellfound format
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  }

  private isAngelListJob(url: string): boolean {
    return url.includes('wellfound.com') || url.includes('angel.co');
  }

  private isStartupJob(company: string, title: string): boolean {
    // Heuristics to determine if this is a startup position
    const startupIndicators = [
      'startup', 'founder', 'early-stage', 'seed', 'series a',
      'equity', 'stock options', 'unicorn', 'disrupt'
    ];
    
    const combinedText = `${company} ${title}`.toLowerCase();
    return startupIndicators.some(indicator => combinedText.includes(indicator));
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
            platform: 'ANGELLIST',
            submissionType: 'automated',
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      console.error('Failed to log AngelList submission:', error);
    }
  }

  // Static utility methods
  static isAngelListJob(url: string): boolean {
    return url.includes('wellfound.com') || url.includes('angel.co');
  }

  static extractJobId(url: string): string | null {
    const service = new AngelListSubmissionService();
    return service.extractAngelListId(url);
  }

  // Method to validate user eligibility for AngelList applications
  async validateUserEligibility(userId: string): Promise<{
    eligible: boolean;
    requirements: string[];
    recommendations?: string[];
  }> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { preferences: true, linkedinProfile: true },
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
    if (!preferences?.location) {
      requirements.push('Location information required');
    }

    if (requirements.length === 0) {
      if (!preferences?.portfolioUrl && !preferences?.githubUrl) {
        recommendations.push('Add portfolio or GitHub URL for better startup applications');
      }
      
      if (!user.linkedinProfile?.skills || user.linkedinProfile.skills.length === 0) {
        recommendations.push('Add skills to improve job matching');
      }
      
      recommendations.push('Complete startup experience section for better matches');
      recommendations.push('Set equity vs salary preferences');
    }

    return {
      eligible: requirements.length === 0,
      requirements,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
    };
  }

  // Method to get startup-specific readiness score
  async getStartupReadinessScore(userId: string): Promise<{
    score: number;
    factors: Array<{ factor: string; present: boolean; weight: number }>;
    recommendations: string[];
  }> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { preferences: true, linkedinProfile: true },
    });

    const preferences = user?.preferences as any;
    const factors = [
      { factor: 'Portfolio/GitHub', present: !!(preferences?.portfolioUrl || preferences?.githubUrl), weight: 25 },
      { factor: 'Startup Experience', present: !!preferences?.startupExperience, weight: 20 },
      { factor: 'Technical Skills', present: !!(user?.linkedinProfile?.skills?.length > 0), weight: 20 },
      { factor: 'Remote Work Setup', present: !!preferences?.remoteWork, weight: 15 },
      { factor: 'Equity Preferences', present: !!preferences?.equityInterest, weight: 10 },
      { factor: 'LinkedIn Profile', present: !!user?.linkedinProfile, weight: 10 },
    ];

    const score = factors.reduce((total, factor) => 
      total + (factor.present ? factor.weight : 0), 0
    );

    const recommendations = factors
      .filter(factor => !factor.present)
      .map(factor => {
        switch (factor.factor) {
          case 'Portfolio/GitHub':
            return 'Add portfolio website or GitHub profile';
          case 'Startup Experience':
            return 'Describe any startup or entrepreneurial experience';
          case 'Technical Skills':
            return 'List technical skills relevant to startups';
          case 'Remote Work Setup':
            return 'Specify remote work capabilities and preferences';
          case 'Equity Preferences':
            return 'Set preferences for equity compensation';
          case 'LinkedIn Profile':
            return 'Connect your LinkedIn profile for better matching';
          default:
            return `Complete ${factor.factor} information`;
        }
      });

    return { score, factors, recommendations };
  }
}

// Export singleton instance
export const angelListService = new AngelListSubmissionService();