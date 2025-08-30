import { Logger } from 'winston';
import { NodeExecutor, NodeExecutionResult, ExecutionContext } from '@/types';
export declare class L1ConfigExecutor implements NodeExecutor {
    readonly type = "l1Config";
    readonly name = "L1 Config Generator";
    readonly description = "Generate Avalanche subnet configuration and genesis JSON";
    private logger;
    constructor(logger: Logger);
    validate(inputs: Record<string, any>): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    private validateTemplateConfig;
    execute(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult>;
    private generateGenesisConfig;
    private generateSubnetConfig;
    private executeTemplateMode;
    estimateGas(inputs: Record<string, any>): Promise<string>;
}
//# sourceMappingURL=l1-config-executor.d.ts.map