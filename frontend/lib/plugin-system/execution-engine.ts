/**
 * Generic Execution Engine with Automatic Bridging
 * Executes any component type without 1:1 frontend/backend coupling
 */

import { ComponentTemplate, ExecutorDefinition, ComponentBehavior } from './types'
import { pluginRegistry } from './plugin-registry'
import { connectionValidator } from './connection-validator'

export interface ExecutionContext {
  workflowId: string
  executionId: string
  nodeId: string
  userId?: string
  environment: 'development' | 'staging' | 'production'
  variables: Map<string, any>
  secrets: Map<string, string>
  services: Map<string, any>
  cache: Map<string, any>
  events: EventEmitter
  logger: Logger
  config: ExecutionConfig
}

export interface ExecutionConfig {
  timeout: number
  retries: number
  enableCaching: boolean
  enableLogging: boolean
  enableProfiling: boolean
  sandboxed: boolean
  resourceLimits: ResourceLimits
  permissions: Permission[]
}

export interface ResourceLimits {
  memory: number // MB
  cpu: number // CPU units
  network: number // requests per second
  storage: number // MB
  duration: number // seconds
}

export interface Permission {
  type: 'network' | 'filesystem' | 'blockchain' | 'api' | 'storage'
  scope: string[]
  readOnly?: boolean
}

export interface ExecutionResult {
  success: boolean
  outputs: Record<string, any>
  error?: ExecutionError
  warnings: string[]
  logs: LogEntry[]
  metrics: ExecutionMetrics
  artifacts?: Artifact[]
}

export interface ExecutionError {
  type: 'validation' | 'runtime' | 'timeout' | 'permission' | 'resource'
  message: string
  details?: any
  stack?: string
  nodeId?: string
  code?: string
}

export interface ExecutionMetrics {
  duration: number
  memoryUsed: number
  cpuTime: number
  networkRequests: number
  cacheHits: number
  cacheMisses: number
}

export interface LogEntry {
  timestamp: number
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  data?: any
  nodeId?: string
}

export interface Artifact {
  id: string
  type: 'file' | 'image' | 'data' | 'report'
  name: string
  url?: string
  data?: any
  metadata: Record<string, any>
}

// Generic executor interface
export interface GenericExecutor {
  id: string
  name: string
  version: string
  supportedTypes: string[]
  
  execute(
    template: ComponentTemplate,
    inputs: Record<string, any>,
    config: Record<string, any>,
    context: ExecutionContext
  ): Promise<ExecutionResult>
  
  validate(
    template: ComponentTemplate,
    inputs: Record<string, any>,
    config: Record<string, any>
  ): Promise<ValidationResult>
  
  estimateResources(
    template: ComponentTemplate,
    inputs: Record<string, any>,
    config: Record<string, any>
  ): Promise<ResourceEstimate>
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export interface ResourceEstimate {
  memory: number
  cpu: number
  duration: number
  networkRequests: number
}

// Main execution engine
export class GenericExecutionEngine {
  private static instance: GenericExecutionEngine
  private executors = new Map<string, GenericExecutor>()
  private runningExecutions = new Map<string, ExecutionInstance>()
  private eventBus = new EventEmitter()
  private codeInterpreter: CodeInterpreter
  private bridgeManager: BridgeManager

  static getInstance(): GenericExecutionEngine {
    if (!GenericExecutionEngine.instance) {
      GenericExecutionEngine.instance = new GenericExecutionEngine()
    }
    return GenericExecutionEngine.instance
  }

  constructor() {
    this.codeInterpreter = new CodeInterpreter()
    this.bridgeManager = new BridgeManager()
    this.initializeBuiltInExecutors()
  }

  // Execute any component
  async executeComponent(
    componentId: string,
    inputs: Record<string, any>,
    config: Record<string, any>,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    const startTime = Date.now()
    const executionId = context.executionId

    try {
      // Get component definition
      const component = pluginRegistry.getComponent(componentId)
      if (!component) {
        throw new ExecutionError('validation', `Component ${componentId} not found`)
      }

      // Validate inputs
      const validation = await this.validateExecution(component.template, inputs, config)
      if (!validation.valid) {
        throw new ExecutionError('validation', `Validation failed: ${validation.errors.join(', ')}`)
      }

      // Transform inputs if needed
      const transformedInputs = await this.transformInputs(component.template, inputs, context)

      // Select appropriate executor
      const executor = await this.selectExecutor(component.template)

      // Create execution instance
      const instance = new ExecutionInstance(
        executionId,
        component.template,
        executor,
        context
      )
      this.runningExecutions.set(executionId, instance)

      // Execute with monitoring
      const result = await this.executeWithMonitoring(
        instance,
        transformedInputs,
        config,
        context
      )

      // Clean up
      this.runningExecutions.delete(executionId)

      // Transform outputs
      const transformedOutputs = await this.transformOutputs(
        component.template,
        result.outputs,
        context
      )

      return {
        ...result,
        outputs: transformedOutputs,
        metrics: {
          ...result.metrics,
          duration: Date.now() - startTime
        }
      }

    } catch (error) {
      this.runningExecutions.delete(executionId)
      
      return {
        success: false,
        outputs: {},
        error: error instanceof ExecutionError ? error : new ExecutionError(
          'runtime',
          error.message,
          error
        ),
        warnings: [],
        logs: [],
        metrics: {
          duration: Date.now() - startTime,
          memoryUsed: 0,
          cpuTime: 0,
          networkRequests: 0,
          cacheHits: 0,
          cacheMisses: 0
        }
      }
    }
  }

  // Automatic executor selection
  private async selectExecutor(template: ComponentTemplate): Promise<GenericExecutor> {
    // Check if component has specific executor definition
    if (template.metadata.executorId) {
      const executor = this.executors.get(template.metadata.executorId)
      if (executor) return executor
    }

    // Select by component category/type
    const categoryExecutor = this.executors.get(`${template.category}-executor`)
    if (categoryExecutor) return categoryExecutor

    // Use JavaScript executor for code-based components
    if (template.behavior.execution.type === 'sync' || template.behavior.execution.type === 'async') {
      return this.executors.get('javascript-executor')!
    }

    // Use streaming executor for streaming components
    if (template.behavior.execution.type === 'streaming') {
      return this.executors.get('streaming-executor')!
    }

    // Fallback to generic executor
    return this.executors.get('generic-executor')!
  }

  // Input/Output transformation pipeline
  private async transformInputs(
    template: ComponentTemplate,
    inputs: Record<string, any>,
    context: ExecutionContext
  ): Promise<Record<string, any>> {
    const transformed: Record<string, any> = {}

    for (const inputDef of template.inputs) {
      let value = inputs[inputDef.id]

      // Apply transformations
      if (inputDef.transformation) {
        for (const transformer of inputDef.transformation) {
          try {
            value = await transformer.transform(value)
          } catch (error) {
            context.logger.warn(`Failed to transform input ${inputDef.id}: ${error.message}`)
          }
        }
      }

      // Apply default values
      if (value === undefined && inputDef.defaultValue !== undefined) {
        value = inputDef.defaultValue
      }

      transformed[inputDef.id] = value
    }

    return transformed
  }

  private async transformOutputs(
    template: ComponentTemplate,
    outputs: Record<string, any>,
    context: ExecutionContext
  ): Promise<Record<string, any>> {
    const transformed: Record<string, any> = {}

    for (const outputDef of template.outputs) {
      let value = outputs[outputDef.id]

      // Apply transformations
      if (outputDef.transformation) {
        for (const transformer of outputDef.transformation) {
          try {
            value = await transformer.transform(value)
          } catch (error) {
            context.logger.warn(`Failed to transform output ${outputDef.id}: ${error.message}`)
          }
        }
      }

      transformed[outputDef.id] = value
    }

    return transformed
  }

  // Validation
  private async validateExecution(
    template: ComponentTemplate,
    inputs: Record<string, any>,
    config: Record<string, any>
  ): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate required inputs
    for (const inputDef of template.inputs) {
      if (inputDef.required && !inputs.hasOwnProperty(inputDef.id)) {
        errors.push(`Required input '${inputDef.name}' is missing`)
      }

      // Validate input data types
      if (inputs[inputDef.id] !== undefined) {
        const validation = await this.validateDataType(
          inputs[inputDef.id],
          inputDef.dataType
        )
        if (!validation.valid) {
          errors.push(`Input '${inputDef.name}': ${validation.errors.join(', ')}`)
        }
        warnings.push(...validation.warnings)
      }
    }

    // Validate configuration
    for (const configField of template.configuration) {
      if (configField.required && !config.hasOwnProperty(configField.key)) {
        errors.push(`Required configuration '${configField.name}' is missing`)
      }

      // Run field validation rules
      if (config[configField.key] !== undefined && configField.validation) {
        for (const rule of configField.validation) {
          const result = await rule.validator(config[configField.key], {
            nodeId: 'validation',
            fieldKey: configField.key,
            allValues: config
          })
          if (!result.valid) {
            if (rule.severity === 'error') {
              errors.push(`Configuration '${configField.name}': ${result.errors?.join(', ')}`)
            } else if (rule.severity === 'warning') {
              warnings.push(`Configuration '${configField.name}': ${result.warnings?.join(', ')}`)
            }
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  private async validateDataType(value: any, typeId: string): Promise<ValidationResult> {
    // This would use the enhanced type system from types.ts
    // For now, simplified validation
    return { valid: true, errors: [], warnings: [] }
  }

  // Execution monitoring
  private async executeWithMonitoring(
    instance: ExecutionInstance,
    inputs: Record<string, any>,
    config: Record<string, any>,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    const monitor = new ExecutionMonitor(instance, context)
    
    try {
      monitor.start()
      
      const result = await instance.executor.execute(
        instance.template,
        inputs,
        config,
        context
      )
      
      monitor.success(result)
      return result
      
    } catch (error) {
      monitor.error(error)
      throw error
    } finally {
      monitor.stop()
    }
  }

  // Register executors
  registerExecutor(executor: GenericExecutor): void {
    this.executors.set(executor.id, executor)
    this.eventBus.emit('executor-registered', { executor })
  }

  unregisterExecutor(executorId: string): void {
    this.executors.delete(executorId)
    this.eventBus.emit('executor-unregistered', { executorId })
  }

  // Built-in executors
  private initializeBuiltInExecutors(): void {
    // JavaScript executor
    this.registerExecutor(new JavaScriptExecutor())
    
    // Python executor (if enabled)
    this.registerExecutor(new PythonExecutor())
    
    // DeFi-specific executor
    this.registerExecutor(new DeFiExecutor())
    
    // Generic executor (fallback)
    this.registerExecutor(new DefaultGenericExecutor())
  }

  // Execution management
  cancelExecution(executionId: string): boolean {
    const instance = this.runningExecutions.get(executionId)
    if (instance) {
      instance.cancel()
      this.runningExecutions.delete(executionId)
      return true
    }
    return false
  }

  getRunningExecutions(): string[] {
    return Array.from(this.runningExecutions.keys())
  }

  // Event handling
  on(event: string, listener: Function): void {
    this.eventBus.on(event, listener)
  }

  off(event: string, listener: Function): void {
    this.eventBus.off(event, listener)
  }
}

// Execution instance
class ExecutionInstance {
  private cancelled = false
  
  constructor(
    public readonly id: string,
    public readonly template: ComponentTemplate,
    public readonly executor: GenericExecutor,
    public readonly context: ExecutionContext
  ) {}
  
  cancel(): void {
    this.cancelled = true
  }
  
  isCancelled(): boolean {
    return this.cancelled
  }
}

// Execution monitoring
class ExecutionMonitor {
  private startTime: number = 0
  private memoryUsage: number = 0
  
  constructor(
    private instance: ExecutionInstance,
    private context: ExecutionContext
  ) {}
  
  start(): void {
    this.startTime = Date.now()
    this.memoryUsage = this.getCurrentMemoryUsage()
  }
  
  success(result: ExecutionResult): void {
    this.context.logger.info(`Execution ${this.instance.id} completed successfully`)
  }
  
  error(error: any): void {
    this.context.logger.error(`Execution ${this.instance.id} failed: ${error.message}`)
  }
  
  stop(): void {
    const duration = Date.now() - this.startTime
    const memoryDelta = this.getCurrentMemoryUsage() - this.memoryUsage
    
    this.context.logger.info(`Execution ${this.instance.id} finished in ${duration}ms, memory delta: ${memoryDelta}MB`)
  }
  
  private getCurrentMemoryUsage(): number {
    // Would implement actual memory tracking
    return 0
  }
}

// Built-in executors
class JavaScriptExecutor implements GenericExecutor {
  id = 'javascript-executor'
  name = 'JavaScript Executor'
  version = '1.0.0'
  supportedTypes = ['javascript', 'expression', 'formula']

  async execute(
    template: ComponentTemplate,
    inputs: Record<string, any>,
    config: Record<string, any>,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    // Execute JavaScript code from the component
    const code = this.extractCode(template, config)
    
    if (!code) {
      throw new ExecutionError('runtime', 'No executable code found in component')
    }

    return await context.services.get('codeInterpreter').execute(code, {
      inputs,
      config,
      context: {
        nodeId: context.nodeId,
        workflowId: context.workflowId
      }
    })
  }

  async validate(
    template: ComponentTemplate,
    inputs: Record<string, any>,
    config: Record<string, any>
  ): Promise<ValidationResult> {
    return { valid: true, errors: [], warnings: [] }
  }

  async estimateResources(
    template: ComponentTemplate,
    inputs: Record<string, any>,
    config: Record<string, any>
  ): Promise<ResourceEstimate> {
    return {
      memory: 10, // MB
      cpu: 0.1, // CPU units
      duration: 1000, // ms
      networkRequests: 0
    }
  }

  private extractCode(template: ComponentTemplate, config: Record<string, any>): string | null {
    // Extract code from various sources
    if (config.code) return config.code
    if (template.behavior.lifecycle.transform) return template.behavior.lifecycle.transform
    
    // Look for code fields in configuration
    for (const field of template.configuration) {
      if (field.type === 'code' || field.type === 'script') {
        return config[field.key]
      }
    }
    
    return null
  }
}

class PythonExecutor implements GenericExecutor {
  id = 'python-executor'
  name = 'Python Executor'
  version = '1.0.0'
  supportedTypes = ['python']

  async execute(
    template: ComponentTemplate,
    inputs: Record<string, any>,
    config: Record<string, any>,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    // Execute Python code (requires backend service)
    throw new ExecutionError('runtime', 'Python execution not implemented')
  }

  async validate(): Promise<ValidationResult> {
    return { valid: true, errors: [], warnings: [] }
  }

  async estimateResources(): Promise<ResourceEstimate> {
    return {
      memory: 50,
      cpu: 0.5,
      duration: 2000,
      networkRequests: 0
    }
  }
}

class DeFiExecutor implements GenericExecutor {
  id = 'defi-executor'
  name = 'DeFi Executor'
  version = '1.0.0'
  supportedTypes = ['swap', 'bridge', 'lending', 'governance']

  async execute(
    template: ComponentTemplate,
    inputs: Record<string, any>,
    config: Record<string, any>,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    // Execute DeFi-specific operations
    const category = template.category
    
    switch (category) {
      case 'swap':
        return await this.executeSwap(template, inputs, config, context)
      case 'bridge':
        return await this.executeBridge(template, inputs, config, context)
      default:
        throw new ExecutionError('runtime', `Unsupported DeFi operation: ${category}`)
    }
  }

  private async executeSwap(
    template: ComponentTemplate,
    inputs: Record<string, any>,
    config: Record<string, any>,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    // Implement swap logic
    return {
      success: true,
      outputs: {
        transactionHash: '0x123...',
        amountOut: '1000.5',
        gasUsed: '21000'
      },
      warnings: [],
      logs: [],
      metrics: {
        duration: 3000,
        memoryUsed: 5,
        cpuTime: 0.1,
        networkRequests: 3,
        cacheHits: 1,
        cacheMisses: 2
      }
    }
  }

  private async executeBridge(
    template: ComponentTemplate,
    inputs: Record<string, any>,
    config: Record<string, any>,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    // Implement bridge logic
    return {
      success: true,
      outputs: {},
      warnings: [],
      logs: [],
      metrics: {
        duration: 0,
        memoryUsed: 0,
        cpuTime: 0,
        networkRequests: 0,
        cacheHits: 0,
        cacheMisses: 0
      }
    }
  }

  async validate(): Promise<ValidationResult> {
    return { valid: true, errors: [], warnings: [] }
  }

  async estimateResources(): Promise<ResourceEstimate> {
    return {
      memory: 20,
      cpu: 0.2,
      duration: 5000,
      networkRequests: 3
    }
  }
}

class DefaultGenericExecutor implements GenericExecutor {
  id = 'generic-executor'
  name = 'Generic Executor'
  version = '1.0.0'
  supportedTypes = ['*']

  async execute(
    template: ComponentTemplate,
    inputs: Record<string, any>,
    config: Record<string, any>,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    // Generic execution - just pass through inputs as outputs
    return {
      success: true,
      outputs: { ...inputs },
      warnings: ['Using generic executor - no specific logic executed'],
      logs: [],
      metrics: {
        duration: 10,
        memoryUsed: 1,
        cpuTime: 0.001,
        networkRequests: 0,
        cacheHits: 0,
        cacheMisses: 0
      }
    }
  }

  async validate(): Promise<ValidationResult> {
    return { valid: true, errors: [], warnings: [] }
  }

  async estimateResources(): Promise<ResourceEstimate> {
    return {
      memory: 1,
      cpu: 0.001,
      duration: 10,
      networkRequests: 0
    }
  }
}

// Support classes (simplified implementations)
class EventEmitter {
  private listeners = new Map<string, Function[]>()
  
  on(event: string, listener: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(listener)
  }
  
  off(event: string, listener: Function): void {
    const list = this.listeners.get(event)
    if (list) {
      const index = list.indexOf(listener)
      if (index > -1) list.splice(index, 1)
    }
  }
  
  emit(event: string, data: any): void {
    const list = this.listeners.get(event)
    if (list) {
      list.forEach(listener => listener(data))
    }
  }
}

class Logger {
  debug(message: string, data?: any): void {
    console.log(`[DEBUG] ${message}`, data)
  }
  
  info(message: string, data?: any): void {
    console.log(`[INFO] ${message}`, data)
  }
  
  warn(message: string, data?: any): void {
    console.warn(`[WARN] ${message}`, data)
  }
  
  error(message: string, data?: any): void {
    console.error(`[ERROR] ${message}`, data)
  }
}

class CodeInterpreter {
  async execute(code: string, context: any): Promise<ExecutionResult> {
    // Simplified code execution
    try {
      const func = new Function('inputs', 'config', 'context', `
        ${code}
        return typeof result !== 'undefined' ? result : {};
      `)
      
      const result = func(context.inputs, context.config, context.context)
      
      return {
        success: true,
        outputs: typeof result === 'object' ? result : { result },
        warnings: [],
        logs: [],
        metrics: {
          duration: 100,
          memoryUsed: 1,
          cpuTime: 0.01,
          networkRequests: 0,
          cacheHits: 0,
          cacheMisses: 0
        }
      }
    } catch (error) {
      throw new ExecutionError('runtime', `Code execution failed: ${error.message}`)
    }
  }
}

class BridgeManager {
  // Handles communication between frontend and backend
}

// Global instance
export const executionEngine = GenericExecutionEngine.getInstance()