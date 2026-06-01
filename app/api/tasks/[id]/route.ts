import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  category: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  estimatedHours: z.number().positive().nullable().optional(),
  actualHours: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  progressPercentage: z.number().min(0).max(100).optional(),
  notes: z.string().nullable().optional(),
  assignedToId: z.string().nullable().optional(),
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

    // Get the task
    const task = await db.actionTask.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    // Verify task exists and belongs to user
    const existingTask = await db.actionTask.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateTaskSchema.parse(body);

    // If assignedToId is provided, verify team member exists
    if (validatedData.assignedToId !== undefined && validatedData.assignedToId !== null) {
      const teamMember = await db.teamMember.findFirst({
        where: {
          id: validatedData.assignedToId,
          userId: session.user.id,
        },
      });

      if (!teamMember) {
        return NextResponse.json(
          { error: 'Invalid team member' },
          { status: 400 }
        );
      }
    }

    // Handle status change to COMPLETED
    const updateData: any = {
      ...validatedData,
      dueDate: validatedData.dueDate !== undefined
        ? (validatedData.dueDate ? new Date(validatedData.dueDate) : null)
        : undefined,
      updatedAt: new Date(),
    };

    // Set completedAt when marking as completed
    if (validatedData.status === 'COMPLETED' && existingTask.status !== 'COMPLETED') {
      updateData.completedAt = new Date();
      updateData.progressPercentage = 100;
    } else if (validatedData.status && validatedData.status !== 'COMPLETED') {
      updateData.completedAt = null;
    }

    // Update the task
    const task = await db.actionTask.update({
      where: {
        id: params.id,
      },
      data: updateData,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);

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

    // Verify task exists and belongs to user
    const existingTask = await db.actionTask.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Delete the task
    await db.actionTask.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}