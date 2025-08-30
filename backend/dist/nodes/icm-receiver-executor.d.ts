import { Logger } from 'winston';
import { NodeExecutor, NodeExecutionResult, ExecutionContext } from '@/types';
export declare class IcmReceiverExecutor implements NodeExecutor {
    readonly type = "icmReceiver";
    readonly name = "ICM Receiver";
    readonly description = "Receive and process cross-chain messages from Avalanche Teleporter";
    private logger;
    private provider;
    private teleporter;
    constructor(logger: Logger);
    validate(inputs: Record<string, any>): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    private validateTemplateConfig;
    execute(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult>;
    private executeTemplateMode;
    estimateGas(inputs: Record<string, any>): Promise<string>;
}
//# sourceMappingURL=icm-receiver-executor.d.ts.map