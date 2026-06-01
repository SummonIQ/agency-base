import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import crypto from 'crypto';
import { createNotification } from '@/lib/notifications';
import { NotificationCategory, NotificationChannel, NotificationPriority } from '@/lib/notifications/types';

// Webhook secret for verification (should be in env vars)
const WEBHOOK_SECRET = process.env.AUTOMATION_WEBHOOK_SECRET || 'default-secret';

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const signature = headers().get('x-webhook-signature');
    const body = await request.text();
    
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(body)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const data = JSON.parse(body);
    const { type, userId, payload } = data;

    switch (type) {
      case 'error_threshold_exceeded':
        await handleErrorThreshold(userId, payload);
        break;
      
      case 'critical_error':
        await handleCriticalError(userId, payload);
        break;
      
      case 'automation_failure':
        await handleAutomationFailure(userId, payload);
        break;
      
      case 'performance_degradation':
        await handlePerformanceDegradation(userId, payload);
        break;
      
      default:
        console.log(`Unknown webhook type: ${type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleErrorThreshold(userId: string, payload: any) {
  const { errorCount, timeWindow, category } = payload;
  
  await createNotification({
    userId,
    type: 'automation_error_threshold',
    title: 'Error Threshold Exceeded',
    content: `${errorCount} ${category} errors in the last ${timeWindow}. Automation may be paused.`,
    metadata: payload,
    category: NotificationCategory.AUTOMATION,
    priority: NotificationPriority.HIGH,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
  });

  // Check if automation should be paused
  const settings = await db.automationSettings.findUnique({
    where: { userId },
  });

  if (settings?.pauseOnErrors && errorCount >= (settings.errorThreshold || 5)) {
    // Pause all scheduled applications
    await db.automationScheduledApplication.updateMany({
      where: {
        userId,
        status: 'scheduled',
      },
      data: {
        status: 'paused',
        metadata: {
          pausedReason: 'Error threshold exceeded',
          pausedAt: new Date(),
        },
      },
    });

    // Log the pause action
    await db.automationAuditLog.create({
      data: {
        userId,
        action: 'automation_paused',
        actionType: 'warning',
        metadata: {
          reason: 'Error threshold exceeded',
          errorCount,
          category,
          timeWindow,
        },
      },
    });
  }
}

async function handleCriticalError(userId: string, payload: any) {
  const { errorId, message, platform, jobTitle, company } = payload;
  
  // Create high-priority notification
  await createNotification({
    userId,
    type: 'critical_error',
    title: 'Critical Automation Error',
    content: `Critical error for ${jobTitle} at ${company}: ${message}`,
    metadata: payload,
    category: NotificationCategory.AUTOMATION,
    priority: NotificationPriority.URGENT,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
  });

  // Add to manual intervention queue with high priority
  await db.automationAuditLog.create({
    data: {
      userId,
      action: 'critical_error_alert',
      actionType: 'error',
      metadata: {
        ...payload,
        priority: 'high',
        requiresImmediateAction: true,
      },
    },
  });

  // Send email notification if configured
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true, preferences: true },
  });

  if (user?.preferences && (user.preferences as any).emailOnCriticalErrors) {
    // Email sending would be implemented here
    console.log(`Would send critical error email to ${user.email}`);
  }
}

async function handleAutomationFailure(userId: string, payload: any) {
  const { applicationId, consecutiveFailures, lastError } = payload;
  
  // Update application status
  await db.automationScheduledApplication.update({
    where: { id: applicationId },
    data: {
      status: 'failed',
      metadata: {
        failureReason: lastError,
        consecutiveFailures,
        failedAt: new Date(),
      },
    },
  });

  // Create notification
  await createNotification({
    userId,
    type: 'automation_failure',
    title: 'Application Submission Failed',
    content: `Application failed after ${consecutiveFailures} attempts: ${lastError}`,
    metadata: {
      ...payload,
      link: `/tools/automation/errors?applicationId=${applicationId}`,
    },
    category: NotificationCategory.AUTOMATION,
    priority: NotificationPriority.HIGH,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
  });
}

async function handlePerformanceDegradation(userId: string, payload: any) {
  const { metric, currentValue, threshold, degradationPercent } = payload;
  
  // Log performance issue
  await db.automationAuditLog.create({
    data: {
      userId,
      action: 'performance_alert',
      actionType: 'warning',
      metadata: payload,
    },
  });

  // Create notification
  await createNotification({
    userId,
    type: 'automation_performance_alert',
    title: 'Performance Degradation Detected',
    content: `${metric} has degraded by ${degradationPercent}%. Current: ${currentValue}, Threshold: ${threshold}.`,
    metadata: payload,
    category: NotificationCategory.AUTOMATION,
    priority: NotificationPriority.MEDIUM,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
  });

  // Adjust automation speed if severe degradation
  if (degradationPercent > 50) {
    const settings = await db.automationSettings.findUnique({
      where: { userId },
    });

    if (settings) {
      await db.automationSettings.update({
        where: { userId },
        data: {
          submissionDelay: Math.min((settings.submissionDelay || 30) * 1.5, 300), // Increase delay by 50%, max 5 minutes
          metadata: {
            ...(settings.metadata as any || {}),
            performanceAdjusted: true,
            adjustedAt: new Date(),
            reason: `Performance degradation: ${metric}`,
          },
        },
      });
    }
  }
}

// Health check endpoint for monitoring
export async function GET(request: NextRequest) {
  try {
    // Check database connectivity
    await db.$queryRaw`SELECT 1`;
    
    // Get system stats
    const recentErrors = await db.automationAuditLog.count({
      where: {
        action: 'automation_error',
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        },
      },
    });

    const activeApplications = await db.automationScheduledApplication.count({
      where: {
        status: 'scheduled',
      },
    });

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      metrics: {
        recentErrors,
        activeApplications,
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Database connection failed',
      },
      { status: 503 }
    );
  }
}
