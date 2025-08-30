/**
 * Enhanced Node Templates
 * Pre-built DeFi and utility components for the plugin system
 */

import { ComponentTemplate } from './types'

export const enhancedNodeTemplates: Record<string, ComponentTemplate> = {
  // DeFi Components
  oneInchSwap: {
    type: 'oneInchSwap',
    name: '1inch Swap',
    description: 'Execute token swaps using 1inch aggregator with fusion mode',
    category: 'DeFi',
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
        description: 'Blockchain transaction hash'
      },
      {
        id: 'outputAmount',
        name: 'Output Amount',
        dataType: 'number',
        description: 'Amount received after swap'
      },
      {
        id: 'gasUsed',
        name: 'Gas Used',
        dataType: 'number',
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
    type: 'fusionSwap',
    name: 'Fusion Swap',
    description: 'Gasless token swaps with MEV protection',
    category: 'DeFi',
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
    fields: [
      {
        key: 'deadline',
        type: 'date',
        label: 'Order Deadline',
        required: true,
        defaultValue: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      },
      {
        key: 'minReturn',
        type: 'number',
        label: 'Minimum Return',
        required: false,
        description: 'Minimum amount to receive'
      }
    ]
  },

  limitOrder: {
    type: 'limitOrder',
    name: 'Limit Order',
    description: 'Create gasless limit orders',
    category: 'DeFi',
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
        dataType: 'string'
      },
      {
        id: 'status',
        name: 'Order Status',
        dataType: 'string'
      }
    ],
    fields: [
      {
        key: 'targetPrice',
        type: 'number',
        label: 'Target Price',
        required: true,
        description: 'Price per token to execute order'
      },
      {
        key: 'expiration',
        type: 'date',
        label: 'Expiration Date',
        required: true
      }
    ]
  },

  // Wallet Components
  walletConnector: {
    type: 'walletConnector',
    name: 'Wallet Connector',
    description: 'Connect to crypto wallets',
    category: 'Wallet',
    icon: '👛',
    color: '#8B5CF6',
    inputs: [],
    outputs: [
      {
        id: 'address',
        name: 'Wallet Address',
        dataType: 'address'
      },
      {
        id: 'chainId',
        name: 'Chain ID',
        dataType: 'number'
      },
      {
        id: 'provider',
        name: 'Provider',
        dataType: 'object'
      }
    ],
    fields: [
      {
        key: 'walletType',
        type: 'select',
        label: 'Wallet Type',
        required: true,
        options: [
          { label: 'MetaMask', value: 'metamask' },
          { label: 'WalletConnect', value: 'walletconnect' },
          { label: 'Coinbase Wallet', value: 'coinbase' }
        ]
      },
      {
        key: 'autoConnect',
        type: 'boolean',
        label: 'Auto Connect',
        defaultValue: true
      }
    ]
  },

  // Data Processing
  dataProcessor: {
    type: 'dataProcessor',
    name: 'Data Processor',
    description: 'Transform and manipulate data',
    category: 'Data',
    icon: '🔧',
    color: '#17A2B8',
    inputs: [
      {
        id: 'data',
        name: 'Input Data',
        dataType: 'any',
        required: true
      }
    ],
    outputs: [
      {
        id: 'result',
        name: 'Processed Data',
        dataType: 'any'
      }
    ],
    fields: [
      {
        key: 'operation',
        type: 'select',
        label: 'Operation',
        required: true,
        options: [
          { label: 'Format Number', value: 'formatNumber' },
          { label: 'Parse JSON', value: 'parseJson' },
          { label: 'Extract Field', value: 'extractField' }
        ]
      },
      {
        key: 'decimals',
        type: 'number',
        label: 'Decimal Places',
        required: false,
        defaultValue: 2,
        conditional: { field: 'operation', value: 'formatNumber' }
      },
      {
        key: 'fieldPath',
        type: 'text',
        label: 'Field Path',
        required: false,
        placeholder: 'e.g., user.profile.name',
        conditional: { field: 'operation', value: 'extractField' }
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
        required: true
      },
      {
        id: 'compareValue',
        name: 'Compare Value',
        dataType: 'any',
        required: false
      }
    ],
    outputs: [
      {
        id: 'result',
        name: 'Result',
        dataType: 'boolean'
      },
      {
        id: 'truePath',
        name: 'True Path',
        dataType: 'execution'
      },
      {
        id: 'falsePath', 
        name: 'False Path',
        dataType: 'execution'
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
        required: true
      }
    ],
    outputs: [
      {
        id: 'swapData',
        name: 'Swap Data',
        dataType: 'object'
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
        required: true
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
        required: true
      }
    ],
    outputs: [
      {
        id: 'portfolio',
        name: 'Portfolio Data',
        dataType: 'object'
      },
      {
        id: 'totalValue',
        name: 'Total Value',
        dataType: 'number'
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
        required: false
      }
    ],
    outputs: [
      {
        id: 'selectedToken',
        name: 'Selected Token',
        dataType: 'token'
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
        dataType: 'number'
      },
      {
        id: 'chainName',
        name: 'Chain Name',
        dataType: 'string'
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
        required: true
      }
    ],
    outputs: [
      {
        id: 'status',
        name: 'Status',
        dataType: 'string'
      },
      {
        id: 'receipt',
        name: 'Receipt',
        dataType: 'object'
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
        required: true
      },
      {
        id: 'liquidity',
        name: 'Pool Liquidity',
        dataType: 'number',
        required: true
      }
    ],
    outputs: [
      {
        id: 'priceImpact',
        name: 'Price Impact %',
        dataType: 'number'
      },
      {
        id: 'minimumReceived',
        name: 'Minimum Received',
        dataType: 'number'
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
        required: true
      },
      {
        id: 'targetChain',
        name: 'Target Chain',
        dataType: 'chain',
        required: true
      },
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
        id: 'bridgeTxHash',
        name: 'Bridge Transaction',
        dataType: 'string'
      },
      {
        id: 'estimatedTime',
        name: 'Estimated Time',
        dataType: 'number'
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
        required: true
      },
      {
        id: 'chainIds',
        name: 'Chain IDs',
        dataType: 'array',
        required: false
      }
    ],
    outputs: [
      {
        id: 'portfolioData',
        name: 'Portfolio Data',
        dataType: 'object'
      },
      {
        id: 'totalValue',
        name: 'Total Value USD',
        dataType: 'number'
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
    type: 'defiDashboard',
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
        required: true
      },
      {
        id: 'priceData',
        name: 'Price Data',
        dataType: 'object',
        required: false
      }
    ],
    outputs: [
      {
        id: 'dashboardState',
        name: 'Dashboard State',
        dataType: 'object'
      }
    ],
    fields: [
      {
        key: 'chartType',
        type: 'select',
        label: 'Chart Type',
        options: [
          { label: 'Line Chart', value: 'line' },
          { label: 'Bar Chart', value: 'bar' },
          { label: 'Pie Chart', value: 'pie' }
        ],
        defaultValue: 'line'
      },
      {
        key: 'refreshInterval',
        type: 'number',
        label: 'Refresh Interval (seconds)',
        defaultValue: 30
      },
      {
        key: 'showPnL',
        type: 'boolean',
        label: 'Show P&L',
        defaultValue: true
      }
    ]
  },

  // Avalanche ICM Nodes
  icmSender: {
    type: 'icmSender',
    name: 'ICM Sender',
    description: 'Send cross-chain messages using Avalanche Teleporter',
    category: 'Avalanche',
    icon: '📤',
    color: '#E84142',
    inputs: [
      {
        id: 'sourceChain',
        name: 'Source Chain',
        dataType: 'string',
        required: true,
        description: 'Source blockchain (e.g., C for C-Chain)'
      },
      {
        id: 'destinationChainID',
        name: 'Destination Chain ID',
        dataType: 'subnetID',
        required: true,
        description: 'Destination subnet or chain ID'
      },
      {
        id: 'recipient',
        name: 'Recipient Address',
        dataType: 'address',
        required: true,
        description: 'Recipient wallet address'
      },
      {
        id: 'walletAddress',
        name: 'Wallet Address',
        dataType: 'address',
        required: true,
        description: 'Sender wallet address'
      }
    ],
    outputs: [
      {
        id: 'transactionHash',
        name: 'Transaction Hash',
        dataType: 'string',
        description: 'Blockchain transaction hash'
      },
      {
        id: 'messageID',
        name: 'Message ID',
        dataType: 'string',
        description: 'Unique message identifier'
      },
      {
        id: 'status',
        name: 'Status',
        dataType: 'string',
        description: 'Transaction status'
      }
    ],
    fields: [
      {
        key: 'amount',
        type: 'text',
        label: 'Amount/Payload',
        required: false,
        placeholder: 'Enter amount or message',
        description: 'Amount to send or message content'
      },
      {
        key: 'payloadType',
        type: 'select',
        label: 'Payload Type',
        required: false,
        defaultValue: 'string',
        options: [
          { label: 'Text Message', value: 'string' },
          { label: 'Number', value: 'number' },
          { label: 'JSON Object', value: 'object' }
        ],
        description: 'Type of data to send'
      },
      {
        key: 'gasLimit',
        type: 'number',
        label: 'Gas Limit',
        required: false,
        defaultValue: 100000,
        description: 'Gas limit for cross-chain execution'
      }
    ]
  },

  icmReceiver: {
    type: 'icmReceiver',
    name: 'ICM Receiver',
    description: 'Receive and process cross-chain messages',
    category: 'Avalanche',
    icon: '📥',
    color: '#E84142',
    inputs: [
      {
        id: 'messageID',
        name: 'Message ID',
        dataType: 'string',
        required: true,
        description: 'Unique message identifier to receive'
      },
      {
        id: 'sourceChainID',
        name: 'Source Chain ID',
        dataType: 'subnetID',
        required: true,
        description: 'Source chain or subnet ID'
      }
    ],
    outputs: [
      {
        id: 'decodedPayload',
        name: 'Decoded Payload',
        dataType: 'icmPayload',
        description: 'Decoded message content'
      },
      {
        id: 'status',
        name: 'Status',
        dataType: 'string',
        description: 'Reception status'
      }
    ],
    fields: [
      {
        key: 'pollingTimeout',
        type: 'number',
        label: 'Polling Timeout (seconds)',
        required: false,
        defaultValue: 30,
        description: 'How long to wait for message'
      }
    ]
  },

  // Avalanche L1 Nodes
  l1Config: {
    type: 'l1Config',
    name: 'L1 Config Generator',
    description: 'Generate Avalanche subnet configuration and genesis JSON',
    category: 'Avalanche',
    icon: '⚙️',
    color: '#E84142',
    inputs: [],
    outputs: [
      {
        id: 'genesisJson',
        name: 'Genesis JSON',
        dataType: 'avalancheConfig',
        description: 'Generated genesis configuration'
      },
      {
        id: 'subnetConfig',
        name: 'Subnet Config',
        dataType: 'avalancheConfig',
        description: 'Generated subnet configuration'
      }
    ],
    fields: [
      {
        key: 'vmType',
        type: 'select',
        label: 'VM Type',
        required: true,
        defaultValue: 'SubnetEVM',
        options: [
          { label: 'SubnetEVM', value: 'SubnetEVM' },
          { label: 'Custom VM', value: 'CustomVM' }
        ],
        description: 'Virtual machine type for the subnet'
      },
      {
        key: 'chainId',
        type: 'number',
        label: 'Chain ID',
        required: true,
        placeholder: 'Enter chain ID',
        description: 'Unique identifier for the blockchain'
      },
      {
        key: 'tokenSymbol',
        type: 'text',
        label: 'Token Symbol',
        required: false,
        placeholder: 'e.g., MYTOKEN',
        description: 'Native token symbol'
      },
      {
        key: 'initialSupply',
        type: 'number',
        label: 'Initial Supply',
        required: false,
        placeholder: '1000000',
        description: 'Initial token supply'
      },
      {
        key: 'gasLimit',
        type: 'number',
        label: 'Gas Limit',
        required: false,
        defaultValue: 8000000,
        description: 'Block gas limit'
      }
    ]
  },

  l1SimulatorDeployer: {
    type: 'l1SimulatorDeployer',
    name: 'L1 Simulator Deployer',
    description: 'Simulate Avalanche subnet deployment for demo purposes',
    category: 'Avalanche',
    icon: '🚀',
    color: '#E84142',
    inputs: [
      {
        id: 'genesisJson',
        name: 'Genesis JSON',
        dataType: 'avalancheConfig',
        required: true,
        description: 'Genesis configuration from L1 Config node'
      }
    ],
    outputs: [
      {
        id: 'subnetID',
        name: 'Subnet ID',
        dataType: 'subnetID',
        description: 'Generated subnet identifier'
      },
      {
        id: 'txHash',
        name: 'Transaction Hash',
        dataType: 'string',
        description: 'Deployment transaction hash'
      },
      {
        id: 'blockchainID',
        name: 'Blockchain ID',
        dataType: 'string',
        description: 'Blockchain identifier'
      },
      {
        id: 'status',
        name: 'Status',
        dataType: 'string',
        description: 'Deployment status'
      }
    ],
    fields: [
      {
        key: 'controlKeys',
        type: 'text',
        label: 'Control Keys (JSON)',
        required: false,
        placeholder: '["0x...", "0x..."]',
        description: 'Array of control key addresses'
      },
      {
        key: 'threshold',
        type: 'number',
        label: 'Threshold',
        required: false,
        defaultValue: 1,
        description: 'Minimum signatures required'
      }
    ]
  }
}