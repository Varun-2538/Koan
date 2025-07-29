// Frontend client for connecting to the DeFi execution engine
import { io, Socket } from 'socket.io-client'

export interface WorkflowDefinition {
  id: string
  name: string
  description?: string
  nodes: Array<{
    id: string
    type: string
    position: { x: number; y: number }
    data: {
      label: string
      config: Record<string, any>
    }
  }>
  edges: Array<{
    id: string
    source: string
    target: string
    sourceHandle?: string
    targetHandle?: string
  }>
}

export interface ExecutionEvent {
  type: 'execution.started' | 'execution.progress' | 'execution.completed' | 'execution.failed' | 'node.started' | 'node.completed' | 'node.failed'
  executionId: string
  timestamp: number
  data: any
}

export class ExecutionClient {
  private socket: Socket | null = null
  private baseUrl: string
  private eventHandlers: Map<string, Function[]> = new Map()

  constructor(baseUrl: string = 'http://localhost:3001') {
    this.baseUrl = baseUrl
  }

  /**
   * Connect to the execution engine
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(this.baseUrl, {
        transports: ['websocket', 'polling']
      })

      this.socket.on('connect', () => {
        console.log('✅ Connected to DeFi execution engine')
        resolve()
      })

      this.socket.on('connect_error', (error) => {
        console.error('❌ Failed to connect to execution engine:', error)
        reject(error)
      })

      this.socket.on('execution-started', (data) => {
        this.emit('execution.started', data)
      })

      this.socket.on('execution-event', (event: ExecutionEvent) => {
        this.emit(event.type, event)
      })

      this.socket.on('execution-error', (data) => {
        this.emit('execution.failed', data)
      })

      this.socket.on('execution-cancelled', (data) => {
        this.emit('execution.cancelled', data)
      })
    })
  }

  /**
   * Disconnect from the execution engine
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflow: WorkflowDefinition, context?: Record<string, any>): Promise<string> {
    if (!this.socket) {
      throw new Error('Not connected to execution engine')
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Execution request timeout'))
      }, 10000)

      this.socket!.once('execution-started', (data) => {
        clearTimeout(timeout)
        resolve(data.executionId)
      })

      this.socket!.once('execution-error', (data) => {
        clearTimeout(timeout)
        reject(new Error(data.error))
      })

      this.socket!.emit('execute-workflow', { workflow, context })
    })
  }

  /**
   * Cancel a running execution
   */
  async cancelExecution(executionId: string): Promise<boolean> {
    if (!this.socket) {
      throw new Error('Not connected to execution engine')
    }

    return new Promise((resolve) => {
      this.socket!.once('execution-cancelled', (data) => {
        resolve(data.cancelled)
      })

      this.socket!.emit('cancel-execution', { executionId })
    })
  }

  /**
   * Get execution status
   */
  async getExecutionStatus(executionId: string): Promise<any> {
    if (!this.socket) {
      throw new Error('Not connected to execution engine')
    }

    return new Promise((resolve) => {
      this.socket!.once('execution-status', (data) => {
        resolve(data)
      })

      this.socket!.emit('get-execution-status', { executionId })
    })
  }

  /**
   * Add event listener
   */
  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event)!.push(handler)
  }

  /**
   * Remove event listener
   */
  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  /**
   * Emit event to handlers
   */
  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach(handler => handler(data))
    }
  }

  /**
   * Test the connection with a simple workflow
   */
  async testConnection(): Promise<boolean> {
    try {
      const testWorkflow: WorkflowDefinition = {
        id: `test-workflow-${Date.now()}`,
        name: 'Connection Test',
        description: 'Testing connection to execution engine',
        nodes: [
          {
            id: 'test-node-1',
            type: 'oneInchSwap',
            position: { x: 100, y: 100 },
            data: {
              label: '1inch Swap Test',
              config: {
                chain_id: '1',
                from_token: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
                to_token: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
                amount: '1000000000000000000',
                from_address: '0x742d35Cc6354C88532f3Bf5fDeEb94B16D1B8d36',
                slippage: 1
              }
            }
          }
        ],
        edges: []
      }

      await this.executeWorkflow(testWorkflow)
      return true
    } catch (error) {
      console.error('Connection test failed:', error)
      return false
    }
  }

  /**
   * REST API methods for direct HTTP calls
   */
  async healthCheck(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/health`)
    return response.json()
  }

  async getConfig(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/config`)
    return response.json()
  }

  async getNodes(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/nodes`)
    return response.json()
  }

  async testOneInch(params: {
    chainId?: string
    fromToken: string
    toToken: string
    amount: string
  }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/test/oneinch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    })
    return response.json()
  }
}

// Global execution client instance
export const executionClient = new ExecutionClient()

// Auto-connect when imported (can be disabled if needed)
if (typeof window !== 'undefined') {
  executionClient.connect().catch(console.error)
}

// Helper function for quick testing in browser console
declare global {
  interface Window {
    testExecutionEngine?: () => Promise<void>
  }
}

if (typeof window !== 'undefined') {
  window.testExecutionEngine = async () => {
    console.log('🧪 Testing DeFi Execution Engine...')
    
    try {
      // Test health
      const health = await executionClient.healthCheck()
      console.log('✅ Health check:', health)
      
      // Test nodes
      const nodes = await executionClient.getNodes()
      console.log('✅ Available nodes:', nodes)
      
      // Test 1inch (will fail without API key, but that's expected)
      const oneInchTest = await executionClient.testOneInch({
        chainId: '1',
        fromToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        toToken: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        amount: '1000000000000000000'
      })
      console.log('🔄 1inch test:', oneInchTest)
      
      // Test workflow execution
      const testPassed = await executionClient.testConnection()
      console.log(testPassed ? '✅ Workflow execution test passed' : '❌ Workflow execution test failed')
      
      console.log('🎉 Testing complete!')
      
    } catch (error) {
      console.error('❌ Testing failed:', error)
    }
  }
  
  console.log('💡 Run window.testExecutionEngine() in console to test the execution engine!')
}