import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

// Email webhook handler for tracking email events
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-signature');
    const provider = req.headers.get('x-email-provider') || 'unknown';

    // Verify webhook signature for security
    if (!verifyWebhookSignature(body, signature, provider)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const events = JSON.parse(body);
    const processedEvents = [];

    // Process each event in the webhook
    for (const event of Array.isArray(events) ? events : [events]) {
      const processed = await processEmailEvent(event, provider);
      if (processed) {
        processedEvents.push(processed);
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedEvents.length,
      events: processedEvents,
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

async function processEmailEvent(event: any, provider: string) {
  try {
    // Extract common fields based on provider
    const { eventType, messageId, timestamp, email, data } = normalizeEvent(event, provider);

    if (!messageId || !eventType) {
      console.warn('Invalid event data:', event);
      return null;
    }

    // Find the corresponding outreach activity
    const activity = await db.outreachActivity.findFirst({
      where: {
        metadata: {
          path: ['messageId'],
          equals: messageId,
        },
      },
      include: {
        lead: true,
      },
    });

    if (!activity) {
      console.warn('No activity found for messageId:', messageId);
      return null;
    }

    // Update activity metadata with event data
    const updatedMetadata = {
      ...activity.metadata,
      events: [
        ...(activity.metadata?.events || []),
        {
          type: eventType,
          timestamp: timestamp || new Date().toISOString(),
          data,
        },
      ],
      // Update tracking flags
      ...(eventType === 'delivered' && { delivered: true }),
      ...(eventType === 'opened' && { opened: true, openedAt: timestamp }),
      ...(eventType === 'clicked' && { clicked: true, clickedAt: timestamp }),
      ...(eventType === 'bounced' && { bounced: true, bouncedAt: timestamp }),
      ...(eventType === 'complained' && { complained: true, complainedAt: timestamp }),
      ...(eventType === 'unsubscribed' && { unsubscribed: true, unsubscribedAt: timestamp }),
    };

    // Update activity in database
    await db.outreachActivity.update({
      where: { id: activity.id },
      data: {
        metadata: updatedMetadata,
        // Update status based on event type
        status: getStatusFromEvent(eventType, activity.status),
      },
    });

    // Handle specific event types
    if (eventType === 'replied') {
      await handleEmailReply(activity, data);
    }

    return {
      eventType,
      messageId,
      leadId: activity.leadId,
      activityId: activity.id,
      processed: true,
    };
  } catch (error) {
    console.error('Error processing event:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      event,
      processed: false,
    };
  }
}

function normalizeEvent(event: any, provider: string) {
  switch (provider) {
    case 'sendgrid':
      return {
        eventType: event.event,
        messageId: event.sg_message_id,
        timestamp: new Date(event.timestamp * 1000).toISOString(),
        email: event.email,
        data: {
          reason: event.reason,
          url: event.url,
          useragent: event.useragent,
          ip: event.ip,
        },
      };

    case 'mailgun':
      return {
        eventType: event['event-data']?.event,
        messageId: event['event-data']?.message?.headers?.['message-id'],
        timestamp: new Date(event['event-data']?.timestamp * 1000).toISOString(),
        email: event['event-data']?.recipient,
        data: {
          reason: event['event-data']?.reason,
          url: event['event-data']?.url,
          clientName: event['event-data']?.['client-info']?.['client-name'],
          clientOs: event['event-data']?.['client-info']?.['client-os'],
          ip: event['event-data']?.ip,
        },
      };

    default:
      // Generic format
      return {
        eventType: event.type || event.event,
        messageId: event.messageId || event.message_id,
        timestamp: event.timestamp || new Date().toISOString(),
        email: event.email || event.recipient,
        data: event.data || {},
      };
  }
}

function getStatusFromEvent(eventType: string, currentStatus: string): string {
  switch (eventType) {
    case 'delivered':
      return currentStatus === 'PENDING' ? 'SENT' : currentStatus;
    case 'bounced':
    case 'dropped':
      return 'FAILED';
    case 'opened':
      return currentStatus === 'SENT' ? 'OPENED' : currentStatus;
    case 'clicked':
      return 'CLICKED';
    case 'replied':
      return 'REPLIED';
    default:
      return currentStatus;
  }
}

async function handleEmailReply(activity: any, data: any) {
  try {
    // Create a communication record for the reply
    await db.communication.create({
      data: {
        leadId: activity.leadId,
        userId: activity.userId,
        type: 'EMAIL',
        direction: 'INBOUND',
        subject: data.subject || 'Re: ' + (activity.metadata?.subject || ''),
        content: data.text || data.html || 'Email reply received',
        metadata: {
          messageId: data.messageId,
          inReplyTo: activity.metadata?.messageId,
          activityId: activity.id,
          fromAddress: data.from,
        },
        createdAt: new Date(),
      },
    });

    // Update lead status if it's still in early stages
    const lead = await db.agencyLead.findUnique({
      where: { id: activity.leadId },
    });

    if (lead && ['NEW', 'CONTACTED'].includes(lead.status)) {
      await db.agencyLead.update({
        where: { id: lead.id },
        data: {
          status: 'REPLIED',
          lastContactedAt: new Date(),
        },
      });
    }
  } catch (error) {
    console.error('Error handling email reply:', error);
  }
}

function verifyWebhookSignature(body: string, signature: string | null, provider: string): boolean {
  if (!signature) {
    // For development/testing, allow webhooks without signatures
    return process.env.NODE_ENV === 'development' || process.env.EMAIL_PROVIDER === 'mock';
  }

  try {
    switch (provider) {
      case 'sendgrid': {
        const key = process.env.SENDGRID_WEBHOOK_KEY;
        if (!key) return false;

        const expectedSignature = crypto
          .createHmac('sha256', key)
          .update(body)
          .digest('base64');

        return signature === expectedSignature;
      }

      case 'mailgun': {
        const key = process.env.MAILGUN_WEBHOOK_KEY;
        if (!key) return false;

        const [timestamp, token, providedSignature] = signature.split(',');
        const expectedSignature = crypto
          .createHmac('sha256', key)
          .update(timestamp + token)
          .digest('hex');

        return providedSignature === expectedSignature;
      }

      default:
        // For unknown providers, verify against a generic webhook secret
        const genericSecret = process.env.WEBHOOK_SECRET;
        if (!genericSecret) return false;

        const expectedSignature = crypto
          .createHmac('sha256', genericSecret)
          .update(body)
          .digest('hex');

        return signature.replace('sha256=', '') === expectedSignature;
    }
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}