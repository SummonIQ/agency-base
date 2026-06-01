import { NextRequest, NextResponse } from 'next/server';
import { emailTrackingService } from '@/lib/email/email-tracking';

// 1x1 transparent GIF pixel data
const PIXEL_DATA = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const trackingData = emailTrackingService.extractEmailFromTrackedData(searchParams);

    if (trackingData.messageId && trackingData.email) {
      // Record the email open event
      await emailTrackingService.recordOpen(
        trackingData.messageId,
        trackingData.email,
        {
          userAgent: req.headers.get('user-agent'),
          ip: req.headers.get('x-forwarded-for') || 'unknown',
          timestamp: new Date().toISOString(),
          ...trackingData.metadata
        }
      );
    }

    // Return 1x1 transparent GIF
    return new NextResponse(PIXEL_DATA, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Tracking pixel error:', error);

    // Still return pixel even if tracking fails
    return new NextResponse(PIXEL_DATA, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
}