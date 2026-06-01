import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { LinkedInService } from '@/lib/lead-generation/linkedin-service';

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

    const linkedInService = LinkedInService.getInstance();

    switch (action) {
      case 'search_profiles': {
        const { keywords, company, title, location, industry, connectionDegree, limit } = data;

        const profiles = await linkedInService.searchProfiles({
          keywords,
          company,
          title,
          location,
          industry,
          connectionDegree,
          limit
        });

        return NextResponse.json({
          success: true,
          data: {
            profiles,
            total: profiles.length
          }
        });
      }

      case 'send_connection_request': {
        const { profileId, message, note } = data;

        if (!profileId) {
          return NextResponse.json(
            { error: 'Profile ID is required' },
            { status: 400 }
          );
        }

        const result = await linkedInService.sendConnectionRequest(session.user.id, {
          profileId,
          message,
          note
        });

        return NextResponse.json(result);
      }

      case 'send_message': {
        const { conversationId, content, subject } = data;

        if (!conversationId || !content) {
          return NextResponse.json(
            { error: 'Conversation ID and content are required' },
            { status: 400 }
          );
        }

        const result = await linkedInService.sendMessage(session.user.id, {
          conversationId,
          content,
          subject
        });

        return NextResponse.json(result);
      }

      case 'get_profile': {
        const { publicIdentifier } = data;

        if (!publicIdentifier) {
          return NextResponse.json(
            { error: 'Public identifier is required' },
            { status: 400 }
          );
        }

        const profile = await linkedInService.getProfile(publicIdentifier);

        return NextResponse.json({
          success: true,
          data: profile
        });
      }

      case 'create_campaign': {
        const { name, profiles, sequence, schedule } = data;

        if (!name || !profiles || !Array.isArray(profiles) || profiles.length === 0) {
          return NextResponse.json(
            { error: 'Campaign name and profiles array are required' },
            { status: 400 }
          );
        }

        if (!sequence || !Array.isArray(sequence) || sequence.length === 0) {
          return NextResponse.json(
            { error: 'Campaign sequence is required' },
            { status: 400 }
          );
        }

        const result = await linkedInService.createLinkedInCampaign(session.user.id, {
          name,
          profiles,
          sequence,
          schedule
        });

        return NextResponse.json(result);
      }

      case 'get_metrics': {
        const { from, to } = data;

        let timeRange;
        if (from && to) {
          timeRange = {
            from: new Date(from),
            to: new Date(to)
          };
        }

        const metrics = await linkedInService.getMetrics(session.user.id, timeRange);

        return NextResponse.json({
          success: true,
          data: metrics
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('LinkedIn API error:', error);
    return NextResponse.json(
      { error: 'Failed to process LinkedIn request' },
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

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    const linkedInService = LinkedInService.getInstance();

    switch (action) {
      case 'metrics': {
        const from = searchParams.get('from');
        const to = searchParams.get('to');

        let timeRange;
        if (from && to) {
          timeRange = {
            from: new Date(from),
            to: new Date(to)
          };
        }

        const metrics = await linkedInService.getMetrics(session.user.id, timeRange);

        return NextResponse.json({
          success: true,
          data: metrics
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid or missing action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('LinkedIn API error:', error);
    return NextResponse.json(
      { error: 'Failed to process LinkedIn request' },
      { status: 500 }
    );
  }
}