import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const createClientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  industry: z.string().optional(),
  companySize: z.enum(['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE']).optional(),
  status: z.enum(['PROSPECT', 'ACTIVE', 'INACTIVE', 'CHURNED']).default('PROSPECT'),
  source: z.enum(['DIRECT', 'REFERRAL', 'WEBSITE', 'SOCIAL_MEDIA', 'ADVERTISING', 'PARTNERSHIP', 'EVENT', 'OTHER']).optional(),
  notes: z.string().optional(),
  primaryContactName: z.string().optional(),
  primaryContactEmail: z.string().email('Invalid contact email').optional().or(z.literal('')),
  primaryContactPhone: z.string().optional(),
  primaryContactRole: z.string().optional(),
  annualRevenue: z.number().positive().optional(),
  employeeCount: z.number().int().positive().optional(),
  founded: z.string().transform((str) => str ? new Date(str) : undefined).optional(),
  description: z.string().optional(),
  firstContactDate: z.string().transform((str) => str ? new Date(str) : undefined).optional(),
  nextFollowUpDate: z.string().transform((str) => str ? new Date(str) : undefined).optional(),
  creditLimit: z.number().positive().optional(),
  paymentTermsDays: z.number().int().positive().default(30),
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
    const search = searchParams.get('search');
    const industry = searchParams.get('industry');

    const where: any = {
      userId: session.user.id,
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { primaryContactName: { contains: search, mode: 'insensitive' } },
        { primaryContactEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (industry) {
      where.industry = { contains: industry, mode: 'insensitive' };
    }

    const clients = await db.client.findMany({
      where,
      include: {
        _count: {
          select: {
            projects: true,
            revenueRecords: true,
            communications: true,
          },
        },
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
            budgetAmount: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 3,
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
        { status: 'asc' }, // Active clients first
        { lastContactDate: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Calculate additional metrics for each client
    const clientsWithMetrics = clients.map(client => ({
      ...client,
      metrics: {
        totalRevenue: client.revenueRecords.reduce((sum, r) => sum + r.amount, 0),
        projectCount: client._count.projects,
        communicationCount: client._count.communications,
        lastActivity: client.lastContactDate,
      },
    }));

    return NextResponse.json(clientsWithMetrics);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
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
    const validatedData = createClientSchema.parse(body);

    // Check if client with same email exists
    if (validatedData.email) {
      const existingClient = await db.client.findFirst({
        where: {
          email: validatedData.email,
          userId: session.user.id,
        },
      });

      if (existingClient) {
        return NextResponse.json(
          { error: 'Client with this email already exists' },
          { status: 400 }
        );
      }
    }

    const client = await db.client.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        firstContactDate: validatedData.firstContactDate || new Date(),
        lastContactDate: new Date(),
      },
      include: {
        _count: {
          select: {
            projects: true,
            revenueRecords: true,
            communications: true,
          },
        },
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}