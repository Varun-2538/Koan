"use client"

import { useState, useEffect } from "react"
import type { Node } from "@xyflow/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from "lucide-react"

interface NodeConfigPanelProps {
  node: Node
  onConfigChange: (config: any) => void
  onClose: () => void
}

export function NodeConfigPanel({ node, onConfigChange, onClose }: NodeConfigPanelProps) {
  const [config, setConfig] = useState(node.data.config || {})

  useEffect(() => {
    setConfig(node.data.config || {})
  }, [node])

  const handleConfigUpdate = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)
    onConfigChange(newConfig)
  }

  const renderConfigFields = () => {
    switch (node.type) {
      case "erc20Token":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token-name">Token Name</Label>
              <Input
                id="token-name"
                value={config.name || ""}
                onChange={(e) => handleConfigUpdate("name", e.target.value)}
                placeholder="MyToken"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="token-symbol">Symbol</Label>
              <Input
                id="token-symbol"
                value={config.symbol || ""}
                onChange={(e) => handleConfigUpdate("symbol", e.target.value)}
                placeholder="MTK"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total-supply">Total Supply</Label>
              <Input
                id="total-supply"
                type="number"
                value={config.totalSupply || ""}
                onChange={(e) => handleConfigUpdate("totalSupply", e.target.value)}
                placeholder="1000000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="decimals">Decimals</Label>
              <Input
                id="decimals"
                type="number"
                value={config.decimals || "18"}
                onChange={(e) => handleConfigUpdate("decimals", e.target.value)}
                placeholder="18"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="mintable"
                checked={config.mintable || false}
                onCheckedChange={(checked) => handleConfigUpdate("mintable", checked)}
              />
              <Label htmlFor="mintable">Mintable</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="burnable"
                checked={config.burnable || false}
                onCheckedChange={(checked) => handleConfigUpdate("burnable", checked)}
              />
              <Label htmlFor="burnable">Burnable</Label>
            </div>
          </div>
        )

      case "uniswapV3Router":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="router-address">Router Address</Label>
              <Input
                id="router-address"
                value={config.routerAddress || ""}
                onChange={(e) => handleConfigUpdate("routerAddress", e.target.value)}
                placeholder="0xE592427A0AEce92De3Edee1F18E0157C05861564"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="network">Network</Label>
              <Select value={config.network || "ethereum"} onValueChange={(value) => handleConfigUpdate("network", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                  <SelectItem value="polygon">Polygon</SelectItem>
                  <SelectItem value="arbitrum">Arbitrum</SelectItem>
                  <SelectItem value="base">Base</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slippage">Slippage Tolerance (%)</Label>
              <Input
                id="slippage"
                type="number"
                step="0.1"
                value={config.slippageTolerance || "0.5"}
                onChange={(e) => handleConfigUpdate("slippageTolerance", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline (minutes)</Label>
              <Input
                id="deadline"
                type="number"
                value={config.deadline || "20"}
                onChange={(e) => handleConfigUpdate("deadline", e.target.value)}
              />
            </div>
          </div>
        )

      case "chainlinkOracle":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="update-interval">Update Interval (seconds)</Label>
              <Input
                id="update-interval"
                type="number"
                value={config.updateInterval || "30"}
                onChange={(e) => handleConfigUpdate("updateInterval", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Price Feed Addresses</Label>
              <div className="space-y-2">
                <Input
                  placeholder="ETH/USD Address"
                  value={config.priceFeedAddresses?.["ETH/USD"] || ""}
                  onChange={(e) => handleConfigUpdate("priceFeedAddresses", {
                    ...config.priceFeedAddresses,
                    "ETH/USD": e.target.value
                  })}
                />
                <Input
                  placeholder="USDC/USD Address"
                  value={config.priceFeedAddresses?.["USDC/USD"] || ""}
                  onChange={(e) => handleConfigUpdate("priceFeedAddresses", {
                    ...config.priceFeedAddresses,
                    "USDC/USD": e.target.value
                  })}
                />
              </div>
            </div>
          </div>
        )

      case "swapInterface":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="interface-title">Interface Title</Label>
              <Input
                id="interface-title"
                value={config.title || ""}
                onChange={(e) => handleConfigUpdate("title", e.target.value)}
                placeholder="Token Swap"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={config.theme || "modern"} onValueChange={(value) => handleConfigUpdate("theme", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Default Tokens</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(config.defaultTokens || []).map((token: string, index: number) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {token}
                    <button
                      onClick={() => {
                        const newTokens = config.defaultTokens.filter((_: any, i: number) => i !== index)
                        handleConfigUpdate("defaultTokens", newTokens)
                      }}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Select
                onValueChange={(value) => {
                  const tokens = config.defaultTokens || []
                  if (!tokens.includes(value)) {
                    handleConfigUpdate("defaultTokens", [...tokens, value])
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add token" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ETH">ETH</SelectItem>
                  <SelectItem value="USDC">USDC</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                  <SelectItem value="DAI">DAI</SelectItem>
                  <SelectItem value="WBTC">WBTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="advanced-settings"
                checked={config.showAdvancedSettings || false}
                onCheckedChange={(checked) => handleConfigUpdate("showAdvancedSettings", checked)}
              />
              <Label htmlFor="advanced-settings">Show Advanced Settings</Label>
            </div>
          </div>
        )

      case "walletConnector":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chain-id">Network Chain ID</Label>
              <Select value={config.networkChainId || "1"} onValueChange={(value) => handleConfigUpdate("networkChainId", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Ethereum (1)</SelectItem>
                  <SelectItem value="137">Polygon (137)</SelectItem>
                  <SelectItem value="42161">Arbitrum (42161)</SelectItem>
                  <SelectItem value="8453">Base (8453)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Supported Wallets</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(config.supportedWallets || []).map((wallet: string, index: number) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {wallet}
                    <button
                      onClick={() => {
                        const newWallets = config.supportedWallets.filter((_: any, i: number) => i !== index)
                        handleConfigUpdate("supportedWallets", newWallets)
                      }}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Select
                onValueChange={(value) => {
                  const wallets = config.supportedWallets || []
                  if (!wallets.includes(value)) {
                    handleConfigUpdate("supportedWallets", [...wallets, value])
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add wallet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MetaMask">MetaMask</SelectItem>
                  <SelectItem value="WalletConnect">WalletConnect</SelectItem>
                  <SelectItem value="Coinbase Wallet">Coinbase Wallet</SelectItem>
                  <SelectItem value="Rainbow">Rainbow</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-connect"
                checked={config.autoConnect || false}
                onCheckedChange={(checked) => handleConfigUpdate("autoConnect", checked)}
              />
              <Label htmlFor="auto-connect">Auto Connect</Label>
            </div>
          </div>
        )

      case "transactionHistory":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="max-transactions">Max Transactions</Label>
              <Input
                id="max-transactions"
                type="number"
                value={config.maxTransactions || "50"}
                onChange={(e) => handleConfigUpdate("maxTransactions", e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-pending"
                checked={config.showPendingTx || false}
                onCheckedChange={(checked) => handleConfigUpdate("showPendingTx", checked)}
              />
              <Label htmlFor="show-pending">Show Pending Transactions</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="enable-filtering"
                checked={config.enableFiltering || false}
                onCheckedChange={(checked) => handleConfigUpdate("enableFiltering", checked)}
              />
              <Label htmlFor="enable-filtering">Enable Filtering</Label>
            </div>
          </div>
        )

      case "swapAPI":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>API Endpoints</Label>
              <div className="space-y-2">
                {(config.endpoints || []).map((endpoint: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={endpoint}
                      onChange={(e) => {
                        const newEndpoints = [...config.endpoints]
                        newEndpoints[index] = e.target.value
                        handleConfigUpdate("endpoints", newEndpoints)
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newEndpoints = config.endpoints.filter((_: any, i: number) => i !== index)
                        handleConfigUpdate("endpoints", newEndpoints)
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const endpoints = config.endpoints || []
                    handleConfigUpdate("endpoints", [...endpoints, "/api/new-endpoint"])
                  }}
                >
                  Add Endpoint
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate-limit">Rate Limit (requests/min)</Label>
              <Input
                id="rate-limit"
                type="number"
                value={config.rateLimit || "100"}
                onChange={(e) => handleConfigUpdate("rateLimit", e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="api-authentication"
                checked={config.authentication || false}
                onCheckedChange={(checked) => handleConfigUpdate("authentication", checked)}
              />
              <Label htmlFor="api-authentication">Requires Authentication</Label>
            </div>
          </div>
        )

      case "tokenDataService":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Data Providers</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(config.dataProviders || []).map((provider: string, index: number) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {provider}
                    <button
                      onClick={() => {
                        const newProviders = config.dataProviders.filter((_: any, i: number) => i !== index)
                        handleConfigUpdate("dataProviders", newProviders)
                      }}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Select
                onValueChange={(value) => {
                  const providers = config.dataProviders || []
                  if (!providers.includes(value)) {
                    handleConfigUpdate("dataProviders", [...providers, value])
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CoinGecko">CoinGecko</SelectItem>
                  <SelectItem value="CoinMarketCap">CoinMarketCap</SelectItem>
                  <SelectItem value="DefiPulse">DefiPulse</SelectItem>
                  <SelectItem value="1inch">1inch API</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cache-duration">Cache Duration (seconds)</Label>
              <Input
                id="cache-duration"
                type="number"
                value={config.cacheDuration || "300"}
                onChange={(e) => handleConfigUpdate("cacheDuration", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Supported Networks</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(config.supportedNetworks || []).map((network: string, index: number) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {network}
                    <button
                      onClick={() => {
                        const newNetworks = config.supportedNetworks.filter((_: any, i: number) => i !== index)
                        handleConfigUpdate("supportedNetworks", newNetworks)
                      }}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Select
                onValueChange={(value) => {
                  const networks = config.supportedNetworks || []
                  if (!networks.includes(value)) {
                    handleConfigUpdate("supportedNetworks", [...networks, value])
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                  <SelectItem value="polygon">Polygon</SelectItem>
                  <SelectItem value="arbitrum">Arbitrum</SelectItem>
                  <SelectItem value="base">Base</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "governance":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="voting-delay">Voting Delay (days)</Label>
              <Input
                id="voting-delay"
                type="number"
                value={config.votingDelay || "1"}
                onChange={(e) => handleConfigUpdate("votingDelay", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="voting-period">Voting Period (days)</Label>
              <Input
                id="voting-period"
                type="number"
                value={config.votingPeriod || "7"}
                onChange={(e) => handleConfigUpdate("votingPeriod", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proposal-threshold">Proposal Threshold</Label>
              <Input
                id="proposal-threshold"
                type="number"
                value={config.proposalThreshold || "1000"}
                onChange={(e) => handleConfigUpdate("proposalThreshold", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quorum">Quorum (%)</Label>
              <Input
                id="quorum"
                type="number"
                value={config.quorum || "10"}
                onChange={(e) => handleConfigUpdate("quorum", e.target.value)}
                placeholder="10"
              />
            </div>
          </div>
        )

      case "dashboard":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dashboard-title">Title</Label>
              <Input
                id="dashboard-title"
                value={config.title || ""}
                onChange={(e) => handleConfigUpdate("title", e.target.value)}
                placeholder="Dashboard"
              />
            </div>
            <div className="space-y-2">
              <Label>Components</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(config.components || []).map((comp: string, index: number) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {comp}
                    <button
                      onClick={() => {
                        const newComponents = config.components.filter((_: any, i: number) => i !== index)
                        handleConfigUpdate("components", newComponents)
                      }}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Select
                onValueChange={(value) => {
                  const components = config.components || []
                  if (!components.includes(value)) {
                    handleConfigUpdate("components", [...components, value])
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add component" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="header">Header</SelectItem>
                  <SelectItem value="sidebar">Sidebar</SelectItem>
                  <SelectItem value="main">Main Content</SelectItem>
                  <SelectItem value="footer">Footer</SelectItem>
                  <SelectItem value="charts">Charts</SelectItem>
                  <SelectItem value="tables">Tables</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={config.theme || "light"} onValueChange={(value) => handleConfigUpdate("theme", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "apiEndpoint":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="method">HTTP Method</Label>
              <Select value={config.method || "GET"} onValueChange={(value) => handleConfigUpdate("method", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="path">Path</Label>
              <Input
                id="path"
                value={config.path || ""}
                onChange={(e) => handleConfigUpdate("path", e.target.value)}
                placeholder="/api/data"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="authentication"
                checked={config.authentication || false}
                onCheckedChange={(checked) => handleConfigUpdate("authentication", checked)}
              />
              <Label htmlFor="authentication">Requires Authentication</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={config.description || ""}
                onChange={(e) => handleConfigUpdate("description", e.target.value)}
                placeholder="Describe what this endpoint does..."
              />
            </div>
          </div>
        )

      case "aiAgent":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agent-type">Agent Type</Label>
              <Select
                value={config.type || "decision-making"}
                onValueChange={(value) => handleConfigUpdate("type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="decision-making">Decision Making</SelectItem>
                  <SelectItem value="data-analysis">Data Analysis</SelectItem>
                  <SelectItem value="trading">Trading</SelectItem>
                  <SelectItem value="monitoring">Monitoring</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">AI Model</Label>
              <Select
                value={config.model || "gpt-3.5-turbo"}
                onValueChange={(value) => handleConfigUpdate("model", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="claude-3">Claude 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt">System Prompt</Label>
              <Textarea
                id="prompt"
                value={config.prompt || ""}
                onChange={(e) => handleConfigUpdate("prompt", e.target.value)}
                placeholder="You are a helpful assistant that..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature</Label>
              <Input
                id="temperature"
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={config.temperature || "0.7"}
                onChange={(e) => handleConfigUpdate("temperature", e.target.value)}
              />
            </div>
          </div>
        )

      default:
        return <div>No configuration available for this node type.</div>
    }
  }

  return (
    <div className="w-80 h-screen bg-white border-l border-gray-200 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
        <h3 className="text-lg font-semibold">Configure Node</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4 pb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{node.data.label}</CardTitle>
                <CardDescription className="text-sm">
                  Configure the properties for this {node.type} node
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderConfigFields()}
              </CardContent>
            </Card>

            <div className="mt-6 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium mb-3">Configuration Preview</h4>
              <ScrollArea className="h-32">
                <pre className="text-xs text-gray-600 whitespace-pre-wrap break-all font-mono">
                  {JSON.stringify(config, null, 2)}
                </pre>
              </ScrollArea>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
