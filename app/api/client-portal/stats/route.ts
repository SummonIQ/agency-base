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

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    const stats = await ClientPortalService.getClientStats(clientId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching client portal stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client portal stats' },
      { status: 500 }
    );
  }
}
