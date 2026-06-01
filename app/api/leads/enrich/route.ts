import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { apolloService } from '@/lib/leads/apollo-service';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { email, provider = 'apollo' } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (provider === 'apollo') {
      const result = await apolloService.enrichContact(email);

      if (result.success) {
        return NextResponse.json({
          success: true,
          data: result.data,
          provider: 'apollo',
        });
      } else {
        return NextResponse.json({
          success: false,
          error: result.error,
          provider: 'apollo',
        }, { status: 400 });
      }
    }

    // Add ZoomInfo support later
    if (provider === 'zoominfo') {
      return NextResponse.json({
        success: false,
        error: 'ZoomInfo enrichment coming soon',
      }, { status: 501 });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid provider specified',
    }, { status: 400 });

  } catch (error) {
    console.error('Lead enrichment API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
