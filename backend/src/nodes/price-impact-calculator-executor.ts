import { NodeExecutor, ExecutionContext, NodeExecutionResult } from '../types';
import { logger } from '../utils/logger';
import axios from 'axios';

export interface PriceImpactConfig {
  warningThreshold?: number; // Default: 3%
  maxImpactThreshold?: number; // Default: 15%
  includeSlippage?: boolean;
  detailedAnalysis?: boolean;
}

export interface PriceImpactAnalysis {
  priceImpact: number; // Percentage
  priceImpactUSD: number; // USD value of impact
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

export class PriceImpactCalculatorExecutor implements NodeExecutor {
  readonly type = 'priceImpactCalculator';
  readonly name = 'Price Impact Calculator';
  readonly description = 'Calculate and analyze price impact of token swaps with risk assessment';

  async validate(inputs: Record<string, any>): Promise<{ valid: boolean; errors: string[] }> {
    const isTemplateMode = inputs.template_creation_mode || inputs.mode === 'template' || inputs.config_only;
    const errors: string[] = [];
    
    if (isTemplateMode) {
      try {
        await this.validateTemplateConfig(inputs);
        return { valid: true, errors: [] };
      } catch (error: any) {
        return { valid: false, errors: [error.message] };
      }
    }

    if (!inputs.from_token) {
      errors.push('from_token is required');
    }

    if (!inputs.to_token) {
      errors.push('to_token is required');
    }

    if (!inputs.amount) {
      errors.push('amount is required');
    } else if (isNaN(parseFloat(inputs.amount)) || parseFloat(inputs.amount) <= 0) {
      errors.push('amount must be a positive number');
    }

    return { valid: errors.length === 0, errors };
  }

  private async validateTemplateConfig(inputs: Record<string, any>): Promise<void> {
    if (inputs.warning_threshold && (isNaN(inputs.warning_threshold) || inputs.warning_threshold < 0)) {
      throw new Error('warning_threshold must be a positive number');
    }

    if (inputs.max_impact_threshold && (isNaN(inputs.max_impact_threshold) || inputs.max_impact_threshold < 0)) {
      throw new Error('max_impact_threshold must be a positive number');
    }
  }

  private async executeTemplateMode(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      logger.info(`🔧 Configuring price impact calculator for template creation`);

      const config = {
        warning_threshold: inputs.warning_threshold || 3,
        max_impact_threshold: inputs.max_impact_threshold || 15,
        detailed_analysis: inputs.detailed_analysis !== false,
        show_route_analysis: inputs.show_route_analysis !== false,
        enable_alerts: inputs.enable_alerts !== false,
        check_mev_protection: inputs.check_mev_protection !== false
      };

      return {
        success: true,
        outputs: {
          price_impact_config: config,
          features: {
            warning_system: true,
            detailed_analysis: config.detailed_analysis,
            route_analysis: config.show_route_analysis,
            mev_protection: config.check_mev_protection
          },
          thresholds: {
            warning: `${config.warning_threshold}%`,
            maximum: `${config.max_impact_threshold}%`
          }
        },
        executionTime: 75,
        logs: [
          `Configured price impact calculator`,
          `Warning threshold: ${config.warning_threshold}%`,
          `Maximum impact threshold: ${config.max_impact_threshold}%`,
          `Detailed analysis: ${config.detailed_analysis ? 'enabled' : 'disabled'}`
        ]
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        executionTime: 75
      };
    }
  }

  async execute(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const isTemplateMode = inputs.template_creation_mode || inputs.mode === 'template' || inputs.config_only;
      
      if (isTemplateMode) {
        return this.executeTemplateMode(inputs, context);
      }

      logger.info(`📊 Calculating price impact for ${inputs.amount} ${inputs.from_token} → ${inputs.to_token}`);

      const config: PriceImpactConfig = {
        warningThreshold: 3,
        maxImpactThreshold: 15,
        includeSlippage: true,
        detailedAnalysis: true,
        ...inputs.config
      };

      // Get current market data
      const marketData = await this.getMarketData(inputs.from_token, inputs.to_token, inputs.chain_id || '1');
      
      // Calculate price impact using multiple methods
      const priceImpactAnalysis = await this.calculatePriceImpact(
        inputs.from_token,
        inputs.to_token,
        inputs.amount,
        inputs.chain_id || '1',
        config
      );

      // Get liquidity depth information
      const liquidityData = await this.getLiquidityDepth(
        inputs.from_token,
        inputs.to_token,
        inputs.chain_id || '1'
      );

      // Analyze risk factors
      const riskFactors = this.analyzeRiskFactors(priceImpactAnalysis, liquidityData, config);

      // Generate recommendations
      const recommendations = this.generateRecommendations(priceImpactAnalysis, riskFactors, config);

      const analysis: PriceImpactAnalysis = {
        priceImpact: priceImpactAnalysis.impact,
        priceImpactUSD: priceImpactAnalysis.impactUSD,
        warningLevel: this.getWarningLevel(priceImpactAnalysis.impact, config),
        recommendation: recommendations.primary,
        liquidityDepth: liquidityData,
        marketData: marketData,
        riskFactors: riskFactors,
        alternatives: recommendations.alternatives
      };

      const result = {
        analysis,
        shouldProceed: priceImpactAnalysis.impact < config.maxImpactThreshold!,
        estimatedOutput: priceImpactAnalysis.estimatedOutput,
        minimumReceived: priceImpactAnalysis.minimumReceived,
        gasEstimate: priceImpactAnalysis.gasEstimate,
        executionPrice: priceImpactAnalysis.executionPrice,
        marketPrice: marketData.currentPrice
      };

      // Log warnings if impact is high
      if (analysis.warningLevel === 'high' || analysis.warningLevel === 'critical') {
        logger.warn(`⚠️ High price impact detected: ${analysis.priceImpact.toFixed(2)}%`);
      }

      logger.info(`✅ Price impact analysis completed: ${analysis.priceImpact.toFixed(2)}% impact`);

      return {
        success: true,
        outputs: result,
        executionTime: Date.now() - context.startTime,
        logs: [
          `Price impact: ${analysis.priceImpact.toFixed(2)}%`,
          `Warning level: ${analysis.warningLevel}`,
          `Should proceed: ${result.shouldProceed}`,
          `Estimated output: ${result.estimatedOutput}`,
          `Risk factors: ${analysis.riskFactors.length}`
        ]
      };

    } catch (error: any) {
      logger.error('Price impact calculation failed:', error);
      return {
        success: false,
        outputs: {},
        error: error.message,
        executionTime: Date.now() - context.startTime,
        logs: [`Error: ${error.message}`]
      };
    }
  }

  private async getMarketData(fromToken: string, toToken: string, chainId: string) {
    try {
      // Get current price from 1inch
      const response = await axios.get(`https://api.1inch.dev/price/v1.1/${chainId}/${fromToken}`, {
        headers: {
          'Authorization': `Bearer ${process.env.ONEINCH_API_KEY}`,
          'Accept': 'application/json'
        },
        params: {
          currency: toToken
        }
      });

      return {
        currentPrice: parseFloat(response.data[fromToken]),
        estimatedPrice: 0, // Will be calculated in price impact
        priceDifference: 0,
        volume24h: 0 // Would fetch from additional API
      };

    } catch (error) {
      logger.warn('Failed to fetch market data, using fallback');
      return {
        currentPrice: 1,
        estimatedPrice: 1,
        priceDifference: 0,
        volume24h: 0
      };
    }
  }

  private async calculatePriceImpact(
    fromToken: string,
    toToken: string,
    amount: string,
    chainId: string,
    config: PriceImpactConfig
  ) {
    try {
      // Get quote from 1inch to calculate actual execution price
      const quoteResponse = await axios.get(`https://api.1inch.dev/swap/v6.0/${chainId}/quote`, {
        headers: {
          'Authorization': `Bearer ${process.env.ONEINCH_API_KEY}`,
          'Accept': 'application/json'
        },
        params: {
          src: fromToken,
          dst: toToken,
          amount: amount,
          includeGas: true,
          includeProtocols: true
        }
      });

      const quote = quoteResponse.data;
      const fromAmount = parseFloat(amount);
      const toAmount = parseFloat(quote.dstAmount);
      
      // Calculate execution price
      const executionPrice = toAmount / fromAmount;
      
      // Get market price (small amount to minimize impact)
      const smallAmount = (fromAmount * 0.001).toString(); // 0.1% of trade size
      const marketResponse = await axios.get(`https://api.1inch.dev/swap/v6.0/${chainId}/quote`, {
        headers: {
          'Authorization': `Bearer ${process.env.ONEINCH_API_KEY}`,
          'Accept': 'application/json'
        },
        params: {
          src: fromToken,
          dst: toToken,
          amount: smallAmount
        }
      });

      const marketQuote = marketResponse.data;
      const marketPrice = parseFloat(marketQuote.dstAmount) / parseFloat(smallAmount);

      // Calculate price impact
      const priceImpact = Math.abs((executionPrice - marketPrice) / marketPrice) * 100;
      const impactUSD = priceImpact * fromAmount * marketPrice / 100;

      return {
        impact: priceImpact,
        impactUSD,
        executionPrice,
        marketPrice,
        estimatedOutput: toAmount.toString(),
        minimumReceived: (toAmount * 0.99).toString(), // 1% slippage
        gasEstimate: quote.gas || '0'
      };

    } catch (error) {
      // Fallback calculation if API fails
      logger.warn('Failed to get accurate price impact, using estimation');
      const estimatedImpact = this.estimatePriceImpact(parseFloat(amount));
      
      return {
        impact: estimatedImpact,
        impactUSD: estimatedImpact * parseFloat(amount) / 100,
        executionPrice: 1,
        marketPrice: 1,
        estimatedOutput: amount,
        minimumReceived: (parseFloat(amount) * 0.99).toString(),
        gasEstimate: '200000'
      };
    }
  }

  private estimatePriceImpact(amount: number): number {
    // Simple heuristic based on trade size
    if (amount < 1000) return 0.1;      // Very small impact
    if (amount < 10000) return 0.5;     // Small impact  
    if (amount < 100000) return 2.0;    // Medium impact
    if (amount < 1000000) return 8.0;   // High impact
    return 15.0;                        // Very high impact
  }

  private async getLiquidityDepth(fromToken: string, toToken: string, chainId: string) {
    try {
      // This would fetch liquidity data from DEX APIs
      // For now, return mock data
      return {
        token0Reserve: "1000000",
        token1Reserve: "2000000", 
        totalValueLocked: 3000000
      };
    } catch (error) {
      return {
        token0Reserve: "0",
        token1Reserve: "0",
        totalValueLocked: 0
      };
    }
  }

  private analyzeRiskFactors(priceImpact: any, liquidity: any, config: PriceImpactConfig): string[] {
    const risks: string[] = [];

    if (priceImpact.impact > 10) {
      risks.push('Very high price impact (>10%)');
    }

    if (liquidity.totalValueLocked < 100000) {
      risks.push('Low liquidity pool');
    }

    if (priceImpact.impact > 5) {
      risks.push('MEV risk - consider using private mempool');
    }

    return risks;
  }

  private generateRecommendations(priceImpact: any, riskFactors: string[], config: PriceImpactConfig) {
    let primary = 'Trade appears safe to execute';
    
    if (priceImpact.impact > config.maxImpactThreshold!) {
      primary = 'Consider splitting trade or finding alternative route';
    } else if (priceImpact.impact > config.warningThreshold!) {
      primary = 'Proceed with caution - monitor execution carefully';
    }

    return {
      primary,
      alternatives: {
        splitTrade: priceImpact.impact > 5,
        betterRoutes: [
          { protocol: '1inch Pathfinder', expectedImpact: Math.max(0, priceImpact.impact - 0.5) },
          { protocol: 'Uniswap V3', expectedImpact: priceImpact.impact + 0.2 }
        ]
      }
    };
  }

  private getWarningLevel(impact: number, config: PriceImpactConfig): 'low' | 'medium' | 'high' | 'critical' {
    if (impact < 1) return 'low';
    if (impact < config.warningThreshold!) return 'medium';
    if (impact < config.maxImpactThreshold!) return 'high';
    return 'critical';
  }
}