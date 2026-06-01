import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const createCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  type: z.enum(['newsletter', 'promotional', 'transactional', 'automation']),
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Content is required'),
  recipientListIds: z.array(z.string()).optional(),
  scheduledDate: z.string().datetime().optional(),
  status: z.enum(['draft', 'scheduled', 'active', 'paused', 'completed']).default('draft'),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const campaigns = await db.emailCampaign.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            recipients: true,
            opens: true,
            clicks: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate metrics
    const campaignsWithMetrics = campaigns.map(campaign => {
      const openRate = campaign._count.recipients > 0
        ? (campaign._count.opens / campaign._count.recipients) * 100
        : 0;
      const clickRate = campaign._count.opens > 0
        ? (campaign._count.clicks / campaign._count.opens) * 100
        : 0;

      return {
        ...campaign,
        metrics: {
          sent: campaign._count.recipients,
          opened: campaign._count.opens,
          clicked: campaign._count.clicks,
          openRate: Math.round(openRate),
          clickRate: Math.round(clickRate),
        },
      };
    });

    return NextResponse.json(campaignsWithMetrics);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createCampaignSchema.parse(body);

    const campaign = await db.emailCampaign.create({
      data: {
        name: validatedData.name,
        type: validatedData.type,
        subject: validatedData.subject,
        content: validatedData.content,
        scheduledDate: validatedData.scheduledDate
          ? new Date(validatedData.scheduledDate)
          : null,
        status: validatedData.status,
        userId: session.user.id,
      },
    });

    // If recipient lists are provided, create associations
    if (validatedData.recipientListIds && validatedData.recipientListIds.length > 0) {
      await db.campaignRecipient.createMany({
        data: validatedData.recipientListIds.map(listId => ({
          campaignId: campaign.id,
          recipientListId: listId,
        })),
      });
    }

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}