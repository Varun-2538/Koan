interface CodeExecutionRequest {
  nodeType: string
  inputs: Record<string, any>
  context?: {
    nodeId?: string
    workflowId?: string
    executionId?: string
    environment?: string
  }
  generateCode?: {
    outputType?: 'react' | 'vue' | 'vanilla' | 'node' | 'python'
    includeTests?: boolean
    includeDocs?: boolean
  }
}

interface ExecutionResult {
  success: boolean
  nodeId: string
  result?: Record<string, any>
  logs?: string[]
  error?: string
  executionTime: string
  pluginUsed?: string
  pluginVersion?: string
}

interface CodeGenerationResult {
  files: Record<string, string>
  entryPoint: string
  dependencies: Record<string, string>
  devDependencies?: Record<string, string>
  scripts?: Record<string, string>
  documentation?: string
}

interface CodeExecutionResponse extends ExecutionResult {
  execution?: ExecutionResult
  codeGeneration?: CodeGenerationResult
  codeGenerationError?: string
}

class CodeExecutionClient {
  private baseUrl: string

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
  }

  /**
   * Execute a single node with optional code generation
   */
  async executeNode(request: CodeExecutionRequest): Promise<CodeExecutionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/execute-node`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Node execution failed:', error)
      throw error
    }
  }

  /**
   * Execute a node and generate code for it
   */
  async executeAndGenerateCode(
    nodeType: string,
    inputs: Record<string, any>,
    options: {
      outputType?: 'react' | 'vue' | 'vanilla' | 'node' | 'python'
      includeTests?: boolean
      includeDocs?: boolean
      context?: CodeExecutionRequest['context']
    } = {}
  ): Promise<CodeExecutionResponse> {
    return this.executeNode({
      nodeType,
      inputs,
      context: options.context,
      generateCode: {
        outputType: options.outputType || 'react',
        includeTests: options.includeTests || false,
        includeDocs: options.includeDocs || false
      }
    })
  }

  /**
   * Execute multiple nodes in sequence
   */
  async executeNodes(requests: CodeExecutionRequest[]): Promise<CodeExecutionResponse[]> {
    const results: CodeExecutionResponse[] = []
    
    for (const request of requests) {
      try {
        const result = await this.executeNode(request)
        results.push(result)
        
        // Stop execution if any node fails
        if (!result.success) {
          console.warn(`Node execution failed, stopping sequence: ${result.error}`)
          break
        }
      } catch (error) {
        const errorResult: CodeExecutionResponse = {
          success: false,
          nodeId: request.context?.nodeId || 'unknown',
          error: error instanceof Error ? error.message : 'Unknown error',
          executionTime: new Date().toISOString()
        }
        results.push(errorResult)
        break
      }
    }
    
    return results
  }

  /**
   * Generate code for a specific plugin without execution
   */
  async generateCodeOnly(
    nodeType: string,
    inputs: Record<string, any>,
    outputType: 'react' | 'vue' | 'vanilla' | 'node' | 'python' = 'react'
  ): Promise<CodeGenerationResult> {
    const response = await this.executeNode({
      nodeType,
      inputs,
      generateCode: {
        outputType,
        includeTests: true,
        includeDocs: true
      }
    })

    if (!response.codeGeneration) {
      throw new Error('Code generation failed or was not requested')
    }

    return response.codeGeneration
  }

  /**
   * Validate node inputs without execution
   */
  async validateInputs(nodeType: string, inputs: Record<string, any>): Promise<{
    valid: boolean
    errors: string[]
  }> {
    try {
      // We can use a dry-run approach by sending a special context
      const response = await fetch(`${this.baseUrl}/api/execute-node`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodeType,
          inputs,
          context: {
            dryRun: true, // Plugin system should handle this
            environment: 'validation'
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        return {
          valid: false,
          errors: [errorData.error || 'Validation failed']
        }
      }

      const result = await response.json()
      return {
        valid: result.success,
        errors: result.success ? [] : [result.error || 'Unknown validation error']
      }
    } catch (error) {
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : 'Validation error']
      }
    }
  }

  /**
   * Get execution templates for a specific node type
   */
  async getExecutionTemplates(nodeType: string): Promise<{
    templates: Array<{
      name: string
      description: string
      inputs: Record<string, any>
      expectedOutputs: Record<string, any>
    }>
  }> {
    // This would be implemented by the backend to provide example templates
    // For now, return a mock response
    return {
      templates: [
        {
          name: 'Default Template',
          description: `Default configuration for ${nodeType}`,
          inputs: {},
          expectedOutputs: {}
        }
      ]
    }
  }

  /**
   * Stream execution results (for long-running operations)
   */
  async *executeNodeStream(request: CodeExecutionRequest): AsyncGenerator<{
    type: 'progress' | 'log' | 'result' | 'error'
    data: any
  }> {
    // This would use Server-Sent Events or WebSocket for real-time updates
    // For now, just yield the final result
    try {
      const result = await this.executeNode(request)
      
      if (result.logs) {
        for (const log of result.logs) {
          yield { type: 'log', data: { message: log, timestamp: new Date().toISOString() } }
        }
      }
      
      yield { type: 'result', data: result }
    } catch (error) {
      yield { 
        type: 'error', 
        data: { 
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }
    }
  }

  /**
   * Execute a workflow (multiple connected nodes)
   */
  async executeWorkflow(workflow: {
    nodes: Array<{
      id: string
      type: string
      inputs: Record<string, any>
    }>
    connections: Array<{
      source: string
      target: string
      sourceOutput?: string
      targetInput?: string
    }>
  }): Promise<{
    success: boolean
    results: Record<string, CodeExecutionResponse>
    error?: string
    executionOrder: string[]
  }> {
    // This would implement workflow execution logic
    // For now, execute nodes in order
    const results: Record<string, CodeExecutionResponse> = {}
    const executionOrder: string[] = []
    
    try {
      for (const node of workflow.nodes) {
        const result = await this.executeNode({
          nodeType: node.type,
          inputs: node.inputs,
          context: {
            nodeId: node.id,
            workflowId: 'workflow_execution',
            environment: 'workflow'
          }
        })
        
        results[node.id] = result
        executionOrder.push(node.id)
        
        if (!result.success) {
          return {
            success: false,
            results,
            error: `Node ${node.id} failed: ${result.error}`,
            executionOrder
          }
        }
      }
      
      return {
        success: true,
        results,
        executionOrder
      }
    } catch (error) {
      return {
        success: false,
        results,
        error: error instanceof Error ? error.message : 'Workflow execution failed',
        executionOrder
      }
    }
  }
}

// Export singleton instance
export const codeExecutionClient = new CodeExecutionClient()

// Export types for use in other modules
export type {
  CodeExecutionRequest,
  ExecutionResult,
  CodeGenerationResult,
  CodeExecutionResponse
}