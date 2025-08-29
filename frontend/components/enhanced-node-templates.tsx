"use client"

import { DynamicField } from "./dynamic-node-config"

export interface NodeTemplate {
  type: string
  name: string
  description: string
  category: string
  icon: string
  color: string
  fields: DynamicField[]
  outputs: Array<{ name: string; type: string; description?: string }>
  inputs: Array<{ name: string; type: string; required?: boolean; description?: string }>
}

// Enhanced node templates with sophisticated DeFi configurations
export const enhancedNodeTemplates: Record<string, NodeTemplate> = {
  oneInchSwap: {
    type: 'oneInchSwap',
    name: '1inch Swap',
    description: 'Execute token swaps with 1inch aggregation protocol and advanced features',
    category: 'DeFi',
    icon: '🔄',
    color: '#1E40AF',
    fields: [
      {
        key: 'apiKey',
        type: 'text',
        label: '1inch API Key',
        required: true,
        description: 'Your 1inch API key for accessing swap functionality',
        placeholder: 'Enter your 1inch API key',
        validation: {
          custom: (value) => !value ? 'API key is required for 1inch swaps' : null
        },
        helpText: 'Get your API key from https://1inch.io/'
      },
      {
        key: 'chainId',
        type: 'select',
        label: 'Blockchain Network',
        required: true,
        description: 'Select the blockchain network for the swap',
        options: [
          { label: 'Ethereum Mainnet', value: '1' },
          { label: 'Polygon', value: '137' },
          { label: 'BSC', value: '56' },
          { label: 'Arbitrum One', value: '42161' },
          { label: 'Optimism', value: '10' },
          { label: 'Base', value: '8453' }
        ],
        defaultValue: '1'
      },
      {
        key: 'fromToken',
        type: 'text',
        label: 'From Token Address',
        required: true,
        description: 'Contract address of the token to swap from',
        placeholder: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE (ETH)',
        defaultValue: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        validation: {
          custom: (value) => {
            if (!value) return 'From token address is required'
            if (!/^0x[a-fA-F0-9]{40}$/.test(value) && value !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
              return 'Invalid token address format'
            }
            return null
          }
        }
      },
      {
        key: 'toToken',
        type: 'text',
        label: 'To Token Address',
        required: true,
        description: 'Contract address of the token to swap to',
        placeholder: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 (USDC)',
        defaultValue: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        validation: {
          custom: (value) => {
            if (!value) return 'To token address is required'
            if (!/^0x[a-fA-F0-9]{40}$/.test(value) && value !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
              return 'Invalid token address format'
            }
            return null
          }
        }
      },
      {
        key: 'amount',
        type: 'number',
        label: 'Swap Amount',
        required: true,
        description: 'Amount of tokens to swap (in token units)',
        min: 0,
        step: 0.000001,
        defaultValue: 1.0,
        validation: {
          custom: (value, allValues) => {
            if (!value || value <= 0) return 'Amount must be greater than 0'
            return null
          }
        }
      },
      {
        key: 'slippage',
        type: 'slider',
        label: 'Slippage Tolerance (%)',
        description: 'Maximum price slippage allowed for the swap',
        min: 0.1,
        max: 50,
        step: 0.1,
        defaultValue: 1.0,
        helpText: 'Higher slippage increases success rate but may result in worse prices'
      },
      {
        key: 'enableFusion',
        type: 'boolean',
        label: 'Enable Fusion Mode',
        description: 'Use gasless swaps with MEV protection',
        defaultValue: true,
        helpText: 'Fusion mode provides better prices and gasless transactions'
      },
      {
        key: 'fusionTimeout',
        type: 'number',
        label: 'Fusion Timeout (seconds)',
        description: 'Maximum time to wait for Fusion settlement',
        min: 10,
        max: 3600,
        defaultValue: 30,
        conditional: (config) => config.enableFusion === true,
        helpText: 'Longer timeouts may get better prices but take more time'
      },
      {
        key: 'enableMEVProtection',
        type: 'boolean',
        label: 'MEV Protection',
        description: 'Protect against front-running and sandwich attacks',
        defaultValue: true,
        conditional: (config) => config.enableFusion === true
      },
      {
        key: 'customRecipient',
        type: 'text',
        label: 'Custom Recipient (Optional)',
        description: 'Send swapped tokens to a different address',
        placeholder: '0x...',
        validation: {
          custom: (value) => {
            if (value && !/^0x[a-fA-F0-9]{40}$/.test(value)) {
              return 'Invalid Ethereum address format'
            }
            return null
          }
        },
        helpText: 'Leave empty to send to the connected wallet address'
      },
      {
        key: 'gasOptimization',
        type: 'select',
        label: 'Gas Optimization',
        description: 'Gas price optimization strategy',
        options: [
          { label: 'Fastest (Highest Gas)', value: 'fastest' },
          { label: 'Balanced', value: 'balanced' },
          { label: 'Cheapest (Slow)', value: 'cheapest' }
        ],
        defaultValue: 'balanced',
        advanced: true
      },
      {
        key: 'includeGas',
        type: 'boolean',
        label: 'Include Gas Estimate',
        description: 'Include gas cost estimates in the response',
        defaultValue: true,
        advanced: true
      },
      {
        key: 'enablePathfinder',
        type: 'boolean',
        label: 'Enable Pathfinder',
        description: 'Use advanced routing algorithms for better prices',
        defaultValue: true,
        advanced: true
      }
    ],
    inputs: [
      { name: 'trigger', type: 'execution', description: 'Trigger the swap execution' },
      { name: 'fromAddress', type: 'address', required: true, description: 'Wallet address to swap from' },
      { name: 'dynamicAmount', type: 'number', description: 'Override the configured amount' },
      { name: 'customSlippage', type: 'number', description: 'Override slippage tolerance' }
    ],
    outputs: [
      { name: 'success', type: 'execution', description: 'Swap completed successfully' },
      { name: 'error', type: 'execution', description: 'Swap failed' },
      { name: 'transactionHash', type: 'string', description: 'Blockchain transaction hash' },
      { name: 'gasUsed', type: 'number', description: 'Gas units consumed' },
      { name: 'outputAmount', type: 'number', description: 'Actual amount received' },
      { name: 'gasCost', type: 'number', description: 'Total gas cost in ETH' },
      { name: 'priceImpact', type: 'number', description: 'Price impact percentage' }
    ]
  },

  conditionalLogic: {
    type: 'conditionalLogic',
    name: 'Conditional Logic',
    description: 'Execute different workflow paths based on dynamic conditions',
    category: 'Logic',
    icon: '🔀',
    color: '#059669',
    fields: [
      {
        key: 'conditionType',
        type: 'select',
        label: 'Condition Type',
        required: true,
        description: 'Type of comparison to perform',
        options: [
          { label: 'Greater Than (>)', value: 'gt' },
          { label: 'Less Than (<)', value: 'lt' },
          { label: 'Equal To (=)', value: 'eq' },
          { label: 'Not Equal To (≠)', value: 'ne' },
          { label: 'Contains Text', value: 'contains' },
          { label: 'Starts With', value: 'startsWith' },
          { label: 'Ends With', value: 'endsWith' },
          { label: 'Is Empty', value: 'isEmpty' },
          { label: 'Is Not Empty', value: 'isNotEmpty' },
          { label: 'Matches Regex', value: 'regex' }
        ],
        defaultValue: 'gt'
      },
      {
        key: 'threshold',
        type: 'number',
        label: 'Numeric Threshold',
        description: 'Number to compare against',
        conditional: (config) => ['gt', 'lt', 'eq', 'ne'].includes(config.conditionType),
        helpText: 'For numeric comparisons like price, amount, etc.'
      },
      {
        key: 'textValue',
        type: 'text',
        label: 'Text Value',
        description: 'Text to compare against',
        conditional: (config) => ['contains', 'startsWith', 'endsWith'].includes(config.conditionType),
        placeholder: 'Enter text to match...'
      },
      {
        key: 'regexPattern',
        type: 'text',
        label: 'Regular Expression',
        description: 'JavaScript regex pattern',
        conditional: (config) => config.conditionType === 'regex',
        placeholder: '/pattern/flags',
        helpText: 'Example: /^0x[a-fA-F0-9]{40}$/ for Ethereum addresses'
      },
      {
        key: 'enableDelay',
        type: 'boolean',
        label: 'Add Processing Delay',
        description: 'Wait before evaluating the condition',
        defaultValue: false
      },
      {
        key: 'delayMs',
        type: 'slider',
        label: 'Delay Duration (ms)',
        description: 'Time to wait before evaluation',
        min: 100,
        max: 10000,
        step: 100,
        defaultValue: 1000,
        conditional: (config) => config.enableDelay === true
      },
      {
        key: 'invertCondition',
        type: 'boolean',
        label: 'Invert Result',
        description: 'Reverse the true/false outcome',
        defaultValue: false,
        advanced: true
      },
      {
        key: 'caseSensitive',
        type: 'boolean',
        label: 'Case Sensitive',
        description: 'Consider letter case in text comparisons',
        defaultValue: true,
        conditional: (config) => ['contains', 'startsWith', 'endsWith'].includes(config.conditionType),
        advanced: true
      }
    ],
    inputs: [
      { name: 'input', type: 'any', required: true, description: 'Value to evaluate' },
      { name: 'trigger', type: 'execution', description: 'Trigger condition evaluation' },
      { name: 'referenceValue', type: 'any', description: 'Optional reference value for comparison' }
    ],
    outputs: [
      { name: 'true', type: 'execution', description: 'Condition evaluated to true' },
      { name: 'false', type: 'execution', description: 'Condition evaluated to false' },
      { name: 'value', type: 'any', description: 'Original input value' },
      { name: 'result', type: 'boolean', description: 'Boolean result of the condition' }
    ]
  },

  dataProcessor: {
    type: 'dataProcessor',
    name: 'Data Processor',
    description: 'Transform, format, and manipulate data with JavaScript expressions',
    category: 'Data',
    icon: '🔄',
    color: '#7C3AED',
    fields: [
      {
        key: 'operation',
        type: 'select',
        label: 'Operation Type',
        required: true,
        description: 'Type of data processing to perform',
        options: [
          { label: 'Format Number', value: 'formatNumber' },
          { label: 'Parse JSON', value: 'parseJson' },
          { label: 'Extract Field', value: 'extractField' },
          { label: 'Calculate Expression', value: 'calculate' },
          { label: 'Transform Object', value: 'transform' },
          { label: 'Filter Array', value: 'filter' },
          { label: 'Sort Array', value: 'sort' },
          { label: 'Validate Data', value: 'validate' }
        ],
        defaultValue: 'formatNumber'
      },
      {
        key: 'decimals',
        type: 'number',
        label: 'Decimal Places',
        description: 'Number of decimal places for formatting',
        min: 0,
        max: 18,
        defaultValue: 2,
        conditional: (config) => config.operation === 'formatNumber'
      },
      {
        key: 'fieldPath',
        type: 'text',
        label: 'Field Path',
        description: 'Path to extract (e.g., data.result.value)',
        required: true,
        conditional: (config) => config.operation === 'extractField',
        placeholder: 'data.field.subfield'
      },
      {
        key: 'expression',
        type: 'code',
        label: 'JavaScript Expression',
        description: 'Custom JavaScript code for processing',
        required: true,
        conditional: (config) => ['calculate', 'transform', 'filter', 'validate'].includes(config.operation),
        placeholder: `// Available variables:
// input - the input data
// config - this node's configuration
// return - the processed result

return input * 2; // Example: double the input`
      },
      {
        key: 'sortKey',
        type: 'text',
        label: 'Sort By Field',
        description: 'Field to sort array by',
        conditional: (config) => config.operation === 'sort',
        placeholder: 'price'
      },
      {
        key: 'sortOrder',
        type: 'select',
        label: 'Sort Order',
        description: 'Ascending or descending order',
        options: [
          { label: 'Ascending', value: 'asc' },
          { label: 'Descending', value: 'desc' }
        ],
        defaultValue: 'asc',
        conditional: (config) => config.operation === 'sort'
      },
      {
        key: 'validationRules',
        type: 'code',
        label: 'Validation Rules',
        description: 'JavaScript validation function',
        conditional: (config) => config.operation === 'validate',
        placeholder: `// Return true if valid, false if invalid
// Available: input, config

if (typeof input === 'number' && input > 0) {
  return true;
}
return false;`
      },
      {
        key: 'errorMessage',
        type: 'text',
        label: 'Custom Error Message',
        description: 'Message to show when validation fails',
        conditional: (config) => config.operation === 'validate',
        placeholder: 'Validation failed: invalid input'
      },
      {
        key: 'enableCaching',
        type: 'boolean',
        label: 'Enable Result Caching',
        description: 'Cache processing results for performance',
        defaultValue: false,
        advanced: true
      },
      {
        key: 'cacheKey',
        type: 'text',
        label: 'Cache Key Template',
        description: 'Template for generating cache keys',
        conditional: (config) => config.enableCaching === true,
        placeholder: 'process_{{input.hash}}_{{config.operation}}',
        advanced: true
      }
    ],
    inputs: [
      { name: 'data', type: 'any', required: true, description: 'Data to process' },
      { name: 'trigger', type: 'execution', description: 'Trigger processing' },
      { name: 'config', type: 'object', description: 'Additional configuration data' }
    ],
    outputs: [
      { name: 'result', type: 'any', description: 'Processed data result' },
      { name: 'success', type: 'execution', description: 'Processing completed successfully' },
      { name: 'error', type: 'execution', description: 'Processing failed' },
      { name: 'errorMessage', type: 'string', description: 'Error details if processing failed' }
    ]
  },

  walletConnector: {
    type: 'walletConnector',
    name: 'Wallet Connector',
    description: 'Connect to blockchain wallets with multiple provider support',
    category: 'Wallet',
    icon: '👛',
    color: '#DC2626',
    fields: [
      {
        key: 'autoConnect',
        type: 'boolean',
        label: 'Auto Connect',
        description: 'Automatically connect to wallet on page load',
        defaultValue: false,
        helpText: 'Only enable if you want immediate wallet connection'
      },
      {
        key: 'supportedWallets',
        type: 'multiselect',
        label: 'Supported Wallets',
        description: 'Select which wallet types to support',
        required: true,
        options: [
          { label: 'MetaMask', value: 'metamask' },
          { label: 'WalletConnect', value: 'walletconnect' },
          { label: 'Coinbase Wallet', value: 'coinbase' },
          { label: 'Trust Wallet', value: 'trust' },
          { label: 'Rainbow', value: 'rainbow' },
          { label: 'Argent', value: 'argent' }
        ],
        defaultValue: ['metamask', 'walletconnect']
      },
      {
        key: 'defaultNetwork',
        type: 'select',
        label: 'Default Network',
        description: 'Primary network to connect to',
        options: [
          { label: 'Ethereum Mainnet', value: '1' },
          { label: 'Polygon', value: '137' },
          { label: 'BSC', value: '56' },
          { label: 'Arbitrum', value: '42161' },
          { label: 'Optimism', value: '10' }
        ],
        defaultValue: '1'
      },
      {
        key: 'enableNetworkSwitching',
        type: 'boolean',
        label: 'Enable Network Switching',
        description: 'Allow users to switch networks after connection',
        defaultValue: true
      },
      {
        key: 'requireSignature',
        type: 'boolean',
        label: 'Require Signature',
        description: 'Request wallet signature for verification',
        defaultValue: false,
        advanced: true
      },
      {
        key: 'signatureMessage',
        type: 'textarea',
        label: 'Signature Message',
        description: 'Message to sign for verification',
        conditional: (config) => config.requireSignature === true,
        placeholder: 'Please sign this message to verify your wallet ownership.',
        advanced: true
      },
      {
        key: 'enableBalanceTracking',
        type: 'boolean',
        label: 'Track Balance',
        description: 'Monitor wallet balance changes',
        defaultValue: true,
        advanced: true
      },
      {
        key: 'balanceUpdateInterval',
        type: 'number',
        label: 'Balance Update Interval (seconds)',
        description: 'How often to refresh balance',
        min: 5,
        max: 300,
        defaultValue: 30,
        conditional: (config) => config.enableBalanceTracking === true,
        advanced: true
      }
    ],
    inputs: [
      { name: 'trigger', type: 'execution', description: 'Trigger wallet connection' },
      { name: 'targetNetwork', type: 'string', description: 'Specific network to connect to' }
    ],
    outputs: [
      { name: 'connected', type: 'execution', description: 'Wallet connected successfully' },
      { name: 'disconnected', type: 'execution', description: 'Wallet disconnected' },
      { name: 'error', type: 'execution', description: 'Connection failed' },
      { name: 'address', type: 'address', description: 'Connected wallet address' },
      { name: 'balance', type: 'number', description: 'Wallet balance in ETH' },
      { name: 'network', type: 'string', description: 'Connected network' },
      { name: 'signature', type: 'string', description: 'Wallet signature if requested' }
    ]
  }
}

// Utility functions for enhanced node templates
export function getNodeTemplate(type: string): NodeTemplate | null {
  return enhancedNodeTemplates[type] || null
}

export function getAllNodeTemplates(): NodeTemplate[] {
  return Object.values(enhancedNodeTemplates)
}

export function getNodeTemplatesByCategory(category: string): NodeTemplate[] {
  return Object.values(enhancedNodeTemplates).filter(template => template.category === category)
}

export function validateNodeConfig(type: string, config: Record<string, any>): Record<string, string> {
  const template = enhancedNodeTemplates[type]
  if (!template) return {}

  const errors: Record<string, string> = {}

  template.fields.forEach(field => {
    // Skip conditional fields that aren't shown
    if (field.conditional && !field.conditional(config)) return

    const value = config[field.key]

    // Required field validation
    if (field.required && (value === undefined || value === null || value === '')) {
      errors[field.key] = `${field.label} is required`
      return
    }

    // Custom validation
    if (field.validation?.custom) {
      const result = field.validation.custom(value, config)
      if (result !== null && result !== true) {
        errors[field.key] = typeof result === 'string' ? result : 'Validation failed'
      }
    }

    // Pattern validation
    if (field.validation?.pattern && value && !field.validation.pattern.test(String(value))) {
      errors[field.key] = field.validation.message || 'Invalid format'
    }
  })

  return errors
}
