/**
 * Component Versioning and Migration System
 * Handles backwards compatibility, version migrations, and component evolution
 */

import { ComponentDefinition, EnhancedComponentTemplate } from './types'
import { pluginRegistry } from './plugin-registry'

// Version management
export interface ComponentVersion {
  version: string
  major: number
  minor: number
  patch: number
  prerelease?: string
  build?: string
  released: string
  deprecated?: boolean
  deprecationNotice?: string
  supportUntil?: string
}

export interface VersionRange {
  min?: string
  max?: string
  exact?: string
  exclude?: string[]
}

export interface ComponentCompatibility {
  componentId: string
  version: string
  compatibleWith: VersionRange[]
  incompatibleWith: VersionRange[]
  breaking: boolean
  migrations: Migration[]
  deprecations: Deprecation[]
}

export interface Migration {
  id: string
  fromVersion: string
  toVersion: string
  type: 'automatic' | 'manual' | 'assisted'
  description: string
  breaking: boolean
  steps: MigrationStep[]
  estimatedTime?: number
  backupRequired?: boolean
  rollbackSupported?: boolean
}

export interface MigrationStep {
  id: string
  description: string
  type: 'config' | 'data' | 'code' | 'manual'
  transformer?: DataTransformer
  validator?: Validator
  instructions?: string
  requiresUserInput?: boolean
}

export interface Deprecation {
  feature: string
  version: string
  removalVersion: string
  reason: string
  alternative?: string
  migrationPath?: string
}

export interface DataTransformer {
  transform: (data: any, context: MigrationContext) => Promise<TransformationResult>
  validate?: (data: any) => boolean
  rollback?: (data: any, originalData: any) => Promise<any>
}

export interface Validator {
  validate: (data: any, context: ValidationContext) => Promise<ValidationResult>
  fix?: (data: any, issues: ValidationIssue[]) => Promise<any>
}

export interface MigrationContext {
  fromVersion: string
  toVersion: string
  componentId: string
  workflowId?: string
  userId?: string
  timestamp: number
  dryRun: boolean
  backup?: ComponentBackup
}

export interface ValidationContext {
  version: string
  componentId: string
  strict: boolean
  environment: 'development' | 'staging' | 'production'
}

export interface TransformationResult {
  success: boolean
  data: any
  warnings: string[]
  errors: string[]
  manualStepsRequired: string[]
}

export interface ValidationResult {
  valid: boolean
  issues: ValidationIssue[]
  fixable: ValidationIssue[]
  critical: ValidationIssue[]
}

export interface ValidationIssue {
  id: string
  type: 'error' | 'warning' | 'info'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  field?: string
  suggestion?: string
  fixable: boolean
}

export interface ComponentBackup {
  id: string
  componentId: string
  version: string
  data: any
  metadata: any
  created: string
  size: number
}

// Version management system
export class VersionManager {
  private static instance: VersionManager
  private versions = new Map<string, ComponentVersion[]>()
  private compatibility = new Map<string, ComponentCompatibility[]>()
  private migrations = new Map<string, Migration[]>()

  static getInstance(): VersionManager {
    if (!VersionManager.instance) {
      VersionManager.instance = new VersionManager()
    }
    return VersionManager.instance
  }

  // Version parsing and comparison
  parseVersion(version: string): ComponentVersion {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-([^+]+))?(?:\+(.+))?$/)
    if (!match) {
      throw new Error(`Invalid version format: ${version}`)
    }

    const [, major, minor, patch, prerelease, build] = match

    return {
      version,
      major: parseInt(major),
      minor: parseInt(minor),
      patch: parseInt(patch),
      prerelease,
      build,
      released: new Date().toISOString()
    }
  }

  compareVersions(version1: string, version2: string): number {
    const v1 = this.parseVersion(version1)
    const v2 = this.parseVersion(version2)

    // Compare major.minor.patch
    if (v1.major !== v2.major) return v1.major - v2.major
    if (v1.minor !== v2.minor) return v1.minor - v2.minor
    if (v1.patch !== v2.patch) return v1.patch - v2.patch

    // Handle prerelease
    if (v1.prerelease && !v2.prerelease) return -1
    if (!v1.prerelease && v2.prerelease) return 1
    if (v1.prerelease && v2.prerelease) {
      return v1.prerelease.localeCompare(v2.prerelease)
    }

    return 0
  }

  isCompatible(version: string, range: VersionRange): boolean {
    if (range.exact) {
      return version === range.exact
    }

    const comparison = (v: string) => this.compareVersions(version, v)

    if (range.min && comparison(range.min) < 0) return false
    if (range.max && comparison(range.max) > 0) return false
    if (range.exclude?.some(v => version === v)) return false

    return true
  }

  getLatestVersion(componentId: string): ComponentVersion | null {
    const versions = this.versions.get(componentId)
    if (!versions || versions.length === 0) return null

    return versions
      .filter(v => !v.deprecated)
      .sort((a, b) => this.compareVersions(b.version, a.version))[0] || null
  }

  getStableVersion(componentId: string): ComponentVersion | null {
    const versions = this.versions.get(componentId)
    if (!versions) return null

    return versions
      .filter(v => !v.deprecated && !v.prerelease)
      .sort((a, b) => this.compareVersions(b.version, a.version))[0] || null
  }

  // Migration management
  registerMigration(migration: Migration): void {
    const key = migration.id
    if (!this.migrations.has(key)) {
      this.migrations.set(key, [])
    }
    this.migrations.get(key)!.push(migration)
  }

  findMigrationPath(
    componentId: string,
    fromVersion: string,
    toVersion: string
  ): Migration[] {
    const path: Migration[] = []
    const visited = new Set<string>()

    const findPath = (currentVersion: string, targetVersion: string): boolean => {
      if (currentVersion === targetVersion) return true
      if (visited.has(currentVersion)) return false

      visited.add(currentVersion)

      const migrations = this.getMigrationsFrom(componentId, currentVersion)

      for (const migration of migrations) {
        if (this.compareVersions(migration.toVersion, targetVersion) <= 0) {
          path.push(migration)
          if (findPath(migration.toVersion, targetVersion)) {
            return true
          }
          path.pop()
        }
      }

      return false
    }

    if (findPath(fromVersion, toVersion)) {
      return path
    }

    return []
  }

  private getMigrationsFrom(componentId: string, version: string): Migration[] {
    const allMigrations = Array.from(this.migrations.values()).flat()
    return allMigrations.filter(m => 
      m.fromVersion === version || this.isCompatible(version, { min: m.fromVersion })
    )
  }

  // Component migration execution
  async migrateComponent(
    componentId: string,
    fromVersion: string,
    toVersion: string,
    data: any,
    options: MigrationOptions = {}
  ): Promise<MigrationResult> {
    const migrationPath = this.findMigrationPath(componentId, fromVersion, toVersion)
    
    if (migrationPath.length === 0) {
      throw new Error(`No migration path found from ${fromVersion} to ${toVersion}`)
    }

    const context: MigrationContext = {
      fromVersion,
      toVersion,
      componentId,
      workflowId: options.workflowId,
      userId: options.userId,
      timestamp: Date.now(),
      dryRun: options.dryRun || false,
      backup: options.createBackup ? await this.createBackup(componentId, fromVersion, data) : undefined
    }

    const result: MigrationResult = {
      success: true,
      fromVersion,
      toVersion,
      migratedData: { ...data },
      steps: [],
      warnings: [],
      errors: [],
      manualStepsRequired: [],
      rollbackSupported: true,
      duration: 0
    }

    const startTime = Date.now()

    try {
      for (const migration of migrationPath) {
        const stepResult = await this.executeMigration(migration, result.migratedData, context)
        
        result.steps.push({
          migrationId: migration.id,
          fromVersion: migration.fromVersion,
          toVersion: migration.toVersion,
          success: stepResult.success,
          warnings: stepResult.warnings,
          errors: stepResult.errors
        })

        if (!stepResult.success) {
          result.success = false
          result.errors.push(...stepResult.errors)
          break
        }

        result.migratedData = stepResult.data
        result.warnings.push(...stepResult.warnings)
        result.manualStepsRequired.push(...stepResult.manualStepsRequired)

        if (!migration.rollbackSupported) {
          result.rollbackSupported = false
        }
      }
    } catch (error) {
      result.success = false
      result.errors.push(`Migration failed: ${error.message}`)
    }

    result.duration = Date.now() - startTime

    return result
  }

  private async executeMigration(
    migration: Migration,
    data: any,
    context: MigrationContext
  ): Promise<TransformationResult> {
    const result: TransformationResult = {
      success: true,
      data: { ...data },
      warnings: [],
      errors: [],
      manualStepsRequired: []
    }

    for (const step of migration.steps) {
      try {
        const stepResult = await this.executeStep(step, result.data, context)
        
        if (!stepResult.success) {
          result.success = false
          result.errors.push(...stepResult.errors)
          break
        }

        result.data = stepResult.data
        result.warnings.push(...stepResult.warnings)
        result.manualStepsRequired.push(...stepResult.manualStepsRequired)

      } catch (error) {
        result.success = false
        result.errors.push(`Step ${step.id} failed: ${error.message}`)
        break
      }
    }

    return result
  }

  private async executeStep(
    step: MigrationStep,
    data: any,
    context: MigrationContext
  ): Promise<TransformationResult> {
    switch (step.type) {
      case 'config':
        return await this.executeConfigStep(step, data, context)
      case 'data':
        return await this.executeDataStep(step, data, context)
      case 'code':
        return await this.executeCodeStep(step, data, context)
      case 'manual':
        return await this.executeManualStep(step, data, context)
      default:
        throw new Error(`Unknown step type: ${step.type}`)
    }
  }

  private async executeConfigStep(
    step: MigrationStep,
    data: any,
    context: MigrationContext
  ): Promise<TransformationResult> {
    if (!step.transformer) {
      return {
        success: true,
        data,
        warnings: [],
        errors: [],
        manualStepsRequired: []
      }
    }

    return await step.transformer.transform(data, context)
  }

  private async executeDataStep(
    step: MigrationStep,
    data: any,
    context: MigrationContext
  ): Promise<TransformationResult> {
    // Data transformation logic
    return await this.executeConfigStep(step, data, context)
  }

  private async executeCodeStep(
    step: MigrationStep,
    data: any,
    context: MigrationContext
  ): Promise<TransformationResult> {
    // Code transformation logic
    return await this.executeConfigStep(step, data, context)
  }

  private async executeManualStep(
    step: MigrationStep,
    data: any,
    context: MigrationContext
  ): Promise<TransformationResult> {
    return {
      success: true,
      data,
      warnings: [],
      errors: [],
      manualStepsRequired: [step.instructions || step.description]
    }
  }

  // Backup management
  async createBackup(
    componentId: string,
    version: string,
    data: any
  ): Promise<ComponentBackup> {
    const backup: ComponentBackup = {
      id: `backup_${componentId}_${Date.now()}`,
      componentId,
      version,
      data: JSON.parse(JSON.stringify(data)), // Deep clone
      metadata: {
        created: new Date().toISOString(),
        creator: 'version-manager'
      },
      created: new Date().toISOString(),
      size: JSON.stringify(data).length
    }

    // Store backup (implementation depends on storage solution)
    await this.storeBackup(backup)

    return backup
  }

  private async storeBackup(backup: ComponentBackup): Promise<void> {
    // Store backup in storage system
    // Implementation depends on chosen storage solution
  }

  async restoreBackup(backupId: string): Promise<ComponentBackup> {
    // Restore backup from storage
    throw new Error('Backup restoration not implemented')
  }

  // Validation
  async validateComponent(
    componentId: string,
    version: string,
    data: any,
    context: ValidationContext
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      issues: [],
      fixable: [],
      critical: []
    }

    // Get component definition
    const component = pluginRegistry.getComponent(componentId)
    if (!component) {
      result.valid = false
      result.issues.push({
        id: 'component_not_found',
        type: 'error',
        severity: 'critical',
        message: `Component ${componentId} not found`,
        fixable: false
      })
      return result
    }

    // Version compatibility check
    if (component.version !== version) {
      const issue: ValidationIssue = {
        id: 'version_mismatch',
        type: 'warning',
        severity: 'medium',
        message: `Version mismatch: expected ${component.version}, got ${version}`,
        fixable: true,
        suggestion: `Migrate to version ${component.version}`
      }
      result.issues.push(issue)
      result.fixable.push(issue)
    }

    // Validate configuration against template
    if (component.template) {
      const configValidation = await this.validateConfiguration(
        component.template,
        data.config || {},
        context
      )
      
      result.issues.push(...configValidation.issues)
      result.fixable.push(...configValidation.fixable)
      result.critical.push(...configValidation.critical)
      
      if (!configValidation.valid) {
        result.valid = false
      }
    }

    return result
  }

  private async validateConfiguration(
    template: EnhancedComponentTemplate,
    config: Record<string, any>,
    context: ValidationContext
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      issues: [],
      fixable: [],
      critical: []
    }

    for (const field of template.configuration) {
      const value = config[field.key]

      // Required field check
      if (field.required && (value === undefined || value === null)) {
        const issue: ValidationIssue = {
          id: `required_${field.key}`,
          type: 'error',
          severity: 'high',
          message: `Required field '${field.name}' is missing`,
          field: field.key,
          fixable: !!field.defaultValue,
          suggestion: field.defaultValue ? `Use default value: ${field.defaultValue}` : undefined
        }
        
        result.valid = false
        result.issues.push(issue)
        
        if (issue.fixable) {
          result.fixable.push(issue)
        } else {
          result.critical.push(issue)
        }
      }

      // Type validation
      if (value !== undefined && field.validation) {
        for (const rule of field.validation) {
          try {
            const ruleResult = await rule.validator(value, {
              nodeId: 'validation',
              fieldKey: field.key,
              allValues: config
            })

            if (!ruleResult.valid) {
              const severity = rule.severity === 'error' ? 'high' : 
                            rule.severity === 'warning' ? 'medium' : 'low'

              const issue: ValidationIssue = {
                id: `validation_${field.key}_${rule.id}`,
                type: rule.severity,
                severity: severity as any,
                message: ruleResult.errors?.[0] || `Validation failed for ${field.name}`,
                field: field.key,
                fixable: false
              }

              result.issues.push(issue)

              if (rule.severity === 'error') {
                result.valid = false
                result.critical.push(issue)
              }
            }
          } catch (error) {
            // Validation rule itself failed
            result.issues.push({
              id: `rule_error_${field.key}_${rule.id}`,
              type: 'error',
              severity: 'medium',
              message: `Validation rule failed: ${error.message}`,
              field: field.key,
              fixable: false
            })
          }
        }
      }
    }

    return result
  }

  // Deprecation management
  getDeprecations(componentId: string, version: string): Deprecation[] {
    const compatibility = this.compatibility.get(componentId)
    if (!compatibility) return []

    return compatibility
      .filter(c => c.version === version)
      .flatMap(c => c.deprecations)
  }

  isDeprecated(componentId: string, version: string): boolean {
    const componentVersion = this.versions.get(componentId)?.find(v => v.version === version)
    return componentVersion?.deprecated || false
  }

  // Auto-update recommendations
  getUpdateRecommendations(
    componentId: string,
    currentVersion: string
  ): UpdateRecommendation[] {
    const recommendations: UpdateRecommendation[] = []
    const latest = this.getLatestVersion(componentId)
    const stable = this.getStableVersion(componentId)

    if (latest && this.compareVersions(currentVersion, latest.version) < 0) {
      recommendations.push({
        type: 'latest',
        fromVersion: currentVersion,
        toVersion: latest.version,
        priority: 'medium',
        reason: 'Latest version available with new features',
        breaking: this.isBreakingChange(componentId, currentVersion, latest.version),
        effort: this.estimateMigrationEffort(componentId, currentVersion, latest.version)
      })
    }

    if (stable && stable.version !== latest?.version && 
        this.compareVersions(currentVersion, stable.version) < 0) {
      recommendations.push({
        type: 'stable',
        fromVersion: currentVersion,
        toVersion: stable.version,
        priority: 'high',
        reason: 'More stable version available',
        breaking: this.isBreakingChange(componentId, currentVersion, stable.version),
        effort: this.estimateMigrationEffort(componentId, currentVersion, stable.version)
      })
    }

    if (this.isDeprecated(componentId, currentVersion)) {
      recommendations.push({
        type: 'security',
        fromVersion: currentVersion,
        toVersion: latest?.version || stable?.version || currentVersion,
        priority: 'critical',
        reason: 'Current version is deprecated',
        breaking: true,
        effort: 'high'
      })
    }

    return recommendations
  }

  private isBreakingChange(componentId: string, fromVersion: string, toVersion: string): boolean {
    const path = this.findMigrationPath(componentId, fromVersion, toVersion)
    return path.some(m => m.breaking)
  }

  private estimateMigrationEffort(
    componentId: string,
    fromVersion: string,
    toVersion: string
  ): 'low' | 'medium' | 'high' {
    const path = this.findMigrationPath(componentId, fromVersion, toVersion)
    
    if (path.length === 0) return 'low'
    if (path.some(m => m.type === 'manual')) return 'high'
    if (path.some(m => m.breaking)) return 'medium'
    
    return 'low'
  }
}

// Interfaces
export interface MigrationOptions {
  dryRun?: boolean
  createBackup?: boolean
  workflowId?: string
  userId?: string
}

export interface MigrationResult {
  success: boolean
  fromVersion: string
  toVersion: string
  migratedData: any
  steps: MigrationStepResult[]
  warnings: string[]
  errors: string[]
  manualStepsRequired: string[]
  rollbackSupported: boolean
  duration: number
}

export interface MigrationStepResult {
  migrationId: string
  fromVersion: string
  toVersion: string
  success: boolean
  warnings: string[]
  errors: string[]
}

export interface UpdateRecommendation {
  type: 'latest' | 'stable' | 'security' | 'feature'
  fromVersion: string
  toVersion: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  reason: string
  breaking: boolean
  effort: 'low' | 'medium' | 'high'
  benefits?: string[]
  risks?: string[]
}

// Global version manager
export const versionManager = VersionManager.getInstance()

// Built-in migrations for common scenarios
export const commonMigrations: Migration[] = [
  {
    id: 'config_field_rename',
    fromVersion: '*',
    toVersion: '*',
    type: 'automatic',
    description: 'Rename configuration fields',
    breaking: false,
    steps: [{
      id: 'rename_fields',
      description: 'Rename configuration fields',
      type: 'config',
      transformer: {
        transform: async (data: any, context: MigrationContext) => {
          // Generic field renaming logic
          return {
            success: true,
            data: data,
            warnings: [],
            errors: [],
            manualStepsRequired: []
          }
        }
      }
    }]
  },
  
  {
    id: 'add_default_values',
    fromVersion: '*',
    toVersion: '*',
    type: 'automatic',
    description: 'Add default values for new fields',
    breaking: false,
    steps: [{
      id: 'add_defaults',
      description: 'Add default values for new configuration fields',
      type: 'config',
      transformer: {
        transform: async (data: any, context: MigrationContext) => {
          // Add default values logic
          return {
            success: true,
            data: data,
            warnings: [],
            errors: [],
            manualStepsRequired: []
          }
        }
      }
    }]
  }
]