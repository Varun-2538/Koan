import { NodeExecutor, ExecutionContext, NodeExecutionResult } from '../types';
export interface TransactionMonitorConfig {
    confirmationsRequired?: number;
    timeoutMinutes?: number;
    enableAlerts?: boolean;
    includeGasTracking?: boolean;
    enableMEVDetection?: boolean;
    webhookUrl?: string;
}
export interface TransactionStatus {
    hash: string;
    status: 'pending' | 'confirmed' | 'failed' | 'replaced' | 'timeout';
    confirmations: number;
    gasUsed?: string;
    gasPrice?: string;
    effectiveGasPrice?: string;
    blockNumber?: number;
    blockTimestamp?: number;
    from: string;
    to: string;
    value: string;
    nonce: number;
    mevDetected?: boolean;
    replacementTx?: string;
    failureReason?: string;
    logs?: Array<{
        address: string;
        topics: string[];
        data: string;
    }>;
    events?: Array<{
        eventName: string;
        args: Record<string, any>;
    }>;
}
export interface MonitoringResult {
    transactionHash: string;
    finalStatus: TransactionStatus;
    timeline: Array<{
        timestamp: number;
        event: string;
        details: string;
        blockNumber?: number;
    }>;
    performance: {
        totalTime: number;
        confirmationTime: number;
        gasEfficiency: number;
    };
    alerts: Array<{
        level: 'info' | 'warning' | 'error';
        message: string;
        timestamp: number;
    }>;
}
export declare class TransactionMonitorExecutor implements NodeExecutor {
    readonly type = "transactionMonitor";
    readonly name = "Transaction Monitor";
    readonly description = "Monitor transaction status with real-time updates, MEV detection, and performance analytics";
    private eventEmitter;
    private activeMonitors;
    validate(inputs: Record<string, any>): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    private validateTemplateConfig;
    private executeTemplateMode;
    execute(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult>;
    private submitTransaction;
    private monitorTransaction;
    private getTransactionStatus;
    private detectMEV;
    private calculateGasEfficiency;
    private generateExecutionLogs;
    private sleep;
    private isValidChainId;
    onTransactionUpdate(callback: (hash: string, status: TransactionStatus) => void): void;
    onTransactionConfirmed(callback: (hash: string, result: MonitoringResult) => void): void;
    onTransactionFailed(callback: (hash: string, error: string) => void): void;
}
//# sourceMappingURL=transaction-monitor-executor.d.ts.map