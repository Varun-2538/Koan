import { NodeExecutor, ExecutionContext, NodeExecutionResult } from '../types';
export declare class FusionPlusExecutor implements NodeExecutor {
    readonly type = "fusionPlus";
    readonly name = "Fusion+ Cross-Chain Swap";
    readonly description = "Execute cross-chain swaps using 1inch Fusion+ protocol";
    validate(inputs: Record<string, any>): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    execute(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult>;
    estimateGas(inputs: Record<string, any>): Promise<string>;
    private getCrossChainQuote;
    private buildCrossChainTransaction;
    private calculateCrossChainFees;
    private calculateSavings;
}
//# sourceMappingURL=fusion-plus-executor.d.ts.map