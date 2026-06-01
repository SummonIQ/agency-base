import { auth } from '@/lib/auth/server';
import { createTimeEntry, getTimeEntries } from '@/lib/time-tracking';
import { headers } from 'next/headers';

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');
    const status = url.searchParams.get('status');
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');

    const filters: any = {};
    if (projectId) filters.projectId = projectId;
    if (status) filters.status = status;
    if (dateFrom) filters.dateFrom = new Date(dateFrom);
    if (dateTo) filters.dateTo = new Date(dateTo);

    const timeEntries = await getTimeEntries(session.user.id, filters);
    return Response.json(timeEntries);
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return Response.json(
      { error: 'Failed to fetch time entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    const timeEntry = await createTimeEntry({
      description: data.description,
      hours: data.hours,
      date: new Date(data.date),
      billable: data.billable ?? true,
      hourlyRate: data.hourlyRate,
      projectId: data.projectId,
      taskId: data.taskId,
      userId: session.user.id,
    });

    return Response.json(timeEntry);
  } catch (error) {
    console.error('Error creating time entry:', error);
    return Response.json(
      { error: 'Failed to create time entry' },
      { status: 500 }
    );
  }
}