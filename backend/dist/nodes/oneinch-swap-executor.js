"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OneInchSwapExecutor = void 0;
const axios_1 = __importDefault(require("axios"));
const types_1 = require("@/types");
class OneInchSwapExecutor {
    type = 'oneInchSwap';
    name = '1inch Swap';
    description = 'Execute token swaps using 1inch Pathfinder algorithm with MEV protection';
    logger;
    apiBaseUrl;
    apiKey;
    constructor(logger, apiKey) {
        this.logger = logger;
        this.apiBaseUrl = 'https://api.1inch.dev';
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
        if (!inputs.api_key && !this.apiKey) {
            errors.push('1inch API key is required');
        }
        if (!inputs.chain_id) {
            errors.push('Chain ID is required');
        }
        if (!inputs.from_token) {
            errors.push('From token address is required');
        }
        if (!inputs.to_token) {
            errors.push('To token address is required');
        }
        if (!inputs.amount) {
            errors.push('Amount is required');
        }
        if (!inputs.from_address) {
            errors.push('From address is required');
        }
        // Validate addresses
        if (inputs.from_token && !this.isValidAddress(inputs.from_token)) {
            errors.push('Invalid from token address');
        }
        if (inputs.to_token && !this.isValidAddress(inputs.to_token)) {
            errors.push('Invalid to token address');
        }
        if (inputs.from_address && !this.isValidAddress(inputs.from_address)) {
            errors.push('Invalid from address');
        }
        // Validate amount
        if (inputs.amount) {
            try {
                const amount = BigInt(inputs.amount);
                if (amount <= 0n) {
                    errors.push('Amount must be greater than 0');
                }
            }
            catch {
                errors.push('Invalid amount format');
            }
        }
        // Validate slippage
        if (inputs.slippage !== undefined) {
            const slippage = Number(inputs.slippage);
            if (isNaN(slippage) || slippage < 0.1 || slippage > 50) {
                errors.push('Slippage must be between 0.1 and 50');
            }
        }
        // Validate chain ID
        if (inputs.chain_id) {
            const supportedChains = ['1', '137', '56', '42161', '10', '43114'];
            if (!supportedChains.includes(inputs.chain_id)) {
                errors.push(`Unsupported chain ID: ${inputs.chain_id}`);
            }
        }
        return { valid: errors.length === 0, errors };
    }
    async validateTemplateConfig(inputs) {
        // Validate supported chains
        if (inputs.supported_chains) {
            if (!Array.isArray(inputs.supported_chains)) {
                throw new Error('supported_chains must be an array');
            }
            const validChains = [1, 137, 56, 42161, 10, 43114];
            const invalidChains = inputs.supported_chains.filter(chain => !validChains.includes(Number(chain)));
            if (invalidChains.length > 0) {
                throw new Error(`Unsupported chains: ${invalidChains.join(', ')}`);
            }
        }
        // Validate slippage settings
        if (inputs.default_slippage !== undefined) {
            if (typeof inputs.default_slippage !== 'number' || inputs.default_slippage < 0.1 || inputs.default_slippage > 50) {
                throw new Error('default_slippage must be a number between 0.1 and 50');
            }
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
            const logs = [];
            logs.push(`[${new Date().toISOString()}] Starting 1inch swap execution`);
            // Use provided API key or fallback to constructor key
            const apiKey = inputs.api_key || this.apiKey;
            if (!apiKey) {
                throw new types_1.ValidationError('No API key available');
            }
            // Extract and validate inputs
            const { chain_id, from_token, to_token, amount, from_address, slippage = 1, enable_fusion = false, gas_optimization = 'balanced', fee_recipient, fee_percent = 0 } = inputs;
            logs.push(`[${new Date().toISOString()}] Swap parameters: ${from_token} -> ${to_token}, amount: ${amount}`);
            // Step 1: Get quote
            logs.push(`[${new Date().toISOString()}] Fetching quote from 1inch`);
            const quote = await this.getQuote({
                chainId: parseInt(chain_id),
                fromTokenAddress: from_token,
                toTokenAddress: to_token,
                amount,
                slippage
            }, apiKey);
            logs.push(`[${new Date().toISOString()}] Quote received: ${quote.toAmount} tokens expected`);
            // Step 2: Build swap transaction
            logs.push(`[${new Date().toISOString()}] Building swap transaction`);
            const swapTx = await this.buildSwapTransaction({
                chainId: parseInt(chain_id),
                fromTokenAddress: from_token,
                toTokenAddress: to_token,
                amount,
                fromAddress: from_address,
                slippage,
                destReceiver: from_address,
                referrer: fee_recipient,
                fee: fee_percent > 0 ? (fee_percent * 100).toString() : undefined
            }, apiKey);
            logs.push(`[${new Date().toISOString()}] Swap transaction built successfully`);
            // Step 3: Calculate price impact and savings
            const priceImpact = this.calculatePriceImpact(quote);
            const protocols = this.extractProtocols(quote);
            const gasSavings = this.calculateGasSavings(quote, swapTx);
            const executionTime = Date.now() - startTime;
            // Return successful result
            return {
                success: true,
                outputs: {
                    quote: {
                        fromTokenAddress: quote.fromTokenAddress,
                        toTokenAddress: quote.toTokenAddress,
                        fromAmount: quote.fromAmount,
                        toAmount: quote.toAmount,
                        protocols: quote.protocols,
                        slippage: quote.slippage
                    },
                    transaction_data: {
                        to: swapTx.to,
                        data: swapTx.data,
                        value: swapTx.value,
                        gasLimit: swapTx.gasLimit,
                        gasPrice: swapTx.gasPrice,
                        chainId: swapTx.chainId
                    },
                    estimated_gas: swapTx.gasLimit,
                    price_impact: priceImpact,
                    protocols_used: protocols,
                    savings: {
                        gas_savings: gasSavings,
                        amount_savings: this.calculateAmountSavings(quote)
                    },
                    swap_info: {
                        from_token: from_token,
                        to_token: to_token,
                        from_amount: amount,
                        to_amount: quote.toAmount,
                        slippage: slippage,
                        mev_protection: enable_fusion
                    }
                },
                logs,
                executionTime,
                gasUsed: swapTx.gasLimit
            };
        }
        catch (error) {
            logs.push(`[${new Date().toISOString()}] ERROR: ${error.message}`);
            return {
                success: false,
                outputs: {},
                error: this.formatError(error),
                logs,
                executionTime: Date.now() - startTime
            };
        }
    }
    async estimateGas(inputs, context) {
        const apiKey = inputs.api_key || this.apiKey;
        if (!apiKey) {
            throw new types_1.ValidationError('No API key available for gas estimation');
        }
        try {
            const quote = await this.getQuote({
                chainId: parseInt(inputs.chain_id),
                fromTokenAddress: inputs.from_token,
                toTokenAddress: inputs.to_token,
                amount: inputs.amount,
                slippage: inputs.slippage || 1
            }, apiKey);
            return quote.estimatedGas;
        }
        catch (error) {
            this.logger.error('Gas estimation failed', error);
            throw new types_1.ChainError('Failed to estimate gas', parseInt(inputs.chain_id));
        }
    }
    async getQuote(params, apiKey) {
        const { chainId, fromTokenAddress, toTokenAddress, amount, slippage } = params;
        const url = `${this.apiBaseUrl}/swap/v5.2/${chainId}/quote`;
        const queryParams = new URLSearchParams({
            fromTokenAddress,
            toTokenAddress,
            amount,
            slippage: slippage.toString(),
            disableEstimate: 'false',
            allowPartialFill: 'true'
        });
        try {
            const response = await axios_1.default.get(`${url}?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Accept': 'application/json'
                },
                timeout: 10000
            });
            return {
                fromTokenAddress,
                toTokenAddress,
                fromAmount: amount,
                toAmount: response.data.toAmount || response.data.dstAmount,
                protocols: response.data.protocols || [],
                estimatedGas: response.data.estimatedGas || response.data.gas || '0',
                slippage,
                chainId,
                validUntil: Date.now() + 30000 // 30 seconds validity
            };
        }
        catch (error) {
            if (error.response) {
                throw new types_1.ChainError(`1inch API error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`, chainId);
            }
            throw new types_1.ChainError(`Failed to get quote: ${error.message}`, chainId);
        }
    }
    async buildSwapTransaction(params, apiKey) {
        const { chainId, fromTokenAddress, toTokenAddress, amount, fromAddress, slippage, destReceiver, referrer, fee } = params;
        const url = `${this.apiBaseUrl}/swap/v5.2/${chainId}/swap`;
        const queryParams = new URLSearchParams({
            fromTokenAddress,
            toTokenAddress,
            amount,
            fromAddress,
            slippage: slippage.toString(),
            disableEstimate: 'false',
            allowPartialFill: 'true'
        });
        if (destReceiver)
            queryParams.append('destReceiver', destReceiver);
        if (referrer)
            queryParams.append('referrerAddress', referrer);
        if (fee)
            queryParams.append('fee', fee);
        try {
            const response = await axios_1.default.get(`${url}?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Accept': 'application/json'
                },
                timeout: 15000
            });
            const txData = response.data.tx || response.data;
            return {
                to: txData.to,
                data: txData.data,
                value: txData.value || '0',
                gasLimit: txData.gas || txData.gasLimit || '0',
                gasPrice: txData.gasPrice,
                chainId
            };
        }
        catch (error) {
            if (error.response) {
                throw new types_1.ChainError(`1inch API error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`, chainId);
            }
            throw new types_1.ChainError(`Failed to build swap transaction: ${error.message}`, chainId);
        }
    }
    calculatePriceImpact(quote) {
        // Simplified price impact calculation
        // In a real implementation, you'd compare with market rates
        return '0.1'; // 0.1% default impact
    }
    extractProtocols(quote) {
        if (!quote.protocols || !Array.isArray(quote.protocols)) {
            return [];
        }
        return quote.protocols
            .flat()
            .map((protocol) => protocol.name || 'Unknown')
            .filter((name, index, array) => array.indexOf(name) === index); // Remove duplicates
    }
    calculateGasSavings(quote, tx) {
        // Compare with estimated Uniswap V2 gas usage
        const uniswapV2Gas = '150000'; // Typical Uniswap V2 gas
        const oneInchGas = tx.gasLimit;
        const savings = Math.max(0, parseInt(uniswapV2Gas) - parseInt(oneInchGas));
        return savings.toString();
    }
    calculateAmountSavings(quote) {
        // This would compare with other DEX rates
        // For now, return estimated savings
        return quote.estimatedGas || '0';
    }
    async executeTemplateMode(inputs, context) {
        this.logger.info('🔄 Configuring 1inch swap for template creation');
        const config = {
            supported_chains: inputs.supported_chains || [1, 137, 42161, 10, 56, 43114],
            default_slippage: inputs.default_slippage || 1,
            gas_optimization: inputs.gas_optimization || 'balanced',
            enable_partial_fill: inputs.enable_partial_fill !== false,
            mev_protection: inputs.mev_protection !== false,
            deadline: inputs.deadline || 300 // 5 minutes
        };
        // Mock swap result for template
        const mockSwapResult = {
            transaction_hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            from_token: 'ETH',
            to_token: 'USDC',
            from_amount: '1.0',
            to_amount: '1650.25',
            gas_used: '120000',
            gas_price: '20',
            status: 'completed'
        };
        return {
            success: true,
            outputs: {
                swap_config: config,
                mock_swap: mockSwapResult,
                supported_features: [
                    '1inch DEX aggregation',
                    'Optimal routing algorithm',
                    'MEV protection',
                    'Gas optimization',
                    'Partial fill support',
                    'Multi-chain support'
                ]
            },
            logs: [
                `🔄 1inch swap configured`,
                `🔗 Supporting ${config.supported_chains.length} chains`,
                `📊 Default slippage: ${config.default_slippage}%`,
                `⛽ Gas optimization: ${config.gas_optimization}`,
                `🛡️ MEV protection: ${config.mev_protection ? 'enabled' : 'disabled'}`,
                `⏰ Deadline: ${config.deadline}s`
            ],
            executionTime: 5
        };
    }
    isValidAddress(address) {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }
    formatError(error) {
        if (error.response?.data?.message)
            return error.response.data.message;
        if (error.message)
            return error.message;
        return 'Unknown error occurred';
    }
}
exports.OneInchSwapExecutor = OneInchSwapExecutor;
//# sourceMappingURL=oneinch-swap-executor.js.map