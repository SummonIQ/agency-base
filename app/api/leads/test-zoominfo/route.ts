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
    const { apiKey, username } = body;

    if (!apiKey || !username) {
      return NextResponse.json(
        { error: 'API key and username are required' },
        { status: 400 }
      );
    }

    // Test ZoomInfo API connection
    try {
      // First, authenticate to get access token
      const authResponse = await fetch('https://api.zoominfo.com/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: apiKey, // ZoomInfo uses password field for API key
        }),
      });

      if (!authResponse.ok) {
        throw new Error(`ZoomInfo auth failed: ${authResponse.status} ${authResponse.statusText}`);
      }

      const authData = await authResponse.json();
      const accessToken = authData.jwt;

      if (!accessToken) {
        throw new Error('No access token received from ZoomInfo');
      }

      // Test the API with a simple request
      const testResponse = await fetch('https://api.zoominfo.com/lookup/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          companyName: 'Microsoft',
          limit: 1,
        }),
      });

      if (!testResponse.ok) {
        throw new Error(`ZoomInfo API test failed: ${testResponse.status} ${testResponse.statusText}`);
      }

      const testData = await testResponse.json();
      
      return NextResponse.json({
        success: true,
        message: 'ZoomInfo connection successful',
        details: {
          status: testResponse.status,
          resultsFound: testData.data?.length || 0,
          creditsRemaining: testData.creditsRemaining || 'Unknown',
        },
      });

    } catch (zoomInfoError: any) {
      console.error('ZoomInfo test error:', zoomInfoError);
      
      return NextResponse.json({
        success: false,
        error: 'ZoomInfo connection failed',
        details: zoomInfoError.message || 'Unknown ZoomInfo error',
      }, { status: 400 });
    }

  } catch (error) {
    console.error('ZoomInfo test connection error:', error);
    return NextResponse.json(
      { error: 'Connection test failed' },
      { status: 500 }
    );
  }
}
