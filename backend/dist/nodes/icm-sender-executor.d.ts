import { Logger } from 'winston';
import { NodeExecutor, NodeExecutionResult, ExecutionContext } from '@/types';
export declare class IcmSenderExecutor implements NodeExecutor {
    readonly type = "icmSender";
    readonly name = "ICM Sender";
    readonly description = "Send cross-chain messages using Avalanche Teleporter";
    private logger;
    private provider;
    constructor(logger: Logger);
    validate(inputs: Record<string, any>): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    private validateTemplateConfig;
    execute(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult>;
    private waitForSignedTransaction;
    private executeTemplateMode;
    estimateGas(inputs: Record<string, any>): Promise<string>;
}
//# sourceMappingURL=icm-sender-executor.d.ts.map