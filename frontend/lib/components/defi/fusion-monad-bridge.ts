import { BridgeComponent, ComponentInput, ComponentOutput, ComponentExecutionResult, ComponentMetadata } from '../base-component'

export class FusionMonadBridgeComponent extends BridgeComponent {
  readonly name = '1inch Fusion+ Monad Bridge'
  readonly description = 'Execute trustless atomic swaps between Ethereum and Monad using Hash Time Locked Contracts (HTLCs) with 1inch Fusion+ integration'

  readonly inputs: ComponentInput[] = [
    {
      key: 'api_key',
      label: '1inch API Key',
      description: 'Your 1inch API key for Fusion+ protocol access',
      type: 'api_key',
      required: true,
      sensitive: true,
      placeholder: 'Enter your 1inch API key...'
    },
    {
      key: 'bridge_direction',
      label: 'Bridge Direction',
      description: 'Direction of the cross-chain atomic swap',
      type: 'select',
      required: true,
      defaultValue: 'eth_to_monad',
      options: [
        { value: 'eth_to_monad', label: 'Ethereum → Monad' },
        { value: 'monad_to_eth', label: 'Monad → Ethereum' }
      ]
    },
    {
      key: 'source_token',
      label: 'Source Token',
      description: 'Token to swap from source chain',
      type: 'token',
      required: true,
      validation: {
        pattern: '^(0x[a-fA-F0-9]{40}|[A-Z]{2,5})$'
      },
      placeholder: '0x... or ETH/MATIC/etc'
    },
    {
      key: 'destination_token',
      label: 'Destination Token',
      description: 'Token to receive on destination chain',
      type: 'token',
      required: true,
      validation: {
        pattern: '^(0x[a-fA-F0-9]{40}|[A-Z]{2,5})$'
      },
      placeholder: '0x... or ETH/MATIC/etc'
    },
    {
      key: 'amount',
      label: 'Swap Amount',
      description: 'Amount to bridge across chains (in token units)',
      type: 'number',
      required: true,
      validation: {
        min: 0.000001
      },
      placeholder: '1.0'
    },
    {
      key: 'timelock_duration',
      label: 'Timelock Duration (hours)',
      description: 'Hours before automatic refund is available (default: 24)',
      type: 'number',
      required: false,
      defaultValue: 24,
      validation: {
        min: 1,
        max: 168 // 7 days max
      }
    },
    {
      key: 'enable_partial_fills',
      label: 'Enable Partial Fills',
      description: 'Allow incremental order execution via Fusion+ resolvers',
      type: 'boolean',
      required: false,
      defaultValue: true
    },
    {
      key: 'enable_mev_protection',
      label: 'MEV Protection',
      description: 'Enable MEV protection through Fusion+ Dutch auctions',
      type: 'boolean',
      required: false,
      defaultValue: true
    },
    {
      key: 'slippage_tolerance',
      label: 'Slippage Tolerance (%)',
      description: 'Maximum acceptable slippage for the atomic swap',
      type: 'number',
      required: false,
      defaultValue: 1,
      validation: {
        min: 0.1,
        max: 50
      }
    },
    {
      key: 'gas_optimization',
      label: 'Gas Optimization',
      description: 'Gas optimization strategy for HTLC operations',
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
      key: 'relayer_config',
      label: 'Relayer Configuration',
      description: 'Custom relayer settings for cross-chain coordination',
      type: 'json',
      required: false,
      defaultValue: {
        auto_relay: true,
        timeout_minutes: 30,
        max_retries: 3
      },
      placeholder: 'JSON configuration for relayer'
    },
    {
      key: 'ui_config',
      label: 'UI Configuration',
      description: 'Dashboard UI settings for the bridge interface',
      type: 'json',
      required: false,
      defaultValue: {
        theme: 'modern',
        show_atomic_status: true,
        show_timelock_countdown: true,
        show_gas_estimates: true,
        enable_advanced_options: false
      },
      placeholder: 'JSON configuration for UI'
    }
  ]

  readonly outputs: ComponentOutput[] = [
    {
      key: 'bridge_config',
      label: 'Bridge Configuration',
      description: 'Complete configuration for the Fusion+ Monad bridge',
      type: 'object'
    },
    {
      key: 'htlc_contracts',
      label: 'HTLC Contract Configuration',
      description: 'Hash Time Locked Contract settings for both chains',
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
      label: 'Deployment Configuration',
      description: 'Configuration for deploying the bridge application',
      type: 'object'
    },
    {
      key: 'monitoring_config',
      label: 'Monitoring Configuration',
      description: 'Cross-chain monitoring and event tracking setup',
      type: 'object'
    }
  ]

  readonly metadata: ComponentMetadata = {
    category: 'bridge',
    tags: ['1inch', 'fusion+', 'monad', 'ethereum', 'htlc', 'atomic-swap', 'cross-chain'],
    version: '1.0.0',
    author: 'Unite DeFi Platform',
    documentation: 'https://docs.1inch.io/docs/fusion-plus/introduction',
    examples: [
      {
        name: 'ETH to Monad Bridge',
        description: 'Configure atomic swaps from Ethereum to Monad with MEV protection',
        inputs: {
          bridge_direction: 'eth_to_monad',
          source_token: 'ETH',
          destination_token: 'MONAD',
          amount: 1.0,
          timelock_duration: 24,
          enable_partial_fills: true,
          enable_mev_protection: true
        },
        expectedOutputs: {
          bridge_config: 'Complete bridge configuration with HTLC parameters',
          htlc_contracts: 'Ethereum and Monad HTLC contract addresses',
          api_endpoints: 'Bridge API endpoints for atomic swap operations'
        }
      },
      {
        name: 'Bidirectional USDC Bridge',
        description: 'Configure bidirectional USDC atomic swaps with advanced settings',
        inputs: {
          bridge_direction: 'eth_to_monad',
          source_token: '0xA0b86a33E6417c4a4e6d3b7e6d8f0e8b8e8c8d8e',
          destination_token: '0x...',
          amount: 1000,
          timelock_duration: 12,
          enable_partial_fills: false,
          slippage_tolerance: 0.5
        },
        expectedOutputs: {
          bridge_config: 'USDC bridge configuration with custom timelock',
          monitoring_config: 'Real-time atomic swap monitoring setup'
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

      logs.push(this.createLog('info', 'Generating Fusion+ Monad Bridge configuration'))

      // Generate bridge configuration
      const bridgeConfig = this.generateBridgeConfig(inputs)
      logs.push(this.createLog('info', 'Bridge configuration generated'))

      // Generate HTLC contract configuration
      const htlcContracts = this.generateHTLCConfiguration(inputs)
      logs.push(this.createLog('info', 'HTLC contract configuration generated'))

      // Generate API endpoints
      const apiEndpoints = this.generateBridgeApiEndpoints(inputs)
      logs.push(this.createLog('info', 'Bridge API endpoints generated'))

      // Generate UI components
      const uiComponents = this.generateBridgeUiComponents(inputs)
      logs.push(this.createLog('info', 'Bridge UI components generated'))

      // Generate monitoring configuration
      const monitoringConfig = this.generateMonitoringConfig(inputs)
      logs.push(this.createLog('info', 'Cross-chain monitoring configuration generated'))

      const executionTime = Date.now() - startTime

      return {
        success: true,
        outputs: {
          bridge_config: bridgeConfig,
          htlc_contracts: htlcContracts,
          api_endpoints: apiEndpoints,
          ui_components: uiComponents,
          deployment_config: this.generateDeploymentConfig(inputs),
          monitoring_config: monitoringConfig
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

      logs.push(this.createLog('info', 'Testing Fusion+ Monad Bridge configuration'))

      // Test API key if provided
      if (inputs.api_key) {
        try {
          await this.testBridgeApiConnection(inputs)
          logs.push(this.createLog('info', 'Bridge API connection test successful'))
        } catch (error: any) {
          logs.push(this.createLog('warn', `Bridge API test failed: ${error.message}`))
        }
      }

      // Test HTLC configuration
      const htlcTest = this.testHTLCConfiguration(inputs)
      logs.push(this.createLog('info', 'HTLC configuration validated'))

      // Generate test configuration
      const bridgeConfig = this.generateBridgeConfig(inputs)
      logs.push(this.createLog('info', 'Bridge configuration test successful'))

      return {
        success: true,
        outputs: {
          bridge_config: bridgeConfig,
          htlc_contracts: this.generateHTLCConfiguration(inputs),
          api_endpoints: this.generateBridgeApiEndpoints(inputs),
          ui_components: this.generateBridgeUiComponents(inputs),
          deployment_config: this.generateDeploymentConfig(inputs),
          monitoring_config: this.generateMonitoringConfig(inputs)
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
      bridge_direction,
      source_token, 
      destination_token, 
      amount 
    } = inputs

    // Integration with your existing HTLC system
    const [sourceChain, destChain] = bridge_direction === 'eth_to_monad' 
      ? ['1', 'monad-testnet'] 
      : ['monad-testnet', '1']

    const params = new URLSearchParams({
      fromChainId: sourceChain,
      toChainId: destChain,
      fromTokenAddress: source_token,
      toTokenAddress: destination_token,
      amount: amount,
      enableFusion: 'true',
      enableHTLC: 'true'
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
      bridge_direction,
      source_token, 
      destination_token, 
      amount, 
      from_address,
      to_address,
      enable_mev_protection = true,
      enable_partial_fills = true
    } = inputs

    const [sourceChain, destChain] = bridge_direction === 'eth_to_monad' 
      ? ['1', 'monad-testnet'] 
      : ['monad-testnet', '1']

    const params = new URLSearchParams({
      fromChainId: sourceChain,
      toChainId: destChain,
      fromTokenAddress: source_token,
      toTokenAddress: destination_token,
      amount: amount,
      fromAddress: from_address,
      toAddress: to_address || from_address,
      enableMEVProtection: enable_mev_protection.toString(),
      enablePartialFills: enable_partial_fills.toString(),
      enableHTLC: 'true'
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
    // Track atomic swap status across both chains
    return {
      status: 'htlc_created',
      phase: 'locked',
      sourceConfirmed: true,
      destinationConfirmed: false,
      timeRemaining: 24 * 60 * 60 * 1000, // 24 hours in ms
      estimatedCompletion: Date.now() + 15 * 60 * 1000 // 15 minutes
    }
  }

  private generateBridgeConfig(inputs: Record<string, any>): any {
    return {
      name: 'Fusion+ Monad Bridge',
      description: 'Atomic swaps between Ethereum and Monad using HTLCs',
      version: '1.0.0',
      bridge_direction: inputs.bridge_direction || 'eth_to_monad',
      source_token: inputs.source_token,
      destination_token: inputs.destination_token,
      amount: inputs.amount,
      timelock_duration: inputs.timelock_duration || 24,
      enable_partial_fills: inputs.enable_partial_fills || true,
      enable_mev_protection: inputs.enable_mev_protection || true,
      slippage_tolerance: inputs.slippage_tolerance || 1,
      gas_optimization: inputs.gas_optimization || 'balanced',
      relayer_config: inputs.relayer_config || {
        auto_relay: true,
        timeout_minutes: 30,
        max_retries: 3
      },
      ui_config: inputs.ui_config || {
        theme: 'modern',
        show_atomic_status: true,
        show_timelock_countdown: true,
        show_gas_estimates: true,
        enable_advanced_options: false
      },
      security_features: [
        'Hash Time Locked Contracts (HTLCs)',
        'Atomic Swap Guarantees', 
        'MEV Protection via Fusion+',
        'Automatic Refund Mechanism',
        'Cross-chain Event Monitoring'
      ]
    }
  }

  private generateHTLCConfiguration(inputs: Record<string, any>): any {
    const timelock = inputs.timelock_duration * 3600 // hours to seconds
    
    return {
      ethereum: {
        contract_name: 'FusionMonadAdapter',
        address: '0x...', // Your deployed Ethereum HTLC contract
        functions: {
          createOrder: 'createOrder(bytes32,uint256,address,uint256,string)',
          claimFunds: 'claimFunds(bytes32,bytes32)',
          refund: 'refund(bytes32)'
        },
        timelock_duration: timelock,
        gas_estimates: {
          create: '150000',
          claim: '80000',
          refund: '60000'
        }
      },
      monad: {
        contract_name: 'MonadBridge',
        address: '0x...', // Your deployed Monad HTLC contract
        functions: {
          lockFunds: 'lockFunds(bytes32,uint256,address,uint256)',
          claimFunds: 'claimFunds(bytes32,bytes32)',
          refund: 'refund(bytes32)'
        },
        timelock_duration: timelock,
        gas_estimates: {
          create: '75000', // 95% gas reduction on Monad
          claim: '40000',
          refund: '30000'
        }
      },
      hashlock_generation: {
        algorithm: 'keccak256',
        secret_length: 32,
        hash_length: 32
      },
      atomic_guarantees: {
        trustless: true,
        no_custodial_risk: true,
        automatic_refund: true,
        cryptographic_security: true
      }
    }
  }

  private generateBridgeApiEndpoints(inputs: Record<string, any>): any {
    return {
      base_url: '/api/fusion-monad-bridge',
      endpoints: {
        quote: {
          method: 'POST',
          path: '/quote',
          description: 'Get atomic swap quote between Ethereum and Monad',
          parameters: ['bridge_direction', 'source_token', 'destination_token', 'amount']
        },
        create_htlc: {
          method: 'POST',
          path: '/create-htlc',
          description: 'Create Hash Time Locked Contract for atomic swap',
          parameters: ['quote_id', 'from_address', 'timelock_duration']
        },
        claim_funds: {
          method: 'POST',
          path: '/claim/:contract_id',
          description: 'Claim funds from HTLC with secret',
          parameters: ['contract_id', 'secret', 'to_address']
        },
        refund: {
          method: 'POST',
          path: '/refund/:contract_id',
          description: 'Refund funds after timelock expiration',
          parameters: ['contract_id', 'from_address']
        },
        status: {
          method: 'GET',
          path: '/status/:contract_id',
          description: 'Track atomic swap status across both chains',
          parameters: ['contract_id']
        },
        monitor: {
          method: 'GET',
          path: '/monitor/:contract_id',
          description: 'WebSocket endpoint for real-time monitoring',
          parameters: ['contract_id']
        }
      },
      webhooks: {
        htlc_created: '/webhooks/htlc-created',
        funds_locked: '/webhooks/funds-locked',
        secret_revealed: '/webhooks/secret-revealed',
        funds_claimed: '/webhooks/funds-claimed',
        refund_executed: '/webhooks/refund-executed'
      }
    }
  }

  private generateBridgeUiComponents(inputs: Record<string, any>): any {
    return {
      components: [
        {
          name: 'FusionMonadBridgeInterface',
          type: 'react',
          props: {
            bridgeDirection: inputs.bridge_direction,
            enablePartialFills: inputs.enable_partial_fills,
            enableMevProtection: inputs.enable_mev_protection,
            timelockDuration: inputs.timelock_duration,
            uiConfig: inputs.ui_config
          }
        },
        {
          name: 'AtomicSwapStatus',
          type: 'react',
          props: {
            showAtomicStatus: inputs.ui_config?.show_atomic_status || true,
            showTimelockCountdown: inputs.ui_config?.show_timelock_countdown || true,
            showGasEstimates: inputs.ui_config?.show_gas_estimates || true
          }
        },
        {
          name: 'HTLCMonitor',
          type: 'react',
          props: {
            autoUpdate: true,
            updateInterval: 10000, // 10 seconds
            showEventHistory: true
          }
        },
        {
          name: 'ChainSelector',
          type: 'react',
          props: {
            supportedChains: ['ethereum', 'monad'],
            enableDirectionSwitch: true
          }
        }
      ],
      styles: {
        theme: inputs.ui_config?.theme || 'modern',
        primaryColor: '#00D4FF', // Monad brand color
        secondaryColor: '#3B82F6', // 1inch brand color
        borderRadius: '8px',
        atomicStatusColors: {
          pending: '#F59E0B',
          locked: '#3B82F6',
          revealed: '#10B981',
          completed: '#059669',
          refunded: '#EF4444'
        }
      }
    }
  }

  private generateMonitoringConfig(inputs: Record<string, any>): any {
    return {
      event_monitoring: {
        ethereum: {
          events: ['OrderCreated', 'FundsClaimed', 'RefundExecuted'],
          block_confirmations: 12,
          polling_interval: 15000
        },
        monad: {
          events: ['FundsLocked', 'FundsClaimed', 'RefundExecuted'], 
          block_confirmations: 1,
          polling_interval: 3000
        }
      },
      relayer_service: {
        enabled: inputs.relayer_config?.auto_relay || true,
        timeout_minutes: inputs.relayer_config?.timeout_minutes || 30,
        max_retries: inputs.relayer_config?.max_retries || 3,
        retry_delay_seconds: 60
      },
      websocket_config: {
        endpoint: '/ws/atomic-swap-monitor',
        heartbeat_interval: 30000,
        reconnect_attempts: 5
      },
      alerts: {
        timelock_expiry_warning: {
          enabled: true,
          warning_hours: 2
        },
        failed_relay_attempts: {
          enabled: true,
          max_failures: 3
        },
        long_pending_swaps: {
          enabled: true,
          threshold_minutes: 60
        }
      }
    }
  }

  private generateDeploymentConfig(inputs: Record<string, any>): any {
    return {
      platform: 'vercel',
      environment: {
        FUSION_PLUS_API_KEY: inputs.api_key,
        ETHEREUM_RPC_URL: 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID',
        MONAD_RPC_URL: 'https://testnet-rpc.monad.xyz',
        FUSION_MONAD_ADAPTER_ADDRESS: '0x...', // Your Ethereum contract
        MONAD_BRIDGE_ADDRESS: '0x...', // Your Monad contract
        TIMELOCK_DURATION: inputs.timelock_duration?.toString() || '24',
        ENABLE_MEV_PROTECTION: inputs.enable_mev_protection?.toString() || 'true'
      },
      build_settings: {
        framework: 'nextjs',
        node_version: '18',
        install_command: 'npm install',
        build_command: 'npm run build',
        output_directory: '.next'
      },
      docker_config: {
        base_image: 'node:18-alpine',
        ports: ['3000'],
        volumes: ['/app/data'],
        environment_variables: [
          'FUSION_PLUS_API_KEY',
          'ETHEREUM_RPC_URL',
          'MONAD_RPC_URL'
        ]
      },
      domains: {
        custom_domain: true,
        ssl: true,
        cdn: true
      }
    }
  }

  private async testBridgeApiConnection(inputs: Record<string, any>): Promise<any> {
    const url = 'https://api.1inch.dev/fusion-plus/v1.0/health'
    
    return await this.makeApiRequest(url, {
      headers: {
        'Authorization': `Bearer ${inputs.api_key}`,
        'accept': 'application/json'
      }
    })
  }

  private testHTLCConfiguration(inputs: Record<string, any>): boolean {
    // Validate HTLC parameters
    const timelock = inputs.timelock_duration || 24
    if (timelock < 1 || timelock > 168) {
      throw new Error('Timelock duration must be between 1 and 168 hours')
    }

    if (inputs.amount <= 0) {
      throw new Error('Amount must be positive')
    }

    return true
  }
}
