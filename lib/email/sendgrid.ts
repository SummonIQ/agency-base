import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
}

export interface EmailRecipient {
  email: string;
  name?: string;
  variables?: Record<string, string>;
}

export interface EmailSequence {
  id: string;
  name: string;
  templateIds: string[];
  delayDays: number[];
  isActive: boolean;
}

export interface SendEmailOptions {
  to: EmailRecipient[];
  templateId?: string;
  subject?: string;
  htmlContent?: string;
  textContent?: string;
  variables?: Record<string, string>;
  trackingSettings?: {
    clickTracking?: boolean;
    openTracking?: boolean;
    subscriptionTracking?: boolean;
  };
}

export class SendGridService {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.SENDGRID_API_KEY || '';
    if (this.apiKey) {
      sgMail.setApiKey(this.apiKey);
    }
  }

  /**
   * Send a single email
   */
  async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.apiKey) {
        throw new Error('SendGrid API key not configured');
      }

      const msg = {
        to: options.to.map(recipient => ({
          email: recipient.email,
          name: recipient.name,
        })),
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com',
          name: process.env.SENDGRID_FROM_NAME || 'Your Business',
        },
        subject: options.subject || 'No Subject',
        html: options.htmlContent || '',
        text: options.textContent || '',
        trackingSettings: {
          clickTracking: {
            enable: options.trackingSettings?.clickTracking ?? true,
          },
          openTracking: {
            enable: options.trackingSettings?.openTracking ?? true,
          },
          subscriptionTracking: {
            enable: options.trackingSettings?.subscriptionTracking ?? false,
          },
        },
        // Add custom headers for tracking
        customArgs: {
          campaign_id: options.templateId || 'manual',
          sent_at: new Date().toISOString(),
        },
      };

      const [response] = await sgMail.send(msg);
      
      return {
        success: true,
        messageId: response.headers['x-message-id'],
      };
    } catch (error: any) {
      console.error('SendGrid send error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }
  }

  /**
   * Send templated email with variable substitution
   */
  async sendTemplatedEmail(
    templateId: string,
    recipients: EmailRecipient[],
    globalVariables?: Record<string, string>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.apiKey) {
        throw new Error('SendGrid API key not configured');
      }

      // For now, we'll use dynamic templates stored in our database
      // In production, you might want to use SendGrid's dynamic templates
      const template = await this.getTemplate(templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      const results = [];
      
      for (const recipient of recipients) {
        const variables = { ...globalVariables, ...recipient.variables };
        
        // Replace variables in template
        let htmlContent = template.htmlContent;
        let textContent = template.textContent;
        let subject = template.subject;

        // Simple variable replacement ({{variable}})
        for (const [key, value] of Object.entries(variables)) {
          const regex = new RegExp(`{{${key}}}`, 'g');
          htmlContent = htmlContent.replace(regex, value);
          textContent = textContent.replace(regex, value);
          subject = subject.replace(regex, value);
        }

        const result = await this.sendEmail({
          to: [recipient],
          subject,
          htmlContent,
          textContent,
          templateId,
        });

        results.push(result);
      }

      const allSuccessful = results.every(r => r.success);
      return {
        success: allSuccessful,
        messageId: results.map(r => r.messageId).join(','),
        error: allSuccessful ? undefined : 'Some emails failed to send',
      };
    } catch (error: any) {
      console.error('SendGrid templated send error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send templated email',
      };
    }
  }

  /**
   * Get email template (from database or cache)
   */
  private async getTemplate(templateId: string): Promise<EmailTemplate | null> {
    // This would typically fetch from your database
    // For now, return a mock template
    const mockTemplates: Record<string, EmailTemplate> = {
      'recruiting-warm': {
        id: 'recruiting-warm',
        name: 'Warm Recruiting Outreach',
        subject: 'Quick question about {{company}}\'s hiring plans',
        htmlContent: `
          <p>Hi {{firstName}},</p>
          <p>Hope you're doing well! I've been expanding my recruiting practice to help tech companies find exceptional talent.</p>
          <p>Given your experience at {{company}}, I'm curious - are you planning any hiring in the next 3-6 months? I specialize in placing senior developers, engineering managers, and technical leads.</p>
          <p>Would love to catch up and see if there's a way I can support your team's growth.</p>
          <p>Best,<br>{{senderName}}</p>
        `,
        textContent: `Hi {{firstName}},

Hope you're doing well! I've been expanding my recruiting practice to help tech companies find exceptional talent.

Given your experience at {{company}}, I'm curious - are you planning any hiring in the next 3-6 months? I specialize in placing senior developers, engineering managers, and technical leads.

Would love to catch up and see if there's a way I can support your team's growth.

Best,
{{senderName}}`,
        variables: ['firstName', 'company', 'senderName'],
      },
      'lead-gen-cold': {
        id: 'lead-gen-cold',
        name: 'Agency Lead Generation',
        subject: 'Scaling {{company}}\'s development team?',
        htmlContent: `
          <p>Hi {{firstName}},</p>
          <p>I noticed {{company}} has been growing rapidly. Congratulations!</p>
          <p>I run a development agency that helps companies like yours scale their engineering teams quickly. We specialize in:</p>
          <ul>
            <li>Full-stack web applications</li>
            <li>Mobile app development</li>
            <li>Technical architecture & consulting</li>
            <li>DevOps & infrastructure</li>
          </ul>
          <p>Would you be open to a brief conversation about your development needs?</p>
          <p>Best regards,<br>{{senderName}}</p>
        `,
        textContent: `Hi {{firstName}},

I noticed {{company}} has been growing rapidly. Congratulations!

I run a development agency that helps companies like yours scale their engineering teams quickly. We specialize in:

• Full-stack web applications
• Mobile app development  
• Technical architecture & consulting
• DevOps & infrastructure

Would you be open to a brief conversation about your development needs?

Best regards,
{{senderName}}`,
        variables: ['firstName', 'company', 'senderName'],
      },
    };

    return mockTemplates[templateId] || null;
  }

  /**
   * Get email statistics
   */
  async getEmailStats(startDate?: Date, endDate?: Date): Promise<{
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  }> {
    try {
      if (!this.apiKey) {
        throw new Error('SendGrid API key not configured');
      }

      // This would use SendGrid's Stats API
      // For now, return mock data
      return {
        sent: 135,
        delivered: 132,
        opened: 89,
        clicked: 23,
        bounced: 3,
        unsubscribed: 1,
      };
    } catch (error) {
      console.error('Failed to get email stats:', error);
      return {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0,
      };
    }
  }

  /**
   * Validate email configuration
   */
  async validateConfiguration(): Promise<{ isValid: boolean; error?: string }> {
    try {
      if (!this.apiKey) {
        return { isValid: false, error: 'API key not configured' };
      }

      // Test the API key by making a simple request
      // For now, just check if the key exists
      return { isValid: true };
    } catch (error: any) {
      return { isValid: false, error: error.message };
    }
  }
}

// Export singleton instance
export const sendGridService = new SendGridService();
