import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { apiKey, fromEmail, fromName } = body;

    if (!apiKey || !fromEmail || !fromName) {
      return NextResponse.json(
        { error: 'API key, from email, and from name are required' },
        { status: 400 }
      );
    }

    // Test SendGrid API connection
    try {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(apiKey);

      // Test by sending a test email to the from address
      const testMessage = {
        to: fromEmail,
        from: {
          email: fromEmail,
          name: fromName,
        },
        subject: 'SendGrid Connection Test',
        text: 'This is a test email to verify your SendGrid configuration.',
        html: '<p>This is a test email to verify your SendGrid configuration.</p>',
      };

      // Validate the message without sending
      const [response] = await sgMail.send(testMessage, false);
      
      return NextResponse.json({
        success: true,
        message: 'SendGrid connection successful',
        details: {
          messageId: response.headers['x-message-id'],
          statusCode: response.statusCode,
        },
      });

    } catch (sgError: any) {
      console.error('SendGrid test error:', sgError);
      
      return NextResponse.json({
        success: false,
        error: 'SendGrid connection failed',
        details: sgError.message || 'Unknown SendGrid error',
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Email test connection error:', error);
    return NextResponse.json(
      { error: 'Connection test failed' },
      { status: 500 }
    );
  }
}
