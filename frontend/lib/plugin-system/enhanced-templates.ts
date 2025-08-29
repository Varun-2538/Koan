/**
 * Enhanced Template System with Nested Configurations
 * Supports complex field types, conditional rendering, and dynamic schemas
 */

import { JSONSchema, DataType, ValidationRule } from './types'

// Enhanced field types supporting complex configurations
export type EnhancedFieldType =
  // Basic types
  | 'text' | 'number' | 'boolean' | 'select' | 'multiselect'
  | 'textarea' | 'color' | 'date' | 'time' | 'datetime'
  
  // Advanced input types
  | 'slider' | 'range' | 'rating' | 'toggle_group'
  | 'file' | 'image' | 'video' | 'audio'
  
  // Code and expressions
  | 'code' | 'expression' | 'formula' | 'sql' | 'regex'
  | 'json' | 'yaml' | 'xml' | 'markdown'
  
  // Blockchain specific
  | 'address' | 'private_key' | 'mnemonic' | 'signature'
  | 'token_selector' | 'chain_selector' | 'contract_abi'
  | 'gas_price' | 'wei_amount' | 'percentage'
  
  // Complex structures
  | 'nested_object' | 'dynamic_array' | 'key_value_pairs'
  | 'conditional_group' | 'repeater' | 'matrix'
  | 'tree_selector' | 'graph_builder' | 'flow_diagram'
  
  // UI components
  | 'tabs' | 'accordion' | 'stepper' | 'wizard'
  | 'card_selector' | 'image_gallery' | 'data_table'
  
  // External integrations
  | 'api_selector' | 'database_query' | 'file_browser'
  | 'map_location' | 'calendar_picker'

export interface EnhancedFieldDefinition {
  // Basic properties
  key: string
  name: string
  description: string
  type: EnhancedFieldType
  required: boolean
  defaultValue?: any
  
  // Validation and constraints
  validation?: ValidationRule[]
  constraints?: FieldConstraint[]
  schema?: JSONSchema
  
  // Conditional rendering
  conditional?: ConditionalRule
  dependencies?: string[]
  computedValue?: ComputedValue
  
  // UI configuration
  ui: FieldUIConfiguration
  
  // Grouping and organization
  category?: string
  group?: string
  order?: number
  advanced?: boolean
  experimental?: boolean
  
  // Metadata
  documentation?: string
  examples?: any[]
  changelog?: ChangelogEntry[]
  version?: string
  
  // Complex field configurations
  nested?: NestedConfiguration
  array?: ArrayConfiguration
  conditional_groups?: ConditionalGroup[]
  matrix?: MatrixConfiguration
  external?: ExternalConfiguration
}

export interface FieldUIConfiguration {
  // Basic UI properties
  label?: string
  placeholder?: string
  helpText?: string
  tooltip?: string
  icon?: string
  
  // Layout and styling
  width?: 'full' | 'half' | 'third' | 'quarter' | string
  height?: string
  className?: string
  style?: Record<string, any>
  
  // Widget-specific configurations
  widget?: WidgetConfiguration
  
  // Visibility and interaction
  hidden?: boolean
  disabled?: boolean
  readonly?: boolean
  collapsible?: boolean
  
  // Field-specific UI options
  options?: FieldOption[]
  optionGroups?: OptionGroup[]
  
  // For complex fields
  columns?: ColumnDefinition[]
  sections?: SectionDefinition[]
  layout?: LayoutConfiguration
}

export interface WidgetConfiguration {
  type: string
  props?: Record<string, any>
  events?: Record<string, string>
  style?: Record<string, any>
  validation?: Record<string, any>
}

export interface FieldOption {
  label: string
  value: any
  description?: string
  icon?: string
  image?: string
  disabled?: boolean
  group?: string
  metadata?: Record<string, any>
  children?: FieldOption[] // For hierarchical options
}

export interface OptionGroup {
  label: string
  options: FieldOption[]
  collapsible?: boolean
  icon?: string
}

export interface ColumnDefinition {
  key: string
  label: string
  type: EnhancedFieldType
  width?: string
  sortable?: boolean
  filterable?: boolean
  editable?: boolean
}

export interface SectionDefinition {
  id: string
  title: string
  description?: string
  fields: string[]
  collapsible?: boolean
  defaultExpanded?: boolean
  conditional?: ConditionalRule
}

export interface LayoutConfiguration {
  type: 'grid' | 'flex' | 'tabs' | 'accordion' | 'stepper'
  columns?: number
  gap?: string
  responsive?: boolean
  breakpoints?: Record<string, any>
}

// Nested field configurations
export interface NestedConfiguration {
  schema: EnhancedFieldDefinition[]
  maxDepth?: number
  allowAddRemove?: boolean
  template?: Record<string, any>
  validation?: ValidationRule[]
}

export interface ArrayConfiguration {
  itemType: EnhancedFieldType
  itemSchema?: EnhancedFieldDefinition
  minItems?: number
  maxItems?: number
  uniqueItems?: boolean
  sortable?: boolean
  addButtonText?: string
  removeButtonText?: string
  template?: any
}

export interface ConditionalGroup {
  id: string
  title: string
  condition: ConditionalRule
  fields: EnhancedFieldDefinition[]
  exclusive?: boolean // Only one group can be active
}

export interface MatrixConfiguration {
  rows: MatrixDimension
  columns: MatrixDimension
  cellType: EnhancedFieldType
  cellSchema?: EnhancedFieldDefinition
  allowRowAdd?: boolean
  allowColumnAdd?: boolean
}

export interface MatrixDimension {
  key: string
  label: string
  options: FieldOption[]
  dynamic?: boolean
}

export interface ExternalConfiguration {
  type: 'api' | 'database' | 'file' | 'service'
  endpoint?: string
  query?: string
  transformer?: string // JavaScript function to transform data
  refreshInterval?: number
  dependencies?: string[]
}

// Conditional rendering
export interface ConditionalRule {
  field?: string
  fields?: string[]
  operator: ConditionalOperator
  value?: any
  values?: any[]
  expression?: string // JavaScript expression
  function?: (values: Record<string, any>) => boolean
}

export type ConditionalOperator = 
  | 'equals' | 'not_equals' | 'greater_than' | 'less_than'
  | 'greater_equal' | 'less_equal' | 'contains' | 'not_contains'
  | 'starts_with' | 'ends_with' | 'matches' | 'not_matches'
  | 'is_empty' | 'is_not_empty' | 'is_null' | 'is_not_null'
  | 'in' | 'not_in' | 'between' | 'not_between'
  | 'and' | 'or' | 'not' | 'custom'

export interface ComputedValue {
  expression: string // JavaScript expression
  dependencies: string[]
  cached?: boolean
  asyncCompute?: boolean
}

// Enhanced template definition
export interface EnhancedComponentTemplate {
  // Basic information
  id: string
  name: string
  description: string
  category: string
  subcategory?: string
  version: string
  
  // Configuration schema
  configuration: EnhancedFieldDefinition[]
  sections?: SectionDefinition[]
  
  // Input/output definitions
  inputs: EnhancedPortDefinition[]
  outputs: EnhancedPortDefinition[]
  
  // Behavior and capabilities
  behavior: ComponentBehavior
  capabilities: ComponentCapability[]
  
  // UI and presentation
  ui: ComponentUIConfiguration
  
  // Documentation and examples
  documentation: DocumentationConfiguration
  
  // Metadata
  metadata: EnhancedComponentMetadata
  
  // Extensibility
  extensionPoints?: ExtensionPoint[]
  plugins?: ComponentPlugin[]
  
  // Advanced features
  scripting?: ScriptingConfiguration
  theming?: ThemingConfiguration
  localization?: LocalizationConfiguration
}

export interface EnhancedPortDefinition {
  id: string
  name: string
  description: string
  dataType: string
  required: boolean
  multiple: boolean
  streaming?: boolean
  
  // Enhanced features
  validation?: ValidationRule[]
  transformation?: DataTransformer[]
  defaultValue?: any
  constraints?: PortConstraint[]
  
  // UI configuration
  ui?: PortUIConfiguration
  
  // Advanced features
  buffering?: BufferingConfiguration
  batching?: BatchingConfiguration
  errorHandling?: ErrorHandlingConfiguration
}

export interface PortUIConfiguration {
  label?: string
  description?: string
  icon?: string
  color?: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  style?: Record<string, any>
}

export interface BufferingConfiguration {
  enabled: boolean
  size?: number
  strategy?: 'fifo' | 'lifo' | 'priority'
  overflow?: 'drop' | 'block' | 'error'
}

export interface BatchingConfiguration {
  enabled: boolean
  batchSize?: number
  timeout?: number
  strategy?: 'count' | 'time' | 'size' | 'adaptive'
}

export interface ErrorHandlingConfiguration {
  strategy: 'fail' | 'retry' | 'fallback' | 'ignore' | 'transform'
  retryCount?: number
  retryDelay?: number
  fallbackValue?: any
  transformer?: string
}

export interface ComponentUIConfiguration {
  icon?: string
  color?: string
  backgroundColor?: string
  borderColor?: string
  
  // Node appearance
  nodeStyle?: NodeStyleConfiguration
  
  // Configuration panel
  configPanel?: ConfigPanelConfiguration
  
  // Custom rendering
  customRenderer?: string // Component name or code
  renderProps?: Record<string, any>
  
  // Responsive design
  responsive?: ResponsiveConfiguration
}

export interface NodeStyleConfiguration {
  width?: number
  height?: number
  borderRadius?: number
  shadow?: boolean
  gradient?: boolean
  animation?: AnimationConfiguration
  states?: Record<string, Partial<NodeStyleConfiguration>>
}

export interface AnimationConfiguration {
  type?: 'pulse' | 'glow' | 'shake' | 'bounce' | 'spin'
  duration?: number
  timing?: 'ease' | 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'
  delay?: number
  iterations?: number | 'infinite'
}

export interface ConfigPanelConfiguration {
  layout?: 'tabs' | 'accordion' | 'single' | 'wizard'
  sections?: string[]
  collapsible?: boolean
  resizable?: boolean
  position?: 'right' | 'bottom' | 'modal' | 'inline'
}

export interface ResponsiveConfiguration {
  breakpoints: Record<string, Partial<ComponentUIConfiguration>>
  mobileFirst?: boolean
}

export interface ComponentCapability {
  id: string
  name: string
  description: string
  required?: boolean
  version?: string
}

export interface DocumentationConfiguration {
  readme?: string
  examples?: ComponentExample[]
  tutorials?: TutorialConfiguration[]
  apiDocs?: APIDocumentation[]
  changelog?: ChangelogEntry[]
  troubleshooting?: TroubleshootingEntry[]
}

export interface TutorialConfiguration {
  id: string
  title: string
  description: string
  steps: TutorialStep[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime?: number
}

export interface TutorialStep {
  title: string
  description: string
  code?: string
  image?: string
  video?: string
  interactive?: boolean
}

export interface APIDocumentation {
  endpoint: string
  method: string
  description: string
  parameters?: ParameterDocumentation[]
  responses?: ResponseDocumentation[]
  examples?: APIExample[]
}

export interface ParameterDocumentation {
  name: string
  type: string
  required: boolean
  description: string
  example?: any
}

export interface ResponseDocumentation {
  status: number
  description: string
  schema?: JSONSchema
  example?: any
}

export interface APIExample {
  title: string
  description: string
  request: any
  response: any
}

export interface TroubleshootingEntry {
  problem: string
  symptoms: string[]
  causes: string[]
  solutions: string[]
  relatedIssues?: string[]
}

export interface EnhancedComponentMetadata {
  author: string
  contributors?: string[]
  version: string
  license: string
  repository?: string
  homepage?: string
  
  // Classification
  tags: string[]
  keywords: string[]
  category: string
  subcategory?: string
  
  // Requirements
  engines?: Record<string, string>
  peerDependencies?: Record<string, string>
  systemRequirements?: SystemRequirement[]
  
  // Quality metrics
  stability?: 'experimental' | 'alpha' | 'beta' | 'stable' | 'mature'
  performance?: PerformanceMetrics
  security?: SecurityMetrics
  
  // Community
  downloads?: number
  rating?: number
  reviews?: Review[]
  
  // Lifecycle
  created: string
  modified: string
  deprecated?: boolean
  deprecationNotice?: string
  replacementComponent?: string
}

export interface SystemRequirement {
  type: 'os' | 'memory' | 'cpu' | 'network' | 'storage'
  requirement: string
  optional?: boolean
}

export interface PerformanceMetrics {
  executionTime?: string
  memoryUsage?: string
  cpuUsage?: string
  networkRequests?: number
  benchmarkScore?: number
}

export interface SecurityMetrics {
  vulnerabilities?: VulnerabilityReport[]
  auditStatus?: 'pending' | 'passed' | 'failed' | 'not_applicable'
  lastAuditDate?: string
  securityLevel?: 'low' | 'medium' | 'high' | 'critical'
}

export interface VulnerabilityReport {
  id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  fixedInVersion?: string
  cve?: string
}

export interface Review {
  author: string
  rating: number
  comment: string
  date: string
  helpful?: number
}

export interface ExtensionPoint {
  id: string
  name: string
  description: string
  type: 'hook' | 'slot' | 'filter' | 'action'
  parameters?: Record<string, any>
}

export interface ComponentPlugin {
  id: string
  name: string
  description: string
  version: string
  extensionPoint: string
  implementation: string
  configuration?: Record<string, any>
}

export interface ScriptingConfiguration {
  enabled: boolean
  languages: ('javascript' | 'python' | 'lua')[]
  sandboxed: boolean
  api?: ScriptingAPI
  hooks?: ScriptingHook[]
}

export interface ScriptingAPI {
  globals: Record<string, any>
  functions: ScriptingFunction[]
  events: ScriptingEvent[]
}

export interface ScriptingFunction {
  name: string
  description: string
  parameters: ParameterDocumentation[]
  returns: any
  example?: string
}

export interface ScriptingEvent {
  name: string
  description: string
  payload: Record<string, any>
  cancellable?: boolean
}

export interface ScriptingHook {
  name: string
  description: string
  type: 'before' | 'after' | 'around' | 'filter'
  parameters: Record<string, any>
}

export interface ThemingConfiguration {
  enabled: boolean
  themes: ComponentTheme[]
  customizable: string[]
  variables?: ThemeVariable[]
}

export interface ComponentTheme {
  id: string
  name: string
  description: string
  variables: Record<string, any>
  styles?: Record<string, any>
}

export interface ThemeVariable {
  name: string
  type: 'color' | 'size' | 'font' | 'spacing' | 'border'
  description: string
  defaultValue: any
  options?: any[]
}

export interface LocalizationConfiguration {
  enabled: boolean
  defaultLocale: string
  supportedLocales: string[]
  translations?: Record<string, Record<string, string>>
  translationKeys?: string[]
}

// Template processing and validation
export class EnhancedTemplateProcessor {
  private static instance: EnhancedTemplateProcessor
  
  static getInstance(): EnhancedTemplateProcessor {
    if (!EnhancedTemplateProcessor.instance) {
      EnhancedTemplateProcessor.instance = new EnhancedTemplateProcessor()
    }
    return EnhancedTemplateProcessor.instance
  }

  // Process template and validate configuration
  async processTemplate(
    template: EnhancedComponentTemplate,
    configuration: Record<string, any>
  ): Promise<ProcessingResult> {
    const result: ProcessingResult = {
      valid: true,
      errors: [],
      warnings: [],
      processedConfig: { ...configuration },
      computedValues: new Map(),
      conditionalFields: new Map()
    }

    // Process sections in order
    for (const section of template.sections || []) {
      if (!this.evaluateCondition(section.conditional, configuration)) {
        continue
      }

      for (const fieldKey of section.fields) {
        const field = template.configuration.find(f => f.key === fieldKey)
        if (!field) continue

        const fieldResult = await this.processField(field, configuration[fieldKey], configuration)
        
        if (!fieldResult.valid) {
          result.valid = false
          result.errors.push(...fieldResult.errors.map(e => `${field.name}: ${e}`))
        }
        
        result.warnings.push(...fieldResult.warnings.map(w => `${field.name}: ${w}`))
        
        if (fieldResult.computedValue !== undefined) {
          result.computedValues.set(field.key, fieldResult.computedValue)
          result.processedConfig[field.key] = fieldResult.computedValue
        }
      }
    }

    return result
  }

  private async processField(
    field: EnhancedFieldDefinition,
    value: any,
    allValues: Record<string, any>
  ): Promise<FieldProcessingResult> {
    const result: FieldProcessingResult = {
      valid: true,
      errors: [],
      warnings: [],
      processedValue: value
    }

    // Check conditional visibility
    if (field.conditional && !this.evaluateCondition(field.conditional, allValues)) {
      return result
    }

    // Validate required fields
    if (field.required && (value === undefined || value === null || value === '')) {
      result.valid = false
      result.errors.push('This field is required')
      return result
    }

    // Process computed values
    if (field.computedValue) {
      try {
        result.computedValue = await this.computeValue(field.computedValue, allValues)
      } catch (error) {
        result.warnings.push(`Failed to compute value: ${error.message}`)
      }
    }

    // Type-specific processing
    switch (field.type) {
      case 'nested_object':
        result.processedValue = await this.processNestedObject(field, value, allValues)
        break
      case 'dynamic_array':
        result.processedValue = await this.processDynamicArray(field, value, allValues)
        break
      case 'conditional_group':
        result.processedValue = await this.processConditionalGroups(field, value, allValues)
        break
      case 'matrix':
        result.processedValue = await this.processMatrix(field, value, allValues)
        break
      default:
        result.processedValue = await this.processBasicField(field, value, allValues)
    }

    // Run validation rules
    if (field.validation) {
      for (const rule of field.validation) {
        const validationResult = await rule.validator(result.processedValue, {
          nodeId: 'template',
          fieldKey: field.key,
          allValues
        })

        if (!validationResult.valid) {
          if (rule.severity === 'error') {
            result.valid = false
            result.errors.push(...(validationResult.errors || []))
          } else if (rule.severity === 'warning') {
            result.warnings.push(...(validationResult.warnings || []))
          }
        }
      }
    }

    return result
  }

  private evaluateCondition(condition: ConditionalRule | undefined, values: Record<string, any>): boolean {
    if (!condition) return true

    if (condition.expression) {
      try {
        const func = new Function('values', `return ${condition.expression}`)
        return func(values)
      } catch {
        return false
      }
    }

    if (condition.function) {
      return condition.function(values)
    }

    if (condition.field) {
      const fieldValue = values[condition.field]
      return this.evaluateSimpleCondition(fieldValue, condition.operator, condition.value)
    }

    return true
  }

  private evaluateSimpleCondition(fieldValue: any, operator: ConditionalOperator, compareValue: any): boolean {
    switch (operator) {
      case 'equals': return fieldValue === compareValue
      case 'not_equals': return fieldValue !== compareValue
      case 'greater_than': return Number(fieldValue) > Number(compareValue)
      case 'less_than': return Number(fieldValue) < Number(compareValue)
      case 'contains': return String(fieldValue).includes(String(compareValue))
      case 'is_empty': return !fieldValue || fieldValue === ''
      case 'is_not_empty': return !!fieldValue && fieldValue !== ''
      default: return true
    }
  }

  private async computeValue(computed: ComputedValue, values: Record<string, any>): Promise<any> {
    try {
      const func = new Function('values', `return ${computed.expression}`)
      return func(values)
    } catch (error) {
      throw new Error(`Computation failed: ${error.message}`)
    }
  }

  private async processNestedObject(
    field: EnhancedFieldDefinition,
    value: any,
    allValues: Record<string, any>
  ): Promise<any> {
    if (!field.nested || !value) return value

    const result = { ...value }

    for (const nestedField of field.nested.schema) {
      const nestedResult = await this.processField(nestedField, value[nestedField.key], { ...allValues, ...value })
      if (nestedResult.processedValue !== undefined) {
        result[nestedField.key] = nestedResult.processedValue
      }
    }

    return result
  }

  private async processDynamicArray(
    field: EnhancedFieldDefinition,
    value: any,
    allValues: Record<string, any>
  ): Promise<any> {
    if (!field.array || !Array.isArray(value)) return value

    const result = []

    for (const item of value) {
      if (field.array.itemSchema) {
        const itemResult = await this.processField(field.array.itemSchema, item, allValues)
        result.push(itemResult.processedValue)
      } else {
        result.push(item)
      }
    }

    return result
  }

  private async processConditionalGroups(
    field: EnhancedFieldDefinition,
    value: any,
    allValues: Record<string, any>
  ): Promise<any> {
    if (!field.conditional_groups) return value

    const result = { ...value }

    for (const group of field.conditional_groups) {
      if (this.evaluateCondition(group.condition, allValues)) {
        for (const groupField of group.fields) {
          const groupResult = await this.processField(groupField, value[groupField.key], allValues)
          if (groupResult.processedValue !== undefined) {
            result[groupField.key] = groupResult.processedValue
          }
        }
      }
    }

    return result
  }

  private async processMatrix(
    field: EnhancedFieldDefinition,
    value: any,
    allValues: Record<string, any>
  ): Promise<any> {
    // Matrix processing implementation
    return value
  }

  private async processBasicField(
    field: EnhancedFieldDefinition,
    value: any,
    allValues: Record<string, any>
  ): Promise<any> {
    // Basic field processing
    return value
  }
}

export interface ProcessingResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  processedConfig: Record<string, any>
  computedValues: Map<string, any>
  conditionalFields: Map<string, boolean>
}

export interface FieldProcessingResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  processedValue: any
  computedValue?: any
}

// Global template processor
export const templateProcessor = EnhancedTemplateProcessor.getInstance()