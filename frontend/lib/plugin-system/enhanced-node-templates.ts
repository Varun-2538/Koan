/**
 * Enhanced Node Templates
 * Pre-built DeFi and utility components for the plugin system
 */

import { ComponentTemplate } from './types'

export const enhancedNodeTemplates: Record<string, ComponentTemplate> = {
  // DeFi Components
  oneInchSwap: {
    id: 'oneInchSwap',
    name: '1inch Swap',
    description: 'Execute token swaps using 1inch aggregator with fusion mode',
    category: 'DeFi',
    version: '1.0.0',
    icon: '🔄',
    color: '#0066FF',
    inputs: [
      {
        id: 'fromToken',
        name: 'From Token',
        dataType: 'token',
        required: true,
        description: 'Token to swap from'
      },
      {
        id: 'toToken', 
        name: 'To Token',
        dataType: 'token',
        required: true,
        description: 'Token to swap to'
      },
      {
        id: 'amount',
        name: 'Amount',
        dataType: 'number',
        required: true,
        description: 'Amount to swap (in token units)'
      },
      {
        id: 'slippage',
        name: 'Slippage %',
        dataType: 'number',
        required: false,
        description: 'Maximum slippage tolerance'
      }
    ],
    outputs: [
      {
        id: 'transactionHash',
        name: 'Transaction Hash',
        dataType: 'string',
        required: false,
        description: 'Blockchain transaction hash'
      },
      {
        id: 'outputAmount',
        name: 'Output Amount',
        dataType: 'number',
        required: false,
        description: 'Amount received after swap'
      },
      {
        id: 'gasUsed',
        name: 'Gas Used',
        dataType: 'number',
        required: false,
        description: 'Gas consumed by transaction'
      }
    ],
    fields: [
      {
        key: 'apiKey',
        type: 'text',
        label: '1inch API Key',
        required: true,
        sensitive: true,
        placeholder: 'Enter your 1inch API key',
        description: 'API key for 1inch aggregator'
      },
      {
        key: 'enableFusion',
        type: 'boolean',
        label: 'Enable Fusion Mode',
        defaultValue: true,
        description: 'Use gasless swaps with MEV protection'
      },
      {
        key: 'customLogic',
        type: 'code',
        label: 'Custom Logic',
        required: false,
        language: 'javascript',
        placeholder: '// Custom swap logic here',
        description: 'Optional JavaScript for custom swap conditions'
      }
    ]
  },

  fusionSwap: {
    id: 'fusionSwap',
    name: 'Fusion Swap',
    description: 'Gasless token swaps with MEV protection',
    category: 'DeFi',
    version: '1.0.0',
    icon: '⚡',
    color: '#FF6B35',
    inputs: [
      {
        id: 'fromToken',
        name: 'From Token',
        dataType: 'token',
        required: true
      },
      {
        id: 'toToken',
        name: 'To Token', 
        dataType: 'token',
        required: true
      },
      {
        id: 'amount',
        name: 'Amount',
        dataType: 'number',
        required: true
      }
    ],
    outputs: [
      {
        id: 'orderHash',
        name: 'Order Hash',
        dataType: 'string'
      },
      {
        id: 'expectedOutput',
        name: 'Expected Output',
        dataType: 'number'
      }
    ],
    configuration: [
      {
        key: 'deadline',
        name: 'Order Deadline',
        description: 'Deadline for the order execution',
        type: 'date',
        required: true,
        defaultValue: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      },
      {
        key: 'minReturn',
        name: 'Minimum Return',
        description: 'Minimum amount to receive',
        type: 'number',
        required: false
      }
    ]
  },

  limitOrder: {
    id: 'limitOrder',
    type: 'limitOrder',
    name: 'Limit Order',
    description: 'Create gasless limit orders',
    category: 'DeFi',
    version: '1.0.0',
    icon: '📋',
    color: '#28A745',
    inputs: [
      {
        id: 'sellToken',
        name: 'Sell Token',
        dataType: 'token',
        required: true
      },
      {
        id: 'buyToken',
        name: 'Buy Token',
        dataType: 'token', 
        required: true
      },
      {
        id: 'sellAmount',
        name: 'Sell Amount',
        dataType: 'number',
        required: true
      }
    ],
    outputs: [
      {
        id: 'orderHash',
        name: 'Order Hash',
        dataType: 'string',
        required: false,
        description: 'Hash of the created limit order'
      },
      {
        id: 'status',
        name: 'Order Status',
        dataType: 'string',
        required: false,
        description: 'Current status of the limit order'
      }
    ],
    configuration: [
      {
        key: 'targetPrice',
        name: 'Target Price',
        description: 'Price per token to execute order',
        type: 'number',
        required: true
      },
      {
        key: 'expiration',
        name: 'Expiration Date',
        description: 'When the order expires',
        type: 'datetime',
        required: true
      }
    ]
  },

  walletConnector: {
    id: 'walletConnector',
    name: 'Wallet Connector',
    description: 'Connect to crypto wallets',
    category: 'Wallet',
    version: '1.0.0',
    icon: '👛',
    color: '#8B5CF6',
    inputs: [],
    outputs: [
      {
        id: 'address',
        name: 'Wallet Address',
        dataType: 'address',
        required: false,
        description: 'Connected wallet address'
      },
      {
        id: 'chainId',
        name: 'Chain ID',
        dataType: 'number',
        required: false,
        description: 'Current chain ID'
      },
      {
        id: 'provider',
        name: 'Provider',
        dataType: 'object',
        required: false,
        description: 'Web3 provider instance'
      }
    ],
    configuration: [
      {
        key: 'walletType',
        name: 'Wallet Type',
        description: 'Type of wallet to connect',
        type: 'select',
        required: true,
        options: [
          { label: 'MetaMask', value: 'metamask' },
          { label: 'WalletConnect', value: 'walletconnect' },
          { label: 'Coinbase Wallet', value: 'coinbase' }
        ]
      },
      {
        key: 'autoConnect',
        name: 'Auto Connect',
        description: 'Automatically connect on load',
        type: 'boolean',
        required: false,
        defaultValue: true
      }
    ]
  },

  // Data Processing
  dataProcessor: {
    id: 'dataProcessor',
    type: 'dataProcessor',
    name: 'Data Processor',
    description: 'Transform and manipulate data',
    category: 'Data',
    version: '1.0.0',
    icon: '🔧',
    color: '#17A2B8',
    inputs: [
      {
        id: 'data',
        name: 'Input Data',
        dataType: 'any',
        required: true,
        description: 'Data to be processed'
      }
    ],
    outputs: [
      {
        id: 'result',
        name: 'Processed Data',
        dataType: 'any',
        required: false,
        description: 'Result of the data processing operation'
      }
    ],
    configuration: [
      {
        key: 'operation',
        name: 'Operation',
        description: 'Type of data processing operation',
        type: 'select',
        required: true,
        options: [
          { label: 'Format Number', value: 'formatNumber' },
          { label: 'Parse JSON', value: 'parseJson' },
          { label: 'Extract Field', value: 'extractField' }
        ]
      },
      {
        key: 'decimals',
        name: 'Decimal Places',
        description: 'Number of decimal places for formatting',
        type: 'number',
        required: false,
        defaultValue: 2
      },
      {
        key: 'fieldPath',
        name: 'Field Path',
        description: 'Path to extract from object',
        type: 'text',
        required: false
      }
    ]
  },

  // Logic Components
  conditionalLogic: {
    type: 'conditionalLogic',
    name: 'Conditional Logic',
    description: 'Execute different paths based on conditions',
    category: 'Logic',
    icon: '🔀',
    color: '#FFC107',
    inputs: [
      {
        id: 'input',
        name: 'Input Value',
        dataType: 'any',
        required: true,
        description: 'Value to evaluate in the condition'
      },
      {
        id: 'compareValue',
        name: 'Compare Value',
        dataType: 'any',
        required: false,
        description: 'Value to compare against (optional)'
      }
    ],
    outputs: [
      {
        id: 'result',
        name: 'Result',
        dataType: 'boolean',
        required: false,
        description: 'Boolean result of the condition evaluation'
      },
      {
        id: 'truePath',
        name: 'True Path',
        dataType: 'execution',
        required: false,
        description: 'Execution path when condition is true'
      },
      {
        id: 'falsePath',
        name: 'False Path',
        dataType: 'execution',
        required: false,
        description: 'Execution path when condition is false'
      }
    ],
    fields: [
      {
        key: 'conditionType',
        type: 'select',
        label: 'Condition Type',
        required: true,
        options: [
          { label: 'Greater Than', value: 'gt' },
          { label: 'Less Than', value: 'lt' },
          { label: 'Equal To', value: 'eq' },
          { label: 'Contains', value: 'contains' }
        ]
      },
      {
        key: 'threshold',
        type: 'number',
        label: 'Threshold',
        required: false
      },
      {
        key: 'textValue',
        type: 'text',
        label: 'Text Value',
        required: false,
        conditional: { field: 'conditionType', value: 'contains' }
      },
      {
        key: 'invertCondition',
        type: 'boolean',
        label: 'Invert Condition',
        defaultValue: false
      }
    ]
  },

  // UI Components
  swapInterface: {
    type: 'swapInterface',
    name: 'Swap Interface',
    description: 'Token swap user interface',
    category: 'UI',
    icon: '🖥️',
    color: '#6C757D',
    inputs: [
      {
        id: 'supportedTokens',
        name: 'Supported Tokens',
        dataType: 'array',
        required: true,
        description: 'List of tokens supported for swapping'
      }
    ],
    outputs: [
      {
        id: 'swapData',
        name: 'Swap Data',
        dataType: 'object',
        required: false,
        description: 'Swap configuration and parameters'
      }
    ],
    fields: [
      {
        key: 'theme',
        type: 'select',
        label: 'Theme',
        options: [
          { label: 'Light', value: 'light' },
          { label: 'Dark', value: 'dark' }
        ],
        defaultValue: 'light'
      },
      {
        key: 'showAdvanced',
        type: 'boolean',
        label: 'Show Advanced Options',
        defaultValue: false
      }
    ]
  },

  dashboard: {
    type: 'dashboard',
    name: 'Dashboard',
    description: 'Display metrics and data',
    category: 'UI',
    icon: '📊',
    color: '#E83E8C',
    inputs: [
      {
        id: 'data',
        name: 'Dashboard Data',
        dataType: 'object',
        required: true,
        description: 'Data to display in the dashboard'
      }
    ],
    outputs: [],
    fields: [
      {
        key: 'layout',
        type: 'select',
        label: 'Layout Style',
        options: [
          { label: 'Grid', value: 'grid' },
          { label: 'List', value: 'list' },
          { label: 'Cards', value: 'cards' }
        ],
        defaultValue: 'grid'
      },
      {
        key: 'refreshInterval',
        type: 'number',
        label: 'Refresh Interval (seconds)',
        defaultValue: 30
      }
    ]
  },

  // Analytics
  portfolioTracker: {
    type: 'portfolioTracker',
    name: 'Portfolio Tracker',
    description: 'Track DeFi portfolio performance',
    category: 'Analytics',
    icon: '📈',
    color: '#20C997',
    inputs: [
      {
        id: 'walletAddress',
        name: 'Wallet Address',
        dataType: 'address',
        required: true,
        description: 'Wallet address to track portfolio for'
      }
    ],
    outputs: [
      {
        id: 'portfolio',
        name: 'Portfolio Data',
        dataType: 'object',
        required: false,
        description: 'Complete portfolio information'
      },
      {
        id: 'totalValue',
        name: 'Total Value',
        dataType: 'number',
        required: false,
        description: 'Total portfolio value in USD'
      }
    ],
    fields: [
      {
        key: 'chains',
        type: 'multiselect',
        label: 'Supported Chains',
        options: [
          { label: 'Ethereum', value: 'ethereum' },
          { label: 'Polygon', value: 'polygon' },
          { label: 'BSC', value: 'bsc' },
          { label: 'Arbitrum', value: 'arbitrum' }
        ],
        defaultValue: ['ethereum']
      },
      {
        key: 'updateFrequency',
        type: 'select',
        label: 'Update Frequency',
        options: [
          { label: 'Real-time', value: 'realtime' },
          { label: '1 minute', value: '1min' },
          { label: '5 minutes', value: '5min' }
        ],
        defaultValue: '1min'
      }
    ]
  },

  // Missing Wallet Components
  tokenSelector: {
    type: 'tokenSelector',
    name: 'Token Selector',
    description: 'Select tokens for operations',
    category: 'Wallet',
    icon: '🪙',
    color: '#F59E0B',
    inputs: [
      {
        id: 'chainId',
        name: 'Chain ID',
        dataType: 'number',
        required: false,
        description: 'Chain ID to filter tokens by'
      }
    ],
    outputs: [
      {
        id: 'selectedToken',
        name: 'Selected Token',
        dataType: 'token',
        required: false,
        description: 'Token selected by the user'
      }
    ],
    fields: [
      {
        key: 'defaultTokens',
        type: 'multiselect',
        label: 'Default Token List',
        options: [
          { label: 'ETH', value: '0x0000000000000000000000000000000000000000' },
          { label: 'USDC', value: '0xa0b86a33e6c3c6e6c4c5b1e6a3f3b7b9b3e4a2c1' },
          { label: 'USDT', value: '0xdac17f958d2ee523a2206206994597c13d831ec7' },
          { label: 'WBTC', value: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' }
        ],
        defaultValue: ['0x0000000000000000000000000000000000000000']
      }
    ]
  },

  chainSelector: {
    type: 'chainSelector',
    name: 'Chain Selector',
    description: 'Select blockchain network',
    category: 'Wallet',
    icon: '⛓️',
    color: '#8B5CF6',
    inputs: [],
    outputs: [
      {
        id: 'chainId',
        name: 'Chain ID',
        dataType: 'number',
        required: false,
        description: 'Selected chain ID'
      },
      {
        id: 'chainName',
        name: 'Chain Name',
        dataType: 'string',
        required: false,
        description: 'Selected chain name'
      }
    ],
    fields: [
      {
        key: 'supportedChains',
        type: 'multiselect',
        label: 'Supported Chains',
        options: [
          { label: 'Ethereum Mainnet', value: '1' },
          { label: 'Polygon', value: '137' },
          { label: 'BSC', value: '56' },
          { label: 'Arbitrum One', value: '42161' },
          { label: 'Optimism', value: '10' }
        ],
        defaultValue: ['1']
      }
    ]
  },

  // Transaction Components
  transactionMonitor: {
    type: 'transactionMonitor',
    name: 'Transaction Monitor',
    description: 'Monitor transaction status',
    category: 'DeFi',
    icon: '📡',
    color: '#06B6D4',
    inputs: [
      {
        id: 'transactionHash',
        name: 'Transaction Hash',
        dataType: 'string',
        required: true,
        description: 'Hash of the transaction to monitor'
      }
    ],
    outputs: [
      {
        id: 'status',
        name: 'Status',
        dataType: 'string',
        required: false,
        description: 'Current transaction status'
      },
      {
        id: 'receipt',
        name: 'Receipt',
        dataType: 'object',
        required: false,
        description: 'Transaction receipt when confirmed'
      }
    ],
    fields: [
      {
        key: 'pollInterval',
        type: 'number',
        label: 'Poll Interval (seconds)',
        defaultValue: 5
      }
    ]
  },

  // API Components
  oneInchQuote: {
    id: 'oneInchQuote',
    type: 'oneInchQuote',
    name: '1inch Quote',
    description: 'Get token swap quotes',
    category: 'DeFi',
    version: '1.0.0',
    icon: '💱',
    color: '#0066FF',
    inputs: [
      {
        id: 'fromToken',
        name: 'From Token',
        description: 'Token to swap from',
        dataType: 'token',
        required: true,
        multiple: false,
        streaming: false
      },
      {
        id: 'toToken',
        name: 'To Token',
        description: 'Token to swap to',
        dataType: 'token',
        required: true,
        multiple: false,
        streaming: false
      },
      {
        id: 'amount',
        name: 'Amount',
        description: 'Amount to swap',
        dataType: 'number',
        required: true,
        multiple: false,
        streaming: false
      }
    ],
    outputs: [
      {
        id: 'quote',
        name: 'Quote Data',
        description: 'Swap quote information',
        dataType: 'object',
        required: true,
        multiple: false,
        streaming: false
      },
      {
        id: 'estimatedGas',
        name: 'Estimated Gas',
        description: 'Estimated gas cost',
        dataType: 'number',
        required: false,
        multiple: false,
        streaming: false
      }
    ],
    configuration: [
      {
        key: 'apiKey',
        label: '1inch API Key',
        description: 'API key for 1inch aggregator',
        type: 'text',
        required: true,
        sensitive: true,
        placeholder: 'Enter your 1inch API key'
      },
      {
        key: 'slippage',
        label: 'Slippage Tolerance %',
        description: 'Maximum slippage tolerance',
        type: 'number',
        required: false,
        defaultValue: 1.0
      }
    ]
  },

  // Missing components that need to be added
  priceImpactCalculator: {
    type: 'priceImpactCalculator',
    name: 'Price Impact Calculator',
    description: 'Calculate price impact for trades',
    category: 'Analytics',
    icon: '📊',
    color: '#F59E0B',
    inputs: [
      {
        id: 'tradeAmount',
        name: 'Trade Amount',
        dataType: 'number',
        required: true,
        description: 'Amount of tokens to trade'
      },
      {
        id: 'liquidity',
        name: 'Pool Liquidity',
        dataType: 'number',
        required: true,
        description: 'Total liquidity in the trading pool'
      }
    ],
    outputs: [
      {
        id: 'priceImpact',
        name: 'Price Impact %',
        dataType: 'number',
        required: false,
        description: 'Calculated price impact percentage'
      },
      {
        id: 'minimumReceived',
        name: 'Minimum Received',
        dataType: 'number',
        required: false,
        description: 'Minimum tokens received after slippage'
      }
    ],
    fields: [
      {
        key: 'slippageTolerance',
        type: 'number',
        label: 'Slippage Tolerance %',
        defaultValue: 1,
        required: false
      }
    ]
  },

  fusionPlus: {
    type: 'fusionPlus',
    name: 'Fusion+ Cross-Chain',
    description: 'Cross-chain swaps with MEV protection',
    category: 'DeFi',
    icon: '🌉',
    color: '#8B5CF6',
    inputs: [
      {
        id: 'sourceChain',
        name: 'Source Chain',
        dataType: 'chain',
        required: true,
        description: 'Source blockchain network'
      },
      {
        id: 'targetChain',
        name: 'Target Chain',
        dataType: 'chain',
        required: true,
        description: 'Target blockchain network'
      },
      {
        id: 'fromToken',
        name: 'From Token',
        dataType: 'token',
        required: true,
        description: 'Token to bridge from'
      },
      {
        id: 'toToken',
        name: 'To Token',
        dataType: 'token',
        required: true,
        description: 'Token to receive on target chain'
      },
      {
        id: 'amount',
        name: 'Amount',
        dataType: 'number',
        required: true,
        description: 'Amount of tokens to bridge'
      }
    ],
    outputs: [
      {
        id: 'bridgeTxHash',
        name: 'Bridge Transaction',
        dataType: 'string',
        required: false,
        description: 'Bridge transaction hash'
      },
      {
        id: 'estimatedTime',
        name: 'Estimated Time',
        dataType: 'number',
        required: false,
        description: 'Estimated time for bridge completion'
      }
    ],
    fields: [
      {
        key: 'bridgeProtocol',
        type: 'select',
        label: 'Bridge Protocol',
        options: [
          { label: 'Layerzero', value: 'layerzero' },
          { label: 'Axelar', value: 'axelar' },
          { label: 'Wormhole', value: 'wormhole' }
        ],
        defaultValue: 'layerzero'
      }
    ]
  },

  portfolioAPI: {
    type: 'portfolioAPI',
    name: 'Portfolio API',
    description: 'Fetch portfolio data from external API',
    category: 'Analytics',
    icon: '📈',
    color: '#10B981',
    inputs: [
      {
        id: 'walletAddress',
        name: 'Wallet Address',
        dataType: 'address',
        required: true,
        description: 'Wallet address to fetch portfolio for'
      },
      {
        id: 'chainIds',
        name: 'Chain IDs',
        dataType: 'array',
        required: false,
        description: 'Specific chain IDs to include in portfolio'
      }
    ],
    outputs: [
      {
        id: 'portfolioData',
        name: 'Portfolio Data',
        dataType: 'object',
        required: false,
        description: 'Complete portfolio information from API'
      },
      {
        id: 'totalValue',
        name: 'Total Value USD',
        dataType: 'number',
        required: false,
        description: 'Total portfolio value in USD'
      }
    ],
    fields: [
      {
        key: 'apiProvider',
        type: 'select',
        label: 'API Provider',
        options: [
          { label: 'DeBank', value: 'debank' },
          { label: 'Zerion', value: 'zerion' },
          { label: 'Zapper', value: 'zapper' }
        ],
        defaultValue: 'debank'
      },
      {
        key: 'apiKey',
        type: 'password',
        label: 'API Key',
        required: true,
        sensitive: true
      }
    ]
  },

  defiDashboard: {
    id: 'defiDashboard',
    name: 'DeFi Dashboard',
    description: 'Display comprehensive DeFi metrics',
    category: 'UI',
    icon: '📊',
    color: '#6366F1',
    inputs: [
      {
        id: 'portfolioData',
        name: 'Portfolio Data',
        dataType: 'object',
        required: true,
        description: 'Portfolio data to display in dashboard'
      },
      {
        id: 'priceData',
        name: 'Price Data',
        dataType: 'object',
        required: false,
        description: 'Price data for portfolio assets'
      }
    ],
    outputs: [
      {
        id: 'dashboardState',
        name: 'Dashboard State',
        dataType: 'object',
        required: false,
        description: 'Current state of the dashboard'
      }
    ],
    configuration: [
      {
        key: 'chartType',
        name: 'Chart Type',
        description: 'Type of chart to display',
        type: 'select',
        required: false,
        options: [
          { label: 'Line Chart', value: 'line' },
          { label: 'Bar Chart', value: 'bar' },
          { label: 'Pie Chart', value: 'pie' }
        ],
        defaultValue: 'line'
      },
      {
        key: 'refreshInterval',
        name: 'Refresh Interval (seconds)',
        description: 'How often to refresh data',
        type: 'number',
        required: false,
        defaultValue: 30
      },
      {
        key: 'showPnL',
        name: 'Show P&L',
        description: 'Display profit and loss information',
        type: 'boolean',
        required: false,
        defaultValue: true
      }
    ]
  },

  // Avalanche L1 Deployment Component
  avalancheL1Deploy: {
    id: 'avalancheL1Deploy',
    name: 'Avalanche L1 Deployment',
    description: 'Deploy custom Avalanche L1 blockchain with comprehensive configuration',
    category: 'Infrastructure',
    version: '1.0.0',
    icon: '🏔️',
    color: '#E53E3E',
    inputs: [
      {
        id: 'deploymentConfig',
        name: 'Deployment Config',
        description: 'Configuration for L1 deployment',
        dataType: 'object',
        required: false,
        multiple: false,
        streaming: false
      }
    ],
    outputs: [
      {
        id: 'deploymentResult',
        name: 'Deployment Result',
        description: 'Result of the L1 deployment',
        dataType: 'object',
        required: true,
        multiple: false,
        streaming: false
      },
      {
        id: 'chainId',
        name: 'Chain ID',
        description: 'Assigned chain ID for the new L1',
        dataType: 'number',
        required: true,
        multiple: false,
        streaming: false
      },
      {
        id: 'rpcUrl',
        name: 'RPC URL',
        description: 'RPC endpoint for the deployed L1',
        dataType: 'string',
        required: true,
        multiple: false,
        streaming: false
      },
      {
        id: 'explorerUrl',
        name: 'Explorer URL',
        description: 'Block explorer URL for the deployed L1',
        dataType: 'string',
        required: false,
        multiple: false,
        streaming: false
      }
    ],
    configuration: [
      {
        key: 'l1Name',
        name: 'L1 Name',
        description: 'Name of the Avalanche L1 network',
        type: 'text',
        required: true,
        defaultValue: ''
      },
      {
        key: 'chainId',
        name: 'Chain ID',
        description: 'Unique chain identifier',
        type: 'number',
        required: true,
        defaultValue: 0
      },
      {
        key: 'tokenSymbol',
        name: 'Token Symbol',
        description: 'Native token symbol (3-6 uppercase letters)',
        type: 'text',
        required: true,
        defaultValue: ''
      },
      {
        key: 'tokenName',
        name: 'Token Name',
        description: 'Native token name',
        type: 'text',
        required: true,
        defaultValue: ''
      },
      {
        key: 'initialSupply',
        name: 'Initial Supply',
        description: 'Initial token supply',
        type: 'number',
        required: true,
        defaultValue: 1000000000
      },
      {
        key: 'vmType',
        name: 'VM Type',
        description: 'Virtual machine type for the subnet',
        type: 'select',
        required: true,
        options: [
          { label: 'Subnet-EVM', value: 'subnet-evm' },
          { label: 'Custom VM', value: 'custom-vm' }
        ],
        defaultValue: 'subnet-evm'
      },
      {
        key: 'consensusMechanism',
        name: 'Consensus Mechanism',
        description: 'Consensus protocol to use',
        type: 'select',
        required: true,
        options: [
          { label: 'Proof of Authority (PoA)', value: 'poa' },
          { label: 'Proof of Stake (PoS)', value: 'pos' }
        ],
        defaultValue: 'poa'
      },
      {
        key: 'gasLimit',
        name: 'Block Gas Limit',
        description: 'Maximum gas per block',
        type: 'number',
        required: false,
        defaultValue: 12000000
      },
      {
        key: 'gasPriceStrategy',
        name: 'Gas Price Strategy',
        description: 'How gas prices are determined',
        type: 'select',
        required: false,
        options: [
          { label: 'Constant', value: 'constant' },
          { label: 'Dynamic', value: 'dynamic' }
        ],
        defaultValue: 'constant'
      },
      {
        key: 'baseFee',
        name: 'Base Fee (gwei)',
        description: 'Base fee for dynamic pricing',
        type: 'number',
        required: false,
        defaultValue: 25
      },
      {
        key: 'priorityFee',
        name: 'Priority Fee (gwei)',
        description: 'Priority fee for dynamic pricing',
        type: 'number',
        required: false,
        defaultValue: 2
      },
      {
        key: 'feeRecipient',
        name: 'Fee Recipient',
        description: 'Address to receive transaction fees',
        type: 'text',
        required: false,
        defaultValue: ''
      },
      {
        key: 'feeBurning',
        name: 'Enable Fee Burning',
        description: 'Burn portion of transaction fees',
        type: 'boolean',
        required: false,
        defaultValue: false
      },
      {
        key: 'minBaseFee',
        name: 'Min Base Fee (gwei)',
        description: 'Minimum base fee allowed',
        type: 'number',
        required: false,
        defaultValue: 25
      },
      {
        key: 'controlKeyName',
        name: 'Control Key Name',
        description: 'Name for the control key',
        type: 'text',
        required: true,
        defaultValue: ''
      },
      {
        key: 'validatorStakeAmount',
        name: 'Validator Stake Amount (AVAX)',
        description: 'Amount each validator must stake',
        type: 'number',
        required: true,
        defaultValue: 2000
      },
      {
        key: 'stakeDuration',
        name: 'Stake Duration',
        description: 'How long validators must stake',
        type: 'text',
        required: true,
        defaultValue: '336h'
      },
      {
        key: 'targetNetwork',
        name: 'Target Network',
        description: 'Network to deploy to',
        type: 'select',
        required: true,
        options: [
          { label: 'Fuji Testnet', value: 'fuji' },
          { label: 'Local Network', value: 'local' }
        ],
        defaultValue: 'fuji'
      },
      {
        key: 'customRpcUrl',
        name: 'Custom RPC URL',
        description: 'Custom RPC endpoint (optional)',
        type: 'text',
        required: false,
        defaultValue: ''
      },
      {
        key: 'enableBlockExplorer',
        name: 'Enable Block Explorer',
        description: 'Deploy block explorer for the L1',
        type: 'boolean',
        required: false,
        defaultValue: true
      },
      {
        key: 'customExplorerUrl',
        name: 'Custom Explorer URL',
        description: 'Custom block explorer URL',
        type: 'text',
        required: false,
        defaultValue: ''
      },
      {
        key: 'enableMetrics',
        name: 'Enable Metrics',
        description: 'Enable metrics collection',
        type: 'boolean',
        required: false,
        defaultValue: true
      }
    ]
  }
}