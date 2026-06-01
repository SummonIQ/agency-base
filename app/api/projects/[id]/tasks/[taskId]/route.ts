import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  estimatedHours: z.number().positive().nullable().optional(),
  actualHours: z.number().min(0).nullable().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; taskId: string } }
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

    // Get the task
    const task = await db.task.findFirst({
      where: {
        id: params.taskId,
        projectId: params.id,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        timeEntries: {
          include: {
            user: true,
          },
          orderBy: {
            date: 'desc',
          },
        },
        comments: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        attachments: true,
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
  { params }: { params: { id: string; taskId: string } }
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

    // Verify task exists
    const existingTask = await db.task.findFirst({
      where: {
        id: params.taskId,
        projectId: params.id,
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

    // If assigneeId is provided, verify they are a team member
    if (validatedData.assigneeId !== undefined && validatedData.assigneeId !== null) {
      const teamMember = await db.teamMember.findFirst({
        where: {
          id: validatedData.assigneeId,
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

    // Update the task
    const task = await db.task.update({
      where: {
        id: params.taskId,
      },
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate !== undefined
          ? (validatedData.dueDate ? new Date(validatedData.dueDate) : null)
          : undefined,
        updatedAt: new Date(),
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Update project completion percentage if status changed
    if (validatedData.status) {
      const taskStats = await db.task.aggregate({
        where: {
          projectId: params.id,
        },
        _count: {
          _all: true,
        },
      });

      const completedTasks = await db.task.count({
        where: {
          projectId: params.id,
          status: 'COMPLETED',
        },
      });

      const completionPercentage = taskStats._count._all > 0
        ? Math.round((completedTasks / taskStats._count._all) * 100)
        : 0;

      await db.project.update({
        where: {
          id: params.id,
        },
        data: {
          completionPercentage,
        },
      });
    }

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
  { params }: { params: { id: string; taskId: string } }
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

    // Verify task exists
    const existingTask = await db.task.findFirst({
      where: {
        id: params.taskId,
        projectId: params.id,
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Delete the task
    await db.task.delete({
      where: {
        id: params.taskId,
      },
    });

    // Update project completion percentage
    const taskStats = await db.task.aggregate({
      where: {
        projectId: params.id,
      },
      _count: {
        _all: true,
      },
    });

    const completedTasks = await db.task.count({
      where: {
        projectId: params.id,
        status: 'COMPLETED',
      },
    });

    const completionPercentage = taskStats._count._all > 0
      ? Math.round((completedTasks / taskStats._count._all) * 100)
      : 0;

    await db.project.update({
      where: {
        id: params.id,
      },
      data: {
        completionPercentage,
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