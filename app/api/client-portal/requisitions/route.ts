import { NextRequest, NextResponse } from 'next/server';
import { ClientPortalService } from '@/lib/services/client-portal-service';
import { getCurrentUser } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status') || undefined;
    const priority = searchParams.get('priority') || undefined;

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    const requisitions = await ClientPortalService.getClientRequisitions(clientId, {
      status,
      priority,
    });

    return NextResponse.json(requisitions);
  } catch (error) {
    console.error('Error fetching client requisitions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client requisitions' },
      { status: 500 }
    );
  }
}
