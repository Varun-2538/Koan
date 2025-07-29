"use client"

import type React from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Coins, Vote, Layout, Server, Bot, Repeat, Link, Clock, Database, Wallet } from "lucide-react"
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

// Transaction Status Node
export const TransactionStatusNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-green-500 text-white rounded">
        <Clock className="w-4 h-4" />
      </div>
      <span className="font-medium">Transaction Status</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>Track: {data.config?.trackGasUsed ? "Gas + Status" : "Status Only"}</div>
      <div>Notify: {data.config?.enableNotifications ? "Yes" : "No"}</div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

// Bridge-specific Nodes
export const SourceChainNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-purple-500 text-white rounded">
        <Link className="w-4 h-4" />
      </div>
      <span className="font-medium">Source Chain</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>Chain: {data.config?.chain || "ethereum"}</div>
      <div className="flex flex-wrap gap-1">
        <Badge variant="secondary" className="text-xs">
          {data.config?.chain || "ETH"}
        </Badge>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

export const DestinationChainNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-indigo-500 text-white rounded">
        <Link className="w-4 h-4" />
      </div>
      <span className="font-medium">Destination Chain</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>Chain: {data.config?.chain || "polygon"}</div>
      <div className="flex flex-wrap gap-1">
        <Badge variant="secondary" className="text-xs">
          {data.config?.chain || "MATIC"}
        </Badge>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

// Limit Order Nodes
export const OrderTypeNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-yellow-500 text-white rounded">
        <Vote className="w-4 h-4" />
      </div>
      <span className="font-medium">Order Type</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>Type: {data.config?.orderType || "limit"}</div>
      <div>Multiple: {data.config?.allowMultipleOrders ? "Yes" : "No"}</div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

export const PriceTriggerNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-red-500 text-white rounded">
        <Clock className="w-4 h-4" />
      </div>
      <span className="font-medium">Price Trigger</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>Price: ${data.config?.triggerPrice || "3000"}</div>
      <div>Type: {data.config?.triggerType || "above"}</div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

// Yield Farming Nodes
export const YieldOptimizerNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-emerald-500 text-white rounded">
        <Database className="w-4 h-4" />
      </div>
      <span className="font-medium">Yield Optimizer</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>Strategy: {data.config?.optimizationStrategy || "highest-apy"}</div>
      <div>Risk: {data.config?.riskTolerance || "medium"}</div>
      <div>Auto Compound: {data.config?.autoCompound ? "Yes" : "No"}</div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

export const PortfolioTrackerNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-teal-500 text-white rounded">
        <Layout className="w-4 h-4" />
      </div>
      <span className="font-medium">Portfolio Tracker</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>Staked Assets: {data.config?.trackStakedAssets ? "Yes" : "No"}</div>
      <div>P&L Tracking: {data.config?.enablePnLTracking ? "Yes" : "No"}</div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

// DAO Governance Nodes
export const GovernanceResultsNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-purple-600 text-white rounded">
        <Vote className="w-4 h-4" />
      </div>
      <span className="font-medium">Governance Results</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>Auto Execute: {data.config?.enableAutoExecution ? "Yes" : "No"}</div>
      <div>Track Status: {data.config?.trackProposalStatus ? "Yes" : "No"}</div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
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

// Legacy nodes for backward compatibility
export const UniswapV3RouterNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-pink-500 text-white rounded">
        <Repeat className="w-4 h-4" />
      </div>
      <span className="font-medium">Uniswap V3 Router</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>Network: {data.config?.network || "ethereum"}</div>
      <div>Slippage: {data.config?.slippageTolerance || "0.5"}%</div>
      <div>Deadline: {data.config?.deadline || "20"}m</div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

export const ChainlinkOracleNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-blue-600 text-white rounded">
        <Link className="w-4 h-4" />
      </div>
      <span className="font-medium">Chainlink Oracle</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>Update: {data.config?.updateInterval || "30"}s</div>
      <div className="flex flex-wrap gap-1">
        {Object.keys(data.config?.priceFeedAddresses || {}).slice(0, 2).map((pair: string) => (
          <Badge key={pair} variant="secondary" className="text-xs">
            {pair}
          </Badge>
        ))}
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

export const SwapInterfaceNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-purple-500 text-white rounded">
        <Layout className="w-4 h-4" />
      </div>
      <span className="font-medium">Swap Interface</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>Title: {data.config?.title || "Token Swap"}</div>
      <div>Theme: {data.config?.theme || "modern"}</div>
      <div className="flex flex-wrap gap-1">
        {(data.config?.defaultTokens || ["ETH", "USDC"]).slice(0, 3).map((token: string) => (
          <Badge key={token} variant="secondary" className="text-xs">
            {token}
          </Badge>
        ))}
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

export const WalletConnectorNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-yellow-500 text-white rounded">
        <Wallet className="w-4 h-4" />
      </div>
      <span className="font-medium">Wallet Connector</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>Chain: {data.config?.networkChainId || "1"}</div>
      <div>Auto: {data.config?.autoConnect ? "Yes" : "No"}</div>
      <div className="flex flex-wrap gap-1">
        {(data.config?.supportedWallets || ["MetaMask"]).slice(0, 2).map((wallet: string) => (
          <Badge key={wallet} variant="secondary" className="text-xs">
            {wallet}
          </Badge>
        ))}
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

export const TransactionHistoryNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-indigo-500 text-white rounded">
        <Clock className="w-4 h-4" />
      </div>
      <span className="font-medium">Transaction History</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>Max: {data.config?.maxTransactions || "50"} txs</div>
      <div>Pending: {data.config?.showPendingTx ? "Yes" : "No"}</div>
      <div>Filter: {data.config?.enableFiltering ? "Yes" : "No"}</div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

export const SwapAPINode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-emerald-500 text-white rounded">
        <Server className="w-4 h-4" />
      </div>
      <span className="font-medium">Swap API</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>Endpoints: {(data.config?.endpoints || []).length}</div>
      <div>Rate Limit: {data.config?.rateLimit || "100"}/min</div>
      <div>Auth: {data.config?.authentication ? "Yes" : "No"}</div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

export const TokenDataServiceNode = ({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-teal-500 text-white rounded">
        <Database className="w-4 h-4" />
      </div>
      <span className="font-medium">Token Data Service</span>
    </div>
    <div className="text-xs text-gray-600 space-y-1">
      <div>Cache: {data.config?.cacheDuration || "300"}s</div>
      <div className="flex flex-wrap gap-1">
        {(data.config?.dataProviders || ["CoinGecko"]).slice(0, 2).map((provider: string) => (
          <Badge key={provider} variant="secondary" className="text-xs">
            {provider}
          </Badge>
        ))}
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </NodeWrapper>
)

export const CustomNodes = {
  // New 1inch and DeFi executable nodes
  oneInchSwap: OneInchSwapNode,
  oneInchQuote: OneInchQuoteNode,
  fusionPlus: FusionPlusNode,
  chainSelector: ChainSelectorNode,
  
  // DeFi UI nodes
  tokenInput: TokenInputNode,
  slippageControl: SlippageControlNode,
  transactionStatus: TransactionStatusNode,
  
  // Bridge nodes
  sourceChain: SourceChainNode,
  destinationChain: DestinationChainNode,
  
  // Trading nodes
  orderType: OrderTypeNode,
  priceTrigger: PriceTriggerNode,
  
  // Yield farming nodes
  yieldOptimizer: YieldOptimizerNode,
  portfolioTracker: PortfolioTrackerNode,
  
  // Governance nodes
  governanceResults: GovernanceResultsNode,
  
  // Existing nodes
  erc20Token: ERC20TokenNode,
  governance: GovernanceNode,
  dashboard: DashboardNode,
  apiEndpoint: APIEndpointNode,
  aiAgent: AIAgentNode,
  
  // Legacy DeFi nodes
  uniswapV3Router: UniswapV3RouterNode,
  chainlinkOracle: ChainlinkOracleNode,
  swapInterface: SwapInterfaceNode,
  walletConnector: WalletConnectorNode,
  transactionHistory: TransactionHistoryNode,
  swapAPI: SwapAPINode,
  tokenDataService: TokenDataServiceNode,
}
