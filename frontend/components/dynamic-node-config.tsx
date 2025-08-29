"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Settings,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Info,
  Code,
  Palette,
  ToggleLeft
} from "lucide-react"
import { toast } from "sonner"

// Field types for dynamic configuration
export type FieldType =
  | 'text'
  | 'number'
  | 'select'
  | 'boolean'
  | 'textarea'
  | 'slider'
  | 'color'
  | 'code'
  | 'multiselect'
  | 'range'
  | 'file'

export interface FieldCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
  value: any
}

export interface DynamicField {
  key: string
  label: string
  type: FieldType
  defaultValue?: any
  placeholder?: string
  required?: boolean
  description?: string
  options?: { label: string; value: any }[]
  min?: number
  max?: number
  step?: number
  validation?: {
    pattern?: RegExp
    message?: string
    custom?: (value: any, allValues: Record<string, any>) => boolean | string
  }
  conditions?: FieldCondition[]
  dependsOn?: string[]
  category?: string
  advanced?: boolean
  tooltip?: string
  // Enhanced features
  conditional?: (config: Record<string, any>) => boolean
  dependencies?: string[]
  helpText?: string
  placeholder?: string
}

export interface NodeConfig {
  fields: DynamicField[]
  categories?: string[]
  validationRules?: Record<string, any>
}

interface DynamicNodeConfigurationProps {
  nodeId: string
  nodeType: string
  config: NodeConfig
  currentValues: Record<string, any>
  onChange: (values: Record<string, any>) => void
  onSave: (values: Record<string, any>) => void
  onReset: () => void
  className?: string
}

export function DynamicNodeConfiguration({
  nodeId,
  nodeType,
  config,
  currentValues,
  onChange,
  onSave,
  onReset,
  className = ""
}: DynamicNodeConfigurationProps) {
  const [values, setValues] = useState<Record<string, any>>(currentValues || {})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Set<string>>(new Set())
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Initialize values
  useEffect(() => {
    const initialValues: Record<string, any> = {}
    config.fields.forEach(field => {
      initialValues[field.key] = currentValues[field.key] ?? field.defaultValue ?? getDefaultValueForType(field.type)
    })
    setValues(initialValues)
  }, [config.fields, currentValues])

  // Helper function to get default values
  function getDefaultValueForType(type: FieldType): any {
    switch (type) {
      case 'boolean': return false
      case 'number': return 0
      case 'slider': return 50
      case 'multiselect': return []
      case 'range': return [0, 100]
      case 'color': return '#000000'
      default: return ''
    }
  }

  // Check if field should be visible based on conditions
  function isFieldVisible(field: DynamicField): boolean {
    // Check legacy conditions format
    if (field.conditions) {
      return field.conditions.every(condition => {
        const conditionValue = values[condition.field]
        switch (condition.operator) {
          case 'equals': return conditionValue === condition.value
          case 'not_equals': return conditionValue !== condition.value
          case 'contains': return Array.isArray(conditionValue) ? conditionValue.includes(condition.value) : false
          case 'greater_than': return Number(conditionValue) > Number(condition.value)
          case 'less_than': return Number(conditionValue) < Number(condition.value)
          default: return true
        }
      })
    }

    // Check new conditional format
    if (field.conditional) {
      return field.conditional(values)
    }

    return true
  }

  // Validate field value
  function validateField(field: DynamicField, value: any): string | null {
    if (field.required && (!value || value === '')) {
      return `${field.label} is required`
    }

    if (field.validation) {
      if (field.validation.pattern && !field.validation.pattern.test(String(value))) {
        return field.validation.message || 'Invalid format'
      }

      if (field.validation.custom) {
        const result = field.validation.custom(value, values)
        if (result !== true) {
          return typeof result === 'string' ? result : 'Validation failed'
        }
      }
    }

    return null
  }

  // Handle field value changes
  function handleFieldChange(fieldKey: string, value: any) {
    const newValues = { ...values, [fieldKey]: value }
    setValues(newValues)

    // Validate field
    const field = config.fields.find(f => f.key === fieldKey)
    if (field) {
      const error = validateField(field, value)
      setErrors(prev => ({
        ...prev,
        [fieldKey]: error || ''
      }))
    }

    // Mark as touched
    setTouched(prev => new Set(prev).add(fieldKey))

    // Notify parent
    onChange(newValues)
  }

  // Handle field blur (for validation)
  function handleFieldBlur(fieldKey: string) {
    setTouched(prev => new Set(prev).add(fieldKey))
    const field = config.fields.find(f => f.key === fieldKey)
    if (field) {
      const error = validateField(field, values[fieldKey])
      setErrors(prev => ({
        ...prev,
        [fieldKey]: error || ''
      }))
    }
  }

  // Filter fields based on category and visibility
  const filteredFields = config.fields.filter(field => {
    if (!isFieldVisible(field)) return false
    if (selectedCategory === 'all') return true
    if (selectedCategory === 'basic') return !field.advanced
    if (selectedCategory === 'advanced') return field.advanced
    return field.category === selectedCategory
  })

  // Group fields by category
  const groupedFields = filteredFields.reduce((acc, field) => {
    const category = field.category || 'General'
    if (!acc[category]) acc[category] = []
    acc[category].push(field)
    return acc
  }, {} as Record<string, DynamicField[]>)

  // Render field component
  function renderField(field: DynamicField) {
    const value = values[field.key]
    const error = errors[field.key]
    const isTouched = touched.has(field.key)
    const showError = isTouched && error

    const baseProps = {
      id: field.key,
      className: `w-full ${showError ? 'border-red-500' : ''}`,
      placeholder: field.placeholder,
      disabled: field.conditions && !isFieldVisible(field)
    }

    switch (field.type) {
      case 'text':
        return (
          <Input
            {...baseProps}
            type="text"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            onBlur={() => handleFieldBlur(field.key)}
          />
        )

      case 'number':
        return (
          <Input
            {...baseProps}
            type="number"
            value={value || ''}
            min={field.min}
            max={field.max}
            step={field.step}
            onChange={(e) => handleFieldChange(field.key, e.target.valueAsNumber || 0)}
            onBlur={() => handleFieldBlur(field.key)}
          />
        )

      case 'textarea':
        return (
          <Textarea
            {...baseProps}
            value={value || ''}
            rows={3}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            onBlur={() => handleFieldBlur(field.key)}
          />
        )

      case 'boolean':
        return (
          <Switch
            checked={Boolean(value)}
            onCheckedChange={(checked) => handleFieldChange(field.key, checked)}
          />
        )

      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={(val) => handleFieldChange(field.key, val)}
          >
            <SelectTrigger className={baseProps.className}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'slider':
        return (
          <div className="space-y-2">
            <Slider
              value={[value || field.min || 0]}
              onValueChange={([val]) => handleFieldChange(field.key, val)}
              min={field.min || 0}
              max={field.max || 100}
              step={field.step || 1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{field.min || 0}</span>
              <span className="font-medium">{value || field.min || 0}</span>
              <span>{field.max || 100}</span>
            </div>
          </div>
        )

      case 'multiselect':
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {value?.map((item: any, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {item}
                  <button
                    onClick={() => {
                      const newValue = value.filter((_: any, i: number) => i !== index)
                      handleFieldChange(field.key, newValue)
                    }}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <Select
              onValueChange={(val) => {
                const newValue = [...(value || []), val]
                handleFieldChange(field.key, newValue)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Add option..." />
              </SelectTrigger>
              <SelectContent>
                {field.options?.filter(opt => !value?.includes(opt.value)).map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 'code':
        return (
          <div className="relative">
            <Textarea
              {...baseProps}
              value={value || ''}
              rows={6}
              className="font-mono text-sm"
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              onBlur={() => handleFieldBlur(field.key)}
            />
            <div className="absolute top-2 right-2">
              <Code className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        )

      case 'slider':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{field.label}</Label>
              <span className="text-sm text-gray-500">{value || field.min || 0}</span>
            </div>
            <Slider
              value={[value || field.min || 0]}
              onValueChange={([val]) => handleFieldChange(field.key, val)}
              min={field.min || 0}
              max={field.max || 100}
              step={field.step || 1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>{field.min || 0}</span>
              <span>{field.max || 100}</span>
            </div>
            {field.helpText && (
              <p className="text-xs text-gray-500">{field.helpText}</p>
            )}
          </div>
        )

      case 'code':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{field.label}</Label>
              <Badge variant="outline" className="text-xs">JavaScript</Badge>
            </div>
            <Textarea
              value={value || ''}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              onBlur={() => handleFieldBlur(field.key)}
              rows={6}
              className="font-mono text-sm resize-y"
              placeholder={field.placeholder || "// Enter JavaScript code..."}
            />
            {field.helpText && (
              <p className="text-xs text-gray-500">{field.helpText}</p>
            )}
          </div>
        )

      case 'multiselect':
        return (
          <div className="space-y-3">
            <Label className="text-sm font-medium">{field.label}</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
              {field.options?.map(option => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={(value || []).includes(option.value)}
                    onChange={(e) => {
                      const current = value || []
                      const updated = e.target.checked
                        ? [...current, option.value]
                        : current.filter((v: any) => v !== option.value)
                      handleFieldChange(field.key, updated)
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
            {field.helpText && (
              <p className="text-xs text-gray-500">{field.helpText}</p>
            )}
          </div>
        )

      case 'color':
        return (
          <div className="space-y-3">
            <Label className="text-sm font-medium">{field.label}</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={value || '#000000'}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                className="w-12 h-10 border rounded cursor-pointer"
              />
              <Input
                value={value || '#000000'}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                onBlur={() => handleFieldBlur(field.key)}
                placeholder="#000000"
                className="flex-1 font-mono"
              />
            </div>
            {field.helpText && (
              <p className="text-xs text-gray-500">{field.helpText}</p>
            )}
          </div>
        )

      case 'textarea':
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{field.label}</Label>
            <Textarea
              value={value || ''}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              onBlur={() => handleFieldBlur(field.key)}
              rows={3}
              placeholder={field.placeholder}
            />
            {field.helpText && (
              <p className="text-xs text-gray-500">{field.helpText}</p>
            )}
          </div>
        )

      default:
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{field.label}</Label>
            <Input
              {...baseProps}
              type={field.type === 'number' ? 'number' : 'text'}
              value={value || ''}
              onChange={(e) => handleFieldChange(field.key,
                field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
              )}
              onBlur={() => handleFieldBlur(field.key)}
              min={field.min}
              max={field.max}
              step={field.step}
            />
            {field.helpText && (
              <p className="text-xs text-gray-500">{field.helpText}</p>
            )}
          </div>
        )
    }
  }

  // Handle save
  function handleSave() {
    // Validate all fields
    const newErrors: Record<string, string> = {}
    config.fields.forEach(field => {
      if (isFieldVisible(field)) {
        const error = validateField(field, values[field.key])
        if (error) newErrors[field.key] = error
      }
    })

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      onSave(values)
      toast.success("Configuration saved successfully!")
    } else {
      toast.error("Please fix the validation errors before saving.")
    }
  }

  return (
    <Card className={`w-full max-w-2xl ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <CardTitle className="text-lg">{nodeType} Configuration</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <ToggleLeft className="w-4 h-4 mr-1" />
              Advanced
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onReset}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </div>

        {/* Category Filter */}
        {config.categories && config.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {['all', 'basic', 'advanced', ...config.categories].map(category => (
              <Button
                key={category}
                size="sm"
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="text-xs capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {Object.entries(groupedFields).map(([category, fields]) => (
          <div key={category}>
            <h3 className="font-medium text-sm text-gray-700 mb-3">{category}</h3>
            <div className="space-y-4">
              {fields.map(field => (
                <div key={field.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={field.key} className="text-sm font-medium">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {field.tooltip && (
                      <Info className="w-4 h-4 text-gray-400" title={field.tooltip} />
                    )}
                  </div>

                  {field.description && (
                    <p className="text-xs text-gray-500">{field.description}</p>
                  )}

                  {renderField(field)}

                  {showError && (
                    <div className="flex items-center gap-1 text-red-600 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      {errors[field.key]}
                    </div>
                  )}

                  {field.type === 'boolean' && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {Boolean(values[field.key]) ? 'Enabled' : 'Disabled'}
                      </span>
                      {Boolean(values[field.key]) && (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Separator className="mt-4" />
          </div>
        ))}

        {Object.keys(groupedFields).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No fields to configure in this category.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
