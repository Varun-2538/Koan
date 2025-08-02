"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OneInchQuoteExecutor = void 0;
class OneInchQuoteExecutor {
    logger;
    apiKey;
    type = 'oneInchQuote';
    name = '1inch Quote Engine';
    description = 'Get optimal swap quotes using 1inch Pathfinder algorithm with protocol routing';
    constructor(logger, apiKey) {
        this.logger = logger;
        this.apiKey = apiKey;
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
        if (!inputs.from_token) {
            errors.push('from_token is required');
        }
        if (!inputs.to_token) {
            errors.push('to_token is required');
        }
        if (!inputs.amount) {
            errors.push('amount is required');
        }
        if (!this.apiKey) {
            errors.push('1inch API key is required');
        }
        if (inputs.slippage && (typeof inputs.slippage !== 'number' || inputs.slippage < 0 || inputs.slippage > 50)) {
            errors.push('slippage must be a number between 0 and 50');
        }
        if (inputs.chain_id && !this.isValidChainId(inputs.chain_id.toString())) {
            errors.push(`Unsupported chain ID: ${inputs.chain_id}`);
        }
        return { valid: errors.length === 0, errors };
    }
    async validateTemplateConfig(inputs) {
        // Validate slippage settings
        if (inputs.default_slippage !== undefined) {
            if (typeof inputs.default_slippage !== 'number' || inputs.default_slippage < 0 || inputs.default_slippage > 50) {
                throw new Error('default_slippage must be a number between 0 and 50');
            }
        }
        // Validate supported chains
        if (inputs.supported_chains) {
            if (!Array.isArray(inputs.supported_chains)) {
                throw new Error('supported_chains must be an array');
            }
            const validChains = [1, 137, 42161, 10, 56, 43114, 250];
            const invalidChains = inputs.supported_chains.filter(chain => !validChains.includes(Number(chain)));
            if (invalidChains.length > 0) {
                throw new Error(`Unsupported chains: ${invalidChains.join(', ')}`);
            }
        }
        // Validate pathfinder settings
        if (inputs.enable_pathfinder !== undefined && typeof inputs.enable_pathfinder !== 'boolean') {
            throw new Error('enable_pathfinder must be a boolean');
        }
        // Validate gas optimization
        if (inputs.gas_optimization && !['speed', 'balanced', 'cost'].includes(inputs.gas_optimization)) {
            throw new Error('gas_optimization must be one of: speed, balanced, cost');
        }
    }
    async execute(inputs, context) {
        const startTime = Date.now();
        const isTemplateMode = inputs.template_creation_mode || inputs.mode === 'template' || inputs.config_only;
        try {
            if (isTemplateMode) {
                return this.executeTemplateMode(inputs, context);
            }
            // Execute quote fetching
            const quote = await this.fetchQuote(inputs);
            return {
                success: true,
                outputs: {
                    quote_result: quote,
                    from_amount: quote.fromAmount,
                    to_amount: quote.toAmount,
                    estimated_gas: quote.estimatedGas,
                    slippage: quote.slippage,
                    price_impact: quote.priceImpact,
                    protocols_used: quote.protocols.map(p => p.name).join(', '),
                    route: quote.route
                },
                logs: [
                    `🔍 Quote fetched for ${quote.fromToken.symbol} → ${quote.toToken.symbol}`,
                    `💰 Amount: ${quote.fromAmount} ${quote.fromToken.symbol} → ${quote.toAmount} ${quote.toToken.symbol}`,
                    `⛽ Estimated gas: ${quote.estimatedGas}`,
                    `📊 Price impact: ${quote.priceImpact}%`,
                    `🛣️ Route: ${quote.route.join(' → ')}`,
                    `🔗 Protocols: ${quote.protocols.length} protocols used`
                ],
                executionTime: Date.now() - startTime
            };
        }
        catch (error) {
            this.logger?.error('1inch Quote execution failed:', error);
            return {
                success: false,
                outputs: {},
                error: error.message,
                logs: [`❌ Failed to fetch quote: ${error.message}`],
                executionTime: Date.now() - startTime
            };
        }
    }
    async executeTemplateMode(inputs, context) {
        this.logger?.info('🔍 Configuring 1inch quote engine for template creation');
        const config = {
            supported_chains: inputs.supported_chains || [1, 137, 42161, 10], // Ethereum, Polygon, Arbitrum, Optimism
            default_slippage: inputs.default_slippage || 1, // 1%
            enable_pathfinder: inputs.enable_pathfinder !== false,
            gas_optimization: inputs.gas_optimization || 'balanced',
            include_protocols: inputs.include_protocols !== false,
            include_gas_estimate: inputs.include_gas_estimate !== false,
            max_protocols: inputs.max_protocols || 10
        };
        // Mock quote data for template
        const mockQuote = {
            fromToken: {
                symbol: 'ETH',
                name: 'Ethereum',
                address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
                decimals: 18
            },
            toToken: {
                symbol: 'USDC',
                name: 'USD Coin',
                address: '0xA0b86a33E6441203206448619dd91e2df9dd2abF',
                decimals: 6
            },
            fromAmount: '1.0',
            toAmount: '1650.25',
            protocols: [
                { name: 'Uniswap V3', part: 60, fromTokenAddress: '0xEee...', toTokenAddress: '0xA0b...' },
                { name: 'Curve', part: 25, fromTokenAddress: '0xEee...', toTokenAddress: '0xA0b...' },
                { name: '1inch LP', part: 15, fromTokenAddress: '0xEee...', toTokenAddress: '0xA0b...' }
            ],
            estimatedGas: '120000',
            slippage: config.default_slippage,
            priceImpact: '0.12',
            route: ['ETH', 'USDC']
        };
        return {
            success: true,
            outputs: {
                quote_config: config,
                mock_quote: mockQuote,
                supported_features: [
                    '1inch Pathfinder algorithm',
                    'Multi-protocol routing',
                    'Gas optimization',
                    'Slippage protection',
                    'Price impact calculation',
                    'Real-time quotes'
                ]
            },
            logs: [
                `🔍 1inch Quote engine configured`,
                `🔗 Supporting ${config.supported_chains.length} chains`,
                `📊 Default slippage: ${config.default_slippage}%`,
                `🛣️ Pathfinder: ${config.enable_pathfinder ? 'enabled' : 'disabled'}`,
                `⛽ Gas optimization: ${config.gas_optimization}`,
                `🔗 Max protocols: ${config.max_protocols}`
            ],
            executionTime: 5
        };
    }
    async fetchQuote(inputs) {
        const { from_token, to_token, amount, chain_id = 1, slippage = 1 } = inputs;
        // In a real implementation, this would call the 1inch Quote API
        // For now, return mock data structure
        const mockQuote = {
            fromToken: {
                symbol: from_token,
                name: `${from_token} Token`,
                address: '0x...',
                decimals: 18
            },
            toToken: {
                symbol: to_token,
                name: `${to_token} Token`,
                address: '0x...',
                decimals: 18
            },
            fromAmount: amount.toString(),
            toAmount: (parseFloat(amount) * 1650).toFixed(6),
            protocols: [
                { name: 'Uniswap V3', part: 100, fromTokenAddress: '0x...', toTokenAddress: '0x...' }
            ],
            estimatedGas: '150000',
            slippage: slippage,
            priceImpact: '0.15',
            route: [from_token, to_token]
        };
        return mockQuote;
    }
    isValidChainId(chainId) {
        const supportedChains = ['1', '56', '137', '42161', '10', '250', '43114'];
        return supportedChains.includes(chainId);
    }
}
exports.OneInchQuoteExecutor = OneInchQuoteExecutor;
//# sourceMappingURL=oneinch-quote-executor.js.map