import type { NodeExecutor, NodeExecutionResult, ExecutionContext } from '../types';
import winston from 'winston';
export declare class OneInchQuoteExecutor implements NodeExecutor {
    private logger?;
    private apiKey?;
    readonly type = "oneInchQuote";
    readonly name = "1inch Quote Engine";
    readonly description = "Get optimal swap quotes using 1inch Pathfinder algorithm with protocol routing";
    constructor(logger?: winston.Logger | undefined, apiKey?: string | undefined);
    validate(inputs: Record<string, any>): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    private validateTemplateConfig;
    execute(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult>;
    private executeTemplateMode;
    private fetchQuote;
    private isValidChainId;
}
//# sourceMappingURL=oneinch-quote-executor.d.ts.map