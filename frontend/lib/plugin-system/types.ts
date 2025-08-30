/**
 * Enhanced Data Type System for Unite DeFi
 * Rich type system with schemas, validation, and transformations
 */

// JSON Schema for complex data validation
export interface JSONSchema {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null'
  properties?: Record<string, JSONSchema>
  items?: JSONSchema
  required?: string[]
  enum?: any[]
  format?: string
  pattern?: string
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  minItems?: number
  maxItems?: number
  uniqueItems?: boolean
  additionalProperties?: boolean | JSONSchema
  anyOf?: JSONSchema[]
  oneOf?: JSONSchema[]
  allOf?: JSONSchema[]
  not?: JSONSchema
  const?: any
  default?: any
  description?: string
  examples?: any[]
  title?: string
}

// Rich data type definition
export interface DataType {
  id: string
  name: string
  description: string
  schema: JSONSchema
  category: DataTypeCategory
  icon?: string
  color?: string
  isStreamable?: boolean
  isCacheable?: boolean
  validators?: ValidationRule[]
  transformers?: DataTransformer[]
  serializers?: DataSerializer[]
  examples?: any[]
  documentation?: string
  version: string
  compatibility?: string[] // Compatible type IDs
}

export type DataTypeCategory = 
  | 'primitive'     // string, number, boolean
  | 'structured'    // object, array
  | 'blockchain'    // address, transaction, block
  | 'defi'         // token, swap, quote, pool
  | 'file'         // image, document, csv
  | 'streaming'    // real-time data
  | 'computed'     // derived/calculated values
  | 'external'     // API responses, external data

// Validation rule for data types
export interface ValidationRule {
  id: string
  name: string
  description: string
  validator: (value: any, context?: ValidationContext) => ValidationResult
  async?: boolean
  severity: 'error' | 'warning' | 'info'
  category?: string
}

export interface ValidationContext {
  nodeId: string
  fieldKey: string
  allValues: Record<string, any>
  executionContext?: any
}

export interface ValidationResult {
  valid: boolean
  errors?: string[]
  warnings?: string[]
  info?: string[]
  transformedValue?: any
}

// Data transformation
export interface DataTransformer {
  id: string
  name: string
  description: string
  fromType: string
  toType: string
  transform: (value: any, options?: any) => any
  async?: boolean
  lossy?: boolean // Whether transformation loses information
  bidirectional?: boolean
}

// Data serialization for network transfer
export interface DataSerializer {
  id: string
  name: string
  mimeType: string
  serialize: (value: any) => string | Uint8Array
  deserialize: (data: string | Uint8Array) => any
  compressed?: boolean
}

// Connection validation system
export interface ConnectionRule {
  id: string
  name: string
  sourceType: string
  targetType: string
  validator: (sourceData: any, targetExpected: DataType) => boolean
  transformer?: (sourceData: any) => any
  cost: number // Connection cost for optimization
  priority: number
}

// Component template definition
export interface ComponentTemplate {
  id: string
  name: string
  description: string
  category: string
  version: string
  inputs: PortDefinition[]
  outputs: PortDefinition[]
  configuration: ConfigurationField[]
  metadata?: ComponentMetadata
  behavior?: ComponentBehavior
  dependencies?: string[]
  resources?: ResourceRequirement[]
}

export interface PortDefinition {
  id: string
  name: string
  description: string
  dataType: string // References DataType.id
  required: boolean
  multiple?: boolean // Can accept multiple connections
  streaming?: boolean // Supports real-time data
  defaultValue?: any
  constraints?: PortConstraint[]
  validation?: ValidationRule[]
  transformation?: DataTransformer[]
}

export interface PortConstraint {
  type: 'minConnections' | 'maxConnections' | 'requiredConnection' | 'excludeConnection'
  value: number | string
  message?: string
}

export interface ConfigurationField {
  key: string
  name: string
  description: string
  type: FieldType
  dataType?: string // For complex types
  required: boolean
  defaultValue?: any
  validation?: ValidationRule[]
  conditional?: ConditionalRule
  category?: string
  advanced?: boolean
  sensitive?: boolean
  options?: FieldOption[]
  constraints?: FieldConstraint[]
  ui?: UIConfiguration
}

export type FieldType = 
  | 'text' | 'number' | 'boolean' | 'select' | 'multiselect'
  | 'textarea' | 'code' | 'json' | 'file' | 'color'
  | 'slider' | 'range' | 'datetime' | 'duration'
  | 'address' | 'private_key' | 'api_key' | 'url'
  | 'token_selector' | 'chain_selector' | 'contract_selector'
  | 'nested_object' | 'dynamic_array' | 'key_value_pairs'
  | 'expression' | 'formula' | 'script'

export interface FieldOption {
  label: string
  value: any
  description?: string
  icon?: string
  disabled?: boolean
  group?: string
}

export interface FieldConstraint {
  type: 'min' | 'max' | 'length' | 'pattern' | 'custom'
  value: any
  message?: string
}

export interface ConditionalRule {
  dependsOn: string[]
  condition: (values: Record<string, any>) => boolean
  showWhen?: boolean
}

export interface UIConfiguration {
  widget?: string // Custom UI widget to use
  placeholder?: string
  helpText?: string
  tooltip?: string
  rows?: number // For textarea
  columns?: number
  autoComplete?: string
  readOnly?: boolean
  hidden?: boolean
}

export interface ComponentMetadata {
  author?: string
  version?: string
  license?: string
  tags?: string[]
  category?: string
  subcategory?: string
  documentation?: string
  examples?: ComponentExample[]
  changelog?: ChangelogEntry[]
  compatibility?: CompatibilityInfo
  resources?: ResourceInfo
}

export interface ComponentBehavior {
  execution: ExecutionBehavior
  caching: CachingBehavior
  error: ErrorBehavior
  progress: ProgressBehavior
  lifecycle: LifecycleBehavior
}

export interface ExecutionBehavior {
  type: 'sync' | 'async' | 'streaming'
  timeout?: number
  retries?: number
  parallelizable?: boolean
  idempotent?: boolean
  sideEffects?: string[]
}

export interface CachingBehavior {
  enabled: boolean
  strategy?: 'memory' | 'disk' | 'network'
  duration?: number
  key?: string // Cache key template
  invalidation?: string[] // Events that invalidate cache
}

export interface ErrorBehavior {
  strategy: 'fail_fast' | 'retry' | 'fallback' | 'ignore'
  fallback?: any // Fallback value or component
  propagation: 'stop' | 'continue' | 'conditional'
}

export interface ProgressBehavior {
  reportable: boolean
  estimable?: boolean
  cancellable?: boolean
  pausable?: boolean
}

export interface LifecycleBehavior {
  initialize?: string // Initialization code
  cleanup?: string // Cleanup code
  validate?: string // Pre-execution validation
  transform?: string // Post-execution transformation
}

export interface ResourceRequirement {
  type: 'memory' | 'cpu' | 'network' | 'storage' | 'gpu'
  amount: number
  unit: string
  required: boolean
}

export interface ComponentExample {
  name: string
  description: string
  inputs: Record<string, any>
  configuration: Record<string, any>
  expectedOutputs: Record<string, any>
  workflow?: WorkflowExample
}

export interface WorkflowExample {
  nodes: any[]
  connections: any[]
  description: string
}

export interface ChangelogEntry {
  version: string
  date: string
  changes: string[]
  breaking?: boolean
}

export interface CompatibilityInfo {
  engineVersion: string
  nodeVersion?: string
  dependencies: Record<string, string>
  conflicts?: string[]
}

export interface ResourceInfo {
  memory: string
  cpu: string
  network: boolean
  blockchain?: string[]
  apis?: string[]
}

// Built-in data types
export const BUILT_IN_DATA_TYPES: Record<string, DataType> = {
  string: {
    id: 'string',
    name: 'Text',
    description: 'Plain text string',
    category: 'primitive',
    schema: {
      type: 'string'
    },
    color: '#10B981',
    version: '1.0.0',
    isCacheable: true,
    examples: ['Hello World', 'user@example.com']
  },

  number: {
    id: 'number',
    name: 'Number',
    description: 'Numeric value',
    category: 'primitive',
    schema: {
      type: 'number'
    },
    color: '#3B82F6',
    version: '1.0.0',
    isCacheable: true,
    examples: [42, 3.14159, -100]
  },

  boolean: {
    id: 'boolean',
    name: 'Boolean',
    description: 'True or false value',
    category: 'primitive',
    schema: {
      type: 'boolean'
    },
    color: '#8B5CF6',
    version: '1.0.0',
    isCacheable: true,
    examples: [true, false]
  },

  object: {
    id: 'object',
    name: 'Object',
    description: 'JSON object with properties',
    category: 'structured',
    schema: {
      type: 'object',
      additionalProperties: true
    },
    color: '#F59E0B',
    version: '1.0.0',
    isCacheable: true,
    examples: [
      { name: 'John', age: 30 },
      { data: [1, 2, 3], meta: { total: 3 } }
    ]
  },

  array: {
    id: 'array',
    name: 'Array',
    description: 'List of items',
    category: 'structured',
    schema: {
      type: 'array',
      items: {}
    },
    color: '#F97316',
    version: '1.0.0',
    isCacheable: true,
    examples: [
      [1, 2, 3],
      ['a', 'b', 'c'],
      [{ id: 1 }, { id: 2 }]
    ]
  },

  address: {
    id: 'address',
    name: 'Address',
    description: 'Blockchain address',
    category: 'blockchain',
    schema: {
      type: 'string',
      pattern: '^0x[a-fA-F0-9]{40}$'
    },
    color: '#DC2626',
    version: '1.0.0',
    isCacheable: true,
    validators: [{
      id: 'ethereum_address',
      name: 'Ethereum Address Validator',
      description: 'Validates Ethereum address format',
      validator: (value: string) => ({
        valid: /^0x[a-fA-F0-9]{40}$/.test(value),
        errors: /^0x[a-fA-F0-9]{40}$/.test(value) ? [] : ['Invalid Ethereum address format']
      }),
      severity: 'error'
    }],
    examples: ['0x742d35Cc66C1C053d9f31d2e5c6b2b4e4f4f6f7f8']
  },

  token: {
    id: 'token',
    name: 'Token',
    description: 'Cryptocurrency token information',
    category: 'defi',
    schema: {
      type: 'object',
      properties: {
        address: { type: 'string', pattern: '^0x[a-fA-F0-9]{40}$' },
        symbol: { type: 'string' },
        name: { type: 'string' },
        decimals: { type: 'number', minimum: 0, maximum: 18 },
        chainId: { type: 'number' },
        logoURI: { type: 'string', format: 'uri' },
        balance: { type: 'string' },
        priceUSD: { type: 'number' }
      },
      required: ['address', 'symbol', 'decimals', 'chainId']
    },
    color: '#7C3AED',
    version: '1.0.0',
    isCacheable: true,
    examples: [{
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 1,
      balance: '1000.500000',
      priceUSD: 0.999
    }]
  },

  transaction: {
    id: 'transaction',
    name: 'Transaction',
    description: 'Blockchain transaction data',
    category: 'blockchain',
    schema: {
      type: 'object',
      properties: {
        hash: { type: 'string', pattern: '^0x[a-fA-F0-9]{64}$' },
        from: { type: 'string', pattern: '^0x[a-fA-F0-9]{40}$' },
        to: { type: 'string', pattern: '^0x[a-fA-F0-9]{40}$' },
        value: { type: 'string' },
        gasLimit: { type: 'string' },
        gasPrice: { type: 'string' },
        data: { type: 'string' },
        nonce: { type: 'number' },
        chainId: { type: 'number' },
        status: { type: 'string', enum: ['pending', 'confirmed', 'failed'] },
        blockNumber: { type: 'number' },
        gasUsed: { type: 'string' }
      },
      required: ['hash', 'from', 'to']
    },
    color: '#EF4444',
    version: '1.0.0',
    isCacheable: true,
    isStreamable: true // Can stream transaction updates
  },

  stream: {
    id: 'stream',
    name: 'Data Stream',
    description: 'Real-time data stream',
    category: 'streaming',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        type: { type: 'string' },
        data: {},
        timestamp: { type: 'number' },
        metadata: { type: 'object' }
      },
      required: ['id', 'type', 'data', 'timestamp']
    },
    color: '#06B6D4',
    version: '1.0.0',
    isCacheable: false,
    isStreamable: true
  },

  file: {
    id: 'file',
    name: 'File',
    description: 'File data with metadata',
    category: 'file',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        type: { type: 'string' },
        size: { type: 'number' },
        data: { type: 'string' }, // Base64 encoded
        url: { type: 'string', format: 'uri' },
        metadata: { type: 'object' }
      },
      required: ['name', 'type']
    },
    color: '#64748B',
    version: '1.0.0',
    isCacheable: true
  },

  // Avalanche-specific data types (aliases for existing types)
  subnetID: {
    id: 'subnetID',
    name: 'Subnet ID',
    description: 'Avalanche subnet identifier',
    category: 'blockchain',
    schema: {
      type: 'string',
      pattern: '^[a-zA-Z0-9]{40,50}$'
    },
    color: '#E84142',
    version: '1.0.0',
    isCacheable: true,
    compatibility: ['string'],
    examples: ['subnet-1234567890abcdef', '0x1234567890abcdef1234567890abcdef12345678']
  },

  icmPayload: {
    id: 'icmPayload',
    name: 'ICM Payload',
    description: 'Interchain messaging payload data',
    category: 'blockchain',
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['string', 'number', 'object'] },
        data: {},
        destinationChain: { type: 'string' },
        sourceChain: { type: 'string' },
        timestamp: { type: 'number' }
      },
      required: ['type', 'data']
    },
    color: '#E84142',
    version: '1.0.0',
    isCacheable: false,
    compatibility: ['object'],
    examples: [{
      type: 'string',
      data: 'Hello Avalanche!',
      destinationChain: 'C',
      sourceChain: 'P',
      timestamp: Date.now()
    }]
  },

  avalancheConfig: {
    id: 'avalancheConfig',
    name: 'Avalanche Config',
    description: 'Avalanche network configuration',
    category: 'blockchain',
    schema: {
      type: 'object',
      properties: {
        chainId: { type: 'number' },
        rpcUrl: { type: 'string', format: 'uri' },
        subnetId: { type: 'string' },
        vmType: { type: 'string', enum: ['SubnetEVM', 'CustomVM'] },
        gasLimit: { type: 'number' },
        genesisData: { type: 'object' }
      },
      required: ['chainId', 'rpcUrl']
    },
    color: '#E84142',
    version: '1.0.0',
    isCacheable: true,
    compatibility: ['object'],
    examples: [{
      chainId: 43113,
      rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
      subnetId: '11111111111111111111111111111111LpoYY',
      vmType: 'SubnetEVM',
      gasLimit: 8000000
    }]
  }
}

// Additional interfaces needed by the plugin system

export interface ComponentTemplate {
  type: string
  name: string
  description: string
  category: string
  icon?: string
  color?: string
  inputs: PortDefinition[]
  outputs: PortDefinition[]
  fields: FieldDefinition[]
}

export interface PortDefinition {
  id: string
  name: string
  dataType: string
  required?: boolean
  description?: string
}

export interface FieldDefinition {
  key: string
  type: string
  label?: string
  required?: boolean
  defaultValue?: any
  options?: { label: string; value: any }[]
  placeholder?: string
  description?: string
  language?: string
  conditional?: { field: string; value: any }
  sensitive?: boolean
}

export interface PluginManifest {
  id: string
  name: string
  version: string
  author: string
  description: string
  components?: ComponentDefinition[]
  permissions?: string[]
  compatibility?: { minVersion: string }
  tags?: string[]
}

export interface ComponentDefinition {
  id: string
  name: string
  description: string
  category: string
  version: string
  author: string
  tags: string[]
  icon?: string
  color?: string
  template: {
    inputs: PortDefinition[]
    outputs: PortDefinition[]
    configuration: FieldDefinition[]
    ui?: {
      icon?: string
      color?: string
      size?: string
      shape?: string
      showPorts?: boolean
      showConfig?: boolean
    }
    documentation?: {
      description: string
      examples: any[]
      parameters: any[]
      usage: string
      changelog: any[]
    }
  }
  execution: {
    runtime: string
    code: string
    entryPoint?: string
    timeout?: number
    memoryLimit?: number
    environment?: Record<string, any>
    dependencies?: string[]
    permissions?: string[]
  }
  validation: {
    preExecution?: string[]
    postExecution?: string[]
    runtime?: string[]
  }
  metadata: {
    created?: string
    modified?: string
    author?: string
    license?: string
    keywords?: string[]
  }
  dependencies: string[]
  permissions: string[]
  lifecycle?: Record<string, any>
}

export interface ExecutionContext {
  nodeId: string
  workflowId: string
  inputs: Record<string, any>
  config: Record<string, any>
  environment: Record<string, any>
  dependencies: Record<string, any>
  permissions: string[]
}

export interface ExecutionResult {
  success: boolean
  outputs: Record<string, any>
  error: Error | null
  duration: number
  logs: string[]
  metadata: Record<string, any>
}

export interface WorkflowDefinition {
  id?: string
  name?: string
  description?: string
  nodes: Array<{
    id: string
    type: string
    data?: Record<string, any>
  }>
  connections: Array<{
    source: string
    target: string
    sourceHandle?: string
    targetHandle?: string
  }>
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

// Custom error classes for better error handling
export class ExecutionError extends Error {
  constructor(
    message: string,
    public code: string = 'EXECUTION_FAILED',
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'ExecutionError'
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public code: string = 'VALIDATION_FAILED',
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class ConnectionError extends Error {
  constructor(
    message: string,
    public code: string = 'CONNECTION_FAILED',
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'ConnectionError'
  }
}