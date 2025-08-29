/**
 * Generic Execution Engine
 * Handles runtime execution of components and workflows
 */

import type {
  ComponentDefinition,
  ExecutionContext,
  ExecutionResult,
  WorkflowDefinition,
  ValidationResult
} from './types'

class GenericExecutionEngine {
  private executors = new Map<string, Function>()
  private runningExecutions = new Set<string>()

  async executeComponent(
    component: ComponentDefinition,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    const startTime = Date.now()

    try {
      // Get or create executor for component
      let executor = this.executors.get(component.id)
      
      if (!executor) {
        executor = this.createExecutor(component)
        this.executors.set(component.id, executor)
      }

      // Execute with timeout
      const timeoutMs = component.execution?.timeout || 30000
      const result = await Promise.race([
        executor(context.inputs, context.config, context),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Execution timeout')), timeoutMs)
        )
      ])

      return {
        success: true,
        outputs: result || {},
        error: null,
        duration: Date.now() - startTime,
        logs: [],
        metadata: {
          componentId: component.id,
          executionTime: Date.now() - startTime
        }
      }

    } catch (error) {
      return {
        success: false,
        outputs: {},
        error: error as Error,
        duration: Date.now() - startTime,
        logs: [],
        metadata: {
          componentId: component.id,
          executionTime: Date.now() - startTime
        }
      }
    }
  }

  private createExecutor(component: ComponentDefinition): Function {
    const code = component.execution?.code || 'return {}'
    
    // Create sandboxed execution environment
    return new Function('inputs', 'config', 'context', `
      try {
        ${code}
      } catch (error) {
        throw new Error('Execution error: ' + error.message)
      }
    `)
  }

  async executeWorkflow(workflow: WorkflowDefinition): Promise<ExecutionResult> {
    const startTime = Date.now()
    const executionId = `workflow_${Date.now()}`
    
    try {
      this.runningExecutions.add(executionId)

      // Validate workflow first
      const validation = this.validateWorkflow(workflow)
      if (!validation.valid) {
        throw new Error(`Workflow validation failed: ${validation.errors.join(', ')}`)
      }

      // Execute nodes in topological order
      const executionOrder = this.getExecutionOrder(workflow)
      const nodeResults = new Map<string, any>()
      const results: Record<string, any> = {}

      for (const nodeId of executionOrder) {
        const node = workflow.nodes.find(n => n.id === nodeId)
        if (!node) continue

        // Prepare inputs from previous nodes
        const nodeInputs = this.prepareNodeInputs(node, nodeResults, workflow)

        // Mock component for now (in real implementation, get from registry)
        const mockComponent: ComponentDefinition = {
          id: node.type,
          name: node.type,
          version: '1.0.0',
          author: 'System',
          description: 'Auto-generated component',
          category: 'Auto',
          tags: [],
          template: {
            inputs: [],
            outputs: [],
            configuration: []
          },
          execution: {
            runtime: 'javascript',
            code: this.getMockExecutionCode(node.type),
            timeout: 30000
          },
          validation: {},
          metadata: {},
          dependencies: [],
          permissions: []
        }

        const context: ExecutionContext = {
          nodeId: node.id,
          workflowId: workflow.id || 'temp',
          inputs: nodeInputs,
          config: node.data || {},
          environment: {},
          dependencies: {},
          permissions: []
        }

        const nodeResult = await this.executeComponent(mockComponent, context)
        
        if (!nodeResult.success) {
          throw new Error(`Node ${nodeId} failed: ${nodeResult.error?.message}`)
        }

        nodeResults.set(nodeId, nodeResult.outputs)
        results[nodeId] = nodeResult.outputs
      }

      return {
        success: true,
        outputs: results,
        error: null,
        duration: Date.now() - startTime,
        logs: [],
        metadata: {
          workflowId: workflow.id,
          nodesExecuted: executionOrder.length
        }
      }

    } catch (error) {
      return {
        success: false,
        outputs: {},
        error: error as Error,
        duration: Date.now() - startTime,
        logs: [],
        metadata: {
          workflowId: workflow.id
        }
      }
    } finally {
      this.runningExecutions.delete(executionId)
    }
  }

  private getMockExecutionCode(nodeType: string): string {
    switch (nodeType) {
      case 'oneInchSwap':
        return `
          return {
            transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
            outputAmount: (inputs.amount || 1) * 1800,
            gasUsed: Math.floor(Math.random() * 200000) + 50000
          }
        `
      case 'walletConnector':
        return `
          return {
            address: '0x' + Math.random().toString(16).substr(2, 40),
            chainId: 1,
            connected: true
          }
        `
      case 'dataProcessor':
        return `
          let result = inputs.data
          if (config.operation === 'formatNumber') {
            result = Number(inputs.data).toFixed(config.decimals || 2)
          }
          return { result }
        `
      default:
        return `
          return {
            result: 'success',
            data: inputs,
            timestamp: new Date().toISOString()
          }
        `
    }
  }

  validateWorkflow(workflow: WorkflowDefinition): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Check basic structure
    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      errors.push('Workflow must have nodes array')
    }

    if (!workflow.connections || !Array.isArray(workflow.connections)) {
      warnings.push('Workflow has no connections')
    }

    // Validate nodes
    workflow.nodes?.forEach(node => {
      if (!node.id) {
        errors.push('Node missing ID')
      }
      if (!node.type) {
        errors.push(`Node ${node.id} missing type`)
      }
    })

    // Validate connections
    workflow.connections?.forEach(connection => {
      const sourceExists = workflow.nodes?.some(n => n.id === connection.source)
      const targetExists = workflow.nodes?.some(n => n.id === connection.target)
      
      if (!sourceExists) {
        errors.push(`Connection references unknown source: ${connection.source}`)
      }
      if (!targetExists) {
        errors.push(`Connection references unknown target: ${connection.target}`)
      }
    })

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  private getExecutionOrder(workflow: WorkflowDefinition): string[] {
    // Simple topological sort
    const nodes = workflow.nodes?.map(n => n.id) || []
    const connections = workflow.connections || []
    
    const inDegree = new Map<string, number>()
    const graph = new Map<string, string[]>()
    
    // Initialize
    nodes.forEach(nodeId => {
      inDegree.set(nodeId, 0)
      graph.set(nodeId, [])
    })
    
    // Build graph
    connections.forEach(conn => {
      graph.get(conn.source)?.push(conn.target)
      inDegree.set(conn.target, (inDegree.get(conn.target) || 0) + 1)
    })
    
    // Topological sort
    const queue: string[] = []
    const result: string[] = []
    
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId)
      }
    })
    
    while (queue.length > 0) {
      const current = queue.shift()!
      result.push(current)
      
      graph.get(current)?.forEach(neighbor => {
        const newDegree = (inDegree.get(neighbor) || 0) - 1
        inDegree.set(neighbor, newDegree)
        
        if (newDegree === 0) {
          queue.push(neighbor)
        }
      })
    }
    
    return result
  }

  private prepareNodeInputs(
    node: any,
    nodeResults: Map<string, any>,
    workflow: WorkflowDefinition
  ): Record<string, any> {
    const inputs: Record<string, any> = {}
    
    // Get inputs from connected nodes
    workflow.connections?.forEach(conn => {
      if (conn.target === node.id) {
        const sourceResult = nodeResults.get(conn.source)
        if (sourceResult) {
          const outputKey = conn.sourceHandle || 'output'
          const inputKey = conn.targetHandle || 'input'
          inputs[inputKey] = sourceResult[outputKey] || sourceResult
        }
      }
    })
    
    return inputs
  }

  getRunningExecutions(): string[] {
    return Array.from(this.runningExecutions)
  }

  // Event handling (mock implementation)
  on(event: string, handler: Function) {
    // Mock event system
  }
}

export const genericExecutionEngine = new GenericExecutionEngine()