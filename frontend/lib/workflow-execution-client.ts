/**
 * Workflow Execution Client
 * 
 * Handles communication between the frontend canvas and backend execution engine
 * via the agents API layer.
 */

export interface WorkflowNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: {
    label: string
    config: any
  }
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
}

export interface WorkflowDefinition {
  id: string
  name: string
  description: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  metadata?: any
}

export interface ExecutionStatus {
  executionId: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  steps: Record<string, {
    status: string
    nodeType: string
    startTime?: number
    endTime?: number
    result?: any
    error?: string
  }>
  startTime?: number
  endTime?: number
  error?: string
}

export class WorkflowExecutionClient {
  private agentsBaseUrl: string
  private backendBaseUrl: string

  constructor(
    agentsBaseUrl = 'http://localhost:8000',
    backendBaseUrl = 'http://localhost:3001'
  ) {
    this.agentsBaseUrl = agentsBaseUrl
    this.backendBaseUrl = backendBaseUrl
  }

  /**
   * Execute a workflow through the agents API
   */
  async executeWorkflow(workflow: WorkflowDefinition): Promise<{ executionId: string }> {
    try {
      // First try direct backend execution
      const response = await fetch(`${this.backendBaseUrl}/api/workflows/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflow,
          context: {
            environment: 'frontend-canvas'
          }
        })
      })

      if (response.ok) {
        const result = await response.json()
        return { executionId: result.executionId }
      }
    } catch (error) {
      console.warn('Direct backend execution failed, trying via agents:', error)
    }

    // Fallback to agents API
    try {
      const response = await fetch(`${this.agentsBaseUrl}/approve-workflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflow_definition: workflow,
          conversation_id: 'canvas-execution'
        })
      })

      if (!response.ok) {
        throw new Error(`Workflow execution failed: ${response.status}`)
      }

      const result = await response.json()
      return { executionId: result.executionId || 'mock-execution-id' }
    } catch (error) {
      console.error('Agents API execution failed:', error)
      throw error
    }
  }

  /**
   * Get execution status from backend or agents
   */
  async getExecutionStatus(executionId: string): Promise<ExecutionStatus> {
    try {
      // Try direct backend status first
      const response = await fetch(`${this.backendBaseUrl}/api/executions/${executionId}`)
      
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.warn('Direct backend status check failed, trying via agents:', error)
    }

    // Fallback to agents API
    try {
      const response = await fetch(`${this.agentsBaseUrl}/executions/${executionId}`)
      
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.warn('Agents API status check failed:', error)
    }

    // Return mock status if both fail
    return {
      executionId,
      status: 'failed',
      steps: {},
      error: 'Unable to retrieve execution status'
    }
  }

  /**
   * Cancel a running execution
   */
  async cancelExecution(executionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.backendBaseUrl}/api/executions/${executionId}/cancel`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const result = await response.json()
        return result.success || false
      }
    } catch (error) {
      console.error('Execution cancellation failed:', error)
    }
    
    return false
  }

  /**
   * Monitor execution with real-time updates
   */
  async *monitorExecution(executionId: string): AsyncGenerator<ExecutionStatus> {
    while (true) {
      try {
        const status = await this.getExecutionStatus(executionId)
        yield status

        // Stop monitoring if execution is complete
        if (['completed', 'failed', 'cancelled'].includes(status.status)) {
          break
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error('Error monitoring execution:', error)
        yield {
          executionId,
          status: 'failed',
          steps: {},
          error: 'Monitoring error: ' + (error as Error).message
        }
        break
      }
    }
  }

  /**
   * Get node execution logs
   */
  async getNodeLogs(executionId: string, nodeId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.backendBaseUrl}/api/executions/${executionId}/logs`)
      
      if (response.ok) {
        const logs = await response.json()
        return logs.logs || []
      }
    } catch (error) {
      console.error('Failed to get node logs:', error)
    }
    
    return []
  }

  /**
   * Validate workflow before execution
   */
  validateWorkflow(workflow: WorkflowDefinition): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check if workflow has nodes
    if (!workflow.nodes || workflow.nodes.length === 0) {
      errors.push('Workflow must have at least one node')
    }

    // Validate node structure
    workflow.nodes.forEach((node, index) => {
      if (!node.id) {
        errors.push(`Node ${index}: Missing id`)
      }
      if (!node.type) {
        errors.push(`Node ${index}: Missing type`)
      }
      if (!node.data) {
        errors.push(`Node ${index}: Missing data`)
      }
    })

    // Validate edges
    const nodeIds = new Set(workflow.nodes.map(n => n.id))
    workflow.edges.forEach((edge, index) => {
      if (!nodeIds.has(edge.source)) {
        errors.push(`Edge ${index}: Source node '${edge.source}' not found`)
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`Edge ${index}: Target node '${edge.target}' not found`)
      }
    })

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// Create singleton instance
export const workflowExecutionClient = new WorkflowExecutionClient()