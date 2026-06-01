/**
 * Client Portal API
 * 
 * RESTful API endpoints for recruiting client portal functionality.
 * Handles dashboard data, requisition details, candidate reviews, and feedback submission.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getClientPortalDashboard,
  getRequisitionWithCandidates,
  getCandidateForReview,
  submitClientFeedback,
  getClientFeedbackSummary,
  verifyClientPortalAccess,
  generateClientPortalToken,
} from '@/lib/recruiting/client-portal-service';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    const clientId = searchParams.get('clientId');
    const requisitionId = searchParams.get('requisitionId');
    const candidateId = searchParams.get('candidateId');
    const shareToken = searchParams.get('shareToken');

    switch (action) {
      case 'dashboard':
        if (!clientId) {
          return NextResponse.json(
            { error: 'clientId is required' },
            { status: 400 }
          );
        }
        const dashboard = await getClientPortalDashboard(clientId);
        return NextResponse.json(dashboard);

      case 'requisition':
        if (!requisitionId || !clientId) {
          return NextResponse.json(
            { error: 'requisitionId and clientId are required' },
            { status: 400 }
          );
        }
        const requisition = await getRequisitionWithCandidates(
          requisitionId,
          clientId
        );
        return NextResponse.json(requisition);

      case 'candidate':
        if (!candidateId || !requisitionId || !clientId) {
          return NextResponse.json(
            { error: 'candidateId, requisitionId, and clientId are required' },
            { status: 400 }
          );
        }
        const candidate = await getCandidateForReview(
          candidateId,
          requisitionId,
          clientId
        );
        return NextResponse.json(candidate);

      case 'feedback_summary':
        if (!requisitionId || !clientId) {
          return NextResponse.json(
            { error: 'requisitionId and clientId are required' },
            { status: 400 }
          );
        }
        const summary = await getClientFeedbackSummary(requisitionId, clientId);
        return NextResponse.json(summary);

      case 'verify_access':
        if (!shareToken) {
          return NextResponse.json(
            { error: 'shareToken is required' },
            { status: 400 }
          );
        }
        const access = await verifyClientPortalAccess(shareToken);
        if (!access) {
          return NextResponse.json(
            { error: 'Invalid or expired token' },
            { status: 403 }
          );
        }
        return NextResponse.json(access);

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Client portal API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'submit_feedback':
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
            {
              error:
                'requisitionId, candidateId, clientId, and status are required',
            },
            { status: 400 }
          );
        }

        const feedback = await submitClientFeedback({
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
        });

        return NextResponse.json({
          success: true,
          feedback,
          message: 'Feedback submitted successfully',
        });

      case 'generate_token':
        const { requisitionId: reqId } = body;

        if (!reqId) {
          return NextResponse.json(
            { error: 'requisitionId is required' },
            { status: 400 }
          );
        }

        const token = await generateClientPortalToken(reqId, session.user.id);

        return NextResponse.json({
          success: true,
          token,
          portalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/client-portal?token=${token}`,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Client portal API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
