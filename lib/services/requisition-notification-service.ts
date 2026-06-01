// Requisition Notification Service - Automated notifications for recruiting workflows

import { prisma } from '@/lib/prisma';
import { NotificationService } from './notification-service';

export class RequisitionNotificationService {
  /**
   * Send portal access when requisition is created
   */
  static async notifyPortalAccess(requisitionId: string): Promise<boolean> {
    try {
      const requisition = await prisma.jobRequisition.findUnique({
        where: { id: requisitionId },
        include: {
          client: true,
        },
      });

      if (!requisition || !requisition.shareToken || !requisition.isVisibleToClient) {
        return false;
      }

      return await NotificationService.sendPortalAccess(
        requisition.client.primaryContactEmail || requisition.client.email || '',
        requisition.client.name,
        requisition.title,
        requisition.shareToken,
        {
          primaryContactName: requisition.client.primaryContactName || undefined,
          department: requisition.department || undefined,
        }
      );
    } catch (error) {
      console.error('Error sending portal access notification:', error);
      return false;
    }
  }

  /**
   * Send notification when new candidate is added
   */
  static async notifyNewCandidate(
    requisitionId: string,
    candidateId: string
  ): Promise<boolean> {
    try {
      const requisition = await prisma.jobRequisition.findUnique({
        where: { id: requisitionId },
        include: {
          client: true,
        },
      });

      const candidate = await prisma.candidate.findUnique({
        where: { id: candidateId },
      });

      if (!requisition || !candidate || !requisition.shareToken) {
        return false;
      }

      return await NotificationService.sendNewCandidate(
        requisition.client.primaryContactEmail || requisition.client.email || '',
        requisition.client.name,
        requisition.title,
        candidate.name,
        requisition.shareToken,
        {
          primaryContactName: requisition.client.primaryContactName || undefined,
        }
      );
    } catch (error) {
      console.error('Error sending new candidate notification:', error);
      return false;
    }
  }

  /**
   * Send batch notification when multiple candidates are added
   */
  static async notifyNewCandidateBatch(
    requisitionId: string,
    candidateCount: number
  ): Promise<boolean> {
    try {
      const requisition = await prisma.jobRequisition.findUnique({
        where: { id: requisitionId },
        include: {
          client: true,
        },
      });

      if (!requisition || !requisition.shareToken) {
        return false;
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const portalUrl = `${baseUrl}/client-portal?token=${requisition.shareToken}`;

      return await NotificationService.sendNotification(
        'candidate_batch' as any,
        {
          clientEmail: requisition.client.primaryContactEmail || requisition.client.email || '',
          clientName: requisition.client.name,
          primaryContactName: requisition.client.primaryContactName || undefined,
          jobTitle: requisition.title,
          candidateCount,
          portalUrl,
          shareToken: requisition.shareToken,
        }
      );
    } catch (error) {
      console.error('Error sending candidate batch notification:', error);
      return false;
    }
  }

  /**
   * Send feedback reminder for pending candidates
   */
  static async sendFeedbackReminder(requisitionId: string): Promise<boolean> {
    try {
      const requisition = await prisma.jobRequisition.findUnique({
        where: { id: requisitionId },
        include: {
          client: true,
          applications: {
            include: {
              candidate: true,
            },
          },
          clientFeedback: true,
        },
      });

      if (!requisition || !requisition.shareToken) {
        return false;
      }

      // Count candidates without feedback
      const candidatesWithoutFeedback = requisition.applications.filter(
        (app) =>
          !requisition.clientFeedback.some(
            (feedback) => feedback.candidateId === app.candidateId
          )
      );

      if (candidatesWithoutFeedback.length === 0) {
        return false; // No pending feedback
      }

      return await NotificationService.sendFeedbackReminder(
        requisition.client.primaryContactEmail || requisition.client.email || '',
        requisition.client.name,
        requisition.title,
        candidatesWithoutFeedback.length,
        requisition.shareToken,
        {
          primaryContactName: requisition.client.primaryContactName || undefined,
        }
      );
    } catch (error) {
      console.error('Error sending feedback reminder:', error);
      return false;
    }
  }

  /**
   * Send interview requested notification
   */
  static async notifyInterviewRequested(
    requisitionId: string,
    candidateId: string
  ): Promise<boolean> {
    try {
      const requisition = await prisma.jobRequisition.findUnique({
        where: { id: requisitionId },
        include: {
          client: true,
        },
      });

      const candidate = await prisma.candidate.findUnique({
        where: { id: candidateId },
      });

      if (!requisition || !candidate || !requisition.shareToken) {
        return false;
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const portalUrl = `${baseUrl}/client-portal?token=${requisition.shareToken}`;

      return await NotificationService.sendNotification(
        'interview_requested' as any,
        {
          clientEmail: requisition.client.primaryContactEmail || requisition.client.email || '',
          clientName: requisition.client.name,
          primaryContactName: requisition.client.primaryContactName || undefined,
          jobTitle: requisition.title,
          candidateName: candidate.name,
          portalUrl,
          shareToken: requisition.shareToken,
        }
      );
    } catch (error) {
      console.error('Error sending interview requested notification:', error);
      return false;
    }
  }

  /**
   * Send weekly update for all active requisitions
   */
  static async sendWeeklyUpdates(userId: string): Promise<number> {
    try {
      const requisitions = await prisma.jobRequisition.findMany({
        where: {
          userId,
          status: 'open',
          isVisibleToClient: true,
        },
        include: {
          client: true,
          applications: {
            where: {
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
              },
            },
          },
          clientFeedback: true,
        },
      });

      let sentCount = 0;

      for (const requisition of requisitions) {
        if (!requisition.shareToken) continue;

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const portalUrl = `${baseUrl}/client-portal?token=${requisition.shareToken}`;

        const candidatesWithoutFeedback = requisition.applications.filter(
          (app) =>
            !requisition.clientFeedback.some(
              (feedback) => feedback.candidateId === app.candidateId
            )
        );

        const success = await NotificationService.sendNotification(
          'weekly_update' as any,
          {
            clientEmail: requisition.client.primaryContactEmail || requisition.client.email || '',
            clientName: requisition.client.name,
            primaryContactName: requisition.client.primaryContactName || undefined,
            jobTitle: requisition.title,
            candidateCount: requisition.applications.length,
            pendingFeedbackCount: candidatesWithoutFeedback.length,
            portalUrl,
            shareToken: requisition.shareToken,
          }
        );

        if (success) sentCount++;
      }

      return sentCount;
    } catch (error) {
      console.error('Error sending weekly updates:', error);
      return 0;
    }
  }

  /**
   * Auto-send feedback reminders for requisitions with pending feedback > 3 days
   */
  static async autoSendFeedbackReminders(userId: string): Promise<number> {
    try {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

      const requisitions = await prisma.jobRequisition.findMany({
        where: {
          userId,
          status: 'open',
          isVisibleToClient: true,
        },
        include: {
          client: true,
          applications: {
            where: {
              createdAt: {
                lte: threeDaysAgo,
              },
            },
            include: {
              candidate: true,
            },
          },
          clientFeedback: true,
        },
      });

      let sentCount = 0;

      for (const requisition of requisitions) {
        const candidatesWithoutFeedback = requisition.applications.filter(
          (app) =>
            !requisition.clientFeedback.some(
              (feedback) => feedback.candidateId === app.candidateId
            )
        );

        if (candidatesWithoutFeedback.length > 0) {
          const success = await this.sendFeedbackReminder(requisition.id);
          if (success) sentCount++;
        }
      }

      return sentCount;
    } catch (error) {
      console.error('Error auto-sending feedback reminders:', error);
      return 0;
    }
  }
}
