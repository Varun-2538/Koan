"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { 
  X, 
  Settings, 
  Save, 
  RotateCcw, 
  Info,
  AlertCircle,
  CheckCircle,
  Copy,
  Plus,
  Minus,
  ExternalLink,
  Code,
  FileText,
  Layers,
  Calendar,
  Clock,
  Hash,
  Type,
  ToggleLeft,
  List,
  Play,
  Loader2,
  Download
} from "lucide-react"
import type { Node } from "@xyflow/react"
import { unitePluginSystem } from "@/lib/unite-plugin-system"
import { 
  FieldDefinition, 
  PluginDefinition,
  ValidationRule,
  FieldType 
} from "@/lib/plugin-system/types"
import { codeExecutionClient, type CodeExecutionResponse } from "@/lib/code-execution-client"

interface NodeConfigPanelProps {
  node: Node | null
  onClose: () => void
  onUpdateNode: (nodeId: string, config: any) => void
}

interface FieldValue {
  [key: string]: any
}

const getFieldIcon = (type: FieldType) => {
  switch (type) {
    case 'text': return <Type className="w-4 h-4" />
    case 'number': return <Hash className="w-4 h-4" />
    case 'boolean': return <ToggleLeft className="w-4 h-4" />
    case 'select': return <List className="w-4 h-4" />
    case 'multiselect': return <Layers className="w-4 h-4" />
    case 'textarea': return <FileText className="w-4 h-4" />
    case 'code': return <Code className="w-4 h-4" />
    case 'date': return <Calendar className="w-4 h-4" />
    case 'time': return <Clock className="w-4 h-4" />
    default: return <Settings className="w-4 h-4" />
  }
}

export function EnhancedNodeConfigPanel({ node, onClose, onUpdateNode }: NodeConfigPanelProps) {
  const [config, setConfig] = useState<FieldValue>({})
  const [plugin, setPlugin] = useState<PluginDefinition | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState<CodeExecutionResponse | null>(null)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [chainOptions, setChainOptions] = useState<{ label: string; value: string }[]>([])
  const [tokenOptions, setTokenOptions] = useState<{ label: string; value: string }[]>([])
  const [tokensLoading, setTokensLoading] = useState(false)

  // Popular defaults for quick selection when API key isn't provided yet
  const DEFAULT_TOKENS: Record<string, Array<{ address: string; symbol: string; name: string }>> = {
    '1': [ // Ethereum
      { address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', symbol: 'ETH', name: 'Ethereum' },
      { address: '0xA0b86991c6218b36c1d19d4a2e9Eb0cE3606eB48', symbol: 'USDC', name: 'USD Coin' },
      { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether USD' },
      { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol: 'WETH', name: 'Wrapped Ether' },
      { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI', name: 'Dai Stablecoin' },
      { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC', name: 'Wrapped BTC' }
    ],
    '137': [ // Polygon
      { address: '0x0000000000000000000000000000000000001010', symbol: 'MATIC', name: 'Polygon' },
      { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', symbol: 'USDC', name: 'USD Coin (PoS)' },
      { address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', symbol: 'WETH', name: 'Wrapped Ether (PoS)' },
      { address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', symbol: 'WBTC', name: 'Wrapped BTC (PoS)' },
      { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', symbol: 'USDT', name: 'Tether USD (PoS)' }
    ],
    '56': [ // BSC
      { address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', symbol: 'WBNB', name: 'Wrapped BNB' },
      { address: '0x55d398326f99059fF775485246999027B3197955', symbol: 'USDT', name: 'Tether USD' },
      { address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', symbol: 'USDC', name: 'USD Coin' },
      { address: '0x7130d2a12b9bcBFAe4f2634d864A1Ee1Ce3Ead9c', symbol: 'BTCB', name: 'Binance-Peg BTCB' }
    ],
    '42161': [ // Arbitrum
      { address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', symbol: 'WETH', name: 'Wrapped Ether' },
      { address: '0xAf88d065e77c8C2239327C5EDb3A432268e5831e', symbol: 'USDC', name: 'USD Coin' },
      { address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', symbol: 'USDC.e', name: 'Bridged USDC' },
      { address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', symbol: 'WBTC', name: 'Wrapped BTC' }
    ],
    '10': [ // Optimism
      { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH', name: 'Wrapped Ether' },
      { address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', symbol: 'USDC', name: 'USD Coin' },
      { address: '0x94b008Aa00579c1307B0EF2c499aD98a8ce58e58', symbol: 'USDT', name: 'Tether USD' },
      { address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', symbol: 'DAI', name: 'Dai Stablecoin' }
    ],
    '43114': [ // Avalanche
      { address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', symbol: 'WAVAX', name: 'Wrapped AVAX' },
      { address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', symbol: 'USDC', name: 'USD Coin' },
      { address: '0xc7198437980c041c805A1EDcbA50c1Ce5db95118', symbol: 'USDT.e', name: 'Tether USD (bridged)' },
      { address: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', symbol: 'WETH.e', name: 'Wrapped Ether (bridged)' }
    ]
  }

  // Load plugin definition when node changes
  useEffect(() => {
    const loadPlugin = async () => {
      const componentId = node?.data?.componentId || node?.type
      if (!componentId) {
        setPlugin(null)
        setConfig({})
        return
      }

      setLoading(true)
      try {
        // Ensure plugin system is initialized
        await unitePluginSystem.initialize()
        
        // Get component from plugin system using componentId
        const componentDef = unitePluginSystem.getComponent(componentId)
        
        console.log('🔍 Loading component configuration:', {
          componentId,
          componentDef,
          hasTemplate: !!componentDef?.template,
          configFields: componentDef?.template?.configuration,
          fields: componentDef?.template?.fields,
          bothLength: {
            configuration: componentDef?.template?.configuration?.length || 0,
            fields: componentDef?.template?.fields?.length || 0
          }
        })
        
        if (componentDef) {
          setPlugin(componentDef as any) // Temporary type cast
          
          // Initialize config with default values from template fields
          const fields = componentDef.template?.configuration || componentDef.template?.fields || []
          const defaultConfig: FieldValue = {}
          fields.forEach(field => {
            if (field.defaultValue !== undefined) {
              defaultConfig[field.key] = field.defaultValue
            }
          })
          
          console.log('🔧 Default config:', { fields, defaultConfig })
          
          // Merge with existing node config
          const mergedConfig = {
            ...defaultConfig,
            ...(node.data?.config || {})
          }
          
          setConfig(mergedConfig)
        } else {
          console.error('Component not found in plugin system:', componentId)
          setPlugin(null)
          setConfig({})
        }
      } catch (error) {
        console.error('Failed to load plugin definition:', error)
        setPlugin(null)
        setConfig({})
      } finally {
        setLoading(false)
      }
    }

    loadPlugin()
  }, [node?.type, node?.data?.componentId, node?.data?.config])

  // Load chain options for 1inch nodes (quote/swap)
  useEffect(() => {
    const loadChains = async () => {
      if (plugin?.id !== 'oneInchQuote' && plugin?.id !== 'oneInchSwap') return
      try {
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
        const res = await fetch(`${base}/api/config`)
        const data = await res.json()
        const idToName: Record<string, string> = {
          '1': 'Ethereum',
          '137': 'Polygon',
          '56': 'BSC',
          '42161': 'Arbitrum One',
          '10': 'Optimism',
          '43114': 'Avalanche'
        }
        const options = (data.supportedChains || []).map((id: string) => ({
          value: String(id),
          label: idToName[String(id)] || String(id)
        }))
        setChainOptions(options)
      } catch {
        setChainOptions([
          { value: '1', label: 'Ethereum' },
          { value: '137', label: 'Polygon' }
        ])
      }
    }
    loadChains()
  }, [plugin?.id])

  // Load token options when chainId and apiKey present (quote/swap)
  useEffect(() => {
    const loadTokens = async () => {
      if (plugin?.id !== 'oneInchQuote' && plugin?.id !== 'oneInchSwap') return
      if (!config.chainId || !config.apiKey) {
        setTokenOptions([])
        return
      }
      try {
        setTokensLoading(true)
        // If API key present, fetch full list; else fall back to curated defaults
        if (config.apiKey) {
          const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
          const res = await fetch(`${base}/api/1inch/tokens?chainId=${encodeURIComponent(config.chainId)}&apiKey=${encodeURIComponent(config.apiKey)}`)
          const data = await res.json()
          const tokensObj = data.tokens || {}
          const options = Object.values(tokensObj).map((t: any) => ({
            value: t.address,
            label: t.symbol ? `${t.symbol} — ${t.name || t.address}` : (t.name || t.address)
          }))
          options.sort((a, b) => a.label.localeCompare(b.label))
          setTokenOptions(options)
        } else {
          const defaults = DEFAULT_TOKENS[String(config.chainId)] || []
          setTokenOptions(defaults.map(t => ({ value: t.address, label: `${t.symbol} — ${t.name}` })))
        }
      } catch {
        const defaults = DEFAULT_TOKENS[String(config.chainId)] || []
        setTokenOptions(defaults.map(t => ({ value: t.address, label: `${t.symbol} — ${t.name}` })))
      } finally {
        setTokensLoading(false)
      }
    }
    loadTokens()
  }, [plugin?.id, config.chainId, config.apiKey])

  if (!node || loading) {
    return (
      <div className="w-full sm:w-80 bg-white border-l border-gray-200 flex flex-col h-full shadow-lg">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Settings className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-sm text-gray-600">Loading configuration...</p>
          </div>
        </div>
      </div>
    )
  }

  const handleConfigChange = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
    setHasUnsavedChanges(true)
    
    // Clear validation error for this field
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[key]
        return newErrors
      })
    }
  }

  const validateField = (field: FieldDefinition, value: any): string | null => {
    // Check required fields
    if (field.required && (value === undefined || value === null || value === '')) {
      return `${field.label} is required`
    }

    // Type validation
    if (value !== undefined && value !== null && value !== '') {
      switch (field.type) {
        case 'number':
          if (isNaN(Number(value))) {
            return `${field.label} must be a valid number`
          }
          break
        case 'email':
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
            return `${field.label} must be a valid email address`
          }
          break
        case 'url':
          try {
            new URL(String(value))
          } catch {
            return `${field.label} must be a valid URL`
          }
          break
        case 'array':
          if (!Array.isArray(value)) {
            return `${field.label} must be an array`
          }
          break
      }
    }

    // Custom validation rules
    if (field.validation && value !== undefined && value !== null && value !== '') {
      for (const rule of field.validation) {
        switch (rule.type) {
          case 'min':
            if (Number(value) < Number(rule.value)) {
              return rule.message || `${field.label} must be at least ${rule.value}`
            }
            break
          case 'max':
            if (Number(value) > Number(rule.value)) {
              return rule.message || `${field.label} must be at most ${rule.value}`
            }
            break
          case 'minLength':
            if (String(value).length < Number(rule.value)) {
              return rule.message || `${field.label} must be at least ${rule.value} characters`
            }
            break
          case 'maxLength':
            if (String(value).length > Number(rule.value)) {
              return rule.message || `${field.label} must be at most ${rule.value} characters`
            }
            break
          case 'pattern':
            if (!new RegExp(String(rule.value)).test(String(value))) {
              return rule.message || `${field.label} format is invalid`
            }
            break
        }
      }
    }

    return null
  }

  const validateConfig = (): boolean => {
    if (!plugin) return false
    
    const errors: Record<string, string> = {}
    const fields = plugin.template?.configuration || plugin.template?.fields || []
    
    for (const field of fields) {
      const error = validateField(field, config[field.key])
      if (error) {
        errors[field.key] = error
      }
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = () => {
    if (validateConfig()) {
      onUpdateNode(node.id, config)
      setHasUnsavedChanges(false)
      console.log('✅ Configuration saved for node:', node.id, config)
    }
  }

  const handleReset = () => {
    if (!plugin) return
    
    const fields = plugin.template?.configuration || plugin.template?.fields || []
    const defaultConfig: FieldValue = {}
    fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        defaultConfig[field.key] = field.defaultValue
      }
    })
    
    const mergedConfig = {
      ...defaultConfig,
      ...(node.data?.config || {})
    }
    
    setConfig(mergedConfig)
    setHasUnsavedChanges(false)
    setValidationErrors({})
  }

  const handleExecute = async () => {
    if (!plugin || !validateConfig()) return

    setExecuting(true)
    setExecutionResult(null)
    setGeneratedCode(null)

    try {
      const result = await codeExecutionClient.executeNode({
        nodeType: plugin.id,
        inputs: config,
        context: {
          nodeId: node.id,
          workflowId: 'config_panel_test',
          executionId: `test_${Date.now()}`,
          environment: 'development'
        }
      })

      setExecutionResult(result)
      console.log('Node execution completed:', result)
    } catch (error) {
      console.error('Node execution failed:', error)
      setExecutionResult({
        success: false,
        nodeId: node.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: new Date().toISOString()
      })
    } finally {
      setExecuting(false)
    }
  }

  const handleGenerateCode = async () => {
    if (!plugin || !validateConfig()) return

    setExecuting(true)
    setGeneratedCode(null)

    try {
      const result = await codeExecutionClient.executeAndGenerateCode(
        plugin.id,
        config,
        {
          outputType: 'react',
          includeTests: true,
          includeDocs: true,
          context: {
            nodeId: node.id,
            workflowId: 'code_generation',
            environment: 'development'
          }
        }
      )

      setExecutionResult(result)
      
      if (result.codeGeneration) {
        // Format the generated code for display
        const formattedCode = Object.entries(result.codeGeneration.files)
          .map(([filename, content]) => `// ${filename}\n${content}`)
          .join('\n\n// ========================================\n\n')
        setGeneratedCode(formattedCode)
      }
      
      console.log('Code generation completed:', result)
    } catch (error) {
      console.error('Code generation failed:', error)
      setExecutionResult({
        success: false,
        nodeId: node.id,
        error: error instanceof Error ? error.message : 'Code generation failed',
        executionTime: new Date().toISOString()
      })
    } finally {
      setExecuting(false)
    }
  }

  const renderField = (field: FieldDefinition) => {
    const value = config[field.key]
    const error = validationErrors[field.key]
    
    return (
      <div key={field.key} className="space-y-2">
        <Label htmlFor={field.key} className="text-sm font-medium flex items-center gap-2">
          {getFieldIcon(field.type)}
          {field.label}
          {field.required && <span className="text-red-500">*</span>}
        </Label>
        
        {field.description && (
          <p className="text-xs text-gray-500">{field.description}</p>
        )}
        
        {renderFieldInput(field, value)}
        
        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>
    )
  }

  const renderFieldInput = (field: FieldDefinition, value: any) => {
    const commonProps = {
      id: field.key,
      className: validationErrors[field.key] ? "border-red-500" : ""
    }

    // Custom rendering for 1inch Quote/Swap nodes
    if (plugin?.id === 'oneInchQuote' || plugin?.id === 'oneInchSwap') {
      if (field.key === 'chainId') {
        return (
          <Select
            value={value || ''}
            onValueChange={(newValue) => {
              // Reset tokens on chain change
              setTokenOptions([])
              handleConfigChange('chainId', newValue)
              handleConfigChange('src', '')
              handleConfigChange('dst', '')
            }}
          >
            <SelectTrigger className={commonProps.className}>
              <SelectValue placeholder="Select chain" />
            </SelectTrigger>
            <SelectContent>
              {chainOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      }

      if (field.key === 'src' || field.key === 'dst') {
        return (
          <div>
            <Select
              value={value || ''}
              onValueChange={(newValue) => handleConfigChange(field.key, newValue)}
            >
              <SelectTrigger className={commonProps.className}>
                <SelectValue placeholder={tokensLoading ? 'Loading tokens...' : 'Select token'} />
              </SelectTrigger>
              <SelectContent>
                {tokenOptions.map(opt => (
                  <SelectItem key={`${field.key}-${opt.value}`} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(!config.apiKey || !config.chainId) && (
              <p className="text-xs text-gray-400 mt-1">Enter API key and chain to load tokens</p>
            )}
          </div>
        )
      }
    }

    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
      case 'password':
        return (
          <Input
            {...commonProps}
            type={field.type === 'password' ? 'password' : field.type === 'email' ? 'email' : 'text'}
            value={value || ''}
            onChange={(e) => handleConfigChange(field.key, e.target.value)}
            placeholder={field.placeholder}
          />
        )

      case 'number':
        return (
          <Input
            {...commonProps}
            type="number"
            value={value || ''}
            onChange={(e) => handleConfigChange(field.key, e.target.value)}
            placeholder={field.placeholder}
          />
        )

      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            value={value || ''}
            onChange={(e) => handleConfigChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
          />
        )

      case 'code':
        return (
          <Textarea
            {...commonProps}
            value={value || ''}
            onChange={(e) => handleConfigChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className={`font-mono text-sm ${commonProps.className}`}
            rows={6}
          />
        )

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={field.key}
              checked={Boolean(value)}
              onCheckedChange={(checked) => handleConfigChange(field.key, checked)}
            />
            <Label htmlFor={field.key} className="text-sm">
              {field.placeholder || 'Enable this option'}
            </Label>
          </div>
        )

      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={(newValue) => handleConfigChange(field.key, newValue)}
          >
            <SelectTrigger className={commonProps.className}>
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

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : []
        return (
          <div className="space-y-2 border rounded-md p-3">
            {field.options?.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.key}-${option.value}`}
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleConfigChange(field.key, [...selectedValues, option.value])
                    } else {
                      handleConfigChange(field.key, selectedValues.filter((v: string) => v !== option.value))
                    }
                  }}
                />
                <Label htmlFor={`${field.key}-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        )

      case 'slider':
        const numValue = Number(value) || 0
        return (
          <div className="space-y-2">
            <Slider
              value={[numValue]}
              onValueChange={(values) => handleConfigChange(field.key, values[0])}
              max={field.max || 100}
              min={field.min || 0}
              step={field.step || 1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{field.min || 0}</span>
              <span className="font-medium">{numValue}</span>
              <span>{field.max || 100}</span>
            </div>
          </div>
        )

      case 'array':
        const arrayValue = Array.isArray(value) ? value : []
        return (
          <div className="space-y-2">
            {arrayValue.map((item: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={item}
                  onChange={(e) => {
                    const newArray = [...arrayValue]
                    newArray[index] = e.target.value
                    handleConfigChange(field.key, newArray)
                  }}
                  placeholder={`Item ${index + 1}`}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newArray = arrayValue.filter((_: any, i: number) => i !== index)
                    handleConfigChange(field.key, newArray)
                  }}
                >
                  <Minus className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleConfigChange(field.key, [...arrayValue, ''])
              }}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        )

      case 'date':
        return (
          <Input
            {...commonProps}
            type="date"
            value={value || ''}
            onChange={(e) => handleConfigChange(field.key, e.target.value)}
          />
        )

      case 'time':
        return (
          <Input
            {...commonProps}
            type="time"
            value={value || ''}
            onChange={(e) => handleConfigChange(field.key, e.target.value)}
          />
        )

      case 'color':
        return (
          <Input
            {...commonProps}
            type="color"
            value={value || '#000000'}
            onChange={(e) => handleConfigChange(field.key, e.target.value)}
            className="w-20 h-10"
          />
        )

      default:
        return (
          <Input
            {...commonProps}
            value={value || ''}
            onChange={(e) => handleConfigChange(field.key, e.target.value)}
            placeholder={field.placeholder}
          />
        )
    }
  }

  const renderConfigForm = () => {
    if (!plugin) {
      return (
        <div className="text-center text-gray-500 py-8">
          <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Plugin definition not found</p>
          <p className="text-xs text-gray-400 mt-1">Component ID: {node?.data?.componentId || node?.type}</p>
        </div>
      )
    }

    const fields = plugin.template?.configuration || plugin.template?.fields || plugin.inputs || []

    if (fields.length === 0) {
      return (
        <div className="text-center text-gray-500 py-8">
          <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No configuration required</p>
          <p className="text-xs text-gray-400 mt-1">This plugin is ready to use</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {fields.map(field => renderField(field))}
      </div>
    )
  }

  return (
    <div className="w-full sm:w-80 bg-white border-l border-gray-200 flex flex-col h-full shadow-lg">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base sm:text-lg font-semibold">Node Configuration</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {plugin && (
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <Badge variant="outline" className="text-xs">{plugin.category}</Badge>
            <Badge variant="secondary" className="text-xs">v{plugin.version}</Badge>
            {hasUnsavedChanges && (
              <Badge variant="destructive" className="text-xs">
                Unsaved changes
              </Badge>
            )}
          </div>
        )}

        <div className="text-sm text-gray-600">
          <div className="font-medium">{plugin?.name || node.type}</div>
          <div className="text-xs mt-1">{plugin?.description || 'No description available'}</div>
        </div>
      </div>

      {/* Configuration Form */}
      <ScrollArea className="flex-1 p-3 sm:p-4">
        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="config" className="text-xs sm:text-sm">Config</TabsTrigger>
            <TabsTrigger value="execute" className="text-xs sm:text-sm">Execute</TabsTrigger>
            <TabsTrigger value="code" className="text-xs sm:text-sm">Code</TabsTrigger>
            <TabsTrigger value="info" className="text-xs sm:text-sm">Info</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-3 sm:space-y-4 mt-4">
            {renderConfigForm()}
          </TabsContent>

          <TabsContent value="execute" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={handleExecute}
                  disabled={executing || !plugin || Object.keys(validationErrors).length > 0}
                  className="flex-1"
                  size="sm"
                >
                  {executing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Test Execute
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleGenerateCode}
                  disabled={executing || !plugin || Object.keys(validationErrors).length > 0}
                  variant="outline"
                  size="sm"
                >
                  {executing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Code className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {executionResult && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {executionResult.success ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Execution Successful
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          Execution Failed
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {executionResult.success && executionResult.result && (
                      <div>
                        <Label className="text-xs font-medium">Result:</Label>
                        <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(executionResult.result, null, 2)}
                        </pre>
                      </div>
                    )}

                    {executionResult.error && (
                      <div>
                        <Label className="text-xs font-medium text-red-600">Error:</Label>
                        {typeof executionResult.error === 'string' ? (
                          <p className="text-xs text-red-600 mt-1">{executionResult.error}</p>
                        ) : (
                          <pre className="text-xs text-red-600 bg-red-50 p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(executionResult.error, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}

                    {executionResult.logs && executionResult.logs.length > 0 && (
                      <div>
                        <Label className="text-xs font-medium">Logs:</Label>
                        <div className="text-xs bg-gray-50 p-2 rounded mt-1 space-y-1">
                          {executionResult.logs.map((log, index) => (
                            <div key={index} className="font-mono">{log}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 flex items-center justify-between">
                      <span>Plugin: {executionResult.pluginUsed} v{executionResult.pluginVersion}</span>
                      <span>Time: {new Date(executionResult.executionTime).toLocaleTimeString()}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!executionResult && !executing && (
                <div className="text-center text-gray-500 py-8">
                  <Play className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Test your node configuration</p>
                  <p className="text-xs text-gray-400 mt-1">Execute to see real-time results</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="code" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={handleGenerateCode}
                  disabled={executing || !plugin || Object.keys(validationErrors).length > 0}
                  className="flex-1"
                  size="sm"
                >
                  {executing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Code className="w-4 h-4 mr-2" />
                      Generate Code
                    </>
                  )}
                </Button>
                {generatedCode && (
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedCode)
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {generatedCode ? (
                <div>
                  <Label className="text-xs font-medium">Generated React Component:</Label>
                  <Textarea
                    value={generatedCode}
                    readOnly
                    className="font-mono text-xs mt-1 min-h-[300px]"
                  />
                  
                  {executionResult?.codeGeneration && (
                    <div className="mt-3 space-y-2">
                      <Label className="text-xs font-medium">Package Info:</Label>
                      <div className="text-xs bg-gray-50 p-2 rounded space-y-1">
                        <div><strong>Entry Point:</strong> {executionResult.codeGeneration.entryPoint}</div>
                        {executionResult.codeGeneration.dependencies && (
                          <div>
                            <strong>Dependencies:</strong> {Object.keys(executionResult.codeGeneration.dependencies).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Generate React code from your configuration</p>
                  <p className="text-xs text-gray-400 mt-1">Create reusable components instantly</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="info" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Node ID</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                    {node.id}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(node.id)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Plugin ID</Label>
                <p className="text-sm text-gray-600 mt-1">{plugin?.id || node.type}</p>
              </div>

              {plugin && (
                <>
                  <div>
                    <Label className="text-sm font-medium">Version</Label>
                    <p className="text-sm text-gray-600 mt-1">v{plugin.version}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <p className="text-sm text-gray-600 mt-1">{plugin.category}</p>
                  </div>

                  {plugin.tags && plugin.tags.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Tags</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {plugin.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-medium">Required Fields</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(plugin.template?.configuration || plugin.template?.fields || [])
                        .filter(field => field.required)
                        .map(field => (
                          <Badge key={field.key} variant="outline" className="text-xs">
                            {field.label || field.name}
                          </Badge>
                        ))}
                    </div>
                  </div>

                  {plugin.executor && (
                    <div>
                      <Label className="text-sm font-medium">Executor Type</Label>
                      <p className="text-sm text-gray-600 mt-1">{plugin.executor.type}</p>
                    </div>
                  )}

                  {plugin.documentation && (
                    <div>
                      <Label className="text-sm font-medium">Documentation</Label>
                      <a
                        href={plugin.documentation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline mt-1 flex items-center gap-1"
                      >
                        View Documentation
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </ScrollArea>

      {/* Actions */}
      <div className="p-4 border-t space-y-2">
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className="flex-1"
            size="sm"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasUnsavedChanges}
            size="sm"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {Object.keys(validationErrors).length > 0 && (
          <div className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Please fix validation errors before saving
          </div>
        )}

        {!hasUnsavedChanges && Object.keys(validationErrors).length === 0 && plugin && (
          <div className="text-xs text-green-600 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Configuration is valid
          </div>
        )}
      </div>
    </div>
  )
}