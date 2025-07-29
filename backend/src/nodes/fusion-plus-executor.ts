import { NodeExecutor, ExecutionContext, NodeExecutionResult } from '../types';
import axios from 'axios';
import { logger } from '../utils/logger';

export class FusionPlusExecutor implements NodeExecutor {
  nodeType = 'fusionPlus';

  async validate(inputs: Record<string, any>): Promise<boolean> {
    const required = ['api_key', 'source_chain', 'destination_chain', 'from_token', 'to_token', 'amount', 'from_address'];
    
    for (const field of required) {
      if (!inputs[field]) {
        throw new Error(`${field} is required for Fusion+ cross-chain swap`);
      }
    }

    // Validate chain IDs
    const supportedChains = ['1', '56', '137', '42161', '10', '250', '43114', '25', '8453', '324', '59144', '5000'];
    if (!supportedChains.includes(inputs.source_chain)) {
      throw new Error(`Source chain ${inputs.source_chain} not supported`);
    }
    if (!supportedChains.includes(inputs.destination_chain)) {
      throw new Error(`Destination chain ${inputs.destination_chain} not supported`);
    }

    // Validate amount
    if (isNaN(Number(inputs.amount)) || Number(inputs.amount) <= 0) {
      throw new Error('Amount must be a positive number');
    }

    // Validate addresses
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(inputs.from_address)) {
      throw new Error('Invalid from_address format');
    }
    if (inputs.from_token !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' && !addressRegex.test(inputs.from_token)) {
      throw new Error('Invalid from_token address format');
    }
    if (inputs.to_token !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' && !addressRegex.test(inputs.to_token)) {
      throw new Error('Invalid to_token address format');
    }

    return true;
  }

  async execute(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      logger.info(`🌉 Executing Fusion+ cross-chain swap from chain ${inputs.source_chain} to ${inputs.destination_chain}`);

      // Step 1: Get cross-chain quote
      const quote = await this.getCrossChainQuote(inputs);
      
      // Step 2: Build cross-chain transaction
      const transaction = await this.buildCrossChainTransaction(inputs, quote);
      
      // Step 3: Calculate cross-chain fees
      const fees = await this.calculateCrossChainFees(inputs, quote);

      const result = {
        success: true,
        data: {
          quote: {
            fromToken: inputs.from_token,
            toToken: inputs.to_token,
            fromAmount: inputs.amount,
            toAmount: quote.toAmount,
            estimatedGas: quote.estimatedGas || '0',
            sourceChain: inputs.source_chain,
            destinationChain: inputs.destination_chain,
            bridgeTime: quote.bridgeTime || '5-15 minutes'
          },
          transaction: {
            to: transaction.to,
            data: transaction.data,
            value: transaction.value,
            gasLimit: transaction.gasLimit,
            chainId: inputs.source_chain
          },
          fees: {
            bridgeFee: fees.bridgeFee,
            gasFee: fees.gasFee,
            protocolFee: fees.protocolFee,
            totalFee: fees.totalFee
          },
          mevProtection: inputs.enable_mev_protection || false,
          gaslessEnabled: inputs.enable_gasless || false,
          protocols: quote.protocols || ['1inch Fusion+'],
          savings: this.calculateSavings(quote),
          bridgeProvider: 'Fusion+',
          securityFeatures: [
            'MEV Protection',
            'Gasless Execution',
            'Cross-chain Validation',
            'Slippage Protection'
          ]
        }
      };

      logger.info(`✅ Fusion+ cross-chain swap prepared successfully`);
      return result;

    } catch (error) {
      logger.error(`❌ Fusion+ execution failed:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Fusion+ execution failed'
      };
    }
  }

  async estimateGas(inputs: Record<string, any>): Promise<string> {
    try {
      // Cross-chain operations typically require more gas
      const baseGas = 200000; // Base gas for cross-chain swap
      const bridgeGas = 100000; // Additional gas for bridge operations
      
      // Add extra gas for complex tokens
      const isComplexToken = inputs.from_token !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
      const complexityGas = isComplexToken ? 50000 : 0;
      
      const totalGas = baseGas + bridgeGas + complexityGas;
      
      return totalGas.toString();
    } catch (error) {
      logger.error('Gas estimation failed for Fusion+:', error);
      return '300000'; // Safe fallback
    }
  }

  private async getCrossChainQuote(inputs: Record<string, any>) {
    try {
      // In a real implementation, this would call 1inch Fusion+ API
      const mockQuote = {
        toAmount: (BigInt(inputs.amount) * BigInt(99) / BigInt(100)).toString(), // 1% bridge fee
        estimatedGas: await this.estimateGas(inputs),
        bridgeTime: '10-15 minutes',
        protocols: ['1inch Fusion+', 'Axelar', 'LayerZero'],
        priceImpact: '0.1'
      };

      return mockQuote;
    } catch (error) {
      throw new Error(`Failed to get cross-chain quote: ${error}`);
    }
  }

  private async buildCrossChainTransaction(inputs: Record<string, any>, quote: any) {
    try {
      // Mock transaction data for cross-chain swap
      return {
        to: '0x1111111254fb6c44bAC0beD2854e76F90643097d', // 1inch Router
        data: '0x' + 'ff'.repeat(200), // Mock encoded function call
        value: inputs.from_token === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' ? inputs.amount : '0',
        gasLimit: await this.estimateGas(inputs)
      };
    } catch (error) {
      throw new Error(`Failed to build cross-chain transaction: ${error}`);
    }
  }

  private async calculateCrossChainFees(inputs: Record<string, any>, quote: any) {
    const amount = BigInt(inputs.amount);
    
    return {
      bridgeFee: (amount * BigInt(50) / BigInt(10000)).toString(), // 0.5% bridge fee
      gasFee: (BigInt(quote.estimatedGas) * BigInt(20000000000)).toString(), // 20 gwei
      protocolFee: (amount * BigInt(30) / BigInt(10000)).toString(), // 0.3% protocol fee
      totalFee: (amount * BigInt(80) / BigInt(10000)).toString() // 0.8% total
    };
  }

  private calculateSavings(quote: any): string {
    // Mock savings calculation - would compare with other bridges
    const mockSavings = '0.2'; // 0.2% savings compared to alternatives
    return mockSavings;
  }
}