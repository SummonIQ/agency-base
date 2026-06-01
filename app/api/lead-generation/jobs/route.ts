import { NextRequest, NextResponse } from 'next/server';
import { outreachService } from '@/lib/lead-generation/outreach-service';

// This endpoint can be called by a cron job or background service
// to process scheduled outreach activities
export async function POST(req: NextRequest) {
  try {
    // Simple API key authentication for background jobs
    const authHeader = req.headers.get('Authorization');
    const expectedKey = process.env.CRON_SECRET || 'default-secret';

    if (!authHeader || authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Starting scheduled outreach processing...');

    const results = await outreachService.processScheduledOutreach();

    const summary = {
      processed: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      timestamp: new Date().toISOString()
    };

    console.log('✅ Scheduled outreach processing completed:', summary);

    return NextResponse.json({
      success: true,
      summary,
      details: results
    });
  } catch (error) {
    console.error('❌ Scheduled outreach processing failed:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'lead-generation-jobs',
    timestamp: new Date().toISOString()
  });
}