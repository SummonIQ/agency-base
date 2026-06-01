// Workflow Automation Service - End-to-end recruiting workflow automation

import { prisma } from '@/lib/prisma';
import { RequisitionNotificationService } from './requisition-notification-service';

export interface WorkflowConfig {
  autoSendPortalAccess: boolean;
  autoSourceCandidates: boolean;
  autoNotifyNewCandidates: boolean;
  autoRemindFeedback: boolean;
  autoScheduleInterviews: boolean;
  feedbackReminderDays: number;
  minCandidatesBeforeNotify: number;
}

export interface WorkflowEvent {
  id: string;
  type: string;
  entityId: string;
  entityType: string;
  timestamp: Date;
  data: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export class WorkflowAutomationService {
  /**
   * Default workflow configuration
   */
  static getDefaultConfig(): WorkflowConfig {
    return {
      autoSendPortalAccess: true,
      autoSourceCandidates: true,
      autoNotifyNewCandidates: true,
      autoRemindFeedback: true,
      autoScheduleInterviews: false,
      feedbackReminderDays: 3,
      minCandidatesBeforeNotify: 1,
    };
  }

  /**
   * Handle requisition created workflow
   */
  static async onRequisitionCreated(
    requisitionId: string,
    config: WorkflowConfig = this.getDefaultConfig()
  ): Promise<void> {
    try {
      console.log(`[Workflow] Requisition created: ${requisitionId}`);

      const requisition = await prisma.jobRequisition.findUnique({
        where: { id: requisitionId },
        include: {
          client: true,
        },
      });

      if (!requisition) {
        throw new Error('Requisition not found');
      }

      // Step 1: Send portal access if enabled
      if (config.autoSendPortalAccess && requisition.isVisibleToClient && requisition.shareToken) {
        console.log(`[Workflow] Sending portal access email...`);
        await RequisitionNotificationService.notifyPortalAccess(requisitionId);
      }

      // Step 2: Trigger candidate sourcing if enabled
      if (config.autoSourceCandidates) {
        console.log(`[Workflow] Triggering candidate sourcing...`);
        await this.triggerCandidateSourcing(requisitionId);
      }

      // Step 3: Log workflow event
      await this.logWorkflowEvent({
        type: 'requisition_created',
        entityId: requisitionId,
        entityType: 'requisition',
        data: {
          title: requisition.title,
          clientId: requisition.clientId,
          status: requisition.status,
        },
        status: 'completed',
      });

      console.log(`[Workflow] Requisition created workflow completed`);
    } catch (error) {
      console.error('[Workflow] Error in requisition created workflow:', error);
      await this.logWorkflowEvent({
        type: 'requisition_created',
        entityId: requisitionId,
        entityType: 'requisition',
        data: {},
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Handle candidate added workflow
   */
  static async onCandidateAdded(
    requisitionId: string,
    candidateId: string,
    config: WorkflowConfig = this.getDefaultConfig()
  ): Promise<void> {
    try {
      console.log(`[Workflow] Candidate added: ${candidateId} to ${requisitionId}`);

      const requisition = await prisma.jobRequisition.findUnique({
        where: { id: requisitionId },
        include: {
          applications: true,
        },
      });

      if (!requisition) {
        throw new Error('Requisition not found');
      }

      // Step 1: Send new candidate notification if enabled
      if (config.autoNotifyNewCandidates && requisition.isVisibleToClient) {
        const candidateCount = requisition.applications.length;
        
        if (candidateCount >= config.minCandidatesBeforeNotify) {
          console.log(`[Workflow] Sending new candidate notification...`);
          await RequisitionNotificationService.notifyNewCandidate(
            requisitionId,
            candidateId
          );
        }
      }

      // Step 2: Auto-score candidate
      console.log(`[Workflow] Auto-scoring candidate...`);
      await this.autoScoreCandidate(requisitionId, candidateId);

      // Step 3: Log workflow event
      await this.logWorkflowEvent({
        type: 'candidate_added',
        entityId: candidateId,
        entityType: 'candidate',
        data: {
          requisitionId,
          candidateCount: requisition.applications.length,
        },
        status: 'completed',
      });

      console.log(`[Workflow] Candidate added workflow completed`);
    } catch (error) {
      console.error('[Workflow] Error in candidate added workflow:', error);
      await this.logWorkflowEvent({
        type: 'candidate_added',
        entityId: candidateId,
        entityType: 'candidate',
        data: { requisitionId },
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Handle client feedback submitted workflow
   */
  static async onFeedbackSubmitted(
    requisitionId: string,
    candidateId: string,
    feedback: any,
    config: WorkflowConfig = this.getDefaultConfig()
  ): Promise<void> {
    try {
      console.log(`[Workflow] Feedback submitted for candidate: ${candidateId}`);

      // Step 1: Update candidate status based on feedback
      if (feedback.status === 'interested' || feedback.moveForward) {
        console.log(`[Workflow] Moving candidate to next stage...`);
        await this.updateCandidateStage(requisitionId, candidateId, 'interview');
      } else if (feedback.status === 'not-interested') {
        console.log(`[Workflow] Marking candidate as rejected...`);
        await this.updateCandidateStage(requisitionId, candidateId, 'rejected');
      }

      // Step 2: Handle interview request
      if (feedback.interviewRequested && config.autoScheduleInterviews) {
        console.log(`[Workflow] Processing interview request...`);
        await RequisitionNotificationService.notifyInterviewRequested(
          requisitionId,
          candidateId
        );
      }

      // Step 3: Log workflow event
      await this.logWorkflowEvent({
        type: 'feedback_submitted',
        entityId: candidateId,
        entityType: 'candidate',
        data: {
          requisitionId,
          feedbackStatus: feedback.status,
          interviewRequested: feedback.interviewRequested,
        },
        status: 'completed',
      });

      console.log(`[Workflow] Feedback submitted workflow completed`);
    } catch (error) {
      console.error('[Workflow] Error in feedback submitted workflow:', error);
      await this.logWorkflowEvent({
        type: 'feedback_submitted',
        entityId: candidateId,
        entityType: 'candidate',
        data: { requisitionId },
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Handle candidate batch added workflow
   */
  static async onCandidateBatchAdded(
    requisitionId: string,
    candidateIds: string[],
    config: WorkflowConfig = this.getDefaultConfig()
  ): Promise<void> {
    try {
      console.log(`[Workflow] Batch of ${candidateIds.length} candidates added`);

      // Step 1: Send batch notification if enabled
      if (config.autoNotifyNewCandidates && candidateIds.length >= config.minCandidatesBeforeNotify) {
        console.log(`[Workflow] Sending batch candidate notification...`);
        await RequisitionNotificationService.notifyNewCandidateBatch(
          requisitionId,
          candidateIds.length
        );
      }

      // Step 2: Auto-score all candidates
      console.log(`[Workflow] Auto-scoring ${candidateIds.length} candidates...`);
      await Promise.all(
        candidateIds.map((candidateId) =>
          this.autoScoreCandidate(requisitionId, candidateId)
        )
      );

      // Step 3: Log workflow event
      await this.logWorkflowEvent({
        type: 'candidate_batch_added',
        entityId: requisitionId,
        entityType: 'requisition',
        data: {
          candidateCount: candidateIds.length,
          candidateIds,
        },
        status: 'completed',
      });

      console.log(`[Workflow] Candidate batch added workflow completed`);
    } catch (error) {
      console.error('[Workflow] Error in candidate batch added workflow:', error);
      await this.logWorkflowEvent({
        type: 'candidate_batch_added',
        entityId: requisitionId,
        entityType: 'requisition',
        data: { candidateCount: candidateIds.length },
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Trigger candidate sourcing from LinkedIn/Apollo
   */
  private static async triggerCandidateSourcing(requisitionId: string): Promise<void> {
    try {
      const requisition = await prisma.jobRequisition.findUnique({
        where: { id: requisitionId },
      });

      if (!requisition) return;

      // TODO: Integrate with LinkedIn/Apollo sourcing
      // For now, just log the intent
      console.log(`[Workflow] Would source candidates for: ${requisition.title}`);
      console.log(`[Workflow] Required skills: ${requisition.requiredSkills.join(', ')}`);
      console.log(`[Workflow] Location: ${requisition.location || 'Remote'}`);

      // This would trigger:
      // 1. LinkedIn search with job requirements
      // 2. Apollo.io search for matching profiles
      // 3. Auto-import top candidates
    } catch (error) {
      console.error('[Workflow] Error triggering candidate sourcing:', error);
    }
  }

  /**
   * Auto-score candidate based on requisition requirements
   */
  private static async autoScoreCandidate(
    requisitionId: string,
    candidateId: string
  ): Promise<void> {
    try {
      const [requisition, candidate] = await Promise.all([
        prisma.jobRequisition.findUnique({
          where: { id: requisitionId },
        }),
        prisma.candidate.findUnique({
          where: { id: candidateId },
        }),
      ]);

      if (!requisition || !candidate) return;

      // Simple scoring algorithm
      let score = 0;
      const maxScore = 100;

      // Skills match (40 points)
      const candidateSkills = candidate.skills || [];
      const requiredSkills = requisition.requiredSkills || [];
      const matchedSkills = candidateSkills.filter((skill) =>
        requiredSkills.some((req) => req.toLowerCase().includes(skill.toLowerCase()))
      );
      score += (matchedSkills.length / Math.max(requiredSkills.length, 1)) * 40;

      // Experience level (30 points)
      if (candidate.experience) {
        const yearsMatch = candidate.experience.match(/(\d+)/);
        if (yearsMatch) {
          const years = parseInt(yearsMatch[1]);
          if (requisition.experienceLevel === 'senior' && years >= 5) score += 30;
          else if (requisition.experienceLevel === 'mid' && years >= 3) score += 30;
          else if (requisition.experienceLevel === 'junior' && years >= 1) score += 30;
          else score += 15;
        }
      }

      // Location match (15 points)
      if (candidate.location && requisition.location) {
        if (candidate.location.toLowerCase().includes(requisition.location.toLowerCase())) {
          score += 15;
        }
      } else if (!requisition.location) {
        score += 15; // Remote position
      }

      // Education (15 points)
      if (candidate.education) {
        score += 15;
      }

      // Update application with score
      await prisma.jobApplication.updateMany({
        where: {
          requisitionId,
          candidateId,
        },
        data: {
          score: Math.round(score),
        },
      });

      console.log(`[Workflow] Candidate ${candidateId} scored: ${Math.round(score)}/${maxScore}`);
    } catch (error) {
      console.error('[Workflow] Error auto-scoring candidate:', error);
    }
  }

  /**
   * Update candidate stage in pipeline
   */
  private static async updateCandidateStage(
    requisitionId: string,
    candidateId: string,
    stage: string
  ): Promise<void> {
    try {
      await prisma.jobApplication.updateMany({
        where: {
          requisitionId,
          candidateId,
        },
        data: {
          status: stage,
          stage,
          lastActivity: new Date(),
        },
      });

      console.log(`[Workflow] Updated candidate ${candidateId} to stage: ${stage}`);
    } catch (error) {
      console.error('[Workflow] Error updating candidate stage:', error);
    }
  }

  /**
   * Log workflow event for auditing
   */
  private static async logWorkflowEvent(event: Omit<WorkflowEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      // TODO: Store in database for workflow history
      console.log(`[Workflow Event] ${event.type} - ${event.status}`, event.data);
    } catch (error) {
      console.error('[Workflow] Error logging workflow event:', error);
    }
  }

  /**
   * Get workflow statistics
   */
  static async getWorkflowStats(userId: string): Promise<any> {
    try {
      const [
        totalRequisitions,
        activeRequisitions,
        totalCandidates,
        candidatesThisWeek,
        feedbackPending,
        interviewsScheduled,
      ] = await Promise.all([
        prisma.jobRequisition.count({
          where: { userId },
        }),
        prisma.jobRequisition.count({
          where: { userId, status: 'open' },
        }),
        prisma.jobApplication.count({
          where: {
            requisition: { userId },
          },
        }),
        prisma.jobApplication.count({
          where: {
            requisition: { userId },
            appliedDate: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
        prisma.jobApplication.count({
          where: {
            requisition: { userId },
            status: 'new',
          },
        }),
        prisma.interview.count({
          where: {
            application: {
              requisition: { userId },
            },
            status: 'scheduled',
          },
        }),
      ]);

      return {
        totalRequisitions,
        activeRequisitions,
        totalCandidates,
        candidatesThisWeek,
        feedbackPending,
        interviewsScheduled,
        automationEnabled: true,
      };
    } catch (error) {
      console.error('[Workflow] Error getting workflow stats:', error);
      return null;
    }
  }
}
