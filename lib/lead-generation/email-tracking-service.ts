import { db } from '@/lib/db';

export interface EmailEventData {
  type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'unsubscribed' | 'replied';
  messageId: string;
  timestamp?: string;
  email?: string;
  data?: Record<string, any>;
}

export class EmailTrackingService {
  static async trackEmailEvent(eventData: EmailEventData) {
    try {
      const { type, messageId, timestamp, email, data } = eventData;

      // Find the corresponding outreach activity
      const activity = await db.outreachActivity.findFirst({
        where: {
          metadata: {
            path: ['messageId'],
            equals: messageId,
          },
        },
        include: {
          lead: true,
        },
      });

      if (!activity) {
        console.warn('No activity found for messageId:', messageId);
        return null;
      }

      // Update activity metadata with event data
      const updatedMetadata = {
        ...activity.metadata,
        events: [
          ...(activity.metadata?.events || []),
          {
            type,
            timestamp: timestamp || new Date().toISOString(),
            data,
          },
        ],
        // Update tracking flags
        ...(type === 'delivered' && { delivered: true, deliveredAt: timestamp }),
        ...(type === 'opened' && { opened: true, openedAt: timestamp }),
        ...(type === 'clicked' && { clicked: true, clickedAt: timestamp }),
        ...(type === 'bounced' && { bounced: true, bouncedAt: timestamp }),
        ...(type === 'complained' && { complained: true, complainedAt: timestamp }),
        ...(type === 'unsubscribed' && { unsubscribed: true, unsubscribedAt: timestamp }),
        ...(type === 'replied' && { replied: true, repliedAt: timestamp }),
      };

      // Update activity status based on event type
      const newStatus = this.getStatusFromEventType(type, activity.status);

      await db.outreachActivity.update({
        where: { id: activity.id },
        data: {
          metadata: updatedMetadata,
          status: newStatus,
        },
      });

      // Handle special event types
      if (type === 'replied') {
        await this.handleEmailReply(activity, data || {});
      } else if (type === 'opened' && !activity.metadata?.opened) {
        await this.handleFirstOpen(activity);
      } else if (type === 'clicked' && !activity.metadata?.clicked) {
        await this.handleFirstClick(activity);
      }

      return {
        activityId: activity.id,
        leadId: activity.leadId,
        eventType: type,
        processed: true,
      };
    } catch (error) {
      console.error('Error tracking email event:', error);
      throw error;
    }
  }

  private static getStatusFromEventType(eventType: string, currentStatus: string): string {
    switch (eventType) {
      case 'delivered':
        return currentStatus === 'PENDING' ? 'SENT' : currentStatus;
      case 'bounced':
        return 'FAILED';
      case 'opened':
        return currentStatus === 'SENT' ? 'OPENED' : currentStatus;
      case 'clicked':
        return 'CLICKED';
      case 'replied':
        return 'REPLIED';
      default:
        return currentStatus;
    }
  }

  private static async handleEmailReply(activity: any, data: Record<string, any>) {
    try {
      // Create a communication record for the reply
      await db.communication.create({
        data: {
          leadId: activity.leadId,
          userId: activity.userId,
          type: 'EMAIL',
          direction: 'INBOUND',
          subject: data.subject || 'Re: ' + (activity.metadata?.subject || ''),
          content: data.text || data.html || 'Email reply received',
          metadata: {
            messageId: data.messageId,
            inReplyTo: activity.metadata?.messageId,
            activityId: activity.id,
            fromAddress: data.from,
          },
          createdAt: new Date(),
        },
      });

      // Update lead status if it's still in early stages
      const lead = await db.agencyLead.findUnique({
        where: { id: activity.leadId },
      });

      if (lead && ['NEW', 'CONTACTED'].includes(lead.status)) {
        await db.agencyLead.update({
          where: { id: lead.id },
          data: {
            status: 'REPLIED',
            lastContactedAt: new Date(),
          },
        });
      }
    } catch (error) {
      console.error('Error handling email reply:', error);
    }
  }

  private static async handleFirstOpen(activity: any) {
    try {
      // Update lead's last contacted timestamp
      await db.agencyLead.update({
        where: { id: activity.leadId },
        data: {
          lastContactedAt: new Date(),
        },
      });

      // You could add additional logic here, like triggering follow-up sequences
    } catch (error) {
      console.error('Error handling first open:', error);
    }
  }

  private static async handleFirstClick(activity: any) {
    try {
      // Mark lead as engaged if they clicked
      const lead = await db.agencyLead.findUnique({
        where: { id: activity.leadId },
      });

      if (lead && lead.status === 'CONTACTED') {
        await db.agencyLead.update({
          where: { id: lead.id },
          data: {
            status: 'ENGAGED',
            lastContactedAt: new Date(),
          },
        });
      }

      // You could trigger follow-up actions here
    } catch (error) {
      console.error('Error handling first click:', error);
    }
  }

  // Method to get email performance metrics
  static async getEmailMetrics(userId: string, timeRange?: { from: Date; to: Date }) {
    try {
      const whereClause: any = {
        userId,
        type: 'EMAIL',
      };

      if (timeRange) {
        whereClause.scheduledAt = {
          gte: timeRange.from,
          lte: timeRange.to,
        };
      }

      const activities = await db.outreachActivity.findMany({
        where: whereClause,
        include: {
          lead: true,
        },
      });

      const metrics = {
        totalSent: activities.filter(a => a.status === 'SENT' || a.status === 'OPENED' || a.status === 'CLICKED').length,
        delivered: activities.filter(a => a.metadata?.delivered).length,
        opened: activities.filter(a => a.metadata?.opened).length,
        clicked: activities.filter(a => a.metadata?.clicked).length,
        replied: activities.filter(a => a.metadata?.replied).length,
        bounced: activities.filter(a => a.metadata?.bounced).length,
        complained: activities.filter(a => a.metadata?.complained).length,
        unsubscribed: activities.filter(a => a.metadata?.unsubscribed).length,
      };

      // Calculate rates
      const rates = {
        deliveryRate: metrics.totalSent > 0 ? (metrics.delivered / metrics.totalSent) * 100 : 0,
        openRate: metrics.totalSent > 0 ? (metrics.opened / metrics.totalSent) * 100 : 0,
        clickRate: metrics.totalSent > 0 ? (metrics.clicked / metrics.totalSent) * 100 : 0,
        replyRate: metrics.totalSent > 0 ? (metrics.replied / metrics.totalSent) * 100 : 0,
        bounceRate: metrics.totalSent > 0 ? (metrics.bounced / metrics.totalSent) * 100 : 0,
        complaintRate: metrics.totalSent > 0 ? (metrics.complained / metrics.totalSent) * 100 : 0,
        unsubscribeRate: metrics.totalSent > 0 ? (metrics.unsubscribed / metrics.totalSent) * 100 : 0,
      };

      return {
        ...metrics,
        ...rates,
        activities,
      };
    } catch (error) {
      console.error('Error getting email metrics:', error);
      throw error;
    }
  }

  // Method to get template performance
  static async getTemplatePerformance(userId: string, templateId?: string) {
    try {
      const whereClause: any = {
        userId,
        type: 'EMAIL',
      };

      if (templateId) {
        whereClause.metadata = {
          path: ['templateId'],
          equals: templateId,
        };
      }

      const activities = await db.outreachActivity.findMany({
        where: whereClause,
      });

      // Group by template
      const templateStats = activities.reduce((acc: Record<string, any>, activity) => {
        const tId = activity.metadata?.templateId as string || 'unknown';

        if (!acc[tId]) {
          acc[tId] = {
            templateId: tId,
            sent: 0,
            opened: 0,
            clicked: 0,
            replied: 0,
            bounced: 0,
          };
        }

        acc[tId].sent++;
        if (activity.metadata?.opened) acc[tId].opened++;
        if (activity.metadata?.clicked) acc[tId].clicked++;
        if (activity.metadata?.replied) acc[tId].replied++;
        if (activity.metadata?.bounced) acc[tId].bounced++;

        return acc;
      }, {});

      // Calculate rates for each template
      return Object.values(templateStats).map((stats: any) => ({
        ...stats,
        openRate: stats.sent > 0 ? (stats.opened / stats.sent) * 100 : 0,
        clickRate: stats.sent > 0 ? (stats.clicked / stats.sent) * 100 : 0,
        replyRate: stats.sent > 0 ? (stats.replied / stats.sent) * 100 : 0,
        bounceRate: stats.sent > 0 ? (stats.bounced / stats.sent) * 100 : 0,
      }));
    } catch (error) {
      console.error('Error getting template performance:', error);
      throw error;
    }
  }
}