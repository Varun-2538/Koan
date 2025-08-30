import { Logger } from 'winston';
import { NodeExecutor, NodeExecutionResult, ExecutionContext } from '@/types';
export declare class L1SimulatorDeployerExecutor implements NodeExecutor {
    readonly type = "l1SimulatorDeployer";
    readonly name = "L1 Simulator Deployer";
    readonly description = "Simulate Avalanche subnet deployment for demo purposes";
    private logger;
    constructor(logger: Logger);
    validate(inputs: Record<string, any>): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    private validateTemplateConfig;
    execute(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult>;
    private simulateDeployment;
    private simulateBlockchainCreation;
    private generateMockControlKeys;
    private generateMockValidators;
    private executeTemplateMode;
    estimateGas(inputs: Record<string, any>): Promise<string>;
}
//# sourceMappingURL=l1-simulator-deployer-executor.d.ts.map