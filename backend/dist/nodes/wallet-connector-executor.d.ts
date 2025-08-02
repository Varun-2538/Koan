import { NodeExecutor, ExecutionContext, NodeExecutionResult } from '../types';
export declare class WalletConnectorExecutor implements NodeExecutor {
    readonly type = "walletConnector";
    readonly name = "Wallet Connector";
    readonly description = "Connect and manage cryptocurrency wallets for DeFi operations";
    private supportedWallets;
    private getNetworkName;
    validate(inputs: Record<string, any>): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    private validateTemplateConfig;
    private executeTemplateMode;
    execute(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult>;
    estimateGas(inputs: Record<string, any>): Promise<string>;
    private getWalletBalance;
    private getTokenBalances;
    private getTransactionHistory;
    private getWalletCapabilities;
    private isContractAddress;
    private assessRiskLevel;
    private getSecurityRecommendations;
    private getSupportedOperations;
    private calculateTotalValue;
    private isValidChainId;
    private getMaxGasLimit;
}
//# sourceMappingURL=wallet-connector-executor.d.ts.map