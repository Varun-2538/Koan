import { NodeExecutor, ExecutionContext, NodeExecutionResult, WalletConnection, TokenInfo } from '../types';
import { logger } from '../utils/logger';
import axios from 'axios';

export class WalletConnectorExecutor implements NodeExecutor {
  nodeType = 'walletConnector';

  private supportedWallets = [
    'metamask',
    'walletconnect', 
    'coinbase',
    'trust',
    'rainbow',
    'phantom', // For Solana
    'ledger',
    'trezor'
  ];

  async validate(inputs: Record<string, any>): Promise<boolean> {
    if (!inputs.wallet_address) {
      throw new Error('wallet_address is required');
    }

    // Validate wallet address format
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(inputs.wallet_address)) {
      throw new Error('Invalid wallet address format. Must be a valid Ethereum address.');
    }

    // Validate wallet provider if specified
    if (inputs.wallet_provider && !this.supportedWallets.includes(inputs.wallet_provider)) {
      throw new Error(`Unsupported wallet provider: ${inputs.wallet_provider}`);
    }

    // Validate chain ID if specified
    if (inputs.chain_id && !this.isValidChainId(inputs.chain_id)) {
      throw new Error(`Invalid chain ID: ${inputs.chain_id}`);
    }

    return true;
  }

  async execute(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      logger.info(`💳 Connecting wallet: ${inputs.wallet_address}`);

      const walletAddress = inputs.wallet_address;
      const chainId = inputs.chain_id || '1';
      const walletProvider = inputs.wallet_provider || 'metamask';

      // Get wallet balance
      const balance = await this.getWalletBalance(walletAddress, chainId);
      
      // Get token balances if specified
      const tokenBalances = inputs.check_token_balances ? 
        await this.getTokenBalances(walletAddress, chainId, inputs.token_addresses) : [];

      // Get wallet transaction history
      const transactionHistory = inputs.include_history ? 
        await this.getTransactionHistory(walletAddress, chainId) : [];

      // Validate wallet capabilities
      const capabilities = await this.getWalletCapabilities(walletProvider, chainId);

      const result = {
        success: true,
        data: {
          wallet: {
            address: walletAddress,
            provider: walletProvider,
            chainId: chainId,
            isConnected: true,
            connectedAt: new Date().toISOString()
          },
          balance: {
            native: balance,
            tokens: tokenBalances,
            totalValueUSD: this.calculateTotalValue(balance, tokenBalances)
          },
          capabilities: capabilities,
          transactionHistory: transactionHistory,
          security: {
            isContract: await this.isContractAddress(walletAddress, chainId),
            riskLevel: this.assessRiskLevel(walletAddress),
            recommendations: this.getSecurityRecommendations(walletProvider)
          },
          supportedOperations: this.getSupportedOperations(walletProvider, chainId)
        }
      };

      logger.info(`✅ Wallet connected successfully: ${walletAddress}`);
      return result;

    } catch (error) {
      logger.error(`❌ Wallet connection failed:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Wallet connection failed'
      };
    }
  }

  async estimateGas(inputs: Record<string, any>): Promise<string> {
    // Wallet connection doesn't require gas
    return '0';
  }

  private async getWalletBalance(address: string, chainId: string): Promise<any> {
    try {
      // In a real implementation, this would query the blockchain
      // Mock balance data
      const mockBalances: Record<string, string> = {
        '1': (Math.random() * 10).toFixed(4), // ETH
        '56': (Math.random() * 100).toFixed(4), // BNB
        '137': (Math.random() * 1000).toFixed(4), // MATIC
        '42161': (Math.random() * 10).toFixed(4), // ETH on Arbitrum
        '10': (Math.random() * 10).toFixed(4), // ETH on Optimism
      };

      const balance = mockBalances[chainId] || '0';
      const chainNames: Record<string, string> = {
        '1': 'ETH',
        '56': 'BNB', 
        '137': 'MATIC',
        '42161': 'ETH',
        '10': 'ETH'
      };

      return {
        amount: balance,
        symbol: chainNames[chainId] || 'ETH',
        decimals: 18,
        valueUSD: (parseFloat(balance) * 2000).toFixed(2) // Mock USD value
      };
    } catch (error) {
      logger.error('Failed to get wallet balance:', error);
      return {
        amount: '0',
        symbol: 'ETH',
        decimals: 18,
        valueUSD: '0'
      };
    }
  }

  private async getTokenBalances(address: string, chainId: string, tokenAddresses?: string[]): Promise<TokenInfo[]> {
    try {
      // Mock token balances
      const mockTokens: TokenInfo[] = [
        {
          address: '0xA0b86a33E6417c4a4e6d3b7e6d8f0e8b8e8c8d8e',
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
          balance: (Math.random() * 1000).toFixed(2),
          valueUSD: (Math.random() * 1000).toFixed(2)
        },
        {
          address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          symbol: 'DAI',
          name: 'Dai Stablecoin',
          decimals: 18,
          balance: (Math.random() * 500).toFixed(4),
          valueUSD: (Math.random() * 500).toFixed(2)
        },
        {
          address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
          symbol: 'UNI',
          name: 'Uniswap',
          decimals: 18,
          balance: (Math.random() * 50).toFixed(4),
          valueUSD: (Math.random() * 300).toFixed(2)
        }
      ];

      // Filter by requested token addresses if provided
      if (tokenAddresses && tokenAddresses.length > 0) {
        return mockTokens.filter(token => 
          tokenAddresses.includes(token.address)
        );
      }

      return mockTokens;
    } catch (error) {
      logger.error('Failed to get token balances:', error);
      return [];
    }
  }

  private async getTransactionHistory(address: string, chainId: string): Promise<any[]> {
    try {
      // Mock transaction history
      return [
        {
          hash: '0x' + 'a'.repeat(64),
          blockNumber: 18000000,
          timestamp: Date.now() - 3600000, // 1 hour ago
          from: address,
          to: '0x1111111254fb6c44bAC0beD2854e76F90643097d',
          value: '0.1',
          gasUsed: '21000',
          status: 'success',
          type: 'swap'
        },
        {
          hash: '0x' + 'b'.repeat(64),
          blockNumber: 17999000,
          timestamp: Date.now() - 86400000, // 1 day ago
          from: '0x742d35Cc6634C0532925a3b8D427b2C0ef46c',
          to: address,
          value: '1.5',
          gasUsed: '21000',
          status: 'success',
          type: 'transfer'
        }
      ];
    } catch (error) {
      logger.error('Failed to get transaction history:', error);
      return [];
    }
  }

  private async getWalletCapabilities(provider: string, chainId: string): Promise<any> {
    const capabilities = {
      canSign: true,
      canSendTransactions: true,
      supportsEIP1559: ['1', '137', '42161', '10'].includes(chainId),
      supportsTypedData: provider !== 'ledger', // Ledger has limited typed data support
      supportsBatching: provider === 'metamask' || provider === 'coinbase',
      supportsChainSwitching: provider !== 'ledger' && provider !== 'trezor',
      maxGasLimit: this.getMaxGasLimit(chainId),
      supportedStandards: ['ERC20', 'ERC721', 'ERC1155']
    };

    return capabilities;
  }

  private async isContractAddress(address: string, chainId: string): Promise<boolean> {
    try {
      // In a real implementation, this would check if the address has code
      // For now, return false (assume it's an EOA)
      return false;
    } catch (error) {
      return false;
    }
  }

  private assessRiskLevel(address: string): 'low' | 'medium' | 'high' {
    // Mock risk assessment
    return 'low';
  }

  private getSecurityRecommendations(provider: string): string[] {
    const recommendations: string[] = [];

    if (provider === 'metamask') {
      recommendations.push('✅ MetaMask is a trusted wallet provider');
      recommendations.push('🔒 Always verify transaction details before signing');
    }

    if (provider === 'walletconnect') {
      recommendations.push('📱 Ensure you\'re connecting to trusted dApps only');
      recommendations.push('🔐 Review session permissions carefully');
    }

    if (provider === 'ledger' || provider === 'trezor') {
      recommendations.push('🛡️ Hardware wallets provide excellent security');
      recommendations.push('✅ Always verify addresses on device screen');
    }

    recommendations.push('⚠️ Never share your private keys or seed phrase');
    recommendations.push('🔍 Double-check recipient addresses for transactions');
    
    return recommendations;
  }

  private getSupportedOperations(provider: string, chainId: string): string[] {
    const operations = ['send', 'receive', 'swap'];

    if (provider === 'metamask' || provider === 'coinbase') {
      operations.push('stake', 'lend', 'bridge');
    }

    if (['1', '137', '42161', '10'].includes(chainId)) {
      operations.push('defi', 'nft', 'governance');
    }

    return operations;
  }

  private calculateTotalValue(nativeBalance: any, tokenBalances: TokenInfo[]): string {
    const nativeValue = parseFloat(nativeBalance.valueUSD || '0');
    const tokenValue = tokenBalances.reduce((total, token) => 
      total + parseFloat(token.valueUSD || '0'), 0);
    
    return (nativeValue + tokenValue).toFixed(2);
  }

  private isValidChainId(chainId: string): boolean {
    const validChainIds = ['1', '56', '137', '42161', '10', '250', '43114', '25', '8453', '324', '59144', '5000', '5'];
    return validChainIds.includes(chainId);
  }

  private getMaxGasLimit(chainId: string): string {
    const gasLimits: Record<string, string> = {
      '1': '30000000',
      '56': '30000000', 
      '137': '30000000',
      '42161': '1125899906842624',
      '10': '30000000'
    };

    return gasLimits[chainId] || '30000000';
  }
}