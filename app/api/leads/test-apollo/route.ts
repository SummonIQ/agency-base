import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { apiKey, baseUrl } = body;

    if (!apiKey || !baseUrl) {
      return NextResponse.json(
        { error: 'API key and base URL are required' },
        { status: 400 }
      );
    }

    // Test Apollo.io API connection
    try {
      const response = await fetch(`${baseUrl}/auth/health`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          'X-Api-Key': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Apollo API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return NextResponse.json({
        success: true,
        message: 'Apollo.io connection successful',
        details: {
          status: response.status,
          credits: data.credits_remaining || 'Unknown',
          plan: data.plan || 'Unknown',
        },
      });

    } catch (apolloError: any) {
      console.error('Apollo test error:', apolloError);
      
      return NextResponse.json({
        success: false,
        error: 'Apollo.io connection failed',
        details: apolloError.message || 'Unknown Apollo error',
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Apollo test connection error:', error);
    return NextResponse.json(
      { error: 'Connection test failed' },
      { status: 500 }
    );
  }
}
