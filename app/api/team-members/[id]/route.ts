import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { getTeamMember, updateTeamMember, deleteTeamMember } from '@/lib/team-members';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teamMember = await getTeamMember(params.id, session.user.id);

    if (!teamMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    return NextResponse.json(teamMember);
  } catch (error) {
    console.error('Error fetching team member:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team member' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.department !== undefined) updateData.department = body.department;
    if (body.skills !== undefined) updateData.skills = body.skills;
    if (body.availability !== undefined) updateData.availability = body.availability;
    if (body.image !== undefined) updateData.image = body.image;

    const teamMember = await updateTeamMember(params.id, session.user.id, updateData);

    return NextResponse.json(teamMember);
  } catch (error) {
    console.error('Error updating team member:', error);
    const message = error instanceof Error ? error.message : 'Failed to update team member';
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

    await deleteTeamMember(params.id, session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting team member:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete team member';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}