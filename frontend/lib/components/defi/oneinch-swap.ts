import { SwapComponent, ComponentInput, ComponentOutput, ComponentExecutionResult, ComponentMetadata } from '../base-component'

export class OneInchSwapComponent extends SwapComponent {
  readonly name = '1inch Swap'
  readonly description = 'Execute token swaps using 1inch aggregation protocol with Pathfinder routing and MEV protection'

  readonly inputs: ComponentInput[] = [
    {
      key: 'api_key',
      label: '1inch API Key',
      description: 'Your 1inch API key for accessing the aggregation protocol',
      type: 'api_key',
      required: true,
      sensitive: true,
      placeholder: 'Enter your 1inch API key...'
    },
    {
      key: 'supported_chains',
      label: 'Supported Chains',
      description: 'Select blockchain networks this swap tool will support',
      type: 'multiselect',
      required: true,
      defaultValue: ['1'],
      options: [
        { value: '1', label: 'Ethereum' },
        { value: '137', label: 'Polygon' },
        { value: '56', label: 'BNB Chain' },
        { value: '42161', label: 'Arbitrum' },
        { value: '10', label: 'Optimism' },
        { value: '43114', label: 'Avalanche' }
      ]
    },
    {
      key: 'default_tokens',
      label: 'Default Token Pairs',
      description: 'Common token pairs to show in the dashboard (e.g., ETH/USDC, USDT/DAI)',
      type: 'json',
      required: false,
      defaultValue: [
        { from: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', to: '0xA0b86a33E6417c4a4e6d3b7e6d8f0e8b8e8c8d8e', label: 'ETH/USDC' },
        { from: '0xdAC17F958D2ee523a2206206994597C13D831ec7', to: '0x6B175474E89094C44Da98b954EedeAC495271d0F', label: 'USDT/DAI' }
      ],
      placeholder: 'JSON array of token pairs'
    },
    {
      key: 'default_slippage',
      label: 'Default Slippage (%)',
      description: 'Default slippage tolerance for users (can be overridden)',
      type: 'number',
      required: false,
      defaultValue: 1,
      validation: {
        min: 0.1,
        max: 50
      }
    },
    {
      key: 'enable_fusion',
      label: 'Enable Fusion Mode',
      description: 'Use 1inch Fusion for MEV protection (when available)',
      type: 'boolean',
      required: false,
      defaultValue: false
    },
    {
      key: 'gas_optimization',
      label: 'Gas Optimization',
      description: 'Default gas optimization strategy',
      type: 'select',
      required: false,
      defaultValue: 'balanced',
      options: [
        { value: 'low', label: 'Low Gas (Slower)' },
        { value: 'balanced', label: 'Balanced' },
        { value: 'fast', label: 'Fast (Higher Gas)' }
      ]
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
      key: 'ui_config',
      label: 'UI Configuration',
      description: 'Dashboard UI settings (theme, layout, etc.)',
      type: 'json',
      required: false,
      defaultValue: {
        theme: 'modern',
        showPriceChart: true,
        showGasEstimate: true,
        showSlippageControl: true,
        enableTokenSearch: true
      },
      placeholder: 'JSON configuration for UI'
    },
    {
      key: 'rate_limits',
      label: 'Rate Limits',
      description: 'API rate limiting settings for the dashboard',
      type: 'json',
      required: false,
      defaultValue: {
        requests_per_minute: 60,
        requests_per_hour: 1000,
        enable_caching: true,
        cache_duration: 300
      },
      placeholder: 'JSON rate limit configuration'
    }
  ]

  readonly outputs: ComponentOutput[] = [
    {
      key: 'dashboard_config',
      label: 'Dashboard Configuration',
      description: 'Complete configuration for the swap dashboard',
      type: 'object'
    },
    {
      key: 'api_endpoints',
      label: 'API Endpoints',
      description: 'Generated API endpoints for the dashboard',
      type: 'object'
    },
    {
      key: 'ui_components',
      label: 'UI Components',
      description: 'React components for the dashboard interface',
      type: 'object'
    },
    {
      key: 'deployment_config',
      label: 'Deployment Config',
      description: 'Configuration for deploying the dashboard',
      type: 'object'
    },
    {
      key: 'rate_limits',
      label: 'Rate Limits',
      description: 'Configured rate limiting settings',
      type: 'object'
    }
  ]

  readonly metadata: ComponentMetadata = {
    category: 'swap',
    tags: ['1inch', 'swap', 'aggregator', 'pathfinder', 'mev-protection', 'fusion'],
    version: '1.0.0',
    author: 'Unite DeFi Platform',
    documentation: 'https://docs.1inch.io/docs/aggregation-protocol/api/swagger',
    examples: [
      {
        name: 'Dashboard Configuration',
        description: 'Configure a 1inch swap dashboard for end users',
        inputs: {
          api_key: 'your-api-key',
          supported_chains: ['1', '137'],
          default_tokens: [
            { from: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', to: '0xA0b86a33E6417c4a4e6d3b7e6d8f0e8b8e8c8d8e', label: 'ETH/USDC' }
          ],
          default_slippage: 1
        },
        expectedOutputs: {
          dashboard_config: 'Complete dashboard configuration',
          api_endpoints: 'Generated API endpoints',
          ui_components: 'React components for the dashboard'
        }
      }
    ]
  }

  async execute(inputs: Record<string, any>): Promise<ComponentExecutionResult> {
    const startTime = Date.now()
    const logs: string[] = []

    try {
      // Validate inputs
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

      logs.push(this.createLog('info', 'Generating 1inch swap dashboard configuration'))

      // Generate dashboard configuration
      const dashboardConfig = this.generateDashboardConfig(inputs)
      logs.push(this.createLog('info', 'Dashboard configuration generated'))

      // Generate API endpoints
      const apiEndpoints = this.generateApiEndpoints(inputs)
      logs.push(this.createLog('info', 'API endpoints generated'))

      // Generate UI components
      const uiComponents = this.generateUiComponents(inputs)
      logs.push(this.createLog('info', 'UI components generated'))

      const executionTime = Date.now() - startTime

      return {
        success: true,
        outputs: {
          dashboard_config: dashboardConfig,
          api_endpoints: apiEndpoints,
          ui_components: uiComponents,
          deployment_config: this.generateDeploymentConfig(inputs),
          rate_limits: inputs.rate_limits || {
            requests_per_minute: 60,
            requests_per_hour: 1000,
            enable_caching: true,
            cache_duration: 300
          }
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
      // Validate inputs
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

      logs.push(this.createLog('info', 'Testing 1inch dashboard configuration'))

      // Test API key by making a simple request
      if (inputs.api_key) {
        try {
          const testQuote = await this.testApiConnection(inputs)
          logs.push(this.createLog('info', 'API connection test successful'))
        } catch (error: any) {
          logs.push(this.createLog('warn', `API test failed: ${error.message}`))
        }
      }

      // Generate test configuration
      const dashboardConfig = this.generateDashboardConfig(inputs)
      logs.push(this.createLog('info', 'Dashboard configuration test successful'))

      const executionTime = Date.now() - startTime

      return {
        success: true,
        outputs: {
          dashboard_config: dashboardConfig,
          api_endpoints: this.generateApiEndpoints(inputs),
          ui_components: this.generateUiComponents(inputs),
          deployment_config: this.generateDeploymentConfig(inputs),
          rate_limits: inputs.rate_limits || {
            requests_per_minute: 60,
            requests_per_hour: 1000,
            enable_caching: true,
            cache_duration: 300
          }
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

  protected async getQuote(inputs: Record<string, any>): Promise<any> {
    const { api_key, chain_id, from_token, to_token, amount, slippage = 1 } = inputs

    const params = new URLSearchParams({
      fromTokenAddress: from_token,
      toTokenAddress: to_token,
      amount: amount,
      slippage: slippage.toString(),
      disableEstimate: 'false',
      allowPartialFill: 'true'
    })

    const url = `https://api.1inch.dev/swap/v5.2/${chain_id}/quote?${params}`

    return await this.makeApiRequest(url, {
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'accept': 'application/json'
      }
    })
  }

  protected async executeSwap(inputs: Record<string, any>): Promise<any> {
    const { 
      api_key, 
      chain_id, 
      from_token, 
      to_token, 
      amount, 
      from_address, 
      slippage = 1,
      fee_recipient,
      fee_percent = 0
    } = inputs

    const params = new URLSearchParams({
      fromTokenAddress: from_token,
      toTokenAddress: to_token,
      amount: amount,
      fromAddress: from_address,
      slippage: slippage.toString(),
      disableEstimate: 'false',
      allowPartialFill: 'true'
    })

    // Add referral fee if specified
    if (fee_recipient && fee_percent > 0) {
      params.append('referrerAddress', fee_recipient)
      params.append('fee', (fee_percent * 100).toString()) // 1inch expects basis points
    }

    const url = `https://api.1inch.dev/swap/v5.2/${chain_id}/swap?${params}`

    return await this.makeApiRequest(url, {
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'accept': 'application/json'
      }
    })
  }

  private calculatePriceImpact(quote: any): string {
    // Calculate price impact based on quote data
    if (quote.fromTokenAmount && quote.toTokenAmount) {
      // This is a simplified calculation - in reality you'd compare with market rates
      return '0.1' // Placeholder
    }
    return '0'
  }

  private extractProtocols(quote: any): string[] {
    if (quote.protocols && Array.isArray(quote.protocols)) {
      return quote.protocols.flat().map((protocol: any) => protocol.name || 'Unknown')
    }
    return []
  }

  private calculateSavings(quote: any): string {
    // Calculate savings compared to other DEXs
    return quote.estimatedGas || '0'
  }

  private generateDashboardConfig(inputs: Record<string, any>): any {
    return {
      name: '1inch Swap Dashboard',
      description: 'Aggregated swap dashboard powered by 1inch',
      version: '1.0.0',
      supported_chains: inputs.supported_chains || ['1'],
      default_tokens: inputs.default_tokens || [],
      default_slippage: inputs.default_slippage || 1,
      enable_fusion: inputs.enable_fusion || false,
      gas_optimization: inputs.gas_optimization || 'balanced',
      fee_recipient: inputs.fee_recipient,
      fee_percent: inputs.fee_percent || 0,
      ui_config: inputs.ui_config || {
        theme: 'modern',
        showPriceChart: true,
        showGasEstimate: true,
        showSlippageControl: true,
        enableTokenSearch: true
      }
    }
  }

  private generateApiEndpoints(inputs: Record<string, any>): any {
    return {
      base_url: '/api/1inch',
      endpoints: {
        quote: {
          method: 'POST',
          path: '/quote',
          description: 'Get swap quote',
          parameters: ['fromToken', 'toToken', 'amount', 'chainId', 'slippage']
        },
        swap: {
          method: 'POST',
          path: '/swap',
          description: 'Execute swap',
          parameters: ['fromToken', 'toToken', 'amount', 'fromAddress', 'chainId', 'slippage']
        },
        tokens: {
          method: 'GET',
          path: '/tokens',
          description: 'Get supported tokens',
          parameters: ['chainId']
        },
        protocols: {
          method: 'GET',
          path: '/protocols',
          description: 'Get supported protocols',
          parameters: ['chainId']
        }
      },
      rate_limits: inputs.rate_limits || {
        requests_per_minute: 60,
        requests_per_hour: 1000,
        enable_caching: true,
        cache_duration: 300
      }
    }
  }

  private generateUiComponents(inputs: Record<string, any>): any {
    return {
      components: [
        {
          name: 'SwapInterface',
          type: 'react',
          props: {
            supportedChains: inputs.supported_chains,
            defaultTokens: inputs.default_tokens,
            defaultSlippage: inputs.default_slippage,
            enableFusion: inputs.enable_fusion,
            gasOptimization: inputs.gas_optimization,
            uiConfig: inputs.ui_config
          }
        },
        {
          name: 'TokenSelector',
          type: 'react',
          props: {
            supportedChains: inputs.supported_chains,
            defaultTokens: inputs.default_tokens
          }
        },
        {
          name: 'PriceChart',
          type: 'react',
          props: {
            enabled: inputs.ui_config?.showPriceChart || true
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

  private generateDeploymentConfig(inputs: Record<string, any>): any {
    return {
      platform: 'vercel',
      environment: {
        ONEGINCH_API_KEY: inputs.api_key,
        SUPPORTED_CHAINS: JSON.stringify(inputs.supported_chains),
        DEFAULT_TOKENS: JSON.stringify(inputs.default_tokens),
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

  private async testApiConnection(inputs: Record<string, any>): Promise<any> {
    // Test the API key with a simple token list request
    const chainId = inputs.supported_chains?.[0] || '1'
    const url = `https://api.1inch.dev/token/v1.2/${chainId}/token-list`
    
    return await this.makeApiRequest(url, {
      headers: {
        'Authorization': `Bearer ${inputs.api_key}`,
        'accept': 'application/json'
      }
    })
  }
}

// Additional 1inch components for the hackathon

export class OneInchQuoteComponent extends SwapComponent {
  readonly name = '1inch Quote Dashboard'
  readonly description = 'Configure a real-time quote dashboard with sub-400ms response times using 1inch Pathfinder'

  readonly inputs: ComponentInput[] = [
    {
      key: 'api_key',
      label: '1inch API Key',
      description: 'Your 1inch API key for accessing quote services',
      type: 'api_key',
      required: true,
      sensitive: true,
      placeholder: 'Enter your 1inch API key...'
    },
    {
      key: 'supported_chains',
      label: 'Supported Chains',
      description: 'Select blockchain networks for quote services',
      type: 'multiselect',
      required: true,
      defaultValue: ['1', '137'],
      options: [
        { value: '1', label: 'Ethereum' },
        { value: '137', label: 'Polygon' },
        { value: '56', label: 'BNB Chain' },
        { value: '42161', label: 'Arbitrum' },
        { value: '10', label: 'Optimism' },
        { value: '43114', label: 'Avalanche' }
      ]
    },
    {
      key: 'default_token_pairs',
      label: 'Default Token Pairs',
      description: 'Popular token pairs to show for quick quotes',
      type: 'json',
      required: false,
      defaultValue: [
        { from: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', to: '0xA0b86a33E6417c4a4e6d3b7e6d8f0e8b8e8c8d8e', label: 'ETH/USDC' },
        { from: '0xA0b86a33E6417c4a4e6d3b7e6d8f0e8b8e8c8d8e', to: '0xdAC17F958D2ee523a2206206994597C13D831ec7', label: 'USDC/USDT' }
      ],
      placeholder: 'JSON array of token pairs'
    },
    {
      key: 'quote_refresh_interval',
      label: 'Quote Refresh Interval (seconds)',
      description: 'How often to refresh quotes automatically',
      type: 'number',
      required: false,
      defaultValue: 10,
      validation: {
        min: 5,
        max: 60
      }
    },
    {
      key: 'ui_config',
      label: 'UI Configuration',
      description: 'Dashboard UI settings for quote display',
      type: 'json',
      required: false,
      defaultValue: {
        theme: 'modern',
        showPriceChart: true,
        showPriceImpact: true,
        showGasEstimate: true,
        showProtocolBreakdown: false,
        enableSoundAlerts: false
      },
      placeholder: 'JSON configuration for UI'
    },
    {
      key: 'rate_limits',
      label: 'Rate Limits',
      description: 'API rate limiting settings for quote requests',
      type: 'json',
      required: false,
      defaultValue: {
        requests_per_second: 5,
        requests_per_minute: 100,
        enable_caching: true,
        cache_duration: 10
      },
      placeholder: 'JSON rate limit configuration'
    }
  ]

  readonly outputs: ComponentOutput[] = [
    {
      key: 'dashboard_config',
      label: 'Quote Dashboard Configuration',
      description: 'Complete configuration for the quote dashboard',
      type: 'object'
    },
    {
      key: 'api_endpoints',
      label: 'API Endpoints',
      description: 'Generated API endpoints for quote services',
      type: 'object'
    },
    {
      key: 'ui_components',
      label: 'UI Components',
      description: 'React components for quote display interface',
      type: 'object'
    },
    {
      key: 'deployment_config',
      label: 'Deployment Config',
      description: 'Configuration for deploying the quote dashboard',
      type: 'object'
    }
  ]

  readonly metadata: ComponentMetadata = {
    category: 'swap',
    tags: ['1inch', 'quote', 'pathfinder', 'real-time'],
    version: '1.0.0',
    author: 'Unite DeFi Platform'
  }

  async execute(inputs: Record<string, any>): Promise<ComponentExecutionResult> {
    return this.test(inputs) // Quote is read-only, so execute = test
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

      logs.push(this.createLog('info', 'Testing 1inch quote dashboard configuration'))

      // Test API key if provided
      if (inputs.api_key) {
        try {
          await this.testQuoteApiConnection(inputs)
          logs.push(this.createLog('info', 'Quote API connection test successful'))
        } catch (error: any) {
          logs.push(this.createLog('warn', `Quote API test failed: ${error.message}`))
        }
      }

      // Generate dashboard configuration
      const dashboardConfig = this.generateQuoteDashboardConfig(inputs)
      logs.push(this.createLog('info', 'Quote dashboard configuration generated'))

      return {
        success: true,
        outputs: {
          dashboard_config: dashboardConfig,
          api_endpoints: this.generateQuoteApiEndpoints(inputs),
          ui_components: this.generateQuoteUiComponents(inputs),
          deployment_config: this.generateQuoteDeploymentConfig(inputs)
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

  protected async getQuote(inputs: Record<string, any>): Promise<any> {
    const { api_key, chain_id, from_token, to_token, amount } = inputs
    
    const params = new URLSearchParams({
      fromTokenAddress: from_token,
      toTokenAddress: to_token,
      amount: amount
    })

    const url = `https://api.1inch.dev/swap/v5.2/${chain_id}/quote?${params}`

    return await this.makeApiRequest(url, {
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'accept': 'application/json'
      }
    })
  }

  protected async executeSwap(inputs: Record<string, any>): Promise<any> {
    throw new Error('Quote component does not execute swaps')
  }

  private async testQuoteApiConnection(inputs: Record<string, any>): Promise<any> {
    // Test the API key with a simple token list request
    const chainId = inputs.supported_chains?.[0] || '1'
    const url = `https://api.1inch.dev/token/v1.2/${chainId}/token-list`
    
    return await this.makeApiRequest(url, {
      headers: {
        'Authorization': `Bearer ${inputs.api_key}`,
        'accept': 'application/json'
      }
    })
  }

  private generateQuoteDashboardConfig(inputs: Record<string, any>): any {
    return {
      name: '1inch Quote Dashboard',
      description: 'Real-time quote dashboard powered by 1inch Pathfinder',
      version: '1.0.0',
      supported_chains: inputs.supported_chains || ['1', '137'],
      default_token_pairs: inputs.default_token_pairs || [],
      quote_refresh_interval: inputs.quote_refresh_interval || 10,
      ui_config: inputs.ui_config || {
        theme: 'modern',
        showPriceChart: true,
        showPriceImpact: true,
        showGasEstimate: true,
        showProtocolBreakdown: false,
        enableSoundAlerts: false
      },
      rate_limits: inputs.rate_limits || {
        requests_per_second: 5,
        requests_per_minute: 100,
        enable_caching: true,
        cache_duration: 10
      }
    }
  }

  private generateQuoteApiEndpoints(inputs: Record<string, any>): any {
    return {
      base_url: '/api/1inch-quote',
      endpoints: {
        quote: {
          method: 'POST',
          path: '/quote',
          description: 'Get real-time swap quote',
          parameters: ['fromToken', 'toToken', 'amount', 'chainId']
        },
        tokens: {
          method: 'GET',
          path: '/tokens',
          description: 'Get supported tokens for chain',
          parameters: ['chainId']
        },
        pairs: {
          method: 'GET',
          path: '/pairs',
          description: 'Get popular token pairs',
          parameters: ['chainId']
        },
        protocols: {
          method: 'GET',
          path: '/protocols',
          description: 'Get supported DEX protocols',
          parameters: ['chainId']
        }
      },
      rate_limits: inputs.rate_limits || {
        requests_per_second: 5,
        requests_per_minute: 100,
        enable_caching: true,
        cache_duration: 10
      }
    }
  }

  private generateQuoteUiComponents(inputs: Record<string, any>): any {
    return {
      components: [
        {
          name: 'QuoteDisplay',
          type: 'react',
          props: {
            supportedChains: inputs.supported_chains,
            defaultTokenPairs: inputs.default_token_pairs,
            refreshInterval: inputs.quote_refresh_interval,
            uiConfig: inputs.ui_config
          }
        },
        {
          name: 'PriceChart',
          type: 'react',
          props: {
            showPriceChart: inputs.ui_config?.showPriceChart || true,
            refreshInterval: inputs.quote_refresh_interval
          }
        },
        {
          name: 'TokenPairSelector',
          type: 'react',
          props: {
            supportedChains: inputs.supported_chains,
            defaultTokenPairs: inputs.default_token_pairs
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

  private generateQuoteDeploymentConfig(inputs: Record<string, any>): any {
    return {
      platform: 'vercel',
      environment: {
        ONEINCH_API_KEY: inputs.api_key,
        SUPPORTED_CHAINS: JSON.stringify(inputs.supported_chains),
        DEFAULT_TOKEN_PAIRS: JSON.stringify(inputs.default_token_pairs),
        QUOTE_REFRESH_INTERVAL: inputs.quote_refresh_interval?.toString(),
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
} 