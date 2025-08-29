"use client"

import React, { useState } from 'react'
import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react'
import { Badge } from "@/components/ui/badge"
import { enhancedNodeTemplates, validateNodeConfig, type NodeTemplate } from "./enhanced-node-templates"

interface NodeHandleProps {
  id: string
  type: 'source' | 'target'
  position: Position
  dataType: string
  label: string
  required?: boolean
  connected?: boolean
  onConnect?: (handleId: string) => void
  onDisconnect?: (handleId: string) => void
  style?: React.CSSProperties
}

// Type colors and icons mapping
const typeConfig: Record<string, { color: string; icon: string; label: string }> = {
  string: { color: '#10B981', icon: 'T', label: 'Text' },
  number: { color: '#3B82F6', icon: '#', label: 'Number' },
  boolean: { color: '#8B5CF6', icon: '●', label: 'Boolean' },
  object: { color: '#F59E0B', icon: '{}', label: 'Object' },
  execution: { color: '#EF4444', icon: '▶', label: 'Execution' },
  address: { color: '#DC2626', icon: '📍', label: 'Address' },
  amount: { color: '#059669', icon: '$', label: 'Amount' },
  token: { color: '#7C3AED', icon: '🪙', label: 'Token' },
  any: { color: '#6B7280', icon: '∗', label: 'Any' },
  array: { color: '#F97316', icon: '[]', label: 'Array' },
  error: { color: '#EF4444', icon: '❌', label: 'Error' },
  result: { color: '#10B981', icon: '✓', label: 'Result' }
}

// Interactive handle component with hover states and validation
export const InteractiveHandle: React.FC<NodeHandleProps> = ({
  id,
  type,
  position,
  dataType,
  label,
  required,
  connected,
  onConnect,
  onDisconnect,
  style = {}
}) => {
  const [hovered, setHovered] = useState(false)

  const config = typeConfig[dataType] || typeConfig.any

  const getPositionClasses = () => {
    switch (position) {
      case Position.Top:
        return type === 'target' ? 'bottom-4 left-1/2 -translate-x-1/2' : 'top-4 left-1/2 -translate-x-1/2'
      case Position.Bottom:
        return type === 'target' ? 'top-4 left-1/2 -translate-x-1/2' : 'bottom-4 left-1/2 -translate-x-1/2'
      case Position.Left:
        return type === 'target' ? 'right-4 top-1/2 -translate-y-1/2' : 'left-4 top-1/2 -translate-y-1/2'
      case Position.Right:
        return type === 'target' ? 'left-4 top-1/2 -translate-y-1/2' : 'right-4 top-1/2 -translate-y-1/2'
      default:
        return ''
    }
  }

  const getLabelPosition = () => {
    switch (position) {
      case Position.Top:
        return type === 'target' ? 'top-8' : 'bottom-8'
      case Position.Bottom:
        return type === 'target' ? 'bottom-8' : 'top-8'
      case Position.Left:
        return type === 'target' ? 'left-8' : 'right-8'
      case Position.Right:
        return type === 'target' ? 'right-8' : 'left-8'
      default:
        return ''
    }
  }

  return (
    <div
      className="relative group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={style}
    >
      <Handle
        id={id}
        type={type}
        position={position}
        style={{
          backgroundColor: config.color,
          borderColor: connected ? config.color : '#D1D5DB',
          borderWidth: connected ? 2 : 1,
          width: hovered ? 14 : 10,
          height: hovered ? 14 : 10,
          transition: 'all 0.2s ease',
          boxShadow: hovered ? `0 0 0 3px ${config.color}40` : 'none'
        }}
        onConnect={onConnect}
        onDisconnect={onDisconnect}
      />

      {/* Handle icon */}
      <div
        className="absolute inset-0 flex items-center justify-center text-white text-[8px] font-bold pointer-events-none"
        style={{
          color: 'white',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)'
        }}
      >
        {config.icon}
      </div>

      {/* Connection indicator */}
      {connected && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
      )}

      {/* Required indicator */}
      {required && !connected && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
          <span className="text-white text-[8px] font-bold">*</span>
        </div>
      )}

      {/* Handle tooltip */}
      <div
        className={`
          absolute ${getLabelPosition()} ${getPositionClasses()}
          flex items-center gap-1 text-xs bg-black/90 text-white px-2 py-1 rounded whitespace-nowrap
          pointer-events-none z-50 transition-opacity duration-200
          ${hovered ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <Badge
          variant="outline"
          className="text-xs px-1 py-0 border-white/20 text-white"
          style={{ backgroundColor: `${config.color}20` }}
        >
          {config.icon} {config.label}
        </Badge>
        <span>{label}</span>
        {required && <span className="text-red-300">*</span>}
      </div>
    </div>
  )
}

// Enhanced custom node with interactive handles
export const InteractiveCustomNode: React.FC<{
  data: any
  selected: boolean
  type: string
  id: string
}> = ({ data, selected, type, id }) => {
  const updateNodeInternals = useUpdateNodeInternals()
  const template = enhancedNodeTemplates[type]

  const [nodeState, setNodeState] = useState<'idle' | 'running' | 'success' | 'error'>('idle')
  const [outputValues, setOutputValues] = useState<Record<string, any>>({})
  const [executionTime, setExecutionTime] = useState<number | null>(null)

  if (!template) {
    return (
      <div className="min-w-48 bg-white border-2 border-gray-300 rounded-lg shadow-lg p-3">
        <div className="text-center text-gray-500">
          <p className="text-sm">Unknown node type: {type}</p>
        </div>
      </div>
    )
  }

  const getNodeStatusColor = () => {
    switch (nodeState) {
      case 'running': return 'border-blue-500 bg-blue-50 shadow-blue-100'
      case 'success': return 'border-green-500 bg-green-50 shadow-green-100'
      case 'error': return 'border-red-500 bg-red-50 shadow-red-100'
      default: return selected ? 'border-blue-400 shadow-blue-100' : 'border-gray-300'
    }
  }

  const getStatusIcon = () => {
    switch (nodeState) {
      case 'running': return '⏳'
      case 'success': return '✅'
      case 'error': return '❌'
      default: return template.icon
    }
  }

  // Simulate node execution for demo
  const executeNode = async () => {
    if (nodeState === 'running') return

    setNodeState('running')
    setOutputValues({})
    const startTime = Date.now()

    try {
      // Simulate async execution with different delays based on node type
      const delay = type === 'oneInchSwap' ? 3000 : type === 'dataProcessor' ? 1500 : 2000
      await new Promise(resolve => setTimeout(resolve, delay))

      // Mock output values based on template
      const mockOutputs: Record<string, any> = {}
      template.outputs.forEach(output => {
        switch (output.type) {
          case 'string':
            mockOutputs[output.name] = type === 'oneInchSwap'
              ? '0x8ba1f109551bD43280301264526176'
              : `output_${output.name}`
            break
          case 'number':
            mockOutputs[output.name] = type === 'oneInchSwap'
              ? Math.random() * 1000
              : Math.floor(Math.random() * 100)
            break
          case 'boolean':
            mockOutputs[output.name] = Math.random() > 0.5
            break
          case 'execution':
            mockOutputs[output.name] = nodeState === 'success'
            break
          case 'address':
            mockOutputs[output.name] = '0x742d35Cc66C1C053d9f31d2e5c6b2b4e4f4f6f7f8'
            break
          case 'amount':
            mockOutputs[output.name] = Math.random() * 10
            break
          default:
            mockOutputs[output.name] = null
        }
      })

      setOutputValues(mockOutputs)
      setExecutionTime(Date.now() - startTime)
      setNodeState('success')
    } catch (error) {
      setNodeState('error')
      setExecutionTime(Date.now() - startTime)
    }
  }

  // Update node internals when handles change
  React.useEffect(() => {
    updateNodeInternals(id)
  }, [template, updateNodeInternals, id])

  return (
    <div
      className={`
        min-w-64 bg-white border-2 rounded-lg shadow-lg relative overflow-hidden
        ${getNodeStatusColor()}
        transition-all duration-300
        ${selected ? 'shadow-xl ring-2 ring-blue-200' : ''}
      `}
    >
      {/* Node Header */}
      <div
        className="flex items-center gap-2 p-3 border-b"
        style={{ backgroundColor: `${template.color}15` }}
      >
        <span className="text-lg">{getStatusIcon()}</span>
        <div className="flex-1">
          <div className="font-medium text-sm">{template.name}</div>
          <div className="text-xs text-gray-500">{template.category}</div>
        </div>

        {/* Execution button */}
        <button
          onClick={executeNode}
          disabled={nodeState === 'running'}
          className={`
            p-1.5 rounded text-xs font-medium transition-all duration-200
            ${nodeState === 'running'
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-100 hover:bg-blue-200 text-blue-700 hover:scale-105'}
          `}
          title={nodeState === 'running' ? 'Executing...' : 'Execute node'}
        >
          {nodeState === 'running' ? '⏳' : '▶'}
        </button>
      </div>

      {/* Input Handles */}
      {template.inputs.map((input, index) => (
        <InteractiveHandle
          key={`input-${input.name}`}
          id={input.name}
          type="target"
          position={Position.Left}
          dataType={input.type}
          label={input.name}
          required={input.required}
          style={{ top: 70 + index * 30 }}
        />
      ))}

      {/* Node Content */}
      <div className="p-3 space-y-3">
        {/* Configuration Summary */}
        <div className="text-xs text-gray-600">
          {Object.keys(data.config || {}).length} parameters configured
        </div>

        {/* Execution Progress */}
        {nodeState === 'running' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-blue-600">
              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Executing...</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-600 h-1.5 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        )}

        {/* Execution Results */}
        {nodeState === 'success' && Object.keys(outputValues).length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-green-700">Execution Results:</div>
              {executionTime && (
                <div className="text-xs text-gray-500">{executionTime}ms</div>
              )}
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {Object.entries(outputValues).map(([key, value]) => (
                <div key={key} className="text-xs bg-green-50 rounded px-2 py-1 border border-green-200">
                  <span className="font-medium text-green-800">{key}:</span>{' '}
                  <span className="text-green-700 font-mono">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {nodeState === 'error' && (
          <div className="text-xs bg-red-50 border border-red-200 rounded p-2">
            <div className="flex items-center gap-1 text-red-700 font-medium">
              <span>❌</span>
              <span>Execution Failed</span>
            </div>
            <div className="text-red-600 mt-1">
              {executionTime && `Execution time: ${executionTime}ms`}
            </div>
          </div>
        )}

        {/* Node-specific content based on type */}
        {type === 'oneInchSwap' && (
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>From:</span>
              <span className="font-mono">{data.config?.fromToken || 'ETH'}</span>
            </div>
            <div className="flex justify-between">
              <span>To:</span>
              <span className="font-mono">{data.config?.toToken || 'USDC'}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount:</span>
              <span>{data.config?.amount || '1.0'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Output Handles */}
      {template.outputs.map((output, index) => (
        <InteractiveHandle
          key={`output-${output.name}`}
          id={output.name}
          type="source"
          position={Position.Right}
          dataType={output.type}
          label={output.name}
          connected={!!outputValues[output.name]}
          style={{ top: 70 + index * 30 }}
        />
      ))}

      {/* Node resize handle */}
      <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 hover:opacity-50 transition-all">
        <div className="w-full h-full bg-gray-400 transform rotate-45 translate-x-1 translate-y-1 border border-white"></div>
      </div>
    </div>
  )
}

// Connection validation system
export const validateConnection = (connection: any, nodeTemplates: Record<string, NodeTemplate>) => {
  const sourceNode = connection.source
  const targetNode = connection.target
  const sourceHandle = connection.sourceHandle
  const targetHandle = connection.targetHandle

  if (!sourceNode || !targetNode || !sourceHandle || !targetHandle) return false

  const sourceTemplate = nodeTemplates[sourceNode.type]
  const targetTemplate = nodeTemplates[targetNode.type]

  if (!sourceTemplate || !targetTemplate) return false

  const sourceOutput = sourceTemplate.outputs.find(o => o.name === sourceHandle)
  const targetInput = targetTemplate.inputs.find(i => i.name === targetHandle)

  if (!sourceOutput || !targetInput) return false

  // Type compatibility check
  const typesCompatible =
    sourceOutput.type === targetInput.type ||
    sourceOutput.type === 'any' ||
    targetInput.type === 'any' ||
    (sourceOutput.type === 'execution' && targetInput.type === 'execution')

  return typesCompatible
}

// Enhanced edge with data flow visualization
export const InteractiveEdge: React.FC<any> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {}
}) => {
  const [dataFlow, setDataFlow] = useState<any>(null)
  const [animating, setAnimating] = useState(false)

  // Create curved path for the edge
  const createEdgePath = () => {
    const dx = targetX - sourceX
    const dy = targetY - sourceY

    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal layout
      const cp1x = sourceX + dx * 0.5
      const cp1y = sourceY
      const cp2x = targetX - dx * 0.5
      const cp2y = targetY
      return `M${sourceX},${sourceY} C${cp1x},${cp1y} ${cp2x},${cp2y} ${targetX},${targetY}`
    } else {
      // Vertical layout
      const cp1x = sourceX
      const cp1y = sourceY + dy * 0.5
      const cp2x = targetX
      const cp2y = targetY - dy * 0.5
      return `M${sourceX},${sourceY} C${cp1x},${cp1y} ${cp2x},${cp2y} ${targetX},${targetY}`
    }
  }

  const edgePath = createEdgePath()

  return (
    <g>
      {/* Main edge line */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={animating ? '#3B82F6' : style.stroke || '#9CA3AF'}
        strokeWidth={animating ? 3 : style.strokeWidth || 2}
        strokeDasharray={animating ? '5,5' : 'none'}
        className={animating ? 'animate-pulse' : ''}
        style={{
          ...style,
          transition: 'stroke 0.3s ease, stroke-width 0.3s ease'
        }}
      />

      {/* Data flow animation */}
      {animating && dataFlow && (
        <g>
          <circle r="4" fill="#3B82F6" opacity="0.8">
            <animateMotion dur="2s" repeatCount="1" fill="freeze">
              <mpath href={`#${id}`} />
            </animateMotion>
          </circle>

          {/* Data value tooltip */}
          <foreignObject
            x={(sourceX + targetX) / 2 - 60}
            y={(sourceY + targetY) / 2 - 15}
            width="120"
            height="30"
          >
            <div className="bg-blue-900/90 text-white text-xs px-2 py-1 rounded text-center backdrop-blur-sm">
              {typeof dataFlow === 'object' ? JSON.stringify(dataFlow).slice(0, 20) + '...' : String(dataFlow)}
            </div>
          </foreignObject>
        </g>
      )}

      {/* Edge hover effect */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth="12"
        className="cursor-pointer hover:stroke-blue-200 transition-colors"
        onMouseEnter={() => {
          // Could add edge highlighting here
        }}
        onMouseLeave={() => {
          // Could remove edge highlighting here
        }}
      />
    </g>
  )
}
