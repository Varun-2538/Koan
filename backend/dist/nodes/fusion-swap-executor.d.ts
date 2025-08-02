import type { NodeExecutor, NodeExecutionResult, ExecutionContext } from '../types';
import winston from 'winston';
export declare class FusionSwapExecutor implements NodeExecutor {
    private logger?;
    private apiKey?;
    readonly type = "fusionSwap";
    readonly name = "1inch Fusion Swap";
    readonly description = "Execute gasless, MEV-protected swaps using 1inch Fusion protocol";
    constructor(logger?: winston.Logger | undefined, apiKey?: string | undefined);
    validate(inputs: Record<string, any>): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    private validateTemplateConfig;
    execute(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult>;
    private executeTemplateMode;
    private executeFusionSwap;
    private isValidChainId;
}
//# sourceMappingURL=fusion-swap-executor.d.ts.map