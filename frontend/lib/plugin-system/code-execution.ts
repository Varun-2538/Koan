/**
 * Runtime Code Execution System for Unite DeFi
 * Enables nodes to execute JavaScript/Python code with full modularity and code generation
 */

export interface CodeExecutionContext {
  nodeId: string
  workflowId: string
  inputs: Record<string, any>
  config: Record<string, any>
  globals: Record<string, any>
  imports: Record<string, any>
  services: ServiceRegistry
  storage: Storage
  logger: Logger
  security: SecurityManager
}

export interface CodeExecutionResult {
  success: boolean
  result: any
  outputs: Record<string, any>
  console: string[]
  warnings: string[]
  errors: string[]
  duration: number
  memory: number
  generatedCode?: GeneratedCode
  artifacts?: Artifact[]
}

export interface GeneratedCode {
  language: 'javascript' | 'typescript' | 'python' | 'solidity'
  code: string
  dependencies: string[]
  exports: string[]
  imports: string[]
  metadata: {
    description: string
    version: string
    author: string
    license: string
  }
}

export interface ServiceRegistry {
  blockchain: BlockchainService
  storage: StorageService
  http: HttpService
  crypto: CryptoService
  utils: UtilityService
  defi: DeFiService
}

export interface SecurityPolicy {
  allowNetworkAccess: boolean
  allowFileSystem: boolean
  allowEval: boolean
  allowImports: string[]
  maxExecutionTime: number
  maxMemory: number
  sandboxed: boolean
  permissions: string[]
}

// Main code execution engine
export class CodeExecutionEngine {
  private static instance: CodeExecutionEngine
  private interpreters = new Map<string, CodeInterpreter>()
  private codeGenerators = new Map<string, CodeGenerator>()
  private securityManager: SecurityManager
  private serviceRegistry: ServiceRegistry

  static getInstance(): CodeExecutionEngine {
    if (!CodeExecutionEngine.instance) {
      CodeExecutionEngine.instance = new CodeExecutionEngine()
    }
    return CodeExecutionEngine.instance
  }

  constructor() {
    this.securityManager = new SecurityManager()
    this.serviceRegistry = this.createServiceRegistry()
    this.initializeInterpreters()
    this.initializeCodeGenerators()
  }

  // Execute code in any supported language
  async executeCode(
    language: 'javascript' | 'python' | 'typescript',
    code: string,
    context: CodeExecutionContext,
    policy?: SecurityPolicy
  ): Promise<CodeExecutionResult> {
    const interpreter = this.interpreters.get(language)
    if (!interpreter) {
      throw new Error(`No interpreter available for ${language}`)
    }

    // Apply security policy
    const effectivePolicy = { ...this.getDefaultPolicy(), ...policy }
    const secureContext = await this.securityManager.createSecureContext(context, effectivePolicy)

    // Execute with monitoring
    const startTime = Date.now()
    const initialMemory = this.getMemoryUsage()

    try {
      const result = await interpreter.execute(code, secureContext, effectivePolicy)
      
      return {
        ...result,
        duration: Date.now() - startTime,
        memory: this.getMemoryUsage() - initialMemory
      }
    } catch (error) {
      return {
        success: false,
        result: null,
        outputs: {},
        console: [],
        warnings: [],
        errors: [error.message],
        duration: Date.now() - startTime,
        memory: this.getMemoryUsage() - initialMemory
      }
    }
  }

  // Generate modular code from node configurations
  async generateModularCode(
    nodeConfigs: NodeConfiguration[],
    connections: NodeConnection[],
    options: CodeGenerationOptions
  ): Promise<GeneratedCodeRepository> {
    const generator = this.codeGenerators.get(options.language || 'typescript')
    if (!generator) {
      throw new Error(`No code generator available for ${options.language}`)
    }

    return await generator.generateModularCode(nodeConfigs, connections, options)
  }

  // Execute node with scripting capabilities
  async executeNodeWithScript(
    nodeId: string,
    nodeType: string,
    script: string,
    inputs: Record<string, any>,
    config: Record<string, any>
  ): Promise<CodeExecutionResult> {
    const context: CodeExecutionContext = {
      nodeId,
      workflowId: 'runtime',
      inputs,
      config,
      globals: this.createNodeGlobals(nodeType),
      imports: this.createNodeImports(nodeType),
      services: this.serviceRegistry,
      storage: new MemoryStorage(),
      logger: new Logger(),
      security: this.securityManager
    }

    // Wrap script with node-specific boilerplate
    const wrappedScript = this.wrapNodeScript(nodeType, script, context)

    return await this.executeCode('javascript', wrappedScript, context)
  }

  // Create node-specific globals
  private createNodeGlobals(nodeType: string): Record<string, any> {
    const commonGlobals = {
      console: {
        log: (...args: any[]) => console.log(`[${nodeType}]`, ...args),
        warn: (...args: any[]) => console.warn(`[${nodeType}]`, ...args),
        error: (...args: any[]) => console.error(`[${nodeType}]`, ...args)
      },
      Math,
      Date,
      JSON,
      setTimeout,
      setInterval,
      clearTimeout,
      clearInterval
    }

    // Add type-specific globals
    switch (nodeType) {
      case 'oneInchSwap':
        return {
          ...commonGlobals,
          Web3: {},
          ethers: {},
          OneInchAPI: {},
          swap: this.createSwapHelpers()
        }
      case 'dataProcessor':
        return {
          ...commonGlobals,
          _: {}, // Lodash-like utilities
          validator: {},
          transformer: this.createDataTransformers()
        }
      case 'conditionalLogic':
        return {
          ...commonGlobals,
          evaluate: this.createExpressionEvaluator()
        }
      default:
        return commonGlobals
    }
  }

  private createNodeImports(nodeType: string): Record<string, any> {
    const imports: Record<string, any> = {}

    switch (nodeType) {
      case 'oneInchSwap':
        imports.web3 = {}
        imports.ethers = {}
        imports.oneinch = {}
        break
      case 'dataProcessor':
        imports.lodash = {}
        imports.validator = {}
        break
    }

    return imports
  }

  // Wrap script with node boilerplate
  private wrapNodeScript(nodeType: string, script: string, context: CodeExecutionContext): string {
    return `
// Auto-generated wrapper for ${nodeType}
(async function executeNode() {
  const inputs = ${JSON.stringify(context.inputs)};
  const config = ${JSON.stringify(context.config)};
  const outputs = {};
  let result = undefined;

  // Helper functions
  const setOutput = (key, value) => { outputs[key] = value; };
  const getInput = (key, defaultValue) => inputs[key] ?? defaultValue;
  const getConfig = (key, defaultValue) => config[key] ?? defaultValue;

  try {
    // User script
    ${script}

    // Return result
    return {
      success: true,
      result: result !== undefined ? result : outputs,
      outputs: outputs,
      console: [],
      warnings: [],
      errors: []
    };
  } catch (error) {
    return {
      success: false,
      result: null,
      outputs: outputs,
      console: [],
      warnings: [],
      errors: [error.message]
    };
  }
})();
`
  }

  private createSwapHelpers() {
    return {
      async getQuote(fromToken: string, toToken: string, amount: string) {
        // Implementation would call actual 1inch API
        return {
          fromToken,
          toToken,
          fromAmount: amount,
          toAmount: '1000',
          gasEstimate: '150000'
        }
      },
      
      async executeSwap(params: any) {
        // Implementation would execute actual swap
        return {
          hash: '0x123...',
          status: 'success'
        }
      }
    }
  }

  private createDataTransformers() {
    return {
      formatNumber: (num: number, decimals: number = 2) => {
        return parseFloat(num.toFixed(decimals))
      },
      
      parseJson: (str: string) => {
        try {
          return JSON.parse(str)
        } catch {
          return null
        }
      },
      
      extractField: (obj: any, path: string) => {
        return path.split('.').reduce((current, key) => current?.[key], obj)
      }
    }
  }

  private createExpressionEvaluator() {
    return {
      condition: (left: any, operator: string, right: any): boolean => {
        switch (operator) {
          case '>': return left > right
          case '<': return left < right
          case '>=': return left >= right
          case '<=': return left <= right
          case '==': return left == right
          case '===': return left === right
          case '!=': return left != right
          case '!==': return left !== right
          case 'contains': return String(left).includes(String(right))
          case 'startsWith': return String(left).startsWith(String(right))
          case 'endsWith': return String(left).endsWith(String(right))
          default: return false
        }
      }
    }
  }

  private initializeInterpreters() {
    this.interpreters.set('javascript', new JavaScriptInterpreter())
    this.interpreters.set('typescript', new TypeScriptInterpreter())
    this.interpreters.set('python', new PythonInterpreter())
  }

  private initializeCodeGenerators() {
    this.codeGenerators.set('javascript', new JavaScriptCodeGenerator())
    this.codeGenerators.set('typescript', new TypeScriptCodeGenerator())
    this.codeGenerators.set('python', new PythonCodeGenerator())
  }

  private createServiceRegistry(): ServiceRegistry {
    return {
      blockchain: new BlockchainService(),
      storage: new StorageService(),
      http: new HttpService(),
      crypto: new CryptoService(),
      utils: new UtilityService(),
      defi: new DeFiService()
    }
  }

  private getDefaultPolicy(): SecurityPolicy {
    return {
      allowNetworkAccess: true,
      allowFileSystem: false,
      allowEval: false,
      allowImports: ['crypto', 'ethers', 'web3', 'lodash'],
      maxExecutionTime: 30000,
      maxMemory: 128,
      sandboxed: true,
      permissions: ['blockchain:read', 'storage:read', 'http:request']
    }
  }

  private getMemoryUsage(): number {
    // Simplified memory tracking
    return 0
  }
}

// JavaScript interpreter with sandbox
class JavaScriptInterpreter implements CodeInterpreter {
  async execute(
    code: string,
    context: CodeExecutionContext,
    policy: SecurityPolicy
  ): Promise<CodeExecutionResult> {
    const sandbox = this.createSandbox(context, policy)
    
    try {
      const result = await this.runInSandbox(code, sandbox, policy)
      
      return {
        success: true,
        result: result.value,
        outputs: result.outputs || {},
        console: result.console || [],
        warnings: result.warnings || [],
        errors: []
      }
    } catch (error) {
      return {
        success: false,
        result: null,
        outputs: {},
        console: [],
        warnings: [],
        errors: [error.message]
      }
    }
  }

  private createSandbox(context: CodeExecutionContext, policy: SecurityPolicy) {
    const sandbox: any = {
      ...context.globals,
      inputs: context.inputs,
      config: context.config,
      services: context.services,
      console: {
        log: (...args: any[]) => console.log(...args),
        warn: (...args: any[]) => console.warn(...args),
        error: (...args: any[]) => console.error(...args)
      }
    }

    // Add allowed imports
    for (const importName of policy.allowImports) {
      if (context.imports[importName]) {
        sandbox[importName] = context.imports[importName]
      }
    }

    return sandbox
  }

  private async runInSandbox(code: string, sandbox: any, policy: SecurityPolicy): Promise<any> {
    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Execution timeout')), policy.maxExecutionTime)
    })

    // Create execution promise
    const executionPromise = new Promise((resolve, reject) => {
      try {
        const func = new Function(...Object.keys(sandbox), `
          "use strict";
          return (async function() {
            ${code}
          })();
        `)

        const result = func(...Object.values(sandbox))
        
        if (result instanceof Promise) {
          result.then(resolve).catch(reject)
        } else {
          resolve(result)
        }
      } catch (error) {
        reject(error)
      }
    })

    // Race between execution and timeout
    return await Promise.race([executionPromise, timeoutPromise])
  }
}

// TypeScript interpreter (transpiles to JavaScript)
class TypeScriptInterpreter implements CodeInterpreter {
  async execute(
    code: string,
    context: CodeExecutionContext,
    policy: SecurityPolicy
  ): Promise<CodeExecutionResult> {
    // Transpile TypeScript to JavaScript
    const jsCode = this.transpileTypeScript(code)
    
    // Use JavaScript interpreter
    const jsInterpreter = new JavaScriptInterpreter()
    return await jsInterpreter.execute(jsCode, context, policy)
  }

  private transpileTypeScript(code: string): string {
    // Simplified TypeScript to JavaScript transpilation
    // In reality, you'd use the TypeScript compiler API
    return code
      .replace(/: \w+/g, '') // Remove type annotations
      .replace(/interface \w+ \{[^}]+\}/g, '') // Remove interfaces
      .replace(/type \w+ = [^;]+;/g, '') // Remove type aliases
  }
}

// Python interpreter (requires backend service)
class PythonInterpreter implements CodeInterpreter {
  async execute(
    code: string,
    context: CodeExecutionContext,
    policy: SecurityPolicy
  ): Promise<CodeExecutionResult> {
    // This would require a Python execution service
    // For now, return a placeholder
    return {
      success: false,
      result: null,
      outputs: {},
      console: [],
      warnings: ['Python interpreter not implemented'],
      errors: ['Python execution requires backend service']
    }
  }
}

// Code generators for different languages
class TypeScriptCodeGenerator implements CodeGenerator {
  async generateModularCode(
    nodeConfigs: NodeConfiguration[],
    connections: NodeConnection[],
    options: CodeGenerationOptions
  ): Promise<GeneratedCodeRepository> {
    const repository: GeneratedCodeRepository = {
      language: 'typescript',
      modules: new Map(),
      dependencies: new Set(),
      entryPoint: 'workflow.ts',
      metadata: {
        description: options.description || 'Generated DeFi workflow',
        version: '1.0.0',
        author: 'Unite DeFi Code Generator',
        license: 'MIT'
      }
    }

    // Generate individual node modules
    for (const nodeConfig of nodeConfigs) {
      const module = await this.generateNodeModule(nodeConfig, options)
      repository.modules.set(`${nodeConfig.id}.ts`, module)
    }

    // Generate workflow orchestrator
    const workflowModule = this.generateWorkflowModule(nodeConfigs, connections, options)
    repository.modules.set('workflow.ts', workflowModule)

    // Generate package.json
    const packageJson = this.generatePackageJson(repository)
    repository.modules.set('package.json', packageJson)

    // Generate types
    const typesModule = this.generateTypesModule(nodeConfigs)
    repository.modules.set('types.ts', typesModule)

    return repository
  }

  private async generateNodeModule(nodeConfig: NodeConfiguration, options: CodeGenerationOptions): Promise<GeneratedCode> {
    const { id, type, config, script } = nodeConfig

    const code = `
/**
 * Generated ${type} module
 * Node ID: ${id}
 */

export interface ${this.capitalize(id)}Input {
${this.generateInputInterface(nodeConfig)}
}

export interface ${this.capitalize(id)}Output {
${this.generateOutputInterface(nodeConfig)}
}

export class ${this.capitalize(id)}Node {
  private config: any;

  constructor(config: any) {
    this.config = config;
  }

  async execute(inputs: ${this.capitalize(id)}Input): Promise<${this.capitalize(id)}Output> {
    ${script ? `
    // Custom script
    ${script}
    ` : `
    // Default implementation
    return this.defaultExecute(inputs);
    `}
  }

  private async defaultExecute(inputs: ${this.capitalize(id)}Input): Promise<${this.capitalize(id)}Output> {
    // Generated default implementation based on node type
    ${this.generateDefaultImplementation(type, config)}
  }
}
`

    return {
      language: 'typescript',
      code,
      dependencies: this.extractDependencies(type),
      exports: [`${this.capitalize(id)}Node`],
      imports: [],
      metadata: {
        description: `${type} node implementation`,
        version: '1.0.0',
        author: 'Generated',
        license: 'MIT'
      }
    }
  }

  private generateWorkflowModule(
    nodeConfigs: NodeConfiguration[],
    connections: NodeConnection[],
    options: CodeGenerationOptions
  ): GeneratedCode {
    const imports = nodeConfigs.map(node => 
      `import { ${this.capitalize(node.id)}Node } from './${node.id}';`
    ).join('\n')

    const nodeInstantiations = nodeConfigs.map(node =>
      `  private ${node.id} = new ${this.capitalize(node.id)}Node(${JSON.stringify(node.config)});`
    ).join('\n')

    const code = `
/**
 * Generated workflow orchestrator
 */

${imports}

export class WorkflowExecutor {
${nodeInstantiations}

  async execute(initialInputs: Record<string, any>): Promise<Record<string, any>> {
    const results = new Map<string, any>();
    
    ${this.generateExecutionFlow(nodeConfigs, connections)}

    return Object.fromEntries(results);
  }
}

export default WorkflowExecutor;
`

    return {
      language: 'typescript',
      code,
      dependencies: ['@types/node'],
      exports: ['WorkflowExecutor'],
      imports: nodeConfigs.map(n => n.id),
      metadata: {
        description: 'Workflow orchestrator',
        version: '1.0.0',
        author: 'Generated',
        license: 'MIT'
      }
    }
  }

  private generateExecutionFlow(nodeConfigs: NodeConfiguration[], connections: NodeConnection[]): string {
    // Create execution order based on dependencies
    const executionOrder = this.topologicalSort(nodeConfigs, connections)
    
    return executionOrder.map(nodeId => {
      const node = nodeConfigs.find(n => n.id === nodeId)!
      const inputs = this.getNodeInputConnections(nodeId, connections)
      
      return `
    // Execute ${nodeId}
    const ${nodeId}Inputs = {
      ${inputs.map(input => `${input.targetPort}: results.get('${input.sourceNode}.${input.sourcePort}')`).join(',\n      ')}
    };
    const ${nodeId}Result = await this.${nodeId}.execute(${nodeId}Inputs);
    results.set('${nodeId}', ${nodeId}Result);`
    }).join('\n')
  }

  private generateInputInterface(nodeConfig: NodeConfiguration): string {
    // Generate TypeScript interface for inputs
    return '  // Input properties would be generated here'
  }

  private generateOutputInterface(nodeConfig: NodeConfiguration): string {
    // Generate TypeScript interface for outputs  
    return '  // Output properties would be generated here'
  }

  private generateDefaultImplementation(type: string, config: any): string {
    switch (type) {
      case 'oneInchSwap':
        return `
    // 1inch swap implementation
    const quote = await this.get1inchQuote(inputs.fromToken, inputs.toToken, inputs.amount);
    const transaction = await this.execute1inchSwap(quote);
    return {
      transactionHash: transaction.hash,
      amountOut: quote.toAmount,
      gasUsed: transaction.gasUsed
    };`
      
      case 'dataProcessor':
        return `
    // Data processing implementation
    let result = inputs.data;
    
    switch(this.config.operation) {
      case 'formatNumber':
        result = parseFloat(result).toFixed(this.config.decimals || 2);
        break;
      case 'parseJson':
        result = JSON.parse(result);
        break;
      default:
        result = inputs.data;
    }
    
    return { result };`
      
      default:
        return `
    // Generic implementation
    return { ...inputs };`
    }
  }

  private generatePackageJson(repository: GeneratedCodeRepository): GeneratedCode {
    const dependencies = Array.from(repository.dependencies).reduce((acc, dep) => {
      acc[dep] = '^1.0.0'
      return acc
    }, {} as Record<string, string>)

    const packageJson = {
      name: 'unite-defi-generated-workflow',
      version: repository.metadata.version,
      description: repository.metadata.description,
      main: 'workflow.ts',
      dependencies,
      devDependencies: {
        'typescript': '^4.9.0',
        '@types/node': '^18.0.0'
      },
      scripts: {
        build: 'tsc',
        start: 'node dist/workflow.js'
      }
    }

    return {
      language: 'typescript',
      code: JSON.stringify(packageJson, null, 2),
      dependencies: [],
      exports: [],
      imports: [],
      metadata: {
        description: 'Package configuration',
        version: '1.0.0',
        author: 'Generated',
        license: 'MIT'
      }
    }
  }

  private generateTypesModule(nodeConfigs: NodeConfiguration[]): GeneratedCode {
    const code = `
/**
 * Generated type definitions
 */

export interface WorkflowData {
  [key: string]: any;
}

${nodeConfigs.map(node => `
export interface ${this.capitalize(node.id)}Data {
  // Type definitions for ${node.id}
}
`).join('')}
`

    return {
      language: 'typescript',
      code,
      dependencies: [],
      exports: ['WorkflowData', ...nodeConfigs.map(n => `${this.capitalize(n.id)}Data`)],
      imports: [],
      metadata: {
        description: 'Type definitions',
        version: '1.0.0',
        author: 'Generated',
        license: 'MIT'
      }
    }
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  private extractDependencies(nodeType: string): string[] {
    const depMap: Record<string, string[]> = {
      'oneInchSwap': ['ethers', 'axios'],
      'fusionSwap': ['ethers', 'axios'],
      'dataProcessor': ['lodash'],
      'conditionalLogic': [],
      'walletConnector': ['ethers']
    }
    
    return depMap[nodeType] || []
  }

  private topologicalSort(nodeConfigs: NodeConfiguration[], connections: NodeConnection[]): string[] {
    // Implement topological sort for execution order
    return nodeConfigs.map(n => n.id)
  }

  private getNodeInputConnections(nodeId: string, connections: NodeConnection[]): NodeConnection[] {
    return connections.filter(conn => conn.targetNode === nodeId)
  }
}

// Similar implementations for JavaScriptCodeGenerator and PythonCodeGenerator would follow...

class JavaScriptCodeGenerator implements CodeGenerator {
  async generateModularCode(): Promise<GeneratedCodeRepository> {
    // Implementation similar to TypeScript but without types
    throw new Error('JavaScript code generator not implemented')
  }
}

class PythonCodeGenerator implements CodeGenerator {
  async generateModularCode(): Promise<GeneratedCodeRepository> {
    // Implementation for Python code generation
    throw new Error('Python code generator not implemented')
  }
}

// Interfaces and types
export interface CodeInterpreter {
  execute(
    code: string,
    context: CodeExecutionContext,
    policy: SecurityPolicy
  ): Promise<CodeExecutionResult>
}

export interface CodeGenerator {
  generateModularCode(
    nodeConfigs: NodeConfiguration[],
    connections: NodeConnection[],
    options: CodeGenerationOptions
  ): Promise<GeneratedCodeRepository>
}

export interface NodeConfiguration {
  id: string
  type: string
  config: Record<string, any>
  script?: string
  inputs: PortConfiguration[]
  outputs: PortConfiguration[]
}

export interface PortConfiguration {
  id: string
  name: string
  type: string
  required: boolean
}

export interface NodeConnection {
  id: string
  sourceNode: string
  sourcePort: string
  targetNode: string
  targetPort: string
}

export interface CodeGenerationOptions {
  language?: 'javascript' | 'typescript' | 'python'
  description?: string
  includeTests?: boolean
  includeDocumentation?: boolean
  optimizeForProduction?: boolean
}

export interface GeneratedCodeRepository {
  language: string
  modules: Map<string, GeneratedCode>
  dependencies: Set<string>
  entryPoint: string
  metadata: {
    description: string
    version: string
    author: string
    license: string
  }
}

// Service implementations (simplified)
class BlockchainService {
  async call(address: string, method: string, params: any[]): Promise<any> {
    // Blockchain interaction implementation
    return {}
  }
}

class StorageService {
  async get(key: string): Promise<any> {
    return localStorage.getItem(key)
  }
  
  async set(key: string, value: any): Promise<void> {
    localStorage.setItem(key, JSON.stringify(value))
  }
}

class HttpService {
  async get(url: string, headers?: Record<string, string>): Promise<any> {
    const response = await fetch(url, { headers })
    return response.json()
  }
  
  async post(url: string, data: any, headers?: Record<string, string>): Promise<any> {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(data)
    })
    return response.json()
  }
}

class CryptoService {
  hash(data: string): string {
    // Implement hashing
    return btoa(data)
  }
  
  sign(data: string, key: string): string {
    // Implement signing
    return 'signature'
  }
}

class UtilityService {
  formatNumber(num: number, decimals: number = 2): string {
    return parseFloat(num.toFixed(decimals)).toString()
  }
  
  parseJson(str: string): any {
    try {
      return JSON.parse(str)
    } catch {
      return null
    }
  }
}

class DeFiService {
  async getTokenPrice(tokenAddress: string): Promise<number> {
    // Get token price from API
    return 1.0
  }
  
  async getPoolData(poolAddress: string): Promise<any> {
    // Get pool data
    return {}
  }
}

class SecurityManager {
  async createSecureContext(
    context: CodeExecutionContext,
    policy: SecurityPolicy
  ): Promise<CodeExecutionContext> {
    // Create sandboxed context based on security policy
    return { ...context }
  }
}

class MemoryStorage {
  private data = new Map<string, any>()
  
  get(key: string): any {
    return this.data.get(key)
  }
  
  set(key: string, value: any): void {
    this.data.set(key, value)
  }
}

class Logger {
  log(message: string, data?: any): void {
    console.log(message, data)
  }
  
  warn(message: string, data?: any): void {
    console.warn(message, data)
  }
  
  error(message: string, data?: any): void {
    console.error(message, data)
  }
}

// Global instance
export const codeExecutionEngine = CodeExecutionEngine.getInstance()