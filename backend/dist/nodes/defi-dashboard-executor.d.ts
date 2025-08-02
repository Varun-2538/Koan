import type { NodeExecutor, NodeExecutionResult, ExecutionContext } from '../types';
import winston from 'winston';
export declare class DeFiDashboardExecutor implements NodeExecutor {
    private logger?;
    readonly type = "defiDashboard";
    readonly name = "DeFi Dashboard Generator";
    readonly description = "Generate complete DeFi dashboard with all integrated components and features";
    constructor(logger?: winston.Logger | undefined);
    validate(inputs: Record<string, any>): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    private validateTemplateConfig;
    execute(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult>;
    private executeTemplateMode;
    private generateDashboard;
}
//# sourceMappingURL=defi-dashboard-executor.d.ts.map