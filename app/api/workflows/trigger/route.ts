import { NextRequest, NextResponse } from 'next/server';
import { WorkflowAutomationService } from '@/lib/services/workflow-automation-service';
import { getCurrentUser } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { event, entityId, data, config } = body;

    if (!event || !entityId) {
      return NextResponse.json(
        { error: 'Missing required fields: event, entityId' },
        { status: 400 }
      );
    }

    // Trigger appropriate workflow based on event type
    switch (event) {
      case 'requisition_created':
        await WorkflowAutomationService.onRequisitionCreated(entityId, config);
        break;

      case 'candidate_added':
        if (!data?.candidateId) {
          return NextResponse.json(
            { error: 'candidateId required for candidate_added event' },
            { status: 400 }
          );
        }
        await WorkflowAutomationService.onCandidateAdded(
          entityId,
          data.candidateId,
          config
        );
        break;

      case 'candidate_batch_added':
        if (!data?.candidateIds || !Array.isArray(data.candidateIds)) {
          return NextResponse.json(
            { error: 'candidateIds array required for candidate_batch_added event' },
            { status: 400 }
          );
        }
        await WorkflowAutomationService.onCandidateBatchAdded(
          entityId,
          data.candidateIds,
          config
        );
        break;

      case 'feedback_submitted':
        if (!data?.candidateId || !data?.feedback) {
          return NextResponse.json(
            { error: 'candidateId and feedback required for feedback_submitted event' },
            { status: 400 }
          );
        }
        await WorkflowAutomationService.onFeedbackSubmitted(
          entityId,
          data.candidateId,
          data.feedback,
          config
        );
        break;

      default:
        return NextResponse.json(
          { error: `Unknown event type: ${event}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Workflow triggered successfully: ${event}`,
    });
  } catch (error) {
    console.error('Error triggering workflow:', error);
    return NextResponse.json(
      { error: 'Failed to trigger workflow' },
      { status: 500 }
    );
  }
}
