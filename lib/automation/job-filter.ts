import { db } from '@/lib/db';
import { JobLead } from '@prisma/client';

interface FilterResult {
  allowed: boolean;
  reason?: string;
  matchedRule?: string;
}

export class JobAutomationFilter {
  private settings: any;
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async initialize() {
    this.settings = await db.automationSettings.findUnique({
      where: { userId: this.userId },
    });
    
    if (!this.settings) {
      throw new Error('Automation settings not found');
    }
  }

  async shouldApplyToJob(job: JobLead): Promise<FilterResult> {
    if (!this.settings) {
      await this.initialize();
    }

    // Check if automation is enabled
    if (!this.settings.isEnabled || this.settings.isPaused) {
      return {
        allowed: false,
        reason: this.settings.isPaused ? 'Automation is paused' : 'Automation is disabled',
      };
    }

    // Check company blacklist
    if (this.settings.enableCompanyBlacklist && job.companyName) {
      const isBlacklisted = this.settings.companyBlacklist.some(
        (company: string) => company.toLowerCase() === job.companyName?.toLowerCase()
      );
      
      if (isBlacklisted) {
        await this.logFilterAction(job, 'company_blacklist', false);
        return {
          allowed: false,
          reason: 'Company is blacklisted',
          matchedRule: `Company blacklist: ${job.companyName}`,
        };
      }
    }

    // Check keyword blacklist
    if (this.settings.enableKeywordBlacklist && job.description) {
      const matchedKeyword = this.settings.keywordBlacklist.find(
        (keyword: string) => 
          job.description?.toLowerCase().includes(keyword.toLowerCase()) ||
          job.title.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (matchedKeyword) {
        await this.logFilterAction(job, 'keyword_blacklist', false);
        return {
          allowed: false,
          reason: 'Job contains blacklisted keywords',
          matchedRule: `Keyword blacklist: ${matchedKeyword}`,
        };
      }
    }

    // Check salary threshold
    if (this.settings.enableSalaryThreshold && job.salaryMax) {
      if (job.salaryMax < this.settings.minSalaryThreshold) {
        await this.logFilterAction(job, 'salary_threshold', false);
        return {
          allowed: false,
          reason: 'Salary below minimum threshold',
          matchedRule: `Minimum salary: $${this.settings.minSalaryThreshold}`,
        };
      }
    }

    // Check duplicate applications
    if (this.settings.preventDuplicateApplications) {
      const existingApplication = await db.applicationSubmission.findFirst({
        where: {
          userId: this.userId,
          jobLead: {
            companyName: job.companyName,
            title: job.title,
          },
          status: {
            notIn: ['FAILED', 'WITHDRAWN'],
          },
        },
      });

      if (existingApplication) {
        await this.logFilterAction(job, 'duplicate_prevention', false);
        return {
          allowed: false,
          reason: 'Already applied to this position',
          matchedRule: 'Duplicate prevention',
        };
      }
    }

    // Check applications per company limit
    if (job.companyName) {
      const companyApplicationCount = await db.applicationSubmission.count({
        where: {
          userId: this.userId,
          jobLead: {
            companyName: job.companyName,
          },
          status: {
            notIn: ['FAILED', 'WITHDRAWN'],
          },
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      });

      if (companyApplicationCount >= this.settings.maxApplicationsPerCompany) {
        await this.logFilterAction(job, 'company_limit', false);
        return {
          allowed: false,
          reason: 'Reached application limit for this company',
          matchedRule: `Max ${this.settings.maxApplicationsPerCompany} applications per company`,
        };
      }
    }

    // All checks passed
    await this.logFilterAction(job, 'allowed', true);
    return {
      allowed: true,
    };
  }

  private async logFilterAction(job: JobLead, action: string, allowed: boolean) {
    await db.automationAuditLog.create({
      data: {
        userId: this.userId,
        action: allowed ? 'job_allowed' : 'job_blocked',
        actionType: allowed ? 'success' : 'blocked',
        jobLeadId: job.id,
        metadata: {
          jobTitle: job.title,
          company: job.companyName,
          blockReason: action,
        },
      },
    });
  }

  async checkRateLimits(): Promise<FilterResult> {
    if (!this.settings) {
      await this.initialize();
    }

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Check hourly limit
    const hourlyCount = await db.applicationSubmission.count({
      where: {
        userId: this.userId,
        wasAutomated: true,
        createdAt: {
          gte: oneHourAgo,
        },
      },
    });

    if (hourlyCount >= this.settings.applicationsPerHour) {
      return {
        allowed: false,
        reason: 'Hourly application limit reached',
        matchedRule: `Max ${this.settings.applicationsPerHour} applications per hour`,
      };
    }

    // Check daily limit
    const dailyCount = await db.applicationSubmission.count({
      where: {
        userId: this.userId,
        wasAutomated: true,
        createdAt: {
          gte: oneDayAgo,
        },
      },
    });

    if (dailyCount >= this.settings.applicationsPerDay) {
      return {
        allowed: false,
        reason: 'Daily application limit reached',
        matchedRule: `Max ${this.settings.applicationsPerDay} applications per day`,
      };
    }

    // Check minimum interval
    const lastApplication = await db.applicationSubmission.findFirst({
      where: {
        userId: this.userId,
        wasAutomated: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (lastApplication) {
      const timeSinceLastApplication = now.getTime() - lastApplication.createdAt.getTime();
      const minIntervalMs = this.settings.minIntervalMinutes * 60 * 1000;

      if (timeSinceLastApplication < minIntervalMs) {
        const waitTime = Math.ceil((minIntervalMs - timeSinceLastApplication) / 1000 / 60);
        return {
          allowed: false,
          reason: `Please wait ${waitTime} more minutes before next application`,
          matchedRule: `Minimum ${this.settings.minIntervalMinutes} minutes between applications`,
        };
      }
    }

    return {
      allowed: true,
    };
  }

  async checkConsecutiveFailures(): Promise<boolean> {
    if (!this.settings || !this.settings.pauseOnConsecutiveFailures) {
      return false;
    }

    const recentFailures = await db.applicationSubmission.findMany({
      where: {
        userId: this.userId,
        wasAutomated: true,
        status: 'FAILED',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: this.settings.consecutiveFailureThreshold,
    });

    if (recentFailures.length >= this.settings.consecutiveFailureThreshold) {
      // Check if all are consecutive (no successful submissions in between)
      const oldestFailure = recentFailures[recentFailures.length - 1];
      const successfulInBetween = await db.applicationSubmission.count({
        where: {
          userId: this.userId,
          wasAutomated: true,
          status: 'SUBMITTED',
          createdAt: {
            gte: oldestFailure.createdAt,
          },
        },
      });

      if (successfulInBetween === 0) {
        // Pause automation due to consecutive failures
        await db.automationSettings.update({
          where: { userId: this.userId },
          data: {
            isPaused: true,
            pausedAt: new Date(),
            pauseReason: `Paused due to ${this.settings.consecutiveFailureThreshold} consecutive failures`,
          },
        });

        await db.automationAuditLog.create({
          data: {
            userId: this.userId,
            action: 'automation_paused',
            actionType: 'error',
            metadata: {
              reason: 'consecutive_failures',
              failureCount: this.settings.consecutiveFailureThreshold,
            },
          },
        });

        return true;
      }
    }

    return false;
  }
}