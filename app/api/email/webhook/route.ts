import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email/email-service';
import { emailSequenceEngine } from '@/lib/email/email-sequences';
import { emailAnalyticsEngine } from '@/lib/email/email-analytics';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const provider = searchParams.get('provider') as 'sendgrid' | 'mailgun';

    if (!provider || !['sendgrid', 'mailgun'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid or missing provider parameter' },
        { status: 400 }
      );
    }

    const payload = await req.json();

    // Verify webhook authenticity (simplified - in production, verify signatures)
    // For SendGrid: verify X-Twilio-Email-Event-Webhook-Signature
    // For Mailgun: verify webhook signature

    // Process webhook events
    const events = await emailService.handleWebhook(provider, payload);

    for (const event of events) {
      // Update sequence engine
      await emailSequenceEngine.handleEmailEvent({
        type: event.type,
        messageId: event.messageId,
        email: event.email,
        customArgs: event.customArgs,
        timestamp: event.timestamp,
        url: event.url
      });

      // Record in analytics
      await emailAnalyticsEngine.recordEvent({
        type: event.type,
        timestamp: event.timestamp,
        messageId: event.messageId,
        campaignId: event.customArgs?.campaign_id,
        sequenceId: event.customArgs?.sequence_id,
        recipientEmail: event.email,
        recipientId: event.customArgs?.recipient_id,
        metadata: {
          url: event.url,
          userAgent: event.userAgent,
          ip: event.ip,
          location: event.location
        }
      });
    }

    return NextResponse.json({
      success: true,
      processed: events.length
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Handle GET for webhook verification (some providers require this)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const provider = searchParams.get('provider');

  if (provider === 'sendgrid') {
    // SendGrid webhook verification
    return NextResponse.json({ message: 'SendGrid webhook verified' });
  }

  if (provider === 'mailgun') {
    // Mailgun webhook verification
    return NextResponse.json({ message: 'Mailgun webhook verified' });
  }

  return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
}