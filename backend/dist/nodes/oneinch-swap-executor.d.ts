import { Logger } from 'winston';
import { NodeExecutor, NodeExecutionResult, ExecutionContext } from '@/types';
export declare class OneInchSwapExecutor implements NodeExecutor {
    readonly type = "oneInchSwap";
    readonly name = "1inch Swap";
    readonly description = "Execute token swaps using 1inch Pathfinder algorithm with MEV protection";
    private logger;
    private apiBaseUrl;
    private apiKey?;
    constructor(logger: Logger, apiKey?: string);
    validate(inputs: Record<string, any>): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    execute(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult>;
    estimateGas(inputs: Record<string, any>, context: ExecutionContext): Promise<string>;
    private getQuote;
    private buildSwapTransaction;
    private calculatePriceImpact;
    private extractProtocols;
    private calculateGasSavings;
    private calculateAmountSavings;
    private isValidAddress;
    private formatError;
}
//# sourceMappingURL=oneinch-swap-executor.d.ts.map