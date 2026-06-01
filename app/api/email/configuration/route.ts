import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has email configuration
    const hasConfiguration = !!(
      process.env.SENDGRID_API_KEY &&
      process.env.SENDGRID_FROM_EMAIL &&
      process.env.SENDGRID_FROM_NAME
    );

    return NextResponse.json({
      configured: hasConfiguration,
      provider: hasConfiguration ? 'sendgrid' : null,
    });

  } catch (error) {
    console.error('Configuration check error:', error);
    return NextResponse.json(
      { error: 'Failed to check configuration' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { provider, apiKey, fromEmail, fromName, webhookUrl } = body;

    if (!provider || !apiKey || !fromEmail || !fromName) {
      return NextResponse.json(
        { error: 'Provider, API key, from email, and from name are required' },
        { status: 400 }
      );
    }

    // In a production environment, you would:
    // 1. Encrypt the API key before storing
    // 2. Store configuration in a secure database
    // 3. Use proper environment variable management

    // For now, we'll return success and instructions for manual setup
    return NextResponse.json({
      success: true,
      message: 'Configuration validated successfully',
      instructions: [
        'Add the following environment variables to your .env file:',
        `SENDGRID_API_KEY=${apiKey}`,
        `SENDGRID_FROM_EMAIL=${fromEmail}`,
        `SENDGRID_FROM_NAME="${fromName}"`,
        `EMAIL_WEBHOOK_URL=${webhookUrl}`,
        '',
        'Restart your application for changes to take effect.'
      ]
    });

  } catch (error) {
    console.error('Configuration save error:', error);
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    );
  }
}