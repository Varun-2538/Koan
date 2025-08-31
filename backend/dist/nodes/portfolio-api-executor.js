"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfolioAPIExecutor = void 0;
class PortfolioAPIExecutor {
    logger;
    type = 'portfolioAPI';
    name = 'Portfolio API';
    description = 'Track and analyze DeFi portfolio with 1inch Portfolio API';
    constructor(logger) {
        this.logger = logger;
    }
    async validate(inputs) {
        const isTemplateMode = inputs.template_creation_mode || inputs.mode === 'template' || inputs.config_only;
        const errors = [];
        if (isTemplateMode) {
            try {
                await this.validateTemplateConfig(inputs);
                return { valid: true, errors: [] };
            }
            catch (error) {
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
    async validateTemplateConfig(inputs) {
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
    async execute(inputs, context) {
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
        }
        catch (error) {
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
    async executeTemplateMode(inputs, context) {
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
        const mockPortfolio = {
            totalValue: '12,345.67',
            tokens: [
                {
                    address: '0xA0b86a33E6441fb3cD7b2a9da94C2b48A8aE5fF0',
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
    async fetchPortfolioData(inputs) {
        const { wallet_address, oneinch_api_key, chains = [1] } = inputs;
        // In a real implementation, this would call the 1inch Portfolio API
        // For now, return mock data structure
        const portfolioData = {
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
            }
            catch (error) {
                this.logger?.warn(`Failed to fetch portfolio for chain ${chainId}:`, error);
            }
        }
        // Calculate total value
        const totalValue = portfolioData.tokens.reduce((sum, token) => sum + parseFloat(token.value), 0);
        portfolioData.totalValue = totalValue.toFixed(2);
        return portfolioData;
    }
    async fetchChainPortfolio(walletAddress, chainId, apiKey) {
        // Mock implementation - replace with actual 1inch Portfolio API calls
        // https://docs.1inch.io/docs/aggregation-protocol/api/swagger
        return {
            tokens: [],
            protocols: []
        };
    }
}
exports.PortfolioAPIExecutor = PortfolioAPIExecutor;
//# sourceMappingURL=portfolio-api-executor.js.map