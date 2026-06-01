// Client Portal Service - Backend service for client portal functionality

import { prisma } from '@/lib/prisma';
import {
  JobRequisitionWithCandidates,
  ClientPortalStats,
  RequisitionPipeline,
  PipelineStage,
  CandidateApplication,
} from '@/lib/types/client-portal';

export class ClientPortalService {
  /**
   * Get client portal statistics
   */
  static async getClientStats(clientId: string): Promise<ClientPortalStats> {
    const [
      totalRequisitions,
      openRequisitions,
      filledRequisitions,
      totalApplications,
      candidatesInReview,
      interviewsScheduled,
      offersExtended,
    ] = await Promise.all([
      // Total requisitions
      prisma.jobRequisition.count({
        where: { clientId },
      }),
      // Open requisitions
      prisma.jobRequisition.count({
        where: { clientId, status: 'open' },
      }),
      // Filled requisitions
      prisma.jobRequisition.count({
        where: { clientId, status: 'filled' },
      }),
      // Total applications across all requisitions
      prisma.jobApplication.count({
        where: {
          requisition: { clientId },
        },
      }),
      // Candidates in review (screening or interview stages)
      prisma.jobApplication.count({
        where: {
          requisition: { clientId },
          status: { in: ['screening', 'interview'] },
        },
      }),
      // Interviews scheduled
      prisma.interview.count({
        where: {
          application: {
            requisition: { clientId },
          },
          status: 'scheduled',
        },
      }),
      // Offers extended
      prisma.jobApplication.count({
        where: {
          requisition: { clientId },
          status: 'offer',
        },
      }),
    ]);

    // Calculate average time to fill
    const filledReqs = await prisma.jobRequisition.findMany({
      where: {
        clientId,
        status: 'filled',
        filledDate: { not: null },
      },
      select: {
        createdAt: true,
        filledDate: true,
      },
    });

    let avgTimeToFill: number | null = null;
    if (filledReqs.length > 0) {
      const totalDays = filledReqs.reduce((sum, req) => {
        if (req.filledDate) {
          const days = Math.floor(
            (req.filledDate.getTime() - req.createdAt.getTime()) / (1000 * 60 * 60 * 24)
          );
          return sum + days;
        }
        return sum;
      }, 0);
      avgTimeToFill = Math.round(totalDays / filledReqs.length);
    }

    return {
      totalRequisitions,
      openRequisitions,
      filledRequisitions,
      totalCandidates: totalApplications,
      candidatesInReview,
      interviewsScheduled,
      offersExtended,
      avgTimeToFill,
    };
  }

  /**
   * Get all job requisitions for a client with candidates
   */
  static async getClientRequisitions(
    clientId: string,
    filters?: {
      status?: string;
      priority?: string;
    }
  ): Promise<JobRequisitionWithCandidates[]> {
    const requisitions = await prisma.jobRequisition.findMany({
      where: {
        clientId,
        isVisibleToClient: true,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.priority && { priority: filters.priority }),
      },
      include: {
        applications: {
          include: {
            candidate: true,
            interviews: {
              orderBy: { scheduledAt: 'desc' },
            },
          },
          orderBy: { appliedDate: 'desc' },
        },
        clientFeedback: {
          include: {
            candidate: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return requisitions.map((req) => ({
      ...req,
      applications: req.applications.map((app) => ({
        id: app.id,
        candidateId: app.candidateId,
        candidateName: app.candidate.name,
        candidateEmail: app.candidate.email,
        position: app.position,
        status: app.status,
        stage: app.stage,
        score: app.score,
        appliedDate: app.appliedDate,
        lastActivity: app.lastActivity,
        candidate: app.candidate,
        interviews: app.interviews,
      })),
      clientFeedback: req.clientFeedback.map((feedback) => ({
        ...feedback,
        candidateName: feedback.candidate.name,
      })),
    }));
  }

  /**
   * Get single requisition with full details
   */
  static async getRequisitionDetails(
    requisitionId: string,
    clientId: string
  ): Promise<JobRequisitionWithCandidates | null> {
    const requisition = await prisma.jobRequisition.findFirst({
      where: {
        id: requisitionId,
        clientId,
        isVisibleToClient: true,
      },
      include: {
        applications: {
          include: {
            candidate: true,
            interviews: {
              orderBy: { scheduledAt: 'desc' },
            },
          },
          orderBy: { appliedDate: 'desc' },
        },
        clientFeedback: {
          include: {
            candidate: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!requisition) return null;

    return {
      ...requisition,
      applications: requisition.applications.map((app) => ({
        id: app.id,
        candidateId: app.candidateId,
        candidateName: app.candidate.name,
        candidateEmail: app.candidate.email,
        position: app.position,
        status: app.status,
        stage: app.stage,
        score: app.score,
        appliedDate: app.appliedDate,
        lastActivity: app.lastActivity,
        candidate: app.candidate,
        interviews: app.interviews,
      })),
      clientFeedback: requisition.clientFeedback.map((feedback) => ({
        ...feedback,
        candidateName: feedback.candidate.name,
      })),
    };
  }

  /**
   * Get pipeline view for a requisition
   */
  static async getRequisitionPipeline(
    requisitionId: string,
    clientId: string
  ): Promise<RequisitionPipeline | null> {
    const requisition = await prisma.jobRequisition.findFirst({
      where: {
        id: requisitionId,
        clientId,
        isVisibleToClient: true,
      },
      include: {
        applications: {
          include: {
            candidate: true,
            interviews: {
              orderBy: { scheduledAt: 'desc' },
            },
          },
        },
      },
    });

    if (!requisition) return null;

    // Define pipeline stages
    const stageOrder = ['new', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'];
    
    const stages: PipelineStage[] = stageOrder.map((stage) => {
      const candidates = requisition.applications
        .filter((app) => app.status === stage)
        .map((app) => ({
          id: app.id,
          candidateId: app.candidateId,
          candidateName: app.candidate.name,
          candidateEmail: app.candidate.email,
          position: app.position,
          status: app.status,
          stage: app.stage,
          score: app.score,
          appliedDate: app.appliedDate,
          lastActivity: app.lastActivity,
          candidate: app.candidate,
          interviews: app.interviews,
        }));

      return {
        stage,
        count: candidates.length,
        candidates,
      };
    });

    const totalCandidates = requisition.applications.length;
    const hiredCount = requisition.applications.filter((app) => app.status === 'hired').length;
    const conversionRate = totalCandidates > 0 ? (hiredCount / totalCandidates) * 100 : 0;

    return {
      requisitionId: requisition.id,
      requisitionTitle: requisition.title,
      stages,
      totalCandidates,
      conversionRate: Math.round(conversionRate * 10) / 10,
    };
  }

  /**
   * Submit client feedback on a candidate
   */
  static async submitCandidateFeedback(
    requisitionId: string,
    candidateId: string,
    clientId: string,
    feedback: {
      rating?: number;
      status: string;
      comments?: string;
      strengths?: string[];
      concerns?: string[];
      moveForward?: boolean;
      interviewRequested?: boolean;
      preferredInterviewDates?: string[];
    }
  ) {
    // Verify requisition belongs to client
    const requisition = await prisma.jobRequisition.findFirst({
      where: {
        id: requisitionId,
        clientId,
      },
    });

    if (!requisition) {
      throw new Error('Requisition not found or access denied');
    }

    // Upsert feedback
    const clientFeedback = await prisma.clientCandidateFeedback.upsert({
      where: {
        requisitionId_candidateId_clientId: {
          requisitionId,
          candidateId,
          clientId,
        },
      },
      update: {
        rating: feedback.rating,
        status: feedback.status,
        comments: feedback.comments,
        strengths: feedback.strengths || [],
        concerns: feedback.concerns || [],
        moveForward: feedback.moveForward,
        interviewRequested: feedback.interviewRequested || false,
        preferredInterviewDates: feedback.preferredInterviewDates || [],
      },
      create: {
        requisitionId,
        candidateId,
        clientId,
        rating: feedback.rating,
        status: feedback.status,
        comments: feedback.comments,
        strengths: feedback.strengths || [],
        concerns: feedback.concerns || [],
        moveForward: feedback.moveForward,
        interviewRequested: feedback.interviewRequested || false,
        preferredInterviewDates: feedback.preferredInterviewDates || [],
      },
    });

    return clientFeedback;
  }

  /**
   * Verify client access token
   */
  static async verifyClientAccess(
    clientId: string,
    shareToken: string
  ): Promise<boolean> {
    const requisition = await prisma.jobRequisition.findFirst({
      where: {
        clientId,
        shareToken,
        isVisibleToClient: true,
      },
    });

    return !!requisition;
  }

  /**
   * Get client information
   */
  static async getClientInfo(clientId: string) {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        website: true,
        industry: true,
        primaryContactName: true,
        primaryContactEmail: true,
        primaryContactPhone: true,
      },
    });

    return client;
  }
}
