import { NextRequest, NextResponse } from 'next/server';
import { ClientPortalService } from '@/lib/services/client-portal-service';
import { getCurrentUser } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      requisitionId,
      candidateId,
      clientId,
      rating,
      status,
      comments,
      strengths,
      concerns,
      moveForward,
      interviewRequested,
      preferredInterviewDates,
    } = body;

    if (!requisitionId || !candidateId || !clientId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const feedback = await ClientPortalService.submitCandidateFeedback(
      requisitionId,
      candidateId,
      clientId,
      {
        rating,
        status,
        comments,
        strengths,
        concerns,
        moveForward,
        interviewRequested,
        preferredInterviewDates,
      }
    );

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error submitting candidate feedback:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
