"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.executionEngine = exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const winston_1 = __importDefault(require("winston"));
const dotenv_1 = __importDefault(require("dotenv"));
const uuid_1 = require("uuid");
const execution_engine_1 = require("@/engine/execution-engine");
const oneinch_swap_executor_1 = require("@/nodes/oneinch-swap-executor");
const fusion_plus_executor_1 = require("./nodes/fusion-plus-executor");
const chain_selector_executor_1 = require("./nodes/chain-selector-executor");
const wallet_connector_executor_1 = require("./nodes/wallet-connector-executor");
const transaction_status_executor_1 = require("./nodes/transaction-status-executor");
const erc20_token_executor_1 = require("./nodes/erc20-token-executor");
const token_selector_executor_1 = require("./nodes/token-selector-executor");
const price_impact_calculator_executor_1 = require("./nodes/price-impact-calculator-executor");
const transaction_monitor_executor_1 = require("./nodes/transaction-monitor-executor");
const portfolio_api_executor_1 = require("./nodes/portfolio-api-executor");
// Load environment variables
dotenv_1.default.config();
// Create logger
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
        })
    ]
});
exports.logger = logger;
// Configuration
const config = {
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
};
// Create Express app
const app = (0, express_1.default)();
exports.app = app;
const server = (0, http_1.createServer)(app);
exports.server = server;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Create execution engine
const executionEngine = new execution_engine_1.DeFiExecutionEngine(logger);
exports.executionEngine = executionEngine;
// Register node executors
executionEngine.registerNodeExecutor(new oneinch_swap_executor_1.OneInchSwapExecutor(logger, config.apis.oneInch.apiKey));
executionEngine.registerNodeExecutor(new fusion_plus_executor_1.FusionPlusExecutor());
executionEngine.registerNodeExecutor(new chain_selector_executor_1.ChainSelectorExecutor());
executionEngine.registerNodeExecutor(new wallet_connector_executor_1.WalletConnectorExecutor());
executionEngine.registerNodeExecutor(new transaction_status_executor_1.TransactionStatusExecutor());
executionEngine.registerNodeExecutor(new erc20_token_executor_1.ERC20TokenExecutor());
executionEngine.registerNodeExecutor(new token_selector_executor_1.TokenSelectorExecutor());
executionEngine.registerNodeExecutor(new price_impact_calculator_executor_1.PriceImpactCalculatorExecutor());
executionEngine.registerNodeExecutor(new transaction_monitor_executor_1.TransactionMonitorExecutor());
executionEngine.registerNodeExecutor(new portfolio_api_executor_1.PortfolioAPIExecutor(logger));
// Track WebSocket connections
const connectedClients = new Map();
// WebSocket connection handling
io.on('connection', (socket) => {
    const clientId = (0, uuid_1.v4)();
    connectedClients.set(clientId, socket);
    logger.info(`Client connected: ${clientId}`);
    socket.on('disconnect', () => {
        connectedClients.delete(clientId);
        logger.info(`Client disconnected: ${clientId}`);
    });
    // Handle workflow execution requests from frontend
    socket.on('execute-workflow', async (data) => {
        try {
            const { workflow, context = {} } = data;
            logger.info(`Received workflow execution request: ${workflow.id}`);
            // Start execution
            const execution = await executionEngine.executeWorkflow(workflow, {
                ...context,
                userId: clientId
            });
            socket.emit('execution-started', {
                executionId: execution.id,
                workflowId: workflow.id
            });
        }
        catch (error) {
            logger.error('Workflow execution failed', error);
            socket.emit('execution-error', {
                error: error.message
            });
        }
    });
    // Handle execution cancellation
    socket.on('cancel-execution', async (data) => {
        try {
            const cancelled = await executionEngine.cancelExecution(data.executionId);
            socket.emit('execution-cancelled', {
                executionId: data.executionId,
                cancelled
            });
        }
        catch (error) {
            socket.emit('execution-error', {
                executionId: data.executionId,
                error: error.message
            });
        }
    });
    // Handle execution status requests
    socket.on('get-execution-status', (data) => {
        const execution = executionEngine.getExecution(data.executionId);
        const stats = executionEngine.getExecutionStats(data.executionId);
        socket.emit('execution-status', {
            executionId: data.executionId,
            execution,
            stats
        });
    });
});
// Forward execution events to connected clients
executionEngine.on('execution.event', (event) => {
    // Broadcast to all connected clients
    // In a production app, you'd filter by user/session
    io.emit('execution-event', event);
});
// REST API Routes
// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: process.uptime()
    });
});
// Get engine configuration
app.get('/api/config', (req, res) => {
    res.json({
        supportedChains: Object.keys(config.chains),
        maxConcurrentWorkflows: config.execution.maxConcurrentWorkflows,
        nodeTimeoutMs: config.execution.nodeTimeoutMs
    });
});
// Execute workflow (REST endpoint)
app.post('/api/workflows/execute', async (req, res) => {
    try {
        const { workflow, context = {} } = req.body;
        if (!workflow || !workflow.id) {
            return res.status(400).json({ error: 'Invalid workflow definition' });
        }
        logger.info(`REST: Executing workflow ${workflow.id}`);
        const execution = await executionEngine.executeWorkflow(workflow, {
            ...context,
            environment: 'production'
        });
        res.json({
            executionId: execution.id,
            status: execution.status,
            startTime: execution.startTime
        });
    }
    catch (error) {
        logger.error('REST: Workflow execution failed', error);
        res.status(500).json({
            error: error.message,
            type: error.constructor.name
        });
    }
});
// Get execution status
app.get('/api/executions/:executionId', (req, res) => {
    const { executionId } = req.params;
    const execution = executionEngine.getExecution(executionId);
    if (!execution) {
        return res.status(404).json({ error: 'Execution not found' });
    }
    const stats = executionEngine.getExecutionStats(executionId);
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
    });
});
// Get execution logs
app.get('/api/executions/:executionId/logs', (req, res) => {
    const { executionId } = req.params;
    const execution = executionEngine.getExecution(executionId);
    if (!execution) {
        return res.status(404).json({ error: 'Execution not found' });
    }
    const logs = [];
    for (const [nodeId, step] of execution.steps) {
        if (step.result?.logs) {
            logs.push({
                nodeId,
                nodeType: step.nodeType,
                logs: step.result.logs,
                timestamp: step.startTime,
                status: step.status
            });
        }
    }
    res.json({ logs });
});
// Cancel execution
app.post('/api/executions/:executionId/cancel', async (req, res) => {
    const { executionId } = req.params;
    try {
        const cancelled = await executionEngine.cancelExecution(executionId);
        res.json({ cancelled });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Test 1inch API connection
app.post('/api/test/oneinch', async (req, res) => {
    try {
        const { chainId = '1', fromToken, toToken, amount } = req.body;
        if (!fromToken || !toToken || !amount) {
            return res.status(400).json({ error: 'Missing required parameters: fromToken, toToken, amount' });
        }
        const oneInchExecutor = new oneinch_swap_executor_1.OneInchSwapExecutor(logger, config.apis.oneInch.apiKey);
        const testInputs = {
            api_key: config.apis.oneInch.apiKey,
            chain_id: chainId,
            from_token: fromToken,
            to_token: toToken,
            amount,
            from_address: '0x0000000000000000000000000000000000000000',
            slippage: 1
        };
        const validation = await oneInchExecutor.validate(testInputs);
        if (!validation.valid) {
            return res.status(400).json({ error: 'Validation failed', errors: validation.errors });
        }
        const gasEstimate = await oneInchExecutor.estimateGas(testInputs, {
            workflowId: 'test',
            executionId: 'test',
            environment: 'test',
            startTime: Date.now(),
            variables: {},
            secrets: {}
        });
        res.json({
            success: true,
            chainId,
            fromToken,
            toToken,
            amount,
            estimatedGas: gasEstimate,
            apiConnected: true
        });
    }
    catch (error) {
        logger.error('1inch API test failed', error);
        res.status(500).json({
            success: false,
            error: error.message,
            apiConnected: false
        });
    }
});
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
    ];
    res.json({ nodeTypes });
});
// Error handling middleware
app.use((error, req, res, next) => {
    logger.error('Unhandled error', error);
    res.status(500).json({
        error: 'Internal server error',
        message: error.message
    });
});
// Start server
server.listen(config.port, () => {
    logger.info(`🚀 DeFi Execution Engine started on port ${config.port}`);
    logger.info(`📊 WebSocket endpoint: ws://localhost:${config.port}`);
    logger.info(`🔗 REST API: http://localhost:${config.port}/api`);
    logger.info(`🎯 Frontend origin: ${process.env.FRONTEND_URL || "http://localhost:3000"}`);
    if (config.apis.oneInch.apiKey) {
        logger.info('✅ 1inch API key configured');
    }
    else {
        logger.warn('⚠️  No 1inch API key found - add ONEINCH_API_KEY to environment');
    }
});
// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});
// Clean up old executions every hour
setInterval(() => {
    executionEngine.cleanup();
}, 60 * 60 * 1000);
//# sourceMappingURL=index.js.map