import { auth } from '@/lib/auth/server';
import { 
  getTimeEntry, 
  updateTimeEntry, 
  deleteTimeEntry 
} from '@/lib/time-tracking';
import { headers } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const timeEntry = await getTimeEntry(params.id, session.user.id);
    
    if (!timeEntry) {
      return Response.json({ error: 'Time entry not found' }, { status: 404 });
    }

    return Response.json(timeEntry);
  } catch (error) {
    console.error('Error fetching time entry:', error);
    return Response.json(
      { error: 'Failed to fetch time entry' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    const updateData: any = {};
    if (data.description !== undefined) updateData.description = data.description;
    if (data.hours !== undefined) updateData.hours = data.hours;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.billable !== undefined) updateData.billable = data.billable;
    if (data.hourlyRate !== undefined) updateData.hourlyRate = data.hourlyRate;
    if (data.status !== undefined) updateData.status = data.status;
    
    const timeEntry = await updateTimeEntry(params.id, session.user.id, updateData);

    return Response.json(timeEntry);
  } catch (error) {
    console.error('Error updating time entry:', error);
    return Response.json(
      { error: 'Failed to update time entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await deleteTimeEntry(params.id, session.user.id);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting time entry:', error);
    return Response.json(
      { error: 'Failed to delete time entry' },
      { status: 500 }
    );
  }
}