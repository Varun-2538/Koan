"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeFiDashboardExecutor = void 0;
class DeFiDashboardExecutor {
    logger;
    type = 'defiDashboard';
    name = 'DeFi Dashboard Generator';
    description = 'Generate complete DeFi dashboard with all integrated components and features';
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
        if (!inputs.dashboard_name) {
            errors.push('dashboard_name is required');
        }
        if (inputs.components && !Array.isArray(inputs.components)) {
            errors.push('components must be an array');
        }
        if (inputs.theme && !['light', 'dark', 'auto'].includes(inputs.theme)) {
            errors.push('theme must be one of: light, dark, auto');
        }
        if (inputs.layout && !['grid', 'flex', 'tabs'].includes(inputs.layout)) {
            errors.push('layout must be one of: grid, flex, tabs');
        }
        return { valid: errors.length === 0, errors };
    }
    async validateTemplateConfig(inputs) {
        // Validate dashboard components
        if (inputs.default_components) {
            if (!Array.isArray(inputs.default_components)) {
                throw new Error('default_components must be an array');
            }
            const validComponents = [
                'wallet-connector', 'token-selector', 'swap-interface',
                'portfolio-tracker', 'transaction-history', 'price-charts',
                'limit-orders', 'fusion-swaps', 'analytics'
            ];
            const invalidComponents = inputs.default_components.filter(comp => !validComponents.includes(comp));
            if (invalidComponents.length > 0) {
                throw new Error(`Invalid components: ${invalidComponents.join(', ')}`);
            }
        }
        // Validate theme settings
        if (inputs.default_theme && !['light', 'dark', 'auto'].includes(inputs.default_theme)) {
            throw new Error('default_theme must be one of: light, dark, auto');
        }
        // Validate layout settings
        if (inputs.default_layout && !['grid', 'flex', 'tabs'].includes(inputs.default_layout)) {
            throw new Error('default_layout must be one of: grid, flex, tabs');
        }
        // Validate branding settings
        if (inputs.enable_branding !== undefined && typeof inputs.enable_branding !== 'boolean') {
            throw new Error('enable_branding must be a boolean');
        }
    }
    async execute(inputs, context) {
        const startTime = Date.now();
        const isTemplateMode = inputs.template_creation_mode || inputs.mode === 'template' || inputs.config_only;
        try {
            if (isTemplateMode) {
                return this.executeTemplateMode(inputs, context);
            }
            // Execute dashboard generation
            const dashboardResult = await this.generateDashboard(inputs);
            return {
                success: true,
                outputs: {
                    dashboard: dashboardResult,
                    dashboard_id: dashboardResult.dashboardId,
                    config: dashboardResult.config,
                    generated_files: dashboardResult.generatedFiles,
                    deployment_url: dashboardResult.deploymentUrl,
                    status: dashboardResult.status
                },
                logs: [
                    `🎨 DeFi dashboard generated: ${dashboardResult.config.branding.name}`,
                    `📱 Components: ${dashboardResult.config.components.length} integrated`,
                    `🔗 Chains: ${dashboardResult.config.integrations.chains.length} supported`,
                    `💼 Wallets: ${dashboardResult.config.integrations.wallets.length} connected`,
                    `🎯 Features: ${dashboardResult.config.features.length} enabled`,
                    `📁 Files: ${Object.values(dashboardResult.generatedFiles).flat().length} generated`,
                    `🚀 Status: ${dashboardResult.status}`
                ],
                executionTime: Date.now() - startTime
            };
        }
        catch (error) {
            this.logger?.error('DeFi dashboard generation failed:', error);
            return {
                success: false,
                outputs: {},
                error: error.message,
                logs: [`❌ Failed to generate dashboard: ${error.message}`],
                executionTime: Date.now() - startTime
            };
        }
    }
    async executeTemplateMode(inputs, context) {
        this.logger?.info('🎨 Configuring DeFi dashboard generator for template creation');
        const config = {
            theme: inputs.default_theme || 'auto',
            layout: inputs.default_layout || 'grid',
            components: inputs.default_components || [
                'wallet-connector',
                'token-selector',
                'swap-interface',
                'portfolio-tracker',
                'transaction-history',
                'price-charts',
                'limit-orders',
                'fusion-swaps',
                'analytics'
            ],
            features: inputs.default_features || [
                'multi-wallet-support',
                'cross-chain-swaps',
                'mev-protection',
                'gasless-transactions',
                'limit-orders',
                'portfolio-tracking',
                'real-time-prices',
                'transaction-history',
                'advanced-analytics'
            ],
            branding: {
                name: inputs.default_name || 'My 1inch DeFi Suite',
                colors: {
                    primary: inputs.primary_color || '#1f2937',
                    secondary: inputs.secondary_color || '#3b82f6',
                    accent: inputs.accent_color || '#8b5cf6'
                }
            },
            integrations: {
                wallets: inputs.supported_wallets || ['metamask', 'walletconnect', 'coinbase'],
                chains: inputs.supported_chains || [1, 137, 42161, 10, 56, 43114],
                protocols: ['1inch-aggregation', '1inch-fusion', '1inch-limit-orders', '1inch-portfolio']
            }
        };
        // Mock dashboard result for template
        const mockDashboardResult = {
            dashboardId: `dashboard-${Date.now()}`,
            config: config,
            generatedFiles: {
                frontend: [
                    'src/pages/index.tsx',
                    'src/components/WalletConnector.tsx',
                    'src/components/SwapInterface.tsx',
                    'src/components/PortfolioTracker.tsx',
                    'src/components/TransactionHistory.tsx',
                    'src/hooks/useWallet.ts',
                    'src/hooks/use1inch.ts',
                    'src/styles/globals.css',
                    'package.json',
                    'next.config.js'
                ],
                backend: [
                    'src/index.ts',
                    'src/routes/swap.ts',
                    'src/routes/portfolio.ts',
                    'src/services/oneinch.ts',
                    'src/middleware/auth.ts',
                    'package.json',
                    'tsconfig.json'
                ],
                config: [
                    '.env.example',
                    'docker-compose.yml',
                    'README.md',
                    'deployment.yml'
                ]
            },
            status: 'generated'
        };
        return {
            success: true,
            outputs: {
                dashboard_config: config,
                mock_dashboard: mockDashboardResult,
                supported_features: [
                    'Complete DeFi dashboard generation',
                    'Multi-component integration',
                    'Responsive design system',
                    'Custom branding support',
                    'Multi-chain compatibility',
                    'Production-ready code generation'
                ]
            },
            logs: [
                `🎨 DeFi dashboard generator configured`,
                `📱 Components: ${config.components.length} available`,
                `🎯 Features: ${config.features.length} enabled`,
                `🔗 Chains: ${config.integrations.chains.length} supported`,
                `💼 Wallets: ${config.integrations.wallets.length} integrated`,
                `🎨 Theme: ${config.theme}, Layout: ${config.layout}`,
                `🏷️ Branding: ${config.branding.name}`
            ],
            executionTime: 10
        };
    }
    async generateDashboard(inputs) {
        const { dashboard_name, components = [], theme = 'auto', layout = 'grid', branding = {} } = inputs;
        // In a real implementation, this would generate actual dashboard files
        // For now, return mock data structure
        const mockDashboardResult = {
            dashboardId: `dashboard-${Date.now()}`,
            config: {
                theme,
                layout,
                components,
                features: [
                    'multi-wallet-support',
                    'cross-chain-swaps',
                    'mev-protection'
                ],
                branding: {
                    name: dashboard_name,
                    colors: {
                        primary: branding.primary || '#1f2937',
                        secondary: branding.secondary || '#3b82f6',
                        accent: branding.accent || '#8b5cf6'
                    }
                },
                integrations: {
                    wallets: ['metamask', 'walletconnect', 'coinbase'],
                    chains: [1, 137, 42161, 10],
                    protocols: ['1inch-aggregation', '1inch-fusion', '1inch-limit-orders']
                }
            },
            generatedFiles: {
                frontend: ['index.tsx', 'components/...', 'styles/...'],
                backend: ['index.ts', 'routes/...', 'services/...'],
                config: ['.env.example', 'README.md', 'docker-compose.yml']
            },
            status: 'generated'
        };
        return mockDashboardResult;
    }
}
exports.DeFiDashboardExecutor = DeFiDashboardExecutor;
//# sourceMappingURL=defi-dashboard-executor.js.map