import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';

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

    // Delete all action-plan tasks for this user
    const deletedTasks = await db.actionTask.deleteMany({
      where: {
        userId: session.user.id,
        source: 'action-plan'
      }
    });

    return NextResponse.json({
      message: 'Action plan tasks reset successfully',
      deletedCount: deletedTasks.count
    }, { status: 200 });
  } catch (error) {
    console.error('Error resetting action plan tasks:', error);
    return NextResponse.json(
      { error: 'Failed to reset tasks' },
      { status: 500 }
    );
  }
}
