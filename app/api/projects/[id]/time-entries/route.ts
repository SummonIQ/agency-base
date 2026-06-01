import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const createTimeEntrySchema = z.object({
  hours: z.number().positive('Hours must be greater than 0'),
  date: z.string().datetime(),
  description: z.string().min(1, 'Description is required'),
  taskId: z.string().optional().nullable(),
  billable: z.boolean().default(true),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify project belongs to user
    const project = await db.project.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get time entries for the project
    const timeEntries = await db.timeEntry.findMany({
      where: {
        projectId: params.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Calculate totals
    const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const billableHours = timeEntries
      .filter(entry => entry.billable)
      .reduce((sum, entry) => sum + entry.hours, 0);

    return NextResponse.json({
      entries: timeEntries,
      totalHours,
      billableHours,
      nonBillableHours: totalHours - billableHours,
    });
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify project belongs to user
    const project = await db.project.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = createTimeEntrySchema.parse(body);

    // If taskId is provided, verify task belongs to project
    if (validatedData.taskId) {
      const task = await db.task.findFirst({
        where: {
          id: validatedData.taskId,
          projectId: params.id,
        },
      });

      if (!task) {
        return NextResponse.json(
          { error: 'Invalid task' },
          { status: 400 }
        );
      }

      // Update task's actual hours
      await db.task.update({
        where: {
          id: validatedData.taskId,
        },
        data: {
          actualHours: {
            increment: validatedData.hours,
          },
        },
      });
    }

    // Create the time entry
    const timeEntry = await db.timeEntry.create({
      data: {
        hours: validatedData.hours,
        date: new Date(validatedData.date),
        description: validatedData.description,
        billable: validatedData.billable,
        projectId: params.id,
        taskId: validatedData.taskId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    // Update project's actual hours
    await db.project.update({
      where: {
        id: params.id,
      },
      data: {
        actualHours: {
          increment: validatedData.hours,
        },
      },
    });

    return NextResponse.json(timeEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating time entry:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}