import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const createRevenueRecordSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('USD'),
  type: z.enum(['CONSULTING', 'RETAINER', 'PROJECT', 'SUBSCRIPTION', 'COMMISSION', 'BONUS', 'OTHER']),
  status: z.enum(['PENDING', 'RECEIVED', 'OVERDUE', 'CANCELLED']).default('PENDING'),
  description: z.string().optional(),
  category: z.string().optional(),
  source: z.string().optional(),
  recurringPeriod: z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']).optional(),
  periodStart: z.string().transform((str) => new Date(str)),
  periodEnd: z.string().transform((str) => new Date(str)),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
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
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');
    const projectId = searchParams.get('projectId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {
      userId: session.user.id,
    };

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (startDate || endDate) {
      where.periodStart = {};
      if (startDate) {
        where.periodStart.gte = new Date(startDate);
      }
      if (endDate) {
        where.periodStart.lte = new Date(endDate);
      }
    }

    const revenueRecords = await db.revenueRecord.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        periodStart: 'desc',
      },
    });

    // Calculate summary metrics
    const totalRevenue = revenueRecords
      .filter(record => record.status === 'RECEIVED')
      .reduce((sum, record) => sum + record.amount, 0);

    const pendingRevenue = revenueRecords
      .filter(record => record.status === 'PENDING')
      .reduce((sum, record) => sum + record.amount, 0);

    const overdueRevenue = revenueRecords
      .filter(record => record.status === 'OVERDUE')
      .reduce((sum, record) => sum + record.amount, 0);

    // Group by month for chart data
    const monthlyRevenue = revenueRecords
      .filter(record => record.status === 'RECEIVED')
      .reduce((acc, record) => {
        const monthKey = record.periodStart.toISOString().slice(0, 7); // YYYY-MM
        acc[monthKey] = (acc[monthKey] || 0) + record.amount;
        return acc;
      }, {} as Record<string, number>);

    return NextResponse.json({
      records: revenueRecords,
      summary: {
        totalRevenue,
        pendingRevenue,
        overdueRevenue,
        recordCount: revenueRecords.length,
      },
      monthlyRevenue,
    });
  } catch (error) {
    console.error('Error fetching revenue records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue records' },
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
    const validatedData = createRevenueRecordSchema.parse(body);

    // Validate client exists if provided
    if (validatedData.clientId) {
      const client = await db.client.findFirst({
        where: {
          id: validatedData.clientId,
          userId: session.user.id,
        },
      });

      if (!client) {
        return NextResponse.json(
          { error: 'Client not found' },
          { status: 400 }
        );
      }
    }

    // Validate project exists if provided
    if (validatedData.projectId) {
      const project = await db.project.findFirst({
        where: {
          id: validatedData.projectId,
          userId: session.user.id,
        },
      });

      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 400 }
        );
      }
    }

    const revenueRecord = await db.revenueRecord.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(revenueRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating revenue record:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create revenue record' },
      { status: 500 }
    );
  }
}