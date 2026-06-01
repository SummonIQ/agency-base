import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional().nullable(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'CANCELLED']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assigneeId: z.string().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  estimatedHours: z.number().positive().optional().nullable(),
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

    // Get tasks for the project
    const tasks = await db.task.findMany({
      where: {
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
        _count: {
          select: {
            timeEntries: true,
            comments: true,
            attachments: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Calculate actual hours from time entries
    const tasksWithHours = await Promise.all(tasks.map(async (task) => {
      const timeEntries = await db.timeEntry.aggregate({
        where: { taskId: task.id },
        _sum: { hours: true },
      });
      return {
        ...task,
        actualHours: timeEntries._sum.hours || 0,
      };
    }));

    // Group tasks by status
    const tasksByStatus = {
      todo: tasksWithHours.filter(t => t.status === 'TODO'),
      inProgress: tasksWithHours.filter(t => t.status === 'IN_PROGRESS' || t.status === 'IN_REVIEW'),
      completed: tasksWithHours.filter(t => t.status === 'COMPLETED'),
    };

    return NextResponse.json(tasksByStatus);
  } catch (error) {
    console.error('Error fetching tasks:', error);
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
    const validatedData = createTaskSchema.parse(body);

    // If assigneeId is provided, verify they are a team member
    if (validatedData.assigneeId) {
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

    // Create the task
    const task = await db.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        status: validatedData.status || 'TODO',
        priority: validatedData.priority || 'MEDIUM',
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        estimatedHours: validatedData.estimatedHours,
        actualHours: 0,
        projectId: params.id,
        assigneeId: validatedData.assigneeId,
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

    // Update project completion percentage based on task count
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

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);

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