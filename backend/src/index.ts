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

import { DeFiExecutionEngine } from '@/engine/execution-engine'
import { OneInchSwapExecutor } from '@/nodes/oneinch-swap-executor'
import { FusionPlusExecutor } from './nodes/fusion-plus-executor';
import { ChainSelectorExecutor } from './nodes/chain-selector-executor';
import { WalletConnectorExecutor } from './nodes/wallet-connector-executor';
import { TransactionStatusExecutor } from './nodes/transaction-status-executor';
import { ERC20TokenExecutor } from './nodes/erc20-token-executor';
import { TokenSelectorExecutor } from './nodes/token-selector-executor';
import { PriceImpactCalculatorExecutor } from './nodes/price-impact-calculator-executor';
import { TransactionMonitorExecutor } from './nodes/transaction-monitor-executor';
import { PortfolioAPIExecutor } from './nodes/portfolio-api-executor';
import { OneInchQuoteExecutor } from './nodes/oneinch-quote-executor';
import { FusionSwapExecutor } from './nodes/fusion-swap-executor';
import { LimitOrderExecutor } from './nodes/limit-order-executor';
import { DeFiDashboardExecutor } from './nodes/defi-dashboard-executor';
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
    password: process.env.REDIS_PASSWORD
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
      apiKey: process.env.ONEINCH_API_KEY
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

// Create execution engine
const executionEngine = new DeFiExecutionEngine(logger)

// Register node executors
executionEngine.registerNodeExecutor(new OneInchSwapExecutor(logger, config.apis.oneInch.apiKey))
executionEngine.registerNodeExecutor(new FusionPlusExecutor())
executionEngine.registerNodeExecutor(new ChainSelectorExecutor())
executionEngine.registerNodeExecutor(new WalletConnectorExecutor())
executionEngine.registerNodeExecutor(new TransactionStatusExecutor())
executionEngine.registerNodeExecutor(new ERC20TokenExecutor())
executionEngine.registerNodeExecutor(new TokenSelectorExecutor())
executionEngine.registerNodeExecutor(new PriceImpactCalculatorExecutor())
executionEngine.registerNodeExecutor(new TransactionMonitorExecutor())
executionEngine.registerNodeExecutor(new PortfolioAPIExecutor(logger))
executionEngine.registerNodeExecutor(new OneInchQuoteExecutor(logger, config.apis.oneInch.apiKey))
executionEngine.registerNodeExecutor(new FusionSwapExecutor(logger, config.apis.oneInch.apiKey))
executionEngine.registerNodeExecutor(new LimitOrderExecutor(logger, config.apis.oneInch.apiKey))
executionEngine.registerNodeExecutor(new DeFiDashboardExecutor(logger))

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
app.get('/health', (req, res) => {
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
    
    const oneInchExecutor = new OneInchSwapExecutor(logger, config.apis.oneInch.apiKey)
    
    const testInputs = {
      api_key: config.apis.oneInch.apiKey,
      chain_id: chainId,
      from_token: fromToken,
      to_token: toToken,
      amount,
      from_address: '0x0000000000000000000000000000000000000000',
      slippage: 1
    }
    
    const validation = await oneInchExecutor.validate(testInputs)
    if (!validation.valid) {
      return res.status(400).json({ error: 'Validation failed', errors: validation.errors })
    }
    
    const gasEstimate = await oneInchExecutor.estimateGas(testInputs, {
      workflowId: 'test',
      executionId: 'test',
      environment: 'test',
      startTime: Date.now(),
      variables: {},
      secrets: {}
    })
    
    res.json({
      success: true,
      chainId,
      fromToken,
      toToken,
      amount,
      estimatedGas: gasEstimate,
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

// List supported node types
app.get('/api/nodes', (req, res) => {
  const nodeTypes = [
    {
      type: 'oneInchSwap',
      name: '1inch Swap',
      description: 'Execute token swaps using 1inch Pathfinder algorithm',
      category: 'defi',
      tags: ['1inch', 'swap', 'pathfinder', 'mev-protection']
    },
    {
      type: 'fusionPlus',
      name: 'Fusion+ Cross-Chain',
      description: 'Cross-chain swaps with MEV protection and gasless options',
      category: 'bridge',
      tags: ['1inch', 'fusion', 'cross-chain', 'mev-protection', 'gasless']
    },
    {
      type: 'chainSelector',
      name: 'Chain Selector',
      description: 'Select and validate blockchain networks',
      category: 'infrastructure',
      tags: ['chains', 'validation', 'multi-chain']
    },
    {
      type: 'walletConnector',
      name: 'Wallet Connector',
      description: 'Connect and authenticate with crypto wallets',
      category: 'infrastructure',
      tags: ['wallet', 'authentication', 'balance', 'tokens']
    },
    {
      type: 'transactionStatus',
      name: 'Transaction Monitor',
      description: 'Monitor transaction status and confirmations',
      category: 'infrastructure',
      tags: ['transaction', 'monitoring', 'confirmations', 'gas-analysis']
    }
  ]
  
  res.json({ nodeTypes })
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
server.listen(config.port, () => {
  logger.info(`🚀 DeFi Execution Engine started on port ${config.port}`)
  logger.info(`📊 WebSocket endpoint: ws://localhost:${config.port}`)
  logger.info(`🔗 REST API: http://localhost:${config.port}/api`)
  logger.info(`🎯 Frontend origin: ${process.env.FRONTEND_URL || "http://localhost:3000"}`)
  
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