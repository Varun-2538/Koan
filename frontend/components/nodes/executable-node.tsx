"use client"

import React, { useState } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Play, 
  Square, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Settings
} from "lucide-react"
import { BaseComponent, ComponentExecutionResult } from "@/lib/components/base-component"

interface ExecutableNodeProps extends NodeProps {
  component: BaseComponent
}

export function ExecutableNode({ data, selected, component }: ExecutableNodeProps) {
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState<ComponentExecutionResult | null>(null)
  const [inputs, setInputs] = useState<Record<string, any>>({})
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({})
  const [isExpanded, setIsExpanded] = useState(false)
  const [showLogs, setShowLogs] = useState(false)

  // Initialize inputs with default values
  React.useEffect(() => {
    const defaultInputs: Record<string, any> = {}
    component.inputs.forEach(input => {
      if (input.defaultValue !== undefined) {
        defaultInputs[input.key] = input.defaultValue
      }
    })
    setInputs(defaultInputs)
  }, [component])

  const handleInputChange = (key: string, value: any) => {
    setInputs(prev => ({ ...prev, [key]: value }))
  }

  const handlePlay = async () => {
    setIsExecuting(true)
    setExecutionResult(null)

    try {
      // Use test method for Play button, execute method for actual workflow
      const result = await component.test(inputs)
      setExecutionResult(result)
    } catch (error: any) {
      setExecutionResult({
        success: false,
        outputs: {},
        error: error.message,
        logs: [`Error: ${error.message}`]
      })
    } finally {
      setIsExecuting(false)
    }
  }

  const handleStop = () => {
    setIsExecuting(false)
    // In a real implementation, you'd cancel the ongoing request
  }

  const getStatusIcon = () => {
    if (isExecuting) {
      return <Clock className="w-4 h-4 text-blue-500 animate-spin" />
    }
    if (executionResult?.success === true) {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    }
    if (executionResult?.success === false) {
      return <XCircle className="w-4 h-4 text-red-500" />
    }
    return null
  }

  const getStatusColor = () => {
    if (isExecuting) return "border-blue-500"
    if (executionResult?.success === true) return "border-green-500"
    if (executionResult?.success === false) return "border-red-500"
    return selected ? "border-blue-500" : "border-gray-200"
  }

  const renderInput = (input: any) => {
    const value = inputs[input.key] || ""
    const isVisible = showSensitive[input.key] || !input.sensitive

    switch (input.type) {
      case "select":
        return (
          <Select value={value} onValueChange={(val) => handleInputChange(input.key, val)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder={`Select ${input.label}`} />
            </SelectTrigger>
            <SelectContent>
              {input.options?.map((option: string | { value: string; label: string }) => {
                const optionValue = typeof option === 'string' ? option : option.value
                const optionLabel = typeof option === 'string' ? option : option.label
                return (
                  <SelectItem key={optionValue} value={optionValue} className="text-xs">
                    {optionLabel}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        )
      case "multiselect":
        return (
          <div className="space-y-2">
            <div className="text-xs text-gray-600 mb-1">
              Selected: {(value || []).length} of {input.options?.length || 0}
            </div>
            <div className="flex flex-wrap gap-1 min-h-[24px] p-2 border rounded bg-white">
              {(value || []).length === 0 ? (
                <span className="text-xs text-gray-400">No items selected</span>
              ) : (
                (value || []).map((selectedValue: string) => {
                  const option = input.options?.find((opt: any) => 
                    (typeof opt === 'string' ? opt : opt.value) === selectedValue
                  )
                  const label = typeof option === 'string' ? option : option?.label || selectedValue
                  return (
                    <Badge key={selectedValue} variant="secondary" className="text-xs">
                      {label}
                      <button
                        onClick={() => {
                          const newValue = value.filter((v: string) => v !== selectedValue)
                          handleInputChange(input.key, newValue)
                        }}
                        className="ml-1 hover:text-red-500 font-bold"
                      >
                        ×
                      </button>
                    </Badge>
                  )
                })
              )}
            </div>
            <Select
              onValueChange={(val) => {
                const currentValue = value || []
                if (!currentValue.includes(val)) {
                  handleInputChange(input.key, [...currentValue, val])
                }
              }}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder={`+ Add to ${input.label}`} />
              </SelectTrigger>
              <SelectContent>
                {input.options?.map((option: string | { value: string; label: string }) => {
                  const optionValue = typeof option === 'string' ? option : option.value
                  const optionLabel = typeof option === 'string' ? option : option.label
                  const isSelected = (value || []).includes(optionValue)
                  return (
                    <SelectItem 
                      key={optionValue} 
                      value={optionValue} 
                      className={`text-xs ${isSelected ? 'opacity-50' : ''}`}
                      disabled={isSelected}
                    >
                      {isSelected ? '✓ ' : ''}{optionLabel}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        )
      case "api_key":
        return (
          <div className="relative">
            <Input
              type={isVisible ? "text" : "password"}
              value={value}
              onChange={(e) => handleInputChange(input.key, e.target.value)}
              placeholder={input.placeholder}
              className="h-8 text-xs pr-8"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-8 w-8 p-0"
              onClick={() => setShowSensitive(prev => ({ 
                ...prev, 
                [input.key]: !prev[input.key] 
              }))}
            >
              {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </Button>
          </div>
        )
      case "json":
        return (
          <div className="space-y-1">
            <Textarea
              value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value)
                  handleInputChange(input.key, parsed)
                } catch {
                  // Keep the string value if it's not valid JSON yet
                  handleInputChange(input.key, e.target.value)
                }
              }}
              placeholder={input.placeholder}
              className="min-h-24 max-h-32 text-xs resize-none font-mono border-gray-300"
            />
            <div className="text-xs text-gray-500">
              {typeof value === 'object' ? '✓ Valid JSON' : 'Enter valid JSON'}
            </div>
          </div>
        )
      default:
        return (
          <Input
            type={input.type === "number" ? "number" : "text"}
            value={value}
            onChange={(e) => handleInputChange(input.key, e.target.value)}
            placeholder={input.placeholder}
            className={`h-8 text-xs ${input.type === "address" ? "font-mono" : ""}`}
          />
        )
    }
  }

  return (
    <Card className={`min-w-[320px] max-w-[520px] ${getStatusColor()} transition-colors ${isExpanded ? 'h-[500px] flex flex-col' : ''} ${selected ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}>
      {/* Input Handles */}
      {component.inputs.length > 0 && (
        <Handle 
          type="target" 
          position={Position.Left} 
          className="w-3 h-3 bg-gray-400 border-2 border-white"
        />
      )}

      <CardHeader className="p-3 pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-blue-500 text-white rounded text-xs">
              1inch
            </div>
            <div>
              <h3 className="font-medium text-sm">{component.name}</h3>
              <p className="text-xs text-gray-500">{component.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {getStatusIcon()}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0 hover:bg-gray-100"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>
          </div>
        </div>

        {/* Play/Stop Controls */}
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant={isExecuting ? "destructive" : "default"}
            size="sm"
            onClick={isExecuting ? handleStop : handlePlay}
            disabled={!inputs.api_key} // Require API key
            className="h-7 text-xs"
          >
            {isExecuting ? (
              <>
                <Square className="w-3 h-3 mr-1" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-3 h-3 mr-1" />
                Test
              </>
            )}
          </Button>
          
          {executionResult && (
            <Badge 
              variant={executionResult.success ? "default" : "destructive"}
              className="text-xs"
            >
              {executionResult.success ? "Success" : "Failed"}
            </Badge>
          )}

          {executionResult?.executionTime && (
            <span className="text-xs text-gray-500">
              {executionResult.executionTime}ms
            </span>
          )}

          {!isExpanded && component.inputs.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {component.inputs.length} inputs
            </Badge>
          )}
        </div>
      </CardHeader>

            {/* Expandable Configuration */}
      {isExpanded && (
        <CardContent className="p-0 border-t flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Canvas Container */}
          <div className="h-[400px] overflow-y-auto overflow-x-hidden node-scroll-area border rounded-md m-3">
            <div className="p-3 space-y-3">
              {/* Header */}
              <div className="text-xs text-gray-500 mb-3 flex items-center gap-2 sticky top-0 bg-white pb-2 border-b">
                <span className="font-medium">Configuration ({component.inputs.length} inputs)</span>
                <Badge variant="outline" className="text-xs">
                  Scrollable Canvas
                </Badge>
              </div>

              {/* Input Forms */}
              {component.inputs.map((input) => (
                <div key={input.key} className="space-y-2 p-2 bg-gray-50 rounded-md">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-medium text-gray-700 flex-1 min-w-0">
                      <span className="block">{input.label}</span>
                      {input.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {input.sensitive && (
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        Sensitive
                      </Badge>
                    )}
                  </div>
                  <div className="w-full">
                    {renderInput(input)}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed break-words">
                    {input.description}
                  </p>
                </div>
              ))}

              {/* Execution Results */}
              {executionResult && (
                <div className="mt-4 p-3 bg-white border rounded-md">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium">Execution Results</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowLogs(!showLogs)}
                      className="h-6 text-xs"
                    >
                      {showLogs ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      Logs
                    </Button>
                  </div>

                  {executionResult.success ? (
                    <div className="space-y-3">
                      {Object.entries(executionResult.outputs).map(([key, value]) => (
                        <div key={key} className="text-xs">
                          <span className="font-medium text-gray-700 block mb-1">{key}:</span>
                          <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-auto max-h-40 break-all">
                            {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-red-600 bg-red-50 p-3 rounded">
                      <strong>Error:</strong> {executionResult.error}
                    </div>
                  )}

                  {/* Logs */}
                  {showLogs && executionResult.logs && (
                    <div className="mt-3">
                      <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono max-h-48 overflow-auto node-scroll-area">
                        {executionResult.logs.map((log, index) => (
                          <div key={index} className="break-words mb-1">{log}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      )}

      {/* Output Handles */}
      {component.outputs.length > 0 && (
        <Handle 
          type="source" 
          position={Position.Right} 
          className="w-3 h-3 bg-gray-400 border-2 border-white"
        />
      )}
    </Card>
  )
} 