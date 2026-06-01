import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { linkedInService } from '@/lib/linkedin/linkedin-service';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, data } = body;

    switch (action) {
      case 'send_connection_request': {
        const { profileId, message } = data;

        if (!profileId) {
          return NextResponse.json(
            { error: 'Profile ID is required' },
            { status: 400 }
          );
        }

        const result = await linkedInService.sendConnectionRequest(profileId, message);

        return NextResponse.json({
          success: result.success,
          connectionId: result.connectionId,
          error: result.error
        });
      }

      case 'send_message': {
        const { profileId, content } = data;

        if (!profileId || !content) {
          return NextResponse.json(
            { error: 'Profile ID and message content are required' },
            { status: 400 }
          );
        }

        const result = await linkedInService.sendMessage(profileId, content);

        return NextResponse.json({
          success: result.success,
          messageId: result.messageId,
          error: result.error
        });
      }

      case 'get_automation_stats': {
        const stats = await linkedInService.getAutomationStats();

        return NextResponse.json({
          success: true,
          stats
        });
      }

      case 'validate_configuration': {
        const validation = await linkedInService.validateConfiguration();

        return NextResponse.json({
          success: true,
          isValid: validation.isValid,
          error: validation.error
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('LinkedIn automation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get automation statistics
    const stats = await linkedInService.getAutomationStats();

    return NextResponse.json({
      success: true,
      stats,
      limits: {
        daily_connections: 50,
        weekly_messages: 200,
        monthly_profile_views: 1000,
      },
      safety: {
        connection_delay_min: 30, // seconds
        connection_delay_max: 120, // seconds
        message_delay_min: 60, // seconds
        message_delay_max: 300, // seconds
        daily_activity_limit: 100,
      },
    });

  } catch (error) {
    console.error('LinkedIn automation stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
