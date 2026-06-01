import { NextRequest, NextResponse } from 'next/server';
import { emailTrackingService } from '@/lib/email/email-tracking';
import { emailSequenceEngine } from '@/lib/email/email-sequences';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const messageId = searchParams.get('messageId');
    const sequenceId = searchParams.get('sequenceId');
    const token = searchParams.get('token');

    if (!email || !token) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Verify unsubscribe token (simple implementation)
    const expectedToken = Buffer.from(`${email}:${process.env.BETTER_AUTH_SECRET}`).toString('base64');
    if (token !== expectedToken) {
      return NextResponse.json({ error: 'Invalid unsubscribe token' }, { status: 400 });
    }

    // Record unsubscribe event
    if (messageId) {
      await emailTrackingService.recordUnsubscribe(messageId, email, 'user_request');
    }

    // Remove from sequence if specified
    if (sequenceId) {
      await emailSequenceEngine.removeRecipientFromSequence(sequenceId, email);
    }

    // Simple unsubscribe confirmation page
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Unsubscribed</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 50px auto;
              padding: 20px;
              text-align: center;
            }
            .success {
              color: #22c55e;
              font-size: 18px;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <h1>Successfully Unsubscribed</h1>
          <div class="success">
            ✓ You have been unsubscribed from future emails.
          </div>
          <p>
            The email address <strong>${email}</strong> has been removed from our mailing list.
            You will no longer receive emails from us.
          </p>
          <p>
            If you unsubscribed by mistake, please contact our support team.
          </p>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html'
      }
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json({ error: 'Unsubscribe failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, reason, messageId, sequenceId } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Record unsubscribe event
    if (messageId) {
      await emailTrackingService.recordUnsubscribe(messageId, email, reason || 'api_request');
    }

    // Remove from sequence if specified
    if (sequenceId) {
      await emailSequenceEngine.removeRecipientFromSequence(sequenceId, email);
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed'
    });

  } catch (error) {
    console.error('Unsubscribe API error:', error);
    return NextResponse.json({ error: 'Unsubscribe failed' }, { status: 500 });
  }
}