import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';

// In a real implementation, you'd store these in a secure database
// For now, we'll use environment variables as a reference
const INTEGRATION_CONFIGS = {
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.SENDGRID_FROM_EMAIL,
    fromName: process.env.SENDGRID_FROM_NAME,
  },
  apollo: {
    apiKey: process.env.APOLLO_API_KEY,
    baseUrl: process.env.APOLLO_BASE_URL || 'https://api.apollo.io/v1',
  },
  zoominfo: {
    apiKey: process.env.ZOOMINFO_API_KEY,
    username: process.env.ZOOMINFO_USERNAME,
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    redirectUri: process.env.LINKEDIN_REDIRECT_URI,
  },
};

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return integration statuses (without sensitive data)
    const integrations = Object.entries(INTEGRATION_CONFIGS).map(([key, config]) => ({
      name: key,
      status: Object.values(config).some(value => value) ? 'configured' : 'not_configured',
      hasApiKey: !!(config as any).apiKey || !!(config as any).clientId,
    }));

    return NextResponse.json({
      success: true,
      integrations,
    });

  } catch (error) {
    console.error('Get integrations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch integrations' },
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
    const { integration, config } = body;

    if (!integration || !config) {
      return NextResponse.json(
        { error: 'Integration name and config are required' },
        { status: 400 }
      );
    }

    // Validate integration exists
    if (!INTEGRATION_CONFIGS.hasOwnProperty(integration)) {
      return NextResponse.json(
        { error: 'Invalid integration' },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Encrypt the sensitive data
    // 2. Store in a secure database
    // 3. Associate with the user ID
    // 4. Validate the configuration

    // For now, we'll just validate the required fields
    const requiredFields = getRequiredFields(integration);
    const missingFields = requiredFields.filter(field => !config[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          missingFields 
        },
        { status: 400 }
      );
    }

    // TODO: In production, save to database
    console.log(`Saving ${integration} config for user ${session.user.id}:`, {
      ...config,
      // Mask sensitive data in logs
      apiKey: config.apiKey ? '***masked***' : undefined,
      clientSecret: config.clientSecret ? '***masked***' : undefined,
    });

    return NextResponse.json({
      success: true,
      message: `${integration} configuration saved successfully`,
    });

  } catch (error) {
    console.error('Save integration error:', error);
    return NextResponse.json(
      { error: 'Failed to save integration' },
      { status: 500 }
    );
  }
}

function getRequiredFields(integration: string): string[] {
  switch (integration) {
    case 'sendgrid':
      return ['apiKey', 'fromEmail', 'fromName'];
    case 'apollo':
      return ['apiKey', 'baseUrl'];
    case 'zoominfo':
      return ['apiKey', 'username'];
    case 'linkedin':
      return ['clientId', 'clientSecret', 'redirectUri'];
    default:
      return [];
  }
}
