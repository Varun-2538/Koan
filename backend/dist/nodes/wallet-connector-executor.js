"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletConnectorExecutor = void 0;
const logger_1 = require("../utils/logger");
class WalletConnectorExecutor {
    type = 'walletConnector';
    name = 'Wallet Connector';
    description = 'Connect and manage cryptocurrency wallets for DeFi operations';
    supportedWallets = [
        'metamask',
        'walletconnect',
        'coinbase',
        'trust',
        'rainbow',
        'phantom', // For Solana
        'ledger',
        'trezor'
    ];
    getNetworkName(chainId) {
        const networks = {
            '1': 'Ethereum Mainnet',
            '5': 'Goerli Testnet',
            '11155111': 'Sepolia Testnet',
            '137': 'Polygon',
            '80001': 'Polygon Mumbai',
            '42161': 'Arbitrum One',
            '421613': 'Arbitrum Goerli',
            '10': 'Optimism',
            '420': 'Optimism Goerli',
            '56': 'BSC',
            '97': 'BSC Testnet',
            '43114': 'Avalanche',
            '43113': 'Avalanche Fuji',
            '250': 'Fantom',
            '4002': 'Fantom Testnet'
        };
        return networks[chainId] || `Chain ${chainId}`;
    }
    async validate(inputs) {
        // Check if this is template creation mode (configuration only)
        const isTemplateMode = inputs.template_creation_mode || inputs.mode === 'template' || !inputs.wallet_address;
        const errors = [];
        if (isTemplateMode) {
            // In template mode, validate configuration instead of actual wallet
            try {
                await this.validateTemplateConfig(inputs);
                return { valid: true, errors: [] };
            }
            catch (error) {
                return { valid: false, errors: [error.message] };
            }
        }
        // In execution mode, require actual wallet address
        if (!inputs.wallet_address) {
            errors.push('wallet_address is required');
        }
        else {
            // Validate wallet address format
            const addressRegex = /^0x[a-fA-F0-9]{40}$/;
            if (!addressRegex.test(inputs.wallet_address)) {
                errors.push('Invalid wallet address format. Must be a valid Ethereum address.');
            }
        }
        // Validate wallet provider if specified
        if (inputs.wallet_provider && !this.supportedWallets.includes(inputs.wallet_provider)) {
            errors.push(`Unsupported wallet provider: ${inputs.wallet_provider}`);
        }
        // Validate chain ID if specified
        if (inputs.chain_id && !this.isValidChainId(inputs.chain_id)) {
            errors.push(`Invalid chain ID: ${inputs.chain_id}`);
        }
        return { valid: errors.length === 0, errors };
    }
    async validateTemplateConfig(inputs) {
        // Validate supported wallets configuration
        if (inputs.supported_wallets) {
            if (!Array.isArray(inputs.supported_wallets)) {
                throw new Error('supported_wallets must be an array');
            }
            const invalidWallets = inputs.supported_wallets.filter(wallet => !this.supportedWallets.includes(wallet));
            if (invalidWallets.length > 0) {
                throw new Error(`Unsupported wallets: ${invalidWallets.join(', ')}`);
            }
        }
        // Validate supported networks configuration
        if (inputs.supported_networks) {
            if (!Array.isArray(inputs.supported_networks)) {
                throw new Error('supported_networks must be an array');
            }
            const invalidNetworks = inputs.supported_networks.filter(chainId => !this.isValidChainId(chainId.toString()));
            if (invalidNetworks.length > 0) {
                throw new Error(`Invalid network IDs: ${invalidNetworks.join(', ')}`);
            }
        }
    }
    async executeTemplateMode(inputs, context) {
        try {
            logger_1.logger.info(`🔧 Configuring wallet connector for template creation`);
            const config = {
                supported_wallets: inputs.supported_wallets || ['metamask', 'walletconnect', 'coinbase'],
                supported_networks: inputs.supported_networks || [1, 137, 42161], // Ethereum, Polygon, Arbitrum
                default_network: inputs.default_network || 1,
                connection_options: {
                    auto_connect: inputs.auto_connect || false,
                    show_balance: inputs.show_balance !== false,
                    show_network_switcher: inputs.show_network_switcher !== false,
                    theme: inputs.theme || 'light'
                }
            };
            // Simulate wallet connection configuration
            const mockConnection = {
                address: '0x0000000000000000000000000000000000000000', // Template placeholder
                provider: config.supported_wallets[0],
                chainId: config.default_network.toString(),
                isConnected: false, // Template mode - not actually connected
                network: this.getNetworkName(config.default_network.toString())
            };
            return {
                success: true,
                outputs: {
                    wallet_connection: mockConnection,
                    wallet_config: config,
                    supported_wallets: config.supported_wallets,
                    supported_networks: config.supported_networks
                },
                executionTime: 100, // Fast template configuration
                logs: [
                    `Configured wallet connector with ${config.supported_wallets.length} wallet options`,
                    `Supporting ${config.supported_networks.length} networks`,
                    `Default network: ${this.getNetworkName(config.default_network.toString())}`
                ]
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                executionTime: 100
            };
        }
    }
    async execute(inputs, context) {
        try {
            const isTemplateMode = inputs.template_creation_mode || inputs.mode === 'template' || !inputs.wallet_address;
            if (isTemplateMode) {
                return this.executeTemplateMode(inputs, context);
            }
            logger_1.logger.info(`💳 Connecting wallet: ${inputs.wallet_address}`);
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
            logger_1.logger.info(`✅ Wallet connected successfully: ${walletAddress}`);
            return result;
        }
        catch (error) {
            logger_1.logger.error(`❌ Wallet connection failed:`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Wallet connection failed'
            };
        }
    }
    async estimateGas(inputs) {
        // Wallet connection doesn't require gas
        return '0';
    }
    async getWalletBalance(address, chainId) {
        try {
            // In a real implementation, this would query the blockchain
            // Mock balance data
            const mockBalances = {
                '1': (Math.random() * 10).toFixed(4), // ETH
                '56': (Math.random() * 100).toFixed(4), // BNB
                '137': (Math.random() * 1000).toFixed(4), // MATIC
                '42161': (Math.random() * 10).toFixed(4), // ETH on Arbitrum
                '10': (Math.random() * 10).toFixed(4), // ETH on Optimism
            };
            const balance = mockBalances[chainId] || '0';
            const chainNames = {
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
        }
        catch (error) {
            logger_1.logger.error('Failed to get wallet balance:', error);
            return {
                amount: '0',
                symbol: 'ETH',
                decimals: 18,
                valueUSD: '0'
            };
        }
    }
    async getTokenBalances(address, chainId, tokenAddresses) {
        try {
            // Mock token balances
            const mockTokens = [
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
                return mockTokens.filter(token => tokenAddresses.includes(token.address));
            }
            return mockTokens;
        }
        catch (error) {
            logger_1.logger.error('Failed to get token balances:', error);
            return [];
        }
    }
    async getTransactionHistory(address, chainId) {
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
        }
        catch (error) {
            logger_1.logger.error('Failed to get transaction history:', error);
            return [];
        }
    }
    async getWalletCapabilities(provider, chainId) {
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
    async isContractAddress(address, chainId) {
        try {
            // In a real implementation, this would check if the address has code
            // For now, return false (assume it's an EOA)
            return false;
        }
        catch (error) {
            return false;
        }
    }
    assessRiskLevel(address) {
        // Mock risk assessment
        return 'low';
    }
    getSecurityRecommendations(provider) {
        const recommendations = [];
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
    getSupportedOperations(provider, chainId) {
        const operations = ['send', 'receive', 'swap'];
        if (provider === 'metamask' || provider === 'coinbase') {
            operations.push('stake', 'lend', 'bridge');
        }
        if (['1', '137', '42161', '10'].includes(chainId)) {
            operations.push('defi', 'nft', 'governance');
        }
        return operations;
    }
    calculateTotalValue(nativeBalance, tokenBalances) {
        const nativeValue = parseFloat(nativeBalance.valueUSD || '0');
        const tokenValue = tokenBalances.reduce((total, token) => total + parseFloat(token.valueUSD || '0'), 0);
        return (nativeValue + tokenValue).toFixed(2);
    }
    isValidChainId(chainId) {
        const supportedChains = [
            '1', '5', '11155111', // Ethereum
            '137', '80001', // Polygon
            '42161', '421613', // Arbitrum
            '10', '420', // Optimism
            '56', '97', // BSC
            '43114', '43113', // Avalanche
            '250', '4002' // Fantom
        ];
        return supportedChains.includes(chainId);
    }
    getMaxGasLimit(chainId) {
        const gasLimits = {
            '1': '30000000',
            '56': '30000000',
            '137': '30000000',
            '42161': '1125899906842624',
            '10': '30000000'
        };
        return gasLimits[chainId] || '30000000';
    }
}
exports.WalletConnectorExecutor = WalletConnectorExecutor;
//# sourceMappingURL=wallet-connector-executor.js.map