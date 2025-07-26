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
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Configure Node</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{node.data.label}</CardTitle>
          <CardDescription>Configure the properties for this {node.type} node</CardDescription>
        </CardHeader>
        <CardContent>{renderConfigFields()}</CardContent>
      </Card>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium mb-2">Preview</h4>
        <pre className="text-xs text-gray-600 overflow-x-auto">{JSON.stringify(config, null, 2)}</pre>
      </div>
    </div>
  )
}
