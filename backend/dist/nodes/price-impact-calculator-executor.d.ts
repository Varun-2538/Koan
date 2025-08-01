import { NodeExecutor, ExecutionContext, NodeExecutionResult } from '../types';
export interface PriceImpactConfig {
    warningThreshold?: number;
    maxImpactThreshold?: number;
    includeSlippage?: boolean;
    detailedAnalysis?: boolean;
}
export interface PriceImpactAnalysis {
    priceImpact: number;
    priceImpactUSD: number;
    warningLevel: 'low' | 'medium' | 'high' | 'critical';
    recommendation: string;
    liquidityDepth: {
        token0Reserve: string;
        token1Reserve: string;
        totalValueLocked: number;
    };
    marketData: {
        currentPrice: number;
        estimatedPrice: number;
        priceDifference: number;
        volume24h: number;
    };
    riskFactors: string[];
    alternatives?: {
        splitTrade: boolean;
        betterRoutes: Array<{
            protocol: string;
            expectedImpact: number;
        }>;
    };
}
export declare class PriceImpactCalculatorExecutor implements NodeExecutor {
    readonly type = "priceImpactCalculator";
    readonly name = "Price Impact Calculator";
    readonly description = "Calculate and analyze price impact of token swaps with risk assessment";
    validate(inputs: Record<string, any>): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    private validateTemplateConfig;
    private executeTemplateMode;
    execute(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult>;
    private getMarketData;
    private calculatePriceImpact;
    private estimatePriceImpact;
    private getLiquidityDepth;
    private analyzeRiskFactors;
    private generateRecommendations;
    private getWarningLevel;
}
//# sourceMappingURL=price-impact-calculator-executor.d.ts.map