import { NodeExecutor, ExecutionContext, NodeExecutionResult } from '../types';
export declare class ChainSelectorExecutor implements NodeExecutor {
    readonly type = "chainSelector";
    readonly name = "Chain Selector";
    readonly description = "Select and configure blockchain networks for DeFi operations";
    private chainConfigs;
    validate(inputs: Record<string, any>): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    execute(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult>;
    estimateGas(inputs: Record<string, any>): Promise<string>;
    private getAvailableChains;
    private getChainStatus;
    private getMockGasPrice;
    private getChainRecommendations;
}
//# sourceMappingURL=chain-selector-executor.d.ts.map