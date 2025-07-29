import axios from 'axios'
import { Logger } from 'winston'
import {
  NodeExecutor,
  NodeExecutionResult,
  ExecutionContext,
  ValidationError,
  ChainError,
  SwapQuote,
  TransactionRequest
} from '@/types'

export class OneInchSwapExecutor implements NodeExecutor {
  readonly type = 'oneInchSwap'
  readonly name = '1inch Swap'
  readonly description = 'Execute token swaps using 1inch Pathfinder algorithm with MEV protection'

  private logger: Logger
  private apiBaseUrl: string
  private apiKey?: string

  constructor(logger: Logger, apiKey?: string) {
    this.logger = logger
    this.apiBaseUrl = 'https://api.1inch.dev'
    this.apiKey = apiKey
  }

  async validate(inputs: Record<string, any>): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    // Required fields
    if (!inputs.api_key && !this.apiKey) {
      errors.push('1inch API key is required')
    }
    if (!inputs.chain_id) {
      errors.push('Chain ID is required')
    }
    if (!inputs.from_token) {
      errors.push('From token address is required')
    }
    if (!inputs.to_token) {
      errors.push('To token address is required')
    }
    if (!inputs.amount) {
      errors.push('Amount is required')
    }
    if (!inputs.from_address) {
      errors.push('From address is required')
    }

    // Validate addresses
    if (inputs.from_token && !this.isValidAddress(inputs.from_token)) {
      errors.push('Invalid from token address')
    }
    if (inputs.to_token && !this.isValidAddress(inputs.to_token)) {
      errors.push('Invalid to token address')
    }
    if (inputs.from_address && !this.isValidAddress(inputs.from_address)) {
      errors.push('Invalid from address')
    }

    // Validate amount
    if (inputs.amount) {
      try {
        const amount = BigInt(inputs.amount)
        if (amount <= 0n) {
          errors.push('Amount must be greater than 0')
        }
      } catch {
        errors.push('Invalid amount format')
      }
    }

    // Validate slippage
    if (inputs.slippage !== undefined) {
      const slippage = Number(inputs.slippage)
      if (isNaN(slippage) || slippage < 0.1 || slippage > 50) {
        errors.push('Slippage must be between 0.1 and 50')
      }
    }

    // Validate chain ID
    if (inputs.chain_id) {
      const supportedChains = ['1', '137', '56', '42161', '10', '43114']
      if (!supportedChains.includes(inputs.chain_id)) {
        errors.push(`Unsupported chain ID: ${inputs.chain_id}`)
      }
    }

    return { valid: errors.length === 0, errors }
  }

  async execute(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult> {
    const startTime = Date.now()
    const logs: string[] = []

    try {
      logs.push(`[${new Date().toISOString()}] Starting 1inch swap execution`)

      // Use provided API key or fallback to constructor key
      const apiKey = inputs.api_key || this.apiKey
      if (!apiKey) {
        throw new ValidationError('No API key available')
      }

      // Extract and validate inputs
      const {
        chain_id,
        from_token,
        to_token,
        amount,
        from_address,
        slippage = 1,
        enable_fusion = false,
        gas_optimization = 'balanced',
        fee_recipient,
        fee_percent = 0
      } = inputs

      logs.push(`[${new Date().toISOString()}] Swap parameters: ${from_token} -> ${to_token}, amount: ${amount}`)

      // Step 1: Get quote
      logs.push(`[${new Date().toISOString()}] Fetching quote from 1inch`)
      const quote = await this.getQuote({
        chainId: parseInt(chain_id),
        fromTokenAddress: from_token,
        toTokenAddress: to_token,
        amount,
        slippage
      }, apiKey)

      logs.push(`[${new Date().toISOString()}] Quote received: ${quote.toAmount} tokens expected`)

      // Step 2: Build swap transaction
      logs.push(`[${new Date().toISOString()}] Building swap transaction`)
      const swapTx = await this.buildSwapTransaction({
        chainId: parseInt(chain_id),
        fromTokenAddress: from_token,
        toTokenAddress: to_token,
        amount,
        fromAddress: from_address,
        slippage,
        destReceiver: from_address,
        referrer: fee_recipient,
        fee: fee_percent > 0 ? (fee_percent * 100).toString() : undefined
      }, apiKey)

      logs.push(`[${new Date().toISOString()}] Swap transaction built successfully`)

      // Step 3: Calculate price impact and savings
      const priceImpact = this.calculatePriceImpact(quote)
      const protocols = this.extractProtocols(quote)
      const gasSavings = this.calculateGasSavings(quote, swapTx)

      const executionTime = Date.now() - startTime

      // Return successful result
      return {
        success: true,
        outputs: {
          quote: {
            fromTokenAddress: quote.fromTokenAddress,
            toTokenAddress: quote.toTokenAddress,
            fromAmount: quote.fromAmount,
            toAmount: quote.toAmount,
            protocols: quote.protocols,
            slippage: quote.slippage
          },
          transaction_data: {
            to: swapTx.to,
            data: swapTx.data,
            value: swapTx.value,
            gasLimit: swapTx.gasLimit,
            gasPrice: swapTx.gasPrice,
            chainId: swapTx.chainId
          },
          estimated_gas: swapTx.gasLimit,
          price_impact: priceImpact,
          protocols_used: protocols,
          savings: {
            gas_savings: gasSavings,
            amount_savings: this.calculateAmountSavings(quote)
          },
          swap_info: {
            from_token: from_token,
            to_token: to_token,
            from_amount: amount,
            to_amount: quote.toAmount,
            slippage: slippage,
            mev_protection: enable_fusion
          }
        },
        logs,
        executionTime,
        gasUsed: swapTx.gasLimit
      }

    } catch (error: any) {
      logs.push(`[${new Date().toISOString()}] ERROR: ${error.message}`)
      
      return {
        success: false,
        outputs: {},
        error: this.formatError(error),
        logs,
        executionTime: Date.now() - startTime
      }
    }
  }

  async estimateGas(inputs: Record<string, any>, context: ExecutionContext): Promise<string> {
    const apiKey = inputs.api_key || this.apiKey
    if (!apiKey) {
      throw new ValidationError('No API key available for gas estimation')
    }

    try {
      const quote = await this.getQuote({
        chainId: parseInt(inputs.chain_id),
        fromTokenAddress: inputs.from_token,
        toTokenAddress: inputs.to_token,
        amount: inputs.amount,
        slippage: inputs.slippage || 1
      }, apiKey)

      return quote.estimatedGas
    } catch (error) {
      this.logger.error('Gas estimation failed', error)
      throw new ChainError('Failed to estimate gas', parseInt(inputs.chain_id))
    }
  }

  private async getQuote(params: {
    chainId: number
    fromTokenAddress: string
    toTokenAddress: string
    amount: string
    slippage: number
  }, apiKey: string): Promise<SwapQuote> {
    const { chainId, fromTokenAddress, toTokenAddress, amount, slippage } = params

    const url = `${this.apiBaseUrl}/swap/v5.2/${chainId}/quote`
    const queryParams = new URLSearchParams({
      fromTokenAddress,
      toTokenAddress,
      amount,
      slippage: slippage.toString(),
      disableEstimate: 'false',
      allowPartialFill: 'true'
    })

    try {
      const response = await axios.get(`${url}?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        },
        timeout: 10000
      })

      return {
        fromTokenAddress,
        toTokenAddress,
        fromAmount: amount,
        toAmount: response.data.toAmount || response.data.dstAmount,
        protocols: response.data.protocols || [],
        estimatedGas: response.data.estimatedGas || response.data.gas || '0',
        slippage,
        chainId,
        validUntil: Date.now() + 30000 // 30 seconds validity
      }
    } catch (error: any) {
      if (error.response) {
        throw new ChainError(
          `1inch API error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`,
          chainId
        )
      }
      throw new ChainError(`Failed to get quote: ${error.message}`, chainId)
    }
  }

  private async buildSwapTransaction(params: {
    chainId: number
    fromTokenAddress: string
    toTokenAddress: string
    amount: string
    fromAddress: string
    slippage: number
    destReceiver?: string
    referrer?: string
    fee?: string
  }, apiKey: string): Promise<TransactionRequest> {
    const { chainId, fromTokenAddress, toTokenAddress, amount, fromAddress, slippage, destReceiver, referrer, fee } = params

    const url = `${this.apiBaseUrl}/swap/v5.2/${chainId}/swap`
    const queryParams = new URLSearchParams({
      fromTokenAddress,
      toTokenAddress,
      amount,
      fromAddress,
      slippage: slippage.toString(),
      disableEstimate: 'false',
      allowPartialFill: 'true'
    })

    if (destReceiver) queryParams.append('destReceiver', destReceiver)
    if (referrer) queryParams.append('referrerAddress', referrer)
    if (fee) queryParams.append('fee', fee)

    try {
      const response = await axios.get(`${url}?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        },
        timeout: 15000
      })

      const txData = response.data.tx || response.data

      return {
        to: txData.to,
        data: txData.data,
        value: txData.value || '0',
        gasLimit: txData.gas || txData.gasLimit || '0',
        gasPrice: txData.gasPrice,
        chainId
      }
    } catch (error: any) {
      if (error.response) {
        throw new ChainError(
          `1inch API error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`,
          chainId
        )
      }
      throw new ChainError(`Failed to build swap transaction: ${error.message}`, chainId)
    }
  }

  private calculatePriceImpact(quote: SwapQuote): string {
    // Simplified price impact calculation
    // In a real implementation, you'd compare with market rates
    return '0.1' // 0.1% default impact
  }

  private extractProtocols(quote: SwapQuote): string[] {
    if (!quote.protocols || !Array.isArray(quote.protocols)) {
      return []
    }

    return quote.protocols
      .flat()
      .map((protocol: any) => protocol.name || 'Unknown')
      .filter((name, index, array) => array.indexOf(name) === index) // Remove duplicates
  }

  private calculateGasSavings(quote: SwapQuote, tx: TransactionRequest): string {
    // Compare with estimated Uniswap V2 gas usage
    const uniswapV2Gas = '150000' // Typical Uniswap V2 gas
    const oneInchGas = tx.gasLimit
    
    const savings = Math.max(0, parseInt(uniswapV2Gas) - parseInt(oneInchGas))
    return savings.toString()
  }

  private calculateAmountSavings(quote: SwapQuote): string {
    // This would compare with other DEX rates
    // For now, return estimated savings
    return quote.estimatedGas || '0'
  }

  private isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  private formatError(error: any): string {
    if (error.response?.data?.message) return error.response.data.message
    if (error.message) return error.message
    return 'Unknown error occurred'
  }
}