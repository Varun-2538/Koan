"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LimitOrderExecutor = void 0;
class LimitOrderExecutor {
    logger;
    apiKey;
    type = 'limitOrder';
    name = '1inch Limit Order';
    description = 'Create and manage limit orders using 1inch Limit Order Protocol';
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
        if (!inputs.price) {
            errors.push('price is required');
        }
        if (!inputs.wallet_address) {
            errors.push('wallet_address is required');
        }
        if (!this.apiKey) {
            errors.push('1inch API key is required');
        }
        if (inputs.order_type && !['limit', 'stop-loss', 'take-profit'].includes(inputs.order_type)) {
            errors.push('order_type must be one of: limit, stop-loss, take-profit');
        }
        if (inputs.chain_id && !this.isValidChainId(inputs.chain_id.toString())) {
            errors.push(`Unsupported chain ID for Limit Orders: ${inputs.chain_id}`);
        }
        return { valid: errors.length === 0, errors };
    }
    async validateTemplateConfig(inputs) {
        // Validate supported chains for Limit Orders
        if (inputs.supported_chains) {
            if (!Array.isArray(inputs.supported_chains)) {
                throw new Error('supported_chains must be an array');
            }
            const limitOrderChains = [1, 137, 42161, 10, 56, 43114]; // Limit orders supported chains
            const invalidChains = inputs.supported_chains.filter(chain => !limitOrderChains.includes(Number(chain)));
            if (invalidChains.length > 0) {
                throw new Error(`Limit Orders not supported on chains: ${invalidChains.join(', ')}`);
            }
        }
        // Validate order types
        if (inputs.supported_order_types) {
            if (!Array.isArray(inputs.supported_order_types)) {
                throw new Error('supported_order_types must be an array');
            }
            const validTypes = ['limit', 'stop-loss', 'take-profit'];
            const invalidTypes = inputs.supported_order_types.filter(type => !validTypes.includes(type));
            if (invalidTypes.length > 0) {
                throw new Error(`Invalid order types: ${invalidTypes.join(', ')}`);
            }
        }
        // Validate expiration settings
        if (inputs.default_expiration && (typeof inputs.default_expiration !== 'number' || inputs.default_expiration < 3600)) {
            throw new Error('default_expiration must be a number >= 3600 seconds (1 hour)');
        }
        // Validate partial fill settings
        if (inputs.allow_partial_fill !== undefined && typeof inputs.allow_partial_fill !== 'boolean') {
            throw new Error('allow_partial_fill must be a boolean');
        }
    }
    async execute(inputs, context) {
        const startTime = Date.now();
        const isTemplateMode = inputs.template_creation_mode || inputs.mode === 'template' || inputs.config_only;
        try {
            if (isTemplateMode) {
                return this.executeTemplateMode(inputs, context);
            }
            // Execute limit order creation
            const orderResult = await this.createLimitOrder(inputs);
            return {
                success: true,
                outputs: {
                    limit_order: orderResult,
                    order_id: orderResult.orderId,
                    from_amount: orderResult.fromToken.amount,
                    to_amount: orderResult.toToken.amount,
                    order_type: orderResult.orderType,
                    price: orderResult.price,
                    status: orderResult.status,
                    expiration: orderResult.expiration,
                    fillable: orderResult.fillable
                },
                logs: [
                    `📝 Limit order created: ${orderResult.fromToken.symbol} → ${orderResult.toToken.symbol}`,
                    `💰 Amount: ${orderResult.fromToken.amount} ${orderResult.fromToken.symbol} for ${orderResult.toToken.amount} ${orderResult.toToken.symbol}`,
                    `💲 Price: ${orderResult.price}`,
                    `📊 Order type: ${orderResult.orderType}`,
                    `⏰ Expires: ${orderResult.expiration}`,
                    `📋 Status: ${orderResult.status}`,
                    `🔗 Order ID: ${orderResult.orderId}`
                ],
                executionTime: Date.now() - startTime
            };
        }
        catch (error) {
            this.logger?.error('Limit order execution failed:', error);
            return {
                success: false,
                outputs: {},
                error: error.message,
                logs: [`❌ Failed to create limit order: ${error.message}`],
                executionTime: Date.now() - startTime
            };
        }
    }
    async executeTemplateMode(inputs, context) {
        this.logger?.info('📝 Configuring 1inch Limit Order Protocol for template creation');
        const config = {
            supported_chains: inputs.supported_chains || [1, 137, 42161, 10, 56, 43114],
            supported_order_types: inputs.supported_order_types || ['limit', 'stop-loss', 'take-profit'],
            default_expiration: inputs.default_expiration || 86400, // 24 hours
            allow_partial_fill: inputs.allow_partial_fill !== false,
            min_order_size: inputs.min_order_size || '0.001',
            max_order_size: inputs.max_order_size || '1000000',
            fee_rate: inputs.fee_rate || 0.001 // 0.1%
        };
        // Mock limit order result for template
        const mockOrderResult = {
            orderId: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            fromToken: {
                symbol: 'ETH',
                name: 'Ethereum',
                address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
                amount: '1.0'
            },
            toToken: {
                symbol: 'USDC',
                name: 'USD Coin',
                address: '0xA0b86a33E6441fb3cD7b2a9da94C2b48A8aE5fF0',
                amount: '1700.00'
            },
            orderType: 'limit',
            price: '1700.00',
            status: 'pending',
            expiration: new Date(Date.now() + config.default_expiration * 1000).toISOString(),
            maker: '0x1234567890123456789012345678901234567890',
            signature: '0xabcdef...',
            fillable: true
        };
        return {
            success: true,
            outputs: {
                limit_order_config: config,
                mock_order: mockOrderResult,
                supported_features: [
                    '1inch Limit Order Protocol',
                    'Multiple order types (limit, stop-loss, take-profit)',
                    'Partial fill support',
                    'Gasless order placement',
                    'Cross-chain compatibility',
                    'Advanced order management'
                ]
            },
            logs: [
                `📝 1inch Limit Order Protocol configured`,
                `🔗 Supporting ${config.supported_chains.length} chains`,
                `📊 Order types: ${config.supported_order_types.join(', ')}`,
                `⏰ Default expiration: ${config.default_expiration / 3600}h`,
                `🔄 Partial fills: ${config.allow_partial_fill ? 'enabled' : 'disabled'}`,
                `💰 Order size range: ${config.min_order_size} - ${config.max_order_size}`,
                `💸 Fee rate: ${(config.fee_rate * 100).toFixed(2)}%`
            ],
            executionTime: 6
        };
    }
    async createLimitOrder(inputs) {
        const { from_token, to_token, amount, price, wallet_address, order_type = 'limit', expiration = 86400, chain_id = 1 } = inputs;
        // In a real implementation, this would call the 1inch Limit Order Protocol API
        // For now, return mock data structure
        const mockOrderResult = {
            orderId: `0x${Math.random().toString(16).substr(2, 64)}`,
            fromToken: {
                symbol: from_token,
                name: `${from_token} Token`,
                address: '0x...',
                amount: amount.toString()
            },
            toToken: {
                symbol: to_token,
                name: `${to_token} Token`,
                address: '0x...',
                amount: (parseFloat(amount) * parseFloat(price)).toFixed(6)
            },
            orderType: order_type,
            price: price.toString(),
            status: 'pending',
            expiration: new Date(Date.now() + expiration * 1000).toISOString(),
            maker: wallet_address,
            signature: `0x${Math.random().toString(16).substr(2, 130)}`,
            fillable: true
        };
        return mockOrderResult;
    }
    isValidChainId(chainId) {
        // Limit Order Protocol supported chains
        const limitOrderChains = ['1', '137', '42161', '10', '56', '43114']; // Ethereum, Polygon, Arbitrum, Optimism, BSC, Avalanche
        return limitOrderChains.includes(chainId);
    }
}
exports.LimitOrderExecutor = LimitOrderExecutor;
//# sourceMappingURL=limit-order-executor.js.map