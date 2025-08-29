import { NextRequest, NextResponse } from 'next/server'

// Mock plugin registry endpoint
export async function GET(request: NextRequest) {
  try {
    // Return empty array for now - in production this would return available plugins
    const plugins = []
    
    return NextResponse.json(plugins)
  } catch (error) {
    console.error('Plugin registry fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plugin registry' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Mock plugin installation - in production this would handle plugin installation
    return NextResponse.json({ 
      success: true, 
      message: 'Plugin installation not implemented in development mode' 
    })
  } catch (error) {
    console.error('Plugin installation error:', error)
    return NextResponse.json(
      { error: 'Failed to install plugin' },
      { status: 500 }
    )
  }
}