import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const createSubscriberSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  status: z.enum(['active', 'unsubscribed', 'bounced']).default('active'),
  customFields: z.record(z.any()).optional(),
  listIds: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const listId = searchParams.get('listId');
    const search = searchParams.get('search');

    const where: any = {
      userId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (listId) {
      where.lists = {
        some: {
          id: listId,
        },
      };
    }

    const subscribers = await db.emailSubscriber.findMany({
      where,
      include: {
        lists: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            opens: true,
            clicks: true,
          },
        },
      },
      orderBy: {
        subscribedAt: 'desc',
      },
    });

    // Add engagement metrics
    const subscribersWithMetrics = subscribers.map(subscriber => ({
      ...subscriber,
      metrics: {
        totalOpens: subscriber._count.opens,
        totalClicks: subscriber._count.clicks,
        engagementScore: subscriber._count.opens + (subscriber._count.clicks * 2),
      },
    }));

    return NextResponse.json(subscribersWithMetrics);
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
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
    const validatedData = createSubscriberSchema.parse(body);

    // Check if subscriber already exists
    const existingSubscriber = await db.emailSubscriber.findFirst({
      where: {
        email: validatedData.email,
        userId: session.user.id,
      },
    });

    if (existingSubscriber) {
      return NextResponse.json(
        { error: 'Subscriber with this email already exists' },
        { status: 400 }
      );
    }

    // Create subscriber
    const subscriber = await db.emailSubscriber.create({
      data: {
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        status: validatedData.status,
        customFields: validatedData.customFields || {},
        userId: session.user.id,
      },
    });

    // Add to lists if specified
    if (validatedData.listIds && validatedData.listIds.length > 0) {
      // Connect to lists
      await db.emailSubscriber.update({
        where: { id: subscriber.id },
        data: {
          lists: {
            connect: validatedData.listIds.map(id => ({ id })),
          },
        },
      });
    }

    return NextResponse.json(subscriber, { status: 201 });
  } catch (error) {
    console.error('Error creating subscriber:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create subscriber' },
      { status: 500 }
    );
  }
}