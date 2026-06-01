import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const createRevenueForecastSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  confidence: z.number().min(0).max(100).default(50),
  currency: z.string().default('USD'),
  type: z.enum(['CONSULTING', 'RETAINER', 'PROJECT', 'SUBSCRIPTION', 'COMMISSION', 'BONUS', 'OTHER']),
  description: z.string().optional(),
  source: z.string().optional(),
  expectedDate: z.string().transform((str) => new Date(str)),
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
    const clientId = searchParams.get('clientId');
    const projectId = searchParams.get('projectId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const minConfidence = searchParams.get('minConfidence');

    const where: any = {
      userId: session.user.id,
    };

    if (type) {
      where.type = type;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (startDate || endDate) {
      where.expectedDate = {};
      if (startDate) {
        where.expectedDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.expectedDate.lte = new Date(endDate);
      }
    }

    if (minConfidence) {
      where.confidence = {
        gte: parseInt(minConfidence),
      };
    }

    const forecasts = await db.revenueForecast.findMany({
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
        expectedDate: 'desc',
      },
    });

    // Calculate summary metrics
    const totalForecast = forecasts.reduce((sum, forecast) => sum + forecast.amount, 0);

    const weightedForecast = forecasts.reduce((sum, forecast) => {
      return sum + (forecast.amount * (forecast.confidence / 100));
    }, 0);

    const highConfidenceForecast = forecasts
      .filter(forecast => forecast.confidence >= 80)
      .reduce((sum, forecast) => sum + forecast.amount, 0);

    // Group by month for chart data
    const monthlyForecast = forecasts.reduce((acc, forecast) => {
      const monthKey = forecast.expectedDate.toISOString().slice(0, 7); // YYYY-MM
      if (!acc[monthKey]) {
        acc[monthKey] = {
          total: 0,
          weighted: 0,
          count: 0,
        };
      }
      acc[monthKey].total += forecast.amount;
      acc[monthKey].weighted += forecast.amount * (forecast.confidence / 100);
      acc[monthKey].count += 1;
      return acc;
    }, {} as Record<string, { total: number; weighted: number; count: number }>);

    // Calculate confidence distribution
    const confidenceDistribution = forecasts.reduce((acc, forecast) => {
      const bucket = Math.floor(forecast.confidence / 10) * 10; // Group by 10s
      const key = `${bucket}-${bucket + 9}%`;
      acc[key] = (acc[key] || 0) + forecast.amount;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      forecasts,
      summary: {
        totalForecast,
        weightedForecast,
        highConfidenceForecast,
        forecastCount: forecasts.length,
        averageConfidence: forecasts.length > 0
          ? forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length
          : 0,
      },
      monthlyForecast,
      confidenceDistribution,
    });
  } catch (error) {
    console.error('Error fetching revenue forecasts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue forecasts' },
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
    const validatedData = createRevenueForecastSchema.parse(body);

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

    // Generate monthYear for grouping
    const monthYear = validatedData.expectedDate.toISOString().slice(0, 7);

    const forecast = await db.revenueForecast.create({
      data: {
        ...validatedData,
        monthYear,
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

    return NextResponse.json(forecast, { status: 201 });
  } catch (error) {
    console.error('Error creating revenue forecast:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create revenue forecast' },
      { status: 500 }
    );
  }
}