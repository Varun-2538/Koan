import { BridgeComponent, ComponentInput, ComponentOutput, ComponentExecutionResult, ComponentMetadata } from '../base-component'

export class FusionPlusComponent extends BridgeComponent {
  readonly name = '1inch Fusion+'
  readonly description = 'Execute cross-chain swaps with MEV protection and zero gas fees using 1inch Fusion+ protocol'

  readonly inputs: ComponentInput[] = [
    {
      key: 'api_key',
      label: '1inch API Key',
      description: 'Your 1inch API key with Fusion+ access',
      type: 'api_key',
      required: true,
      sensitive: true,
      placeholder: 'Enter your 1inch API key...'
    },
    {
      key: 'supported_chains',
      label: 'Supported Chain Pairs',
      description: 'Select blockchain networks that the bridge dashboard will support',
      type: 'multiselect',
      required: true,
      defaultValue: ['1', '137'],
      options: [
        { value: '1', label: 'Ethereum' },
        { value: '137', label: 'Polygon' },
        { value: '56', label: 'BNB Chain' },
        { value: '42161', label: 'Arbitrum' },
        { value: '10', label: 'Optimism' },
        { value: '101', label: 'Solana' }
      ]
    },
    {
      key: 'default_bridge_pairs',
      label: 'Default Bridge Pairs',
      description: 'Common bridge pairs to show in the dashboard',
      type: 'json',
      required: false,
      defaultValue: [
        { 
          from: { chain: '1', token: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', symbol: 'ETH' },
          to: { chain: '137', token: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', symbol: 'WETH' },
          label: 'ETH → Polygon WETH'
        },
        {
          from: { chain: '1', token: '0xA0b86a33E6417c4a4e6d3b7e6d8f0e8b8e8c8d8e', symbol: 'USDC' },
          to: { chain: '137', token: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', symbol: 'USDC' },
          label: 'USDC → Polygon USDC'
        }
      ],
      placeholder: 'JSON array of bridge pairs'
    },
    {
      key: 'enable_mev_protection',
      label: 'MEV Protection by Default',
      description: 'Enable MEV protection through Fusion+ resolvers by default',
      type: 'boolean',
      required: false,
      defaultValue: true
    },
    {
      key: 'enable_gasless',
      label: 'Gasless Mode by Default',
      description: 'Enable gasless transactions by default (when supported)',
      type: 'boolean',
      required: false,
      defaultValue: true
    },
    {
      key: 'default_timeout',
      label: 'Default Bridge Timeout (minutes)',
      description: 'Default maximum time to wait for bridge completion',
      type: 'number',
      required: false,
      defaultValue: 30,
      validation: {
        min: 5,
        max: 120
      }
    },
    {
      key: 'ui_config',
      label: 'UI Configuration',
      description: 'Dashboard UI settings for the bridge interface',
      type: 'json',
      required: false,
      defaultValue: {
        theme: 'modern',
        showBridgeStatus: true,
        showEstimatedTime: true,
        showFees: true,
        enableChainSelector: true,
        showAdvancedOptions: false
      },
      placeholder: 'JSON configuration for UI'
    },
    {
      key: 'fee_recipient',
      label: 'Fee Recipient',
      description: 'Your address to receive referral fees (optional)',
      type: 'address',
      required: false,
      placeholder: '0x...'
    },
    {
      key: 'fee_percent',
      label: 'Fee Percentage',
      description: 'Referral fee percentage (0-3%)',
      type: 'number',
      required: false,
      defaultValue: 0,
      validation: {
        min: 0,
        max: 3
      }
    },
    {
      key: 'rate_limits',
      label: 'Rate Limits',
      description: 'API rate limiting settings for the bridge dashboard',
      type: 'json',
      required: false,
      defaultValue: {
        requests_per_minute: 30,
        requests_per_hour: 500,
        enable_caching: true,
        cache_duration: 300
      },
      placeholder: 'JSON rate limit configuration'
    }
  ]

  readonly outputs: ComponentOutput[] = [
    {
      key: 'dashboard_config',
      label: 'Bridge Dashboard Configuration',
      description: 'Complete configuration for the cross-chain bridge dashboard',
      type: 'object'
    },
    {
      key: 'api_endpoints',
      label: 'API Endpoints',
      description: 'Generated API endpoints for bridge operations',
      type: 'object'
    },
    {
      key: 'ui_components',
      label: 'UI Components',
      description: 'React components for the bridge interface',
      type: 'object'
    },
    {
      key: 'deployment_config',
      label: 'Deployment Config',
      description: 'Configuration for deploying the bridge dashboard',
      type: 'object'
    },
    {
      key: 'supported_routes',
      label: 'Supported Routes',
      description: 'Available bridge routes between chains',
      type: 'array'
    }
  ]

  readonly metadata: ComponentMetadata = {
    category: 'bridge',
    tags: ['1inch', 'fusion+', 'cross-chain', 'bridge', 'mev-protection', 'gasless'],
    version: '1.0.0',
    author: 'Unite DeFi Platform',
    documentation: 'https://docs.1inch.io/docs/fusion-plus/introduction',
    examples: [
      {
        name: 'Cross-Chain Bridge Dashboard',
        description: 'Configure a Fusion+ bridge dashboard for cross-chain swaps',
        inputs: {
          api_key: 'your-api-key',
          supported_chains: ['1', '137', '42161'],
          default_bridge_pairs: [
            { 
              from: { chain: '1', token: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', symbol: 'ETH' },
              to: { chain: '137', token: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', symbol: 'WETH' },
              label: 'ETH → Polygon WETH'
            }
          ],
          enable_mev_protection: true,
          enable_gasless: true
        },
        expectedOutputs: {
          dashboard_config: 'Complete bridge dashboard configuration',
          api_endpoints: 'Generated API endpoints for bridge operations',
          ui_components: 'React components for bridge interface'
        }
      }
    ]
  }

  async execute(inputs: Record<string, any>): Promise<ComponentExecutionResult> {
    const startTime = Date.now()
    const logs: string[] = []

    try {
      const validation = this.validateInputs(inputs)
      if (!validation.valid) {
        return {
          success: false,
          outputs: {},
          error: validation.errors.join(', '),
          logs: validation.errors.map(err => this.createLog('error', err)),
          executionTime: Date.now() - startTime
        }
      }

      logs.push(this.createLog('info', 'Generating Fusion+ bridge dashboard configuration'))

      // Generate dashboard configuration
      const dashboardConfig = this.generateBridgeDashboardConfig(inputs)
      logs.push(this.createLog('info', 'Bridge dashboard configuration generated'))

      // Generate API endpoints
      const apiEndpoints = this.generateBridgeApiEndpoints(inputs)
      logs.push(this.createLog('info', 'Bridge API endpoints generated'))

      // Generate UI components
      const uiComponents = this.generateBridgeUiComponents(inputs)
      logs.push(this.createLog('info', 'Bridge UI components generated'))

      // Generate supported routes
      const supportedRoutes = this.generateSupportedRoutes(inputs)
      logs.push(this.createLog('info', 'Supported bridge routes generated'))

      const executionTime = Date.now() - startTime

      return {
        success: true,
        outputs: {
          dashboard_config: dashboardConfig,
          api_endpoints: apiEndpoints,
          ui_components: uiComponents,
          deployment_config: this.generateBridgeDeploymentConfig(inputs),
          supported_routes: supportedRoutes
        },
        logs,
        executionTime
      }
    } catch (error: any) {
      logs.push(this.createLog('error', this.formatError(error)))
      
      return {
        success: false,
        outputs: {},
        error: this.formatError(error),
        logs,
        executionTime: Date.now() - startTime
      }
    }
  }

  async test(inputs: Record<string, any>): Promise<ComponentExecutionResult> {
    const startTime = Date.now()
    const logs: string[] = []

    try {
      const validation = this.validateInputs(inputs)
      if (!validation.valid) {
        return {
          success: false,
          outputs: {},
          error: validation.errors.join(', '),
          logs: validation.errors.map(err => this.createLog('error', err)),
          executionTime: Date.now() - startTime
        }
      }

      logs.push(this.createLog('info', 'Testing Fusion+ bridge dashboard configuration'))

      // Test API key if provided
      if (inputs.api_key) {
        try {
          await this.testBridgeApiConnection(inputs)
          logs.push(this.createLog('info', 'Bridge API connection test successful'))
        } catch (error: any) {
          logs.push(this.createLog('warn', `Bridge API test failed: ${error.message}`))
        }
      }

      // Generate test configuration
      const dashboardConfig = this.generateBridgeDashboardConfig(inputs)
      logs.push(this.createLog('info', 'Bridge dashboard configuration test successful'))

      return {
        success: true,
        outputs: {
          dashboard_config: dashboardConfig,
          api_endpoints: this.generateBridgeApiEndpoints(inputs),
          ui_components: this.generateBridgeUiComponents(inputs),
          deployment_config: this.generateBridgeDeploymentConfig(inputs),
          supported_routes: this.generateSupportedRoutes(inputs)
        },
        logs,
        executionTime: Date.now() - startTime
      }
    } catch (error: any) {
      return {
        success: false,
        outputs: {},
        error: this.formatError(error),
        logs: [this.createLog('error', this.formatError(error))],
        executionTime: Date.now() - startTime
      }
    }
  }

  protected async getBridgeQuote(inputs: Record<string, any>): Promise<any> {
    const { 
      api_key, 
      source_chain, 
      destination_chain, 
      from_token, 
      to_token, 
      amount 
    } = inputs

    // Note: This is a placeholder for Fusion+ API
    // The actual API endpoint may differ
    const params = new URLSearchParams({
      fromChainId: source_chain,
      toChainId: destination_chain,
      fromTokenAddress: from_token,
      toTokenAddress: to_token,
      amount: amount,
      enableFusion: 'true'
    })

    const url = `https://api.1inch.dev/fusion-plus/v1.0/quote?${params}`

    return await this.makeApiRequest(url, {
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'accept': 'application/json'
      }
    })
  }

  protected async executeBridge(inputs: Record<string, any>): Promise<any> {
    const { 
      api_key, 
      source_chain, 
      destination_chain, 
      from_token, 
      to_token, 
      amount, 
      from_address,
      to_address,
      enable_mev_protection = true,
      enable_gasless = true
    } = inputs

    const params = new URLSearchParams({
      fromChainId: source_chain,
      toChainId: destination_chain,
      fromTokenAddress: from_token,
      toTokenAddress: to_token,
      amount: amount,
      fromAddress: from_address,
      toAddress: to_address || from_address,
      enableMEVProtection: enable_mev_protection.toString(),
      enableGasless: enable_gasless.toString()
    })

    const url = `https://api.1inch.dev/fusion-plus/v1.0/swap?${params}`

    return await this.makeApiRequest(url, {
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'accept': 'application/json'
      }
    })
  }

  protected async trackBridgeStatus(txHash: string): Promise<any> {
    // This would track the bridge transaction status across chains
    // Implementation would depend on 1inch's bridge tracking API
    return {
      status: 'pending',
      sourceConfirmed: false,
      destinationConfirmed: false,
      estimatedCompletion: Date.now() + 15 * 60 * 1000 // 15 minutes
    }
  }

  private generateBridgeDashboardConfig(inputs: Record<string, any>): any {
    return {
      name: 'Fusion+ Bridge Dashboard',
      description: 'Cross-chain bridge dashboard powered by 1inch Fusion+',
      version: '1.0.0',
      supported_chains: inputs.supported_chains || ['1', '137'],
      default_bridge_pairs: inputs.default_bridge_pairs || [],
      enable_mev_protection: inputs.enable_mev_protection || true,
      enable_gasless: inputs.enable_gasless || true,
      default_timeout: inputs.default_timeout || 30,
      fee_recipient: inputs.fee_recipient,
      fee_percent: inputs.fee_percent || 0,
      ui_config: inputs.ui_config || {
        theme: 'modern',
        showBridgeStatus: true,
        showEstimatedTime: true,
        showFees: true,
        enableChainSelector: true,
        showAdvancedOptions: false
      }
    }
  }

  private generateBridgeApiEndpoints(inputs: Record<string, any>): any {
    return {
      base_url: '/api/fusion-plus',
      endpoints: {
        quote: {
          method: 'POST',
          path: '/quote',
          description: 'Get cross-chain bridge quote',
          parameters: ['fromChain', 'toChain', 'fromToken', 'toToken', 'amount']
        },
        bridge: {
          method: 'POST',
          path: '/bridge',
          description: 'Execute cross-chain bridge',
          parameters: ['fromChain', 'toChain', 'fromToken', 'toToken', 'amount', 'fromAddress', 'toAddress']
        },
        status: {
          method: 'GET',
          path: '/status/:txHash',
          description: 'Track bridge transaction status',
          parameters: ['txHash']
        },
        routes: {
          method: 'GET',
          path: '/routes',
          description: 'Get supported bridge routes',
          parameters: ['fromChain', 'toChain']
        }
      },
      rate_limits: inputs.rate_limits || {
        requests_per_minute: 30,
        requests_per_hour: 500,
        enable_caching: true,
        cache_duration: 300
      }
    }
  }

  private generateBridgeUiComponents(inputs: Record<string, any>): any {
    return {
      components: [
        {
          name: 'BridgeInterface',
          type: 'react',
          props: {
            supportedChains: inputs.supported_chains,
            defaultBridgePairs: inputs.default_bridge_pairs,
            enableMevProtection: inputs.enable_mev_protection,
            enableGasless: inputs.enable_gasless,
            defaultTimeout: inputs.default_timeout,
            uiConfig: inputs.ui_config
          }
        },
        {
          name: 'ChainSelector',
          type: 'react',
          props: {
            supportedChains: inputs.supported_chains,
            enableChainSelector: inputs.ui_config?.enableChainSelector || true
          }
        },
        {
          name: 'BridgeStatus',
          type: 'react',
          props: {
            showBridgeStatus: inputs.ui_config?.showBridgeStatus || true,
            showEstimatedTime: inputs.ui_config?.showEstimatedTime || true
          }
        }
      ],
      styles: {
        theme: inputs.ui_config?.theme || 'modern',
        primaryColor: '#3B82F6',
        borderRadius: '8px'
      }
    }
  }

  private generateBridgeDeploymentConfig(inputs: Record<string, any>): any {
    return {
      platform: 'vercel',
      environment: {
        FUSION_PLUS_API_KEY: inputs.api_key,
        SUPPORTED_CHAINS: JSON.stringify(inputs.supported_chains),
        DEFAULT_BRIDGE_PAIRS: JSON.stringify(inputs.default_bridge_pairs),
        RATE_LIMITS: JSON.stringify(inputs.rate_limits)
      },
      build_settings: {
        framework: 'nextjs',
        node_version: '18',
        install_command: 'npm install',
        build_command: 'npm run build',
        output_directory: '.next'
      },
      domains: {
        custom_domain: true,
        ssl: true
      }
    }
  }

  private generateSupportedRoutes(inputs: Record<string, any>): any[] {
    const chains = inputs.supported_chains || ['1', '137']
    const routes = []

    // Generate all possible chain pairs
    for (let i = 0; i < chains.length; i++) {
      for (let j = 0; j < chains.length; j++) {
        if (i !== j) {
          routes.push({
            from: chains[i],
            to: chains[j],
            fromName: this.getChainName(chains[i]),
            toName: this.getChainName(chains[j]),
            estimatedTime: '10-30 minutes',
            supported: true
          })
        }
      }
    }

    return routes
  }

  private async testBridgeApiConnection(inputs: Record<string, any>): Promise<any> {
    // Test the API key with a simple request
    // This is a placeholder - actual endpoint may differ
    const url = 'https://api.1inch.dev/fusion-plus/v1.0/health'
    
    return await this.makeApiRequest(url, {
      headers: {
        'Authorization': `Bearer ${inputs.api_key}`,
        'accept': 'application/json'
      }
    })
  }

  private getChainName(chainId: string): string {
    const chainNames: Record<string, string> = {
      '1': 'Ethereum',
      '137': 'Polygon',
      '56': 'BNB Chain',
      '42161': 'Arbitrum',
      '10': 'Optimism',
      '101': 'Solana'
    }
    return chainNames[chainId] || 'Unknown'
  }
}

// Chain Selector Component
export class ChainSelectorComponent extends BridgeComponent {
  readonly name = 'Chain Selector'
  readonly description = 'Select blockchain networks for multi-chain operations'

  readonly inputs: ComponentInput[] = [
    {
      key: 'supported_chains',
      label: 'Supported Chains',
      description: 'Select blockchain networks that the dashboard will support',
      type: 'multiselect',
      required: true,
      defaultValue: ['1', '137'],
      options: [
        { value: '1', label: 'Ethereum' },
        { value: '137', label: 'Polygon' },
        { value: '56', label: 'BNB Chain' },
        { value: '42161', label: 'Arbitrum' },
        { value: '10', label: 'Optimism' },
        { value: '43114', label: 'Avalanche' },
        { value: '250', label: 'Fantom' }
      ]
    },
    {
      key: 'default_chain',
      label: 'Default Chain',
      description: 'Default blockchain network when dashboard loads',
      type: 'select',
      required: true,
      defaultValue: '1',
      options: [
        { value: '1', label: 'Ethereum' },
        { value: '137', label: 'Polygon' },
        { value: '56', label: 'BNB Chain' },
        { value: '42161', label: 'Arbitrum' },
        { value: '10', label: 'Optimism' },
        { value: '43114', label: 'Avalanche' },
        { value: '250', label: 'Fantom' }
      ]
    },
    {
      key: 'enable_testnet',
      label: 'Enable Testnets',
      description: 'Include testnet networks in the dashboard',
      type: 'boolean',
      required: false,
      defaultValue: false
    },
    {
      key: 'ui_config',
      label: 'UI Configuration',
      description: 'Chain selector UI settings',
      type: 'json',
      required: false,
      defaultValue: {
        theme: 'modern',
        showChainLogos: true,
        showNetworkStatus: true,
        enableQuickSwitch: true,
        showGasPrice: false
      },
      placeholder: 'JSON configuration for UI'
    },
    {
      key: 'rpc_endpoints',
      label: 'Custom RPC Endpoints',
      description: 'Custom RPC endpoints for each chain (optional)',
      type: 'json',
      required: false,
      defaultValue: {},
      placeholder: '{"1": "https://eth-mainnet.alchemyapi.io/v2/YOUR-API-KEY"}'
    }
  ]

  readonly outputs: ComponentOutput[] = [
    {
      key: 'dashboard_config',
      label: 'Chain Selector Configuration',
      description: 'Complete configuration for the chain selector dashboard',
      type: 'object'
    },
    {
      key: 'ui_components',
      label: 'UI Components',
      description: 'React components for chain selection interface',
      type: 'object'
    },
    {
      key: 'chain_data',
      label: 'Chain Data',
      description: 'Detailed information about all supported chains',
      type: 'object'
    },
    {
      key: 'deployment_config',
      label: 'Deployment Config',
      description: 'Configuration for deploying the chain selector',
      type: 'object'
    }
  ]

  readonly metadata: ComponentMetadata = {
    category: 'infrastructure',
    tags: ['chain', 'network', 'selection', 'multi-chain'],
    version: '1.0.0',
    author: 'Unite DeFi Platform',
    examples: [
      {
        name: 'Multi-Chain Selector Dashboard',
        description: 'Configure a chain selector for multi-chain DeFi dashboard',
        inputs: {
          supported_chains: ['1', '137', '42161'],
          default_chain: '1',
          enable_testnet: false,
          ui_config: {
            theme: 'modern',
            showChainLogos: true,
            showNetworkStatus: true
          }
        },
        expectedOutputs: {
          dashboard_config: 'Complete chain selector configuration',
          ui_components: 'React components for chain selection',
          chain_data: 'Information about all supported chains'
        }
      }
    ]
  }

  async execute(inputs: Record<string, any>): Promise<ComponentExecutionResult> {
    return this.test(inputs) // Chain selection is read-only
  }

  async test(inputs: Record<string, any>): Promise<ComponentExecutionResult> {
    const startTime = Date.now()
    const logs: string[] = []

    try {
      const validation = this.validateInputs(inputs)
      if (!validation.valid) {
        return {
          success: false,
          outputs: {},
          error: validation.errors.join(', '),
          logs: validation.errors.map(err => this.createLog('error', err)),
          executionTime: Date.now() - startTime
        }
      }

      logs.push(this.createLog('info', 'Testing chain selector dashboard configuration'))

      // Generate dashboard configuration
      const dashboardConfig = this.generateChainSelectorConfig(inputs)
      logs.push(this.createLog('info', 'Chain selector configuration generated'))

      // Generate chain data for all supported chains
      const chainData = this.generateChainData(inputs)
      logs.push(this.createLog('info', `Chain data generated for ${inputs.supported_chains?.length || 0} chains`))

      return {
        success: true,
        outputs: {
          dashboard_config: dashboardConfig,
          ui_components: this.generateChainSelectorUiComponents(inputs),
          chain_data: chainData,
          deployment_config: this.generateChainSelectorDeploymentConfig(inputs)
        },
        logs,
        executionTime: Date.now() - startTime
      }
    } catch (error: any) {
      return {
        success: false,
        outputs: {},
        error: this.formatError(error),
        logs: [this.createLog('error', this.formatError(error))],
        executionTime: Date.now() - startTime
      }
    }
  }

  protected async getBridgeQuote(inputs: Record<string, any>): Promise<any> {
    throw new Error('Chain selector does not provide bridge quotes')
  }

  protected async executeBridge(inputs: Record<string, any>): Promise<any> {
    throw new Error('Chain selector does not execute bridges')
  }

  protected async trackBridgeStatus(txHash: string): Promise<any> {
    throw new Error('Chain selector does not track bridge status')
  }

  private getChainInfo(chainId: string): any {
    const chainData: Record<string, any> = {
      '1': {
        name: 'Ethereum',
        symbol: 'ETH',
        rpcUrl: 'https://mainnet.infura.io/v3/',
        blockExplorer: 'https://etherscan.io',
        nativeCurrency: 'ETH',
        type: 'mainnet'
      },
      '137': {
        name: 'Polygon',
        symbol: 'MATIC',
        rpcUrl: 'https://polygon-rpc.com',
        blockExplorer: 'https://polygonscan.com',
        nativeCurrency: 'MATIC',
        type: 'l2'
      },
      '56': {
        name: 'BNB Chain',
        symbol: 'BNB',
        rpcUrl: 'https://bsc-dataseed.binance.org',
        blockExplorer: 'https://bscscan.com',
        nativeCurrency: 'BNB',
        type: 'mainnet'
      }
    }

    return chainData[chainId] || { name: 'Unknown', symbol: 'UNKNOWN' }
  }

  private async getSupportedTokens(chainId: string): Promise<string[]> {
    // This would typically fetch from a token list API
    const commonTokens: Record<string, string[]> = {
      '1': ['ETH', 'USDC', 'USDT', 'DAI', 'WBTC', '1INCH'],
      '137': ['MATIC', 'USDC', 'USDT', 'DAI', 'WETH'],
      '56': ['BNB', 'USDT', 'BUSD', 'CAKE']
    }

    return commonTokens[chainId] || []
  }

  private generateChainSelectorConfig(inputs: Record<string, any>): any {
    return {
      name: 'Chain Selector Dashboard',
      description: 'Multi-chain network selector for DeFi applications',
      version: '1.0.0',
      supported_chains: inputs.supported_chains || ['1', '137'],
      default_chain: inputs.default_chain || '1',
      enable_testnet: inputs.enable_testnet || false,
      ui_config: inputs.ui_config || {
        theme: 'modern',
        showChainLogos: true,
        showNetworkStatus: true,
        enableQuickSwitch: true,
        showGasPrice: false
      },
      rpc_endpoints: inputs.rpc_endpoints || {}
    }
  }

  private generateChainData(inputs: Record<string, any>): any {
    const chains = inputs.supported_chains || ['1', '137']
    const chainData: Record<string, any> = {}

    chains.forEach((chainId: string) => {
      chainData[chainId] = this.getChainInfo(chainId)
    })

    return chainData
  }

  private generateChainSelectorUiComponents(inputs: Record<string, any>): any {
    return {
      components: [
        {
          name: 'ChainSelector',
          type: 'react',
          props: {
            supportedChains: inputs.supported_chains,
            defaultChain: inputs.default_chain,
            enableTestnet: inputs.enable_testnet,
            uiConfig: inputs.ui_config,
            rpcEndpoints: inputs.rpc_endpoints
          }
        },
        {
          name: 'ChainStatus',
          type: 'react',
          props: {
            showNetworkStatus: inputs.ui_config?.showNetworkStatus || true,
            showGasPrice: inputs.ui_config?.showGasPrice || false
          }
        },
        {
          name: 'ChainSwitcher',
          type: 'react',
          props: {
            enableQuickSwitch: inputs.ui_config?.enableQuickSwitch || true,
            supportedChains: inputs.supported_chains
          }
        }
      ],
      styles: {
        theme: inputs.ui_config?.theme || 'modern',
        primaryColor: '#3B82F6',
        borderRadius: '8px'
      }
    }
  }

  private generateChainSelectorDeploymentConfig(inputs: Record<string, any>): any {
    return {
      platform: 'vercel',
      environment: {
        SUPPORTED_CHAINS: JSON.stringify(inputs.supported_chains),
        DEFAULT_CHAIN: inputs.default_chain,
        ENABLE_TESTNET: inputs.enable_testnet?.toString(),
        RPC_ENDPOINTS: JSON.stringify(inputs.rpc_endpoints)
      },
      build_settings: {
        framework: 'nextjs',
        node_version: '18',
        install_command: 'npm install',
        build_command: 'npm run build',
        output_directory: '.next'
      },
      domains: {
        custom_domain: true,
        ssl: true
      }
    }
  }
}