import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, client_id, redirect_uri } = body;

    console.log('GitHub OAuth token exchange request:', {
      code: code ? `${code.substring(0, 10)}...` : 'MISSING',
      client_id: client_id ? `${client_id.substring(0, 8)}...` : 'MISSING',
      redirect_uri,
      client_secret_set: !!process.env.GITHUB_CLIENT_SECRET
    });

    if (!code || !client_id) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    if (!process.env.GITHUB_CLIENT_SECRET) {
      console.error('GITHUB_CLIENT_SECRET environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error: GitHub client secret not configured' },
        { status: 500 }
      );
    }

    // Exchange authorization code for access token
    const tokenRequestBody = {
      client_id,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri
    };

    console.log('Sending token request to GitHub:', {
      ...tokenRequestBody,
      client_secret: 'REDACTED',
      code: `${code.substring(0, 10)}...`
    });

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Unite-DeFi-Platform'
      },
      body: JSON.stringify(tokenRequestBody)
    });

    const tokenData = await tokenResponse.json();
    
    console.log('GitHub token response:', {
      status: tokenResponse.status,
      ok: tokenResponse.ok,
      hasError: !!tokenData.error,
      error: tokenData.error,
      error_description: tokenData.error_description
    });

    if (!tokenResponse.ok) {
      // Log the full error response for debugging
      console.error('GitHub token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        response: tokenData
      });
      
      throw new Error(`GitHub token exchange failed: ${tokenResponse.status} ${tokenResponse.statusText} - ${tokenData.error_description || tokenData.error || 'Unknown error'}`);
    }

    if (tokenData.error) {
      return NextResponse.json(
        {
          error: tokenData.error,
          error_description: tokenData.error_description
        },
        { status: 400 }
      );
    }

    // Return the access token
    return NextResponse.json({
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      scope: tokenData.scope
    });

  } catch (error: any) {
    console.error('GitHub OAuth token exchange error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message 
      },
      { status: 500 }
    );
  }
}