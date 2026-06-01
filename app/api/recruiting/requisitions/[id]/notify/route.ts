import { NextRequest, NextResponse } from 'next/server';
import { RequisitionNotificationService } from '@/lib/services/requisition-notification-service';
import { getCurrentUser } from '@/lib/session';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requisitionId = params.id;
    const body = await request.json();
    const { action, candidateId, candidateCount } = body;

    let success = false;

    switch (action) {
      case 'portal_access':
        success = await RequisitionNotificationService.notifyPortalAccess(requisitionId);
        break;

      case 'new_candidate':
        if (!candidateId) {
          return NextResponse.json(
            { error: 'candidateId required for new_candidate action' },
            { status: 400 }
          );
        }
        success = await RequisitionNotificationService.notifyNewCandidate(
          requisitionId,
          candidateId
        );
        break;

      case 'candidate_batch':
        if (!candidateCount) {
          return NextResponse.json(
            { error: 'candidateCount required for candidate_batch action' },
            { status: 400 }
          );
        }
        success = await RequisitionNotificationService.notifyNewCandidateBatch(
          requisitionId,
          candidateCount
        );
        break;

      case 'feedback_reminder':
        success = await RequisitionNotificationService.sendFeedbackReminder(requisitionId);
        break;

      case 'interview_requested':
        if (!candidateId) {
          return NextResponse.json(
            { error: 'candidateId required for interview_requested action' },
            { status: 400 }
          );
        }
        success = await RequisitionNotificationService.notifyInterviewRequested(
          requisitionId,
          candidateId
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Valid actions: portal_access, new_candidate, candidate_batch, feedback_reminder, interview_requested' },
          { status: 400 }
        );
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Notification sent successfully: ${action}`,
    });
  } catch (error) {
    console.error('Error sending requisition notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
