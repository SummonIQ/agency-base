import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { createTeamMember, getTeamMembers } from '@/lib/team-members';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters = {
      role: searchParams.get('role') || undefined,
      department: searchParams.get('department') || undefined,
      availability: searchParams.get('availability') || undefined,
      skills: searchParams.get('skills')?.split(',').filter(Boolean) || undefined,
    };

    const teamMembers = await getTeamMembers(session.user.id, filters);

    return NextResponse.json(teamMembers);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, role, department, skills, availability, image } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if team member with this email already exists for this user
    const existingTeamMember = await getTeamMembers(session.user.id);
    const emailExists = existingTeamMember.some(member => member.email === email);

    if (emailExists) {
      return NextResponse.json(
        { error: 'Team member with this email already exists' },
        { status: 400 }
      );
    }

    const teamMember = await createTeamMember({
      name,
      email,
      role,
      department,
      skills: skills || [],
      availability: availability || 'available',
      image,
      userId: session.user.id,
    });

    return NextResponse.json(teamMember);
  } catch (error) {
    console.error('Error creating team member:', error);
    const message = error instanceof Error ? error.message : 'Failed to create team member';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}