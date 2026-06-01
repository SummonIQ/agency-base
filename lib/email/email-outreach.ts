import { emailService } from './email-service';
import { emailTemplateEngine } from './email-templates';
import { emailSequenceEngine } from './email-sequences';
import { emailComplianceService } from './email-compliance';
import { emailDeliverabilityService } from './email-deliverability';

export interface OutreachCampaign {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;

  // Configuration
  sequenceId: string;
  targetAudience: OutreachAudience;
  personalization: PersonalizationConfig;
  scheduling: SchedulingConfig;
  compliance: ComplianceConfig;

  // Metrics
  stats: OutreachStats;

  // A/B Testing
  abTestConfig?: ABTestConfig;
}

export interface OutreachAudience {
  segments: AudienceSegment[];
  totalSize: number;
  filters: AudienceFilter[];
  exclusions: string[]; // Email addresses to exclude
}

export interface AudienceSegment {
  id: string;
  name: string;
  description?: string;
  contacts: OutreachContact[];
  customFields: Record<string, any>;
}

export interface OutreachContact {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  title?: string;
  industry?: string;
  location?: string;
  customFields: Record<string, any>;
  source: string; // Where the contact came from
  addedAt: Date;
  status: 'active' | 'bounced' | 'unsubscribed' | 'complained';
}

export interface AudienceFilter {
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'gt' | 'lt';
  value: any;
}

export interface PersonalizationConfig {
  enabled: boolean;
  aiPersonalization: boolean;
  customFields: PersonalizationField[];
  fallbackValues: Record<string, string>;
}

export interface PersonalizationField {
  key: string;
  type: 'text' | 'company_info' | 'industry_info' | 'recent_news' | 'social_proof';
  required: boolean;
  aiGenerated: boolean;
}

export interface SchedulingConfig {
  sendingHours: {
    start: number; // 0-23
    end: number;   // 0-23
  };
  sendingDays: number[]; // 0-6 (Sunday-Saturday)
  timezone: string;
  batchSize: number;
  batchInterval: number; // minutes between batches
  respectRecipientTimezone: boolean;
}

export interface ComplianceConfig {
  respectUnsubscribes: boolean;
  honorSuppressionLists: boolean;
  includePhysicalAddress: boolean;
  gdprCompliant: boolean;
  customCompliance: string[];
}

export interface OutreachStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  complained: number;

  // Rates
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
  bounceRate: number;
  unsubscribeRate: number;
  complaintRate: number;

  // Engagement metrics
  averageTimeToOpen: number; // minutes
  averageTimeToClick: number;
  hotLeads: number; // High engagement contacts
}

export interface ABTestConfig {
  enabled: boolean;
  testType: 'subject_line' | 'template' | 'send_time' | 'from_name';
  variants: ABTestVariant[];
  trafficSplit: number[]; // Percentage for each variant
  duration: number; // Days to run test
  winningCriteria: 'open_rate' | 'click_rate' | 'reply_rate';
  autoPromoteWinner: boolean;
}

export interface ABTestVariant {
  id: string;
  name: string;
  changes: Record<string, any>;
  stats: OutreachStats;
}

export interface OutreachWorkflow {
  id: string;
  name: string;
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
  conditions: WorkflowCondition[];
  isActive: boolean;
}

export interface WorkflowTrigger {
  type: 'email_opened' | 'link_clicked' | 'no_response' | 'positive_reply' | 'out_of_office' | 'time_delay';
  config: Record<string, any>;
}

export interface WorkflowAction {
  type: 'send_email' | 'add_to_sequence' | 'remove_from_sequence' | 'add_tag' | 'update_field' | 'create_task';
  config: Record<string, any>;
  delay?: number; // Minutes to wait before executing
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export class OutreachAutomationEngine {
  private campaigns: Map<string, OutreachCampaign> = new Map();
  private workflows: Map<string, OutreachWorkflow> = new Map();

  async createCampaign(campaignData: Omit<OutreachCampaign, 'id' | 'createdAt' | 'updatedAt' | 'stats'>): Promise<OutreachCampaign> {
    const campaign: OutreachCampaign = {
      ...campaignData,
      id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        replied: 0,
        bounced: 0,
        unsubscribed: 0,
        complained: 0,
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0,
        replyRate: 0,
        bounceRate: 0,
        unsubscribeRate: 0,
        complaintRate: 0,
        averageTimeToOpen: 0,
        averageTimeToClick: 0,
        hotLeads: 0
      }
    };

    this.campaigns.set(campaign.id, campaign);
    return campaign;
  }

  async startCampaign(campaignId: string): Promise<void> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    campaign.status = 'active';
    campaign.updatedAt = new Date();

    // Start processing contacts
    await this.processCampaignContacts(campaign);
  }

  private async processCampaignContacts(campaign: OutreachCampaign): Promise<void> {
    for (const segment of campaign.targetAudience.segments) {
      const eligibleContacts = await this.filterEligibleContacts(segment.contacts, campaign);

      for (const contact of eligibleContacts) {
        await this.addContactToSequence(campaign, contact);
      }
    }
  }

  private async filterEligibleContacts(contacts: OutreachContact[], campaign: OutreachCampaign): Promise<OutreachContact[]> {
    const eligibleContacts: OutreachContact[] = [];

    for (const contact of contacts) {
      // Check suppression list
      if (campaign.compliance.honorSuppressionLists && emailComplianceService.isSuppressed(contact.email)) {
        continue;
      }

      // Check exclusions
      if (campaign.targetAudience.exclusions.includes(contact.email)) {
        continue;
      }

      // Apply audience filters
      const passesFilters = this.applyAudienceFilters(contact, campaign.targetAudience.filters);
      if (!passesFilters) {
        continue;
      }

      eligibleContacts.push(contact);
    }

    return eligibleContacts;
  }

  private applyAudienceFilters(contact: OutreachContact, filters: AudienceFilter[]): boolean {
    for (const filter of filters) {
      const fieldValue = this.getContactFieldValue(contact, filter.field);

      if (!this.evaluateFilter(fieldValue, filter.operator, filter.value)) {
        return false;
      }
    }

    return true;
  }

  private getContactFieldValue(contact: OutreachContact, field: string): any {
    const standardFields: Record<string, any> = {
      email: contact.email,
      firstName: contact.firstName,
      lastName: contact.lastName,
      company: contact.company,
      title: contact.title,
      industry: contact.industry,
      location: contact.location,
      status: contact.status
    };

    return standardFields[field] || contact.customFields[field];
  }

  private evaluateFilter(value: any, operator: AudienceFilter['operator'], filterValue: any): boolean {
    switch (operator) {
      case 'equals':
        return value === filterValue;
      case 'contains':
        return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
      case 'starts_with':
        return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
      case 'ends_with':
        return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
      case 'gt':
        return Number(value) > Number(filterValue);
      case 'lt':
        return Number(value) < Number(filterValue);
      default:
        return false;
    }
  }

  private async addContactToSequence(campaign: OutreachCampaign, contact: OutreachContact): Promise<void> {
    // Generate personalization data
    const personalizationData = await this.generatePersonalizationData(contact, campaign.personalization);

    // Add to email sequence
    await emailSequenceEngine.addRecipientToSequence(campaign.sequenceId, {
      email: contact.email,
      customFields: {
        ...contact.customFields,
        ...personalizationData,
        campaignId: campaign.id
      }
    });
  }

  private async generatePersonalizationData(contact: OutreachContact, config: PersonalizationConfig): Promise<Record<string, any>> {
    if (!config.enabled) {
      return {};
    }

    const personalizationData: Record<string, any> = {};

    for (const field of config.customFields) {
      let value = contact.customFields[field.key] || config.fallbackValues[field.key];

      if (!value && field.required && field.aiGenerated && config.aiPersonalization) {
        value = await this.generateAIPersonalization(contact, field);
      }

      if (value) {
        personalizationData[field.key] = value;
      }
    }

    return personalizationData;
  }

  private async generateAIPersonalization(contact: OutreachContact, field: PersonalizationField): Promise<string | null> {
    // AI personalization based on field type
    switch (field.type) {
      case 'company_info':
        return await this.generateCompanyInfo(contact.company);

      case 'industry_info':
        return await this.generateIndustryInfo(contact.industry);

      case 'recent_news':
        return await this.generateRecentNews(contact.company);

      case 'social_proof':
        return await this.generateSocialProof(contact.industry);

      default:
        return null;
    }
  }

  private async generateCompanyInfo(company?: string): Promise<string> {
    if (!company) return '';

    // In real implementation, this would use AI to research the company
    return `I noticed ${company} has been making great strides in their industry.`;
  }

  private async generateIndustryInfo(industry?: string): Promise<string> {
    if (!industry) return '';

    return `The ${industry} sector is experiencing significant growth this year.`;
  }

  private async generateRecentNews(company?: string): Promise<string> {
    if (!company) return '';

    return `I saw ${company} was recently featured in the news.`;
  }

  private async generateSocialProof(industry?: string): Promise<string> {
    return `We've helped several companies in your industry achieve remarkable results.`;
  }

  async createWorkflow(workflowData: Omit<OutreachWorkflow, 'id'>): Promise<OutreachWorkflow> {
    const workflow: OutreachWorkflow = {
      ...workflowData,
      id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    this.workflows.set(workflow.id, workflow);
    return workflow;
  }

  async triggerWorkflow(workflowId: string, triggerData: Record<string, any>): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow || !workflow.isActive) {
      return;
    }

    // Check if trigger matches
    const matchingTrigger = workflow.triggers.find(trigger =>
      this.evaluateTrigger(trigger, triggerData)
    );

    if (!matchingTrigger) {
      return;
    }

    // Evaluate conditions
    const conditionsMet = workflow.conditions.every(condition =>
      this.evaluateCondition(condition, triggerData)
    );

    if (!conditionsMet) {
      return;
    }

    // Execute actions
    for (const action of workflow.actions) {
      if (action.delay && action.delay > 0) {
        // Schedule action for later
        setTimeout(() => this.executeWorkflowAction(action, triggerData), action.delay * 60 * 1000);
      } else {
        await this.executeWorkflowAction(action, triggerData);
      }
    }
  }

  private evaluateTrigger(trigger: WorkflowTrigger, data: Record<string, any>): boolean {
    return trigger.type === data.triggerType;
  }

  private evaluateCondition(condition: WorkflowCondition, data: Record<string, any>): boolean {
    const value = data[condition.field];
    return this.evaluateFilter(value, condition.operator as any, condition.value);
  }

  private async executeWorkflowAction(action: WorkflowAction, data: Record<string, any>): Promise<void> {
    switch (action.type) {
      case 'send_email':
        await this.executeSendEmailAction(action, data);
        break;

      case 'add_to_sequence':
        await this.executeAddToSequenceAction(action, data);
        break;

      case 'remove_from_sequence':
        await this.executeRemoveFromSequenceAction(action, data);
        break;

      // Add more action types as needed
    }
  }

  private async executeSendEmailAction(action: WorkflowAction, data: Record<string, any>): Promise<void> {
    const { templateId, recipientEmail } = action.config;

    if (templateId && recipientEmail) {
      const rendered = await emailTemplateEngine.renderTemplate(templateId, {
        variables: data.variables || {},
        personalization: data.personalization
      });

      await emailService.sendEmail({
        to: [recipientEmail],
        from: process.env.DEFAULT_FROM_EMAIL!,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text
      });
    }
  }

  private async executeAddToSequenceAction(action: WorkflowAction, data: Record<string, any>): Promise<void> {
    const { sequenceId, recipientEmail } = action.config;

    if (sequenceId && recipientEmail) {
      await emailSequenceEngine.addRecipientToSequence(sequenceId, {
        email: recipientEmail,
        customFields: data.customFields || {}
      });
    }
  }

  private async executeRemoveFromSequenceAction(action: WorkflowAction, data: Record<string, any>): Promise<void> {
    const { sequenceId, recipientEmail } = action.config;

    if (sequenceId && recipientEmail) {
      await emailSequenceEngine.removeRecipientFromSequence(sequenceId, recipientEmail);
    }
  }

  async getCampaignStats(campaignId: string): Promise<OutreachStats | null> {
    const campaign = this.campaigns.get(campaignId);
    return campaign?.stats || null;
  }

  async updateCampaignStats(campaignId: string, event: {
    type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'unsubscribed' | 'complained';
    timestamp: Date;
  }): Promise<void> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return;

    campaign.stats[event.type]++;

    // Recalculate rates
    const total = campaign.stats.sent;
    if (total > 0) {
      campaign.stats.deliveryRate = campaign.stats.delivered / total;
      campaign.stats.openRate = campaign.stats.opened / total;
      campaign.stats.clickRate = campaign.stats.clicked / total;
      campaign.stats.replyRate = campaign.stats.replied / total;
      campaign.stats.bounceRate = campaign.stats.bounced / total;
      campaign.stats.unsubscribeRate = campaign.stats.unsubscribed / total;
      campaign.stats.complaintRate = campaign.stats.complained / total;
    }

    campaign.updatedAt = new Date();
  }
}

export const outreachAutomationEngine = new OutreachAutomationEngine();