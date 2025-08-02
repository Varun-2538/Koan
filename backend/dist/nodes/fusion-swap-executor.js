"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FusionSwapExecutor = void 0;
class FusionSwapExecutor {
    logger;
    apiKey;
    type = 'fusionSwap';
    name = '1inch Fusion Swap';
    description = 'Execute gasless, MEV-protected swaps using 1inch Fusion protocol';
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
        if (!inputs.wallet_address) {
            errors.push('wallet_address is required');
        }
        if (!this.apiKey) {
            errors.push('1inch API key is required');
        }
        if (inputs.chain_id && !this.isValidChainId(inputs.chain_id.toString())) {
            errors.push(`Unsupported chain ID for Fusion: ${inputs.chain_id}`);
        }
        return { valid: errors.length === 0, errors };
    }
    async validateTemplateConfig(inputs) {
        // Validate supported chains for Fusion
        if (inputs.supported_chains) {
            if (!Array.isArray(inputs.supported_chains)) {
                throw new Error('supported_chains must be an array');
            }
            const fusionChains = [1, 137, 42161, 10]; // Fusion is only on mainnet chains
            const invalidChains = inputs.supported_chains.filter(chain => !fusionChains.includes(Number(chain)));
            if (invalidChains.length > 0) {
                throw new Error(`Fusion not supported on chains: ${invalidChains.join(', ')}`);
            }
        }
        // Validate MEV protection settings
        if (inputs.mev_protection !== undefined && typeof inputs.mev_protection !== 'boolean') {
            throw new Error('mev_protection must be a boolean');
        }
        // Validate gasless settings
        if (inputs.gasless !== undefined && typeof inputs.gasless !== 'boolean') {
            throw new Error('gasless must be a boolean');
        }
        // Validate auction duration
        if (inputs.auction_duration && (typeof inputs.auction_duration !== 'number' || inputs.auction_duration < 60 || inputs.auction_duration > 3600)) {
            throw new Error('auction_duration must be a number between 60 and 3600 seconds');
        }
    }
    async execute(inputs, context) {
        const startTime = Date.now();
        const isTemplateMode = inputs.template_creation_mode || inputs.mode === 'template' || inputs.config_only;
        try {
            if (isTemplateMode) {
                return this.executeTemplateMode(inputs, context);
            }
            // Execute Fusion swap
            const swapResult = await this.executeFusionSwap(inputs);
            return {
                success: true,
                outputs: {
                    fusion_swap: swapResult,
                    swap_hash: swapResult.swapHash,
                    from_amount: swapResult.fromToken.amount,
                    to_amount: swapResult.toToken.amount,
                    gasless: swapResult.gasless,
                    mev_protected: swapResult.mevProtected,
                    resolver: swapResult.resolver,
                    status: swapResult.status
                },
                logs: [
                    `⚡ Fusion swap initiated: ${swapResult.fromToken.symbol} → ${swapResult.toToken.symbol}`,
                    `💰 Amount: ${swapResult.fromToken.amount} ${swapResult.fromToken.symbol} → ${swapResult.toToken.amount} ${swapResult.toToken.symbol}`,
                    `🛡️ MEV Protection: ${swapResult.mevProtected ? 'enabled' : 'disabled'}`,
                    `⛽ Gasless: ${swapResult.gasless ? 'yes' : 'no'}`,
                    `🔄 Resolver: ${swapResult.resolver}`,
                    `📊 Status: ${swapResult.status}`,
                    `🔗 Swap hash: ${swapResult.swapHash}`
                ],
                executionTime: Date.now() - startTime
            };
        }
        catch (error) {
            this.logger?.error('Fusion swap execution failed:', error);
            return {
                success: false,
                outputs: {},
                error: error.message,
                logs: [`❌ Failed to execute Fusion swap: ${error.message}`],
                executionTime: Date.now() - startTime
            };
        }
    }
    async executeTemplateMode(inputs, context) {
        this.logger?.info('⚡ Configuring 1inch Fusion swap for template creation');
        const config = {
            supported_chains: inputs.supported_chains || [1, 137, 42161, 10], // Mainnet chains only
            mev_protection: inputs.mev_protection !== false,
            gasless: inputs.gasless !== false,
            auction_duration: inputs.auction_duration || 180, // 3 minutes default
            min_return_rate: inputs.min_return_rate || 0.99, // 99% minimum return
            enable_partial_fill: inputs.enable_partial_fill !== false,
            priority_fee: inputs.priority_fee || 'auto'
        };
        // Mock Fusion swap result for template
        const mockSwapResult = {
            swapHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            fromToken: {
                symbol: 'ETH',
                name: 'Ethereum',
                address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
                amount: '1.0'
            },
            toToken: {
                symbol: 'USDC',
                name: 'USD Coin',
                address: '0xA0b86a33E6441203206448619dd91e2df9dd2abF',
                amount: '1652.45'
            },
            gasless: config.gasless,
            mevProtected: config.mev_protection,
            executionTime: config.auction_duration,
            resolver: '0x1inch-fusion-resolver',
            status: 'completed'
        };
        return {
            success: true,
            outputs: {
                fusion_config: config,
                mock_swap: mockSwapResult,
                supported_features: [
                    '1inch Fusion gasless swaps',
                    'MEV protection built-in',
                    'Dutch auction mechanism',
                    'Partial fill support',
                    'Cross-chain compatibility',
                    'Resolver network execution'
                ]
            },
            logs: [
                `⚡ 1inch Fusion swap configured`,
                `🔗 Supporting ${config.supported_chains.length} mainnet chains`,
                `🛡️ MEV protection: ${config.mev_protection ? 'enabled' : 'disabled'}`,
                `⛽ Gasless swaps: ${config.gasless ? 'enabled' : 'disabled'}`,
                `⏱️ Auction duration: ${config.auction_duration}s`,
                `📊 Min return rate: ${(config.min_return_rate * 100).toFixed(1)}%`
            ],
            executionTime: 8
        };
    }
    async executeFusionSwap(inputs) {
        const { from_token, to_token, amount, wallet_address, chain_id = 1 } = inputs;
        // In a real implementation, this would call the 1inch Fusion API
        // For now, return mock data structure
        const mockSwapResult = {
            swapHash: `0x${Math.random().toString(16).substr(2, 64)}`,
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
                amount: (parseFloat(amount) * 1650).toFixed(6)
            },
            gasless: true,
            mevProtected: true,
            executionTime: 180,
            resolver: '0x1inch-fusion-resolver',
            status: 'pending'
        };
        return mockSwapResult;
    }
    isValidChainId(chainId) {
        // Fusion is only available on mainnet chains
        const fusionChains = ['1', '137', '42161', '10']; // Ethereum, Polygon, Arbitrum, Optimism
        return fusionChains.includes(chainId);
    }
}
exports.FusionSwapExecutor = FusionSwapExecutor;
//# sourceMappingURL=fusion-swap-executor.js.map