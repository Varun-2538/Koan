"use client"

import { useState } from "react"
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
import { 
  X, 
  Settings, 
  Save, 
  RotateCcw, 
  Info,
  AlertCircle,
  CheckCircle,
  Copy
} from "lucide-react"
import type { Node } from "@xyflow/react"

interface NodeConfigPanelProps {
  node: Node | null
  onClose: () => void
  onUpdateNode: (nodeId: string, config: any) => void
}

// Default configurations for different node types
const getDefaultNodeConfig = (nodeType: string) => {
  switch (nodeType) {
    case "oneInchSwap":
      return {
        template_creation_mode: true,
        from_token: "ETH",
        to_token: "USDC",
        amount: "1.0", 
        from_address: "",
        chain_id: "1",
        slippage: 1,
        apiKey: "",
        supportedChains: ["1"],
        enableFusion: true,
        defaultSlippage: 1,
        enableMEVProtection: true
      }
    case "oneInchQuote":
      return {
        template_creation_mode: true,
        from_token: "ETH",
        to_token: "USDC", 
        amount: "1.0",
        chain_id: "1",
        slippage: 1,
        apiKey: "",
        supportedChains: ["1", "137"],
        quoteRefreshInterval: 10,
        showPriceChart: true,
        showGasEstimate: true
      }
    case "fusionPlus":
      return {
        template_creation_mode: true,
        from_token: "ETH",
        to_token: "USDC",
        amount: "1.0",
        apiKey: "",
        supportedChains: ["1", "137"],
        enableMEVProtection: true,
        enableGasless: true,
        defaultTimeout: 30
      }
    case "walletConnector":
      return {
        template_creation_mode: true,
        supportedWallets: ["MetaMask", "WalletConnect", "Coinbase Wallet"],
        autoConnect: true,
        networkChainId: "1"
      }
    case "tokenInput":
      return {
        template_creation_mode: true,
        fromToken: "ETH",
        toToken: "USDC",
        amount: "1.0",
        showTokenSearch: true
      }
    case "slippageControl":
      return {
        template_creation_mode: true,
        slippage: 1.0,
        autoSlippage: false,
        minSlippage: 0.1,
        maxSlippage: 50
      }
    case "priceImpactCalculator":
      return {
        template_creation_mode: true,
        from_token: "ETH",
        to_token: "USDC",
        amount: "1.0",
        slippage: 1.0,
        autoSlippage: true,
        showPriceImpact: true,
        warnOnHighImpact: true,
        maxImpactThreshold: 5.0
      }
    case "erc20Token":
      return {
        template_creation_mode: true,
        name: "MyToken",
        symbol: "MTK",
        totalSupply: "1000000",
        decimals: "18"
      }
    case "dashboard":
      return {
        template_creation_mode: true,
        title: "Dashboard",
        components: ["header", "charts", "tables"],
        theme: "modern"
      }
    case "defiDashboard":
      return {
        template_creation_mode: true,
        title: "DeFi Dashboard",
        enableMultiSwap: true,
        showPortfolio: true,
        enableLimitOrders: true,
        showAnalytics: true,
        theme: "modern"
      }
    case "transactionMonitor":
      return {
        template_creation_mode: true,
        maxTransactions: "50",
        showPendingTx: true,
        enableFiltering: true,
        realTimeUpdates: true
      }
    case "chainSelector":
      return {
        template_creation_mode: true,
        supportedChains: ["1", "137", "42161"],
        defaultChain: "1",
        enableTestnet: false
      }
    case "tokenSelector":
      return {
        template_creation_mode: true,
        fromToken: "ETH",
        toToken: "USDC",
        amount: "1.0",
        supportedChains: ["1", "137"],
        showPriceData: true,
        enable1inchTokenList: true
      }
    case "portfolioAPI":
      return {
        template_creation_mode: true,
        from_token: "ETH",
        to_token: "USDC",
        amount: "1.0",
        apiKey: "",
        trackHistory: true,
        enableAnalytics: true
      }
    case "limitOrder":
      return {
        template_creation_mode: true,
        from_token: "ETH",
        to_token: "USDC",
        amount: "1.0",
        apiKey: "",
        orderType: "limit",
        enableAdvancedStrategies: true,
        supportedChains: ["1", "137"]
      }
    default:
      return {}
  }
}

const getNodeTypeInfo = (nodeType: string) => {
  const info = {
    oneInchSwap: {
      name: "1inch Swap",
      description: "Execute token swaps using 1inch aggregation protocol with Pathfinder routing and MEV protection",
      category: "DeFi Executable",
      requiredFields: ["apiKey"],
      documentation: "https://docs.1inch.dev/docs/aggregation-protocol/introduction"
    },
    oneInchQuote: {
      name: "1inch Quote Dashboard",
      description: "Real-time quote dashboard with sub-400ms response times using 1inch Pathfinder",
      category: "DeFi Executable", 
      requiredFields: ["apiKey", "supportedChains"],
      documentation: "https://docs.1inch.dev/docs/aggregation-protocol/api"
    },
    fusionPlus: {
      name: "1inch Fusion+",
      description: "Cross-chain swaps with MEV protection and zero gas fees",
      category: "DeFi Executable",
      requiredFields: ["apiKey"],
      documentation: "https://docs.1inch.dev/docs/fusion-plus/introduction"
    },
    walletConnector: {
      name: "Wallet Connector",
      description: "Connect to Web3 wallets like MetaMask, WalletConnect, and Coinbase Wallet",
      category: "UI Component",
      requiredFields: ["supportedWallets"],
      documentation: "https://docs.walletconnect.com/"
    },
    tokenInput: {
      name: "Token Input",
      description: "Token selection interface with search and validation",
      category: "UI Component",
      requiredFields: ["fromToken", "toToken"],
      documentation: ""
    },
    slippageControl: {
      name: "Slippage Control",
      description: "Slippage tolerance settings for swaps",
      category: "UI Component",
      requiredFields: ["slippage"],
      documentation: ""
    },
    erc20Token: {
      name: "ERC20 Token",
      description: "Create and manage ERC20 tokens",
      category: "Infrastructure",
      requiredFields: ["name", "symbol", "totalSupply"],
      documentation: "https://docs.openzeppelin.com/contracts/4.x/erc20"
    },
    dashboard: {
      name: "Dashboard",
      description: "Data visualization dashboard",
      category: "UI Component",
      requiredFields: ["title"],
      documentation: ""
    }
  }

  return info[nodeType as keyof typeof info] || {
    name: nodeType,
    description: "Custom component",
    category: "Unknown",
    requiredFields: [],
    documentation: ""
  }
}

export function NodeConfigPanel({ node, onClose, onUpdateNode }: NodeConfigPanelProps) {
  const [config, setConfig] = useState(() => {
    if (!node) return {}
    return { ...getDefaultNodeConfig(node.type), ...node.data.config }
  })
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  if (!node) return null

  const nodeInfo = getNodeTypeInfo(node.type)

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

  const validateConfig = () => {
    const errors: Record<string, string> = {}
    
    // Essential validation for 1inch nodes
    if (node.type === "oneInchSwap" || node.type === "oneInchQuote" || node.type === "fusionPlus") {
      if (!config.apiKey || config.apiKey.trim() === "") {
        errors.apiKey = "1inch API key is required for execution"
      }
    }

    if (node.type === "fusionPlus") {
      if (!config.sourceChain) errors.sourceChain = "Source chain is required"
      if (!config.destinationChain) errors.destinationChain = "Destination chain is required"
      if (!config.fromToken) errors.fromToken = "From token is required"
      if (!config.toToken) errors.toToken = "To token is required"
      if (!config.amount || config.amount <= 0) errors.amount = "Valid amount is required"
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
    const defaultConfig = getDefaultNodeConfig(node.type)
    setConfig({ ...defaultConfig, ...node.data.config })
    setHasUnsavedChanges(false)
    setValidationErrors({})
  }

  const renderConfigField = (key: string, value: any, label: string, type: string = "text") => {
    const hasError = validationErrors[key]
    const isRequired = nodeInfo.requiredFields.includes(key)

    switch (type) {
      case "boolean":
        return (
          <div className="flex items-center justify-between">
            <Label htmlFor={key} className="text-sm font-medium">
              {label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Switch
              id={key}
              checked={value || false}
              onCheckedChange={(checked) => handleConfigChange(key, checked)}
            />
          </div>
        )

      case "select":
        const options = getSelectOptions(key, node.type)
        return (
          <div className="space-y-2">
            <Label htmlFor={key} className="text-sm font-medium">
              {label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select value={value || ""} onValueChange={(newValue) => handleConfigChange(key, newValue)}>
              <SelectTrigger className={hasError ? "border-red-500" : ""}>
                <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {options.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {hasError}
              </p>
            )}
          </div>
        )

      case "multiselect":
        const multiselectOptions = getSelectOptions(key, node.type)
        const selectedValues = Array.isArray(value) ? value : []
  return (
      <div className="space-y-2">
            <Label className="text-sm font-medium">
              {label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
        <div className="space-y-2">
              {multiselectOptions.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                    id={`${key}-${option.value}`}
                    checked={selectedValues.includes(option.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                        handleConfigChange(key, [...selectedValues, option.value])
                  } else {
                        handleConfigChange(key, selectedValues.filter((v: string) => v !== option.value))
                  }
                }}
              />
                  <label htmlFor={`${key}-${option.value}`} className="text-sm">
                    {option.label}
              </label>
            </div>
          ))}
        </div>
            {hasError && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {hasError}
              </p>
            )}
      </div>
        )

      case "textarea":
        return (
      <div className="space-y-2">
            <Label htmlFor={key} className="text-sm font-medium">
              {label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={key}
              value={value || ""}
              onChange={(e) => handleConfigChange(key, e.target.value)}
              placeholder={`Enter ${label.toLowerCase()}`}
              className={hasError ? "border-red-500" : ""}
              rows={3}
            />
            {hasError && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {hasError}
              </p>
            )}
    </div>
  )

      case "password":
  return (
        <div className="space-y-2">
            <Label htmlFor={key} className="text-sm font-medium">
              {label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
          <Input
              id={key}
            type="password"
              value={value || ""}
              onChange={(e) => handleConfigChange(key, e.target.value)}
              placeholder={`Enter ${label.toLowerCase()}`}
              className={hasError ? "border-red-500" : ""}
            />
            {hasError && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {hasError}
              </p>
            )}
        </div>
        )
      
      case "number":
        return (
      <div className="space-y-2">
            <Label htmlFor={key} className="text-sm font-medium">
              {label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
        <Input
              id={key}
          type="number"
              value={value || ""}
              onChange={(e) => handleConfigChange(key, e.target.value)}
              placeholder={`Enter ${label.toLowerCase()}`}
              className={hasError ? "border-red-500" : ""}
            />
            {hasError && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {hasError}
              </p>
            )}
      </div>
        )
      
      default:
        return (
      <div className="space-y-2">
            <Label htmlFor={key} className="text-sm font-medium">
              {label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={key}
              value={value || ""}
              onChange={(e) => handleConfigChange(key, e.target.value)}
              placeholder={`Enter ${label.toLowerCase()}`}
              className={hasError ? "border-red-500" : ""}
            />
            {hasError && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {hasError}
              </p>
            )}
          </div>
        )
    }
  }

  const getSelectOptions = (key: string, nodeType: string) => {
    if (key === "supportedChains") {
      return [
        { value: "1", label: "Ethereum" },
        { value: "137", label: "Polygon" },
        { value: "56", label: "BNB Chain" },
        { value: "42161", label: "Arbitrum" },
        { value: "10", label: "Optimism" },
        { value: "43114", label: "Avalanche" }
      ]
    }

    if (key === "supportedWallets") {
      return [
        { value: "MetaMask", label: "MetaMask" },
        { value: "WalletConnect", label: "WalletConnect" },
        { value: "Coinbase Wallet", label: "Coinbase Wallet" },
        { value: "Trust Wallet", label: "Trust Wallet" }
      ]
    }

    if (key === "theme") {
      return [
        { value: "modern", label: "Modern" },
        { value: "classic", label: "Classic" },
        { value: "dark", label: "Dark" }
      ]
    }

    if (key === "networkChainId") {
      return [
        { value: "1", label: "Ethereum Mainnet" },
        { value: "137", label: "Polygon" },
        { value: "56", label: "BNB Chain" }
      ]
    }

    return []
  }

  const renderNodeConfiguration = () => {
    switch (node.type) {
      case "oneInchSwap":
        return (
          <div className="space-y-4">
            {renderConfigField("apiKey", config.apiKey, "1inch API Key", "password")}
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-700">
                💡 Get your API key from <a href="https://portal.1inch.dev" target="_blank" className="underline">portal.1inch.dev</a>
              </p>
        </div>
            {renderConfigField("supportedChains", config.supportedChains, "Supported Chains", "multiselect")}
            {renderConfigField("defaultSlippage", config.defaultSlippage, "Default Slippage (%)", "number")}
            {renderConfigField("enableMEVProtection", config.enableMEVProtection, "MEV Protection", "boolean")}
      </div>
        )

      case "oneInchQuote":
        return (
          <div className="space-y-4">
            {renderConfigField("apiKey", config.apiKey, "1inch API Key", "password")}
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-700">
                💡 Get your API key from <a href="https://portal.1inch.dev" target="_blank" className="underline">portal.1inch.dev</a>
              </p>
            </div>
            {renderConfigField("supportedChains", config.supportedChains, "Supported Chains", "multiselect")}
            {renderConfigField("quoteRefreshInterval", config.quoteRefreshInterval, "Refresh Interval (seconds)", "number")}
            {renderConfigField("showPriceChart", config.showPriceChart, "Show Price Chart", "boolean")}
            {renderConfigField("showGasEstimate", config.showGasEstimate, "Show Gas Estimate", "boolean")}
          </div>
        )

      case "portfolioAPI":
        return (
          <div className="space-y-4">
            {renderConfigField("apiKey", config.apiKey, "1inch API Key", "password")}
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-700">
                💡 Portfolio API requires the same 1inch API key
              </p>
        </div>
            {renderConfigField("supportedChains", config.supportedChains, "Supported Chains", "multiselect")}
            {renderConfigField("trackHistory", config.trackHistory, "Track History", "boolean")}
            {renderConfigField("enableAnalytics", config.enableAnalytics, "Enable Analytics", "boolean")}
      </div>
        )

      case "walletConnector":
        return (
          <div className="space-y-4">
            {renderConfigField("supportedWallets", config.supportedWallets, "Supported Wallets", "multiselect")}
            {renderConfigField("autoConnect", config.autoConnect, "Auto Connect", "boolean")}
            {renderConfigField("networkChainId", config.networkChainId, "Default Network", "select")}
    </div>
  )

case "tokenSelector":
  return (
    <div className="space-y-4">
            {renderConfigField("fromToken", config.fromToken, "From Token", "text")}
            {renderConfigField("toToken", config.toToken, "To Token", "text")}
            {renderConfigField("amount", config.amount, "Default Amount", "text")}
            {renderConfigField("showTokenSearch", config.showTokenSearch, "Show Token Search", "boolean")}
          </div>
        )

      case "transactionMonitor":
        return (
          <div className="space-y-4">
            {renderConfigField("maxTransactions", config.maxTransactions, "Max Transactions", "number")}
            {renderConfigField("showPendingTx", config.showPendingTx, "Show Pending Transactions", "boolean")}
            {renderConfigField("enableFiltering", config.enableFiltering, "Enable Filtering", "boolean")}
            {renderConfigField("realTimeUpdates", config.realTimeUpdates, "Real-time Updates", "boolean")}
          </div>
        )

      case "defiDashboard":
        return (
          <div className="space-y-4">
            {renderConfigField("title", config.title, "Dashboard Title", "text")}
            {renderConfigField("theme", config.theme, "Theme", "select")}
            {renderConfigField("showPortfolio", config.showPortfolio, "Show Portfolio", "boolean")}
            {renderConfigField("showAnalytics", config.showAnalytics, "Show Analytics", "boolean")}
          </div>
        )

      default:
        return (
          <div className="text-center text-gray-500 py-8">
            <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No configuration available for this node type</p>
            <p className="text-xs text-gray-400 mt-1">Node type: {node.type}</p>
          </div>
        )
    }
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Node Configuration</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
      </div>

        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline">{nodeInfo.category}</Badge>
          {hasUnsavedChanges && (
            <Badge variant="destructive" className="text-xs">
              Unsaved changes
            </Badge>
          )}
        </div>

        <div className="text-sm text-gray-600">
          <div className="font-medium">{nodeInfo.name}</div>
          <div className="text-xs mt-1">{nodeInfo.description}</div>
        </div>
      </div>

      {/* Configuration Form */}
      <ScrollArea className="flex-1 p-4">
        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config">Config</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4 mt-4">
            {renderNodeConfiguration()}
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
                <Label className="text-sm font-medium">Node Type</Label>
                <p className="text-sm text-gray-600 mt-1">{node.type}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Required Fields</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {nodeInfo.requiredFields.map(field => (
                    <Badge key={field} variant="outline" className="text-xs">
                      {field}
                    </Badge>
                  ))}
        </div>
      </div>

              {nodeInfo.documentation && (
                <div>
                  <Label className="text-sm font-medium">Documentation</Label>
                  <a
                    href={nodeInfo.documentation}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline mt-1 block"
                  >
                    View Documentation →
                  </a>
                </div>
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

        {!hasUnsavedChanges && Object.keys(validationErrors).length === 0 && (
          <div className="text-xs text-green-600 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Configuration is valid
          </div>
        )}
      </div>
    </div>
  )
}