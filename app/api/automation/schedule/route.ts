import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { AutomationScheduler, createScheduledApplications } from '@/lib/automation/scheduling';
import { z } from 'zod';

const scheduleSchema = z.object({
  jobLeadIds: z.array(z.string()).min(1),
});

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = scheduleSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { jobLeadIds } = validation.data;

    // Get user's automation settings
    const settings = await db.automationSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!settings || !settings.isEnabled || settings.isPaused) {
      return NextResponse.json(
        { error: 'Automation is not enabled or is paused' },
        { status: 400 }
      );
    }

    // Check if smart scheduling is enabled
    if (!settings.enableSmartScheduling) {
      return NextResponse.json(
        { error: 'Smart scheduling is not enabled' },
        { status: 400 }
      );
    }

    // Create scheduler instance
    const scheduler = new AutomationScheduler(session.user.id, settings);

    // Schedule applications
    const scheduledApplications = await scheduler.scheduleApplications(jobLeadIds);

    if (scheduledApplications.length === 0) {
      return NextResponse.json(
        { error: 'No applications could be scheduled' },
        { status: 400 }
      );
    }

    // Save to database
    await createScheduledApplications(session.user.id, scheduledApplications);

    // Log the scheduling action
    await db.automationAuditLog.create({
      data: {
        userId: session.user.id,
        action: 'applications_scheduled',
        actionType: 'success',
        metadata: {
          count: scheduledApplications.length,
          jobLeadIds,
        },
      },
    });

    return NextResponse.json({
      success: true,
      scheduled: scheduledApplications.length,
      applications: scheduledApplications,
    });
  } catch (error) {
    console.error('Error scheduling applications:', error);
    return NextResponse.json(
      { error: 'Failed to schedule applications' },
      { status: 500 }
    );
  }
}

// Get scheduled applications
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'scheduled';
    const limit = parseInt(searchParams.get('limit') || '20');

    const scheduledApplications = await db.automationScheduledApplication.findMany({
      where: {
        userId: session.user.id,
        status,
      },
      include: {
        jobLead: {
          include: {
            jobListing: true,
          },
        },
      },
      orderBy: [
        { scheduledFor: 'asc' },
        { priority: 'desc' },
      ],
      take: limit,
    });

    return NextResponse.json({
      applications: scheduledApplications,
      total: scheduledApplications.length,
    });
  } catch (error) {
    console.error('Error fetching scheduled applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduled applications' },
      { status: 500 }
    );
  }
}