import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { ApplicationStatus } from '@prisma/client';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const body = await req.json();
    const { status, notes, metadata, eventType = 'status_change' } = body;

    // Verify the application belongs to the user
    const application = await db.applicationSubmission.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!application) {
      return new Response('Application not found', { status: 404 });
    }

    // Calculate time-based metrics
    const now = new Date();
    const submittedAt = application.submittedAt || application.createdAt;
    const daysSinceSubmission = Math.floor(
      (now.getTime() - submittedAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Prepare update data
    const updateData: any = {
      status: status as ApplicationStatus,
      lastStatusChangeAt: now,
      daysSinceSubmission,
    };

    // Track response time for first non-pending status
    if (!application.responseReceivedAt && status !== 'PENDING' && status !== 'SUBMITTED') {
      updateData.responseReceivedAt = now;
      updateData.daysToResponse = daysSinceSubmission;
    }

    // Track interview count
    if (status === 'INTERVIEW_SCHEDULED' || status === 'INTERVIEW_COMPLETED') {
      updateData.interviewCount = (application.interviewCount || 0) + 1;
    }

    // Track final outcome
    const finalStatuses = [
      'REJECTED',
      'NOT_SELECTED',
      'OFFER_ACCEPTED',
      'OFFER_REJECTED',
      'WITHDRAWN',
    ];
    if (finalStatuses.includes(status)) {
      updateData.finalOutcomeAt = now;
      updateData.daysToFinalOutcome = daysSinceSubmission;
    }

    // Update the application
    const updatedApplication = await db.applicationSubmission.update({
      where: { id: params.id },
      data: updateData,
    });

    // Create outcome event
    await db.applicationOutcomeEvent.create({
      data: {
        applicationSubmissionId: params.id,
        eventType,
        previousStatus: application.status,
        newStatus: status as ApplicationStatus,
        metadata,
        notes,
        createdBy: session.user.id,
      },
    });

    return Response.json({
      success: true,
      application: updatedApplication,
    });
  } catch (error) {
    console.error('Error updating application outcome:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Get application with outcome events
    const application = await db.applicationSubmission.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        outcomeEvents: {
          orderBy: { createdAt: 'desc' },
        },
        jobLead: {
          select: {
            title: true,
            companyName: true,
          },
        },
      },
    });

    if (!application) {
      return new Response('Application not found', { status: 404 });
    }

    return Response.json(application);
  } catch (error) {
    console.error('Error fetching application outcome:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}