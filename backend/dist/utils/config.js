"use strict";
/**
 * Centralized configuration management for the Unite DeFi backend
 * Handles environment variables with validation and defaults
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConfig = exports.serverConfig = exports.rpcConfig = exports.contractConfig = exports.apiConfig = exports.config = exports.Config = void 0;
class Config {
    static _instance;
    api;
    contracts;
    rpc;
    server;
    redis;
    constructor() {
        this.api = this.loadAPIConfig();
        this.contracts = this.loadContractConfig();
        this.rpc = this.loadRPCConfig();
        this.server = this.loadServerConfig();
        this.redis = this.loadRedisConfig();
    }
    static getInstance() {
        if (!Config._instance) {
            Config._instance = new Config();
        }
        return Config._instance;
    }
    loadAPIConfig() {
        return {
            oneInchApiKey: process.env.ONEINCH_API_KEY,
            oneInchBaseUrl: process.env.ONEINCH_BASE_URL || 'https://api.1inch.dev'
        };
    }
    loadContractConfig() {
        return {
            teleporterAddress: process.env.TELEPORTER_CONTRACT_ADDRESS || '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
            oneInchRouterAddress: process.env.ONEINCH_ROUTER_ADDRESS || '0x1111111254fb6c44bAC0beD2854e76F90643097d'
        };
    }
    loadRPCConfig() {
        return {
            ethereumUrl: process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/',
            polygonUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
            arbitrumUrl: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
            optimismUrl: process.env.OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
            baseUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
            avalancheUrl: process.env.AVALANCHE_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc',
            avalancheFujiUrl: process.env.AVALANCHE_FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc',
            bscUrl: process.env.BSC_RPC_URL || 'https://bsc-dataseed1.binance.org/',
            fantomUrl: process.env.FANTOM_RPC_URL || 'https://rpc.ftm.tools/',
            cronosUrl: process.env.CRONOS_RPC_URL || 'https://evm.cronos.org/',
            goerliUrl: process.env.GOERLI_RPC_URL || 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
        };
    }
    loadServerConfig() {
        return {
            port: parseInt(process.env.PORT || '3001'),
            nodeEnv: process.env.NODE_ENV || 'development',
            logLevel: process.env.LOG_LEVEL || 'info',
            frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
            maxConcurrentWorkflows: parseInt(process.env.MAX_CONCURRENT_WORKFLOWS || '50'),
            nodeTimeoutMs: parseInt(process.env.NODE_TIMEOUT_MS || '60000'),
            maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
            gasLimitMultiplier: parseFloat(process.env.GAS_LIMIT_MULTIPLIER || '1.2')
        };
    }
    loadRedisConfig() {
        return {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD
        };
    }
    /**
     * Validates that all required configuration is present
     * Logs warnings for missing optional config
     * Throws errors for missing critical config in production
     */
    validateConfig() {
        const warnings = [];
        const errors = [];
        // Check critical configuration
        if (!this.api.oneInchApiKey) {
            const message = 'ONEINCH_API_KEY not configured - DeFi operations will use mock data';
            if (this.server.nodeEnv === 'production') {
                errors.push(message);
            }
            else {
                warnings.push(message);
            }
        }
        // Check RPC URLs for production
        if (this.server.nodeEnv === 'production') {
            if (this.rpc.ethereumUrl.includes('infura.io/v3/')) {
                warnings.push('Using default Infura URL - consider using your own project ID');
            }
        }
        // Log warnings
        if (warnings.length > 0) {
            console.warn('⚠️  Configuration warnings:');
            warnings.forEach(warning => console.warn(`   - ${warning}`));
        }
        // Throw errors for production issues
        if (errors.length > 0) {
            console.error('❌ Configuration errors:');
            errors.forEach(error => console.error(`   - ${error}`));
            throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
        }
    }
    /**
     * Returns a summary of the current configuration for logging/debugging
     */
    getConfigSummary() {
        return {
            api: {
                oneInchApiKey: this.api.oneInchApiKey ? 'configured' : 'missing',
                oneInchBaseUrl: this.api.oneInchBaseUrl
            },
            server: {
                port: this.server.port,
                nodeEnv: this.server.nodeEnv,
                logLevel: this.server.logLevel,
                frontendUrl: this.server.frontendUrl
            },
            features: {
                hasOneInchAPI: !!this.api.oneInchApiKey,
                hasRedisPassword: !!this.redis.password,
                productionMode: this.server.nodeEnv === 'production'
            }
        };
    }
}
exports.Config = Config;
// Export singleton instance
exports.config = Config.getInstance();
// Export individual config sections for convenience
exports.apiConfig = exports.config.api;
exports.contractConfig = exports.config.contracts;
exports.rpcConfig = exports.config.rpc;
exports.serverConfig = exports.config.server;
exports.redisConfig = exports.config.redis;
//# sourceMappingURL=config.js.map