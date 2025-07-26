"use client"

import type React from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Coins, Vote, Layout, Server, Bot } from "lucide-react"

const NodeWrapper = ({ children, selected }: { children: React.ReactNode; selected?: boolean }) => (
  <Card className={`min-w-[200px] ${selected ? "ring-2 ring-blue-500" : ""}`}>
    <CardContent className="p-3">{children}</CardContent>
  </Card>
)

export const ERC20TokenNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-blue-500 text-white rounded">
        <Coins className="w-4 h-4" />
      </div>
      <span className="font-medium">ERC-20 Token</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>Name: {data.config?.name || "MyToken"}</div>
      <div>Symbol: {data.config?.symbol || "MTK"}</div>
      <div>Supply: {data.config?.totalSupply || "1000000"}</div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

export const GovernanceNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-purple-500 text-white rounded">
        <Vote className="w-4 h-4" />
      </div>
      <span className="font-medium">Governance</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>Voting Period: {data.config?.votingPeriod || "7"} days</div>
      <div>Threshold: {data.config?.proposalThreshold || "1000"}</div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

export const DashboardNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-green-500 text-white rounded">
        <Layout className="w-4 h-4" />
      </div>
      <span className="font-medium">Dashboard</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>Title: {data.config?.title || "Dashboard"}</div>
      <div className="flex flex-wrap gap-1">
        {(data.config?.components || ["header", "sidebar"]).map((comp: string) => (
          <Badge key={comp} variant="secondary" className="text-xs">
            {comp}
          </Badge>
        ))}
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

export const APIEndpointNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-orange-500 text-white rounded">
        <Server className="w-4 h-4" />
      </div>
      <span className="font-medium">API Endpoint</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {data.config?.method || "GET"}
        </Badge>
        <span>{data.config?.path || "/api/data"}</span>
      </div>
      <div>Auth: {data.config?.authentication ? "Yes" : "No"}</div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

export const AIAgentNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-pink-500 text-white rounded">
        <Bot className="w-4 h-4" />
      </div>
      <span className="font-medium">AI Agent</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>Type: {data.config?.type || "decision-making"}</div>
      <div>Model: {data.config?.model || "gpt-3.5-turbo"}</div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

export const CustomNodes = {
  erc20Token: ERC20TokenNode,
  governance: GovernanceNode,
  dashboard: DashboardNode,
  apiEndpoint: APIEndpointNode,
  aiAgent: AIAgentNode,
}
