"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainSelectorExecutor = void 0;
const logger_1 = require("../utils/logger");
class ChainSelectorExecutor {
    type = 'chainSelector';
    name = 'Chain Selector';
    description = 'Select and configure blockchain networks for DeFi operations';
    chainConfigs = {
        '1': {
            chainId: '1',
            name: 'Ethereum',
            symbol: 'ETH',
            rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com',
            explorerUrl: 'https://etherscan.io',
            nativeCurrency: 'ETH',
            isTestnet: false,
            blockTime: 12,
            gasLimit: '30000000',
            supportedBy1inch: true
        },
        '56': {
            chainId: '56',
            name: 'BNB Smart Chain',
            symbol: 'BNB',
            rpcUrl: process.env.BSC_RPC_URL || 'https://bsc-dataseed1.binance.org',
            explorerUrl: 'https://bscscan.com',
            nativeCurrency: 'BNB',
            isTestnet: false,
            blockTime: 3,
            gasLimit: '30000000',
            supportedBy1inch: true
        },
        '137': {
            chainId: '137',
            name: 'Polygon',
            symbol: 'MATIC',
            rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
            explorerUrl: 'https://polygonscan.com',
            nativeCurrency: 'MATIC',
            isTestnet: false,
            blockTime: 2,
            gasLimit: '30000000',
            supportedBy1inch: true
        },
        '42161': {
            chainId: '42161',
            name: 'Arbitrum One',
            symbol: 'ETH',
            rpcUrl: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
            explorerUrl: 'https://arbiscan.io',
            nativeCurrency: 'ETH',
            isTestnet: false,
            blockTime: 1,
            gasLimit: '1125899906842624',
            supportedBy1inch: true
        },
        '10': {
            chainId: '10',
            name: 'Optimism',
            symbol: 'ETH',
            rpcUrl: process.env.OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
            explorerUrl: 'https://optimistic.etherscan.io',
            nativeCurrency: 'ETH',
            isTestnet: false,
            blockTime: 2,
            gasLimit: '30000000',
            supportedBy1inch: true
        },
        '250': {
            chainId: '250',
            name: 'Fantom',
            symbol: 'FTM',
            rpcUrl: process.env.FANTOM_RPC_URL || 'https://rpc.ftm.tools',
            explorerUrl: 'https://ftmscan.com',
            nativeCurrency: 'FTM',
            isTestnet: false,
            blockTime: 1,
            gasLimit: '30000000',
            supportedBy1inch: true
        },
        '43114': {
            chainId: '43114',
            name: 'Avalanche C-Chain',
            symbol: 'AVAX',
            rpcUrl: process.env.AVALANCHE_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc',
            explorerUrl: 'https://snowtrace.io',
            nativeCurrency: 'AVAX',
            isTestnet: false,
            blockTime: 2,
            gasLimit: '30000000',
            supportedBy1inch: true,
            isAvalanche: true,
            avalancheChainType: 'C-Chain'
        },
        '25': {
            chainId: '25',
            name: 'Cronos',
            symbol: 'CRO',
            rpcUrl: process.env.CRONOS_RPC_URL || 'https://evm.cronos.org',
            explorerUrl: 'https://cronoscan.com',
            nativeCurrency: 'CRO',
            isTestnet: false,
            blockTime: 6,
            gasLimit: '30000000',
            supportedBy1inch: true
        },
        '8453': {
            chainId: '8453',
            name: 'Base',
            symbol: 'ETH',
            rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
            explorerUrl: 'https://basescan.org',
            nativeCurrency: 'ETH',
            isTestnet: false,
            blockTime: 2,
            gasLimit: '30000000',
            supportedBy1inch: true
        },
        // Avalanche Subnets
        '53935': {
            chainId: '53935',
            name: 'DeFi Kingdom (DFK)',
            symbol: 'JEWEL',
            rpcUrl: process.env.DFK_RPC_URL || 'https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc',
            explorerUrl: 'https://subnets.avax.network/defi-kingdoms',
            nativeCurrency: 'JEWEL',
            isTestnet: false,
            blockTime: 2,
            gasLimit: '30000000',
            supportedBy1inch: false,
            isAvalanche: true,
            avalancheChainType: 'L1-Subnet',
            subnetId: '2rwhRKN8qfxK9AEJunfUjn5WH7PQzUPPQKCb59ak6fwsrwF2R'
        },
        '432204': {
            chainId: '432204',
            name: 'Dexalot Subnet',
            symbol: 'ALOT',
            rpcUrl: process.env.DEXALOT_RPC_URL || 'https://subnets.avax.network/dexalot/mainnet/rpc',
            explorerUrl: 'https://subnets.avax.network/dexalot',
            nativeCurrency: 'ALOT',
            isTestnet: false,
            blockTime: 2,
            gasLimit: '30000000',
            supportedBy1inch: false,
            isAvalanche: true,
            avalancheChainType: 'L1-Subnet',
            subnetId: '2VCAhX6vE3UnXC6s1CBPE6jJ4c4cHWMfPgCptuWS59pQ8WYxXw'
        },
        '78430': {
            chainId: '78430',
            name: 'Amplify Subnet',
            symbol: 'AMP',
            rpcUrl: process.env.AMPLIFY_RPC_URL || 'https://subnets.avax.network/amplify/mainnet/rpc',
            explorerUrl: 'https://subnets.avax.network/amplify',
            nativeCurrency: 'AMP',
            isTestnet: false,
            blockTime: 2,
            gasLimit: '30000000',
            supportedBy1inch: false,
            isAvalanche: true,
            avalancheChainType: 'L1-Subnet',
            subnetId: 'zJytnh96Pc8rM337bBrtMvJDbEdDNjcXiG3WkTNCiLp8krJUk'
        },
        // Testnets
        '5': {
            chainId: '5',
            name: 'Ethereum Goerli',
            symbol: 'GoerliETH',
            rpcUrl: process.env.GOERLI_RPC_URL || 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
            explorerUrl: 'https://goerli.etherscan.io',
            nativeCurrency: 'GoerliETH',
            isTestnet: true,
            blockTime: 15,
            gasLimit: '30000000',
            supportedBy1inch: false
        },
        '43113': {
            chainId: '43113',
            name: 'Avalanche Fuji C-Chain',
            symbol: 'AVAX',
            rpcUrl: process.env.AVALANCHE_FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc',
            explorerUrl: 'https://testnet.snowtrace.io',
            nativeCurrency: 'AVAX',
            isTestnet: true,
            blockTime: 2,
            gasLimit: '30000000',
            supportedBy1inch: false,
            isAvalanche: true,
            avalancheChainType: 'C-Chain',
            supportsICM: true
        },
        '99999': {
            chainId: '99999',
            name: 'Custom L1 Subnet (Template)',
            symbol: 'CUSTOM',
            rpcUrl: 'http://localhost:8545', // Local development
            explorerUrl: 'http://localhost:4000',
            nativeCurrency: 'CUSTOM',
            isTestnet: true,
            blockTime: 1,
            gasLimit: '30000000',
            supportedBy1inch: false,
            isAvalanche: true,
            avalancheChainType: 'L1-Subnet',
            subnetId: 'template-subnet-id',
            supportsICM: true,
            isCustom: true
        }
    };
    async validate(inputs) {
        const errors = [];
        // Basic validation
        if (!inputs.primary_chain) {
            errors.push('primary_chain is required');
        }
        else {
            // Validate chain ID exists
            if (!this.chainConfigs[inputs.primary_chain]) {
                errors.push(`Unsupported chain ID: ${inputs.primary_chain}`);
            }
            else {
                // Validate testnet settings
                if (inputs.enable_testnet === false) {
                    const chain = this.chainConfigs[inputs.primary_chain];
                    if (chain.isTestnet) {
                        errors.push('Testnet chains are disabled in configuration');
                    }
                }
            }
        }
        return { valid: errors.length === 0, errors };
    }
    async execute(inputs, context) {
        try {
            logger_1.logger.info(`🔗 Selecting blockchain: ${inputs.primary_chain}`);
            const primaryChain = this.chainConfigs[inputs.primary_chain];
            // Get available chains based on settings
            const availableChains = this.getAvailableChains(inputs);
            // Check if selected chain supports 1inch
            const supports1inch = primaryChain.supportedBy1inch;
            // Get chain status
            const chainStatus = await this.getChainStatus(primaryChain);
            const result = {
                success: true,
                data: {
                    selectedChain: {
                        chainId: primaryChain.chainId,
                        name: primaryChain.name,
                        symbol: primaryChain.symbol,
                        nativeCurrency: primaryChain.nativeCurrency,
                        rpcUrl: primaryChain.rpcUrl,
                        explorerUrl: primaryChain.explorerUrl,
                        blockTime: primaryChain.blockTime,
                        gasLimit: primaryChain.gasLimit,
                        isTestnet: primaryChain.isTestnet
                    },
                    availableChains: availableChains,
                    compatibility: {
                        supports1inch: supports1inch,
                        supportsFusion: supports1inch && !primaryChain.isTestnet,
                        supportsLimitOrders: supports1inch && !primaryChain.isTestnet,
                        supportsCrossChain: supports1inch && !primaryChain.isTestnet
                    },
                    status: chainStatus,
                    recommendations: this.getChainRecommendations(primaryChain),
                    configuration: {
                        enableTestnet: inputs.enable_testnet || false,
                        availableChainsFilter: inputs.available_chains || 'all'
                    }
                }
            };
            logger_1.logger.info(`✅ Chain selection completed: ${primaryChain.name}`);
            return result;
        }
        catch (error) {
            logger_1.logger.error(`❌ Chain selection failed:`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Chain selection failed'
            };
        }
    }
    async estimateGas(inputs) {
        // Chain selection doesn't require gas
        return '0';
    }
    getAvailableChains(inputs) {
        let chains = Object.values(this.chainConfigs);
        // Filter by testnet preference
        if (inputs.enable_testnet === false) {
            chains = chains.filter(chain => !chain.isTestnet);
        }
        // Filter by 1inch support if specified
        if (inputs.available_chains === '1inch_only') {
            chains = chains.filter(chain => chain.supportedBy1inch);
        }
        // Filter by mainnet only
        if (inputs.available_chains === 'mainnet_only') {
            chains = chains.filter(chain => !chain.isTestnet);
        }
        // Filter by Avalanche only
        if (inputs.available_chains === 'avalanche_only') {
            chains = chains.filter(chain => chain.isAvalanche);
        }
        // Filter by ICM support
        if (inputs.available_chains === 'icm_compatible') {
            chains = chains.filter(chain => chain.supportsICM);
        }
        // Filter by L1 subnets only
        if (inputs.available_chains === 'l1_subnets_only') {
            chains = chains.filter(chain => chain.avalancheChainType === 'L1-Subnet');
        }
        return chains;
    }
    async getChainStatus(chain) {
        try {
            // In a real implementation, this would check RPC connectivity
            return {
                isOnline: true,
                latency: Math.floor(Math.random() * 100) + 50, // Mock latency
                blockHeight: Math.floor(Math.random() * 1000000) + 18000000, // Mock block height
                gasPrice: this.getMockGasPrice(chain.chainId),
                lastChecked: new Date().toISOString()
            };
        }
        catch (error) {
            return {
                isOnline: false,
                latency: null,
                blockHeight: null,
                gasPrice: null,
                lastChecked: new Date().toISOString(),
                error: 'Connection failed'
            };
        }
    }
    getMockGasPrice(chainId) {
        // Mock gas prices in wei
        const gasPrices = {
            '1': '20000000000', // 20 gwei for Ethereum
            '56': '5000000000', // 5 gwei for BSC
            '137': '30000000000', // 30 gwei for Polygon
            '42161': '100000000', // 0.1 gwei for Arbitrum
            '10': '1000000000', // 1 gwei for Optimism
            '250': '25000000000', // 25 gwei for Fantom
            '43114': '25000000000', // 25 gwei for Avalanche
            '25': '5000000000', // 5 gwei for Cronos
            '8453': '1000000000' // 1 gwei for Base
        };
        return gasPrices[chainId] || '20000000000';
    }
    getChainRecommendations(chain) {
        const recommendations = [];
        if (chain.isTestnet) {
            recommendations.push('⚠️ This is a testnet - use for testing only');
        }
        if (!chain.supportedBy1inch) {
            recommendations.push('❌ This chain is not supported by 1inch Protocol');
        }
        if (chain.blockTime > 10) {
            recommendations.push('🐌 This chain has slower block times - expect longer confirmation times');
        }
        if (chain.blockTime < 3) {
            recommendations.push('⚡ This chain has fast block times - great for quick transactions');
        }
        if (['42161', '10', '8453'].includes(chain.chainId)) {
            recommendations.push('💰 This is a Layer 2 solution - enjoy lower gas fees');
        }
        if (chain.chainId === '1') {
            recommendations.push('🏆 Ethereum mainnet - highest liquidity and most protocols available');
        }
        // Avalanche-specific recommendations
        if (chain.isAvalanche) {
            if (chain.avalancheChainType === 'C-Chain') {
                recommendations.push('🏔️ Avalanche C-Chain - EVM-compatible with fast finality');
            }
            else if (chain.avalancheChainType === 'L1-Subnet') {
                recommendations.push('⚡ Avalanche L1 Subnet - Custom blockchain with dedicated resources');
            }
            if (chain.supportsICM) {
                recommendations.push('📤 Supports Avalanche ICM for cross-chain messaging');
            }
            if (chain.isCustom) {
                recommendations.push('🔧 Custom subnet - designed for your specific use case');
            }
        }
        return recommendations;
    }
}
exports.ChainSelectorExecutor = ChainSelectorExecutor;
//# sourceMappingURL=chain-selector-executor.js.map