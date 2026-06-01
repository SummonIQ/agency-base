import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { ACTION_PLAN_TASKS } from '@/lib/action-plan-data';

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

    // Check if tasks already exist to avoid duplicates
    const existingTasks = await db.actionTask.count({
      where: {
        userId: session.user.id,
        source: 'action-plan'
      }
    });

    if (existingTasks > 0) {
      return NextResponse.json(
        { message: 'Action plan tasks already imported', count: existingTasks },
        { status: 200 }
      );
    }

    let totalTasksCreated = 0;

    // Create tasks with their sub-tasks using transactions
    for (const mainTask of ACTION_PLAN_TASKS) {
      await db.$transaction(async (tx) => {
        // Create the main task
        const createdMainTask = await tx.actionTask.create({
          data: {
            title: mainTask.title,
            description: mainTask.description,
            category: mainTask.category,
            priority: mainTask.priority,
            status: 'TODO',
            estimatedHours: mainTask.estimatedHours,
            actualHours: 0,
            source: mainTask.source,
            sourceId: mainTask.sourceId,
            tags: mainTask.tags,
            progressPercentage: 0,
            userId: session.user.id
          }
        });

        totalTasksCreated++;

        // Create sub-tasks if they exist
        if (mainTask.subTasks && mainTask.subTasks.length > 0) {
          for (const subTask of mainTask.subTasks) {
            await tx.actionTask.create({
              data: {
                title: subTask.title,
                description: subTask.description,
                category: subTask.category,
                priority: subTask.priority,
                status: 'TODO',
                estimatedHours: subTask.estimatedHours,
                actualHours: 0,
                source: subTask.source,
                sourceId: subTask.sourceId,
                tags: subTask.tags,
                progressPercentage: 0,
                parentTaskId: createdMainTask.id,
                userId: session.user.id
              }
            });
            totalTasksCreated++;
          }
        }
      });
    }

    return NextResponse.json({
      message: 'Action plan tasks imported successfully',
      count: totalTasksCreated
    }, { status: 201 });
  } catch (error) {
    console.error('Error importing action plan tasks:', error);
    return NextResponse.json(
      { error: 'Failed to import tasks' },
      { status: 500 }
    );
  }
}