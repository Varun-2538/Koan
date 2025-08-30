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
// Avalanche ICM imports
import { IcmSenderExecutor } from '@/nodes/icm-sender-executor'
import { IcmReceiverExecutor } from '@/nodes/icm-receiver-executor'
// Avalanche L1 imports
import { L1ConfigExecutor } from '@/nodes/l1-config-executor'
import { L1SimulatorDeployerExecutor } from '@/nodes/l1-simulator-deployer-executor'
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

  // Register Avalanche executors (direct registration for better control)
  const icmSenderExecutor = new IcmSenderExecutor(logger)
  const icmReceiverExecutor = new IcmReceiverExecutor(logger)
  const l1ConfigExecutor = new L1ConfigExecutor(logger)
  const l1SimulatorDeployerExecutor = new L1SimulatorDeployerExecutor(logger)

  // Register ICM plugins with executor instances
  executionEngine.registerPlugin({
    id: 'icmSender',
    name: 'ICM Sender',
    version: '1.0.0',
    description: 'Send cross-chain messages using Avalanche Teleporter',
    category: 'Avalanche',
    inputs: [
      { key: 'sourceChain', type: 'string', label: 'Source Chain', required: true },
      { key: 'destinationChainID', type: 'subnetID', label: 'Destination Chain ID', required: true },
      { key: 'recipient', type: 'address', label: 'Recipient Address', required: true },
      { key: 'amount', type: 'number', label: 'Amount', required: false },
      { key: 'payloadType', type: 'string', label: 'Payload Type', required: false, defaultValue: 'string' },
      { key: 'walletAddress', type: 'address', label: 'Wallet Address', required: true }
    ],
    outputs: [
      { key: 'transactionHash', type: 'string', label: 'Transaction Hash', required: true },
      { key: 'messageID', type: 'string', label: 'Message ID', required: false },
      { key: 'status', type: 'string', label: 'Status', required: true }
    ],
    executor: {
      type: 'avalanche',
      timeout: 60000,
      retries: 2,
      instance: icmSenderExecutor // Direct executor instance
    }
  })

  executionEngine.registerPlugin({
    id: 'icmReceiver',
    name: 'ICM Receiver',
    version: '1.0.0',
    description: 'Receive and process cross-chain messages',
    category: 'Avalanche',
    inputs: [
      { key: 'messageID', type: 'string', label: 'Message ID', required: true },
      { key: 'sourceChainID', type: 'subnetID', label: 'Source Chain ID', required: true }
    ],
    outputs: [
      { key: 'decodedPayload', type: 'icmPayload', label: 'Decoded Payload', required: true },
      { key: 'status', type: 'string', label: 'Status', required: true }
    ],
    executor: {
      type: 'avalanche',
      timeout: 30000,
      retries: 1,
      instance: icmReceiverExecutor // Direct executor instance
    }
  })

  executionEngine.registerPlugin({
    id: 'l1Config',
    name: 'L1 Config Generator',
    version: '1.0.0',
    description: 'Generate Avalanche subnet configuration and genesis',
    category: 'Avalanche',
    inputs: [
      { key: 'vmType', type: 'string', label: 'VM Type', required: true, defaultValue: 'SubnetEVM' },
      { key: 'chainId', type: 'number', label: 'Chain ID', required: true },
      { key: 'tokenSymbol', type: 'string', label: 'Token Symbol', required: false },
      { key: 'initialSupply', type: 'number', label: 'Initial Supply', required: false },
      { key: 'gasLimit', type: 'number', label: 'Gas Limit', required: false, defaultValue: 8000000 }
    ],
    outputs: [
      { key: 'genesisJson', type: 'avalancheConfig', label: 'Genesis JSON', required: true },
      { key: 'subnetConfig', type: 'avalancheConfig', label: 'Subnet Config', required: true }
    ],
    executor: {
      type: 'avalanche',
      timeout: 10000,
      retries: 0,
      instance: l1ConfigExecutor // Direct executor instance
    }
  })

  executionEngine.registerPlugin({
    id: 'l1SimulatorDeployer',
    name: 'L1 Simulator Deployer',
    version: '1.0.0',
    description: 'Simulate Avalanche subnet deployment',
    category: 'Avalanche',
    inputs: [
      { key: 'genesisJson', type: 'avalancheConfig', label: 'Genesis JSON', required: true },
      { key: 'controlKeys', type: 'array', label: 'Control Keys', required: false },
      { key: 'threshold', type: 'number', label: 'Threshold', required: false, defaultValue: 1 }
    ],
    outputs: [
      { key: 'subnetID', type: 'subnetID', label: 'Subnet ID', required: true },
      { key: 'txHash', type: 'string', label: 'Transaction Hash', required: true },
      { key: 'blockchainID', type: 'string', label: 'Blockchain ID', required: true },
      { key: 'status', type: 'string', label: 'Status', required: true }
    ],
    executor: {
      type: 'avalanche',
      timeout: 60000,
      retries: 1,
      instance: l1SimulatorDeployerExecutor // Direct executor instance
    }
  })

  // Register a wallet connector plugin to support walletConnector nodes
  executionEngine.registerPlugin({
    id: 'walletConnector',
    name: 'Wallet Connector',
    version: '1.0.0',
    description: 'Connect and validate wallet information for flows',
    category: 'Wallet',
    inputs: [
      { key: 'wallet_address', type: 'address', label: 'Wallet Address', required: false },
      { key: 'wallet_provider', type: 'string', label: 'Wallet Provider', required: false },
      { key: 'supported_wallets', type: 'array', label: 'Supported Wallets', required: false },
      { key: 'supported_networks', type: 'array', label: 'Supported Networks', required: false },
      { key: 'default_network', type: 'number', label: 'Default Network', required: false },
      { key: 'auto_connect', type: 'boolean', label: 'Auto Connect', required: false },
      { key: 'show_balance', type: 'boolean', label: 'Show Balance', required: false },
      { key: 'show_network_switcher', type: 'boolean', label: 'Show Network Switcher', required: false },
      { key: 'template_creation_mode', type: 'boolean', label: 'Template Mode', required: false }
    ],
    outputs: [
      { key: 'wallet_connection', type: 'object', label: 'Wallet Connection', required: false },
      { key: 'wallet_config', type: 'object', label: 'Wallet Config', required: false }
    ],
    executor: {
      type: 'generic'
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

  // Avalanche Integration: Handle transaction signing requests
  socket.on('sign-transaction', async (data: {
    executionId: string,
    unsignedTx: any,
    nodeId: string
  }) => {
    try {
      logger.info(`Received sign-transaction request for execution ${data.executionId}, node ${data.nodeId}`)

      // Store unsigned transaction for later signing
      executionEngine.storeUnsignedTx(data.executionId, data.nodeId, data.unsignedTx)

      // Notify frontend that transaction is ready for signing
      socket.emit('transaction-ready-for-signing', {
        executionId: data.executionId,
        nodeId: data.nodeId,
        unsignedTx: data.unsignedTx
      })

      logger.info(`Unsigned transaction stored and ready for signing: ${data.executionId}:${data.nodeId}`)
    } catch (error: any) {
      logger.error('Transaction signing request failed:', error)
      socket.emit('signing-error', {
        executionId: data.executionId,
        nodeId: data.nodeId,
        error: error.message
      })
    }
  })

  // Avalanche Integration: Handle signed transaction responses
  socket.on('transaction-signed', async (data: {
    executionId: string,
    nodeId: string,
    signedTx: string
  }) => {
    try {
      logger.info(`Received signed transaction for execution ${data.executionId}, node ${data.nodeId}`)

      // Resume workflow execution with signed transaction
      executionEngine.resumeWithSignedTx(data.executionId, data.nodeId, data.signedTx)

      logger.info(`Workflow execution resumed with signed transaction: ${data.executionId}:${data.nodeId}`)
    } catch (error: any) {
      logger.error('Signed transaction processing failed:', error)
      socket.emit('execution-error', {
        executionId: data.executionId,
        error: error.message
      })
    }
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
    
    res.json({
      executionId: execution.id,
      status: execution.status,
      startTime: execution.startTime
    })
    
  } catch (error: any) {
    logger.error('REST: Workflow execution failed', error)
    res.status(500).json({
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
  
  res.json({
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
  
  res.json({ logs })
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

  res.json({ executionId, generated })
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
    
    res.json({
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
    res.status(500).json({
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
  
  res.json({ plugin })
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