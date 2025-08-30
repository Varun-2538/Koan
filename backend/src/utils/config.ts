/**
 * Centralized configuration management for the Unite DeFi backend
 * Handles environment variables with validation and defaults
 */

export interface APIConfig {
  oneInchApiKey?: string;
  oneInchBaseUrl: string;
}

export interface ContractConfig {
  teleporterAddress: string;
  oneInchRouterAddress: string;
}

export interface RPCConfig {
  ethereumUrl: string;
  polygonUrl: string;
  arbitrumUrl: string;
  optimismUrl: string;
  baseUrl: string;
  avalancheUrl: string;
  avalancheFujiUrl: string;
  bscUrl: string;
  fantomUrl: string;
  cronosUrl: string;
  goerliUrl: string;
}

export interface ServerConfig {
  port: number;
  nodeEnv: string;
  logLevel: string;
  frontendUrl: string;
  maxConcurrentWorkflows: number;
  nodeTimeoutMs: number;
  maxRetries: number;
  gasLimitMultiplier: number;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
}

export class Config {
  private static _instance: Config;
  
  public readonly api: APIConfig;
  public readonly contracts: ContractConfig;
  public readonly rpc: RPCConfig;
  public readonly server: ServerConfig;
  public readonly redis: RedisConfig;

  private constructor() {
    this.api = this.loadAPIConfig();
    this.contracts = this.loadContractConfig();
    this.rpc = this.loadRPCConfig();
    this.server = this.loadServerConfig();
    this.redis = this.loadRedisConfig();
  }

  public static getInstance(): Config {
    if (!Config._instance) {
      Config._instance = new Config();
    }
    return Config._instance;
  }

  private loadAPIConfig(): APIConfig {
    return {
      oneInchApiKey: process.env.ONEINCH_API_KEY,
      oneInchBaseUrl: process.env.ONEINCH_BASE_URL || 'https://api.1inch.dev'
    };
  }

  private loadContractConfig(): ContractConfig {
    return {
      teleporterAddress: process.env.TELEPORTER_CONTRACT_ADDRESS || '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
      oneInchRouterAddress: process.env.ONEINCH_ROUTER_ADDRESS || '0x1111111254fb6c44bAC0beD2854e76F90643097d'
    };
  }

  private loadRPCConfig(): RPCConfig {
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

  private loadServerConfig(): ServerConfig {
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

  private loadRedisConfig(): RedisConfig {
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
  public validateConfig(): void {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check critical configuration
    if (!this.api.oneInchApiKey) {
      const message = 'ONEINCH_API_KEY not configured - DeFi operations will use mock data';
      if (this.server.nodeEnv === 'production') {
        errors.push(message);
      } else {
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
  public getConfigSummary(): Record<string, any> {
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

// Export singleton instance
export const config = Config.getInstance();

// Export individual config sections for convenience
export const apiConfig = config.api;
export const contractConfig = config.contracts;
export const rpcConfig = config.rpc;
export const serverConfig = config.server;
export const redisConfig = config.redis;
