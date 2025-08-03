"use client"

import type React from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Coins, Vote, Layout, Server, Bot, Repeat, Link, Clock, Database, Wallet, TrendingUp, Activity, Search, Zap } from "lucide-react"
import { ExecutableNode } from "./nodes/executable-node"
import { OneInchSwapComponent, OneInchQuoteComponent } from "@/lib/components/defi/oneinch-swap"
import { FusionPlusComponent, ChainSelectorComponent } from "@/lib/components/defi/fusion-plus"

const NodeWrapper = ({ children, selected }: { children: React.ReactNode; selected?: boolean }) => (
  <Card className={`min-w-[200px] ${selected ? "ring-2 ring-blue-500" : ""}`}>
    <CardContent className="p-3">{children}</CardContent>
  </Card>
)

// New DeFi Executable Nodes for Unite Hackathon
export const OneInchSwapNode = (props: NodeProps) => {
  const component = new OneInchSwapComponent()
  return <ExecutableNode {...props} component={component} />
}

export const OneInchQuoteNode = (props: NodeProps) => {
  const component = new OneInchQuoteComponent()
  return <ExecutableNode {...props} component={component} />
}

export const FusionPlusNode = (props: NodeProps) => {
  const component = new FusionPlusComponent()
  return <ExecutableNode {...props} component={component} />
}

export const ChainSelectorNode = (props: NodeProps) => {
  const component = new ChainSelectorComponent()
  return <ExecutableNode {...props} component={component} />
}

// Token Input Node - Specialized for DeFi token selection
export const TokenInputNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-blue-500 text-white rounded">
        <Coins className="w-4 h-4" />
      </div>
      <span className="font-medium">Token Input</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>From: {data.config?.fromToken || "ETH"}</div>
      <div>To: {data.config?.toToken || "USDC"}</div>
      <div>Amount: {data.config?.amount || "1.0"}</div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

// Slippage Control Node
export const SlippageControlNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-orange-500 text-white rounded">
        <Clock className="w-4 h-4" />
      </div>
      <span className="font-medium">Slippage Control</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>Slippage: {data.config?.slippage || "1.0"}%</div>
      <div>Auto: {data.config?.autoSlippage ? "Yes" : "No"}</div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

// Wallet Connector Node
export const WalletConnectorNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-purple-500 text-white rounded">
        <Wallet className="w-4 h-4" />
      </div>
      <span className="font-medium">Wallet Connector</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>Wallets: {data.config?.supportedWallets?.join(", ") || "MetaMask, WalletConnect"}</div>
      <div>Auto Connect: {data.config?.autoConnect ? "Yes" : "No"}</div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

export const SwapInterfaceNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-green-500 text-white rounded">
        <Repeat className="w-4 h-4" />
      </div>
      <span className="font-medium">Swap Interface</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>Title: {data.config?.title || "DEX Aggregator Swap"}</div>
      <div>Theme: {data.config?.theme || "modern"}</div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

export const DashboardNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-indigo-500 text-white rounded">
        <Layout className="w-4 h-4" />
      </div>
      <span className="font-medium">Dashboard</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>Components: {data.config?.components?.join(", ") || "header, charts, tables"}</div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

export const ERC20TokenNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-yellow-500 text-white rounded">
        <Coins className="w-4 h-4" />
      </div>
      <span className="font-medium">ERC20 Token</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>Name: {data.config?.name || "MyToken"}</div>
      <div>Symbol: {data.config?.symbol || "MTK"}</div>
      <div>Supply: {data.config?.totalSupply || "1000000"}</div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

// Additional nodes for completeness
export const FusionSwapNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-red-500 text-white rounded">
        <Zap className="w-4 h-4" />
      </div>
      <span className="font-medium">Fusion Swap</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>Gasless: {data.config?.enableGaslessSwaps ? "Yes" : "No"}</div>
      <div>MEV Protection: {data.config?.enableMEVProtection ? "Yes" : "No"}</div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

export const LimitOrderNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-orange-500 text-white rounded">
        <Clock className="w-4 h-4" />
      </div>
      <span className="font-medium">Limit Order</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>Type: {data.config?.orderType || "limit"}</div>
      <div>Advanced: {data.config?.enableAdvancedStrategies ? "Yes" : "No"}</div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

export const PortfolioAPINode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-blue-500 text-white rounded">
        <TrendingUp className="w-4 h-4" />
      </div>
      <span className="font-medium">Portfolio API</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>History: {data.config?.trackHistory ? "Yes" : "No"}</div>
      <div>Analytics: {data.config?.enableAnalytics ? "Yes" : "No"}</div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

export const DefiDashboardNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-purple-500 text-white rounded">
        <Layout className="w-4 h-4" />
      </div>
      <span className="font-medium">DeFi Dashboard</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>Title: {data.config?.title || "1inch-Powered DeFi Suite"}</div>
      <div>Portfolio: {data.config?.showPortfolio ? "Yes" : "No"}</div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

export const TransactionHistoryNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-gray-500 text-white rounded">
        <Activity className="w-4 h-4" />
      </div>
      <span className="font-medium">Transaction History</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>Max: {data.config?.maxTransactions || "50"}</div>
      <div>Pending: {data.config?.showPendingTx ? "Yes" : "No"}</div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

export const SwapAPINode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-green-500 text-white rounded">
        <Server className="w-4 h-4" />
      </div>
      <span className="font-medium">Swap API</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>Endpoints: {data.config?.endpoints?.length || "4"}</div>
      <div>Rate Limit: {data.config?.rateLimit || "100"}/min</div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

export const TokenDataServiceNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-yellow-500 text-white rounded">
        <Database className="w-4 h-4" />
      </div>
      <span className="font-medium">Token Data Service</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>Providers: {data.config?.dataProviders?.join(", ") || "CoinGecko"}</div>
      <div>Cache: {data.config?.cacheDuration || "300"}s</div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

// Add specialized node for Multi-Chain Token Selector
export const MultiChainTokenSelectorNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-purple-500 text-white rounded">
        <Coins className="w-4 h-4" />
      </div>
      <span className="font-medium">Multi-Chain Token Selector</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>From: {data.config?.fromToken || "ETH"}</div>
      <div>To: {data.config?.toToken || "USDC"}</div>
      <div>Chains: {data.config?.supportedChains?.length || 0}</div>
      <div>Amount: {data.config?.amount || "1.0"}</div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

// Add specialized node for Price Impact Analysis
export const PriceImpactAnalysisNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-red-500 text-white rounded">
        <TrendingUp className="w-4 h-4" />
      </div>
      <span className="font-medium">Price Impact Analysis</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>Slippage: {data.config?.slippage || "1.0"}%</div>
      <div>Max Impact: {data.config?.maxImpactThreshold || "5.0"}%</div>
      <div>Auto: {data.config?.autoSlippage ? "Yes" : "No"}</div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

// Add specialized node for Transaction Monitor  
export const TransactionMonitorNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-green-500 text-white rounded">
        <Activity className="w-4 h-4" />
      </div>
      <span className="font-medium">Transaction Monitor</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>Max Tx: {data.config?.maxTransactions || "50"}</div>
      <div>Pending: {data.config?.showPendingTx ? "Yes" : "No"}</div>
      <div>Real-time: {data.config?.realTimeUpdates ? "Yes" : "No"}</div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

// Export all node types in a single object - THIS IS CRITICAL
export const CustomNodes = {
  // Executable DeFi nodes (using ExecutableNode wrapper)
  oneInchSwap: OneInchSwapNode,
  oneInchQuote: OneInchQuoteNode,
  fusionPlus: FusionPlusNode,
  chainSelector: ChainSelectorNode,
  
  // Backend node types that need frontend representations
  tokenSelector: MultiChainTokenSelectorNode, // Use specialized component
  priceImpactCalculator: PriceImpactAnalysisNode, // Use specialized component
  transactionMonitor: TransactionMonitorNode, // Use specialized component
  
  // UI/Interface nodes (static display nodes)
  tokenInput: TokenInputNode,
  slippageControl: SlippageControlNode,
  walletConnector: WalletConnectorNode,
  swapInterface: SwapInterfaceNode,
  
  // Infrastructure nodes
  dashboard: DashboardNode,
  erc20Token: ERC20TokenNode,
  defiDashboard: DefiDashboardNode,
  
  // Additional nodes referenced in getDefaultConfig
  fusionSwap: FusionSwapNode,
  limitOrder: LimitOrderNode,
  portfolioAPI: PortfolioAPINode,
  transactionHistory: TransactionHistoryNode,
  swapAPI: SwapAPINode,
  tokenDataService: TokenDataServiceNode,
}