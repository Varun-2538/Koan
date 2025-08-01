import type { NodeExecutor, NodeExecutionResult, ExecutionContext } from '../types';
import winston from 'winston';

interface PortfolioData {
  totalValue: string;
  tokens: Array<{
    address: string;
    symbol: string;
    name: string;
    balance: string;
    value: string;
    price: string;
    change24h?: string;
  }>;
  protocols: Array<{
    name: string;
    totalValue: string;
    positions: Array<{
      type: string;
      value: string;
      apy?: string;
    }>;
  }>;
}

export class PortfolioAPIExecutor implements NodeExecutor {
  readonly type = 'portfolioAPI';
  readonly name = 'Portfolio API';
  readonly description = 'Track and analyze DeFi portfolio with 1inch Portfolio API';

  constructor(private logger?: winston.Logger) {}

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

    // Execution mode validation
    if (!inputs.wallet_address) {
      errors.push('Wallet address is required for portfolio tracking');
    }

    if (!inputs.oneinch_api_key) {
      errors.push('1inch API key is required for portfolio data');
    }

    if (inputs.chains && !Array.isArray(inputs.chains)) {
      errors.push('Chains must be an array of chain IDs');
    }

    return { valid: errors.length === 0, errors };
  }

  private async validateTemplateConfig(inputs: Record<string, any>): Promise<void> {
    // Validate supported chains
    if (inputs.supported_chains) {
      if (!Array.isArray(inputs.supported_chains)) {
        throw new Error('supported_chains must be an array');
      }
      
      const validChains = [1, 137, 42161, 10, 56, 43114, 250]; // Ethereum, Polygon, Arbitrum, Optimism, BSC, Avalanche, Fantom
      const invalidChains = inputs.supported_chains.filter(chain => !validChains.includes(Number(chain)));
      if (invalidChains.length > 0) {
        throw new Error(`Unsupported chains: ${invalidChains.join(', ')}`);
      }
    }

    // Validate update interval
    if (inputs.update_interval && (typeof inputs.update_interval !== 'number' || inputs.update_interval < 5)) {
      throw new Error('update_interval must be a number >= 5 seconds');
    }

    // Validate portfolio features
    if (inputs.track_protocols && typeof inputs.track_protocols !== 'boolean') {
      throw new Error('track_protocols must be a boolean');
    }

    if (inputs.track_nfts && typeof inputs.track_nfts !== 'boolean') {
      throw new Error('track_nfts must be a boolean');
    }
  }

  async execute(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    const isTemplateMode = inputs.template_creation_mode || inputs.mode === 'template' || inputs.config_only;

    try {
      if (isTemplateMode) {
        return this.executeTemplateMode(inputs, context);
      }

      // Execute portfolio tracking
      const portfolioData = await this.fetchPortfolioData(inputs);
      
      return {
        success: true,
        outputs: {
          portfolio_data: portfolioData,
          total_value: portfolioData.totalValue,
          token_count: portfolioData.tokens.length,
          protocol_count: portfolioData.protocols.length,
          last_updated: new Date().toISOString()
        },
        logs: [
          `📊 Portfolio tracked for ${inputs.wallet_address}`,
          `💰 Total value: $${portfolioData.totalValue}`,
          `🪙 ${portfolioData.tokens.length} tokens found`,
          `🏛️ ${portfolioData.protocols.length} protocols detected`
        ],
        executionTime: Date.now() - startTime
      };

    } catch (error: any) {
      this.logger?.error('Portfolio API execution failed:', error);
      
      return {
        success: false,
        outputs: {},
        error: error.message,
        logs: [`❌ Failed to fetch portfolio: ${error.message}`],
        executionTime: Date.now() - startTime
      };
    }
  }

  private async executeTemplateMode(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult> {
    this.logger?.info('📊 Configuring portfolio tracker for template creation');

    const config = {
      supported_chains: inputs.supported_chains || [1, 137, 42161], // Ethereum, Polygon, Arbitrum
      update_interval: inputs.update_interval || 30, // seconds
      track_protocols: inputs.track_protocols !== false,
      track_nfts: inputs.track_nfts !== false,
      show_price_changes: inputs.show_price_changes !== false,
      show_transaction_history: inputs.show_transaction_history !== false
    };

    // Mock portfolio data for template
    const mockPortfolio: PortfolioData = {
      totalValue: '12,345.67',
      tokens: [
        {
          address: '0xA0b86a33E6441203206448619dd91e2df9dd2abF',
          symbol: 'ETH',
          name: 'Ethereum',
          balance: '5.25',
          value: '8,500.00',
          price: '1,619.05',
          change24h: '+2.5%'
        },
        {
          address: '0xA0b7E6433e7156F41c49832F8C7DB25Ab4f52a8A',
          symbol: 'USDC',
          name: 'USD Coin',
          balance: '3,845.67',
          value: '3,845.67',
          price: '1.00',
          change24h: '0.0%'
        }
      ],
      protocols: [
        {
          name: '1inch',
          totalValue: '2,500.00',
          positions: [
            { type: 'Liquidity Pool', value: '2,500.00', apy: '12.5%' }
          ]
        }
      ]
    };

    return {
      success: true,
      outputs: {
        portfolio_config: config,
        mock_portfolio: mockPortfolio,
        supported_features: [
          'Multi-chain portfolio tracking',
          'DeFi protocol positions',
          'Token balance & prices',
          'Historical performance',
          'Real-time updates'
        ]
      },
      logs: [
        `📊 Portfolio tracker configured`,
        `🔗 Supporting ${config.supported_chains.length} chains`,
        `⏱️ Update interval: ${config.update_interval}s`,
        `🏛️ Protocol tracking: ${config.track_protocols ? 'enabled' : 'disabled'}`,
        `🖼️ NFT tracking: ${config.track_nfts ? 'enabled' : 'disabled'}`
      ],
      executionTime: 5
    };
  }

  private async fetchPortfolioData(inputs: Record<string, any>): Promise<PortfolioData> {
    const { wallet_address, oneinch_api_key, chains = [1] } = inputs;

    // In a real implementation, this would call the 1inch Portfolio API
    // For now, return mock data structure
    const portfolioData: PortfolioData = {
      totalValue: '0.00',
      tokens: [],
      protocols: []
    };

    // Simulate API calls for each chain
    for (const chainId of chains) {
      try {
        // Mock API call - replace with actual 1inch Portfolio API
        const chainData = await this.fetchChainPortfolio(wallet_address, chainId, oneinch_api_key);
        portfolioData.tokens.push(...chainData.tokens);
        portfolioData.protocols.push(...chainData.protocols);
      } catch (error) {
        this.logger?.warn(`Failed to fetch portfolio for chain ${chainId}:`, error);
      }
    }

    // Calculate total value
    const totalValue = portfolioData.tokens.reduce((sum, token) => 
      sum + parseFloat(token.value), 0
    );
    portfolioData.totalValue = totalValue.toFixed(2);

    return portfolioData;
  }

  private async fetchChainPortfolio(walletAddress: string, chainId: number, apiKey: string): Promise<{
    tokens: PortfolioData['tokens'];
    protocols: PortfolioData['protocols'];
  }> {
    // Mock implementation - replace with actual 1inch Portfolio API calls
    // https://docs.1inch.io/docs/aggregation-protocol/api/swagger
    
    return {
      tokens: [],
      protocols: []
    };
  }
}