import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { assignTaskToTeamMember, unassignTaskFromTeamMember } from '@/lib/team-members';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { teamMemberId } = body;

    if (!teamMemberId) {
      return NextResponse.json(
        { error: 'Team member ID is required' },
        { status: 400 }
      );
    }

    const task = await assignTaskToTeamMember(params.id, teamMemberId, session.user.id);

    return NextResponse.json({
      success: true,
      task,
      message: `Task assigned to ${task.assignee?.name}`,
    });
  } catch (error) {
    console.error('Error assigning task:', error);
    const message = error instanceof Error ? error.message : 'Failed to assign task';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const task = await unassignTaskFromTeamMember(params.id, session.user.id);

    return NextResponse.json({
      success: true,
      task,
      message: 'Task unassigned successfully',
    });
  } catch (error) {
    console.error('Error unassigning task:', error);
    const message = error instanceof Error ? error.message : 'Failed to unassign task';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}