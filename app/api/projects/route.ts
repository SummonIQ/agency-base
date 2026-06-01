import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).default('DRAFT'),
  serviceType: z.enum(['WEB_DEVELOPMENT', 'MOBILE_APP', 'DESIGN', 'CONSULTING', 'MARKETING', 'MAINTENANCE', 'OTHER']),
  startDate: z.string().transform((str) => str ? new Date(str) : undefined).optional(),
  endDate: z.string().transform((str) => str ? new Date(str) : undefined).optional(),
  budgetAmount: z.number().positive().optional(),
  profitMargin: z.number().min(0).max(100).optional(),
  hourlyRate: z.number().positive().optional(),
  fixedPrice: z.number().positive().optional(),
  totalHoursEstimated: z.number().positive().optional(),
  clientId: z.string().min(1, 'Client is required'),
  contractId: z.string().optional(),
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
    const clientId = searchParams.get('clientId');
    const serviceType = searchParams.get('serviceType');
    const search = searchParams.get('search');

    const where: any = {
      userId: session.user.id,
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (serviceType) {
      where.serviceType = serviceType;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const projects = await db.project.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            timeEntries: true,
            deliverables: true,
            milestones: true,
          },
        },
        timeEntries: {
          select: {
            hours: true,
            billableAmount: true,
          },
        },
        revenueRecords: {
          where: {
            status: 'RECEIVED',
          },
          select: {
            amount: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // Active projects first
        { startDate: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Calculate additional metrics for each project
    const projectsWithMetrics = projects.map(project => {
      const totalRevenue = project.revenueRecords.reduce((sum, r) => sum + r.amount, 0);
      const totalHours = project.timeEntries.reduce((sum, t) => sum + (t.hours || 0), 0);
      const totalBilled = project.timeEntries.reduce((sum, t) => sum + (t.billableAmount || 0), 0);

      return {
        ...project,
        metrics: {
          totalRevenue,
          totalHours,
          totalBilled,
          tasksCount: project._count.tasks,
          deliverablesCount: project._count.deliverables,
          milestonesCount: project._count.milestones,
          profitability: project.budgetAmount ? totalRevenue - (project.budgetAmount || 0) : 0,
          completionPercentage: project.completionPercentage || 0,
        },
      };
    });

    return NextResponse.json(projectsWithMetrics);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
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
    const validatedData = createProjectSchema.parse(body);

    // Verify client exists and belongs to user
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

    // Check if project with same name exists for this client
    const existingProject = await db.project.findFirst({
      where: {
        name: validatedData.name,
        clientId: validatedData.clientId,
        userId: session.user.id,
      },
    });

    if (existingProject) {
      return NextResponse.json(
        { error: 'Project with this name already exists for this client' },
        { status: 400 }
      );
    }

    const project = await db.project.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            timeEntries: true,
            deliverables: true,
            milestones: true,
          },
        },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}