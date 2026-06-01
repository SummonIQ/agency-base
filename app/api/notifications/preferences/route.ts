import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiErrorHandling, requireAuth } from '@/lib/errors/api';
import {
  getUserNotificationPreferences,
  updateNotificationPreferences,
} from '@/lib/notifications';
import { NotificationFrequency } from '@/lib/notifications/types';

/**
 * GET handler for retrieving user notification preferences
 */
const handleGET = async (request: NextRequest): Promise<NextResponse> => {
  const user = requireAuth(await request.json());
  
  const preferences = await getUserNotificationPreferences(user.id);
  
  return NextResponse.json({
    success: true,
    data: preferences
  });
};

const timePattern = /^\d{2}:\d{2}$/;

const updatePreferencesSchema = z.object({
  applicationStatusEnabled: z.boolean().optional(),
  interviewRequestsEnabled: z.boolean().optional(),
  networkingRemindersEnabled: z.boolean().optional(),
  shareNotificationsEnabled: z.boolean().optional(),
  resumeFeedbackEnabled: z.boolean().optional(),
  automationEnabled: z.boolean().optional(),
  jobSearchEnabled: z.boolean().optional(),
  resumeAnalysisEnabled: z.boolean().optional(),
  systemNotificationsEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  inAppEnabled: z.boolean().optional(),
  browserEnabled: z.boolean().optional(),
  notificationFrequency: z.nativeEnum(NotificationFrequency).optional(),
  batchWindowMinutes: z.number().int().min(5).max(60).optional(),
  quietHoursEnabled: z.boolean().optional(),
  quietHoursStart: z.string().regex(timePattern).nullable().optional(),
  quietHoursEnd: z.string().regex(timePattern).nullable().optional(),
  dailyDigestEnabled: z.boolean().optional(),
  dailyDigestHour: z.number().int().min(0).max(23).nullable().optional(),
  weeklyDigestEnabled: z.boolean().optional(),
  weeklyDigestDay: z.number().int().min(0).max(6).nullable().optional(),
  weeklyDigestHour: z.number().int().min(0).max(23).nullable().optional(),
});

/**
 * PUT handler for updating notification preferences
 */
const handlePUT = async (request: NextRequest): Promise<NextResponse> => {
  const user = requireAuth(await request.json());
  const body = await request.json();
  
  const validation = updatePreferencesSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { success: false, message: 'Invalid request data', errors: validation.error.format() },
      { status: 400 }
    );
  }
  
  const updatedPreferences = await updateNotificationPreferences(user.id, body);
  
  return NextResponse.json({
    success: true,
    data: updatedPreferences,
    message: 'Notification preferences updated'
  });
};

export const GET = withApiErrorHandling(handleGET);
export const PUT = withApiErrorHandling(handlePUT);
