import { NextRequest, NextResponse } from 'next/server';

// Native token addresses for different chains
const NATIVE_TOKEN_ADDRESSES: Record<string, string> = {
  '1': '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',    // Ethereum
  '137': '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',  // Polygon (use standard format)
  '56': '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',   // BSC
  '43114': '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Avalanche
};

// Minimum amounts for testing (in wei)
const MIN_AMOUNTS: Record<string, string> = {
  '1': '100000000000000000',     // 0.1 ETH
  '137': '100000000000000000',   // 0.1 MATIC  
  '56': '100000000000000000',    // 0.1 BNB
  '43114': '100000000000000000', // 0.1 AVAX
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const apiKey = request.headers.get('x-api-key');
  const chainId = searchParams.get('chainId');
  const endpoint = searchParams.get('endpoint');
  
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 401 });
  }

  if (!chainId || !endpoint) {
    return NextResponse.json({ error: 'Missing chainId or endpoint' }, { status: 400 });
  }

  try {
    // Remove the proxy-specific params and forward the rest
    const forwardParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== 'chainId' && key !== 'endpoint') {
        // Fix native token addresses
        if ((key === 'fromTokenAddress' || key === 'toTokenAddress' || key === 'src' || key === 'dst' || key === 'tokenAddress') && 
            (value === '0x0000000000000000000000000000000000001010' || value === '0x0000000000000000000000000000000000000000')) {
          forwardParams.append(key, NATIVE_TOKEN_ADDRESSES[chainId] || '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE');
        }
        // Pass amount as-is without adjustment
        else if (key === 'amount') {
          forwardParams.append(key, value);
        }
        else {
          forwardParams.append(key, value);
        }
      }
    });

    // Use API version v5.2 for swap endpoints as per 1inch documentation
    const apiVersion = endpoint === 'swap' ? 'v5.2' : 'v6.0';
    const oneInchUrl = `https://api.1inch.dev/swap/${apiVersion}/${chainId}/${endpoint}?${forwardParams.toString()}`;
    
    console.log('1inch API request:', {
      url: oneInchUrl,
      chainId,
      endpoint,
      params: Object.fromEntries(forwardParams),
      hasApiKey: !!apiKey
    });
    
    const response = await fetch(oneInchUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log('1inch API response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('1inch API error:', errorData);
      return NextResponse.json(
        { error: errorData.description || errorData.error || `1inch API Error: ${response.status}` }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('1inch API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from 1inch API' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');
  const body = await request.json();
  const { chainId, endpoint, ...params } = body;
  
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 401 });
  }

  if (!chainId || !endpoint) {
    return NextResponse.json({ error: 'Missing chainId or endpoint' }, { status: 400 });
  }

  try {
    // Fix native token addresses in POST body
    Object.keys(params).forEach(key => {
      if ((key === 'fromTokenAddress' || key === 'toTokenAddress' || key === 'src' || key === 'dst' || key === 'tokenAddress') && 
          (params[key] === '0x0000000000000000000000000000000000001010' || params[key] === '0x0000000000000000000000000000000000000000')) {
        params[key] = NATIVE_TOKEN_ADDRESSES[chainId] || '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
      }
    });

    // Pass amount as-is without adjustment in POST body
    // params.amount is already correct from the frontend

    // Use API version v5.2 for swap endpoints as per 1inch documentation
    const apiVersion = endpoint === 'swap' ? 'v5.2' : 'v6.0';
    const oneInchUrl = `https://api.1inch.dev/swap/${apiVersion}/${chainId}/${endpoint}`;
    
    const response = await fetch(oneInchUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.description || `1inch API Error: ${response.status}` }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('1inch API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from 1inch API' }, 
      { status: 500 }
    );
  }
}