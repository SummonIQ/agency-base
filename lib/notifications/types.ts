import { Prisma, NotificationPriority, NotificationStatus, NotificationCategory, NotificationChannel, NotificationFrequency } from '@prisma/client';

export { NotificationPriority, NotificationStatus, NotificationCategory, NotificationChannel, NotificationFrequency };

/**
 * Base notification data
 */
export interface BaseNotification {
  id?: string;
  userId?: string | null;
  recipientEmail?: string | null;
  type: string;
  title: string;
  content: string;
  status?: NotificationStatus;
  metadata?: Prisma.JsonValue;
  priority?: NotificationPriority;
  category?: NotificationCategory;
  channels?: NotificationChannel[];
  createdAt?: Date;
  readAt?: Date | null;
  expiresAt?: Date | null;
  scheduledFor?: Date | null;
  deliveredAt?: Date | null;
  batchId?: string | null;
}

/**
 * Application status notification metadata
 */
export interface ApplicationStatusNotificationMetadata {
  jobLeadId: string;
  jobTitle: string;
  companyName: string;
  previousStatus: string;
  newStatus: string;
  applicationId: string;
}

/**
 * Interview request notification metadata
 */
export interface InterviewRequestNotificationMetadata {
  jobLeadId: string;
  jobTitle: string;
  companyName: string;
  interviewDate?: string;
  interviewType?: string;
  interviewLocation?: string;
  contactPerson?: string;
}

/**
 * Job search completion notification metadata
 */
export interface JobSearchCompletionNotificationMetadata {
  searchId: string;
  searchQuery: string;
  jobsFound: number;
  newJobsAdded: number;
  platform: string;
  duration: number; // in seconds
  status: 'completed' | 'failed' | 'partial';
  errorMessage?: string;
}

/**
 * Resume analysis completion notification metadata
 */
export interface ResumeAnalysisNotificationMetadata {
  resumeId: string;
  resumeName: string;
  analysisType: 'ats' | 'keyword' | 'optimization';
  score?: number;
  suggestions: number;
  status: 'completed' | 'failed';
  errorMessage?: string;
}

/**
 * Automation event notification metadata
 */
export interface AutomationNotificationMetadata {
  automationType: 'application_submission' | 'job_search' | 'resume_analysis';
  status: 'started' | 'completed' | 'failed' | 'paused';
  itemsProcessed: number;
  totalItems: number;
  successCount: number;
  failureCount: number;
  duration?: number; // in seconds
  errorMessage?: string;
}

/**
 * User notification preferences
 */
export interface NotificationPreferences {
  userId: string;
  applicationStatusEnabled: boolean;
  interviewRequestsEnabled: boolean;
  networkingRemindersEnabled: boolean;
  shareNotificationsEnabled: boolean;
  resumeFeedbackEnabled: boolean;
  automationEnabled: boolean;
  jobSearchEnabled: boolean;
  resumeAnalysisEnabled: boolean;
  systemNotificationsEnabled: boolean;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  browserEnabled: boolean;
  notificationFrequency: NotificationFrequency;
  quietHoursEnabled: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  dailyDigestEnabled: boolean;
  dailyDigestHour: number | null;
  weeklyDigestEnabled: boolean;
  weeklyDigestDay: number | null;
  weeklyDigestHour: number | null;
  batchWindowMinutes: number;
}

/**
 * Default notification preferences
 */
export const DEFAULT_NOTIFICATION_PREFERENCES: Omit<NotificationPreferences, 'userId'> = {
  applicationStatusEnabled: true,
  interviewRequestsEnabled: true,
  networkingRemindersEnabled: true,
  shareNotificationsEnabled: true,
  resumeFeedbackEnabled: true,
  automationEnabled: true,
  jobSearchEnabled: true,
  resumeAnalysisEnabled: true,
  systemNotificationsEnabled: true,
  emailEnabled: true,
  inAppEnabled: true,
  browserEnabled: true,
  notificationFrequency: NotificationFrequency.IMMEDIATE,
  quietHoursEnabled: false,
  quietHoursStart: null,
  quietHoursEnd: null,
  dailyDigestEnabled: false,
  dailyDigestHour: null,
  weeklyDigestEnabled: false,
  weeklyDigestDay: null,
  weeklyDigestHour: null,
  batchWindowMinutes: 15
};
