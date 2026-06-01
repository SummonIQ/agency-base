import { NextRequest, NextResponse } from 'next/server';
import { WorkflowAutomationService } from '@/lib/services/workflow-automation-service';
import { getCurrentUser } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await WorkflowAutomationService.getWorkflowStats(user.id);

    if (!stats) {
      return NextResponse.json(
        { error: 'Failed to fetch workflow stats' },
        { status: 500 }
      );
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching workflow stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow stats' },
      { status: 500 }
    );
  }
}
