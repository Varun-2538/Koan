"use client"

import { Handle, Position, HandleProps } from "@xyflow/react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Database,
  Zap,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"

// Data types for type-safe connections
export type DataType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'token'
  | 'chain'
  | 'address'
  | 'amount'
  | 'config'
  | 'result'
  | 'error'

export interface TypedHandleProps extends Omit<HandleProps, 'type'> {
  dataType: DataType
  label?: string
  description?: string
  isConnected?: boolean
  hasData?: boolean
  isValid?: boolean
  isRequired?: boolean
  connectionCount?: number
  onHover?: () => void
  onLeave?: () => void
  showTooltip?: boolean
}

// Type colors and icons
const typeConfig: Record<DataType, { color: string; icon: React.ReactNode; label: string }> = {
  string: { color: 'bg-gray-500', icon: <span className="text-xs">T</span>, label: 'Text' },
  number: { color: 'bg-blue-500', icon: <span className="text-xs">#</span>, label: 'Number' },
  boolean: { color: 'bg-green-500', icon: <span className="text-xs">✓</span>, label: 'Boolean' },
  object: { color: 'bg-purple-500', icon: <Database className="w-3 h-3" />, label: 'Object' },
  array: { color: 'bg-orange-500', icon: <span className="text-xs">[]</span>, label: 'Array' },
  token: { color: 'bg-yellow-500', icon: <span className="text-xs">🪙</span>, label: 'Token' },
  chain: { color: 'bg-indigo-500', icon: <span className="text-xs">⛓️</span>, label: 'Chain' },
  address: { color: 'bg-red-500', icon: <span className="text-xs">📍</span>, label: 'Address' },
  amount: { color: 'bg-emerald-500', icon: <span className="text-xs">$</span>, label: 'Amount' },
  config: { color: 'bg-cyan-500', icon: <span className="text-xs">⚙️</span>, label: 'Config' },
  result: { color: 'bg-lime-500', icon: <CheckCircle className="w-3 h-3" />, label: 'Result' },
  error: { color: 'bg-red-600', icon: <AlertCircle className="w-3 h-3" />, label: 'Error' }
}

// Connection validation rules
export const connectionRules: Record<DataType, DataType[]> = {
  string: ['string', 'object'],
  number: ['number', 'string'],
  boolean: ['boolean', 'string'],
  object: ['object', 'string', 'array'],
  array: ['array', 'object', 'string'],
  token: ['token', 'address', 'string', 'object'],
  chain: ['chain', 'string', 'number', 'object'],
  address: ['address', 'string', 'object'],
  amount: ['amount', 'number', 'string', 'object'],
  config: ['config', 'object', 'string'],
  result: ['result', 'object', 'string'],
  error: ['error', 'string', 'object']
}

export function InteractiveHandle({
  dataType,
  label,
  description,
  isConnected = false,
  hasData = false,
  isValid = true,
  isRequired = false,
  connectionCount = 0,
  onHover,
  onLeave,
  showTooltip = true,
  ...handleProps
}: TypedHandleProps) {
  const config = typeConfig[dataType]
  const position = handleProps.position || Position.Top

  // Determine handle style based on state
  const handleStyle = {
    background: config.color,
    border: `2px solid ${isValid ? '#ffffff' : '#ef4444'}`,
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '10px',
    fontWeight: 'bold',
    boxShadow: isConnected ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none',
    animation: hasData ? 'pulse 2s infinite' : 'none'
  }

  // Position-specific styling
  const getPositionStyle = () => {
    switch (position) {
      case Position.Top:
        return { top: '-8px', left: '50%', transform: 'translateX(-50%)' }
      case Position.Bottom:
        return { bottom: '-8px', left: '50%', transform: 'translateX(-50%)' }
      case Position.Left:
        return { left: '-8px', top: '50%', transform: 'translateY(-50%)' }
      case Position.Right:
        return { right: '-8px', top: '50%', transform: 'translateY(-50%)' }
      default:
        return {}
    }
  }

  const handleElement = (
    <div
      className="relative group"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <Handle
        {...handleProps}
        style={handleStyle}
        className={cn(
          "transition-all duration-200 hover:scale-110",
          !isValid && "animate-pulse",
          hasData && "ring-2 ring-blue-300"
        )}
      >
        {config.icon}
      </Handle>

      {/* Connection indicator */}
      {connectionCount > 0 && (
        <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
          {connectionCount > 9 ? '9+' : connectionCount}
        </div>
      )}

      {/* Required indicator */}
      {isRequired && !isConnected && (
        <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center">
          !
        </div>
      )}

      {/* Data flow indicator */}
      {hasData && (
        <div className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-ping" />
      )}
    </div>
  )

  // Label positioning
  const getLabelPosition = () => {
    switch (position) {
      case Position.Top:
        return { bottom: '20px', left: '50%', transform: 'translateX(-50%)' }
      case Position.Bottom:
        return { top: '20px', left: '50%', transform: 'translateX(-50%)' }
      case Position.Left:
        return { right: '20px', top: '50%', transform: 'translateY(-50%)' }
      case Position.Right:
        return { left: '20px', top: '50%', transform: 'translateY(-50%)' }
      default:
        return {}
    }
  }

  if (!showTooltip) {
    return (
      <div className="relative">
        {handleElement}
        {label && (
          <div
            className="absolute text-xs font-medium text-gray-600 whitespace-nowrap pointer-events-none"
            style={getLabelPosition()}
          >
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </div>
        )}
      </div>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            {handleElement}
            {label && (
              <div
                className="absolute text-xs font-medium text-gray-600 whitespace-nowrap pointer-events-none"
                style={getLabelPosition()}
              >
                {label}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side={position === Position.Top ? 'bottom' : position === Position.Bottom ? 'top' : position === Position.Left ? 'right' : 'left'}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {config.icon}
                {config.label}
              </Badge>
              {isRequired && (
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-xs text-gray-600 max-w-48">{description}</p>
            )}
            <div className="text-xs text-gray-500">
              {isConnected ? 'Connected' : 'Not connected'}
              {connectionCount > 0 && ` (${connectionCount} connection${connectionCount > 1 ? 's' : ''})`}
            </div>
            {!isValid && (
              <div className="flex items-center gap-1 text-red-600 text-xs">
                <AlertCircle className="w-3 h-3" />
                Invalid connection type
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Utility function to validate connections
export function validateConnection(sourceType: DataType, targetType: DataType): boolean {
  return connectionRules[sourceType]?.includes(targetType) || false
}

// Utility function to get compatible types
export function getCompatibleTypes(dataType: DataType): DataType[] {
  return connectionRules[dataType] || []
}

// Enhanced handle for data flow visualization
export function DataFlowHandle(props: TypedHandleProps) {
  return (
    <InteractiveHandle
      {...props}
      className={cn(
        props.className,
        props.hasData && "ring-2 ring-blue-300 ring-opacity-50"
      )}
    />
  )
}
