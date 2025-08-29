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
    type: 'oneInchQuote',
    name: '1inch Quote',
    description: 'Get token swap quotes',
    category: 'DeFi',
    icon: '💱',
    color: '#0066FF',
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
        id: 'quote',
        name: 'Quote Data',
        dataType: 'object'
      },
      {
        id: 'estimatedGas',
        name: 'Estimated Gas',
        dataType: 'number'
      }
    ],
    fields: [
      {
        key: 'slippage',
        type: 'number',
        label: 'Slippage Tolerance %',
        defaultValue: 1.0
      }
    ]
  }
}