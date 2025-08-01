import { NodeExecutor, ExecutionContext, NodeExecutionResult } from '../types';
export declare class TransactionStatusExecutor implements NodeExecutor {
    readonly type = "transactionStatus";
    readonly name = "Transaction Status";
    readonly description = "Monitor and track blockchain transaction status and confirmations";
    private transactionStatuses;
    validate(inputs: Record<string, any>): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    execute(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult>;
    estimateGas(inputs: Record<string, any>): Promise<string>;
    private getTransactionDetails;
    private getTransactionReceipt;
    private getConfirmationCount;
    private analyzeGasUsage;
    private getTransactionTimeline;
    private getExplorerLink;
    private classifyTransaction;
    private assessTransactionRisk;
    private getTransactionRecommendations;
    private getCurrentGasPrice;
    private getGasRecommendations;
    private getChainFinality;
    private isValidChainId;
}
//# sourceMappingURL=transaction-status-executor.d.ts.map