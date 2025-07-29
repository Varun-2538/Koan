// Base Component System for Web3/DeFi Executable Nodes
// Inspired by Langflow architecture but optimized for blockchain interactions

export interface ComponentInput {
  key: string
  label: string
  description: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'api_key' | 'json' | 'address' | 'token' | 'chain'
  required: boolean
  sensitive?: boolean
  defaultValue?: any
  placeholder?: string
  options?: string[] | { value: string; label: string }[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    custom?: (value: any) => boolean | string
  }
}

export interface ComponentOutput {
  key: string
  label: string
  description: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'transaction' | 'quote'
}

export interface ComponentExecutionResult {
  success: boolean
  outputs: Record<string, any>
  error?: string
  logs?: string[]
  executionTime?: number
  gasUsed?: string
  transactionHash?: string
  blockNumber?: number
}

export interface ComponentMetadata {
  category: 'swap' | 'bridge' | 'lending' | 'governance' | 'analytics' | 'infrastructure'
  tags: string[]
  version: string
  author: string
  documentation?: string
  examples?: Array<{
    name: string
    description: string
    inputs: Record<string, any>
    expectedOutputs: Record<string, any>
  }>
}

export abstract class BaseComponent {
  abstract readonly name: string
  abstract readonly description: string
  abstract readonly inputs: ComponentInput[]
  abstract readonly outputs: ComponentOutput[]
  abstract readonly metadata: ComponentMetadata

  // Execution methods
  abstract execute(inputs: Record<string, any>): Promise<ComponentExecutionResult>
  abstract test(inputs: Record<string, any>): Promise<ComponentExecutionResult>

  // Validation methods
  validateInputs(inputs: Record<string, any>): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    for (const input of this.inputs) {
      const value = inputs[input.key]

      // Check required fields
      if (input.required && (value === undefined || value === null || value === '')) {
        errors.push(`${input.label} is required`)
        continue
      }

      // Skip validation if value is empty and not required
      if (!input.required && (value === undefined || value === null || value === '')) {
        continue
      }

      // Type validation
      switch (input.type) {
        case 'number':
          if (isNaN(Number(value))) {
            errors.push(`${input.label} must be a valid number`)
          } else {
            const num = Number(value)
            if (input.validation?.min !== undefined && num < input.validation.min) {
              errors.push(`${input.label} must be at least ${input.validation.min}`)
            }
            if (input.validation?.max !== undefined && num > input.validation.max) {
              errors.push(`${input.label} must be at most ${input.validation.max}`)
            }
          }
          break

        case 'address':
          if (!this.isValidAddress(value)) {
            errors.push(`${input.label} must be a valid Ethereum address`)
          }
          break

        case 'api_key':
          if (typeof value !== 'string' || value.length < 10) {
            errors.push(`${input.label} must be a valid API key`)
          }
          break

        case 'select':
          if (input.options && !input.options.some(opt => 
            typeof opt === 'string' ? opt === value : opt.value === value
          )) {
            errors.push(`${input.label} must be one of the allowed values`)
          }
          break

        case 'multiselect':
          if (!Array.isArray(value)) {
            errors.push(`${input.label} must be an array`)
          } else if (input.options) {
            const validValues = input.options.map(opt => 
              typeof opt === 'string' ? opt : opt.value
            )
            const invalidValues = value.filter(v => !validValues.includes(v))
            if (invalidValues.length > 0) {
              errors.push(`${input.label} contains invalid values: ${invalidValues.join(', ')}`)
            }
          }
          break

        case 'json':
          try {
            JSON.parse(value)
          } catch {
            errors.push(`${input.label} must be valid JSON`)
          }
          break
      }

      // Custom validation
      if (input.validation?.custom) {
        const customResult = input.validation.custom(value)
        if (customResult !== true) {
          errors.push(typeof customResult === 'string' ? customResult : `${input.label} is invalid`)
        }
      }

      // Pattern validation
      if (input.validation?.pattern) {
        const regex = new RegExp(input.validation.pattern)
        if (!regex.test(String(value))) {
          errors.push(`${input.label} format is invalid`)
        }
      }
    }

    return { valid: errors.length === 0, errors }
  }

  // Utility methods
  protected isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  protected isValidTransactionHash(hash: string): boolean {
    return /^0x[a-fA-F0-9]{64}$/.test(hash)
  }

  protected formatError(error: any): string {
    if (error.response?.data?.message) return error.response.data.message
    if (error.message) return error.message
    return 'Unknown error occurred'
  }

  protected createLog(level: 'info' | 'warn' | 'error', message: string): string {
    const timestamp = new Date().toISOString()
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`
  }

  protected async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Chain and network utilities
  protected getChainId(chain: string): number {
    const chainIds: Record<string, number> = {
      'ethereum': 1,
      'polygon': 137,
      'bnb': 56,
      'arbitrum': 42161,
      'optimism': 10,
      'avalanche': 43114,
      'fantom': 250,
      'solana': 101 // Special case for Solana
    }
    return chainIds[chain.toLowerCase()] || 1
  }

  protected getChainName(chainId: number): string {
    const chainNames: Record<number, string> = {
      1: 'ethereum',
      137: 'polygon',
      56: 'bnb',
      42161: 'arbitrum',
      10: 'optimism',
      43114: 'avalanche',
      250: 'fantom',
      101: 'solana'
    }
    return chainNames[chainId] || 'unknown'
  }

  // API request helper with retry logic
  protected async makeApiRequest(
    url: string,
    options: RequestInit = {},
    retries: number = 3
  ): Promise<any> {
    let lastError: any

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        return await response.json()
      } catch (error) {
        lastError = error
        if (i < retries - 1) {
          await this.delay(1000 * Math.pow(2, i)) // Exponential backoff
        }
      }
    }

    throw lastError
  }

  // Transaction utilities
  protected formatTokenAmount(amount: string | number, decimals: number = 18): string {
    const factor = Math.pow(10, decimals)
    return (Number(amount) * factor).toString()
  }

  protected parseTokenAmount(amount: string, decimals: number = 18): number {
    const factor = Math.pow(10, decimals)
    return Number(amount) / factor
  }

  // Gas estimation utilities
  protected estimateGasPrice(priority: 'slow' | 'standard' | 'fast' = 'standard'): string {
    // This would typically fetch from gas oracles
    const gasMultipliers = { slow: 1, standard: 1.2, fast: 1.5 }
    const baseGas = 20 // 20 gwei base
    return (baseGas * gasMultipliers[priority]).toString()
  }
}

// Specialized base classes for different component types

export abstract class SwapComponent extends BaseComponent {
  metadata: ComponentMetadata = {
    category: 'swap',
    tags: ['trading', 'dex', 'defi'],
    version: '1.0.0',
    author: 'Unite DeFi Team'
  }

  protected abstract getQuote(inputs: Record<string, any>): Promise<any>
  protected abstract executeSwap(inputs: Record<string, any>): Promise<any>
}

export abstract class BridgeComponent extends BaseComponent {
  metadata: ComponentMetadata = {
    category: 'bridge',
    tags: ['cross-chain', 'interoperability'],
    version: '1.0.0',
    author: 'Unite DeFi Team'
  }

  protected abstract getBridgeQuote(inputs: Record<string, any>): Promise<any>
  protected abstract executeBridge(inputs: Record<string, any>): Promise<any>
  protected abstract trackBridgeStatus(txHash: string): Promise<any>
}

export abstract class LendingComponent extends BaseComponent {
  metadata: ComponentMetadata = {
    category: 'lending',
    tags: ['yield', 'lending', 'defi'],
    version: '1.0.0',
    author: 'Unite DeFi Team'
  }

  protected abstract getPoolData(inputs: Record<string, any>): Promise<any>
  protected abstract deposit(inputs: Record<string, any>): Promise<any>
  protected abstract withdraw(inputs: Record<string, any>): Promise<any>
}

export abstract class GovernanceComponent extends BaseComponent {
  metadata: ComponentMetadata = {
    category: 'governance',
    tags: ['dao', 'voting', 'governance'],
    version: '1.0.0',
    author: 'Unite DeFi Team'
  }

  protected abstract createProposal(inputs: Record<string, any>): Promise<any>
  protected abstract vote(inputs: Record<string, any>): Promise<any>
  protected abstract getProposalStatus(proposalId: string): Promise<any>
}

export abstract class AnalyticsComponent extends BaseComponent {
  metadata: ComponentMetadata = {
    category: 'analytics',
    tags: ['data', 'analytics', 'metrics'],
    version: '1.0.0',
    author: 'Unite DeFi Team'
  }

  protected abstract fetchData(inputs: Record<string, any>): Promise<any>
  protected abstract processData(data: any): Promise<any>
  protected abstract generateReport(data: any): Promise<any>
} 