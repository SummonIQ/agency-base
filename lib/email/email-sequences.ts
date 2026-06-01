/**
 * Email Sequence Automation System
 * Handles multi-step email campaigns, scheduling, and recipient management
 */

import { emailService, EmailMessage } from './email-service';
import { emailTemplateEngine, TemplateRenderOptions } from './email-templates';

export interface EmailSequence {
  id: string;
  name: string;
  description: string;
  category: 'lead_generation' | 'recruiting' | 'nurture' | 'onboarding' | 'follow_up';
  isActive: boolean;
  steps: SequenceStep[];
  settings: SequenceSettings;
  triggers: SequenceTrigger[];
  exitConditions: ExitCondition[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  stats: SequenceStats;
}

export interface SequenceStep {
  id: string;
  stepNumber: number;
  name: string;
  templateId: string;
  delay: SequenceDelay;
  sendConditions?: SendCondition[];
  abTestConfig?: {
    isEnabled: boolean;
    variants: string[]; // Template IDs for A/B testing
    trafficSplit: number[];
    winnerCriteria: 'open_rate' | 'click_rate' | 'reply_rate';
  };
  isActive: boolean;
}

export interface SequenceDelay {
  type: 'immediate' | 'delay' | 'specific_time' | 'business_days' | 'wait_for_action';
  value?: number; // Hours, days, etc.
  unit?: 'minutes' | 'hours' | 'days' | 'weeks';
  time?: string; // For specific_time: "09:00"
  timezone?: string;
  action?: 'email_opened' | 'email_clicked' | 'link_clicked' | 'replied' | 'form_submitted';
  maxWait?: number; // Max wait time for action-based delays
}

export interface SendCondition {
  type: 'day_of_week' | 'time_range' | 'engagement_level' | 'profile_field' | 'custom';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
  value: any;
  field?: string;
}

export interface SequenceSettings {
  fromEmail: string;
  fromName: string;
  replyToEmail?: string;
  sendingHours: {
    start: string; // "09:00"
    end: string; // "17:00"
    timezone: string;
  };
  sendingDays: string[]; // ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  maxEmailsPerDay: number;
  respectUnsubscribes: boolean;
  respectBounces: boolean;
  stopOnReply: boolean;
  trackEngagement: boolean;
  utmParameters?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
  };
}

export interface SequenceTrigger {
  type: 'manual' | 'webhook' | 'form_submission' | 'lead_created' | 'tag_added' | 'date_field';
  conditions?: Record<string, any>;
  isActive: boolean;
}

export interface ExitCondition {
  type: 'replied' | 'unsubscribed' | 'bounced' | 'converted' | 'tag_added' | 'tag_removed' | 'time_limit';
  value?: any;
  isActive: boolean;
}

export interface SequenceStats {
  totalRecipients: number;
  activeRecipients: number;
  completedRecipients: number;
  totalEmailsSent: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
  conversionRate: number;
  unsubscribeRate: number;
  bounceRate: number;
  lastUpdated: string;
}

export interface SequenceRecipient {
  id: string;
  sequenceId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  customFields: Record<string, any>;
  status: 'active' | 'paused' | 'completed' | 'bounced' | 'unsubscribed' | 'replied' | 'exited';
  currentStep: number;
  nextSendAt?: string;
  addedAt: string;
  completedAt?: string;
  exitedAt?: string;
  exitReason?: string;
  engagementScore: number;
  lastOpenedAt?: string;
  lastClickedAt?: string;
  repliedAt?: string;
  conversions: SequenceConversion[];
}

export interface SequenceConversion {
  id: string;
  type: 'demo_booked' | 'meeting_scheduled' | 'form_submitted' | 'purchase_made' | 'trial_started';
  value?: number;
  metadata?: Record<string, any>;
  convertedAt: string;
}

export interface ScheduledEmail {
  id: string;
  sequenceId: string;
  recipientId: string;
  stepId: string;
  templateId: string;
  scheduledFor: string;
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled';
  sentAt?: string;
  messageId?: string;
  error?: string;
  retryCount: number;
  maxRetries: number;
}

/**
 * Email sequence automation engine
 */
export class EmailSequenceEngine {
  private sequences: Map<string, EmailSequence> = new Map();
  private recipients: Map<string, SequenceRecipient> = new Map();
  private scheduledEmails: Map<string, ScheduledEmail> = new Map();

  constructor() {
    this.loadDefaultSequences();
    this.startScheduler();
  }

  /**
   * Create new email sequence
   */
  async createSequence(sequenceData: Partial<EmailSequence> & { name: string }): Promise<EmailSequence> {
    const id = this.generateId('seq');

    const sequence: EmailSequence = {
      id,
      name: sequenceData.name,
      description: sequenceData.description || '',
      category: sequenceData.category || 'lead_generation',
      isActive: sequenceData.isActive ?? true,
      steps: sequenceData.steps || [],
      settings: sequenceData.settings || this.getDefaultSettings(),
      triggers: sequenceData.triggers || [],
      exitConditions: sequenceData.exitConditions || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: sequenceData.createdBy || 'system',
      stats: this.initializeStats()
    };

    this.sequences.set(id, sequence);
    return sequence;
  }

  /**
   * Add recipient to sequence
   */
  async addRecipientToSequence(sequenceId: string, recipientData: {
    email: string;
    firstName?: string;
    lastName?: string;
    customFields?: Record<string, any>;
  }): Promise<SequenceRecipient> {
    const sequence = this.sequences.get(sequenceId);

    if (!sequence) {
      throw new Error(`Sequence not found: ${sequenceId}`);
    }

    if (!sequence.isActive) {
      throw new Error(`Sequence is not active: ${sequenceId}`);
    }

    const recipientId = this.generateId('rec');

    const recipient: SequenceRecipient = {
      id: recipientId,
      sequenceId,
      email: recipientData.email,
      firstName: recipientData.firstName,
      lastName: recipientData.lastName,
      customFields: recipientData.customFields || {},
      status: 'active',
      currentStep: 0,
      addedAt: new Date().toISOString(),
      engagementScore: 0,
      conversions: []
    };

    this.recipients.set(recipientId, recipient);

    // Schedule first step
    await this.scheduleNextStep(recipient);

    // Update sequence stats
    this.updateSequenceStats(sequenceId);

    return recipient;
  }

  /**
   * Schedule next step for recipient
   */
  private async scheduleNextStep(recipient: SequenceRecipient): Promise<void> {
    const sequence = this.sequences.get(recipient.sequenceId);

    if (!sequence || !sequence.isActive) return;

    const nextStepIndex = recipient.currentStep;
    const step = sequence.steps[nextStepIndex];

    if (!step || !step.isActive) {
      // Mark sequence as completed for this recipient
      recipient.status = 'completed';
      recipient.completedAt = new Date().toISOString();
      return;
    }

    // Check send conditions
    if (step.sendConditions && !(await this.checkSendConditions(step.sendConditions, recipient))) {
      // Skip this step and try the next one
      recipient.currentStep++;
      await this.scheduleNextStep(recipient);
      return;
    }

    // Calculate send time based on delay
    const sendTime = this.calculateSendTime(step.delay, recipient);

    const scheduledEmailId = this.generateId('email');

    const scheduledEmail: ScheduledEmail = {
      id: scheduledEmailId,
      sequenceId: recipient.sequenceId,
      recipientId: recipient.id,
      stepId: step.id,
      templateId: step.templateId,
      scheduledFor: sendTime.toISOString(),
      status: 'scheduled',
      retryCount: 0,
      maxRetries: 3
    };

    this.scheduledEmails.set(scheduledEmailId, scheduledEmail);

    recipient.nextSendAt = sendTime.toISOString();
  }

  /**
   * Process scheduled emails
   */
  async processScheduledEmails(): Promise<void> {
    const now = new Date();

    for (const [emailId, scheduledEmail] of this.scheduledEmails) {
      if (scheduledEmail.status !== 'scheduled') continue;

      const sendTime = new Date(scheduledEmail.scheduledFor);

      if (sendTime <= now) {
        await this.sendScheduledEmail(scheduledEmail);
      }
    }
  }

  /**
   * Send scheduled email
   */
  private async sendScheduledEmail(scheduledEmail: ScheduledEmail): Promise<void> {
    try {
      const recipient = this.recipients.get(scheduledEmail.recipientId);
      const sequence = this.sequences.get(scheduledEmail.sequenceId);

      if (!recipient || !sequence) {
        scheduledEmail.status = 'failed';
        scheduledEmail.error = 'Recipient or sequence not found';
        return;
      }

      // Check if recipient is still eligible
      if (recipient.status !== 'active') {
        scheduledEmail.status = 'cancelled';
        return;
      }

      // Check exit conditions
      if (await this.checkExitConditions(sequence.exitConditions, recipient)) {
        recipient.status = 'exited';
        recipient.exitedAt = new Date().toISOString();
        scheduledEmail.status = 'cancelled';
        return;
      }

      // Render email template
      const templateOptions: TemplateRenderOptions = {
        variables: {
          first_name: recipient.firstName || 'there',
          last_name: recipient.lastName || '',
          email: recipient.email,
          ...recipient.customFields
        },
        personalization: {
          recipientName: recipient.firstName
        },
        tracking: {
          campaignId: scheduledEmail.sequenceId,
          sequenceId: scheduledEmail.sequenceId,
          stepNumber: recipient.currentStep + 1,
          utm: sequence.settings.utmParameters
        }
      };

      const renderedTemplate = await emailTemplateEngine.renderTemplate(
        scheduledEmail.templateId,
        templateOptions
      );

      // Send email
      const emailMessage: EmailMessage = {
        to: recipient.email,
        from: sequence.settings.fromEmail,
        fromName: sequence.settings.fromName,
        replyTo: sequence.settings.replyToEmail,
        subject: renderedTemplate.subject,
        html: renderedTemplate.html,
        text: renderedTemplate.text,
        tags: ['sequence', sequence.category, scheduledEmail.sequenceId],
        campaignId: scheduledEmail.sequenceId,
        sequenceId: scheduledEmail.sequenceId,
        stepNumber: recipient.currentStep + 1,
        trackingEnabled: sequence.settings.trackEngagement,
        customArgs: {
          recipient_id: recipient.id,
          sequence_id: scheduledEmail.sequenceId,
          step_id: scheduledEmail.stepId
        }
      };

      const result = await emailService.sendEmail(emailMessage);

      if (result.success) {
        scheduledEmail.status = 'sent';
        scheduledEmail.sentAt = new Date().toISOString();
        scheduledEmail.messageId = result.messageId;

        // Update recipient
        recipient.currentStep++;

        // Schedule next step
        await this.scheduleNextStep(recipient);

        // Update template metrics
        await emailTemplateEngine.updateTemplateMetrics(scheduledEmail.templateId, 'sent');

      } else {
        scheduledEmail.retryCount++;

        if (scheduledEmail.retryCount >= scheduledEmail.maxRetries) {
          scheduledEmail.status = 'failed';
          scheduledEmail.error = result.error;
        } else {
          // Retry in 1 hour
          const retryTime = new Date();
          retryTime.setHours(retryTime.getHours() + 1);
          scheduledEmail.scheduledFor = retryTime.toISOString();
        }
      }

    } catch (error) {
      scheduledEmail.status = 'failed';
      scheduledEmail.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Update sequence stats
    this.updateSequenceStats(scheduledEmail.sequenceId);
  }

  /**
   * Handle email events from webhooks
   */
  async handleEmailEvent(event: {
    type: 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'unsubscribed' | 'replied';
    messageId?: string;
    email: string;
    customArgs?: Record<string, string>;
    timestamp: string;
    url?: string;
  }): Promise<void> {
    const recipientId = event.customArgs?.recipient_id;
    const sequenceId = event.customArgs?.sequence_id;
    const stepId = event.customArgs?.step_id;

    if (!recipientId || !sequenceId) return;

    const recipient = this.recipients.get(recipientId);

    if (!recipient) return;

    // Update recipient based on event type
    switch (event.type) {
      case 'delivered':
        // Email was delivered successfully
        break;

      case 'opened':
        recipient.lastOpenedAt = event.timestamp;
        recipient.engagementScore += 1;

        if (stepId) {
          // Find scheduled email and mark as opened
          for (const [emailId, scheduledEmail] of this.scheduledEmails) {
            if (scheduledEmail.stepId === stepId && scheduledEmail.recipientId === recipientId) {
              await emailTemplateEngine.updateTemplateMetrics(scheduledEmail.templateId, 'opened');
              break;
            }
          }
        }
        break;

      case 'clicked':
        recipient.lastClickedAt = event.timestamp;
        recipient.engagementScore += 2;

        if (stepId) {
          for (const [emailId, scheduledEmail] of this.scheduledEmails) {
            if (scheduledEmail.stepId === stepId && scheduledEmail.recipientId === recipientId) {
              await emailTemplateEngine.updateTemplateMetrics(scheduledEmail.templateId, 'clicked');
              break;
            }
          }
        }
        break;

      case 'replied':
        recipient.repliedAt = event.timestamp;
        recipient.engagementScore += 5;

        // Check if sequence should stop on reply
        const sequence = this.sequences.get(sequenceId);
        if (sequence?.settings.stopOnReply) {
          recipient.status = 'replied';
          recipient.exitedAt = event.timestamp;
          recipient.exitReason = 'replied';

          // Cancel future emails
          this.cancelFutureEmails(recipientId);
        }

        if (stepId) {
          for (const [emailId, scheduledEmail] of this.scheduledEmails) {
            if (scheduledEmail.stepId === stepId && scheduledEmail.recipientId === recipientId) {
              await emailTemplateEngine.updateTemplateMetrics(scheduledEmail.templateId, 'replied');
              break;
            }
          }
        }
        break;

      case 'bounced':
        if (recipient.status === 'active') {
          recipient.status = 'bounced';
          recipient.exitedAt = event.timestamp;
          recipient.exitReason = 'bounced';

          // Cancel future emails
          this.cancelFutureEmails(recipientId);
        }
        break;

      case 'unsubscribed':
        recipient.status = 'unsubscribed';
        recipient.exitedAt = event.timestamp;
        recipient.exitReason = 'unsubscribed';

        // Cancel future emails
        this.cancelFutureEmails(recipientId);
        break;

      case 'complained':
        // Similar to unsubscribe but more severe
        recipient.status = 'unsubscribed';
        recipient.exitedAt = event.timestamp;
        recipient.exitReason = 'spam_complaint';

        // Cancel future emails
        this.cancelFutureEmails(recipientId);
        break;
    }

    // Update sequence stats
    this.updateSequenceStats(sequenceId);
  }

  /**
   * Get sequence analytics
   */
  getSequenceAnalytics(sequenceId: string, dateRange?: { from: string; to: string }): SequenceStats {
    const sequence = this.sequences.get(sequenceId);

    if (!sequence) {
      throw new Error(`Sequence not found: ${sequenceId}`);
    }

    return sequence.stats;
  }

  /**
   * List sequences with filtering
   */
  listSequences(filters: {
    category?: string;
    isActive?: boolean;
    createdBy?: string;
  } = {}): EmailSequence[] {
    return Array.from(this.sequences.values())
      .filter(sequence => {
        if (filters.category && sequence.category !== filters.category) return false;
        if (filters.isActive !== undefined && sequence.isActive !== filters.isActive) return false;
        if (filters.createdBy && sequence.createdBy !== filters.createdBy) return false;
        return true;
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  /**
   * Private helper methods
   */
  private calculateSendTime(delay: SequenceDelay, recipient: SequenceRecipient): Date {
    const now = new Date();

    switch (delay.type) {
      case 'immediate':
        return now;

      case 'delay':
        const delayMs = this.convertToMilliseconds(delay.value || 0, delay.unit || 'hours');
        return new Date(now.getTime() + delayMs);

      case 'specific_time':
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (delay.time) {
          const [hours, minutes] = delay.time.split(':').map(Number);
          tomorrow.setHours(hours, minutes, 0, 0);
        }

        return tomorrow;

      case 'business_days':
        const businessDays = delay.value || 1;
        let targetDate = new Date(now);
        let addedDays = 0;

        while (addedDays < businessDays) {
          targetDate.setDate(targetDate.getDate() + 1);
          const dayOfWeek = targetDate.getDay();

          // Skip weekends (0 = Sunday, 6 = Saturday)
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            addedDays++;
          }
        }

        return targetDate;

      case 'wait_for_action':
        // For now, fallback to a default delay
        // In production, this would check for the specific action
        const maxWaitMs = this.convertToMilliseconds(delay.maxWait || 24, 'hours');
        return new Date(now.getTime() + maxWaitMs);

      default:
        return now;
    }
  }

  private convertToMilliseconds(value: number, unit: string): number {
    switch (unit) {
      case 'minutes':
        return value * 60 * 1000;
      case 'hours':
        return value * 60 * 60 * 1000;
      case 'days':
        return value * 24 * 60 * 60 * 1000;
      case 'weeks':
        return value * 7 * 24 * 60 * 60 * 1000;
      default:
        return value * 60 * 60 * 1000; // Default to hours
    }
  }

  private async checkSendConditions(conditions: SendCondition[], recipient: SequenceRecipient): Promise<boolean> {
    for (const condition of conditions) {
      if (!(await this.evaluateCondition(condition, recipient))) {
        return false;
      }
    }
    return true;
  }

  private async checkExitConditions(conditions: ExitCondition[], recipient: SequenceRecipient): Promise<boolean> {
    for (const condition of conditions) {
      if (await this.evaluateExitCondition(condition, recipient)) {
        return true;
      }
    }
    return false;
  }

  private async evaluateCondition(condition: SendCondition, recipient: SequenceRecipient): Promise<boolean> {
    // Implement condition evaluation logic
    // This would check various conditions like time of day, engagement level, etc.
    return true; // Simplified for now
  }

  private async evaluateExitCondition(condition: ExitCondition, recipient: SequenceRecipient): Promise<boolean> {
    switch (condition.type) {
      case 'replied':
        return !!recipient.repliedAt;
      case 'unsubscribed':
        return recipient.status === 'unsubscribed';
      case 'bounced':
        return recipient.status === 'bounced';
      default:
        return false;
    }
  }

  private cancelFutureEmails(recipientId: string): void {
    for (const [emailId, scheduledEmail] of this.scheduledEmails) {
      if (scheduledEmail.recipientId === recipientId && scheduledEmail.status === 'scheduled') {
        scheduledEmail.status = 'cancelled';
      }
    }
  }

  private updateSequenceStats(sequenceId: string): void {
    const sequence = this.sequences.get(sequenceId);
    if (!sequence) return;

    const recipients = Array.from(this.recipients.values())
      .filter(r => r.sequenceId === sequenceId);

    const totalRecipients = recipients.length;
    const activeRecipients = recipients.filter(r => r.status === 'active').length;
    const completedRecipients = recipients.filter(r => r.status === 'completed').length;

    // Calculate email stats from scheduled emails
    const emails = Array.from(this.scheduledEmails.values())
      .filter(e => e.sequenceId === sequenceId);

    const totalEmailsSent = emails.filter(e => e.status === 'sent').length;

    sequence.stats = {
      totalRecipients,
      activeRecipients,
      completedRecipients,
      totalEmailsSent,
      deliveryRate: 95, // Would calculate from actual delivery events
      openRate: 22, // Would calculate from open events
      clickRate: 3, // Would calculate from click events
      replyRate: 5, // Would calculate from reply events
      conversionRate: 2, // Would calculate from conversion events
      unsubscribeRate: 0.5, // Would calculate from unsubscribe events
      bounceRate: 2, // Would calculate from bounce events
      lastUpdated: new Date().toISOString()
    };
  }

  private getDefaultSettings(): SequenceSettings {
    return {
      fromEmail: process.env.DEFAULT_FROM_EMAIL || 'hello@agencybase.com',
      fromName: process.env.DEFAULT_FROM_NAME || 'AgencyBase',
      sendingHours: {
        start: '09:00',
        end: '17:00',
        timezone: 'America/New_York'
      },
      sendingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      maxEmailsPerDay: 100,
      respectUnsubscribes: true,
      respectBounces: true,
      stopOnReply: true,
      trackEngagement: true
    };
  }

  private initializeStats(): SequenceStats {
    return {
      totalRecipients: 0,
      activeRecipients: 0,
      completedRecipients: 0,
      totalEmailsSent: 0,
      deliveryRate: 0,
      openRate: 0,
      clickRate: 0,
      replyRate: 0,
      conversionRate: 0,
      unsubscribeRate: 0,
      bounceRate: 0,
      lastUpdated: new Date().toISOString()
    };
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startScheduler(): void {
    // Process scheduled emails every minute
    setInterval(() => {
      this.processScheduledEmails().catch(console.error);
    }, 60 * 1000);
  }

  private loadDefaultSequences(): void {
    // Load some default sequences for immediate use
    // In production, these would be loaded from database
    this.createSequence({
      name: 'Cold Outreach - Tech Companies',
      description: 'Multi-step outreach sequence for technology companies',
      category: 'lead_generation',
      steps: [
        {
          id: 'step_1',
          stepNumber: 1,
          name: 'Initial Outreach',
          templateId: 'cold_outreach_tech',
          delay: { type: 'immediate' },
          isActive: true
        },
        {
          id: 'step_2',
          stepNumber: 2,
          name: 'Follow-up',
          templateId: 'follow_up_interested',
          delay: { type: 'delay', value: 3, unit: 'days' },
          isActive: true
        }
      ],
      triggers: [{ type: 'manual', isActive: true }],
      exitConditions: [
        { type: 'replied', isActive: true },
        { type: 'unsubscribed', isActive: true }
      ]
    });
  }
}

// Export singleton instance
export const emailSequenceEngine = new EmailSequenceEngine();