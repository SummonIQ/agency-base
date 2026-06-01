/**
 * Client Portal Service
 * 
 * Provides data access and business logic for the recruiting client portal.
 * Allows clients to view their job requisitions, candidate pipeline, and provide feedback.
 */

import { prisma } from '@/lib/prisma';
import type { 
  JobRequisition, 
  Candidate, 
  JobApplication, 
  ClientCandidateFeedback,
  Client 
} from '@prisma/client';

// Types
export interface JobRequisitionWithStats extends JobRequisition {
  _count: {
    applications: number;
    clientFeedback: number;
  };
  candidateStats: {
    total: number;
    pending: number;
    interested: number;
    interviewing: number;
    rejected: number;
  };
}

export interface CandidateWithApplication extends Candidate {
  applications: JobApplication[];
  clientFeedback: ClientCandidateFeedback[];
}

export interface ClientPortalDashboard {
  client: Client;
  requisitions: JobRequisitionWithStats[];
  stats: {
    totalRequisitions: number;
    openRequisitions: number;
    filledRequisitions: number;
    totalCandidates: number;
    pendingFeedback: number;
    interviewsScheduled: number;
  };
}

/**
 * Get client portal dashboard data
 */
export async function getClientPortalDashboard(
  clientId: string
): Promise<ClientPortalDashboard> {
  // Get client info
  const client = await prisma.client.findUnique({
    where: { id: clientId },
  });

  if (!client) {
    throw new Error('Client not found');
  }

  // Get all requisitions with stats
  const requisitions = await prisma.jobRequisition.findMany({
    where: {
      clientId,
      isVisibleToClient: true,
    },
    include: {
      _count: {
        select: {
          applications: true,
          clientFeedback: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Calculate candidate stats for each requisition
  const requisitionsWithStats: JobRequisitionWithStats[] = await Promise.all(
    requisitions.map(async (req) => {
      const feedback = await prisma.clientCandidateFeedback.findMany({
        where: { requisitionId: req.id },
      });

      const candidateStats = {
        total: feedback.length,
        pending: feedback.filter((f) => f.status === 'pending').length,
        interested: feedback.filter((f) => f.status === 'interested').length,
        interviewing: feedback.filter((f) => f.status === 'interview-requested').length,
        rejected: feedback.filter((f) => f.status === 'rejected').length,
      };

      return {
        ...req,
        candidateStats,
      };
    })
  );

  // Calculate overall stats
  const totalCandidates = requisitionsWithStats.reduce(
    (sum, req) => sum + req.candidateStats.total,
    0
  );
  const pendingFeedback = requisitionsWithStats.reduce(
    (sum, req) => sum + req.candidateStats.pending,
    0
  );

  const stats = {
    totalRequisitions: requisitions.length,
    openRequisitions: requisitions.filter((r) => r.status === 'open').length,
    filledRequisitions: requisitions.filter((r) => r.status === 'filled').length,
    totalCandidates,
    pendingFeedback,
    interviewsScheduled: requisitionsWithStats.reduce(
      (sum, req) => sum + req.candidateStats.interviewing,
      0
    ),
  };

  return {
    client,
    requisitions: requisitionsWithStats,
    stats,
  };
}

/**
 * Get requisition details with candidates
 */
export async function getRequisitionWithCandidates(
  requisitionId: string,
  clientId: string
) {
  const requisition = await prisma.jobRequisition.findFirst({
    where: {
      id: requisitionId,
      clientId,
      isVisibleToClient: true,
    },
    include: {
      client: true,
      applications: {
        include: {
          candidate: {
            include: {
              clientFeedback: {
                where: {
                  requisitionId,
                  clientId,
                },
              },
            },
          },
        },
        orderBy: {
          appliedDate: 'desc',
        },
      },
    },
  });

  if (!requisition) {
    throw new Error('Requisition not found or not accessible');
  }

  return requisition;
}

/**
 * Get candidate details for client review
 */
export async function getCandidateForReview(
  candidateId: string,
  requisitionId: string,
  clientId: string
) {
  // Verify client has access to this requisition
  const requisition = await prisma.jobRequisition.findFirst({
    where: {
      id: requisitionId,
      clientId,
      isVisibleToClient: true,
    },
  });

  if (!requisition) {
    throw new Error('Requisition not found or not accessible');
  }

  // Get candidate with application and existing feedback
  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: {
      applications: {
        where: { requisitionId },
      },
      clientFeedback: {
        where: {
          requisitionId,
          clientId,
        },
      },
    },
  });

  if (!candidate) {
    throw new Error('Candidate not found');
  }

  return {
    candidate,
    requisition,
  };
}

/**
 * Submit client feedback on a candidate
 */
export async function submitClientFeedback(data: {
  requisitionId: string;
  candidateId: string;
  clientId: string;
  rating?: number;
  status: string;
  comments?: string;
  strengths?: string[];
  concerns?: string[];
  moveForward?: boolean;
  interviewRequested?: boolean;
  preferredInterviewDates?: string[];
}) {
  // Verify client has access to this requisition
  const requisition = await prisma.jobRequisition.findFirst({
    where: {
      id: data.requisitionId,
      clientId: data.clientId,
      isVisibleToClient: true,
    },
  });

  if (!requisition) {
    throw new Error('Requisition not found or not accessible');
  }

  // Upsert feedback (create or update)
  const feedback = await prisma.clientCandidateFeedback.upsert({
    where: {
      requisitionId_candidateId_clientId: {
        requisitionId: data.requisitionId,
        candidateId: data.candidateId,
        clientId: data.clientId,
      },
    },
    create: {
      requisitionId: data.requisitionId,
      candidateId: data.candidateId,
      clientId: data.clientId,
      rating: data.rating,
      status: data.status,
      comments: data.comments,
      strengths: data.strengths || [],
      concerns: data.concerns || [],
      moveForward: data.moveForward,
      interviewRequested: data.interviewRequested || false,
      preferredInterviewDates: data.preferredInterviewDates || [],
    },
    update: {
      rating: data.rating,
      status: data.status,
      comments: data.comments,
      strengths: data.strengths || [],
      concerns: data.concerns || [],
      moveForward: data.moveForward,
      interviewRequested: data.interviewRequested,
      preferredInterviewDates: data.preferredInterviewDates || [],
      updatedAt: new Date(),
    },
  });

  return feedback;
}

/**
 * Get client feedback summary for a requisition
 */
export async function getClientFeedbackSummary(
  requisitionId: string,
  clientId: string
) {
  const feedback = await prisma.clientCandidateFeedback.findMany({
    where: {
      requisitionId,
      clientId,
    },
    include: {
      candidate: {
        select: {
          id: true,
          name: true,
          email: true,
          currentRole: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  const summary = {
    total: feedback.length,
    pending: feedback.filter((f) => f.status === 'pending').length,
    interested: feedback.filter((f) => f.status === 'interested').length,
    notInterested: feedback.filter((f) => f.status === 'not-interested').length,
    interviewRequested: feedback.filter((f) => f.interviewRequested).length,
    rejected: feedback.filter((f) => f.status === 'rejected').length,
    averageRating:
      feedback.filter((f) => f.rating).length > 0
        ? feedback.reduce((sum, f) => sum + (f.rating || 0), 0) /
          feedback.filter((f) => f.rating).length
        : null,
  };

  return {
    feedback,
    summary,
  };
}

/**
 * Verify client portal access token
 */
export async function verifyClientPortalAccess(
  shareToken: string
): Promise<{ clientId: string; requisitionId: string } | null> {
  const requisition = await prisma.jobRequisition.findFirst({
    where: {
      shareToken,
      isVisibleToClient: true,
    },
    select: {
      id: true,
      clientId: true,
    },
  });

  if (!requisition) {
    return null;
  }

  return {
    clientId: requisition.clientId,
    requisitionId: requisition.id,
  };
}

/**
 * Generate share token for client portal access
 */
export async function generateClientPortalToken(
  requisitionId: string,
  userId: string
): Promise<string> {
  // Verify user owns this requisition
  const requisition = await prisma.jobRequisition.findFirst({
    where: {
      id: requisitionId,
      userId,
    },
  });

  if (!requisition) {
    throw new Error('Requisition not found');
  }

  // Generate unique token
  const token = `cpt_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

  // Update requisition with token
  await prisma.jobRequisition.update({
    where: { id: requisitionId },
    data: { shareToken: token },
  });

  return token;
}
