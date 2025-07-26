"use client"

import type React from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Coins, Vote, Layout, Server, Bot, Repeat, Link, Clock, Database, Wallet } from "lucide-react"

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

// New DeFi/Swap Nodes
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
  erc20Token: ERC20TokenNode,
  governance: GovernanceNode,
  dashboard: DashboardNode,
  apiEndpoint: APIEndpointNode,
  aiAgent: AIAgentNode,
  // New DeFi/Swap nodes
  uniswapV3Router: UniswapV3RouterNode,
  chainlinkOracle: ChainlinkOracleNode,
  swapInterface: SwapInterfaceNode,
  walletConnector: WalletConnectorNode,
  transactionHistory: TransactionHistoryNode,
  swapAPI: SwapAPINode,
  tokenDataService: TokenDataServiceNode,
}
