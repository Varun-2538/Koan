import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest, 
  { params }: { params: { instanceId: string } }
) {
  try {
    const { instanceId } = params;
    
    // Forward to backend preview server (port 3002)
    const response = await fetch('http://localhost:3002/api/preview/stop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instanceId })
    });
    
    const result = await response.json();
    
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Preview stop error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 