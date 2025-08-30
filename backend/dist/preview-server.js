"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class PreviewServerManager {
    instances = new Map();
    basePort = 3003; // Changed from 3001 to avoid conflict with main backend
    constructor() {
        this.setupRoutes();
    }
    setupRoutes() {
        const app = (0, express_1.default)();
        const server = (0, http_1.createServer)(app);
        const io = new socket_io_1.Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        app.use((0, cors_1.default)({
            origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3004'],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
        }));
        app.use(express_1.default.json());
        // Add security headers for iframe compatibility
        app.use((req, res, next) => {
            res.setHeader('X-Frame-Options', 'SAMEORIGIN');
            res.setHeader('Content-Security-Policy', "frame-ancestors 'self' http://localhost:3000 http://localhost:3001 http://localhost:3002 http://localhost:3004");
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
            next();
        });
        // Start preview instance
        app.post('/api/preview/start', async (req, res) => {
            try {
                const { projectName, config, codeResult } = req.body;
                if (!projectName || !config || !codeResult) {
                    return res.status(400).json({ error: 'Missing required parameters' });
                }
                const instanceId = `${projectName}-${Date.now()}`;
                const port = this.getNextAvailablePort();
                const instance = {
                    id: instanceId,
                    port,
                    process: null,
                    config,
                    status: 'starting',
                    logs: []
                };
                this.instances.set(instanceId, instance);
                // Start the preview server
                await this.startPreviewInstance(instance, codeResult);
                res.json({
                    instanceId,
                    port,
                    previewUrl: `http://localhost:${port}`
                });
            }
            catch (error) {
                console.error('Failed to start preview:', error);
                res.status(500).json({ error: error.message });
            }
        });
        // Stop preview instance
        app.post('/api/preview/stop', async (req, res) => {
            try {
                const { instanceId } = req.body;
                if (!instanceId) {
                    return res.status(400).json({ error: 'Instance ID required' });
                }
                await this.stopPreviewInstance(instanceId);
                res.json({ success: true });
            }
            catch (error) {
                console.error('Failed to stop preview:', error);
                res.status(500).json({ error: error.message });
            }
        });
        // Get preview status
        app.get('/api/preview/status/:instanceId', (req, res) => {
            const { instanceId } = req.params;
            const instance = this.instances.get(instanceId);
            if (!instance) {
                return res.status(404).json({ error: 'Instance not found' });
            }
            res.json({
                id: instance.id,
                port: instance.port,
                status: instance.status,
                logs: instance.logs,
                previewUrl: `http://localhost:${instance.port}`
            });
        });
        // Proxy requests to preview instances
        app.use('/preview/:instanceId/*', (req, res) => {
            const { instanceId } = req.params;
            const instance = this.instances.get(instanceId);
            if (!instance || instance.status !== 'running') {
                return res.status(404).json({ error: 'Preview not available' });
            }
            // Proxy the request to the preview instance
            const targetUrl = `http://localhost:${instance.port}${req.url.replace(`/preview/${instanceId}`, '')}`;
            // For now, just redirect to the actual preview URL
            res.redirect(targetUrl);
        });
        // Socket.IO for real-time logs
        io.on('connection', (socket) => {
            console.log('Preview client connected');
            socket.on('subscribe-logs', (instanceId) => {
                const instance = this.instances.get(instanceId);
                if (instance) {
                    socket.join(`logs-${instanceId}`);
                }
            });
            socket.on('disconnect', () => {
                console.log('Preview client disconnected');
            });
        });
        const PORT = process.env.PREVIEW_SERVER_PORT || 3004;
        server.listen(PORT, () => {
            console.log(`Preview server running on port ${PORT}`);
        });
    }
    getNextAvailablePort() {
        const usedPorts = Array.from(this.instances.values()).map(i => i.port);
        const reservedPorts = [3000, 3001, 3002, 3004]; // Reserved for main services
        let port = this.basePort;
        // Find next available port, skipping reserved ports
        while (usedPorts.includes(port) || reservedPorts.includes(port)) {
            port++;
            // Safety check to prevent infinite loop
            if (port > 3010) {
                throw new Error('No available ports found for preview server');
            }
        }
        return port;
    }
    async startPreviewInstance(instance, codeResult) {
        try {
            // Check if port is available
            const isPortAvailable = await this.checkPortAvailability(instance.port);
            if (!isPortAvailable) {
                throw new Error(`Port ${instance.port} is not available. Please try again.`);
            }
            // Create temporary directory for the preview
            const tempDir = path_1.default.join(process.cwd(), 'temp', instance.id);
            await fs_1.default.promises.mkdir(tempDir, { recursive: true });
            // Write generated files
            await this.writeGeneratedFiles(tempDir, codeResult, instance.config);
            // Inject multi-chain configuration
            await this.injectMultiChainConfig(tempDir, instance.config);
            // Check if node_modules already exists and package-lock.json exists
            const nodeModulesPath = path_1.default.join(tempDir, 'node_modules');
            const packageLockPath = path_1.default.join(tempDir, 'package-lock.json');
            const hasNodeModules = await fs_1.default.promises.access(nodeModulesPath).then(() => true).catch(() => false);
            const hasPackageLock = await fs_1.default.promises.access(packageLockPath).then(() => true).catch(() => false);
            if (!hasNodeModules || !hasPackageLock) {
                instance.logs.push('Installing dependencies...');
                // Use npm install for first run (creates package-lock.json), npm ci for subsequent runs
                const installCommand = hasPackageLock ? 'npm ci --legacy-peer-deps' : 'npm install --legacy-peer-deps';
                await execAsync(installCommand, { cwd: tempDir });
            }
            else {
                instance.logs.push('Dependencies already installed, skipping...');
            }
            // Start the preview server
            instance.logs.push('Starting preview server...');
            const childProcess = (0, child_process_1.exec)(`npm run dev`, {
                cwd: tempDir,
                env: {
                    ...process.env,
                    PORT: instance.port.toString(),
                    ONEINCH_API_KEY: instance.config.oneInchApiKey,
                    CHAIN_ID: instance.config.chainId,
                    RPC_URL: instance.config.rpcUrl,
                    WALLET_CONNECT_PROJECT_ID: instance.config.walletConnectProjectId || '',
                    ENABLED_CHAINS: instance.config.enabledChains?.join(',') || '1,137,56',
                    DEFAULT_TOKENS: instance.config.defaultTokens?.join(',') || 'ETH,USDC,USDT,DAI'
                }
            });
            instance.process = childProcess;
            instance.status = 'running';
            instance.logs.push(`Preview server started on port ${instance.port}`);
            // Handle process output
            childProcess.stdout?.on('data', (data) => {
                const log = data.toString().trim();
                instance.logs.push(log);
                console.log(`[${instance.id}] ${log}`);
            });
            childProcess.stderr?.on('data', (data) => {
                const log = data.toString().trim();
                instance.logs.push(`ERROR: ${log}`);
                console.error(`[${instance.id}] ERROR: ${log}`);
            });
            childProcess.on('exit', (code) => {
                instance.status = code === 0 ? 'stopped' : 'error';
                instance.logs.push(`Process exited with code ${code}`);
                console.log(`[${instance.id}] Process exited with code ${code}`);
            });
        }
        catch (error) {
            instance.status = 'error';
            instance.logs.push(`Failed to start preview: ${error.message}`);
            console.error(`[${instance.id}] Failed to start preview:`, error);
            throw error;
        }
    }
    async checkPortAvailability(port) {
        return new Promise((resolve) => {
            const net = require('net');
            const server = net.createServer();
            server.listen(port, () => {
                server.close();
                resolve(true);
            });
            server.on('error', () => {
                resolve(false);
            });
        });
    }
    async writeGeneratedFiles(tempDir, codeResult, config) {
        for (const file of codeResult.files) {
            const filePath = path_1.default.join(tempDir, file.path);
            const dir = path_1.default.dirname(filePath);
            await fs_1.default.promises.mkdir(dir, { recursive: true });
            // Inject configuration into the code
            let content = file.content;
            if (file.path.includes('backend') || file.path.includes('api')) {
                content = content
                    .replace(/process\.env\.ONEINCH_API_KEY/g, `"${config.oneInchApiKey}"`)
                    .replace(/process\.env\.CHAIN_ID/g, `"${config.chainId}"`)
                    .replace(/process\.env\.RPC_URL/g, `"${config.rpcUrl}"`)
                    .replace(/process\.env\.WALLET_CONNECT_PROJECT_ID/g, `"${config.walletConnectProjectId || ''}"`)
                    .replace(/process\.env\.ENABLED_CHAINS/g, `"${config.enabledChains?.join(',') || '1,137,56'}"`)
                    .replace(/process\.env\.DEFAULT_TOKENS/g, `"${config.defaultTokens?.join(',') || 'ETH,USDC,USDT,DAI'}"`);
            }
            await fs_1.default.promises.writeFile(filePath, content);
        }
    }
    async injectMultiChainConfig(tempDir, config) {
        try {
            console.log(`[Multi-chain config] Injecting configuration for ${tempDir}`);
            console.log(`[Multi-chain config] Enabled chains: ${config.enabledChains?.join(', ') || '1, 137, 56'}`);
            console.log(`[Multi-chain config] Default tokens: ${config.defaultTokens?.join(', ') || 'ETH, USDC, USDT, DAI'}`);
            // Update frontend configuration
            const frontendConfigPath = path_1.default.join(tempDir, 'frontend/lib/config.ts');
            const frontendConfig = `
export const LIVE_PREVIEW_CONFIG = {
  oneInchApiKey: "${config.oneInchApiKey || ''}",
  walletConnectProjectId: "${config.walletConnectProjectId || ''}",
  defaultChain: "${config.chainId}",
  enabledChains: ${JSON.stringify(config.enabledChains || ['1', '137', '56'])},
  supportedTokens: ${JSON.stringify(config.defaultTokens || ['ETH', 'USDC', 'USDT', 'DAI'])}
};

export const BACKEND_URL = "http://localhost:3001";
      `;
            await fs_1.default.promises.writeFile(frontendConfigPath, frontendConfig);
            // Update backend environment
            const backendEnvPath = path_1.default.join(tempDir, 'backend/.env');
            const backendEnv = `
ONEINCH_API_KEY=${config.oneInchApiKey || ''}
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Multi-chain RPC URLs
ETHEREUM_RPC_URL=https://eth.llamarpc.com
POLYGON_RPC_URL=https://polygon-rpc.com
BSC_RPC_URL=https://bsc-dataseed1.binance.org
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
OPTIMISM_RPC_URL=https://mainnet.optimism.io
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
      `;
            await fs_1.default.promises.writeFile(backendEnvPath, backendEnv);
            console.log(`[Multi-chain config] Configuration injected for ${tempDir}`);
        }
        catch (error) {
            console.error(`[Multi-chain config] Failed to inject configuration:`, error);
            throw error;
        }
    }
    async stopPreviewInstance(instanceId) {
        const instance = this.instances.get(instanceId);
        if (!instance) {
            throw new Error('Instance not found');
        }
        if (instance.process) {
            instance.process.kill('SIGTERM');
            instance.status = 'stopped';
            instance.logs.push('Preview server stopped');
        }
        // Clean up temporary directory
        const tempDir = path_1.default.join(process.cwd(), 'temp', instanceId);
        try {
            await fs_1.default.promises.rm(tempDir, { recursive: true, force: true });
        }
        catch (error) {
            console.error(`Failed to clean up temp directory: ${error}`);
        }
        this.instances.delete(instanceId);
    }
}
// Start the preview server manager
new PreviewServerManager();
//# sourceMappingURL=preview-server.js.map