import { NextRequest, NextResponse } from 'next/server'
import { unitePluginSystem } from '@/lib/plugin-system'

export async function POST(request: NextRequest) {
  try {
    const { node, nodeId, nodeType, inputs, context, generateCode } = await request.json()

    // Support both legacy format (node object) and new format (individual parameters)
    let pluginId: string
    let pluginInputs: Record<string, any>
    let nodeIdentifier: string

    if (node) {
      // Legacy format
      pluginId = node.type
      pluginInputs = { ...node.data?.config || {} }
      nodeIdentifier = node.id
    } else {
      // New format
      if (!nodeType || !inputs) {
        return NextResponse.json(
          { error: 'Missing required parameters: nodeType and inputs (or node object)' },
          { status: 400 }
        )
      }
      pluginId = nodeType
      pluginInputs = inputs
      nodeIdentifier = nodeId || `node_${Date.now()}`
    }

    console.log('Executing node via plugin system:', { pluginId, nodeIdentifier, pluginInputs })

    // Get component definition (components represent executable nodes)
    const component = unitePluginSystem.registry.getComponent(pluginId)
    if (!component) {
      return NextResponse.json(
        { error: `Component not found: ${pluginId}` },
        { status: 404 }
      )
    }

    // Execute the node using the plugin system (componentId, inputs, config, context)
    const executionResult = await unitePluginSystem.executionEngine.executeComponent(
      pluginId,
      {},
      pluginInputs,
      {
        nodeId: nodeIdentifier,
        workflowId: 'api_execution',
        executionId: `exec_${Date.now()}`,
        environment: 'development',
      } as any
    )

    // Handle modular code generation if requested
    if (generateCode && executionResult.success) {
      try {
        const codeResult = await unitePluginSystem.codeExecutionEngine.generateModularCode(
          [
            {
              id: nodeIdentifier,
              type: pluginId,
              config: pluginInputs,
              script: undefined,
              inputs: [],
              outputs: []
            }
          ],
          [],
          {
            language: 'typescript',
            includeTests: !!generateCode.includeTests,
            includeDocumentation: !!generateCode.includeDocs,
            optimizeForProduction: false
          } as any
        )

        return NextResponse.json({
          success: true,
          nodeId: nodeIdentifier,
          execution: executionResult,
          codeGeneration: codeResult,
          executionTime: new Date().toISOString()
        })
      } catch (codeError) {
        console.error('Code generation failed:', codeError)
        // Return execution result even if code generation fails
        return NextResponse.json({
          success: true,
          nodeId: nodeIdentifier,
          execution: executionResult,
          codeGenerationError: codeError instanceof Error ? codeError.message : 'Code generation failed',
          executionTime: new Date().toISOString()
        })
      }
    }

    // Return execution result
    return NextResponse.json({
      success: executionResult.success,
      nodeId: nodeIdentifier,
      result: executionResult.outputs,
      logs: executionResult.logs,
      error: executionResult.error,
      executionTime: new Date().toISOString(),
      pluginUsed: plugin.name,
      pluginVersion: plugin.version
    })

  } catch (error) {
    console.error('Node execution error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Node execution failed',
        details: error instanceof Error ? error.message : 'Unknown execution error'
      },
      { status: 500 }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
