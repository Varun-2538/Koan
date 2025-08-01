"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenSelectorExecutor = void 0;
const logger_1 = require("../utils/logger");
const axios_1 = __importDefault(require("axios"));
class TokenSelectorExecutor {
    type = 'tokenSelector';
    name = 'Token Selector';
    description = 'Select and configure tokens for swapping with metadata and price information';
    defaultTokens = {
        'ETH': {
            address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
            symbol: 'ETH',
            name: 'Ethereum',
            decimals: 18,
            logoUri: 'https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png',
            chainId: 1,
            verified: true
        },
        'USDC': {
            address: '0xA0b86a33E6441fb3cD7b2a9da94C2b48A8aE5fF0',
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6,
            logoUri: 'https://tokens.1inch.io/0xa0b86a33e6441fb3cd7b2a9da94c2b48a8ae5ff0.png',
            chainId: 1,
            verified: true
        },
        'WBTC': {
            address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
            symbol: 'WBTC',
            name: 'Wrapped Bitcoin',
            decimals: 8,
            logoUri: 'https://tokens.1inch.io/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png',
            chainId: 1,
            verified: true
        },
        'USDT': {
            address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            symbol: 'USDT',
            name: 'Tether USD',
            decimals: 6,
            logoUri: 'https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png',
            chainId: 1,
            verified: true
        },
        'DAI': {
            address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
            symbol: 'DAI',
            name: 'Dai Stablecoin',
            decimals: 18,
            logoUri: 'https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png',
            chainId: 1,
            verified: true
        },
        '1INCH': {
            address: '0x111111111117dC0aa78b770fA6A738034120C302',
            symbol: '1INCH',
            name: '1inch Token',
            decimals: 18,
            logoUri: 'https://tokens.1inch.io/0x111111111117dc0aa78b770fa6a738034120c302.png',
            chainId: 1,
            verified: true
        }
    };
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
        if (!inputs.from_token && !inputs.to_token) {
            errors.push('At least one token (from_token or to_token) must be specified');
        }
        // Validate token addresses/symbols
        if (inputs.from_token && !this.isValidToken(inputs.from_token)) {
            errors.push(`Invalid from_token: ${inputs.from_token}`);
        }
        if (inputs.to_token && !this.isValidToken(inputs.to_token)) {
            errors.push(`Invalid to_token: ${inputs.to_token}`);
        }
        // Validate chain ID
        if (inputs.chain_id && !this.isValidChainId(inputs.chain_id)) {
            errors.push(`Unsupported chain ID: ${inputs.chain_id}`);
        }
        return { valid: errors.length === 0, errors };
    }
    async validateTemplateConfig(inputs) {
        // Validate default tokens list
        if (inputs.default_tokens) {
            if (!Array.isArray(inputs.default_tokens)) {
                throw new Error('default_tokens must be an array');
            }
        }
        // Validate enabled tokens list
        if (inputs.enabled_tokens) {
            if (!Array.isArray(inputs.enabled_tokens)) {
                throw new Error('enabled_tokens must be an array');
            }
        }
    }
    async executeTemplateMode(inputs, context) {
        try {
            logger_1.logger.info(`🔧 Configuring token selector for template creation`);
            const config = {
                default_tokens: inputs.default_tokens || ['ETH', 'USDC', 'WBTC', 'DAI', 'USDT', '1INCH'],
                enabled_tokens: inputs.enabled_tokens || ['ETH', 'USDC', 'WBTC', 'DAI', 'USDT', '1INCH', 'LINK', 'UNI', 'AAVE'],
                default_from_token: inputs.default_from_token || 'ETH',
                default_to_token: inputs.default_to_token || 'USDC',
                allow_custom_tokens: inputs.allow_custom_tokens !== false,
                show_popular_tokens: inputs.show_popular_tokens !== false,
                show_balances: inputs.show_balances !== false,
                price_source: inputs.price_source || '1inch',
                include_metadata: inputs.include_metadata !== false
            };
            // Create mock token data for template
            const mockTokens = config.default_tokens.map(symbol => ({
                symbol,
                name: this.getTokenName(symbol),
                address: this.getTokenAddress(symbol),
                decimals: symbol === 'WBTC' ? 8 : 18,
                logoURI: `https://tokens.1inch.io/${this.getTokenAddress(symbol).toLowerCase()}.png`,
                chainId: 1,
                price: this.getMockPrice(symbol),
                balance: '0'
            }));
            return {
                success: true,
                outputs: {
                    token_config: config,
                    available_tokens: mockTokens,
                    default_pair: {
                        from: config.default_from_token,
                        to: config.default_to_token
                    },
                    supported_features: {
                        custom_tokens: config.allow_custom_tokens,
                        popular_tokens: config.show_popular_tokens,
                        balance_display: config.show_balances,
                        price_display: true
                    }
                },
                executionTime: 150,
                logs: [
                    `Configured token selector with ${config.default_tokens.length} default tokens`,
                    `${config.enabled_tokens.length} tokens enabled`,
                    `Default pair: ${config.default_from_token} → ${config.default_to_token}`,
                    `Custom tokens: ${config.allow_custom_tokens ? 'enabled' : 'disabled'}`
                ]
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                executionTime: 150
            };
        }
    }
    getTokenName(symbol) {
        const names = {
            'ETH': 'Ethereum',
            'USDC': 'USD Coin',
            'WBTC': 'Wrapped Bitcoin',
            'DAI': 'Dai Stablecoin',
            'USDT': 'Tether USD',
            '1INCH': '1inch Token',
            'LINK': 'Chainlink',
            'UNI': 'Uniswap',
            'AAVE': 'Aave Token'
        };
        return names[symbol] || symbol;
    }
    getTokenAddress(symbol) {
        const addresses = {
            'ETH': '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
            'USDC': '0xA0b86a33E6441fb3cD7b2a9da94C2b48A8aE5fF0',
            'WBTC': '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
            'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F',
            'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            '1INCH': '0x111111111117dC0aa78b770fA6A738034120C302',
            'LINK': '0x514910771AF9Ca656af840dff83E8264EcF986CA',
            'UNI': '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
            'AAVE': '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9'
        };
        return addresses[symbol] || '0x0000000000000000000000000000000000000000';
    }
    getMockPrice(symbol) {
        const prices = {
            'ETH': '2500.00',
            'USDC': '1.00',
            'WBTC': '43000.00',
            'DAI': '1.00',
            'USDT': '1.00',
            '1INCH': '0.35',
            'LINK': '15.50',
            'UNI': '7.20',
            'AAVE': '95.00'
        };
        return prices[symbol] || '0.00';
    }
    async execute(inputs, context) {
        try {
            const isTemplateMode = inputs.template_creation_mode || inputs.mode === 'template' || inputs.config_only;
            if (isTemplateMode) {
                return this.executeTemplateMode(inputs, context);
            }
            logger_1.logger.info(`🪙 Selecting tokens: ${inputs.from_token} → ${inputs.to_token}`);
            const chainId = inputs.chain_id || '1';
            const config = inputs.config || {};
            let fromToken = null;
            let toToken = null;
            // Get from token metadata
            if (inputs.from_token) {
                fromToken = await this.getTokenMetadata(inputs.from_token, chainId, config);
            }
            // Get to token metadata  
            if (inputs.to_token) {
                toToken = await this.getTokenMetadata(inputs.to_token, chainId, config);
            }
            // Get additional token list if requested
            let availableTokens = [];
            if (config.enabledTokens) {
                for (const token of config.enabledTokens) {
                    try {
                        const metadata = await this.getTokenMetadata(token, chainId, config);
                        availableTokens.push(metadata);
                    }
                    catch (error) {
                        logger_1.logger.warn(`Failed to get metadata for token ${token}:`, error);
                    }
                }
            }
            else {
                // Use default tokens
                availableTokens = Object.values(this.defaultTokens);
            }
            // Enrich with price data if requested
            if (config.includeMetadata && config.priceSource) {
                await this.enrichWithPriceData([fromToken, toToken].filter(Boolean), config.priceSource);
                await this.enrichWithPriceData(availableTokens, config.priceSource);
            }
            const result = {
                fromToken,
                toToken,
                availableTokens,
                chainId: parseInt(chainId),
                totalTokensAvailable: availableTokens.length,
                priceDataIncluded: config.includeMetadata || false
            };
            logger_1.logger.info(`✅ Token selection completed: ${availableTokens.length} tokens available`);
            return {
                success: true,
                outputs: result,
                executionTime: Date.now() - context.startTime,
                logs: [
                    `Selected from token: ${fromToken?.symbol || 'none'}`,
                    `Selected to token: ${toToken?.symbol || 'none'}`,
                    `Available tokens: ${availableTokens.length}`,
                    `Chain ID: ${chainId}`
                ]
            };
        }
        catch (error) {
            logger_1.logger.error('Token selection failed:', error);
            return {
                success: false,
                outputs: {},
                error: error.message,
                executionTime: Date.now() - context.startTime,
                logs: [`Error: ${error.message}`]
            };
        }
    }
    async getTokenMetadata(tokenIdentifier, chainId, config) {
        // Check if it's a known token symbol
        const knownToken = this.defaultTokens[tokenIdentifier.toUpperCase()];
        if (knownToken) {
            return { ...knownToken, chainId: parseInt(chainId) };
        }
        // If it's an address, fetch metadata from 1inch or other source
        if (tokenIdentifier.startsWith('0x')) {
            return await this.fetchTokenMetadataFromChain(tokenIdentifier, chainId);
        }
        throw new Error(`Unknown token identifier: ${tokenIdentifier}`);
    }
    async fetchTokenMetadataFromChain(address, chainId) {
        try {
            // Use 1inch token API to get metadata
            const response = await axios_1.default.get(`https://api.1inch.dev/token/v1.2/${chainId}/custom/${address}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.ONEINCH_API_KEY}`,
                    'Accept': 'application/json'
                }
            });
            const tokenData = response.data;
            return {
                address: tokenData.address,
                symbol: tokenData.symbol,
                name: tokenData.name,
                decimals: tokenData.decimals,
                logoUri: tokenData.logoURI,
                chainId: parseInt(chainId),
                verified: tokenData.verified || false
            };
        }
        catch (error) {
            logger_1.logger.warn(`Failed to fetch token metadata for ${address}:`, error.message);
            // Return basic metadata
            return {
                address,
                symbol: 'UNKNOWN',
                name: 'Unknown Token',
                decimals: 18,
                chainId: parseInt(chainId),
                verified: false
            };
        }
    }
    async enrichWithPriceData(tokens, priceSource) {
        if (priceSource === 'coingecko') {
            await this.enrichWithCoingeckoPrices(tokens);
        }
        else if (priceSource === '1inch') {
            await this.enrichWith1inchPrices(tokens);
        }
    }
    async enrichWithCoingeckoPrices(tokens) {
        try {
            const addresses = tokens.map(t => t.address).join(',');
            const response = await axios_1.default.get(`https://api.coingecko.com/api/v3/simple/token_price/ethereum`, {
                params: {
                    contract_addresses: addresses,
                    vs_currencies: 'usd',
                    include_24hr_change: true,
                    include_market_cap: true,
                    include_24hr_vol: true
                }
            });
            tokens.forEach(token => {
                const priceData = response.data[token.address.toLowerCase()];
                if (priceData) {
                    token.price = priceData.usd;
                    token.priceChange24h = priceData.usd_24h_change;
                    token.marketCap = priceData.usd_market_cap;
                    token.volume24h = priceData.usd_24h_vol;
                }
            });
        }
        catch (error) {
            logger_1.logger.warn('Failed to fetch price data from CoinGecko:', error);
        }
    }
    async enrichWith1inchPrices(tokens) {
        // Implementation for 1inch price data
        // This would use 1inch price API when available
        logger_1.logger.info('1inch price enrichment not yet implemented');
    }
    isValidToken(token) {
        // Check if it's a known symbol
        if (this.defaultTokens[token.toUpperCase()]) {
            return true;
        }
        // Check if it's a valid Ethereum address
        if (/^0x[a-fA-F0-9]{40}$/.test(token)) {
            return true;
        }
        return false;
    }
    isValidChainId(chainId) {
        const supportedChains = ['1', '56', '137', '42161', '10', '8453', '43114'];
        return supportedChains.includes(chainId);
    }
}
exports.TokenSelectorExecutor = TokenSelectorExecutor;
//# sourceMappingURL=token-selector-executor.js.map