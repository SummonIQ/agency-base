import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const createCandidateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  location: z.string().optional(),
  currentRole: z.string().optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
  skills: z.array(z.string()).default([]),
  status: z.enum(['new', 'active', 'interviewing', 'offered', 'hired', 'rejected']).default('new'),
  rating: z.number().min(1).max(5).optional(),
  resumeUrl: z.string().url().optional(),
  linkedInUrl: z.string().url().optional(),
  portfolioUrl: z.string().url().optional(),
  customFields: z.record(z.any()).optional(),
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
    const skills = searchParams.get('skills')?.split(',').filter(Boolean);

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
        { currentRole: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (skills && skills.length > 0) {
      where.skills = {
        hasEvery: skills,
      };
    }

    const candidates = await db.candidate.findMany({
      where,
      include: {
        _count: {
          select: {
            applications: true,
            interviews: true,
            notes: true,
          },
        },
        applications: {
          select: {
            id: true,
            position: true,
            company: true,
            status: true,
          },
          orderBy: {
            appliedDate: 'desc',
          },
          take: 3,
        },
      },
      orderBy: [
        { rating: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candidates' },
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
    const validatedData = createCandidateSchema.parse(body);

    // Check if candidate with same email exists
    const existingCandidate = await db.candidate.findFirst({
      where: {
        email: validatedData.email,
        userId: session.user.id,
      },
    });

    if (existingCandidate) {
      return NextResponse.json(
        { error: 'Candidate with this email already exists' },
        { status: 400 }
      );
    }

    const candidate = await db.candidate.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            applications: true,
            interviews: true,
            notes: true,
          },
        },
      },
    });

    return NextResponse.json(candidate, { status: 201 });
  } catch (error) {
    console.error('Error creating candidate:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create candidate' },
      { status: 500 }
    );
  }
}