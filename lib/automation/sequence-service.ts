import { db } from '@/lib/db';
import { 
  AutomationSequence, 
  AutomationStep, 
  AutomationTrigger,
  AutomationStatus,
  AutomationStepType,
  EmailSequence,
  LinkedInAutomationSequence 
} from '@prisma/client';
import { databaseEmailService } from '@/lib/email/database-template-service';
import { EmailTemplateEngineService } from '@/lib/email/template-engine-service';
import { linkedInService } from '@/lib/linkedin/linkedin-service';
import { sendGridService } from '@/lib/email/sendgrid';

export interface CreateSequenceData {
  name: string;
  description?: string;
  type: 'EMAIL' | 'LINKEDIN' | 'MIXED';
  trigger: AutomationTrigger;
  userId: string;
  targetAudience?: {
    industries?: string[];
    jobTitles?: string[];
    companySizes?: string[];
    locations?: string[];
  };
}

export interface CreateStepData {
  sequenceId: string;
  stepNumber: number;
  type: AutomationStepType;
  name: string;
  delayDays?: number;
  delayHours?: number;
  templateId?: string;
  customContent?: string;
  conditions?: {
    field: string;
    operator: 'equals' | 'contains' | 'exists' | 'not_exists';
    value?: string;
  }[];
}

export interface SequenceRecipient {
  id: string;
  sequenceId: string;
  leadId?: string;
  prospectId?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  jobTitle?: string;
  customFields?: Record<string, any>;
  currentStep: number;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'UNSUBSCRIBED' | 'BOUNCED';
  startedAt: Date;
  completedAt?: Date;
  lastActivityAt?: Date;
}

export interface SequencePerformance {
  sequenceId: string;
  totalRecipients: number;
  activeRecipients: number;
  completedRecipients: number;
  unsubscribedRecipients: number;
  bouncedRecipients: number;
  stepPerformance: {
    stepNumber: number;
    stepName: string;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    replied: number;
    conversionRate: number;
  }[];
  overallStats: {
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    replyRate: number;
    unsubscribeRate: number;
    conversionRate: number;
  };
}

export class AutomationSequenceService {
  // Sequence Management
  async createSequence(data: CreateSequenceData): Promise<AutomationSequence> {
    return db.automationSequence.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        trigger: data.trigger,
        userId: data.userId,
        targetAudience: data.targetAudience || {},
        status: 'DRAFT',
      },
    });
  }

  async getSequence(id: string): Promise<(AutomationSequence & {
    steps: AutomationStep[];
    recipients: any[];
    _count: { recipients: number; steps: number };
  }) | null> {
    return db.automationSequence.findUnique({
      where: { id },
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' },
        },
        recipients: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            recipients: true,
            steps: true,
          },
        },
      },
    });
  }

  async listSequences(userId: string, filters?: {
    type?: 'EMAIL' | 'LINKEDIN' | 'MIXED';
    status?: AutomationStatus;
    trigger?: AutomationTrigger;
  }): Promise<(AutomationSequence & { 
    _count: { recipients: number; steps: number } 
  })[]> {
    const where: any = { userId };

    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;
    if (filters?.trigger) where.trigger = filters.trigger;

    return db.automationSequence.findMany({
      where,
      include: {
        _count: {
          select: {
            recipients: true,
            steps: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async updateSequence(id: string, data: Partial<CreateSequenceData>): Promise<AutomationSequence> {
    return db.automationSequence.update({
      where: { id },
      data,
    });
  }

  async updateSequenceStatus(id: string, status: AutomationStatus): Promise<AutomationSequence> {
    return db.automationSequence.update({
      where: { id },
      data: { 
        status,
        ...(status === 'ACTIVE' ? { activatedAt: new Date() } : {}),
        ...(status === 'PAUSED' ? { pausedAt: new Date() } : {}),
      },
    });
  }

  async deleteSequence(id: string): Promise<void> {
    // First pause the sequence to stop any active processing
    await this.updateSequenceStatus(id, 'PAUSED');
    
    // Delete the sequence (cascade will handle steps and recipients)
    await db.automationSequence.delete({
      where: { id },
    });
  }

  // Step Management
  async addStep(data: CreateStepData): Promise<AutomationStep> {
    return db.automationStep.create({
      data: {
        sequenceId: data.sequenceId,
        stepNumber: data.stepNumber,
        type: data.type,
        name: data.name,
        delayDays: data.delayDays || 0,
        delayHours: data.delayHours || 0,
        templateId: data.templateId,
        customContent: data.customContent,
        conditions: data.conditions || [],
      },
    });
  }

  async updateStep(stepId: string, data: Partial<CreateStepData>): Promise<AutomationStep> {
    return db.automationStep.update({
      where: { id: stepId },
      data,
    });
  }

  async removeStep(stepId: string): Promise<void> {
    await db.automationStep.delete({
      where: { id: stepId },
    });
  }

  async reorderSteps(sequenceId: string, stepIds: string[]): Promise<void> {
    // Update step numbers based on new order
    for (let i = 0; i < stepIds.length; i++) {
      await db.automationStep.update({
        where: { id: stepIds[i] },
        data: { stepNumber: i + 1 },
      });
    }
  }

  // Recipient Management
  async addRecipient(data: {
    sequenceId: string;
    leadId?: string;
    prospectId?: string;
    email: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    jobTitle?: string;
    customFields?: Record<string, any>;
  }): Promise<any> {
    return db.automationRecipient.create({
      data: {
        sequenceId: data.sequenceId,
        leadId: data.leadId,
        prospectId: data.prospectId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        jobTitle: data.jobTitle,
        customFields: data.customFields || {},
        currentStep: 1,
        status: 'ACTIVE',
        startedAt: new Date(),
      },
    });
  }

  async addBulkRecipients(
    sequenceId: string, 
    recipients: Array<{
      leadId?: string;
      prospectId?: string;
      email: string;
      firstName?: string;
      lastName?: string;
      company?: string;
      jobTitle?: string;
      customFields?: Record<string, any>;
    }>
  ): Promise<number> {
    const recipientData = recipients.map(recipient => ({
      sequenceId,
      ...recipient,
      customFields: recipient.customFields || {},
      currentStep: 1,
      status: 'ACTIVE' as const,
      startedAt: new Date(),
    }));

    const result = await db.automationRecipient.createMany({
      data: recipientData,
      skipDuplicates: true,
    });

    return result.count;
  }

  async updateRecipientStatus(
    recipientId: string, 
    status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'UNSUBSCRIBED' | 'BOUNCED',
    metadata?: Record<string, any>
  ): Promise<any> {
    const updateData: any = { 
      status,
      lastActivityAt: new Date(),
    };

    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    if (metadata) {
      updateData.metadata = metadata;
    }

    return db.automationRecipient.update({
      where: { id: recipientId },
      data: updateData,
    });
  }

  async advanceRecipientStep(recipientId: string): Promise<any> {
    const recipient = await db.automationRecipient.findUnique({
      where: { id: recipientId },
      include: {
        sequence: {
          include: {
            steps: {
              orderBy: { stepNumber: 'asc' },
            },
          },
        },
      },
    });

    if (!recipient) {
      throw new Error('Recipient not found');
    }

    const nextStepNumber = recipient.currentStep + 1;
    const hasNextStep = recipient.sequence.steps.some(step => step.stepNumber === nextStepNumber);

    if (hasNextStep) {
      return db.automationRecipient.update({
        where: { id: recipientId },
        data: {
          currentStep: nextStepNumber,
          lastActivityAt: new Date(),
        },
      });
    } else {
      // No more steps, mark as completed
      return this.updateRecipientStatus(recipientId, 'COMPLETED');
    }
  }

  // Sequence Execution
  async processSequence(sequenceId: string): Promise<{
    processed: number;
    sent: number;
    errors: string[];
  }> {
    const sequence = await this.getSequence(sequenceId);
    if (!sequence || sequence.status !== 'ACTIVE') {
      return { processed: 0, sent: 0, errors: ['Sequence not active'] };
    }

    const activeRecipients = await db.automationRecipient.findMany({
      where: {
        sequenceId,
        status: 'ACTIVE',
      },
      include: {
        sequence: {
          include: {
            steps: {
              orderBy: { stepNumber: 'asc' },
            },
          },
        },
      },
    });

    let processed = 0;
    let sent = 0;
    const errors: string[] = [];

    for (const recipient of activeRecipients) {
      try {
        const currentStep = recipient.sequence.steps.find(
          step => step.stepNumber === recipient.currentStep
        );

        if (!currentStep) {
          await this.updateRecipientStatus(recipient.id, 'COMPLETED');
          processed++;
          continue;
        }

        // Check if enough time has passed for this step
        const stepDelay = (currentStep.delayDays * 24 * 60 * 60 * 1000) + 
                         (currentStep.delayHours * 60 * 60 * 1000);
        const timeSinceLastActivity = Date.now() - recipient.lastActivityAt.getTime();

        if (timeSinceLastActivity < stepDelay) {
          continue; // Not ready for this step yet
        }

        // Check step conditions
        if (currentStep.conditions && currentStep.conditions.length > 0) {
          const conditionsMet = await this.evaluateConditions(
            currentStep.conditions as any[], 
            recipient
          );
          if (!conditionsMet) {
            await this.advanceRecipientStep(recipient.id);
            processed++;
            continue;
          }
        }

        // Execute the step
        const stepResult = await this.executeStep(currentStep, recipient);
        if (stepResult.success) {
          sent++;
          await this.advanceRecipientStep(recipient.id);
        } else {
          errors.push(`Step ${currentStep.stepNumber} failed for ${recipient.email}: ${stepResult.error}`);
        }

        processed++;
      } catch (error) {
        errors.push(`Error processing recipient ${recipient.email}: ${error}`);
      }
    }

    return { processed, sent, errors };
  }

  private async executeStep(
    step: AutomationStep, 
    recipient: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      switch (step.type) {
        case 'EMAIL':
          return await this.executeEmailStep(step, recipient);
        case 'LINKEDIN_CONNECTION':
          return await this.executeLinkedInConnectionStep(step, recipient);
        case 'LINKEDIN_MESSAGE':
          return await this.executeLinkedInMessageStep(step, recipient);
        case 'WAIT':
          return { success: true }; // Wait steps are handled by delay logic
        case 'CONDITION':
          return { success: true }; // Condition steps are handled by condition evaluation
        default:
          return { success: false, error: 'Unknown step type' };
      }
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  private async executeEmailStep(
    step: AutomationStep, 
    recipient: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      let content = step.customContent;
      let subject = 'Follow-up';

      // If using a template, render it
      if (step.templateId) {
        const template = await databaseEmailService.getTemplate(step.templateId);
        if (!template) {
          return { success: false, error: 'Template not found' };
        }

        const context = {
          firstName: recipient.firstName,
          lastName: recipient.lastName,
          company: recipient.company,
          jobTitle: recipient.jobTitle,
          email: recipient.email,
          ...recipient.customFields,
        };

        const rendered = await databaseEmailService.renderTemplate(template, context);
        content = rendered.htmlContent;
        subject = rendered.subject;
      }

      // Send email via SendGrid
      const emailResult = await sendGridService.sendEmail({
        to: recipient.email,
        toName: `${recipient.firstName} ${recipient.lastName}`.trim(),
        subject,
        htmlContent: content || '',
        textContent: EmailTemplateEngineService.htmlToText(content || ''),
      });

      // Log the email send
      await databaseEmailService.createEmailSend({
        templateId: step.templateId,
        recipientId: recipient.id,
        toEmail: recipient.email,
        toName: `${recipient.firstName} ${recipient.lastName}`.trim(),
        fromEmail: 'noreply@agency-base.com', // TODO: Make configurable
        fromName: 'Agency Base',
        subject,
        htmlContent: content || '',
        textContent: EmailTemplateEngineService.htmlToText(content || ''),
        userId: recipient.sequence.userId,
        metadata: {
          sequenceId: recipient.sequenceId,
          stepId: step.id,
          stepNumber: step.stepNumber,
        },
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  private async executeLinkedInConnectionStep(
    step: AutomationStep, 
    recipient: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Use LinkedIn service to send connection request
      const result = await linkedInService.sendConnectionRequest(
        recipient.prospectId || recipient.email,
        step.customContent || 'I\'d like to connect with you on LinkedIn.'
      );

      return { success: result.success, error: result.error };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  private async executeLinkedInMessageStep(
    step: AutomationStep, 
    recipient: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      let content = step.customContent || 'Hello!';

      // If using a template, render it
      if (step.templateId) {
        const template = await databaseEmailService.getTemplate(step.templateId);
        if (template) {
          const context = {
            firstName: recipient.firstName,
            lastName: recipient.lastName,
            company: recipient.company,
            jobTitle: recipient.jobTitle,
            ...recipient.customFields,
          };

          const rendered = await databaseEmailService.renderTemplate(template, context);
          content = rendered.textContent; // Use text version for LinkedIn
        }
      }

      // Use LinkedIn service to send message
      const result = await linkedInService.sendMessage(
        recipient.prospectId || recipient.email,
        content
      );

      return { success: result.success, error: result.error };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  private async evaluateConditions(
    conditions: Array<{
      field: string;
      operator: 'equals' | 'contains' | 'exists' | 'not_exists';
      value?: string;
    }>, 
    recipient: any
  ): Promise<boolean> {
    for (const condition of conditions) {
      const fieldValue = recipient[condition.field] || recipient.customFields?.[condition.field];
      
      switch (condition.operator) {
        case 'exists':
          if (!fieldValue) return false;
          break;
        case 'not_exists':
          if (fieldValue) return false;
          break;
        case 'equals':
          if (fieldValue !== condition.value) return false;
          break;
        case 'contains':
          if (!fieldValue || !String(fieldValue).includes(condition.value || '')) return false;
          break;
      }
    }
    
    return true;
  }

  // Analytics and Performance
  async getSequencePerformance(sequenceId: string): Promise<SequencePerformance> {
    const sequence = await this.getSequence(sequenceId);
    if (!sequence) {
      throw new Error('Sequence not found');
    }

    // Get recipient statistics
    const recipientStats = await db.automationRecipient.groupBy({
      by: ['status'],
      where: { sequenceId },
      _count: { status: true },
    });

    const totalRecipients = recipientStats.reduce((sum, stat) => sum + stat._count.status, 0);
    const activeRecipients = recipientStats.find(s => s.status === 'ACTIVE')?._count.status || 0;
    const completedRecipients = recipientStats.find(s => s.status === 'COMPLETED')?._count.status || 0;
    const unsubscribedRecipients = recipientStats.find(s => s.status === 'UNSUBSCRIBED')?._count.status || 0;
    const bouncedRecipients = recipientStats.find(s => s.status === 'BOUNCED')?._count.status || 0;

    // Get step performance (for email steps)
    const stepPerformance = await Promise.all(
      sequence.steps.map(async (step) => {
        const emailSends = await db.emailSend.findMany({
          where: {
            metadata: {
              path: ['stepId'],
              equals: step.id,
            },
          },
        });

        const sent = emailSends.length;
        const delivered = emailSends.filter(e => e.status === 'DELIVERED').length;
        const opened = emailSends.filter(e => e.openedAt).length;
        const clicked = emailSends.filter(e => e.clickedAt).length;
        const replied = emailSends.filter(e => e.repliedAt).length;

        return {
          stepNumber: step.stepNumber,
          stepName: step.name,
          sent,
          delivered,
          opened,
          clicked,
          replied,
          conversionRate: sent > 0 ? (replied / sent) * 100 : 0,
        };
      })
    );

    // Calculate overall statistics
    const totalSent = stepPerformance.reduce((sum, step) => sum + step.sent, 0);
    const totalDelivered = stepPerformance.reduce((sum, step) => sum + step.delivered, 0);
    const totalOpened = stepPerformance.reduce((sum, step) => sum + step.opened, 0);
    const totalClicked = stepPerformance.reduce((sum, step) => sum + step.clicked, 0);
    const totalReplied = stepPerformance.reduce((sum, step) => sum + step.replied, 0);

    const overallStats = {
      deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
      openRate: totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0,
      clickRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
      replyRate: totalSent > 0 ? (totalReplied / totalSent) * 100 : 0,
      unsubscribeRate: totalRecipients > 0 ? (unsubscribedRecipients / totalRecipients) * 100 : 0,
      conversionRate: totalRecipients > 0 ? (completedRecipients / totalRecipients) * 100 : 0,
    };

    return {
      sequenceId,
      totalRecipients,
      activeRecipients,
      completedRecipients,
      unsubscribedRecipients,
      bouncedRecipients,
      stepPerformance,
      overallStats,
    };
  }
}

export const automationSequenceService = new AutomationSequenceService();
