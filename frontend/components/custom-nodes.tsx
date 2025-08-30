"use client"

import React from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Coins, Vote, Layout, Server, Bot, Repeat, Link, Clock, Database, 
  Wallet, TrendingUp, Activity, Search, Zap, Play, Square, AlertCircle,
  CheckCircle, Loader2, Code, Settings, MoreHorizontal
} from "lucide-react"

// Import the new plugin system
import { unitePluginSystem } from "@/lib/unite-plugin-system"
import { pluginRegistry } from "@/lib/plugin-system/plugin-registry"
import { connectionValidator } from "@/lib/plugin-system/connection-validator"
import { codeExecutionEngine } from "@/lib/plugin-system/code-execution"
import type { 
  ComponentDefinition, 
  EnhancedComponentTemplate, 
  DataType,
  ExecutionResult
} from "@/lib/plugin-system/types"

// Enhanced NodeProps with plugin system integration
interface EnhancedNodeProps extends NodeProps {
  data: {
    componentId: string
    config?: Record<string, any>
    executionState?: ExecutionState
    outputs?: Record<string, any>
    [key: string]: any
  }
}

interface ExecutionState {
  status: 'idle' | 'running' | 'success' | 'error' | 'cancelled'
  startTime?: number
  duration?: number
  error?: string
  progress?: number
}

interface NodeExecutionContext {
  nodeId: string
  workflowId: string
  inputs: Record<string, any>
  config: Record<string, any>
}

// Plugin-based node props
interface PluginNodeProps extends EnhancedNodeProps {
  onExecute?: (nodeId: string) => Promise<void>
  onConfigUpdate?: (nodeId: string, config: Record<string, any>) => void
  onOutputsUpdate?: (nodeId: string, outputs: Record<string, any>) => void
  isSelected?: boolean
  isConnecting?: boolean
}

// Universal Plugin Node Component
const UniversalPluginNode: React.FC<PluginNodeProps> = ({
  id,
  data,
  selected,
  onExecute,
  onConfigUpdate,
  onOutputsUpdate
}) => {
  const [component, setComponent] = React.useState<ComponentDefinition | null>(null)
  const [executionState, setExecutionState] = React.useState<ExecutionState>({ status: 'idle' })
  const [outputs, setOutputs] = React.useState<Record<string, any>>(data.outputs || {})
  const [showConfig, setShowConfig] = React.useState(false)

  // Load component definition
  React.useEffect(() => {
    const loadComponent = async () => {
      const comp = pluginRegistry.getComponent(data.componentId)
      console.log('Loading component:', {
        componentId: data.componentId,
        component: comp,
        inputs: comp?.template?.inputs,
        outputs: comp?.template?.outputs,
        fields: comp?.template?.fields || comp?.template?.configuration
      })
      setComponent(comp)
    }
    
    if (data.componentId) {
      loadComponent()
    }
  }, [data.componentId])

  // Check if configuration is complete
  const isConfigurationComplete = () => {
    if (!component?.template?.configuration && !component?.template?.fields) return true
    
    const fields = component.template?.configuration || component.template?.fields || []
    const requiredFields = fields.filter(field => field.required)
    
    if (requiredFields.length === 0) return true
    
    return requiredFields.every(field => {
      const value = data.config?.[field.key]
      if (value === undefined || value === null || value === '') return false
      // Don't consider demo/template values as valid configuration
      if (typeof value === 'string' && value.includes('template-mode-demo-key')) return false
      return true
    })
  }

  // Handle node execution
  const handleExecute = async () => {
    if (!component || executionState.status === 'running') return

    // Validate configuration before execution
    if (!isConfigurationComplete()) {
      setExecutionState({
        status: 'error',
        error: 'Configuration incomplete. Please configure all required parameters.',
        duration: 0
      })
      return
    }

    setExecutionState({ status: 'running', startTime: Date.now() })
    
    try {
      const result = await unitePluginSystem.executeWorkflow({
        nodes: [{ id: id!, type: data.componentId, config: data.config }],
        connections: []
      })
      
      if (result.success) {
        // Handle different result structures
        const nodeOutputs = result.nodeResults?.[0]?.outputs || 
                           result.outputs || 
                           Object.values(result.outputs || {})[0] || {}
        setOutputs(nodeOutputs)
        setExecutionState({ 
          status: 'success', 
          duration: result.duration,
          startTime: executionState.startTime
        })
        onOutputsUpdate?.(id!, nodeOutputs)
      } else {
        throw new Error(result.errors[0] || 'Execution failed')
      }
    } catch (error) {
      setExecutionState({ 
        status: 'error', 
        error: error.message,
        duration: Date.now() - (executionState.startTime || Date.now())
      })
    }
  }

  if (!component) {
    return (
      <Card className="min-w-[200px] border-2 border-dashed border-gray-300">
        <CardContent className="p-4 text-center">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <div className="text-sm text-gray-500">Component not found</div>
          <div className="text-xs text-gray-400">{data.componentId}</div>
      </CardContent>
    </Card>
  )
}

  const getNodeStateClasses = () => {
    if (executionState.status === 'error') return "ring-2 ring-red-500 bg-red-50"
    if (executionState.status === 'running') return "ring-2 ring-yellow-500 bg-yellow-50"
    if (executionState.status === 'success') return "ring-2 ring-green-500 bg-green-50"
    if (selected) return "ring-2 ring-blue-500"
    return ""
  }

  const getStatusIcon = () => {
    switch (executionState.status) {
      case 'running': return <Loader2 className="w-4 h-4 animate-spin" />
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />
      default: return component.template?.ui?.icon ? <span>{component.template.ui.icon}</span> : <Server className="w-4 h-4" />
    }
  }

  return (
    <div className="relative">
      {/* Dynamic Input Handles */}
      {component.template?.inputs?.map((input, index) => (
        <EnhancedHandle
          key={`input-${input.id}`}
          id={input.id}
      type="target"
          position={Position.Left}
          dataType={input.dataType}
          label={input.name}
          required={input.required}
          style={{ top: 70 + index * 30 }}
          nodeId={id!}
        />
      ))}

      <Card className={`min-w-[320px] max-w-[400px] w-full min-h-[120px] relative group cursor-pointer transition-all duration-200 ${getNodeStateClasses()}`}>
        <CardContent className="p-4">
          {/* Node Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <div>
                <div className="font-medium text-sm">{component.name}</div>
                <div className="text-xs text-gray-500">{component.category}</div>
      </div>
    </div>

            {/* Node Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  handleExecute()
                }}
                disabled={executionState.status === 'running' || !isConfigurationComplete()}
                className="w-6 h-6 p-0"
                title="Execute node"
              >
                {executionState.status === 'running' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Play className="w-3 h-3" />
                )}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowConfig(!showConfig)
                }}
                className="w-6 h-6 p-0"
                title="Configure node"
              >
                <Settings className="w-3 h-3" />
              </Button>
      </div>
    </div>

          {/* Execution Progress */}
          {executionState.status === 'running' && (
            <div className="mb-2">
              <div className="flex items-center gap-2 text-xs text-blue-600 mb-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Executing...</span>
      </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div className="bg-blue-600 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
    </div>
    </div>
          )}

          {/* Execution Results */}
          {executionState.status === 'success' && Object.keys(outputs).length > 0 && (
            <div className="mb-2">
              <div className="text-xs font-medium text-green-700 mb-1">
                Results ({executionState.duration}ms):
              </div>
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {Object.entries(outputs).slice(0, 3).map(([key, value]) => (
                  <div key={key} className="text-xs bg-green-50 rounded px-2 py-1">
                    <span className="font-medium text-green-800">{key}:</span>{' '}
                    <span className="text-green-700 font-mono">
                      {typeof value === 'object' ? JSON.stringify(value).slice(0, 30) : String(value).slice(0, 30)}
                      {String(value).length > 30 ? '...' : ''}
                    </span>
      </div>
                ))}
    </div>
    </div>
          )}

          {/* Error Display */}
          {executionState.status === 'error' && (
            <div className="mb-2">
              <div className="text-xs bg-red-50 border border-red-200 rounded p-2">
                <div className="flex items-center gap-1 text-red-700 font-medium mb-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Execution Failed</span>
                </div>
                <div className="text-red-600 text-xs">
                  {executionState.error}
      </div>
    </div>
    </div>
          )}

          {/* Configuration Summary */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">
              {Object.keys(data.config || {}).length} parameters configured
            </span>
            {/* Configuration Status */}
            <div className="flex items-center gap-1">
              {isConfigurationComplete() ? (
                <CheckCircle className="w-3 h-3 text-green-600" />
              ) : (
                <AlertCircle className="w-3 h-3 text-yellow-600" />
              )}
            </div>
          </div>

          {/* Quick Config Panel */}
          {showConfig && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Quick Config:</div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {(component.template?.configuration || component.template?.fields || []).slice(0, 3).map((field) => (
                  <div key={field.key} className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{field.label || field.name}:</span>
                    <span className="text-xs font-mono">
                      {(() => {
                        const value = data.config?.[field.key] || field.defaultValue
                        if (!value) return 'Not set'
                        if (field.sensitive || field.type === 'password') return '••••••••'
                        if (typeof value === 'string' && value.includes('template-mode-demo-key')) return 'Not configured'
                        return String(value).length > 15 ? String(value).substring(0, 15) + '...' : String(value)
                      })()}
                    </span>
      </div>
                ))}
    </div>
    </div>
          )}
        </CardContent>
      </Card>

      {/* Dynamic Output Handles */}
      {component.template?.outputs?.map((output, index) => (
        <EnhancedHandle
          key={`output-${output.id}`}
          id={output.id}
          type="source"
          position={Position.Right}
          dataType={output.dataType}
          label={output.name}
          hasData={!!outputs[output.id]}
          style={{ top: 70 + index * 30 }}
          nodeId={id!}
        />
      ))}
    </div>
  )
}

// Enhanced Handle Component with dynamic validation
const EnhancedHandle: React.FC<{
  id: string
  type: 'source' | 'target'
  position: Position
  dataType: string
  label: string
  required?: boolean
  hasData?: boolean
  style?: React.CSSProperties
  nodeId: string
}> = ({ id, type, position, dataType, label, required, hasData, style, nodeId }) => {
  const [isConnecting, setIsConnecting] = React.useState(false)
  const [connectionValid, setConnectionValid] = React.useState(true)
  
  const handleColor = React.useMemo(() => {
    const typeColors: Record<string, string> = {
      'string': '#10B981',
      'number': '#3B82F6', 
      'boolean': '#8B5CF6',
      'object': '#F59E0B',
      'array': '#F97316',
      'token': '#7C3AED',
      'address': '#DC2626',
      'transaction': '#EF4444',
      'any': '#6B7280'
    }
    return typeColors[dataType] || '#6B7280'
  }, [dataType])

  const handleValidateConnection = React.useCallback(async (connection: any) => {
    try {
      const result = await connectionValidator.validateConnection({
        sourceNodeId: connection.source,
        sourcePortId: connection.sourceHandle,
        sourceDataType: connection.sourceDataType || dataType,
        targetNodeId: connection.target, 
        targetPortId: connection.targetHandle,
        targetDataType: dataType
      })
      setConnectionValid(result.canConnect)
      return result.canConnect
    } catch {
      return false
    }
  }, [dataType])

  return (
    <div className="relative group" style={style}>
      <Handle
        id={id}
        type={type}
        position={position}
        style={{
          backgroundColor: handleColor,
          border: `2px solid ${connectionValid ? '#ffffff' : '#ef4444'}`,
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          boxShadow: hasData ? `0 0 0 3px ${handleColor}40` : `0 2px 4px rgba(0,0,0,0.1)`,
          transition: 'all 0.2s ease',
          zIndex: 10
        }}
        onConnect={handleValidateConnection}
      />
      
      {/* Handle label */}
      <div className={`
        absolute text-xs bg-black/90 text-white px-2 py-1 rounded whitespace-nowrap
        pointer-events-none z-50 transition-opacity duration-200
        ${position === Position.Left ? 'right-6 top-1/2 -translate-y-1/2' : 'left-6 top-1/2 -translate-y-1/2'}
        opacity-0 group-hover:opacity-100
      `}>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: handleColor }} />
          <span>{label}</span>
          {required && <span className="text-red-300">*</span>}
      </div>
        <div className="text-xs opacity-75">{dataType}</div>
    </div>
      
      {/* Connection indicators */}
      {hasData && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
      )}
      {required && !hasData && type === 'target' && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
          <span className="text-white text-[8px] font-bold">!</span>
      </div>
      )}
    </div>
  )
}

// Legacy node adapters for backward compatibility
export const OneInchSwapNode = (props: EnhancedNodeProps) => {
  const pluginProps: PluginNodeProps = {
    ...props,
    data: {
      ...props.data,
      componentId: 'oneInchSwap'
    }
  }
  return <UniversalPluginNode {...pluginProps} />
}

export const OneInchQuoteNode = (props: EnhancedNodeProps) => {
  const pluginProps: PluginNodeProps = {
    ...props,
    data: {
      ...props.data,
      componentId: 'oneInchQuote'
    }
  }
  return <UniversalPluginNode {...pluginProps} />
}

export const DataProcessorNode = (props: EnhancedNodeProps) => {
  const pluginProps: PluginNodeProps = {
    ...props,
    data: {
      ...props.data,
      componentId: 'dataProcessor'
    }
  }
  return <UniversalPluginNode {...pluginProps} />
}

export const ConditionalLogicNode = (props: EnhancedNodeProps) => {
  const pluginProps: PluginNodeProps = {
    ...props,
    data: {
      ...props.data,
      componentId: 'conditionalLogic'
    }
  }
  return <UniversalPluginNode {...pluginProps} />
}

export const WalletConnectorNode = (props: EnhancedNodeProps) => {
  const pluginProps: PluginNodeProps = {
    ...props,
    data: {
      ...props.data,
      componentId: 'walletConnector'
    }
  }
  return <UniversalPluginNode {...pluginProps} />
}

// Legacy token input node - replaced by plugin system
// Kept for backward compatibility, but now uses plugin architecture




// All static node definitions have been replaced by the Universal Plugin System
// Nodes are now dynamically loaded from the plugin registry
// This provides Langflow-like flexibility while maintaining predefined components

/*
 * Legacy static node definitions removed and replaced with:
 * - UniversalPluginNode: Renders any plugin component dynamically
 * - EnhancedHandle: Dynamic connection validation with type checking
 * - Plugin Registry: Runtime component loading and management
 * - Execution Engine: Generic execution without 1:1 coupling
 * 
 * All existing nodes (DashboardNode, ERC20TokenNode, etc.) are now
 * automatically generated from plugin definitions in the registry
 */

// Dynamic Node Registry - automatically populated from plugin system
export const useCustomNodes = () => {
  const [nodes, setNodes] = React.useState<Record<string, React.ComponentType<any>>>({})
  
  React.useEffect(() => {
    const loadNodes = async () => {
      // Ensure plugin system is initialized
      await unitePluginSystem.initialize()
      
      // Get all registered components
      const components = pluginRegistry.getComponents()
      const nodeComponents: Record<string, React.ComponentType<any>> = {}
      
      // Create node components for each registered plugin component
      components.forEach(component => {
        nodeComponents[component.id] = (props: any) => (
          <UniversalPluginNode 
            {...props} 
            data={{
              ...props.data,
              componentId: component.id
            }}
          />
        )
      })
      
      // Add universal plugin node type
      nodeComponents['universalPlugin'] = UniversalPluginNode
      
      // Add legacy nodes for backward compatibility
      nodeComponents['oneInchSwap'] = OneInchSwapNode
      nodeComponents['oneInchQuote'] = OneInchQuoteNode
      nodeComponents['dataProcessor'] = DataProcessorNode
      nodeComponents['conditionalLogic'] = ConditionalLogicNode
      nodeComponents['walletConnector'] = WalletConnectorNode
      
      setNodes(nodeComponents)
    }
    
    loadNodes()
    
    // Listen for plugin updates
    const handlePluginUpdate = () => {
      loadNodes()
    }
    
    pluginRegistry.on('plugin-registered', handlePluginUpdate)
    pluginRegistry.on('plugin-unregistered', handlePluginUpdate)
    
    return () => {
      pluginRegistry.off('plugin-registered', handlePluginUpdate)
      pluginRegistry.off('plugin-unregistered', handlePluginUpdate) 
    }
  }, [])
  
  return nodes
}

// Static export for immediate use (will be populated after initialization)
export const CustomNodes: Record<string, React.ComponentType<any>> = {
  // Core nodes always available
  oneInchSwap: OneInchSwapNode,
  oneInchQuote: OneInchQuoteNode, 
  dataProcessor: DataProcessorNode,
  conditionalLogic: ConditionalLogicNode,
  walletConnector: WalletConnectorNode
}

// Initialize and populate dynamic nodes
;(async () => {
  if (typeof window !== 'undefined') {
    await unitePluginSystem.initialize()
    const components = pluginRegistry.getComponents()
    
    components.forEach(component => {
      if (!CustomNodes[component.id]) {
        CustomNodes[component.id] = (props: any) => (
          <UniversalPluginNode 
            {...props}
            data={{
              ...props.data,
              componentId: component.id
            }}
          />
        )
      }
    })
  }
})()