"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.L1ConfigExecutor = void 0;
class L1ConfigExecutor {
    type = 'l1Config';
    name = 'L1 Config Generator';
    description = 'Generate Avalanche subnet configuration and genesis JSON';
    logger;
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
        if (!inputs.vmType) {
            errors.push('VM Type is required');
        }
        if (!inputs.chainId) {
            errors.push('Chain ID is required');
        }
        if (typeof inputs.chainId !== 'number') {
            errors.push('Chain ID must be a number');
        }
        if (inputs.chainId <= 0) {
            errors.push('Chain ID must be a positive number');
        }
        // Validate VM type
        const validVmTypes = ['SubnetEVM', 'CustomVM'];
        if (inputs.vmType && !validVmTypes.includes(inputs.vmType)) {
            errors.push(`VM Type must be one of: ${validVmTypes.join(', ')}`);
        }
        return { valid: errors.length === 0, errors };
    }
    async validateTemplateConfig(inputs) {
        // Template mode validation
        if (inputs.supportedVmTypes && !Array.isArray(inputs.supportedVmTypes)) {
            throw new Error('supportedVmTypes must be an array');
        }
    }
    async execute(inputs, context) {
        const startTime = Date.now();
        const isTemplateMode = inputs.template_creation_mode || inputs.mode === 'template' || inputs.config_only;
        try {
            if (isTemplateMode) {
                return this.executeTemplateMode(inputs, context, startTime);
            }
            // Extract inputs
            const { vmType = 'SubnetEVM', chainId, tokenSymbol, initialSupply, gasLimit = 8000000 } = inputs;
            this.logger.info(`🔧 Generating L1 config for chain ${chainId} with VM ${vmType}`);
            // Generate genesis configuration
            const genesisConfig = await this.generateGenesisConfig({
                vmType,
                chainId,
                tokenSymbol,
                initialSupply,
                gasLimit
            });
            // Generate subnet configuration
            const subnetConfig = await this.generateSubnetConfig({
                vmType,
                chainId,
                genesisConfig
            });
            this.logger.info(`✅ L1 configuration generated successfully`);
            return {
                success: true,
                outputs: {
                    genesisJson: genesisConfig,
                    subnetConfig: subnetConfig,
                    chainId: chainId,
                    vmType: vmType,
                    configTimestamp: new Date().toISOString()
                },
                logs: [
                    `🔧 L1 Configuration Generated`,
                    `🏔️ Chain ID: ${chainId}`,
                    `⚙️ VM Type: ${vmType}`,
                    `💰 Token Symbol: ${tokenSymbol || 'AVAX'}`,
                    `🏭 Initial Supply: ${initialSupply || '1,000,000'}`,
                    `⛽ Gas Limit: ${gasLimit}`,
                    `📅 Generated At: ${new Date().toISOString()}`
                ],
                executionTime: Date.now() - startTime
            };
        }
        catch (error) {
            this.logger.error('❌ L1 config generation failed:', error);
            return {
                success: false,
                outputs: {},
                error: error.message,
                logs: [
                    `❌ Failed to generate L1 configuration: ${error.message}`,
                    `🔍 Error details: ${error.stack || 'No stack trace available'}`
                ],
                executionTime: Date.now() - startTime
            };
        }
    }
    async generateGenesisConfig(params) {
        const { vmType, chainId, tokenSymbol, initialSupply, gasLimit } = params;
        // Base genesis configuration
        const baseGenesis = {
            config: {
                chainId: chainId,
                homesteadBlock: 0,
                eip150Block: 0,
                eip155Block: 0,
                eip158Block: 0,
                byzantiumBlock: 0,
                constantinopleBlock: 0,
                petersburgBlock: 0,
                istanbulBlock: 0,
                berlinBlock: 0,
                londonBlock: 0
            },
            difficulty: '0x1',
            gasLimit: `0x${gasLimit.toString(16)}`,
            alloc: {}
        };
        // Add initial token allocation if specified
        if (initialSupply && initialSupply > 0) {
            // Generate a mock address for initial allocation
            const mockAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
            // Initialize alloc if it doesn't exist
            if (!baseGenesis.alloc) {
                baseGenesis.alloc = {};
            }
            ;
            baseGenesis.alloc[mockAddress] = {
                balance: `0x${(initialSupply * Math.pow(10, 18)).toString(16)}` // Convert to wei
            };
            this.logger.info(`💰 Allocated ${initialSupply} tokens to ${mockAddress}`);
        }
        // VM-specific configuration
        if (vmType === 'SubnetEVM') {
            ;
            baseGenesis.config.berlinBlock = 0;
            baseGenesis.config.londonBlock = 0;
            baseGenesis.config.subnetEVM = {
                enabled: true,
                gasLimit: gasLimit,
                blockPeriod: 2, // 2 second block time
                validatorSet: [] // Will be populated during deployment
            };
        }
        return baseGenesis;
    }
    async generateSubnetConfig(params) {
        const { vmType, chainId, genesisConfig } = params;
        const subnetConfig = {
            subnetId: `subnet-${chainId}-${Date.now()}`,
            chainId: chainId,
            vmType: vmType,
            genesis: genesisConfig,
            validators: [], // Will be populated during deployment
            controlKeys: [], // Will be populated during deployment
            threshold: 1,
            metadata: {
                name: `Custom Subnet ${chainId}`,
                description: `Generated subnet for chain ${chainId}`,
                createdAt: new Date().toISOString(),
                version: '1.0.0'
            }
        };
        // VM-specific subnet configuration
        if (vmType === 'SubnetEVM') {
            ;
            subnetConfig.evmConfig = {
                gasLimit: genesisConfig.gasLimit,
                blockGasLimit: genesisConfig.gasLimit,
                targetBlockRate: 2,
                minBaseFee: '0x3b9aca00', // 1 gwei
                targetGas: genesisConfig.gasLimit,
                baseFeeChangeDenominator: 36,
                minBlockGasCost: 0,
                maxBlockGasCost: 1000000,
                blockGasCostStep: 200000
            };
        }
        return subnetConfig;
    }
    async executeTemplateMode(inputs, context, startTime) {
        this.logger.info(`🎭 Generating L1 config template`);
        const templateConfig = {
            supportedVmTypes: inputs.supportedVmTypes || ['SubnetEVM', 'CustomVM'],
            defaultGasLimit: inputs.defaultGasLimit || 8000000,
            maxChainId: inputs.maxChainId || 999999,
            templateFeatures: [
                'Genesis JSON generation',
                'Subnet configuration',
                'VM-specific settings',
                'Token allocation',
                'Validator configuration'
            ]
        };
        // Generate sample configurations
        const sampleGenesis = await this.generateGenesisConfig({
            vmType: 'SubnetEVM',
            chainId: 12345,
            tokenSymbol: 'TEST',
            initialSupply: 1000000,
            gasLimit: 8000000
        });
        const sampleSubnet = await this.generateSubnetConfig({
            vmType: 'SubnetEVM',
            chainId: 12345,
            genesisConfig: sampleGenesis
        });
        return {
            success: true,
            outputs: {
                configTemplate: templateConfig,
                sampleGenesis: sampleGenesis,
                sampleSubnet: sampleSubnet,
                supportedFeatures: templateConfig.templateFeatures
            },
            logs: [
                `🎭 L1 Config Template Generated`,
                `⚙️ Supported VM Types: ${templateConfig.supportedVmTypes.join(', ')}`,
                `⛽ Default Gas Limit: ${templateConfig.defaultGasLimit}`,
                `🔢 Max Chain ID: ${templateConfig.maxChainId}`,
                `✅ Features: ${templateConfig.templateFeatures.join(', ')}`
            ],
            executionTime: Date.now() - startTime
        };
    }
    async estimateGas(inputs) {
        // Configuration generation doesn't require gas
        return '0';
    }
}
exports.L1ConfigExecutor = L1ConfigExecutor;
//# sourceMappingURL=l1-config-executor.js.map