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
export declare class Config {
    private static _instance;
    readonly api: APIConfig;
    readonly contracts: ContractConfig;
    readonly rpc: RPCConfig;
    readonly server: ServerConfig;
    readonly redis: RedisConfig;
    private constructor();
    static getInstance(): Config;
    private loadAPIConfig;
    private loadContractConfig;
    private loadRPCConfig;
    private loadServerConfig;
    private loadRedisConfig;
    /**
     * Validates that all required configuration is present
     * Logs warnings for missing optional config
     * Throws errors for missing critical config in production
     */
    validateConfig(): void;
    /**
     * Returns a summary of the current configuration for logging/debugging
     */
    getConfigSummary(): Record<string, any>;
}
export declare const config: Config;
export declare const apiConfig: APIConfig;
export declare const contractConfig: ContractConfig;
export declare const rpcConfig: RPCConfig;
export declare const serverConfig: ServerConfig;
export declare const redisConfig: RedisConfig;
//# sourceMappingURL=config.d.ts.map