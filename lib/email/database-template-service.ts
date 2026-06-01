import { db } from '@/lib/db';
import { EmailTemplateType, EmailTemplate, EmailSequence, EmailSequenceStatus, EmailSend, EmailSendStatus } from '@prisma/client';
import { EmailTemplateEngineService, TemplateContext, TemplateRenderResult } from './template-engine-service';

export interface CreateTemplateData {
  name: string;
  subject: string;
  content: string;
  textContent?: string;
  type: EmailTemplateType;
  variables?: string[];
  userId: string;
}

export interface CreateSequenceData {
  name: string;
  description?: string;
  userId: string;
}

export interface AddSequenceStepData {
  sequenceId: string;
  templateId: string;
  stepNumber: number;
  delayDays?: number;
  delayHours?: number;
}

export interface AddRecipientData {
  sequenceId: string;
  email: string;
  name?: string;
  customFields?: Record<string, any>;
}

export class DatabaseEmailService {
  // Template Management
  async createTemplate(data: CreateTemplateData): Promise<EmailTemplate> {
    return db.emailTemplate.create({
      data: {
        name: data.name,
        subject: data.subject,
        content: data.content,
        textContent: data.textContent,
        type: data.type,
        variables: data.variables || [],
        userId: data.userId,
      },
    });
  }

  async getTemplate(id: string): Promise<EmailTemplate | null> {
    return db.emailTemplate.findUnique({
      where: { id },
    });
  }

  async listTemplates(userId: string, filters?: {
    type?: EmailTemplateType;
    isActive?: boolean;
    search?: string;
  }): Promise<EmailTemplate[]> {
    const where: any = { userId };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { subject: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return db.emailTemplate.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async updateTemplate(id: string, data: Partial<CreateTemplateData>): Promise<EmailTemplate> {
    return db.emailTemplate.update({
      where: { id },
      data,
    });
  }

  async deleteTemplate(id: string): Promise<void> {
    await db.emailTemplate.delete({
      where: { id },
    });
  }

  // Sequence Management
  async createSequence(data: CreateSequenceData): Promise<EmailSequence> {
    return db.emailSequence.create({
      data: {
        name: data.name,
        description: data.description,
        userId: data.userId,
        status: 'DRAFT',
      },
    });
  }

  async getSequence(id: string): Promise<(EmailSequence & {
    steps: Array<{
      id: string;
      stepNumber: number;
      delayDays: number;
      delayHours: number;
      template: EmailTemplate;
    }>;
    recipients: any[];
  }) | null> {
    return db.emailSequence.findUnique({
      where: { id },
      include: {
        steps: {
          include: {
            template: true,
          },
          orderBy: { stepNumber: 'asc' },
        },
        recipients: true,
      },
    });
  }

  async listSequences(userId: string, filters?: {
    status?: EmailSequenceStatus;
  }): Promise<(EmailSequence & { _count: { recipients: number; steps: number } })[]> {
    const where: any = { userId };

    if (filters?.status) {
      where.status = filters.status;
    }

    return db.emailSequence.findMany({
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

  async updateSequence(id: string, data: Partial<CreateSequenceData>): Promise<EmailSequence> {
    return db.emailSequence.update({
      where: { id },
      data,
    });
  }

  async updateSequenceStatus(id: string, status: EmailSequenceStatus): Promise<EmailSequence> {
    return db.emailSequence.update({
      where: { id },
      data: { status },
    });
  }

  async deleteSequence(id: string): Promise<void> {
    await db.emailSequence.delete({
      where: { id },
    });
  }

  // Sequence Steps
  async addSequenceStep(data: AddSequenceStepData): Promise<any> {
    return db.emailSequenceStep.create({
      data: {
        sequenceId: data.sequenceId,
        templateId: data.templateId,
        stepNumber: data.stepNumber,
        delayDays: data.delayDays || 0,
        delayHours: data.delayHours || 0,
      },
    });
  }

  async removeSequenceStep(stepId: string): Promise<void> {
    await db.emailSequenceStep.delete({
      where: { id: stepId },
    });
  }

  // Recipients
  async addRecipient(data: AddRecipientData): Promise<any> {
    return db.emailSequenceRecipient.create({
      data: {
        sequenceId: data.sequenceId,
        email: data.email,
        name: data.name,
        customFields: data.customFields,
      },
    });
  }

  async removeRecipient(recipientId: string): Promise<void> {
    await db.emailSequenceRecipient.delete({
      where: { id: recipientId },
    });
  }

  async getRecipientsBySequence(sequenceId: string): Promise<any[]> {
    return db.emailSequenceRecipient.findMany({
      where: { sequenceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Email Sends
  async createEmailSend(data: {
    templateId?: string;
    recipientId?: string;
    toEmail: string;
    toName?: string;
    fromEmail: string;
    fromName?: string;
    subject: string;
    htmlContent: string;
    textContent?: string;
    userId: string;
    metadata?: Record<string, any>;
  }): Promise<EmailSend> {
    return db.emailSend.create({
      data,
    });
  }

  async updateEmailSendStatus(
    id: string,
    status: EmailSendStatus,
    metadata?: {
      externalId?: string;
      errorMessage?: string;
      sentAt?: Date;
      deliveredAt?: Date;
      openedAt?: Date;
      clickedAt?: Date;
      bouncedAt?: Date;
      unsubscribedAt?: Date;
      repliedAt?: Date;
    }
  ): Promise<EmailSend> {
    const updateData: any = { status };

    if (metadata) {
      Object.assign(updateData, metadata);
    }

    return db.emailSend.update({
      where: { id },
      data: updateData,
    });
  }

  async getEmailSends(userId: string, filters?: {
    status?: EmailSendStatus;
    templateId?: string;
    recipientEmail?: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<EmailSend[]> {
    const where: any = { userId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.templateId) {
      where.templateId = filters.templateId;
    }

    if (filters?.recipientEmail) {
      where.toEmail = { contains: filters.recipientEmail, mode: 'insensitive' };
    }

    if (filters?.fromDate) {
      where.createdAt = { gte: filters.fromDate };
    }

    if (filters?.toDate) {
      where.createdAt = { ...where.createdAt, lte: filters.toDate };
    }

    return db.emailSend.findMany({
      where,
      include: {
        template: true,
        recipient: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Analytics
  async getTemplateStats(templateId: string): Promise<{
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
    replied: number;
  }> {
    const stats = await db.emailSend.groupBy({
      by: ['status'],
      where: { templateId },
      _count: { status: true },
    });

    const result = {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      unsubscribed: 0,
      replied: 0,
    };

    stats.forEach((stat) => {
      switch (stat.status) {
        case 'SENT':
        case 'DELIVERED':
          result.sent += stat._count.status;
          if (stat.status === 'DELIVERED') result.delivered += stat._count.status;
          break;
        case 'OPENED':
          result.opened += stat._count.status;
          break;
        case 'CLICKED':
          result.clicked += stat._count.status;
          break;
        case 'BOUNCED':
          result.bounced += stat._count.status;
          break;
        case 'UNSUBSCRIBED':
          result.unsubscribed += stat._count.status;
          break;
      }
    });

    // Count replies separately
    result.replied = await db.emailSend.count({
      where: {
        templateId,
        repliedAt: { not: null },
      },
    });

    return result;
  }

  async getSequenceStats(sequenceId: string): Promise<{
    totalRecipients: number;
    activeRecipients: number;
    completedRecipients: number;
    unsubscribedRecipients: number;
    totalSent: number;
    totalOpened: number;
    totalClicked: number;
    totalReplied: number;
  }> {
    const recipients = await db.emailSequenceRecipient.groupBy({
      by: ['status'],
      where: { sequenceId },
      _count: { status: true },
    });

    const emailStats = await db.emailSend.aggregate({
      where: {
        recipient: {
          sequenceId,
        },
      },
      _count: {
        _all: true,
      },
    });

    const openedCount = await db.emailSend.count({
      where: {
        recipient: { sequenceId },
        openedAt: { not: null },
      },
    });

    const clickedCount = await db.emailSend.count({
      where: {
        recipient: { sequenceId },
        clickedAt: { not: null },
      },
    });

    const repliedCount = await db.emailSend.count({
      where: {
        recipient: { sequenceId },
        repliedAt: { not: null },
      },
    });

    const result = {
      totalRecipients: 0,
      activeRecipients: 0,
      completedRecipients: 0,
      unsubscribedRecipients: 0,
      totalSent: emailStats._count._all,
      totalOpened: openedCount,
      totalClicked: clickedCount,
      totalReplied: repliedCount,
    };

    recipients.forEach((stat) => {
      result.totalRecipients += stat._count.status;
      switch (stat.status) {
        case 'ACTIVE':
          result.activeRecipients += stat._count.status;
          break;
        case 'UNSUBSCRIBED':
          result.unsubscribedRecipients += stat._count.status;
          break;
      }
    });

    // Count completed recipients (those who went through entire sequence)
    result.completedRecipients = await db.emailSequenceRecipient.count({
      where: {
        sequenceId,
        completedAt: { not: null },
      },
    });

    return result;
  }

  // Template variable substitution using advanced template engine
  async renderTemplate(template: EmailTemplate, variables: TemplateContext): Promise<TemplateRenderResult> {
    return EmailTemplateEngineService.renderTemplate(template, variables);
  }

  // Validate template syntax
  async validateTemplate(template: Pick<EmailTemplate, 'subject' | 'content' | 'textContent'>): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const subjectValidation = EmailTemplateEngineService.validateTemplate(template.subject);
    const contentValidation = EmailTemplateEngineService.validateTemplate(template.content);
    const textValidation = template.textContent 
      ? EmailTemplateEngineService.validateTemplate(template.textContent)
      : { isValid: true, errors: [] };

    const allErrors = [
      ...subjectValidation.errors.map(e => `Subject: ${e}`),
      ...contentValidation.errors.map(e => `Content: ${e}`),
      ...textValidation.errors.map(e => `Text: ${e}`)
    ];

    return {
      isValid: subjectValidation.isValid && contentValidation.isValid && textValidation.isValid,
      errors: allErrors
    };
  }

  // Get template variables and statistics
  async getTemplateAnalysis(template: Pick<EmailTemplate, 'subject' | 'content' | 'textContent'>): Promise<{
    stats: ReturnType<typeof EmailTemplateEngineService.getTemplateStats>;
    availableVariables: ReturnType<typeof EmailTemplateEngineService.getAvailableVariables>;
    usedVariables: string[];
    validation: { isValid: boolean; errors: string[] };
  }> {
    const stats = EmailTemplateEngineService.getTemplateStats(template);
    const availableVariables = EmailTemplateEngineService.getAvailableVariables();
    const usedVariables = EmailTemplateEngineService.extractUsedVariables(
      `${template.subject} ${template.content} ${template.textContent || ''}`
    );
    const validation = await this.validateTemplate(template);

    return {
      stats,
      availableVariables,
      usedVariables,
      validation
    };
  }

  // Generate sample preview
  async generateTemplatePreview(template: Pick<EmailTemplate, 'subject' | 'content' | 'textContent'>): Promise<TemplateRenderResult> {
    const sampleContext = EmailTemplateEngineService.generateSampleContext();
    return EmailTemplateEngineService.renderTemplate(template, sampleContext);
  }
}

export const databaseEmailService = new DatabaseEmailService();