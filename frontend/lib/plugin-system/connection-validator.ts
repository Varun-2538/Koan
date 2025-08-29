/**
 * Dynamic Connection Validation System
 * Like Langflow - flexible, extensible connection validation with transformations
 */

import { DataType, ConnectionRule, ValidationResult, DataTransformer } from './types'
import { pluginRegistry } from './plugin-registry'

export interface ConnectionAttempt {
  sourceNodeId: string
  sourcePortId: string
  sourceDataType: string
  targetNodeId: string
  targetPortId: string
  targetDataType: string
  sourceData?: any
}

export interface ConnectionValidationResult {
  valid: boolean
  canConnect: boolean
  requiresTransformation: boolean
  transformer?: DataTransformer
  errors: string[]
  warnings: string[]
  suggestions: string[]
  cost: number // Cost of this connection (for optimization)
  confidence: number // 0-1, how confident we are about this connection
}

export interface ValidationPath {
  steps: ValidationStep[]
  totalCost: number
  transformations: DataTransformer[]
}

export interface ValidationStep {
  fromType: string
  toType: string
  transformer?: DataTransformer
  rule?: ConnectionRule
  cost: number
}

export class ConnectionValidator {
  private static instance: ConnectionValidator
  private rules: Map<string, ConnectionRule[]> = new Map()
  private transformers: Map<string, DataTransformer[]> = new Map()
  private cache: Map<string, ConnectionValidationResult> = new Map()
  private dataTypes: Map<string, DataType> = new Map()

  static getInstance(): ConnectionValidator {
    if (!ConnectionValidator.instance) {
      ConnectionValidator.instance = new ConnectionValidator()
    }
    return ConnectionValidator.instance
  }

  constructor() {
    this.initializeBuiltInRules()
    this.initializeBuiltInTransformers()
  }

  // Main validation method
  async validateConnection(attempt: ConnectionAttempt): Promise<ConnectionValidationResult> {
    const cacheKey = this.generateCacheKey(attempt)
    
    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < 60000) { // 1-minute cache
      return cached
    }

    try {
      const result = await this.performValidation(attempt)
      
      // Cache successful validations
      this.cache.set(cacheKey, { ...result, timestamp: Date.now() } as any)
      
      return result
    } catch (error) {
      return {
        valid: false,
        canConnect: false,
        requiresTransformation: false,
        errors: [`Validation error: ${error.message}`],
        warnings: [],
        suggestions: [],
        cost: Infinity,
        confidence: 0
      }
    }
  }

  private async performValidation(attempt: ConnectionAttempt): Promise<ConnectionValidationResult> {
    const { sourceDataType, targetDataType } = attempt

    // Get type definitions
    const sourceType = this.getDataType(sourceDataType)
    const targetType = this.getDataType(targetDataType)

    if (!sourceType || !targetType) {
      return {
        valid: false,
        canConnect: false,
        requiresTransformation: false,
        errors: [`Unknown data type: ${!sourceType ? sourceDataType : targetDataType}`],
        warnings: [],
        suggestions: [],
        cost: Infinity,
        confidence: 0
      }
    }

    // Direct compatibility check
    if (this.areDirectlyCompatible(sourceType, targetType)) {
      return {
        valid: true,
        canConnect: true,
        requiresTransformation: false,
        errors: [],
        warnings: [],
        suggestions: [],
        cost: 0,
        confidence: 1.0
      }
    }

    // Find transformation paths
    const paths = await this.findTransformationPaths(sourceType, targetType, 3) // Max 3 hops
    
    if (paths.length === 0) {
      return {
        valid: false,
        canConnect: false,
        requiresTransformation: false,
        errors: [`No transformation path found from ${sourceDataType} to ${targetDataType}`],
        warnings: [],
        suggestions: await this.getSuggestions(sourceType, targetType),
        cost: Infinity,
        confidence: 0
      }
    }

    // Select best path (lowest cost, highest confidence)
    const bestPath = this.selectBestPath(paths)
    const transformer = this.createPathTransformer(bestPath)

    return {
      valid: true,
      canConnect: true,
      requiresTransformation: bestPath.transformations.length > 0,
      transformer,
      errors: [],
      warnings: this.generateWarnings(bestPath),
      suggestions: [],
      cost: bestPath.totalCost,
      confidence: this.calculatePathConfidence(bestPath)
    }
  }

  // Direct compatibility checking
  private areDirectlyCompatible(sourceType: DataType, targetType: DataType): boolean {
    // Same type
    if (sourceType.id === targetType.id) return true
    
    // Check explicit compatibility
    if (sourceType.compatibility?.includes(targetType.id)) return true
    if (targetType.compatibility?.includes(sourceType.id)) return true

    // Built-in compatibility rules
    const compatibilityMap: Record<string, string[]> = {
      'string': ['object', 'array'], // String can be parsed as JSON
      'number': ['string'], // Number can be converted to string
      'boolean': ['string', 'number'], // Boolean can be converted
      'object': ['string'], // Object can be stringified
      'array': ['string'], // Array can be stringified
      'address': ['string'], // Address is a special string
      'token': ['object'], // Token contains object data
      'transaction': ['object'] // Transaction contains object data
    }

    return compatibilityMap[sourceType.id]?.includes(targetType.id) || false
  }

  // Find transformation paths using graph traversal
  private async findTransformationPaths(
    sourceType: DataType,
    targetType: DataType,
    maxHops: number
  ): Promise<ValidationPath[]> {
    const paths: ValidationPath[] = []
    const visited = new Set<string>()
    
    const dfs = (currentType: DataType, path: ValidationStep[], depth: number) => {
      if (depth > maxHops) return
      if (visited.has(currentType.id)) return
      
      visited.add(currentType.id)
      
      // Check if we can reach target
      if (currentType.id === targetType.id) {
        paths.push({
          steps: [...path],
          totalCost: path.reduce((sum, step) => sum + step.cost, 0),
          transformations: path.map(step => step.transformer).filter(Boolean) as DataTransformer[]
        })
        visited.delete(currentType.id)
        return
      }
      
      // Find all possible transformations from current type
      const transformers = this.getTransformersFrom(currentType.id)
      
      for (const transformer of transformers) {
        const nextType = this.getDataType(transformer.toType)
        if (nextType && !visited.has(nextType.id)) {
          path.push({
            fromType: currentType.id,
            toType: nextType.id,
            transformer,
            cost: this.calculateTransformationCost(transformer),
          })
          
          dfs(nextType, path, depth + 1)
          path.pop()
        }
      }
      
      visited.delete(currentType.id)
    }
    
    dfs(sourceType, [], 0)
    return paths
  }

  // Path selection and optimization
  private selectBestPath(paths: ValidationPath[]): ValidationPath {
    return paths.reduce((best, current) => {
      const bestScore = this.calculatePathScore(best)
      const currentScore = this.calculatePathScore(current)
      return currentScore > bestScore ? current : best
    })
  }

  private calculatePathScore(path: ValidationPath): number {
    // Score based on cost (lower is better) and transformation count (fewer is better)
    const costScore = 1 / (1 + path.totalCost)
    const lengthScore = 1 / (1 + path.steps.length)
    const lossyPenalty = path.transformations.some(t => t.lossy) ? 0.5 : 1
    
    return (costScore * 0.4 + lengthScore * 0.4) * lossyPenalty
  }

  private calculatePathConfidence(path: ValidationPath): number {
    if (path.steps.length === 0) return 1.0
    if (path.steps.length > 2) return Math.max(0.3, 1.0 - path.steps.length * 0.2)
    return 0.8 - (path.transformations.filter(t => t.lossy).length * 0.3)
  }

  // Transformer management
  registerTransformer(transformer: DataTransformer): void {
    if (!this.transformers.has(transformer.fromType)) {
      this.transformers.set(transformer.fromType, [])
    }
    this.transformers.get(transformer.fromType)!.push(transformer)
  }

  private getTransformersFrom(fromType: string): DataTransformer[] {
    return this.transformers.get(fromType) || []
  }

  private calculateTransformationCost(transformer: DataTransformer): number {
    let cost = 1 // Base cost
    
    if (transformer.async) cost += 2
    if (transformer.lossy) cost += 3
    
    return cost
  }

  // Create composite transformer for a path
  private createPathTransformer(path: ValidationPath): DataTransformer | undefined {
    if (path.transformations.length === 0) return undefined
    if (path.transformations.length === 1) return path.transformations[0]
    
    // Create composite transformer
    return {
      id: `composite_${Date.now()}`,
      name: `Composite ${path.steps.map(s => s.fromType).join(' → ')} → ${path.steps[path.steps.length - 1].toType}`,
      description: 'Composite transformation',
      fromType: path.steps[0].fromType,
      toType: path.steps[path.steps.length - 1].toType,
      async: path.transformations.some(t => t.async),
      lossy: path.transformations.some(t => t.lossy),
      transform: async (value: any) => {
        let result = value
        for (const transformer of path.transformations) {
          result = await transformer.transform(result)
        }
        return result
      }
    }
  }

  // Rule management
  registerRule(rule: ConnectionRule): void {
    const key = `${rule.sourceType}->${rule.targetType}`
    if (!this.rules.has(key)) {
      this.rules.set(key, [])
    }
    this.rules.get(key)!.push(rule)
  }

  private getRules(sourceType: string, targetType: string): ConnectionRule[] {
    return this.rules.get(`${sourceType}->${targetType}`) || []
  }

  // Data type management
  registerDataType(dataType: DataType): void {
    this.dataTypes.set(dataType.id, dataType)
  }

  private getDataType(id: string): DataType | undefined {
    return this.dataTypes.get(id) || pluginRegistry.getComponent(id)?.template?.outputs?.find(o => o.dataType === id)?.dataType as any
  }

  // Suggestions
  private async getSuggestions(sourceType: DataType, targetType: DataType): Promise<string[]> {
    const suggestions: string[] = []
    
    // Suggest intermediate types
    const intermediateTypes = Array.from(this.dataTypes.values())
      .filter(type => 
        this.areDirectlyCompatible(sourceType, type) && 
        this.areDirectlyCompatible(type, targetType)
      )
    
    if (intermediateTypes.length > 0) {
      suggestions.push(
        `Consider using an intermediate conversion through: ${intermediateTypes.map(t => t.name).join(', ')}`
      )
    }
    
    // Suggest compatible types
    const compatibleTypes = Array.from(this.dataTypes.values())
      .filter(type => this.areDirectlyCompatible(sourceType, type))
      .slice(0, 3)
    
    if (compatibleTypes.length > 0) {
      suggestions.push(
        `${sourceType.name} is compatible with: ${compatibleTypes.map(t => t.name).join(', ')}`
      )
    }
    
    return suggestions
  }

  private generateWarnings(path: ValidationPath): string[] {
    const warnings: string[] = []
    
    if (path.transformations.some(t => t.lossy)) {
      warnings.push('This transformation may lose data precision')
    }
    
    if (path.steps.length > 2) {
      warnings.push('This connection requires multiple transformation steps')
    }
    
    if (path.transformations.some(t => t.async)) {
      warnings.push('This connection involves asynchronous transformations')
    }
    
    return warnings
  }

  // Cache management
  private generateCacheKey(attempt: ConnectionAttempt): string {
    return `${attempt.sourceDataType}->${attempt.targetDataType}`
  }

  clearCache(): void {
    this.cache.clear()
  }

  // Built-in rules and transformers
  private initializeBuiltInRules(): void {
    // Add essential connection rules
    const rules: ConnectionRule[] = [
      {
        id: 'string_to_object',
        name: 'String to Object',
        sourceType: 'string',
        targetType: 'object',
        validator: (value: string) => {
          try { JSON.parse(value); return true } catch { return false }
        },
        cost: 2,
        priority: 1
      },
      {
        id: 'number_to_string',
        name: 'Number to String',
        sourceType: 'number',
        targetType: 'string',
        validator: () => true,
        transformer: (value: number) => value.toString(),
        cost: 1,
        priority: 1
      },
      {
        id: 'address_to_string',
        name: 'Address to String',
        sourceType: 'address',
        targetType: 'string',
        validator: () => true,
        cost: 0,
        priority: 1
      }
    ]

    rules.forEach(rule => this.registerRule(rule))
  }

  private initializeBuiltInTransformers(): void {
    const transformers: DataTransformer[] = [
      {
        id: 'string_to_json',
        name: 'Parse JSON',
        description: 'Parse JSON string to object',
        fromType: 'string',
        toType: 'object',
        transform: (value: string) => JSON.parse(value)
      },
      {
        id: 'object_to_string',
        name: 'Stringify JSON',
        description: 'Convert object to JSON string',
        fromType: 'object',
        toType: 'string',
        transform: (value: any) => JSON.stringify(value)
      },
      {
        id: 'number_to_string',
        name: 'Number to String',
        description: 'Convert number to string',
        fromType: 'number',
        toType: 'string',
        transform: (value: number) => value.toString()
      },
      {
        id: 'string_to_number',
        name: 'String to Number',
        description: 'Parse string as number',
        fromType: 'string',
        toType: 'number',
        transform: (value: string) => parseFloat(value)
      },
      {
        id: 'boolean_to_string',
        name: 'Boolean to String',
        description: 'Convert boolean to string',
        fromType: 'boolean',
        toType: 'string',
        transform: (value: boolean) => value.toString()
      },
      {
        id: 'token_to_object',
        name: 'Token to Object',
        description: 'Extract token data as object',
        fromType: 'token',
        toType: 'object',
        transform: (value: any) => ({ ...value })
      }
    ]

    transformers.forEach(transformer => this.registerTransformer(transformer))
  }

  // Public API for external validation
  async canConnect(sourceType: string, targetType: string): Promise<boolean> {
    const result = await this.validateConnection({
      sourceNodeId: 'test',
      sourcePortId: 'output',
      sourceDataType: sourceType,
      targetNodeId: 'test',
      targetPortId: 'input',
      targetDataType: targetType
    })
    
    return result.canConnect
  }

  // Get all possible target types for a source type
  getCompatibleTargetTypes(sourceType: string): string[] {
    const compatible: string[] = []
    
    for (const [targetTypeId] of this.dataTypes) {
      if (this.areDirectlyCompatible(
        this.getDataType(sourceType)!,
        this.getDataType(targetTypeId)!
      )) {
        compatible.push(targetTypeId)
      }
    }
    
    return compatible
  }

  // Advanced validation with context
  async validateWithContext(
    attempt: ConnectionAttempt,
    context: {
      workflow?: any
      nodeStates?: Map<string, any>
      executionHistory?: any[]
    }
  ): Promise<ConnectionValidationResult> {
    const baseResult = await this.validateConnection(attempt)
    
    if (!baseResult.valid) return baseResult
    
    // Additional context-aware validation
    const contextWarnings: string[] = [...baseResult.warnings]
    
    // Check for circular dependencies
    if (context.workflow) {
      const wouldCreateCycle = this.detectCycle(attempt, context.workflow)
      if (wouldCreateCycle) {
        return {
          ...baseResult,
          valid: false,
          canConnect: false,
          errors: ['This connection would create a circular dependency']
        }
      }
    }
    
    // Check for performance implications
    if (context.nodeStates) {
      const sourceState = context.nodeStates.get(attempt.sourceNodeId)
      if (sourceState?.highFrequency && baseResult.requiresTransformation) {
        contextWarnings.push('High-frequency data with transformation may impact performance')
      }
    }
    
    return {
      ...baseResult,
      warnings: contextWarnings
    }
  }

  private detectCycle(attempt: ConnectionAttempt, workflow: any): boolean {
    // Implement cycle detection algorithm
    // This is a simplified version - you'd want a proper topological sort
    return false // Placeholder
  }
}

// Global instance
export const connectionValidator = ConnectionValidator.getInstance()