import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateTimeEntrySchema = z.object({
  hours: z.number().positive().optional(),
  date: z.string().datetime().optional(),
  description: z.string().min(1).optional(),
  taskId: z.string().nullable().optional(),
  billable: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; entryId: string } }
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

    // Get the time entry
    const timeEntry = await db.timeEntry.findFirst({
      where: {
        id: params.entryId,
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
    });

    if (!timeEntry) {
      return NextResponse.json(
        { error: 'Time entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(timeEntry);
  } catch (error) {
    console.error('Error fetching time entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; entryId: string } }
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

    // Verify time entry exists and belongs to user
    const existingEntry = await db.timeEntry.findFirst({
      where: {
        id: params.entryId,
        projectId: params.id,
        userId: session.user.id,
      },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Time entry not found or unauthorized' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateTimeEntrySchema.parse(body);

    // Handle task change if taskId is updated
    if (validatedData.taskId !== undefined) {
      // If removing task association
      if (validatedData.taskId === null) {
        if (existingEntry.taskId) {
          // Decrease actual hours from old task
          await db.task.update({
            where: { id: existingEntry.taskId },
            data: {
              actualHours: {
                decrement: existingEntry.hours,
              },
            },
          });
        }
      } else {
        // Verify new task belongs to project
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

        // Update actual hours for tasks
        if (existingEntry.taskId && existingEntry.taskId !== validatedData.taskId) {
          // Decrease from old task
          await db.task.update({
            where: { id: existingEntry.taskId },
            data: {
              actualHours: {
                decrement: existingEntry.hours,
              },
            },
          });
          // Increase to new task
          await db.task.update({
            where: { id: validatedData.taskId },
            data: {
              actualHours: {
                increment: validatedData.hours || existingEntry.hours,
              },
            },
          });
        } else if (!existingEntry.taskId) {
          // Just adding task association
          await db.task.update({
            where: { id: validatedData.taskId },
            data: {
              actualHours: {
                increment: validatedData.hours || existingEntry.hours,
              },
            },
          });
        }
      }
    }

    // Handle hours change
    if (validatedData.hours !== undefined && validatedData.hours !== existingEntry.hours) {
      const hoursDiff = validatedData.hours - existingEntry.hours;

      // Update project actual hours
      await db.project.update({
        where: { id: params.id },
        data: {
          actualHours: {
            increment: hoursDiff,
          },
        },
      });

      // Update task actual hours if associated
      if (existingEntry.taskId) {
        await db.task.update({
          where: { id: existingEntry.taskId },
          data: {
            actualHours: {
              increment: hoursDiff,
            },
          },
        });
      }
    }

    // Update the time entry
    const timeEntry = await db.timeEntry.update({
      where: {
        id: params.entryId,
      },
      data: {
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : undefined,
        updatedAt: new Date(),
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

    return NextResponse.json(timeEntry);
  } catch (error) {
    console.error('Error updating time entry:', error);

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; entryId: string } }
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

    // Verify time entry exists and belongs to user
    const existingEntry = await db.timeEntry.findFirst({
      where: {
        id: params.entryId,
        projectId: params.id,
        userId: session.user.id,
      },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Time entry not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update project actual hours
    await db.project.update({
      where: { id: params.id },
      data: {
        actualHours: {
          decrement: existingEntry.hours,
        },
      },
    });

    // Update task actual hours if associated
    if (existingEntry.taskId) {
      await db.task.update({
        where: { id: existingEntry.taskId },
        data: {
          actualHours: {
            decrement: existingEntry.hours,
          },
        },
      });
    }

    // Delete the time entry
    await db.timeEntry.delete({
      where: {
        id: params.entryId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting time entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}