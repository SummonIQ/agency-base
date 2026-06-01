/**
 * Email Template Management System
 * Handles template storage, variable substitution, and template versioning
 */

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  category: 'lead_generation' | 'recruiting' | 'follow_up' | 'nurture' | 'welcome' | 'notification';
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: TemplateVariable[];
  tags: string[];
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  performanceMetrics?: TemplateMetrics;
  abTestConfig?: ABTestConfig;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'url' | 'email';
  required: boolean;
  defaultValue?: string;
  description: string;
  example: string;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

export interface TemplateMetrics {
  totalSent: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
  conversionRate: number;
  unsubscribeRate: number;
  spamRate: number;
  lastUpdated: string;
}

export interface ABTestConfig {
  isActive: boolean;
  testType: 'subject' | 'content' | 'send_time' | 'from_name';
  variants: ABTestVariant[];
  trafficSplit: number[]; // Percentage allocation for each variant
  winnerCriteria: 'open_rate' | 'click_rate' | 'reply_rate' | 'conversion_rate';
  startDate: string;
  endDate?: string;
  sampleSize?: number;
  confidenceLevel: number; // 0.95 for 95% confidence
}

export interface ABTestVariant {
  id: string;
  name: string;
  subject?: string;
  htmlContent?: string;
  textContent?: string;
  fromName?: string;
  sendTime?: string; // ISO time string
  metrics: TemplateMetrics;
}

export interface TemplateRenderOptions {
  variables: Record<string, any>;
  personalization?: {
    recipientName?: string;
    companyName?: string;
    industry?: string;
    location?: string;
    jobTitle?: string;
    customFields?: Record<string, any>;
  };
  tracking?: {
    campaignId?: string;
    sequenceId?: string;
    stepNumber?: number;
    utm?: {
      source?: string;
      medium?: string;
      campaign?: string;
      term?: string;
      content?: string;
    };
  };
}

export interface RenderedTemplate {
  subject: string;
  html: string;
  text?: string;
  variables: Record<string, any>;
  missingVariables: string[];
  warnings: string[];
}

/**
 * Template engine for rendering email templates with variables and personalization
 */
export class EmailTemplateEngine {
  private templates: Map<string, EmailTemplate> = new Map();

  constructor() {
    this.loadDefaultTemplates();
  }

  /**
   * Render template with variables and personalization
   */
  async renderTemplate(templateId: string, options: TemplateRenderOptions): Promise<RenderedTemplate> {
    const template = this.getTemplate(templateId);

    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Validate required variables
    const missingVariables = this.validateRequiredVariables(template, options.variables);
    const warnings: string[] = [];

    // Enhanced variables with personalization and tracking
    const enhancedVariables = {
      ...options.variables,
      ...options.personalization,
      ...this.generateTrackingVariables(options.tracking),
      // System variables
      unsubscribe_url: this.generateUnsubscribeUrl(options.tracking),
      view_in_browser_url: this.generateViewInBrowserUrl(options.tracking),
      company_name: process.env.COMPANY_NAME || 'Your Company',
      current_year: new Date().getFullYear().toString(),
      current_date: new Date().toLocaleDateString()
    };

    // Render subject line
    const subject = this.processTemplate(template.subject, enhancedVariables, warnings);

    // Render HTML content
    const html = this.processTemplate(template.htmlContent, enhancedVariables, warnings);

    // Render text content if available
    const text = template.textContent
      ? this.processTemplate(template.textContent, enhancedVariables, warnings)
      : this.generateTextFromHtml(html);

    return {
      subject,
      html: this.addTrackingPixel(html, options.tracking),
      text,
      variables: enhancedVariables,
      missingVariables,
      warnings
    };
  }

  /**
   * Create or update email template
   */
  async saveTemplate(template: Partial<EmailTemplate> & { name: string }): Promise<EmailTemplate> {
    const id = template.id || this.generateTemplateId(template.name);

    const fullTemplate: EmailTemplate = {
      id,
      name: template.name,
      description: template.description || '',
      category: template.category || 'lead_generation',
      subject: template.subject || '',
      htmlContent: template.htmlContent || '',
      textContent: template.textContent,
      variables: template.variables || [],
      tags: template.tags || [],
      isActive: template.isActive ?? true,
      version: (this.templates.get(id)?.version || 0) + 1,
      createdAt: this.templates.get(id)?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: template.createdBy || 'system',
      performanceMetrics: template.performanceMetrics,
      abTestConfig: template.abTestConfig
    };

    // Validate template syntax
    this.validateTemplate(fullTemplate);

    // Store template
    this.templates.set(id, fullTemplate);

    return fullTemplate;
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): EmailTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * List templates with filtering
   */
  listTemplates(filters: {
    category?: string;
    isActive?: boolean;
    tags?: string[];
    search?: string;
  } = {}): EmailTemplate[] {
    const templates = Array.from(this.templates.values());

    return templates.filter(template => {
      if (filters.category && template.category !== filters.category) return false;
      if (filters.isActive !== undefined && template.isActive !== filters.isActive) return false;
      if (filters.tags?.length && !filters.tags.some(tag => template.tags.includes(tag))) return false;
      if (filters.search) {
        const search = filters.search.toLowerCase();
        if (!template.name.toLowerCase().includes(search) &&
            !template.description.toLowerCase().includes(search)) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  /**
   * Clone template for A/B testing
   */
  async cloneTemplateForABTest(templateId: string, variantName: string, changes: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const original = this.getTemplate(templateId);

    if (!original) {
      throw new Error(`Original template not found: ${templateId}`);
    }

    const variant = await this.saveTemplate({
      ...original,
      id: `${templateId}_${variantName.toLowerCase().replace(/\s+/g, '_')}`,
      name: `${original.name} - ${variantName}`,
      ...changes,
      tags: [...original.tags, 'ab_test', 'variant'],
      version: 1
    });

    return variant;
  }

  /**
   * Get template performance analytics
   */
  async getTemplateAnalytics(templateId: string, dateRange?: { from: string; to: string }): Promise<TemplateMetrics | null> {
    const template = this.getTemplate(templateId);

    if (!template?.performanceMetrics) {
      return null;
    }

    // In production, this would query the database for real metrics
    return template.performanceMetrics;
  }

  /**
   * Update template metrics from email events
   */
  async updateTemplateMetrics(templateId: string, eventType: 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'converted' | 'unsubscribed' | 'complained'): Promise<void> {
    const template = this.templates.get(templateId);

    if (!template) return;

    if (!template.performanceMetrics) {
      template.performanceMetrics = {
        totalSent: 0,
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0,
        replyRate: 0,
        conversionRate: 0,
        unsubscribeRate: 0,
        spamRate: 0,
        lastUpdated: new Date().toISOString()
      };
    }

    const metrics = template.performanceMetrics;

    switch (eventType) {
      case 'sent':
        metrics.totalSent++;
        break;
      case 'delivered':
        // Calculate delivery rate
        break;
      case 'opened':
        // Update open rate
        break;
      case 'clicked':
        // Update click rate
        break;
      // ... other event types
    }

    metrics.lastUpdated = new Date().toISOString();
    this.templates.set(templateId, template);
  }

  /**
   * Private helper methods
   */
  private processTemplate(content: string, variables: Record<string, any>, warnings: string[]): string {
    let processed = content;

    // Handle Handlebars-style variables {{variable}}
    processed = processed.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
      const trimmedVar = varName.trim();

      if (variables.hasOwnProperty(trimmedVar)) {
        const value = variables[trimmedVar];
        return value !== null && value !== undefined ? String(value) : '';
      } else {
        warnings.push(`Variable not found: ${trimmedVar}`);
        return match; // Keep original if not found
      }
    });

    // Handle conditional blocks {{#if variable}}...{{/if}}
    processed = this.processConditionals(processed, variables, warnings);

    // Handle loops {{#each array}}...{{/each}}
    processed = this.processLoops(processed, variables, warnings);

    return processed;
  }

  private processConditionals(content: string, variables: Record<string, any>, warnings: string[]): string {
    return content.replace(/\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, block) => {
      const varName = condition.trim();
      const value = variables[varName];

      // Check if variable is truthy
      if (value && value !== '' && value !== 0 && value !== false) {
        return block;
      }

      return '';
    });
  }

  private processLoops(content: string, variables: Record<string, any>, warnings: string[]): string {
    return content.replace(/\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayName, block) => {
      const varName = arrayName.trim();
      const array = variables[varName];

      if (!Array.isArray(array)) {
        warnings.push(`Loop variable is not an array: ${varName}`);
        return '';
      }

      return array.map((item, index) => {
        let itemBlock = block;

        // Replace {{this}} with current item
        itemBlock = itemBlock.replace(/\{\{this\}\}/g, String(item));

        // Replace {{@index}} with current index
        itemBlock = itemBlock.replace(/\{\{@index\}\}/g, String(index));

        // Handle object properties if item is an object
        if (typeof item === 'object' && item !== null) {
          Object.entries(item).forEach(([key, value]) => {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            itemBlock = itemBlock.replace(regex, String(value));
          });
        }

        return itemBlock;
      }).join('');
    });
  }

  private validateRequiredVariables(template: EmailTemplate, variables: Record<string, any>): string[] {
    return template.variables
      .filter(variable => variable.required)
      .filter(variable => !variables.hasOwnProperty(variable.name))
      .map(variable => variable.name);
  }

  private validateTemplate(template: EmailTemplate): void {
    // Basic validation
    if (!template.subject) {
      throw new Error('Template must have a subject line');
    }

    if (!template.htmlContent && !template.textContent) {
      throw new Error('Template must have either HTML or text content');
    }

    // Validate variable references in template
    const variableNames = template.variables.map(v => v.name);
    const usedVariables = this.extractVariablesFromContent(template.htmlContent + template.subject);

    const undefinedVariables = usedVariables.filter(varName =>
      !variableNames.includes(varName) &&
      !this.isSystemVariable(varName)
    );

    if (undefinedVariables.length > 0) {
      console.warn(`Template ${template.id} uses undefined variables:`, undefinedVariables);
    }
  }

  private extractVariablesFromContent(content: string): string[] {
    const matches = content.match(/\{\{([^}]+)\}\}/g) || [];
    return matches.map(match => match.replace(/[{}]/g, '').trim());
  }

  private isSystemVariable(varName: string): boolean {
    const systemVars = [
      'unsubscribe_url', 'view_in_browser_url', 'company_name',
      'current_year', 'current_date', 'tracking_pixel'
    ];
    return systemVars.includes(varName);
  }

  private generateTrackingVariables(tracking?: TemplateRenderOptions['tracking']): Record<string, string> {
    if (!tracking) return {};

    const baseUrl = process.env.NEXT_PUBLIC_HOST || 'http://localhost:3030';
    const params: Record<string, string> = {};

    if (tracking.utm) {
      Object.entries(tracking.utm).forEach(([key, value]) => {
        if (value) params[`utm_${key}`] = value;
      });
    }

    return {
      tracking_campaign_id: tracking.campaignId || '',
      tracking_sequence_id: tracking.sequenceId || '',
      tracking_step_number: tracking.stepNumber?.toString() || '',
      utm_source: tracking.utm?.source || '',
      utm_medium: tracking.utm?.medium || 'email',
      utm_campaign: tracking.utm?.campaign || '',
      utm_term: tracking.utm?.term || '',
      utm_content: tracking.utm?.content || ''
    };
  }

  private generateUnsubscribeUrl(tracking?: TemplateRenderOptions['tracking']): string {
    const baseUrl = process.env.NEXT_PUBLIC_HOST || 'http://localhost:3030';
    const params = new URLSearchParams();

    if (tracking?.campaignId) params.set('campaign', tracking.campaignId);
    if (tracking?.sequenceId) params.set('sequence', tracking.sequenceId);

    return `${baseUrl}/unsubscribe?${params.toString()}`;
  }

  private generateViewInBrowserUrl(tracking?: TemplateRenderOptions['tracking']): string {
    const baseUrl = process.env.NEXT_PUBLIC_HOST || 'http://localhost:3030';
    return `${baseUrl}/email/view?id=${tracking?.campaignId || 'unknown'}`;
  }

  private addTrackingPixel(html: string, tracking?: TemplateRenderOptions['tracking']): string {
    if (!tracking?.campaignId) return html;

    const baseUrl = process.env.NEXT_PUBLIC_HOST || 'http://localhost:3030';
    const trackingPixel = `<img src="${baseUrl}/api/email/track/open?campaign=${tracking.campaignId}&sequence=${tracking.sequenceId}&step=${tracking.stepNumber}" width="1" height="1" style="display:none;" alt="" />`;

    // Add tracking pixel before closing body tag
    return html.replace('</body>', `${trackingPixel}</body>`);
  }

  private generateTextFromHtml(html: string): string {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gs, '')
      .replace(/<script[^>]*>.*?<\/script>/gs, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private generateTemplateId(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
  }

  /**
   * Load default templates
   */
  private loadDefaultTemplates(): void {
    // Lead Generation Templates
    this.templates.set('cold_outreach_tech', {
      id: 'cold_outreach_tech',
      name: 'Cold Outreach - Tech Companies',
      description: 'Initial outreach email for technology companies',
      category: 'lead_generation',
      subject: 'Quick question about {{company_name}}\'s {{tech_stack}}',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <p>Hi {{first_name}},</p>

          <p>I noticed {{company_name}} is using {{tech_stack}} for your platform. That's impressive – you're clearly focused on building with modern, scalable technology.</p>

          <p>I'm reaching out because I help companies like yours {{value_proposition}}. Given your focus on {{industry}}, I thought you might be interested in how we helped {{case_study_company}} {{case_study_result}}.</p>

          <p>Would you be open to a brief 15-minute conversation about your current {{pain_point}} challenges?</p>

          <p>Best regards,<br/>
          {{sender_name}}<br/>
          {{sender_title}}<br/>
          {{company_name}}</p>

          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            <a href="{{unsubscribe_url}}">Unsubscribe</a> |
            <a href="{{view_in_browser_url}}">View in browser</a>
          </p>
        </div>`,
      variables: [
        { name: 'first_name', type: 'string', required: true, description: 'Recipient first name', example: 'John' },
        { name: 'company_name', type: 'string', required: true, description: 'Target company name', example: 'Acme Corp' },
        { name: 'tech_stack', type: 'string', required: true, description: 'Technology stack used', example: 'React and Node.js' },
        { name: 'industry', type: 'string', required: true, description: 'Company industry', example: 'fintech' },
        { name: 'value_proposition', type: 'string', required: true, description: 'Your value proposition', example: 'accelerate development cycles' },
        { name: 'case_study_company', type: 'string', required: true, description: 'Success story company', example: 'TechStart Inc' },
        { name: 'case_study_result', type: 'string', required: true, description: 'Success story result', example: 'reduce deployment time by 60%' },
        { name: 'pain_point', type: 'string', required: true, description: 'Target pain point', example: 'scaling' },
        { name: 'sender_name', type: 'string', required: true, description: 'Sender full name', example: 'Jane Smith' },
        { name: 'sender_title', type: 'string', required: true, description: 'Sender job title', example: 'Solutions Architect' }
      ],
      tags: ['cold_outreach', 'tech', 'b2b'],
      isActive: true,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system'
    });

    this.templates.set('follow_up_interested', {
      id: 'follow_up_interested',
      name: 'Follow-up - Interested Prospect',
      description: 'Follow-up email for prospects who showed interest',
      category: 'follow_up',
      subject: 'Following up on our conversation about {{topic}}',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <p>Hi {{first_name}},</p>

          <p>Thanks for your time {{interaction_context}}. I wanted to follow up on our discussion about {{topic}}.</p>

          <p>As promised, I'm sharing {{promised_resource}}:</p>

          <ul>
            {{#each resources}}
            <li><a href="{{url}}">{{title}}</a> - {{description}}</li>
            {{/each}}
          </ul>

          <p>Based on what you shared about {{specific_challenge}}, I think {{specific_recommendation}} would be particularly relevant for {{company_name}}.</p>

          <p>Would next {{suggested_day}} work for a quick 20-minute call to discuss this further?</p>

          <p>Best regards,<br/>
          {{sender_name}}</p>

          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            <a href="{{unsubscribe_url}}">Unsubscribe</a> |
            <a href="{{view_in_browser_url}}">View in browser</a>
          </p>
        </div>`,
      variables: [
        { name: 'first_name', type: 'string', required: true, description: 'Recipient first name', example: 'John' },
        { name: 'interaction_context', type: 'string', required: true, description: 'How you met/interacted', example: 'on the call yesterday' },
        { name: 'topic', type: 'string', required: true, description: 'Discussion topic', example: 'API performance optimization' },
        { name: 'promised_resource', type: 'string', required: true, description: 'What you promised to share', example: 'the case studies we discussed' },
        { name: 'resources', type: 'string', required: false, description: 'Array of resources with url, title, description', example: '[]' },
        { name: 'specific_challenge', type: 'string', required: true, description: 'Their specific challenge', example: 'scaling database queries' },
        { name: 'specific_recommendation', type: 'string', required: true, description: 'Your specific recommendation', example: 'our caching solution' },
        { name: 'company_name', type: 'string', required: true, description: 'Target company name', example: 'Acme Corp' },
        { name: 'suggested_day', type: 'string', required: true, description: 'Suggested meeting day', example: 'Tuesday' },
        { name: 'sender_name', type: 'string', required: true, description: 'Sender full name', example: 'Jane Smith' }
      ],
      tags: ['follow_up', 'interested', 'b2b'],
      isActive: true,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system'
    });

    // Recruiting Templates
    this.templates.set('recruiting_initial', {
      id: 'recruiting_initial',
      name: 'Initial Candidate Outreach',
      description: 'First contact with potential candidates',
      category: 'recruiting',
      subject: '{{job_title}} opportunity at {{company_name}} - {{compelling_aspect}}',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <p>Hi {{first_name}},</p>

          <p>I came across your profile and was impressed by your experience with {{relevant_experience}}. Your background in {{specific_skills}} is exactly what we're looking for.</p>

          <p>I'm working with {{company_name}}, {{company_description}}. They're looking for a {{job_title}} to join their {{team_name}} team.</p>

          <p><strong>What makes this role special:</strong></p>
          <ul>
            <li>{{benefit_1}}</li>
            <li>{{benefit_2}}</li>
            <li>{{benefit_3}}</li>
          </ul>

          <p><strong>The role involves:</strong></p>
          <ul>
            {{#each responsibilities}}
            <li>{{this}}</li>
            {{/each}}
          </ul>

          <p>{{#if salary_range}}The salary range is {{salary_range}}, plus {{additional_benefits}}.{{/if}}</p>

          <p>Would you be interested in learning more? I'd love to set up a brief call to discuss the opportunity.</p>

          <p>Best regards,<br/>
          {{recruiter_name}}<br/>
          {{recruiter_title}}<br/>
          {{recruiter_company}}</p>

          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            <a href="{{unsubscribe_url}}">Unsubscribe from recruiting emails</a> |
            <a href="{{view_in_browser_url}}">View in browser</a>
          </p>
        </div>`,
      variables: [
        { name: 'first_name', type: 'string', required: true, description: 'Candidate first name', example: 'Sarah' },
        { name: 'relevant_experience', type: 'string', required: true, description: 'Relevant experience from their background', example: 'building scalable APIs' },
        { name: 'specific_skills', type: 'string', required: true, description: 'Specific skills that match', example: 'Python and AWS' },
        { name: 'company_name', type: 'string', required: true, description: 'Hiring company name', example: 'TechCorp' },
        { name: 'company_description', type: 'string', required: true, description: 'Brief company description', example: 'a fast-growing fintech startup' },
        { name: 'job_title', type: 'string', required: true, description: 'Job title', example: 'Senior Backend Engineer' },
        { name: 'team_name', type: 'string', required: true, description: 'Team name', example: 'Platform Engineering' },
        { name: 'benefit_1', type: 'string', required: true, description: 'First key benefit', example: 'Work on cutting-edge technology' },
        { name: 'benefit_2', type: 'string', required: true, description: 'Second key benefit', example: 'Remote-first culture' },
        { name: 'benefit_3', type: 'string', required: true, description: 'Third key benefit', example: 'Equity package' },
        { name: 'responsibilities', type: 'string', required: false, description: 'Array of job responsibilities', example: '[]' },
        { name: 'salary_range', type: 'string', required: false, description: 'Salary range if disclosed', example: '$120k-$160k' },
        { name: 'additional_benefits', type: 'string', required: false, description: 'Additional benefits', example: 'equity and full benefits' },
        { name: 'recruiter_name', type: 'string', required: true, description: 'Recruiter name', example: 'Mike Johnson' },
        { name: 'recruiter_title', type: 'string', required: true, description: 'Recruiter title', example: 'Technical Recruiter' },
        { name: 'recruiter_company', type: 'string', required: true, description: 'Recruiting company', example: 'TalentCorp' }
      ],
      tags: ['recruiting', 'initial_outreach', 'candidates'],
      isActive: true,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system'
    });
  }
}

// Export singleton instance
export const emailTemplateEngine = new EmailTemplateEngine();