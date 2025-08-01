export interface FlowNode {
    id: string;
    type: string;
    position: {
        x: number;
        y: number;
    };
    data: {
        label: string;
        config: Record<string, any>;
    };
}
export interface FlowEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
}
export interface WorkflowDefinition {
    id: string;
    name: string;
    description?: string;
    nodes: FlowNode[];
    edges: FlowEdge[];
    metadata?: {
        created: string;
        modified: string;
        version: string;
        author?: string;
    };
}
export interface ExecutionContext {
    workflowId: string;
    executionId: string;
    userId?: string;
    environment: 'test' | 'production';
    startTime: number;
    variables: Record<string, any>;
    secrets: Record<string, string>;
}
export interface NodeExecutionResult {
    success: boolean;
    outputs: Record<string, any>;
    error?: string;
    logs: string[];
    executionTime: number;
    gasUsed?: string;
    transactionHash?: string;
    blockNumber?: number;
    metadata?: Record<string, any>;
}
export interface ExecutionStep {
    nodeId: string;
    nodeType: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    inputs: Record<string, any>;
    outputs: Record<string, any>;
    result?: NodeExecutionResult;
    startTime?: number;
    endTime?: number;
    dependencies: string[];
}
export interface WorkflowExecution {
    id: string;
    workflowId: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    steps: Map<string, ExecutionStep>;
    context: ExecutionContext;
    startTime: number;
    endTime?: number;
    error?: string;
    totalGasUsed?: string;
    totalCost?: string;
}
export interface ChainConfig {
    chainId: number;
    name: string;
    rpcUrl: string;
    blockExplorer: string;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    contracts?: {
        multicall?: string;
        oneInch?: string;
    };
}
export interface TokenInfo {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    chainId: number;
    logoURI?: string;
    tags?: string[];
}
export interface SwapQuote {
    fromTokenAddress: string;
    toTokenAddress: string;
    fromAmount: string;
    toAmount: string;
    protocols: any[];
    estimatedGas: string;
    gasPrice?: string;
    slippage: number;
    chainId: number;
    validUntil?: number;
}
export interface TransactionRequest {
    to: string;
    data: string;
    value: string;
    gasLimit: string;
    gasPrice?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    nonce?: number;
    chainId: number;
}
export interface WalletConnection {
    address: string;
    chainId: number;
    provider: 'metamask' | 'walletconnect' | 'coinbase' | 'injected';
    connected: boolean;
}
export interface NodeExecutor {
    readonly type: string;
    readonly name: string;
    readonly description: string;
    validate(inputs: Record<string, any>): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    execute(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult>;
    estimateGas?(inputs: Record<string, any>, context: ExecutionContext): Promise<string>;
}
export interface OneInchAPI {
    getQuote(params: {
        chainId: number;
        fromTokenAddress: string;
        toTokenAddress: string;
        amount: string;
        slippage?: number;
    }): Promise<SwapQuote>;
    buildSwapTx(params: {
        chainId: number;
        fromTokenAddress: string;
        toTokenAddress: string;
        amount: string;
        fromAddress: string;
        slippage?: number;
        destReceiver?: string;
        referrer?: string;
        fee?: string;
    }): Promise<TransactionRequest>;
    getTokens(chainId: number): Promise<TokenInfo[]>;
    getProtocols(chainId: number): Promise<any[]>;
}
export interface ExecutionEvent {
    type: 'execution.started' | 'execution.progress' | 'execution.completed' | 'execution.failed' | 'node.started' | 'node.completed' | 'node.failed';
    executionId: string;
    timestamp: number;
    data: any;
}
export interface EngineConfig {
    port: number;
    redis: {
        host: string;
        port: number;
        password?: string;
    };
    chains: Record<string, ChainConfig>;
    apis: {
        oneInch: {
            baseUrl: string;
            apiKey?: string;
        };
    };
    execution: {
        maxConcurrentWorkflows: number;
        nodeTimeoutMs: number;
        maxRetries: number;
        gasLimitMultiplier: number;
    };
    logging: {
        level: 'debug' | 'info' | 'warn' | 'error';
        enableFileLogging: boolean;
    };
}
export declare class ExecutionError extends Error {
    readonly nodeId?: string | undefined;
    readonly nodeType?: string | undefined;
    readonly executionId?: string | undefined;
    readonly cause?: Error | undefined;
    constructor(message: string, nodeId?: string | undefined, nodeType?: string | undefined, executionId?: string | undefined, cause?: Error | undefined);
}
export declare class ValidationError extends Error {
    readonly field?: string | undefined;
    readonly value?: any | undefined;
    constructor(message: string, field?: string | undefined, value?: any | undefined);
}
export declare class ChainError extends Error {
    readonly chainId?: number | undefined;
    readonly transactionHash?: string | undefined;
    readonly blockNumber?: number | undefined;
    constructor(message: string, chainId?: number | undefined, transactionHash?: string | undefined, blockNumber?: number | undefined);
}
//# sourceMappingURL=index.d.ts.map