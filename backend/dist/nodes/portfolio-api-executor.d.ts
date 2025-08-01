import type { NodeExecutor, NodeExecutionResult, ExecutionContext } from '../types';
import winston from 'winston';
export declare class PortfolioAPIExecutor implements NodeExecutor {
    private logger?;
    readonly type = "portfolioAPI";
    readonly name = "Portfolio API";
    readonly description = "Track and analyze DeFi portfolio with 1inch Portfolio API";
    constructor(logger?: winston.Logger | undefined);
    validate(inputs: Record<string, any>): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    private validateTemplateConfig;
    execute(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult>;
    private executeTemplateMode;
    private fetchPortfolioData;
    private fetchChainPortfolio;
}
//# sourceMappingURL=portfolio-api-executor.d.ts.map