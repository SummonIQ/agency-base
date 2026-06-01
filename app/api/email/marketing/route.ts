import { NextRequest, NextResponse } from 'next/server';
import { emailMarketingService } from '@/lib/email/email-marketing-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = 'user_test_id'; // TODO: Get from session

    switch (action) {
      case 'campaigns':
        const campaignFilters = {
          status: searchParams.get('status') || undefined,
          type: searchParams.get('type') || undefined,
          limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
          offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
        };
        const campaigns = await emailMarketingService.getCampaigns(userId, campaignFilters);
        return NextResponse.json({ success: true, campaigns });

      case 'subscribers':
        const subscriberFilters = {
          status: searchParams.get('status') || undefined,
          listId: searchParams.get('listId') || undefined,
          search: searchParams.get('search') || undefined,
          limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
          offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
        };
        const subscribers = await emailMarketingService.getSubscribers(userId, subscriberFilters);
        return NextResponse.json({ success: true, subscribers });

      case 'lists':
        const lists = await emailMarketingService.getLists(userId);
        return NextResponse.json({ success: true, lists });

      case 'overview':
        const overview = await emailMarketingService.getOverviewStats(userId);
        return NextResponse.json({ success: true, overview });

      case 'campaign_stats':
        const campaignId = searchParams.get('campaignId');
        if (!campaignId) {
          return NextResponse.json({ success: false, error: 'Campaign ID required' }, { status: 400 });
        }
        const stats = await emailMarketingService.getCampaignStats(campaignId, userId);
        return NextResponse.json({ success: true, stats });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Email marketing API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;
    const userId = 'user_test_id'; // TODO: Get from session

    switch (action) {
      case 'create_campaign':
        const campaign = await emailMarketingService.createCampaign({
          ...data,
          userId,
        });
        return NextResponse.json({ success: true, campaign });

      case 'update_campaign':
        const { campaignId, ...updateData } = data;
        const updatedCampaign = await emailMarketingService.updateCampaign(campaignId, userId, updateData);
        return NextResponse.json({ success: true, campaign: updatedCampaign });

      case 'delete_campaign':
        await emailMarketingService.deleteCampaign(data.campaignId, userId);
        return NextResponse.json({ success: true });

      case 'create_subscriber':
        const subscriber = await emailMarketingService.createSubscriber({
          ...data,
          userId,
        });
        return NextResponse.json({ success: true, subscriber });

      case 'update_subscriber':
        const { subscriberId, ...subscriberUpdateData } = data;
        const updatedSubscriber = await emailMarketingService.updateSubscriber(subscriberId, userId, subscriberUpdateData);
        return NextResponse.json({ success: true, subscriber: updatedSubscriber });

      case 'unsubscribe':
        await emailMarketingService.unsubscribeSubscriber(data.email, userId);
        return NextResponse.json({ success: true });

      case 'create_list':
        const list = await emailMarketingService.createList({
          ...data,
          userId,
        });
        return NextResponse.json({ success: true, list });

      case 'add_subscribers_to_list':
        await emailMarketingService.addSubscribersToList(data.listId, data.subscriberIds, userId);
        return NextResponse.json({ success: true });

      case 'add_recipients_to_campaign':
        await emailMarketingService.addRecipientsToCompaign(data.campaignId, data);
        return NextResponse.json({ success: true });

      case 'import_subscribers':
        const importResult = await emailMarketingService.importSubscribers(
          userId,
          data.subscribers,
          data.listId
        );
        return NextResponse.json({ success: true, result: importResult });

      case 'track_open':
        await emailMarketingService.trackOpen(data.campaignId, data.email, data.metadata);
        return NextResponse.json({ success: true });

      case 'track_click':
        await emailMarketingService.trackClick(data.campaignId, data.email, data.url, data.metadata);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Email marketing API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
