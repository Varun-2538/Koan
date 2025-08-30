/**
 * Unite DeFi Enhanced Plugin System
 * Main integration file that brings all systems together
 * 
 * This system transforms Unite DeFi into a Langflow-like platform while keeping predefined nodes
 */

export * from './types'
export * from './plugin-registry'
export * from './connection-validator'
export * from './execution-engine'
export * from './code-execution'
export * from './enhanced-templates'
export * from './versioning-migration'

import { pluginRegistry } from './plugin-registry'
import { connectionValidator } from './connection-validator'
import { executionEngine } from './execution-engine'
import { codeExecutionEngine } from './code-execution'
import { templateProcessor } from './enhanced-templates'
import { versionManager } from './versioning-migration'
import { enhancedNodeTemplates } from './enhanced-node-templates'

// Main plugin system orchestrator
export class UnitePluginSystem {
  private static instance: UnitePluginSystem
  private initialized = false

  // Public properties for system components
  public readonly registry = pluginRegistry
  public readonly executionEngine = executionEngine
  public readonly codeExecutionEngine = codeExecutionEngine
  public readonly connectionValidator = connectionValidator
  public readonly versionManager = versionManager
  public readonly templateProcessor = templateProcessor

  static getInstance(): UnitePluginSystem {
    if (!UnitePluginSystem.instance) {
      UnitePluginSystem.instance = new UnitePluginSystem()
    }
    return UnitePluginSystem.instance
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log('🚀 Initializing Unite DeFi Enhanced Plugin System...')

    // Initialize all subsystems
    await this.initializeBuiltInComponents()
    await this.initializeBuiltInTransformers()
    await this.initializeBuiltInExecutors()
    await this.initializeBuiltInMigrations()
    
    // Discover and load plugins
    await this.discoverPlugins()

    // Setup event listeners
    this.setupEventListeners()

    this.initialized = true
    console.log('✅ Unite DeFi Plugin System initialized successfully!')
  }

  private async initializeBuiltInComponents(): Promise<void> {
    console.log('📦 Loading built-in components...')

    const builtInComponents = [
      // DeFi Components
      {
        id: 'oneInchSwap',
        name: '1inch Swap',
        description: 'Execute token swaps using 1inch aggregator',
        category: 'DeFi',
        version: '1.0.0',
        template: {
          inputs: [
            { id: 'fromToken', name: 'From Token', dataType: 'token', required: true },
            { id: 'toToken', name: 'To Token', dataType: 'token', required: true },
            { id: 'amount', name: 'Amount', dataType: 'number', required: true },
            { id: 'slippage', name: 'Slippage %', dataType: 'number', required: false }
          ],
          outputs: [
            { id: 'transactionHash', name: 'Transaction Hash', dataType: 'string' },
            { id: 'amountOut', name: 'Amount Received', dataType: 'number' },
            { id: 'gasUsed', name: 'Gas Used', dataType: 'number' }
          ],
          configuration: [
            {
              key: 'apiKey',
              name: '1inch API Key',
              type: 'text',
              required: true,
              sensitive: true,
              ui: { placeholder: 'Enter your 1inch API key' }
            },
            {
              key: 'enableFusion',
              name: 'Enable Fusion Mode',
              type: 'boolean',
              defaultValue: true,
              ui: { helpText: 'Use gasless swaps with MEV protection' }
            },
            {
              key: 'customScript',
              name: 'Custom Logic Script',
              type: 'code',
              required: false,
              ui: { 
                helpText: 'Optional JavaScript code for custom swap logic',
                widget: { type: 'code-editor', props: { language: 'javascript' } }
              }
            }
          ]
        },
        executor: {
          type: 'javascript',
          code: `
            // Built-in 1inch swap execution logic
            async function execute(inputs, config, context) {
              const { fromToken, toToken, amount, slippage = 1.0 } = inputs;
              const { apiKey, enableFusion, customScript } = config;
              
              // Execute custom script if provided
              if (customScript) {
                const customResult = await context.services.codeExecution.execute(customScript, {
                  inputs, config, context
                });
                if (customResult.success && customResult.outputs.override) {
                  return customResult.outputs;
                }
              }
              
              // Default 1inch swap logic
              const quote = await context.services.defi.get1inchQuote({
                fromToken: fromToken.address,
                toToken: toToken.address,
                amount,
                slippage
              });
              
              const transaction = await context.services.defi.execute1inchSwap(quote, {
                enableFusion,
                apiKey
              });
              
              return {
                transactionHash: transaction.hash,
                amountOut: quote.toAmount,
                gasUsed: transaction.gasUsed
              };
            }
          `
        }
      },

      // Data Processing Components  
      {
        id: 'dataProcessor',
        name: 'Data Processor',
        description: 'Transform and manipulate data with JavaScript expressions',
        category: 'Data',
        version: '1.0.0',
        template: {
          inputs: [
            { id: 'data', name: 'Input Data', dataType: 'any', required: true }
          ],
          outputs: [
            { id: 'result', name: 'Processed Data', dataType: 'any' }
          ],
          configuration: [
            {
              key: 'operation',
              name: 'Operation Type',
              type: 'select',
              required: true,
              options: [
                { label: 'Format Number', value: 'formatNumber' },
                { label: 'Parse JSON', value: 'parseJson' },
                { label: 'Custom Expression', value: 'custom' }
              ]
            },
            {
              key: 'expression',
              name: 'Custom Expression',
              type: 'code',
              conditional: { field: 'operation', operator: 'equals', value: 'custom' },
              ui: { 
                helpText: 'JavaScript expression to process data. Use "input" variable.',
                placeholder: 'return input * 2;'
              }
            },
            {
              key: 'decimals',
              name: 'Decimal Places',
              type: 'number',
              conditional: { field: 'operation', operator: 'equals', value: 'formatNumber' },
              defaultValue: 2,
              constraints: [{ type: 'min', value: 0 }, { type: 'max', value: 18 }]
            }
          ]
        },
        executor: {
          type: 'javascript',
          code: `
            async function execute(inputs, config, context) {
              const { data } = inputs;
              const { operation, expression, decimals } = config;
              
              let result = data;
              
              switch (operation) {
                case 'formatNumber':
                  result = parseFloat(data).toFixed(decimals || 2);
                  break;
                case 'parseJson':
                  result = JSON.parse(data);
                  break;
                case 'custom':
                  result = await context.services.codeExecution.execute(expression, {
                    input: data,
                    config,
                    context
                  });
                  break;
              }
              
              return { result };
            }
          `
        }
      },

      // Conditional Logic
      {
        id: 'conditionalLogic',
        name: 'Conditional Logic',
        description: 'Execute different paths based on conditions',
        category: 'Logic',
        version: '1.0.0',
        template: {
          inputs: [
            { id: 'input', name: 'Input Value', dataType: 'any', required: true },
            { id: 'reference', name: 'Reference Value', dataType: 'any', required: false }
          ],
          outputs: [
            { id: 'true', name: 'True Path', dataType: 'execution' },
            { id: 'false', name: 'False Path', dataType: 'execution' },
            { id: 'value', name: 'Original Value', dataType: 'any' }
          ],
          configuration: [
            {
              key: 'conditionType',
              name: 'Condition Type',
              type: 'select',
              required: true,
              options: [
                { label: 'Greater Than (>)', value: 'gt' },
                { label: 'Less Than (<)', value: 'lt' },
                { label: 'Equal To (=)', value: 'eq' },
                { label: 'Contains Text', value: 'contains' },
                { label: 'Custom Expression', value: 'custom' }
              ]
            },
            {
              key: 'threshold',
              name: 'Threshold Value',
              type: 'number',
              conditional: { 
                field: 'conditionType', 
                operator: 'in', 
                values: ['gt', 'lt', 'eq'] 
              }
            },
            {
              key: 'customCondition',
              name: 'Custom Condition',
              type: 'code',
              conditional: { field: 'conditionType', operator: 'equals', value: 'custom' },
              ui: { 
                helpText: 'JavaScript expression returning true/false. Use "input" and "reference" variables.',
                placeholder: 'return input > reference;'
              }
            }
          ]
        },
        executor: {
          type: 'javascript',
          code: `
            async function execute(inputs, config, context) {
              const { input, reference } = inputs;
              const { conditionType, threshold, customCondition } = config;
              
              let result = false;
              
              switch (conditionType) {
                case 'gt':
                  result = parseFloat(input) > parseFloat(threshold);
                  break;
                case 'lt':
                  result = parseFloat(input) < parseFloat(threshold);
                  break;
                case 'eq':
                  result = input == threshold;
                  break;
                case 'contains':
                  result = String(input).includes(String(reference));
                  break;
                case 'custom':
                  const customResult = await context.services.codeExecution.execute(customCondition, {
                    input, reference, config, context
                  });
                  result = !!customResult.result;
                  break;
              }
              
              return { 
                value: input,
                result: result,
                [result ? 'true' : 'false']: true 
              };
            }
          `
        }
      }
    ]

    // Register all built-in components
    for (const component of builtInComponents) {
      await pluginRegistry.registerPlugin({
        id: `builtin-${component.id}`,
        name: component.name,
        version: component.version,
        author: 'Unite DeFi Team',
        description: component.description,
        components: [component as any],
        permissions: [],
        compatibility: { minVersion: '1.0.0' },
        tags: [component.category.toLowerCase()]
      })
    }

    console.log(`✅ Loaded ${builtInComponents.length} built-in components`)

    // Register enhanced node templates as components
    await this.registerEnhancedNodeTemplates()
  }

  private async registerEnhancedNodeTemplates(): Promise<void> {
    console.log('📋 Registering enhanced node templates...')

    for (const [templateId, template] of Object.entries(enhancedNodeTemplates)) {
      // Convert template to component definition
      const component: any = {
        id: templateId,
        name: template.name,
        description: template.description,
        category: template.category,
        version: '1.0.0',
        template: template,
        executor: {
          type: 'javascript',
          code: this.generateDefaultExecutorCode(templateId, template)
        }
      }

      // Register as built-in component
      await pluginRegistry.registerPlugin({
        id: `enhanced-${templateId}`,
        name: template.name,
        version: '1.0.0',
        author: 'Unite DeFi Team',
        description: template.description,
        components: [component],
        permissions: [],
        compatibility: { minVersion: '1.0.0' },
        tags: [template.category.toLowerCase()]
      })

      console.log(`✅ Registered template: ${template.name}`)
    }

    console.log(`✅ Registered ${Object.keys(enhancedNodeTemplates).length} enhanced node templates`)
  }

  private generateDefaultExecutorCode(templateId: string, template: any): string {
    // Generate basic executor code based on template type
    switch (templateId) {
      case 'walletConnector':
        return `
          async function execute(inputs, config, context) {
            const { walletType = 'metamask', autoConnect = true } = config;

            // Simulate wallet connection for demo purposes
            const mockAddress = '0x' + Math.random().toString(16).substr(2, 40);
            const mockChainId = 1; // Ethereum mainnet

            return {
              address: mockAddress,
              chainId: mockChainId,
              provider: { type: walletType, connected: true }
            };
          }
        `;

      case 'oneInchSwap':
        return `
          async function execute(inputs, config, context) {
            const { fromToken, toToken, amount, slippage = 1.0 } = inputs;
            const { apiKey, enableFusion = true } = config;

            // Mock swap execution for demo
            const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);
            const mockOutputAmount = amount * 0.99; // 1% slippage simulation

            return {
              transactionHash: mockTxHash,
              outputAmount: mockOutputAmount,
              gasUsed: 21000
            };
          }
        `;

      default:
        return `
          async function execute(inputs, config, context) {
            // Default executor - just pass through inputs
            return { ...inputs, executed: true, timestamp: Date.now() };
          }
        `;
    }
  }

  private async initializeBuiltInTransformers(): Promise<void> {
    console.log('🔄 Initializing data transformers...')

    const transformers = [
      {
        id: 'string_to_number',
        name: 'String to Number',
        fromType: 'string',
        toType: 'number',
        transform: (value: string) => parseFloat(value) || 0
      },
      {
        id: 'number_to_string',
        name: 'Number to String',
        fromType: 'number',
        toType: 'string',
        transform: (value: number) => value.toString()
      },
      {
        id: 'object_to_json',
        name: 'Object to JSON',
        fromType: 'object',
        toType: 'string',
        transform: (value: any) => JSON.stringify(value)
      },
      {
        id: 'json_to_object',
        name: 'JSON to Object',
        fromType: 'string',
        toType: 'object',
        transform: (value: string) => {
          try {
            return JSON.parse(value)
          } catch {
            return {}
          }
        }
      },
      {
        id: 'token_to_address',
        name: 'Extract Token Address',
        fromType: 'token',
        toType: 'address',
        transform: (value: any) => value.address || value
      }
    ]

    transformers.forEach(transformer => {
      connectionValidator.registerTransformer(transformer as any)
    })

    console.log(`✅ Registered ${transformers.length} data transformers`)
  }

  private async initializeBuiltInExecutors(): Promise<void> {
    console.log('⚡ Initializing executors...')
    // Executors are initialized in the execution engine
    console.log('✅ Built-in executors ready')
  }

  private async initializeBuiltInMigrations(): Promise<void> {
    console.log('🔄 Initializing migrations...')
    
    // Register common migrations
    const migrations = [
      {
        id: 'v1_to_v2_config_update',
        fromVersion: '1.0.0',
        toVersion: '2.0.0',
        type: 'automatic',
        description: 'Update configuration format',
        breaking: false,
        steps: [{
          id: 'update_config_format',
          description: 'Update configuration to new format',
          type: 'config',
          transformer: {
            transform: async (data: any) => ({
              success: true,
              data: { ...data, version: '2.0.0' },
              warnings: [],
              errors: [],
              manualStepsRequired: []
            })
          }
        }]
      }
    ]

    migrations.forEach(migration => {
      versionManager.registerMigration(migration as any)
    })

    console.log(`✅ Registered ${migrations.length} migrations`)
  }

  private async discoverPlugins(): Promise<void> {
    console.log('🔍 Discovering plugins...')
    
    try {
      const discovered = await pluginRegistry.discoverPlugins()
      console.log(`📦 Found ${discovered.length} available plugins`)
      
      // Auto-load essential plugins
      for (const plugin of discovered) {
        if (plugin.tags?.includes('essential') || plugin.tags?.includes('core')) {
          await pluginRegistry.registerPlugin(plugin)
          console.log(`✅ Auto-loaded essential plugin: ${plugin.name}`)
        }
      }
    } catch (error) {
      console.warn('⚠️  Plugin discovery failed:', error)
    }
  }

  private setupEventListeners(): void {
    console.log('👂 Setting up event listeners...')

    // Plugin lifecycle events
    pluginRegistry.on('plugin-registered', (event) => {
      console.log(`📦 Plugin registered: ${event.plugin.name}`)
    })

    pluginRegistry.on('plugin-unregistered', (event) => {
      console.log(`🗑️  Plugin unregistered: ${event.pluginId}`)
    })

    // Execution events  
    executionEngine.on('execution-started', (event) => {
      console.log(`🚀 Execution started: ${event.executionId}`)
    })

    executionEngine.on('execution-completed', (event) => {
      console.log(`✅ Execution completed: ${event.executionId}`)
    })

    executionEngine.on('execution-failed', (event) => {
      console.error(`❌ Execution failed: ${event.executionId}`, event.error)
    })

    console.log('✅ Event listeners configured')
  }

  // Public API methods
  async executeComponent(
    componentId: string,
    inputs: Record<string, any> = {},
    config: Record<string, any> = {},
    context: any = {}
  ): Promise<any> {
    console.log(`🎯 Executing component: ${componentId}`)

    try {
      // Get component definition
      const component = pluginRegistry.getComponent(componentId)
      if (!component) {
        throw new Error(`Component not found: ${componentId}`)
      }

      // Execute component using the execution engine
      const result = await executionEngine.executeComponent(
        componentId,
        inputs,
        config,
        {
          workflowId: context.workflowId || 'single-execution',
          executionId: context.executionId || `exec_${Date.now()}`,
          nodeId: context.nodeId || componentId,
          environment: context.environment || 'development',
          variables: new Map(),
          secrets: new Map(),
          services: new Map(),
          cache: new Map(),
          events: new (EventTarget as any)(),
          logger: console,
          config: {
            timeout: 30000,
            retries: 3,
            enableCaching: true,
            enableLogging: true,
            enableProfiling: false,
            sandboxed: true,
            resourceLimits: {
              memory: 128,
              cpu: 1,
              network: 100,
              storage: 256,
              duration: 30
            },
            permissions: []
          }
        }
      )

      return result
    } catch (error) {
      console.error(`❌ Component execution failed:`, error)
      throw error
    }
  }

  async executeWorkflow(
    workflowDefinition: any,
    inputs: Record<string, any> = {},
    options: ExecutionOptions = {}
  ): Promise<WorkflowExecutionResult> {
    console.log(`🎯 Executing workflow: ${workflowDefinition.name || 'Unnamed'}`)

    const startTime = Date.now()
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    try {
      // Validate workflow
      const validation = await this.validateWorkflow(workflowDefinition)
      if (!validation.valid) {
        throw new Error(`Workflow validation failed: ${validation.errors.join(', ')}`)
      }

      // Execute nodes in topological order
      const executionOrder = this.getExecutionOrder(workflowDefinition)
      const results = new Map<string, any>()
      const nodeResults: NodeExecutionResult[] = []

      for (const nodeId of executionOrder) {
        const node = workflowDefinition.nodes.find((n: any) => n.id === nodeId)
        if (!node) continue

        // Prepare node inputs from previous results and workflow inputs
        const nodeInputs = this.prepareNodeInputs(node, results, inputs, workflowDefinition.connections)

        // Execute node
        const nodeResult = await executionEngine.executeComponent(
          node.type,
          nodeInputs,
          node.config || {},
          {
            workflowId: workflowDefinition.id,
            executionId,
            nodeId: node.id,
            environment: options.environment || 'development',
            variables: new Map(),
            secrets: new Map(),
            services: new Map(),
            cache: new Map(),
            events: new (EventTarget as any)(),
            logger: console,
            config: {
              timeout: 30000,
              retries: 3,
              enableCaching: true,
              enableLogging: true,
              enableProfiling: false,
              sandboxed: true,
              resourceLimits: {
                memory: 128,
                cpu: 1,
                network: 100,
                storage: 256,
                duration: 30
              },
              permissions: []
            }
          }
        )

        results.set(nodeId, nodeResult.outputs)
        nodeResults.push({
          nodeId,
          nodeType: node.type,
          success: nodeResult.success,
          outputs: nodeResult.outputs,
          error: nodeResult.error?.message,
          duration: nodeResult.metrics?.duration || 0
        })

        if (!nodeResult.success && options.failFast !== false) {
          throw new Error(`Node ${nodeId} failed: ${nodeResult.error?.message}`)
        }
      }

      return {
        success: true,
        executionId,
        duration: Date.now() - startTime,
        results: Object.fromEntries(results),
        nodeResults,
        errors: [],
        warnings: []
      }

    } catch (error) {
      console.error(`❌ Workflow execution failed:`, error)
      
      return {
        success: false,
        executionId,
        duration: Date.now() - startTime,
        results: {},
        nodeResults: [],
        errors: [error.message],
        warnings: []
      }
    }
  }

  async generateCode(
    workflowDefinition: any,
    options: CodeGenerationOptions = {}
  ): Promise<GeneratedCodeRepository> {
    console.log(`🔨 Generating code for workflow: ${workflowDefinition.name}`)

    const nodeConfigs = workflowDefinition.nodes.map((node: any) => ({
      id: node.id,
      type: node.type,
      config: node.config || {},
      script: node.script,
      inputs: [], // Would be populated from component definitions
      outputs: []
    }))

    const connections = workflowDefinition.connections || []

    return await codeExecutionEngine.generateModularCode(
      nodeConfigs,
      connections,
      {
        language: 'typescript',
        description: workflowDefinition.description,
        includeTests: options.includeTests !== false,
        includeDocumentation: options.includeDocumentation !== false,
        optimizeForProduction: options.optimizeForProduction === true
      }
    )
  }

  private async validateWorkflow(workflow: any): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // Basic structure validation
    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      errors.push('Workflow must have a nodes array')
    }

    if (!workflow.connections || !Array.isArray(workflow.connections)) {
      warnings.push('Workflow has no connections defined')
    }

    // Validate nodes
    for (const node of workflow.nodes || []) {
      if (!node.id) errors.push(`Node missing ID: ${JSON.stringify(node)}`)
      if (!node.type) errors.push(`Node ${node.id} missing type`)
      
      const component = pluginRegistry.getComponent(node.type)
      if (!component) {
        errors.push(`Unknown component type: ${node.type}`)
      }
    }

    // Validate connections
    for (const connection of workflow.connections || []) {
      const sourceNode = workflow.nodes.find((n: any) => n.id === connection.source)
      const targetNode = workflow.nodes.find((n: any) => n.id === connection.target)
      
      if (!sourceNode) errors.push(`Connection references unknown source node: ${connection.source}`)
      if (!targetNode) errors.push(`Connection references unknown target node: ${connection.target}`)
      
      if (sourceNode && targetNode) {
        const canConnect = await connectionValidator.canConnect(
          connection.sourceHandle || 'output',
          connection.targetHandle || 'input'
        )
        
        if (!canConnect) {
          warnings.push(`Potentially invalid connection: ${connection.source} → ${connection.target}`)
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    }
  }

  private getExecutionOrder(workflow: any): string[] {
    // Implement topological sort for execution order
    const nodes = workflow.nodes.map((n: any) => n.id)
    const connections = workflow.connections || []
    
    // For now, return nodes in original order
    // In production, implement proper topological sort
    return nodes
  }

  private prepareNodeInputs(
    node: any,
    results: Map<string, any>,
    workflowInputs: Record<string, any>,
    connections: any[]
  ): Record<string, any> {
    const inputs: Record<string, any> = { ...workflowInputs }
    
    // Add inputs from connected nodes
    const nodeConnections = connections.filter((c: any) => c.target === node.id)
    
    for (const connection of nodeConnections) {
      const sourceResult = results.get(connection.source)
      if (sourceResult) {
        const outputKey = connection.sourceHandle || 'output'
        const inputKey = connection.targetHandle || 'input'
        inputs[inputKey] = sourceResult[outputKey]
      }
    }
    
    return inputs
  }

  // System status and health checks
  getSystemStatus(): SystemStatus {
    return {
      initialized: this.initialized,
      components: pluginRegistry.getComponents().length,
      plugins: Array.from((pluginRegistry as any).plugins.size || 0),
      executors: Array.from((executionEngine as any).executors.size || 0),
      transformers: Array.from((connectionValidator as any).transformers.size || 0),
      uptime: Date.now() - (this as any).initTime || 0
    }
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const checks: HealthCheck[] = []

    // Check plugin registry
    try {
      const components = pluginRegistry.getComponents()
      checks.push({
        name: 'Plugin Registry',
        status: 'healthy',
        message: `${components.length} components loaded`
      })
    } catch (error) {
      checks.push({
        name: 'Plugin Registry',
        status: 'unhealthy',
        message: error.message
      })
    }

    // Check execution engine
    try {
      const runningExecutions = executionEngine.getRunningExecutions()
      checks.push({
        name: 'Execution Engine',
        status: 'healthy',
        message: `${runningExecutions.length} executions running`
      })
    } catch (error) {
      checks.push({
        name: 'Execution Engine', 
        status: 'unhealthy',
        message: error.message
      })
    }

    const healthy = checks.every(check => check.status === 'healthy')

    return {
      status: healthy ? 'healthy' : 'unhealthy',
      checks,
      timestamp: new Date().toISOString()
    }
  }
}

// Export types and interfaces
export interface ExecutionOptions {
  environment?: 'development' | 'staging' | 'production'
  failFast?: boolean
  timeout?: number
}

export interface WorkflowExecutionResult {
  success: boolean
  executionId: string
  duration: number
  results: Record<string, any>
  nodeResults: NodeExecutionResult[]
  errors: string[]
  warnings: string[]
}

export interface NodeExecutionResult {
  nodeId: string
  nodeType: string
  success: boolean
  outputs: Record<string, any>
  error?: string
  duration: number
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export interface CodeGenerationOptions {
  includeTests?: boolean
  includeDocumentation?: boolean
  optimizeForProduction?: boolean
}

export interface GeneratedCodeRepository {
  language: string
  modules: Map<string, any>
  dependencies: Set<string>
  entryPoint: string
  metadata: any
}

export interface SystemStatus {
  initialized: boolean
  components: number
  plugins: number
  executors: number
  transformers: number
  uptime: number
}

export interface HealthCheck {
  name: string
  status: 'healthy' | 'unhealthy' | 'warning'
  message: string
}

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy'
  checks: HealthCheck[]
  timestamp: string
}

// Global plugin system instance
export const unitePluginSystem = UnitePluginSystem.getInstance()

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  // Browser environment - initialize after DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    unitePluginSystem.initialize().catch(console.error)
  })
} else {
  // Node.js environment - initialize immediately
  unitePluginSystem.initialize().catch(console.error)
}