"use client"

// Unite Plugin System - Complete Runtime Component Management
import { pluginRegistry } from './plugin-system/plugin-registry'
import { genericExecutionEngine } from './plugin-system/generic-execution-engine'
import { codeExecutionEngine, expressionEvaluator } from './plugin-system/code-execution-engine'
import { enhancedNodeTemplates } from './plugin-system/enhanced-node-templates'
import type {
  PluginManifest,
  ComponentDefinition,
  ExecutionContext,
  ExecutionResult,
  WorkflowDefinition,
  ValidationResult,
  ExecutionError
} from './plugin-system/types'

class UnitePluginSystem {
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log('🔧 Initializing Unite Plugin System...')

    // Register built-in components
    await this.registerBuiltInComponents()

    // Load user plugins
    await this.loadUserPlugins()

    this.initialized = true
    console.log('✅ Plugin System initialized')
  }

  private async registerBuiltInComponents(): Promise<void> {
    // Register enhanced node templates as built-in components
    for (const [type, template] of Object.entries(enhancedNodeTemplates)) {
      const component: ComponentDefinition = {
        id: template.id || type,
        name: template.name,
        description: template.description,
        category: template.category,
        version: template.version || '1.0.0',
        author: 'Unite DeFi',
        tags: [template.category, 'builtin'],
        icon: template.icon,
        color: template.color,
        template: {
          inputs: template.inputs,
          outputs: template.outputs,
          configuration: template.configuration || template.fields || [],
          fields: template.configuration || template.fields || [], // Add for backward compatibility
          ui: {
            icon: template.icon,
            color: template.color,
            size: 'medium',
            shape: 'rectangle',
            showPorts: true,
            showConfig: true
          },
          documentation: {
            description: template.description,
            examples: [],
            parameters: (template.configuration || template.fields || []).map(f => ({
              name: f.key,
              type: f.type,
              description: f.description || '',
              required: f.required || false,
              defaultValue: f.defaultValue
            })),
            usage: `Use the ${template.name} component`,
            changelog: []
          }
        },
        execution: {
          runtime: 'javascript',
          code: this.generateExecutionCode(template),
          entryPoint: '',
          timeout: template.behavior?.timeout || 30000,
          memoryLimit: 128 * 1024 * 1024,
          environment: {},
          dependencies: template.dependencies || [],
          permissions: []
        },
        validation: {
          preExecution: [],
          postExecution: [],
          runtime: []
        },
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          author: template.metadata?.author || 'Unite DeFi',
          license: template.metadata?.license || 'MIT',
          keywords: template.metadata?.keywords || [template.category]
        },
        dependencies: template.dependencies || [],
        permissions: [],
        lifecycle: {}
      }

      await pluginRegistry.registerComponent(component)
    }
  }

  private generateExecutionCode(template: any): string {
    // Generate execution code based on component type
    switch (template.type) {
      case 'oneInchSwap':
        return `
          const result = {
            success: true,
            transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
            gasUsed: Math.floor(Math.random() * 200000) + 50000,
            outputAmount: (inputs.amount || 1) * 1800,
            priceImpact: Math.random() * 5,
            timestamp: new Date().toISOString()
          }
          return result
        `

      case 'conditionalLogic':
        return `
          const inputValue = inputs.input
          let result = false

          switch (config.conditionType) {
            case 'gt': result = inputValue > (config.threshold || 0); break
            case 'lt': result = inputValue < (config.threshold || 0); break
            case 'eq': result = inputValue === (config.threshold || 0); break
            case 'contains': result = String(inputValue).includes(config.textValue || ''); break
          }

          if (config.invertCondition) result = !result
          return { result, input: inputValue }
        `

      case 'dataProcessor':
        return `
          let result
          switch (config.operation) {
            case 'formatNumber': result = Number(inputs.data).toFixed(config.decimals || 2); break
            case 'parseJson': result = JSON.parse(inputs.data); break
            case 'extractField': result = inputs.data?.[config.fieldPath]; break
            default: result = inputs.data
          }
          return { result, originalData: inputs.data }
        `

      case 'dashboard':
        return `
          const dashboardData = inputs.data || {}
          return {
            result: 'Dashboard rendered successfully',
            data: dashboardData,
            layout: config.layout || 'grid',
            refreshInterval: config.refreshInterval || 30,
            timestamp: new Date().toISOString()
          }
        `

      case 'portfolioTracker':
        return `
          const mockPortfolio = {
            totalValue: Math.random() * 100000 + 10000,
            tokens: [
              { symbol: 'ETH', amount: Math.random() * 10, value: Math.random() * 30000 },
              { symbol: 'USDC', amount: Math.random() * 50000, value: Math.random() * 50000 }
            ],
            chains: config.chains || ['ethereum']
          }
          return {
            portfolio: mockPortfolio,
            totalValue: mockPortfolio.totalValue
          }
        `

      case 'tokenSelector':
        return `
          const selectedToken = {
            address: '0x0000000000000000000000000000000000000000',
            symbol: 'ETH',
            name: 'Ethereum',
            decimals: 18
          }
          return { selectedToken }
        `

      case 'chainSelector':
        return `
          const selectedChain = config.supportedChains?.[0] || '1'
          const chainNames = {
            '1': 'Ethereum Mainnet',
            '137': 'Polygon',
            '56': 'BSC',
            '42161': 'Arbitrum One',
            '10': 'Optimism'
          }
          return {
            chainId: parseInt(selectedChain),
            chainName: chainNames[selectedChain] || 'Unknown Chain'
          }
        `

      case 'transactionMonitor':
        return `
          return {
            status: Math.random() > 0.5 ? 'confirmed' : 'pending',
            receipt: {
              transactionHash: inputs.transactionHash,
              blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
              gasUsed: Math.floor(Math.random() * 200000) + 21000
            }
          }
        `

      case 'oneInchQuote':
        return `
          return {
            quote: {
              fromTokenAmount: inputs.amount,
              toTokenAmount: inputs.amount * (1800 + Math.random() * 200),
              protocols: ['UNISWAP_V3'],
              estimatedGas: Math.floor(Math.random() * 150000) + 50000
            },
            estimatedGas: Math.floor(Math.random() * 150000) + 50000
          }
        `

      case 'priceImpactCalculator':
        return `
          const tradeAmount = inputs.tradeAmount || 1000
          const liquidity = inputs.liquidity || 100000
          const priceImpact = (tradeAmount / liquidity) * 100
          const slippage = config.slippageTolerance || 1
          return {
            priceImpact: Math.min(priceImpact, 15), // Cap at 15%
            minimumReceived: tradeAmount * (1 - (priceImpact + slippage) / 100)
          }
        `

      case 'fusionPlus':
        return `
          return {
            bridgeTxHash: '0x' + Math.random().toString(16).substr(2, 64),
            estimatedTime: Math.floor(Math.random() * 600) + 180, // 3-13 minutes
            bridgeProtocol: config.bridgeProtocol || 'layerzero',
            fees: {
              bridgeFee: Math.random() * 10 + 5,
              gasFee: Math.random() * 20 + 10
            }
          }
        `

      case 'portfolioAPI':
        return `
          const mockTokens = [
            { symbol: 'ETH', balance: Math.random() * 10, price: 2400 + Math.random() * 200 },
            { symbol: 'USDC', balance: Math.random() * 5000, price: 1 },
            { symbol: 'WBTC', balance: Math.random() * 0.5, price: 45000 + Math.random() * 5000 }
          ]
          const totalValue = mockTokens.reduce((sum, token) => sum + (token.balance * token.price), 0)
          return {
            portfolioData: {
              tokens: mockTokens,
              chains: config.chains || ['ethereum'],
              lastUpdated: new Date().toISOString()
            },
            totalValue: totalValue
          }
        `

      case 'defiDashboard':
        return `
          return {
            dashboardState: {
              chartType: config.chartType || 'line',
              refreshInterval: config.refreshInterval || 30,
              showPnL: config.showPnL !== false,
              data: inputs.portfolioData || {},
              timestamp: new Date().toISOString()
            }
          }
        `

      default:
        return `
          return {
            result: inputs,
            config: config,
            timestamp: new Date().toISOString()
          }
        `
    }
  }

  private async loadUserPlugins(): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem('unite-user-plugins')
      if (stored) {
        const plugins: PluginManifest[] = JSON.parse(stored)
        for (const plugin of plugins) {
          await pluginRegistry.registerPlugin(plugin)
        }
      }
    } catch (error) {
      console.warn('Failed to load user plugins:', error)
    }
  }

  // Public API
  async executeWorkflow(workflow: WorkflowDefinition): Promise<ExecutionResult> {
    await this.initialize()
    return genericExecutionEngine.executeWorkflow(workflow)
  }

  async executeComponent(
    componentId: string,
    inputs: Record<string, any>,
    config: Record<string, any>,
    nodeId: string = 'temp',
    workflowId: string = 'temp'
  ): Promise<ExecutionResult> {
    await this.initialize()

    const component = pluginRegistry.getComponent(componentId)
    if (!component) {
      throw new Error(`Component not found: ${componentId}`)
    }

    const context: ExecutionContext = {
      nodeId,
      workflowId,
      inputs,
      config,
      environment: {},
      dependencies: {},
      permissions: []
    }

    return genericExecutionEngine.executeComponent(component, context)
  }

  async executeCode(
    code: string,
    inputs: Record<string, any>,
    config: Record<string, any>,
    nodeId: string = 'temp'
  ): Promise<ExecutionResult> {
    await this.initialize()

    const context: ExecutionContext = {
      nodeId,
      workflowId: 'temp',
      inputs,
      config,
      environment: {},
      dependencies: {},
      permissions: []
    }

    return codeExecutionEngine.executeCode(code, context)
  }

  evaluateExpression(expression: string, context: Record<string, any> = {}): any {
    return expressionEvaluator.evaluate(expression, context)
  }

  // Component Management
  getComponents(): ComponentDefinition[] {
    return pluginRegistry.getComponents()
  }

  getComponent(componentId: string): ComponentDefinition | null {
    return pluginRegistry.getComponent(componentId)
  }

  searchComponents(query: string): ComponentDefinition[] {
    return pluginRegistry.searchComponents(query)
  }

  getComponentsByCategory(category: string): ComponentDefinition[] {
    return pluginRegistry.getComponentsByCategory(category)
  }

  // Validation
  validateWorkflow(workflow: WorkflowDefinition): ValidationResult {
    return genericExecutionEngine.validateWorkflow(workflow)
  }

  // Plugin Management
  async registerPlugin(manifest: PluginManifest): Promise<void> {
    await pluginRegistry.registerPlugin(manifest)
    this.saveUserPlugins()
  }

  getPlugins() {
    return pluginRegistry.getPlugins()
  }

  private saveUserPlugins(): void {
    if (typeof window === 'undefined') return

    try {
      const userPlugins = pluginRegistry.getPlugins().filter(p => p.author !== 'Unite DeFi')
      localStorage.setItem('unite-user-plugins', JSON.stringify(userPlugins))
    } catch (error) {
      console.warn('Failed to save user plugins:', error)
    }
  }
}

// Export singleton instance
export const unitePluginSystem = new UnitePluginSystem()

// Export components for direct use
export { pluginRegistry, genericExecutionEngine, codeExecutionEngine, expressionEvaluator }
export { enhancedNodeTemplates }
