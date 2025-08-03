import { NodeExecutor, ExecutionContext, NodeExecutionResult } from '../types';
export declare class FusionMonadBridgeExecutor implements NodeExecutor {
    readonly type = "fusionMonadBridge";
    readonly name = "Fusion+ Monad Bridge";
    readonly description = "Execute atomic swaps between Ethereum and Monad using HTLCs with 1inch Fusion+ integration";
    validate(inputs: Record<string, any>): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    execute(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult>;
    estimateGas(inputs: Record<string, any>): Promise<string>;
    private generateHTLCParams;
    private createSourceChainHTLC;
    private createEthereumHTLC;
    private createMonadHTLC;
    private relayOrderToDestination;
    private startCrossChainMonitoring;
    private getCrossChainQuote;
}
//# sourceMappingURL=fusion-monad-bridge-executor.d.ts.map