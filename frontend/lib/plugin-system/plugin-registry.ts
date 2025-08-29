/**
 * Plugin Registry System for Unite DeFi
 * Allows runtime loading and registration of node components
 */

import { ComponentTemplate, DataType, ValidationRule } from './types'

export interface PluginManifest {
  id: string
  name: string
  version: string
  author: string
  description: string
  tags: string[]
  dependencies: string[]
  components: ComponentDefinition[]
  scripts?: {
    install?: string
    uninstall?: string
    postInstall?: string
  }
  permissions: PluginPermission[]
  compatibility: {
    minVersion: string
    maxVersion?: string
  }
}

export interface ComponentDefinition {
  id: string
  name: string
  description: string
  category: string
  icon: string
  color: string
  version: string
  template: ComponentTemplate
  executor: ExecutorDefinition
  examples?: ComponentExample[]
}

export interface ExecutorDefinition {
  type: 'javascript' | 'python' | 'native'
  code?: string
  module?: string
  function?: string
  dependencies?: string[]
  environment?: Record<string, any>
}

export interface PluginPermission {
  type: 'network' | 'storage' | 'execution' | 'blockchain' | 'filesystem'
  scope: string[]
  required: boolean
}

export interface ComponentExample {
  name: string
  description: string
  inputs: Record<string, any>
  expectedOutputs: Record<string, any>
  workflow?: any // Optional workflow definition
}

export class PluginRegistry {
  private static instance: PluginRegistry
  private plugins = new Map<string, PluginManifest>()
  private components = new Map<string, ComponentDefinition>()
  private executors = new Map<string, ExecutorDefinition>()
  private eventListeners = new Map<string, Function[]>()

  static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry()
    }
    return PluginRegistry.instance
  }

  // Plugin management
  async registerPlugin(manifest: PluginManifest): Promise<boolean> {
    try {
      // Validate plugin
      const validation = await this.validatePlugin(manifest)
      if (!validation.valid) {
        throw new Error(`Plugin validation failed: ${validation.errors.join(', ')}`)
      }

      // Check compatibility
      if (!this.isCompatible(manifest)) {
        throw new Error(`Plugin ${manifest.name} is not compatible with current version`)
      }

      // Install plugin
      if (manifest.scripts?.install) {
        await this.executeScript(manifest.scripts.install, manifest)
      }

      // Register components
      for (const component of manifest.components) {
        this.components.set(component.id, {
          ...component,
          pluginId: manifest.id
        } as ComponentDefinition & { pluginId: string })
        
        if (component.executor) {
          this.executors.set(component.id, component.executor)
        }
      }

      // Store plugin
      this.plugins.set(manifest.id, manifest)

      // Post-install script
      if (manifest.scripts?.postInstall) {
        await this.executeScript(manifest.scripts.postInstall, manifest)
      }

      this.emit('plugin-registered', { plugin: manifest })
      return true

    } catch (error) {
      console.error(`Failed to register plugin ${manifest.name}:`, error)
      return false
    }
  }

  async unregisterPlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) return false

    try {
      // Uninstall script
      if (plugin.scripts?.uninstall) {
        await this.executeScript(plugin.scripts.uninstall, plugin)
      }

      // Remove components
      for (const component of plugin.components) {
        this.components.delete(component.id)
        this.executors.delete(component.id)
      }

      // Remove plugin
      this.plugins.delete(pluginId)

      this.emit('plugin-unregistered', { pluginId })
      return true

    } catch (error) {
      console.error(`Failed to unregister plugin ${plugin.name}:`, error)
      return false
    }
  }

  // Component discovery
  getComponent(id: string): ComponentDefinition | null {
    return this.components.get(id) || null
  }

  getComponents(category?: string): ComponentDefinition[] {
    const components = Array.from(this.components.values())
    return category 
      ? components.filter(c => c.category === category)
      : components
  }

  getExecutor(componentId: string): ExecutorDefinition | null {
    return this.executors.get(componentId) || null
  }

  // Plugin discovery
  async discoverPlugins(): Promise<PluginManifest[]> {
    const discovered: PluginManifest[] = []

    // Check local plugin directory
    try {
      const localPlugins = await this.scanLocalPlugins()
      discovered.push(...localPlugins)
    } catch (error) {
      console.warn('Failed to scan local plugins:', error)
    }

    // Check remote registry
    try {
      const remotePlugins = await this.fetchRemotePlugins()
      discovered.push(...remotePlugins)
    } catch (error) {
      console.warn('Failed to fetch remote plugins:', error)
    }

    return discovered
  }

  // Runtime loading
  async loadPluginFromURL(url: string): Promise<boolean> {
    try {
      const response = await fetch(url)
      const manifest: PluginManifest = await response.json()
      return await this.registerPlugin(manifest)
    } catch (error) {
      console.error('Failed to load plugin from URL:', error)
      return false
    }
  }

  async loadPluginFromFile(file: File): Promise<boolean> {
    try {
      const text = await file.text()
      const manifest: PluginManifest = JSON.parse(text)
      return await this.registerPlugin(manifest)
    } catch (error) {
      console.error('Failed to load plugin from file:', error)
      return false
    }
  }

  // Validation
  private async validatePlugin(manifest: PluginManifest): Promise<{valid: boolean, errors: string[]}> {
    const errors: string[] = []

    // Required fields
    if (!manifest.id) errors.push('Plugin ID is required')
    if (!manifest.name) errors.push('Plugin name is required')
    if (!manifest.version) errors.push('Plugin version is required')
    if (!manifest.components || manifest.components.length === 0) {
      errors.push('Plugin must contain at least one component')
    }

    // Validate components
    for (const component of manifest.components || []) {
      if (!component.id) errors.push(`Component missing ID`)
      if (!component.name) errors.push(`Component ${component.id} missing name`)
      if (!component.template) errors.push(`Component ${component.id} missing template`)
    }

    // Check for conflicts
    for (const component of manifest.components || []) {
      if (this.components.has(component.id)) {
        errors.push(`Component ${component.id} already exists`)
      }
    }

    return { valid: errors.length === 0, errors }
  }

  private isCompatible(manifest: PluginManifest): boolean {
    const currentVersion = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
    // Implement semver compatibility check
    return true // Simplified for now
  }

  private async executeScript(script: string, context: PluginManifest): Promise<void> {
    // Implement secure script execution
    // This should run in a sandboxed environment
    try {
      const func = new Function('plugin', 'registry', script)
      await func(context, this)
    } catch (error) {
      console.error('Script execution failed:', error)
      throw error
    }
  }

  private async scanLocalPlugins(): Promise<PluginManifest[]> {
    // In a real implementation, this would scan the local filesystem
    // For web, we could scan a known directory structure
    return []
  }

  private async fetchRemotePlugins(): Promise<PluginManifest[]> {
    // Fetch from remote plugin registry
    try {
      const response = await fetch('/api/plugins/registry')
      return await response.json()
    } catch {
      return []
    }
  }

  // Event system
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(listener)
  }

  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(listener => listener(data))
    }
  }

  // Plugin marketplace integration
  async searchMarketplace(query: string): Promise<PluginManifest[]> {
    try {
      const response = await fetch(`/api/plugins/search?q=${encodeURIComponent(query)}`)
      return await response.json()
    } catch (error) {
      console.error('Marketplace search failed:', error)
      return []
    }
  }

  async installFromMarketplace(pluginId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/plugins/install/${pluginId}`, {
        method: 'POST'
      })
      const manifest = await response.json()
      return await this.registerPlugin(manifest)
    } catch (error) {
      console.error('Marketplace installation failed:', error)
      return false
    }
  }

  // Export/Import plugins
  exportPlugin(pluginId: string): string | null {
    const plugin = this.plugins.get(pluginId)
    return plugin ? JSON.stringify(plugin, null, 2) : null
  }

  async importPlugin(pluginData: string): Promise<boolean> {
    try {
      const manifest: PluginManifest = JSON.parse(pluginData)
      return await this.registerPlugin(manifest)
    } catch (error) {
      console.error('Plugin import failed:', error)
      return false
    }
  }

  // Additional methods needed by the unite plugin system
  getAllPlugins(): ComponentDefinition[] {
    return Array.from(this.components.values())
  }

  getComponentsByCategory(category: string): ComponentDefinition[] {
    return this.getComponents(category)
  }

  searchComponents(query: string): ComponentDefinition[] {
    const components = Array.from(this.components.values())
    return components.filter(component => 
      component.name.toLowerCase().includes(query.toLowerCase()) ||
      component.description.toLowerCase().includes(query.toLowerCase()) ||
      component.category.toLowerCase().includes(query.toLowerCase())
    )
  }

  getPlugins(): PluginManifest[] {
    return Array.from(this.plugins.values())
  }

  async registerComponent(component: ComponentDefinition): Promise<void> {
    // Create a simple plugin manifest for the component
    const pluginManifest: PluginManifest = {
      id: `builtin-${component.id}`,
      name: component.name,
      version: component.version || '1.0.0',
      author: component.author || 'Unite DeFi',
      description: component.description,
      tags: component.tags || [],
      dependencies: component.dependencies || [],
      components: [component],
      permissions: component.permissions || [],
      compatibility: {
        minVersion: '1.0.0'
      }
    }

    await this.registerPlugin(pluginManifest)
  }
}

// Global plugin registry instance
export const pluginRegistry = PluginRegistry.getInstance()

// Helper functions
export function registerGlobalPlugin(manifest: PluginManifest): Promise<boolean> {
  return pluginRegistry.registerPlugin(manifest)
}

export function getGlobalComponent(id: string): ComponentDefinition | null {
  return pluginRegistry.getComponent(id)
}

export function getAllComponents(): ComponentDefinition[] {
  return pluginRegistry.getComponents()
}