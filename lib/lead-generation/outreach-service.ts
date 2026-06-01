import { db } from '@/lib/db';
import { emailService, EmailOptions } from '@/lib/email/service';
import { outreachTemplateEngine } from './outreach-templates';
import { LeadStatus } from '@prisma/client';

export interface OutreachSequenceStep {
  id: string;
  stepNumber: number;
  templateId: string;
  waitDays: number;
  conditions?: {
    field: string;
    operator: string;
    value: string;
  }[];
}

export interface OutreachCampaignConfig {
  name: string;
  description?: string;
  sequence: OutreachSequenceStep[];
  targetAudience: {
    industry?: string[];
    companySize?: string[];
    seniority?: string[];
  };
  senderInfo: {
    name: string;
    email: string;
    agencyName: string;
  };
  schedule: {
    timezone: string;
    businessHoursOnly: boolean;
    startHour: number; // 0-23
    endHour: number; // 0-23
    weekdaysOnly: boolean;
  };
}

export interface CampaignMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  meetings: number;
}

export class OutreachService {
  /**
   * Create and start an outreach campaign
   */
  async createCampaign(
    userId: string,
    config: OutreachCampaignConfig,
    leadIds: string[]
  ) {
    // Verify leads belong to user
    const leads = await db.agencyLead.findMany({
      where: {
        id: { in: leadIds },
        userId
      }
    });

    if (leads.length !== leadIds.length) {
      throw new Error('Some leads not found or not accessible');
    }

    // Create campaign record (we'd need to add this to schema)
    // For now, we'll create individual activities for each lead

    const results = [];

    for (const lead of leads) {
      try {
        const result = await this.startSequenceForLead(userId, lead.id, config);
        results.push({
          leadId: lead.id,
          success: true,
          result
        });
      } catch (error) {
        results.push({
          leadId: lead.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  /**
   * Start an outreach sequence for a specific lead
   */
  async startSequenceForLead(
    userId: string,
    leadId: string,
    config: OutreachCampaignConfig
  ) {
    const lead = await db.agencyLead.findFirst({
      where: { id: leadId, userId }
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    const activities = [];

    for (const step of config.sequence) {
      const scheduledTime = this.calculateScheduledTime(
        config.schedule,
        step.stepNumber === 1 ? 0 : step.waitDays
      );

      const activity = await db.outreachActivity.create({
        data: {
          userId,
          leadId,
          templateId: step.templateId,
          type: 'email',
          status: 'scheduled',
          scheduledFor: scheduledTime
        }
      });

      activities.push(activity);
    }

    return activities;
  }

  /**
   * Process scheduled outreach activities
   */
  async processScheduledOutreach() {
    const now = new Date();

    const scheduledActivities = await db.outreachActivity.findMany({
      where: {
        status: 'scheduled',
        scheduledFor: {
          lte: now
        }
      },
      include: {
        lead: true,
        user: true
      },
      orderBy: {
        scheduledFor: 'asc'
      },
      take: 50 // Process in batches
    });

    const results = [];

    for (const activity of scheduledActivities) {
      try {
        const result = await this.sendOutreachEmail(activity);
        results.push({
          activityId: activity.id,
          success: result.success,
          messageId: result.messageId,
          error: result.error
        });
      } catch (error) {
        results.push({
          activityId: activity.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  /**
   * Send an individual outreach email
   */
  async sendOutreachEmail(activity: any) {
    const { lead, templateId, userId } = activity;

    if (!lead.contactEmail) {
      throw new Error('Lead has no email address');
    }

    // Get user info for sender details
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get template
    const templates = outreachTemplateEngine.getTemplates();
    const template = templates.find(t => t.id === templateId);

    if (!template) {
      throw new Error('Template not found');
    }

    // Generate personalized message
    const senderInfo = {
      name: `${user.firstName} ${user.lastName}`,
      agencyName: 'Your Agency', // Could be from user profile or settings
      similarClient: 'a similar company' // Could be enhanced with actual client data
    };

    const company = {
      name: lead.companyName,
      industry: 'Software', // Would come from enriched lead data
      techStack: ['React', 'Node.js'], // Would come from enriched lead data
    };

    const contact = {
      firstName: lead.contactName?.split(' ')[0] || 'there',
      lastName: lead.contactName?.split(' ').slice(1).join(' ') || '',
      jobTitle: 'Decision Maker', // Would come from enriched lead data
    };

    const variables = outreachTemplateEngine.generateVariablesFromProspect(
      company,
      contact,
      senderInfo
    );

    const message = outreachTemplateEngine.generateMessage(template, variables);

    // Send email
    const emailOptions: EmailOptions = {
      to: lead.contactEmail,
      from: user.email,
      subject: message.subject || 'Partnership Opportunity',
      html: this.convertMarkdownToHtml(message.content),
      text: message.content,
      trackingEnabled: true,
      tags: ['outreach', 'lead-generation', templateId],
      replyTo: user.email,
      customData: {
        leadId,
        userId,
        templateId,
        activityType: 'outreach',
        activityId: activity.id,
      }
    };

    const result = await emailService.sendEmail(emailOptions);

    // Update activity status
    await db.outreachActivity.update({
      where: { id: activity.id },
      data: {
        status: result.success ? 'SENT' : 'FAILED',
        sentAt: result.success ? new Date() : undefined,
        content: message.content,
        metadata: {
          ...activity.metadata,
          messageId: result.messageId,
          templateId,
          subject: message.subject,
        }
      }
    });

    // Create communication record
    if (result.success) {
      await db.communication.create({
        data: {
          userId,
          leadId: lead.id,
          type: 'EMAIL',
          subject: message.subject,
          content: message.content,
          direction: 'outbound',
          sentAt: new Date()
        }
      });

      // Update lead status if it's the first contact
      if (lead.status === LeadStatus.NEW) {
        await db.agencyLead.update({
          where: { id: lead.id },
          data: {
            status: LeadStatus.CONTACTED,
            lastContactDate: new Date()
          }
        });
      }
    }

    return result;
  }

  /**
   * Handle email responses and update lead status
   */
  async handleEmailResponse(
    userId: string,
    leadId: string,
    responseType: 'reply' | 'click' | 'open' | 'bounce' | 'unsubscribe'
  ) {
    const lead = await db.agencyLead.findFirst({
      where: { id: leadId, userId }
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    // Update lead status based on response type
    let newStatus = lead.status;
    if (responseType === 'reply') {
      newStatus = LeadStatus.QUALIFIED;
    }

    await db.agencyLead.update({
      where: { id: leadId },
      data: {
        status: newStatus,
        ...(responseType === 'reply' && { lastContactDate: new Date() })
      }
    });

    // Create communication record for replies
    if (responseType === 'reply') {
      await db.communication.create({
        data: {
          userId,
          leadId,
          type: 'EMAIL',
          direction: 'inbound',
          receivedAt: new Date(),
          content: 'Lead responded to outreach email'
        }
      });
    }

    // Cancel remaining scheduled activities if unsubscribed
    if (responseType === 'unsubscribe') {
      await db.outreachActivity.updateMany({
        where: {
          userId,
          leadId,
          status: 'scheduled'
        },
        data: {
          status: 'cancelled'
        }
      });
    }
  }

  /**
   * Get campaign analytics
   */
  async getCampaignMetrics(
    userId: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<CampaignMetrics> {
    const where = {
      userId,
      ...(dateRange && {
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      })
    };

    const [sent, communications, leads] = await Promise.all([
      // Count sent activities
      db.outreachActivity.count({
        where: {
          ...where,
          status: 'sent'
        }
      }),

      // Get communication stats (for replies)
      db.communication.count({
        where: {
          ...where,
          type: 'EMAIL',
          direction: 'inbound'
        }
      }),

      // Get qualified leads (meetings/success)
      db.agencyLead.count({
        where: {
          ...where,
          status: LeadStatus.QUALIFIED
        }
      })
    ]);

    // For now, we'll use basic metrics
    // In production, you'd integrate with email provider webhooks for accurate tracking
    return {
      sent,
      delivered: Math.round(sent * 0.95), // Assume 95% delivery rate
      opened: Math.round(sent * 0.25), // Assume 25% open rate
      clicked: Math.round(sent * 0.05), // Assume 5% click rate
      replied: communications,
      bounced: Math.round(sent * 0.05), // Assume 5% bounce rate
      unsubscribed: Math.round(sent * 0.01), // Assume 1% unsubscribe rate
      meetings: leads // Qualified leads as proxy for meetings
    };
  }

  /**
   * Calculate the next scheduled time based on business rules
   */
  private calculateScheduledTime(
    schedule: OutreachCampaignConfig['schedule'],
    waitDays: number
  ): Date {
    const now = new Date();
    const scheduledTime = new Date(now.getTime() + (waitDays * 24 * 60 * 60 * 1000));

    if (!schedule.businessHoursOnly && !schedule.weekdaysOnly) {
      return scheduledTime;
    }

    // Adjust for business hours
    if (schedule.businessHoursOnly) {
      const hour = scheduledTime.getHours();
      if (hour < schedule.startHour) {
        scheduledTime.setHours(schedule.startHour, 0, 0, 0);
      } else if (hour >= schedule.endHour) {
        // Move to next day at start hour
        scheduledTime.setDate(scheduledTime.getDate() + 1);
        scheduledTime.setHours(schedule.startHour, 0, 0, 0);
      }
    }

    // Adjust for weekdays only
    if (schedule.weekdaysOnly) {
      const dayOfWeek = scheduledTime.getDay();
      if (dayOfWeek === 0) { // Sunday
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      } else if (dayOfWeek === 6) { // Saturday
        scheduledTime.setDate(scheduledTime.getDate() + 2);
      }
    }

    return scheduledTime;
  }

  /**
   * Simple markdown to HTML converter
   */
  private convertMarkdownToHtml(markdown: string): string {
    return markdown
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>')
      .replace(/• /g, '<li>')
      .replace(/<p><li>/g, '<ul><li>')
      .replace(/<\/p>$/g, '</ul>');
  }
}

export const outreachService = new OutreachService();