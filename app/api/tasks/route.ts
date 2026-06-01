import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.string().default('Operations'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'CANCELLED']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  dueDate: z.string().datetime().optional(),
  estimatedHours: z.number().positive().optional(),
  actualHours: z.number().min(0).default(0),
  source: z.string().optional(),
  sourceId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  progressPercentage: z.number().min(0).max(100).default(0),
  notes: z.string().optional(),
  parentTaskId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all action tasks for the user, including sub-tasks (limited depth)
    const tasks = await db.actionTask.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        subTasks: true,
      },
      orderBy: [
        { priority: 'asc' }, // URGENT first
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);

    // Create the action task
    const task = await db.actionTask.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        status: validatedData.status || 'TODO',
        priority: validatedData.priority || 'MEDIUM',
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        estimatedHours: validatedData.estimatedHours,
        actualHours: validatedData.actualHours || 0,
        source: validatedData.source,
        sourceId: validatedData.sourceId,
        tags: validatedData.tags || [],
        progressPercentage: validatedData.progressPercentage || 0,
        notes: validatedData.notes,
        parentTaskId: validatedData.parentTaskId,
        userId: session.user.id,
      },
      include: {
        subTasks: true,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}