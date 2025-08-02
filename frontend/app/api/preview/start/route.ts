import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { workflow, config, codeResult, projectName } = await request.json();
    
    // Forward to backend preview server (port 3002)
    const response = await fetch('http://localhost:3002/api/preview/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflow, config, codeResult, projectName })
    });
    
    const result = await response.json();
    
    if (result.success !== false) {
      return NextResponse.json({
        success: true,
        previewUrl: result.previewUrl || `http://localhost:${result.port}`,
        instanceId: result.instanceId,
        port: result.port
      });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Preview start error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}