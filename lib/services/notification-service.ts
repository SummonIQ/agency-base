// Notification Service - Email notifications for client portal and recruiting events

import { TemplateEngineService } from '@/lib/email/template-engine-service';

export interface NotificationContext {
  // Client information
  clientName: string;
  clientEmail: string;
  primaryContactName?: string;
  
  // Requisition information
  requisitionId?: string;
  requisitionTitle?: string;
  jobTitle?: string;
  department?: string;
  location?: string;
  
  // Candidate information
  candidateId?: string;
  candidateName?: string;
  candidateCount?: number;
  
  // Portal access
  portalUrl?: string;
  shareToken?: string;
  
  // Feedback information
  pendingFeedbackCount?: number;
  
  // Interview information
  interviewDate?: string;
  interviewTime?: string;
  interviewType?: string;
  
  // Custom fields
  [key: string]: string | number | undefined;
}

export enum NotificationType {
  PORTAL_ACCESS = 'portal_access',
  NEW_CANDIDATE = 'new_candidate',
  CANDIDATE_BATCH = 'candidate_batch',
  FEEDBACK_REMINDER = 'feedback_reminder',
  INTERVIEW_REQUESTED = 'interview_requested',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  REQUISITION_FILLED = 'requisition_filled',
  WEEKLY_UPDATE = 'weekly_update',
}

export interface NotificationTemplate {
  type: NotificationType;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export class NotificationService {
  /**
   * Get notification templates
   */
  static getTemplates(): Record<NotificationType, NotificationTemplate> {
    return {
      [NotificationType.PORTAL_ACCESS]: {
        type: NotificationType.PORTAL_ACCESS,
        subject: 'Access Your Recruiting Portal - {{jobTitle}}',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welcome to Your Recruiting Portal</h2>
            
            <p>Hi {{primaryContactName|default:"there"}},</p>
            
            <p>We're excited to begin the search for your <strong>{{jobTitle}}</strong> position{{#if department}} in the {{department}} department{{/if}}.</p>
            
            <p>We've created a dedicated portal where you can:</p>
            <ul>
              <li>View all candidates in real-time</li>
              <li>Review profiles, resumes, and qualifications</li>
              <li>Provide feedback and request interviews</li>
              <li>Track the hiring pipeline progress</li>
            </ul>
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="{{portalUrl}}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Access Your Portal
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              <strong>Note:</strong> This link is unique to your company and provides secure access to your recruiting pipeline. You can bookmark it for easy access anytime.
            </p>
            
            <p>We'll keep you updated as we add qualified candidates to your pipeline.</p>
            
            <p>Best regards,<br>Your Recruiting Team</p>
          </div>
        `,
      },
      
      [NotificationType.NEW_CANDIDATE]: {
        type: NotificationType.NEW_CANDIDATE,
        subject: 'New Candidate Added - {{candidateName}} for {{jobTitle}}',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Candidate Ready for Review</h2>
            
            <p>Hi {{primaryContactName|default:"there"}},</p>
            
            <p>We've added a new candidate to your <strong>{{jobTitle}}</strong> pipeline:</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1f2937;">{{candidateName}}</h3>
              <p style="margin: 5px 0; color: #4b5563;">Ready for your review</p>
            </div>
            
            <p>Please review their profile and provide feedback at your earliest convenience.</p>
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="{{portalUrl}}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Review Candidate
              </a>
            </div>
            
            <p>Best regards,<br>Your Recruiting Team</p>
          </div>
        `,
      },
      
      [NotificationType.CANDIDATE_BATCH]: {
        type: NotificationType.CANDIDATE_BATCH,
        subject: '{{candidateCount}} New Candidates Added - {{jobTitle}}',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Candidates Ready for Review</h2>
            
            <p>Hi {{primaryContactName|default:"there"}},</p>
            
            <p>We've added <strong>{{candidateCount}} new candidates</strong> to your <strong>{{jobTitle}}</strong> pipeline.</p>
            
            <p>These candidates have been pre-screened and match your requirements. Please review their profiles and let us know who you'd like to interview.</p>
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="{{portalUrl}}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Review Candidates
              </a>
            </div>
            
            <p>Best regards,<br>Your Recruiting Team</p>
          </div>
        `,
      },
      
      [NotificationType.FEEDBACK_REMINDER]: {
        type: NotificationType.FEEDBACK_REMINDER,
        subject: 'Reminder: {{pendingFeedbackCount}} Candidates Awaiting Your Feedback',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">Feedback Reminder</h2>
            
            <p>Hi {{primaryContactName|default:"there"}},</p>
            
            <p>You have <strong>{{pendingFeedbackCount}} candidates</strong> in your <strong>{{jobTitle}}</strong> pipeline awaiting your feedback.</p>
            
            <p>Quick feedback helps us move faster and secure top talent before they accept other offers.</p>
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="{{portalUrl}}" style="background-color: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Provide Feedback
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              <strong>Tip:</strong> Even a quick "interested" or "pass" helps us focus on the right candidates for you.
            </p>
            
            <p>Best regards,<br>Your Recruiting Team</p>
          </div>
        `,
      },
      
      [NotificationType.INTERVIEW_REQUESTED]: {
        type: NotificationType.INTERVIEW_REQUESTED,
        subject: 'Interview Requested - {{candidateName}} for {{jobTitle}}',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Interview Request Received</h2>
            
            <p>Hi {{primaryContactName|default:"there"}},</p>
            
            <p>Great news! You've requested an interview with <strong>{{candidateName}}</strong> for your <strong>{{jobTitle}}</strong> position.</p>
            
            <p>We'll coordinate with the candidate and send you interview scheduling options shortly.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1f2937;">Next Steps:</h3>
              <ol style="margin: 10px 0; padding-left: 20px;">
                <li>We'll confirm candidate availability</li>
                <li>Send you scheduling options</li>
                <li>Set up the interview (video/phone/in-person)</li>
              </ol>
            </div>
            
            <p>We'll be in touch within 24 hours.</p>
            
            <p>Best regards,<br>Your Recruiting Team</p>
          </div>
        `,
      },
      
      [NotificationType.INTERVIEW_SCHEDULED]: {
        type: NotificationType.INTERVIEW_SCHEDULED,
        subject: 'Interview Confirmed - {{candidateName}} on {{interviewDate}}',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Interview Confirmed</h2>
            
            <p>Hi {{primaryContactName|default:"there"}},</p>
            
            <p>Your interview with <strong>{{candidateName}}</strong> has been scheduled:</p>
            
            <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Date:</strong> {{interviewDate}}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> {{interviewTime}}</p>
              <p style="margin: 5px 0;"><strong>Type:</strong> {{interviewType}}</p>
            </div>
            
            <p>Calendar invite and interview details have been sent separately.</p>
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="{{portalUrl}}" style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Candidate Profile
              </a>
            </div>
            
            <p>Best regards,<br>Your Recruiting Team</p>
          </div>
        `,
      },
      
      [NotificationType.REQUISITION_FILLED]: {
        type: NotificationType.REQUISITION_FILLED,
        subject: 'Position Filled - {{jobTitle}} Successfully Placed! 🎉',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Congratulations! Position Filled</h2>
            
            <p>Hi {{primaryContactName|default:"there"}},</p>
            
            <p>We're thrilled to announce that your <strong>{{jobTitle}}</strong> position has been successfully filled with <strong>{{candidateName}}</strong>!</p>
            
            <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="font-size: 48px; margin: 0;">🎉</p>
              <h3 style="color: #10b981; margin: 10px 0;">Position Filled!</h3>
            </div>
            
            <p>Thank you for trusting us with this search. We'll follow up with onboarding support and check in after the first 30 days.</p>
            
            <p>We look forward to partnering with you on future hiring needs!</p>
            
            <p>Best regards,<br>Your Recruiting Team</p>
          </div>
        `,
      },
      
      [NotificationType.WEEKLY_UPDATE]: {
        type: NotificationType.WEEKLY_UPDATE,
        subject: 'Weekly Update - {{jobTitle}} Recruiting Progress',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Weekly Recruiting Update</h2>
            
            <p>Hi {{primaryContactName|default:"there"}},</p>
            
            <p>Here's your weekly update for the <strong>{{jobTitle}}</strong> search:</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1f2937;">This Week's Activity:</h3>
              <ul style="margin: 10px 0;">
                <li>New candidates added: {{candidateCount}}</li>
                <li>Pending your feedback: {{pendingFeedbackCount}}</li>
                <li>Interviews scheduled: {{interviewCount|default:"0"}}</li>
              </ul>
            </div>
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="{{portalUrl}}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Full Pipeline
              </a>
            </div>
            
            <p>Let us know if you have any questions or need to adjust the search criteria.</p>
            
            <p>Best regards,<br>Your Recruiting Team</p>
          </div>
        `,
      },
    };
  }

  /**
   * Send notification email
   */
  static async sendNotification(
    type: NotificationType,
    context: NotificationContext,
    options?: {
      fromEmail?: string;
      fromName?: string;
      replyTo?: string;
    }
  ): Promise<boolean> {
    try {
      const templates = this.getTemplates();
      const template = templates[type];

      if (!template) {
        throw new Error(`Template not found for notification type: ${type}`);
      }

      // Render subject with template engine
      const renderedSubject = TemplateEngineService.render(
        template.subject,
        context
      );

      // Render HTML content with template engine
      const renderedHtml = TemplateEngineService.render(
        template.htmlContent,
        context
      );

      // Convert HTML to plain text
      const renderedText = TemplateEngineService.htmlToText(renderedHtml);

      // Send email via SendGrid/Mailgun
      // This would integrate with your email service
      const emailData = {
        to: context.clientEmail,
        from: options?.fromEmail || process.env.SENDGRID_FROM_EMAIL || 'recruiting@youragency.com',
        fromName: options?.fromName || 'Your Recruiting Team',
        replyTo: options?.replyTo,
        subject: renderedSubject,
        html: renderedHtml,
        text: renderedText,
      };

      // TODO: Integrate with SendGrid API
      console.log('Sending notification email:', {
        type,
        to: emailData.to,
        subject: emailData.subject,
      });

      // For now, return success
      // In production, this would call SendGrid API
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  /**
   * Send portal access notification
   */
  static async sendPortalAccess(
    clientEmail: string,
    clientName: string,
    requisitionTitle: string,
    shareToken: string,
    options?: {
      primaryContactName?: string;
      department?: string;
      baseUrl?: string;
    }
  ): Promise<boolean> {
    const baseUrl = options?.baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const portalUrl = `${baseUrl}/client-portal?token=${shareToken}`;

    return this.sendNotification(NotificationType.PORTAL_ACCESS, {
      clientEmail,
      clientName,
      primaryContactName: options?.primaryContactName,
      jobTitle: requisitionTitle,
      department: options?.department,
      portalUrl,
      shareToken,
    });
  }

  /**
   * Send new candidate notification
   */
  static async sendNewCandidate(
    clientEmail: string,
    clientName: string,
    requisitionTitle: string,
    candidateName: string,
    shareToken: string,
    options?: {
      primaryContactName?: string;
      baseUrl?: string;
    }
  ): Promise<boolean> {
    const baseUrl = options?.baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const portalUrl = `${baseUrl}/client-portal?token=${shareToken}`;

    return this.sendNotification(NotificationType.NEW_CANDIDATE, {
      clientEmail,
      clientName,
      primaryContactName: options?.primaryContactName,
      jobTitle: requisitionTitle,
      candidateName,
      portalUrl,
      shareToken,
    });
  }

  /**
   * Send feedback reminder
   */
  static async sendFeedbackReminder(
    clientEmail: string,
    clientName: string,
    requisitionTitle: string,
    pendingCount: number,
    shareToken: string,
    options?: {
      primaryContactName?: string;
      baseUrl?: string;
    }
  ): Promise<boolean> {
    const baseUrl = options?.baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const portalUrl = `${baseUrl}/client-portal?token=${shareToken}`;

    return this.sendNotification(NotificationType.FEEDBACK_REMINDER, {
      clientEmail,
      clientName,
      primaryContactName: options?.primaryContactName,
      jobTitle: requisitionTitle,
      pendingFeedbackCount: pendingCount,
      portalUrl,
      shareToken,
    });
  }
}
