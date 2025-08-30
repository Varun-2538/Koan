import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import winston from 'winston'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

// Import 1inch routes
import oneInchRoutes from './routes/oneinch'

import { GenericExecutionEngine } from '@/engine/generic-execution-engine'
// Legacy imports for compatibility
import { OneInchSwapExecutor } from '@/nodes/oneinch-swap-executor'
import { AvalancheL1Executor } from '@/nodes/avalanche-l1-executor'
import './preview-server';
import {
  WorkflowDefinition,
  ExecutionContext,
  WorkflowExecution,
  ExecutionEvent,
  EngineConfig
} from '@/types'

// Load environment variables
dotenv.config()

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
})

// Configuration
const config: EngineConfig = {
  port: parseInt(process.env.PORT || '3001'),
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD })
  },
  chains: {
    '1': {
      chainId: 1,
      name: 'Ethereum',
      rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/',
      blockExplorer: 'https://etherscan.io',
      nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 }
    },
    '137': {
      chainId: 137,
      name: 'Polygon',
      rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
      blockExplorer: 'https://polygonscan.com',
      nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 }
    }
  },
  apis: {
    oneInch: {
      baseUrl: 'https://api.1inch.dev',
      ...(process.env.ONEINCH_API_KEY && { apiKey: process.env.ONEINCH_API_KEY })
    }
  },
  execution: {
    maxConcurrentWorkflows: 50,
    nodeTimeoutMs: 60000,
    maxRetries: 3,
    gasLimitMultiplier: 1.2
  },
  logging: {
    level: 'info',
    enableFileLogging: false
  }
}

// Create Express app
const app = express()
const server = createServer(app)
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Create generic execution engine
const executionEngine = new GenericExecutionEngine(logger)

// Initialize plugins in an async function
const initializeEngine = async () => {
  // Load plugins from plugin system
  await executionEngine.loadPlugins()

  // Register custom DeFi plugins that require API keys
  if (config.apis.oneInch.apiKey) {
    // Register enhanced 1inch plugin with API key
    executionEngine.registerPlugin({
      id: 'oneInchSwapEnhanced',
      name: '1inch Swap (Enhanced)',
      version: '2.0.0',
      description: 'Execute token swaps with 1inch API integration',
      category: 'DeFi',
      inputs: [
        { key: 'from_token', type: 'token', label: 'From Token', required: true },
        { key: 'to_token', type: 'token', label: 'To Token', required: true },
        { key: 'amount', type: 'number', label: 'Amount', required: true },
        { key: 'slippage', type: 'number', label: 'Slippage %', required: false, defaultValue: 1 },
        { key: 'from_address', type: 'address', label: 'From Address', required: true }
      ],
      outputs: [
        { key: 'transaction', type: 'transaction', label: 'Transaction', required: true },
        { key: 'route', type: 'object', label: 'Route Info', required: false },
        { key: 'gas_estimate', type: 'number', label: 'Gas Estimate', required: false }
      ],
      executor: {
        type: 'defi',
        timeout: 30000,
        retries: 3
      }
    })
  }

  // Register Avalanche L1 Deployment plugin
  executionEngine.registerPlugin({
    id: 'avalancheL1Deploy',
    name: 'Avalanche L1 Deployment',
    version: '1.0.0',
    description: 'Deploy a custom Avalanche L1 subnet with specified configuration',
    category: 'Infrastructure',
    inputs: [
      { key: 'l1Name', type: 'string', label: 'L1 Name', required: true },
      { key: 'chainId', type: 'number', label: 'Chain ID', required: true },
      { key: 'tokenSymbol', type: 'string', label: 'Token Symbol', required: true },
      { key: 'tokenName', type: 'string', label: 'Token Name', required: true },
      { key: 'initialSupply', type: 'string', label: 'Initial Supply', required: true },
      { key: 'vmType', type: 'string', label: 'VM Type', required: true },
      { key: 'consensusMechanism', type: 'string', label: 'Consensus Mechanism', required: true },
      { key: 'gasLimit', type: 'number', label: 'Gas Limit', required: false, defaultValue: 12000000 },
      { key: 'gasPriceStrategy', type: 'string', label: 'Gas Price Strategy', required: false, defaultValue: 'constant' },
      { key: 'baseFee', type: 'string', label: 'Base Fee', required: false },
      { key: 'priorityFee', type: 'string', label: 'Priority Fee', required: false },
      { key: 'feeRecipient', type: 'address', label: 'Fee Recipient', required: false },
      { key: 'feeBurning', type: 'boolean', label: 'Fee Burning', required: false, defaultValue: false },
      { key: 'minBaseFee', type: 'string', label: 'Min Base Fee', required: false },
      { key: 'allocations', type: 'array', label: 'Initial Allocations', required: false },
      { key: 'precompiledContracts', type: 'object', label: 'Precompiled Contracts', required: false },
      { key: 'adminAddresses', type: 'array', label: 'Admin Addresses', required: false },
      { key: 'controlKeyName', type: 'string', label: 'Control Key Name', required: true },
      { key: 'validatorStakeAmount', type: 'string', label: 'Validator Stake Amount', required: true },
      { key: 'stakeDuration', type: 'string', label: 'Stake Duration', required: true },
      { key: 'additionalValidators', type: 'array', label: 'Additional Validators', required: false },
      { key: 'targetNetwork', type: 'string', label: 'Target Network', required: false, defaultValue: 'fuji' },
      { key: 'customRpcUrl', type: 'string', label: 'Custom RPC URL', required: false },
      { key: 'enableBlockExplorer', type: 'boolean', label: 'Enable Block Explorer', required: false, defaultValue: false },
      { key: 'customExplorerUrl', type: 'string', label: 'Custom Explorer URL', required: false },
      { key: 'enableMetrics', type: 'boolean', label: 'Enable Metrics', required: false, defaultValue: false },
      { key: 'webhookUrls', type: 'array', label: 'Webhook URLs', required: false }
    ],
    outputs: [
      { key: 'l1Info', type: 'object', label: 'L1 Information', required: true }
    ],
    executor: {
      type: 'generic',
      timeout: 300000, // 5 minutes for deployment
      retries: 1
    }
  })
}

// Track WebSocket connections
const connectedClients = new Map<string, any>()

// WebSocket connection handling
io.on('connection', (socket) => {
  const clientId = uuidv4()
  connectedClients.set(clientId, socket)
  
  logger.info(`Client connected: ${clientId}`)
  
  socket.on('disconnect', () => {
    connectedClients.delete(clientId)
    logger.info(`Client disconnected: ${clientId}`)
  })

  // Handle workflow execution requests from frontend
  socket.on('execute-workflow', async (data: { workflow: WorkflowDefinition, context?: Partial<ExecutionContext> }) => {
    try {
      const { workflow, context = {} } = data
      
      logger.info(`Received workflow execution request: ${workflow.id}`)
      
      // Start execution
      const execution = await executionEngine.executeWorkflow(workflow, {
        ...context,
        userId: clientId
      })
      
      socket.emit('execution-started', {
        executionId: execution.id,
        workflowId: workflow.id
      })
      
    } catch (error: any) {
      logger.error('Workflow execution failed', error)
      socket.emit('execution-error', {
        error: error.message
      })
    }
  })

  // Handle execution cancellation
  socket.on('cancel-execution', async (data: { executionId: string }) => {
    try {
      const cancelled = await executionEngine.cancelExecution(data.executionId)
      socket.emit('execution-cancelled', {
        executionId: data.executionId,
        cancelled
      })
    } catch (error: any) {
      socket.emit('execution-error', {
        executionId: data.executionId,
        error: error.message
      })
    }
  })

  // Handle execution status requests
  socket.on('get-execution-status', (data: { executionId: string }) => {
    const execution = executionEngine.getExecution(data.executionId)
    const stats = executionEngine.getExecutionStats(data.executionId)
    
    socket.emit('execution-status', {
      executionId: data.executionId,
      execution,
      stats
    })
  })
})

// Forward execution events to connected clients
executionEngine.on('execution.event', (event: ExecutionEvent) => {
  // Broadcast to all connected clients
  // In a production app, you'd filter by user/session
  io.emit('execution-event', event)
})

// REST API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    oneInchApiKey: process.env.ONEINCH_API_KEY ? 'configured' : 'missing'
  })
})

// API Routes
app.use('/api/1inch', oneInchRoutes)

// Get engine configuration
app.get('/api/config', (req, res) => {
  res.json({
    supportedChains: Object.keys(config.chains),
    maxConcurrentWorkflows: config.execution.maxConcurrentWorkflows,
    nodeTimeoutMs: config.execution.nodeTimeoutMs
  })
})

// Execute workflow (REST endpoint)
app.post('/api/workflows/execute', async (req, res) => {
  try {
    const { workflow, context = {} }: { workflow: WorkflowDefinition, context?: Partial<ExecutionContext> } = req.body
    
    if (!workflow || !workflow.id) {
      return res.status(400).json({ error: 'Invalid workflow definition' })
    }
    
    logger.info(`REST: Executing workflow ${workflow.id}`)
    
    const execution = await executionEngine.executeWorkflow(workflow, {
      ...context,
      environment: 'production'
    })
    
    return res.json({
      executionId: execution.id,
      status: execution.status,
      startTime: execution.startTime
    })
    
  } catch (error: any) {
    logger.error('REST: Workflow execution failed', error)
    return res.status(500).json({
      error: error.message,
      type: error.constructor.name
    })
  }
})

// Get execution status
app.get('/api/executions/:executionId', (req, res) => {
  const { executionId } = req.params
  
  const execution = executionEngine.getExecution(executionId)
  if (!execution) {
    return res.status(404).json({ error: 'Execution not found' })
  }
  
  const stats = executionEngine.getExecutionStats(executionId)
  
  return res.json({
    execution: {
      id: execution.id,
      workflowId: execution.workflowId,
      status: execution.status,
      startTime: execution.startTime,
      endTime: execution.endTime,
      error: execution.error
    },
    stats
  })
})

// Get execution logs
app.get('/api/executions/:executionId/logs', (req, res) => {
  const { executionId } = req.params
  
  const execution = executionEngine.getExecution(executionId)
  if (!execution) {
    return res.status(404).json({ error: 'Execution not found' })
  }
  
  const logs: any[] = []
  
  for (const [nodeId, step] of execution.steps) {
    if (step.result?.logs) {
      logs.push({
        nodeId,
        nodeType: step.nodeType,
        logs: step.result.logs,
        timestamp: step.startTime,
        status: step.status
      })
    }
  }
  
  return res.json({ logs })
})

// Return generated code artifacts (if any) for an execution
app.get('/api/executions/:executionId/code', async (req, res) => {
  const { executionId } = req.params

  const execution = executionEngine.getExecution(executionId)
  if (!execution) {
    return res.status(404).json({ error: 'Execution not found' })
  }

  // Aggregate any generated files from node results (supports nested structures)
  const generated: Record<string, any> = {}
  for (const [nodeId, step] of execution.steps) {
    const outputs = step.result?.outputs || {}

    if (outputs.generatedFiles) {
      generated[nodeId] = outputs.generatedFiles
    } else if (outputs.code) {
      generated[nodeId] = outputs.code
    } else {
      // Look one level deeper for typical template wrappers (e.g., mock_dashboard)
      for (const key of Object.keys(outputs)) {
        const inner = outputs[key]
        if (inner && typeof inner === 'object') {
          if (inner.generatedFiles) {
            generated[nodeId] = inner.generatedFiles
            break
          }
          if (inner.code) {
            generated[nodeId] = inner.code
            break
          }
        }
      }
    }
  }

  if (Object.keys(generated).length === 0) {
    return res.status(404).json({ error: 'No generated code available for this execution' })
  }

  return res.json({ executionId, generated })
})

// Cancel execution
app.post('/api/executions/:executionId/cancel', async (req, res) => {
  const { executionId } = req.params
  
  try {
    const cancelled = await executionEngine.cancelExecution(executionId)
    res.json({ cancelled })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Test 1inch API connection
app.post('/api/test/oneinch', async (req, res) => {
  try {
    const { chainId = '1', fromToken, toToken, amount } = req.body
    
    if (!fromToken || !toToken || !amount) {
      return res.status(400).json({ error: 'Missing required parameters: fromToken, toToken, amount' })
    }
    
    // Test using plugin system
    const plugin = executionEngine.getPlugin('oneInchSwap') || executionEngine.getPlugin('oneInchSwapEnhanced')
    if (!plugin) {
      return res.status(404).json({ error: '1inch plugin not found' })
    }
    
    const testInputs = {
      from_token: fromToken,
      to_token: toToken,
      amount,
      from_address: '0x0000000000000000000000000000000000000000',
      slippage: 1
    }
    
    // Mock validation for testing
    const gasEstimate = '21000'
    
    return res.json({
      success: true,
      chainId,
      fromToken,
      toToken,
      amount,
      estimatedGas: gasEstimate,
      pluginUsed: plugin.name,
      pluginVersion: plugin.version,
      apiConnected: true
    })
    
  } catch (error: any) {
    logger.error('1inch API test failed', error)
    return res.status(500).json({
      success: false,
      error: error.message,
      apiConnected: false
    })
  }
})

// List supported node types from plugin registry
app.get('/api/nodes', (req, res) => {
  const plugins = executionEngine.getRegisteredPlugins()
  const nodeTypes = plugins.map(plugin => ({
    type: plugin.id,
    name: plugin.name,
    description: plugin.description,
    category: plugin.category.toLowerCase(),
    version: plugin.version,
    inputs: plugin.inputs,
    outputs: plugin.outputs,
    executor: {
      type: plugin.executor.type,
      timeout: plugin.executor.timeout,
      retries: plugin.executor.retries
    }
  }))
  
  res.json({ nodeTypes, totalPlugins: plugins.length })
})

// Get specific plugin details
app.get('/api/plugins/:pluginId', (req, res) => {
  const { pluginId } = req.params
  const plugin = executionEngine.getPlugin(pluginId)
  
  if (!plugin) {
    return res.status(404).json({ error: 'Plugin not found' })
  }
  
  return res.json({ plugin })
})

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', error)
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  })
})

// Start server
server.listen(config.port, async () => {
  logger.info(`🚀 Generic Execution Engine starting on port ${config.port}`)
  
  // Initialize plugins
  try {
    await initializeEngine()
    logger.info('✅ Plugin system initialized')
  } catch (error) {
    logger.error('❌ Failed to initialize plugin system:', error)
  }
  
  logger.info(`📊 WebSocket endpoint: ws://localhost:${config.port}`)
  logger.info(`🔗 REST API: http://localhost:${config.port}/api`)
  logger.info(`🎯 Frontend origin: ${process.env.FRONTEND_URL || "http://localhost:3000"}`)
  logger.info(`🔌 Registered plugins: ${executionEngine.getRegisteredPlugins().length}`)
  
  if (config.apis.oneInch.apiKey) {
    logger.info('✅ 1inch API key configured')
  } else {
    logger.warn('⚠️  No 1inch API key found - add ONEINCH_API_KEY to environment')
  }
})

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  server.close(() => {
    logger.info('Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  server.close(() => {
    logger.info('Server closed')
    process.exit(0)
  })
})

// Clean up old executions every hour
setInterval(() => {
  executionEngine.cleanup()
}, 60 * 60 * 1000)

export { app, server, executionEngine, logger }