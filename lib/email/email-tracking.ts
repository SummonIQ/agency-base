import { emailAnalyticsEngine } from './email-analytics';

export interface EmailTrackingPixel {
  messageId: string;
  recipientEmail: string;
  campaignId?: string;
  sequenceId?: string;
  metadata?: Record<string, any>;
}

export interface EmailLinkTracking {
  messageId: string;
  originalUrl: string;
  trackedUrl: string;
  recipientEmail: string;
  campaignId?: string;
  sequenceId?: string;
}

export class EmailTrackingService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_HOST || 'http://localhost:3030';
  }

  generateTrackingPixel(data: EmailTrackingPixel): string {
    const params = new URLSearchParams({
      messageId: data.messageId,
      email: data.recipientEmail,
      ...(data.campaignId && { campaignId: data.campaignId }),
      ...(data.sequenceId && { sequenceId: data.sequenceId }),
      ...(data.metadata && { metadata: JSON.stringify(data.metadata) })
    });

    return `${this.baseUrl}/api/email/tracking/pixel.gif?${params.toString()}`;
  }

  generateTrackedLink(originalUrl: string, data: Omit<EmailLinkTracking, 'originalUrl' | 'trackedUrl'>): string {
    const params = new URLSearchParams({
      url: originalUrl,
      messageId: data.messageId,
      email: data.recipientEmail,
      ...(data.campaignId && { campaignId: data.campaignId }),
      ...(data.sequenceId && { sequenceId: data.sequenceId })
    });

    return `${this.baseUrl}/api/email/tracking/click?${params.toString()}`;
  }

  injectTrackingPixel(html: string, trackingData: EmailTrackingPixel): string {
    const pixelUrl = this.generateTrackingPixel(trackingData);
    const trackingPixel = `<img src="${pixelUrl}" width="1" height="1" style="display:none;" alt="" />`;

    // Inject before closing body tag, or at the end if no body tag
    if (html.includes('</body>')) {
      return html.replace('</body>', `${trackingPixel}</body>`);
    } else {
      return html + trackingPixel;
    }
  }

  injectLinkTracking(
    html: string,
    trackingData: Omit<EmailLinkTracking, 'originalUrl' | 'trackedUrl'>
  ): string {
    // Replace all href attributes with tracked URLs
    return html.replace(/href="([^"]+)"/g, (match, url) => {
      // Skip email links and anchors
      if (url.startsWith('mailto:') || url.startsWith('#')) {
        return match;
      }

      const trackedUrl = this.generateTrackedLink(url, trackingData);
      return `href="${trackedUrl}"`;
    });
  }

  async recordOpen(messageId: string, recipientEmail: string, metadata?: Record<string, any>): Promise<void> {
    await emailAnalyticsEngine.recordEvent({
      type: 'opened',
      timestamp: new Date(),
      messageId,
      recipientEmail,
      metadata
    });
  }

  async recordClick(
    messageId: string,
    recipientEmail: string,
    url: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await emailAnalyticsEngine.recordEvent({
      type: 'clicked',
      timestamp: new Date(),
      messageId,
      recipientEmail,
      metadata: {
        ...metadata,
        url
      }
    });
  }

  async recordUnsubscribe(messageId: string, recipientEmail: string, reason?: string): Promise<void> {
    await emailAnalyticsEngine.recordEvent({
      type: 'unsubscribed',
      timestamp: new Date(),
      messageId,
      recipientEmail,
      metadata: {
        reason
      }
    });
  }

  extractEmailFromTrackedData(searchParams: URLSearchParams): {
    messageId?: string;
    email?: string;
    campaignId?: string;
    sequenceId?: string;
    metadata?: Record<string, any>;
  } {
    const metadata = searchParams.get('metadata');

    return {
      messageId: searchParams.get('messageId') || undefined,
      email: searchParams.get('email') || undefined,
      campaignId: searchParams.get('campaignId') || undefined,
      sequenceId: searchParams.get('sequenceId') || undefined,
      metadata: metadata ? JSON.parse(metadata) : undefined
    };
  }

  // GDPR compliance helpers
  async getTrackingDataForEmail(email: string): Promise<any[]> {
    return emailAnalyticsEngine.getEmailTrackingData(email);
  }

  async deleteTrackingDataForEmail(email: string): Promise<void> {
    return emailAnalyticsEngine.deleteEmailTrackingData(email);
  }
}

export const emailTrackingService = new EmailTrackingService();