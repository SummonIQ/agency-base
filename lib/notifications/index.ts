import { db } from '@/lib/db';
import {
  NotificationChannel,
  NotificationCategory,
  NotificationFrequency,
  NotificationPriority,
  NotificationStatus,
  type Notification as NotificationModel,
  type Prisma,
} from '@prisma/client';
import {
  ApplicationStatusNotificationMetadata,
  AutomationNotificationMetadata,
  BaseNotification,
  DEFAULT_NOTIFICATION_PREFERENCES,
  InterviewRequestNotificationMetadata,
  JobSearchCompletionNotificationMetadata,
  NotificationPreferences,
  ResumeAnalysisNotificationMetadata,
} from './types';
import { AppError, ErrorCode } from '@/lib/errors';
import { sendEvent } from '@/lib/events/send';
import { EventType } from '@/types/events';
import { addDays, addMinutes, isAfter, isWithinInterval, set } from 'date-fns';

const DEFAULT_BATCH_WINDOW_MINUTES = 15;
const DIGEST_MAX_ITEMS = 5;

type NotificationCreateData = Prisma.NotificationCreateInput;

interface CreateOptions {
  respectPreferences?: boolean;
}

function parseTimeString(value: string | null): { hours: number; minutes: number } | null {
  if (!value) return null;
  const [hoursRaw, minutesRaw] = value.split(':');
  const hours = Number.parseInt(hoursRaw ?? '', 10);
  const minutes = Number.parseInt(minutesRaw ?? '', 10);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return { hours: Math.max(0, Math.min(23, hours)), minutes: Math.max(0, Math.min(59, minutes)) };
}

function getQuietHoursWindow(preferences: NotificationPreferences, reference: Date): { start: Date; end: Date } | null {
  if (!preferences.quietHoursEnabled) return null;
  const startTime = parseTimeString(preferences.quietHoursStart);
  const endTime = parseTimeString(preferences.quietHoursEnd);
  if (!startTime || !endTime) return null;

  let start = set(reference, {
    hours: startTime.hours,
    minutes: startTime.minutes,
    seconds: 0,
    milliseconds: 0,
  });
  let end = set(reference, {
    hours: endTime.hours,
    minutes: endTime.minutes,
    seconds: 0,
    milliseconds: 0,
  });

  if (end <= start) {
    // Quiet hours wrap across midnight
    if (reference >= start) {
      end = addDays(end, 1);
    } else {
      start = addDays(start, -1);
    }
  }

  return { start, end };
}

function isWithinQuietHours(preferences: NotificationPreferences, reference: Date): boolean {
  const window = getQuietHoursWindow(preferences, reference);
  if (!window) return false;
  return isWithinInterval(reference, window);
}

function getNextQuietHoursEnd(preferences: NotificationPreferences, reference: Date): Date | null {
  const window = getQuietHoursWindow(preferences, reference);
  if (!window) return null;
  if (isWithinInterval(reference, window)) {
    return window.end;
  }
  if (reference < window.start) {
    return window.start;
  }
  const nextWindow = getQuietHoursWindow(preferences, addDays(reference, 1));
  return nextWindow?.end ?? null;
}

function resolveChannels(
  requested: NotificationChannel[] | undefined,
  preferences: NotificationPreferences | null,
  respectPreferences: boolean,
): NotificationChannel[] {
  const channels = new Set<NotificationChannel>(requested?.length ? requested : [NotificationChannel.IN_APP]);

  if (!respectPreferences || !preferences) {
    return Array.from(channels);
  }

  if (!preferences.inAppEnabled) {
    channels.delete(NotificationChannel.IN_APP);
  }
  if (!preferences.browserEnabled) {
    channels.delete(NotificationChannel.BROWSER);
  }
  if (!preferences.emailEnabled) {
    channels.delete(NotificationChannel.EMAIL);
  }

  return Array.from(channels);
}

async function ensureRecipientEmail(
  userId: string | undefined,
  channels: NotificationChannel[],
  fallbackEmail: string | null | undefined,
): Promise<{ channels: NotificationChannel[]; email: string | null }>
{ // Ensure we only send email if we have an address
  if (!channels.includes(NotificationChannel.EMAIL)) {
    return { channels, email: fallbackEmail ?? null };
  }

  if (fallbackEmail) {
    return { channels, email: fallbackEmail };
  }

  if (!userId) {
    // No user to derive email from, drop channel
    return {
      channels: channels.filter(channel => channel !== NotificationChannel.EMAIL),
      email: null,
    };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (user?.email) {
    return { channels, email: user.email };
  }

  return {
    channels: channels.filter(channel => channel !== NotificationChannel.EMAIL),
    email: null,
  };
}

function shouldSkipForMinimal(preferences: NotificationPreferences | null, priority: NotificationPriority, respectPreferences: boolean): boolean {
  if (!respectPreferences || !preferences) {
    return false;
  }
  if (preferences.notificationFrequency !== NotificationFrequency.MINIMAL) {
    return false;
  }
  return priority < NotificationPriority.HIGH;
}

function shouldBatch(preferences: NotificationPreferences | null, priority: NotificationPriority, respectPreferences: boolean): boolean {
  if (!respectPreferences || !preferences) {
    return false;
  }
  if (priority >= NotificationPriority.URGENT) {
    return false;
  }
  return preferences.notificationFrequency === NotificationFrequency.BATCHED;
}

async function findExistingBatch(
  userId: string,
  lookaheadMinutes: number,
  reference: Date,
): Promise<Pick<NotificationModel, 'batchId' | 'scheduledFor'> | null> {
  const existing = await db.notification.findFirst({
    where: {
      userId,
      status: NotificationStatus.PENDING,
      scheduledFor: {
        gte: reference,
        lte: addMinutes(reference, lookaheadMinutes),
      },
      batchId: { not: null },
    },
    orderBy: { scheduledFor: 'asc' },
    select: { batchId: true, scheduledFor: true },
  });
  return existing ?? null;
}

function buildToastVariant(priority: NotificationPriority): 'default' | 'destructive' | 'success' | 'warning' | 'info' {
  switch (priority) {
    case NotificationPriority.URGENT:
      return 'destructive';
    case NotificationPriority.HIGH:
      return 'warning';
    case NotificationPriority.LOW:
      return 'info';
    default:
      return 'default';
  }
}

async function deliverNotification(record: NotificationModel): Promise<void> {
  const now = new Date();
  const channels = record.channels ?? [];

  if (channels.includes(NotificationChannel.IN_APP) || channels.includes(NotificationChannel.BROWSER)) {
    await sendEvent({
      channel: `user-${record.userId}`,
      type: EventType.Notification,
      payload: {
        title: record.title,
        description: record.content,
        type: buildToastVariant(record.priority),
        actionUrl: (record.metadata as any)?.link ?? '/notifications',
        actionText: (record.metadata as any)?.actionText ?? 'View',
      },
    });
  }

  if (channels.includes(NotificationChannel.EMAIL) && record.recipientEmail) {
    // Placeholder for actual email integration. Log for developers to swap with real provider.
    console.log(`Email notification -> ${record.recipientEmail}: ${record.title}`);
  }

  await db.notification.update({
    where: { id: record.id },
    data: {
      status: NotificationStatus.SENT,
      deliveredAt: now,
    },
  });
}

async function deliverDigest(
  userId: string,
  notifications: NotificationModel[],
  preferences: NotificationPreferences,
): Promise<void> {
  if (notifications.length === 0) return;
  const now = new Date();
  const digestChannels = notifications.reduce<Set<NotificationChannel>>((set, notification) => {
    notification.channels.forEach(channel => set.add(channel));
    return set;
  }, new Set());

  const summaryLines = notifications
    .slice(0, DIGEST_MAX_ITEMS)
    .map(notification => `• ${notification.title}`);

  const payload = {
    title: `You have ${notifications.length} new updates`,
    description: summaryLines.join('\n') || 'New activity in your job search workspace.',
    type: buildToastVariant(NotificationPriority.HIGH),
    actionUrl: '/notifications',
    actionText: 'View all',
  };

  if (digestChannels.has(NotificationChannel.IN_APP) || digestChannels.has(NotificationChannel.BROWSER)) {
    await sendEvent({
      channel: `user-${userId}`,
      type: EventType.Notification,
      payload,
    });
  }

  if (digestChannels.has(NotificationChannel.EMAIL)) {
    const recipient = notifications.find(notification => notification.recipientEmail)?.recipientEmail;
    if (recipient) {
      console.log(`Email digest -> ${recipient}: ${payload.title}\n${payload.description}`);
    }
  }

  const ids = notifications.map(notification => notification.id);
  await db.notification.updateMany({
    where: { id: { in: ids } },
    data: {
      status: NotificationStatus.SENT,
      deliveredAt: now,
    },
  });
}

export async function processPendingNotifications(limit = 50): Promise<number> {
  const now = new Date();
  const pending = await db.notification.findMany({
    where: {
      status: NotificationStatus.PENDING,
      scheduledFor: { lte: now },
    },
    orderBy: { scheduledFor: 'asc' },
    take: limit,
  });

  if (pending.length === 0) {
    return 0;
  }

  const grouped = new Map<string, NotificationModel[]>();
  for (const notification of pending) {
    const list = grouped.get(notification.userId) ?? [];
    list.push(notification);
    grouped.set(notification.userId, list);
  }

  for (const [userId, notifications] of grouped) {
    const preferences = await getUserNotificationPreferences(userId);
    if (preferences.notificationFrequency === NotificationFrequency.BATCHED && notifications.length > 1) {
      await deliverDigest(userId, notifications, preferences);
    } else {
      for (const notification of notifications) {
        await deliverNotification(notification);
      }
    }
  }

  return pending.length;
}

export async function createNotification(
  notification: BaseNotification,
  options: CreateOptions = {},
) {
  const now = new Date();
  const respectPreferences = options.respectPreferences ?? true;
  const userId = notification.userId ?? null;

  let preferences: NotificationPreferences | null = null;
  if (userId && respectPreferences) {
    preferences = await getUserNotificationPreferences(userId);
  }

  const priority = notification.priority ?? NotificationPriority.MEDIUM;
  const category = notification.category ?? NotificationCategory.SYSTEM;

  if (shouldSkipForMinimal(preferences, priority, respectPreferences)) {
    return null;
  }

  let channels = resolveChannels(notification.channels, preferences, respectPreferences);
  let recipientEmail: string | null = null;

  if (userId) {
    const ensured = await ensureRecipientEmail(userId, channels, notification.recipientEmail);
    channels = ensured.channels;
    recipientEmail = ensured.email;
  } else if (notification.recipientEmail) {
    recipientEmail = notification.recipientEmail;
    channels = channels.filter(channel => channel !== NotificationChannel.IN_APP);
  }

  if (respectPreferences && (!channels.length && !recipientEmail)) {
    return null;
  }

  let scheduledFor: Date | null = notification.scheduledFor ?? null;
  let batchId: string | null = notification.batchId ?? null;
  let queueForLater = Boolean(scheduledFor);

  if (!queueForLater && preferences) {
    const quietHoursEnd = getNextQuietHoursEnd(preferences, now);
    if (quietHoursEnd && isWithinQuietHours(preferences, now) && priority < NotificationPriority.URGENT) {
      scheduledFor = quietHoursEnd;
      queueForLater = true;
    }
  }

  if (!queueForLater && shouldBatch(preferences, priority, respectPreferences) && userId) {
    const windowMinutes = preferences?.batchWindowMinutes || DEFAULT_BATCH_WINDOW_MINUTES;
    const existingBatch = await findExistingBatch(userId, windowMinutes, now);
    if (existingBatch?.scheduledFor) {
      scheduledFor = existingBatch.scheduledFor;
      batchId = existingBatch.batchId ?? batchId ?? `batch-${userId}-${Math.floor(existingBatch.scheduledFor.getTime() / 1000)}`;
    } else {
      scheduledFor = addMinutes(now, windowMinutes);
      batchId = batchId ?? `batch-${userId}-${Math.floor(now.getTime() / 1000)}`;
    }
    queueForLater = true;
  }

  const data: NotificationCreateData = {
    userId: notification.userId ?? '',
    recipientEmail,
    type: notification.type,
    title: notification.title,
    content: notification.content,
    status: NotificationStatus.PENDING,
    priority,
    category,
    channels,
    metadata: notification.metadata ?? {},
    batchId,
    scheduledFor,
  };

  if (!data.userId) {
    throw new AppError({
      code: ErrorCode.BAD_REQUEST,
      message: 'Notifications require an associated userId',
    });
  }

  const created = await db.notification.create({ data });

  if (!queueForLater) {
    await deliverNotification(created);
  }

  return created;
}

export async function markNotificationAsRead(id: string, userId: string) {
  const notification = await db.notification.findUnique({ where: { id } });

  if (!notification) {
    throw new AppError({
      code: ErrorCode.NOT_FOUND,
      message: 'Notification not found',
    });
  }

  if (notification.userId !== userId) {
    throw new AppError({
      code: ErrorCode.UNAUTHORIZED,
      message: 'Not authorized to update this notification',
    });
  }

  return db.notification.update({
    where: { id },
    data: {
      status: NotificationStatus.READ,
      readAt: new Date(),
    },
  });
}

export async function getUserNotifications(
  userId: string,
  options?: { limit?: number; offset?: number; includeRead?: boolean },
) {
  const { limit = 20, offset = 0, includeRead = false } = options ?? {};

  const where = {
    userId,
    ...(includeRead ? {} : { status: { not: NotificationStatus.READ } }),
  } satisfies Prisma.NotificationWhereInput;

  const [notifications, totalCount] = await Promise.all([
    db.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    db.notification.count({ where }),
  ]);

  return {
    notifications,
    totalCount,
    hasMore: offset + limit < totalCount,
  };
}

export async function getUserNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  const preferences = await db.notificationPreference.findUnique({ where: { userId } });
  if (preferences) {
    return preferences;
  }

  return db.notificationPreference.create({
    data: {
      userId,
      ...DEFAULT_NOTIFICATION_PREFERENCES,
    },
  });
}

export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<Omit<NotificationPreferences, 'userId'>>,
): Promise<NotificationPreferences> {
  await getUserNotificationPreferences(userId);

  const data = { ...preferences };

  if (typeof data.batchWindowMinutes === 'number') {
    data.batchWindowMinutes = Math.max(5, Math.min(60, data.batchWindowMinutes));
  }

  return db.notificationPreference.update({
    where: { userId },
    data,
  });
}

export async function createApplicationStatusNotification(
  userId: string,
  metadata: ApplicationStatusNotificationMetadata,
) {
  const title = `Application Status Updated: ${metadata.jobTitle}`;
  const content = `Your application for ${metadata.jobTitle} at ${metadata.companyName} moved from ${metadata.previousStatus} to ${metadata.newStatus}.`;

  return createNotification({
    userId,
    type: `APPLICATION_STATUS_${metadata.newStatus}`,
    title,
    content,
    metadata,
    category: NotificationCategory.APPLICATION_STATUS,
    priority: NotificationPriority.HIGH,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.BROWSER],
    status: NotificationStatus.PENDING,
  });
}

export async function createInterviewRequestNotification(
  userId: string,
  metadata: InterviewRequestNotificationMetadata,
) {
  const interviewDetails = metadata.interviewDate ? ` scheduled for ${metadata.interviewDate}` : '';
  const title = `Interview Request: ${metadata.jobTitle}`;
  const content = `You have an interview request for ${metadata.jobTitle} at ${metadata.companyName}${interviewDetails}.`;

  return createNotification({
    userId,
    type: 'INTERVIEW_REQUEST',
    title,
    content,
    metadata,
    category: NotificationCategory.INTERVIEW_REQUEST,
    priority: NotificationPriority.URGENT,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.BROWSER],
    status: NotificationStatus.PENDING,
  });
}

export async function createJobSearchCompletionNotification(
  userId: string,
  metadata: JobSearchCompletionNotificationMetadata,
) {
  let title: string;
  let content: string;
  let priority = NotificationPriority.MEDIUM;

  if (metadata.status === 'completed') {
    title = `Job Search Complete: ${metadata.searchQuery}`;
    content = `Found ${metadata.jobsFound} jobs on ${metadata.platform}. ${metadata.newJobsAdded} new leads added.`;
    priority = NotificationPriority.HIGH;
  } else if (metadata.status === 'failed') {
    title = `Job Search Failed: ${metadata.searchQuery}`;
    content = metadata.errorMessage
      ? `Search on ${metadata.platform} failed: ${metadata.errorMessage}`
      : `Search on ${metadata.platform} failed. Please try again.`;
    priority = NotificationPriority.URGENT;
  } else {
    title = `Job Search Partial Results: ${metadata.searchQuery}`;
    content = `Search on ${metadata.platform} partially succeeded. ${metadata.jobsFound} jobs retrieved.`;
  }

  return createNotification({
    userId,
    type: `JOB_SEARCH_${metadata.status.toUpperCase()}`,
    title,
    content,
    metadata,
    category: NotificationCategory.JOB_SEARCH,
    priority,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    status: NotificationStatus.PENDING,
  });
}

export async function createResumeAnalysisNotification(
  userId: string,
  metadata: ResumeAnalysisNotificationMetadata,
) {
  const analysisName = metadata.analysisType === 'ats'
    ? 'ATS Analysis'
    : metadata.analysisType === 'keyword'
      ? 'Keyword Analysis'
      : 'Resume Optimization';

  const title = `${analysisName}: ${metadata.resumeName}`;
  const content = metadata.status === 'completed'
    ? `Analysis finished with ${metadata.suggestions} suggestions${
        metadata.score !== undefined ? ` and a score of ${metadata.score}%` : ''
      }.`
    : metadata.errorMessage
      ? `Analysis failed: ${metadata.errorMessage}`
      : 'We were unable to complete the analysis. Please retry later.';

  const priority = metadata.status === 'completed'
    ? NotificationPriority.MEDIUM
    : NotificationPriority.HIGH;

  return createNotification({
    userId,
    type: `RESUME_ANALYSIS_${metadata.status.toUpperCase()}`,
    title,
    content,
    metadata,
    category: NotificationCategory.RESUME_ANALYSIS,
    priority,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    status: NotificationStatus.PENDING,
  });
}

export async function createAutomationNotification(
  userId: string,
  metadata: AutomationNotificationMetadata,
) {
  const automationName = metadata.automationType === 'application_submission'
    ? 'Application submissions'
    : metadata.automationType === 'job_search'
      ? 'Job search automation'
      : 'Resume automation';

  let title: string;
  let content: string;
  let priority = NotificationPriority.MEDIUM;

  switch (metadata.status) {
    case 'completed':
      title = `${automationName} complete`;
      content = `Processed ${metadata.itemsProcessed} items with ${metadata.successCount} successes and ${metadata.failureCount} failures.`;
      priority = NotificationPriority.HIGH;
      break;
    case 'failed':
      title = `${automationName} failed`;
      content = metadata.errorMessage
        ? `${metadata.errorMessage} (${metadata.itemsProcessed}/${metadata.totalItems} items processed).`
        : `Automation failed after processing ${metadata.itemsProcessed} of ${metadata.totalItems} items.`;
      priority = NotificationPriority.URGENT;
      break;
    case 'paused':
      title = `${automationName} paused`;
      content = `Automation paused with ${metadata.itemsProcessed}/${metadata.totalItems} items processed.`;
      priority = NotificationPriority.HIGH;
      break;
    default:
      title = `${automationName} started`;
      content = `Processing ${metadata.totalItems} items automatically.`;
      break;
  }

  return createNotification({
    userId,
    type: `AUTOMATION_${metadata.status.toUpperCase()}`,
    title,
    content,
    metadata,
    category: NotificationCategory.AUTOMATION,
    priority,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    status: NotificationStatus.PENDING,
  });
}
