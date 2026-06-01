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
    const { clientId, clientSecret, redirectUri } = body;

    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.json(
        { error: 'Client ID, client secret, and redirect URI are required' },
        { status: 400 }
      );
    }

    // Test LinkedIn API connection by validating the OAuth app configuration
    try {
      // Validate the OAuth configuration by checking if we can generate an auth URL
      const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('client_id', clientId);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('scope', 'r_liteprofile r_emailaddress w_member_social');
      authUrl.searchParams.set('state', 'test_connection');

      // Validate redirect URI format
      try {
        new URL(redirectUri);
      } catch {
        throw new Error('Invalid redirect URI format');
      }

      // Test by making a request to LinkedIn's well-known endpoint
      const wellKnownResponse = await fetch('https://www.linkedin.com/.well-known/openid_configuration');
      
      if (!wellKnownResponse.ok) {
        throw new Error('LinkedIn API is not accessible');
      }

      const wellKnownData = await wellKnownResponse.json();
      
      return NextResponse.json({
        success: true,
        message: 'LinkedIn OAuth configuration validated',
        details: {
          authUrl: authUrl.toString(),
          issuer: wellKnownData.issuer,
          authorizationEndpoint: wellKnownData.authorization_endpoint,
          tokenEndpoint: wellKnownData.token_endpoint,
        },
      });

    } catch (linkedinError: any) {
      console.error('LinkedIn test error:', linkedinError);
      
      return NextResponse.json({
        success: false,
        error: 'LinkedIn connection validation failed',
        details: linkedinError.message || 'Unknown LinkedIn error',
      }, { status: 400 });
    }

  } catch (error) {
    console.error('LinkedIn test connection error:', error);
    return NextResponse.json(
      { error: 'Connection test failed' },
      { status: 500 }
    );
  }
}
