import type { NodeExecutor, NodeExecutionResult, ExecutionContext } from '../types';
import winston from 'winston';
export declare class LimitOrderExecutor implements NodeExecutor {
    private logger?;
    private apiKey?;
    readonly type = "limitOrder";
    readonly name = "1inch Limit Order";
    readonly description = "Create and manage limit orders using 1inch Limit Order Protocol";
    constructor(logger?: winston.Logger | undefined, apiKey?: string | undefined);
    validate(inputs: Record<string, any>): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    private validateTemplateConfig;
    execute(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult>;
    private executeTemplateMode;
    private createLimitOrder;
    private isValidChainId;
}
//# sourceMappingURL=limit-order-executor.d.ts.map