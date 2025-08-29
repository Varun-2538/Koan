"use client"

import { useState, useEffect } from "react"
import { Node } from "@xyflow/react"
import { DynamicNodeConfiguration, DynamicField } from "./dynamic-node-config"
import { enhancedNodeTemplates, getNodeTemplate, validateNodeConfig } from "./enhanced-node-templates"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CheckCircle, Info, Settings, Zap, Database } from "lucide-react"

interface EnhancedNodeConfigurationProps {
  node: Node
  onUpdateNode: (nodeId: string, config: any) => void
}

export function EnhancedNodeConfiguration({
  node,
  onUpdateNode
}: EnhancedNodeConfigurationProps) {
  const [config, setConfig] = useState<Record<string, any>>(node.data?.config || {})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isValidating, setIsValidating] = useState(false)

  const template = getNodeTemplate(node.type)

  // Initialize config with template defaults
  useEffect(() => {
    if (template) {
      const initialConfig: Record<string, any> = {}

      template.fields.forEach(field => {
        const existingValue = node.data?.config?.[field.key]
        initialConfig[field.key] = existingValue ?? field.defaultValue ?? getDefaultValueForField(field)
      })

      // Add basic fields that all nodes should have
      initialConfig.label = initialConfig.label || node.data?.label || template.name
      initialConfig.description = initialConfig.description || node.data?.description || ''

      setConfig(initialConfig)
    }
  }, [template, node.data?.config, node.data?.label])

  // Get default value for a field type
  function getDefaultValueForField(field: DynamicField): any {
    switch (field.type) {
      case 'boolean': return false
      case 'number': return field.min || 0
      case 'slider': return field.min || 0
      case 'multiselect': return []
      case 'text': return ''
      case 'textarea': return ''
      case 'select': return field.options?.[0]?.value || ''
      case 'code': return ''
      case 'color': return '#000000'
      default: return ''
    }
  }

  // Enhanced fields with basic node properties
  const enhancedFields: DynamicField[] = template ? [
    // Basic node properties
    {
      key: 'label',
      label: 'Node Label',
      type: 'text',
      defaultValue: config.label || template.name,
      required: true,
      description: 'Display name for this node',
      placeholder: 'Enter node label...'
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      defaultValue: config.description || '',
      description: 'Optional description of what this node does',
      placeholder: 'Describe the purpose of this node...'
    },
    {
      key: 'enabled',
      label: 'Enabled',
      type: 'boolean',
      defaultValue: config.enabled !== false,
      description: 'Whether this node is active in the workflow',
      helpText: 'Disabled nodes will be skipped during execution'
    },
    ...template.fields
  ] : []

  // Handle configuration changes
  const handleConfigChange = (newConfig: Record<string, any>) => {
    setConfig(newConfig)

    // Real-time validation
    if (template) {
      const validationErrors = validateNodeConfig(node.type, newConfig)
      setErrors(validationErrors)
    }

    // Update the node immediately
    onUpdateNode(node.id, newConfig)
  }

  // Handle save with final validation
  const handleSave = (finalConfig: Record<string, any>) => {
    if (template) {
      const validationErrors = validateNodeConfig(node.type, finalConfig)
      setErrors(validationErrors)

      if (Object.keys(validationErrors).length === 0) {
        onUpdateNode(node.id, finalConfig)
        return true // Success
      }
      return false // Validation failed
    }
    return true
  }

  // Handle reset
  const handleReset = () => {
    if (template) {
      const resetConfig: Record<string, any> = {}

      template.fields.forEach(field => {
        resetConfig[field.key] = field.defaultValue ?? getDefaultValueForField(field)
      })

      resetConfig.label = template.name
      resetConfig.description = ''
      resetConfig.enabled = true

      setConfig(resetConfig)
      setErrors({})
      onUpdateNode(node.id, resetConfig)
    }
  }

  if (!template) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p>No configuration template found for node type: {node.type}</p>
            <p className="text-sm">This node may not support advanced configuration.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const hasErrors = Object.keys(errors).length > 0
  const requiredFieldsCount = enhancedFields.filter(f => f.required).length
  const completedFieldsCount = enhancedFields.filter(f =>
    f.required && config[f.key] !== undefined && config[f.key] !== ''
  ).length

  return (
    <div className="space-y-4">
      {/* Node Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: template.color }}
            >
              {template.icon}
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <p className="text-sm text-gray-600">{template.description}</p>
            </div>
            <Badge variant="outline" className="text-xs">
              {template.category}
            </Badge>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedFieldsCount / requiredFieldsCount) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">
              {completedFieldsCount}/{requiredFieldsCount} required
            </span>
          </div>
        </CardHeader>
      </Card>

      {/* Configuration Form */}
      <DynamicNodeConfiguration
        nodeId={node.id}
        nodeType={node.type}
        config={{
          fields: enhancedFields,
          categories: ['Basic', 'Advanced']
        }}
        currentValues={config}
        onChange={handleConfigChange}
        onSave={handleSave}
        onReset={handleReset}
      />

      {/* Node Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="w-4 h-4" />
            Node Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Input/Output Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-700 flex items-center gap-1">
                <Database className="w-3 h-3" />
                Inputs ({template.inputs.length})
              </h4>
              <div className="space-y-1">
                {template.inputs.map((input, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="text-xs px-1">
                      {input.type}
                    </Badge>
                    <span>{input.name}</span>
                    {input.required && <span className="text-red-500">*</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-700 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Outputs ({template.outputs.length})
              </h4>
              <div className="space-y-1">
                {template.outputs.map((output, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="text-xs px-1">
                      {output.type}
                    </Badge>
                    <span>{output.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Validation Status */}
          <div className="flex items-center gap-2">
            {hasErrors ? (
              <>
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600">
                  Configuration has {Object.keys(errors).length} error(s)
                </span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">
                  Configuration is valid
                </span>
              </>
            )}
          </div>

          {/* Error Summary */}
          {hasErrors && (
            <div className="space-y-1">
              {Object.entries(errors).map(([field, error]) => (
                <div key={field} className="text-xs text-red-600 flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
