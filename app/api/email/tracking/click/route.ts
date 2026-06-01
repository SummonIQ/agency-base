import { NextRequest, NextResponse } from 'next/server';
import { emailTrackingService } from '@/lib/email/email-tracking';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const originalUrl = searchParams.get('url');
    const trackingData = emailTrackingService.extractEmailFromTrackedData(searchParams);

    if (!originalUrl) {
      return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
    }

    // Record the click event
    if (trackingData.messageId && trackingData.email) {
      await emailTrackingService.recordClick(
        trackingData.messageId,
        trackingData.email,
        originalUrl,
        {
          userAgent: req.headers.get('user-agent'),
          ip: req.headers.get('x-forwarded-for') || 'unknown',
          timestamp: new Date().toISOString(),
          referer: req.headers.get('referer'),
          ...trackingData.metadata
        }
      );
    }

    // Redirect to original URL
    return NextResponse.redirect(originalUrl, { status: 302 });

  } catch (error) {
    console.error('Click tracking error:', error);

    // Try to redirect to original URL even if tracking fails
    const originalUrl = new URL(req.url).searchParams.get('url');
    if (originalUrl) {
      return NextResponse.redirect(originalUrl, { status: 302 });
    }

    return NextResponse.json({ error: 'Click tracking failed' }, { status: 500 });
  }
}