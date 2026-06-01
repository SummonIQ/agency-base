import { emailTrackingService } from './email-tracking';

export interface ComplianceRule {
  id: string;
  name: string;
  type: 'gdpr' | 'can_spam' | 'casl' | 'custom';
  description: string;
  isRequired: boolean;
  validator: (email: EmailMessage) => Promise<ComplianceViolation[]>;
}

export interface ComplianceViolation {
  ruleId: string;
  severity: 'error' | 'warning';
  message: string;
  field?: string;
  suggestion?: string;
}

export interface EmailMessage {
  to: string[];
  from: string;
  fromName?: string;
  subject: string;
  html: string;
  text?: string;
  headers?: Record<string, string>;
}

export interface SuppressionListEntry {
  email: string;
  reason: 'bounced' | 'complained' | 'unsubscribed' | 'invalid' | 'manual';
  addedAt: Date;
  source?: string;
  metadata?: Record<string, any>;
}

export class EmailComplianceService {
  private suppressionList: Map<string, SuppressionListEntry> = new Map();
  private complianceRules: ComplianceRule[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    this.complianceRules = [
      {
        id: 'can-spam-from-address',
        name: 'CAN-SPAM: Valid From Address',
        type: 'can_spam',
        description: 'Sender must use a valid, monitored email address',
        isRequired: true,
        validator: async (email) => {
          const violations: ComplianceViolation[] = [];

          if (!email.from || !this.isValidEmail(email.from)) {
            violations.push({
              ruleId: 'can-spam-from-address',
              severity: 'error',
              message: 'From address must be a valid email address',
              field: 'from',
              suggestion: 'Use a valid, monitored email address'
            });
          }

          return violations;
        }
      },
      {
        id: 'can-spam-unsubscribe-link',
        name: 'CAN-SPAM: Unsubscribe Link',
        type: 'can_spam',
        description: 'Email must contain a clear unsubscribe mechanism',
        isRequired: true,
        validator: async (email) => {
          const violations: ComplianceViolation[] = [];

          const hasUnsubscribeLink = email.html.includes('unsubscribe') ||
                                   (email.text && email.text.includes('unsubscribe'));

          if (!hasUnsubscribeLink) {
            violations.push({
              ruleId: 'can-spam-unsubscribe-link',
              severity: 'error',
              message: 'Email must include an unsubscribe link',
              field: 'html',
              suggestion: 'Add an unsubscribe link to your email template'
            });
          }

          return violations;
        }
      },
      {
        id: 'can-spam-physical-address',
        name: 'CAN-SPAM: Physical Address',
        type: 'can_spam',
        description: 'Email must contain sender\'s physical address',
        isRequired: true,
        validator: async (email) => {
          const violations: ComplianceViolation[] = [];

          // Look for address patterns in HTML and text
          const addressPattern = /\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|blvd|boulevard)/i;
          const hasAddress = addressPattern.test(email.html) ||
                           (email.text && addressPattern.test(email.text));

          if (!hasAddress) {
            violations.push({
              ruleId: 'can-spam-physical-address',
              severity: 'warning',
              message: 'Consider including your physical address for CAN-SPAM compliance',
              field: 'html',
              suggestion: 'Add your business address to the email footer'
            });
          }

          return violations;
        }
      },
      {
        id: 'gdpr-consent',
        name: 'GDPR: Consent Basis',
        type: 'gdpr',
        description: 'Sender must have lawful basis for processing personal data',
        isRequired: true,
        validator: async (email) => {
          // This would integrate with your consent management system
          // For now, we'll check for opt-in metadata
          const violations: ComplianceViolation[] = [];

          // In real implementation, check against consent database
          // violations.push(...);

          return violations;
        }
      },
      {
        id: 'subject-line-clarity',
        name: 'Subject Line Clarity',
        type: 'custom',
        description: 'Subject line should be clear and not misleading',
        isRequired: false,
        validator: async (email) => {
          const violations: ComplianceViolation[] = [];

          // Check for spam-like subject patterns
          const spamPatterns = [
            /free\s*money/i,
            /click\s*here\s*now/i,
            /urgent\s*action\s*required/i,
            /limited\s*time\s*offer/i
          ];

          const isSpammy = spamPatterns.some(pattern => pattern.test(email.subject));

          if (isSpammy) {
            violations.push({
              ruleId: 'subject-line-clarity',
              severity: 'warning',
              message: 'Subject line may trigger spam filters',
              field: 'subject',
              suggestion: 'Use clear, honest subject lines'
            });
          }

          return violations;
        }
      }
    ];
  }

  async validateEmail(email: EmailMessage): Promise<{
    isCompliant: boolean;
    violations: ComplianceViolation[];
    suppressedRecipients: string[];
  }> {
    const violations: ComplianceViolation[] = [];
    const suppressedRecipients: string[] = [];

    // Check suppression list
    for (const recipient of email.to) {
      if (this.isSuppressed(recipient)) {
        suppressedRecipients.push(recipient);
      }
    }

    // Run compliance rules
    for (const rule of this.complianceRules) {
      const ruleViolations = await rule.validator(email);
      violations.push(...ruleViolations);
    }

    // Check for errors (not just warnings)
    const hasErrors = violations.some(v => v.severity === 'error');
    const isCompliant = !hasErrors && suppressedRecipients.length === 0;

    return {
      isCompliant,
      violations,
      suppressedRecipients
    };
  }

  addToSuppressionList(entry: SuppressionListEntry): void {
    this.suppressionList.set(entry.email.toLowerCase(), entry);
  }

  removeFromSuppressionList(email: string): void {
    this.suppressionList.delete(email.toLowerCase());
  }

  isSuppressed(email: string): boolean {
    return this.suppressionList.has(email.toLowerCase());
  }

  getSuppressionListEntry(email: string): SuppressionListEntry | undefined {
    return this.suppressionList.get(email.toLowerCase());
  }

  async processBounce(email: string, bounceType: 'soft' | 'hard', reason?: string): Promise<void> {
    if (bounceType === 'hard') {
      this.addToSuppressionList({
        email,
        reason: 'bounced',
        addedAt: new Date(),
        source: 'bounce_processing',
        metadata: { bounceType, reason }
      });
    }
  }

  async processComplaint(email: string, reason?: string): Promise<void> {
    this.addToSuppressionList({
      email,
      reason: 'complained',
      addedAt: new Date(),
      source: 'spam_complaint',
      metadata: { reason }
    });
  }

  generateUnsubscribeLink(email: string, messageId?: string, sequenceId?: string): string {
    const token = Buffer.from(`${email}:${process.env.BETTER_AUTH_SECRET}`).toString('base64');
    const params = new URLSearchParams({
      email,
      token,
      ...(messageId && { messageId }),
      ...(sequenceId && { sequenceId })
    });

    const baseUrl = process.env.NEXT_PUBLIC_HOST || 'http://localhost:3030';
    return `${baseUrl}/api/email/unsubscribe?${params.toString()}`;
  }

  addUnsubscribeToEmail(html: string, email: string, messageId?: string, sequenceId?: string): string {
    const unsubscribeLink = this.generateUnsubscribeLink(email, messageId, sequenceId);

    const unsubscribeFooter = `
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
        <p>
          You received this email because you subscribed to our mailing list.
          <br>
          <a href="${unsubscribeLink}" style="color: #6b7280; text-decoration: underline;">
            Unsubscribe from future emails
          </a>
        </p>
      </div>
    `;

    // Add before closing body tag
    if (html.includes('</body>')) {
      return html.replace('</body>', `${unsubscribeFooter}</body>`);
    } else {
      return html + unsubscribeFooter;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // GDPR compliance methods
  async exportUserData(email: string): Promise<any> {
    return {
      personalData: {
        email,
        suppressionStatus: this.getSuppressionListEntry(email)
      },
      trackingData: await emailTrackingService.getTrackingDataForEmail(email)
    };
  }

  async deleteUserData(email: string): Promise<void> {
    // Remove from suppression list
    this.removeFromSuppressionList(email);

    // Delete tracking data
    await emailTrackingService.deleteTrackingDataForEmail(email);
  }
}

export const emailComplianceService = new EmailComplianceService();