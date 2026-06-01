export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
}

export interface EmailOptions {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  tags?: string[];
  trackingEnabled?: boolean;
  webhookUrl?: string;
  customData?: Record<string, any>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  trackingId?: string;
}

export interface EmailProvider {
  send(options: EmailOptions): Promise<EmailResult>;
  verifyConfiguration(): Promise<boolean>;
}

// Abstract base class for email providers
export abstract class BaseEmailProvider implements EmailProvider {
  protected apiKey: string;
  protected baseUrl?: string;

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  abstract send(options: EmailOptions): Promise<EmailResult>;
  abstract verifyConfiguration(): Promise<boolean>;

  protected validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  protected sanitizeHtml(html: string): string {
    // Basic HTML sanitization - in production, use a proper library like DOMPurify
    return html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:/gi, '');
  }
}

// SendGrid implementation
export class SendGridProvider extends BaseEmailProvider {
  constructor(apiKey: string) {
    super(apiKey, 'https://api.sendgrid.com');
  }

  async send(options: EmailOptions): Promise<EmailResult> {
    try {
      if (!this.validateEmail(options.to) || !this.validateEmail(options.from)) {
        return {
          success: false,
          error: 'Invalid email address'
        };
      }

      const payload = {
        personalizations: [{
          to: [{ email: options.to }],
          ...(options.cc && { cc: options.cc.map(email => ({ email })) }),
          ...(options.bcc && { bcc: options.bcc.map(email => ({ email })) }),
          subject: options.subject
        }],
        from: { email: options.from },
        ...(options.replyTo && { reply_to: { email: options.replyTo } }),
        content: [
          {
            type: 'text/html',
            value: this.sanitizeHtml(options.html)
          },
          ...(options.text ? [{
            type: 'text/plain',
            value: options.text
          }] : [])
        ],
        ...(options.trackingEnabled && {
          tracking_settings: {
            click_tracking: { enable: true },
            open_tracking: { enable: true }
          }
        }),
        ...(options.tags && {
          custom_args: options.tags.reduce((acc, tag, index) => {
            acc[`tag_${index}`] = tag;
            return acc;
          }, {} as Record<string, string>)
        }),
        ...(options.customData && {
          custom_args: {
            ...options.customData,
            ...(options.tags && options.tags.reduce((acc, tag, index) => {
              acc[`tag_${index}`] = tag;
              return acc;
            }, {} as Record<string, string>))
          }
        })
      };

      const response = await fetch(`${this.baseUrl}/v3/mail/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const messageId = response.headers.get('x-message-id');
        return {
          success: true,
          messageId: messageId || undefined
        };
      } else {
        const error = await response.text();
        return {
          success: false,
          error: `SendGrid error: ${error}`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `SendGrid error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async verifyConfiguration(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/v3/user/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Mailgun implementation
export class MailgunProvider extends BaseEmailProvider {
  private domain: string;

  constructor(apiKey: string, domain: string) {
    super(apiKey, 'https://api.mailgun.net');
    this.domain = domain;
  }

  async send(options: EmailOptions): Promise<EmailResult> {
    try {
      if (!this.validateEmail(options.to) || !this.validateEmail(options.from)) {
        return {
          success: false,
          error: 'Invalid email address'
        };
      }

      const formData = new FormData();
      formData.append('from', options.from);
      formData.append('to', options.to);
      formData.append('subject', options.subject);
      formData.append('html', this.sanitizeHtml(options.html));

      if (options.text) {
        formData.append('text', options.text);
      }

      if (options.replyTo) {
        formData.append('h:Reply-To', options.replyTo);
      }

      if (options.cc?.length) {
        formData.append('cc', options.cc.join(','));
      }

      if (options.bcc?.length) {
        formData.append('bcc', options.bcc.join(','));
      }

      if (options.trackingEnabled) {
        formData.append('o:tracking', 'true');
        formData.append('o:tracking-clicks', 'true');
        formData.append('o:tracking-opens', 'true');
      }

      if (options.tags?.length) {
        options.tags.forEach(tag => formData.append('o:tag', tag));
      }

      const response = await fetch(`${this.baseUrl}/v3/${this.domain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${this.apiKey}`).toString('base64')}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          messageId: result.id
        };
      } else {
        const error = await response.text();
        return {
          success: false,
          error: `Mailgun error: ${error}`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Mailgun error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async verifyConfiguration(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/v3/domains/${this.domain}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${this.apiKey}`).toString('base64')}`
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Development/Mock provider
export class MockEmailProvider extends BaseEmailProvider {
  private mockDelay: number;

  constructor(mockDelay: number = 1000) {
    super('mock-key');
    this.mockDelay = mockDelay;
  }

  async send(options: EmailOptions): Promise<EmailResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, this.mockDelay));

    console.log('📧 Mock Email Sent:');
    console.log(`To: ${options.to}`);
    console.log(`From: ${options.from}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`HTML: ${options.html.substring(0, 100)}...`);

    if (options.tags) {
      console.log(`Tags: ${options.tags.join(', ')}`);
    }

    // Simulate success/failure (90% success rate)
    const success = Math.random() > 0.1;

    if (success) {
      return {
        success: true,
        messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
    } else {
      return {
        success: false,
        error: 'Mock delivery failure'
      };
    }
  }

  async verifyConfiguration(): Promise<boolean> {
    return true;
  }
}

// Email service factory
export class EmailService {
  private provider: EmailProvider;

  constructor(provider: EmailProvider) {
    this.provider = provider;
  }

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    return await this.provider.send(options);
  }

  async verifyProvider(): Promise<boolean> {
    return await this.provider.verifyConfiguration();
  }

  static create(): EmailService {
    const provider = process.env.EMAIL_PROVIDER || 'mock';

    switch (provider.toLowerCase()) {
      case 'sendgrid':
        if (!process.env.SENDGRID_API_KEY) {
          throw new Error('SENDGRID_API_KEY environment variable is required');
        }
        return new EmailService(new SendGridProvider(process.env.SENDGRID_API_KEY));

      case 'mailgun':
        if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
          throw new Error('MAILGUN_API_KEY and MAILGUN_DOMAIN environment variables are required');
        }
        return new EmailService(new MailgunProvider(
          process.env.MAILGUN_API_KEY,
          process.env.MAILGUN_DOMAIN
        ));

      case 'mock':
      default:
        return new EmailService(new MockEmailProvider());
    }
  }
}

export const emailService = EmailService.create();