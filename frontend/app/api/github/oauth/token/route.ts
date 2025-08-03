import { NextRequest, NextResponse } from 'next/server';

// Hardcoded GitHub OAuth credentials
const GITHUB_CLIENT_ID = 'Ov23lij7oQUxuK5VpghA';
const GITHUB_CLIENT_SECRET = 'b7ef8ba143b86f571066545ce37a949e8cba0e8c';

// Track processed codes to prevent duplicate requests
const processedCodes = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    console.log('=== GitHub OAuth Token Exchange Start ===');
    
    // Handle potentially empty body
    let body;
    try {
      const requestText = await request.text();
      console.log('Raw request body:', requestText);
      
      if (!requestText || requestText.trim() === '') {
        console.error('Empty request body received');
        return NextResponse.json(
          { error: 'Request body is empty' },
          { status: 400 }
        );
      }

      body = JSON.parse(requestText);
      console.log('Parsed request body:', body);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { code, client_id, redirect_uri, state } = body;

    console.log('Extracted parameters:', {
      code: code ? code.substring(0, 10) + '...' : 'MISSING',
      client_id: client_id || 'MISSING',
      redirect_uri: redirect_uri || 'MISSING',
      state: state || 'MISSING'
    });

    if (!code) {
      console.error('Missing authorization code');
      return NextResponse.json(
        { error: 'Missing authorization code' },
        { status: 400 }
      );
    }

    // Check if this code has already been processed
    if (processedCodes.has(code)) {
      console.error('OAuth code already processed:', code.substring(0, 10) + '...');
      return NextResponse.json(
        { error: 'OAuth code already used' },
        { status: 400 }
      );
    }

    // Mark code as being processed
    processedCodes.add(code);
    console.log('Added code to processed set');

    // Clean up old codes (keep only last 10 to prevent memory leak)
    if (processedCodes.size > 10) {
      const codesArray = Array.from(processedCodes);
      processedCodes.clear();
      // Keep only the last 5 codes
      codesArray.slice(-5).forEach(c => processedCodes.add(c));
    }

    // Use hardcoded values
    const githubRequestBody = {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirect_uri || 'http://localhost:3000/github/callback'
    };

    console.log('Sending request to GitHub with hardcoded credentials:', {
      client_id: GITHUB_CLIENT_ID,
      code: code.substring(0, 10) + '...',
      redirect_uri: githubRequestBody.redirect_uri,
      client_secret: 'SET'
    });

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Unite-DeFi-Platform'
      },
      body: JSON.stringify(githubRequestBody)
    });

    console.log('GitHub response status:', tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('GitHub token exchange failed:', errorText);
      return NextResponse.json(
        { error: `GitHub token exchange failed: ${tokenResponse.statusText}`, details: errorText },
        { status: tokenResponse.status }
      );
    }

    // Get response as text first
    const responseText = await tokenResponse.text();
    console.log('GitHub response text:', responseText);

    if (!responseText) {
      console.error('Empty response from GitHub');
      return NextResponse.json(
        { error: 'Empty response from GitHub' },
        { status: 500 }
      );
    }

    let tokenData;
    try {
      tokenData = JSON.parse(responseText);
      console.log('Successfully parsed JSON response');
    } catch (parseError) {
      console.log('Failed to parse as JSON, trying URL-encoded format');
      
      // GitHub sometimes returns URL-encoded data
      if (responseText.includes('access_token=')) {
        const params = new URLSearchParams(responseText);
        tokenData = {
          access_token: params.get('access_token'),
          token_type: params.get('token_type'),
          scope: params.get('scope'),
          error: params.get('error'),
          error_description: params.get('error_description')
        };
        console.log('Parsed URL-encoded response:', tokenData);
      } else {
        console.error('Could not parse GitHub response:', responseText);
        return NextResponse.json(
          { error: 'Invalid response format from GitHub', response: responseText },
          { status: 500 }
        );
      }
    }

    if (tokenData.error) {
      console.error('GitHub OAuth error:', tokenData.error, tokenData.error_description);
      return NextResponse.json(
        {
          error: tokenData.error,
          error_description: tokenData.error_description
        },
        { status: 400 }
      );
    }

    if (!tokenData.access_token) {
      console.error('No access token in response:', tokenData);
      return NextResponse.json(
        { error: 'No access token received from GitHub', tokenData },
        { status: 400 }
      );
    }

    console.log('Token exchange successful!');
    console.log('Access token received, length:', tokenData.access_token.length);
    console.log('=== GitHub OAuth Token Exchange End ===');

    // Return the access token
    return NextResponse.json({
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      scope: tokenData.scope
    });

  } catch (error: any) {
    console.error('=== GitHub OAuth Token Exchange Error ===');
    console.error('Error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}