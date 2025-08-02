import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest, 
  { params }: { params: { instanceId: string } }
) {
  try {
    const { instanceId } = params;
    
    // Forward to backend preview server (port 3002)
    const response = await fetch(`http://localhost:3002/api/preview/status/${instanceId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await response.json();
    
    if (response.ok) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: response.status });
    }
  } catch (error: any) {
    console.error('Preview status error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 