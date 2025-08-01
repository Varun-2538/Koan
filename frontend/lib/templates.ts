import type { Node, Edge } from "@xyflow/react"

export interface FlowTemplate {
  id: string
  name: string
  description: string
  category: "defi" | "dao" | "nft" | "ai" | "infrastructure"
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedTime: string
  features: string[]
  nodes: Node[]
  edges: Edge[]
  requiredInputs?: {
    key: string
    label: string
    description: string
    type: "string" | "number" | "boolean" | "select"
    options?: string[]
    required: boolean
    defaultValue?: any
  }[]
}

// Unite DeFi Hackathon Templates - Optimized for 1inch Integration
export const FLOW_TEMPLATES: FlowTemplate[] = [
  {
    id: "dex-aggregator-swap",
    name: "1inch-Powered DeFi Suite",
    description: "Complete DeFi application suite using multiple 1inch APIs - Swap, Fusion, Limit Orders, Portfolio tracking, and advanced analytics. Perfect for Unite DeFi hackathon!",
    category: "defi",
    difficulty: "intermediate",
    estimatedTime: "45 minutes",
    features: [
      "🔥 1inch Classic Swap API integration",
      "⚡ 1inch Fusion gasless swaps",
      "🌉 1inch Fusion+ cross-chain swaps",
      "📊 1inch Limit Order Protocol",
      "💰 1inch Portfolio & Balance APIs",
      "📈 1inch Spot Price & History APIs",
      "🛡️ MEV protection with Fusion mode",
      "📱 Professional trading interface",
      "🔍 Real-time transaction monitoring",
      "💎 Advanced DeFi analytics"
    ],
    nodes: [
      {
        id: "wallet-connector-1",
        type: "walletConnector",
        position: { x: 100, y: 100 },
        data: {
          label: "Wallet Connection",
          config: {
            supportedWallets: ["MetaMask", "WalletConnect", "Coinbase Wallet"],
            autoConnect: true,
            networkChainId: "1"
          }
        }
      },
      {
        id: "token-selector-1",
        type: "tokenSelector",
        position: { x: 100, y: 280 },
        data: {
          label: "Token Selector",
          config: {
            defaultFromToken: "ETH",
            defaultToToken: "USDC",
            enabledTokens: ["ETH", "USDC", "WBTC", "USDT", "DAI", "1INCH"],
            includeMetadata: true,
            priceSource: "1inch"
          }
        }
      },
      {
        id: "oneinch-quote-1",
        type: "oneInchQuote",
        position: { x: 400, y: 280 },
        data: {
          label: "1inch Quote Engine",
          config: {
            apiKey: "",
            slippage: 1,
            includeGas: true,
            includeProtocols: true,
            enablePathfinder: true,
            gasOptimization: "balanced"
          }
        }
      },
      {
        id: "fusion-swap-1",
        type: "fusionSwap",
        position: { x: 700, y: 450 },
        data: {
          label: "1inch Fusion (Gasless)",
          config: {
            apiKey: "",
            enableGaslessSwaps: true,
            auctionDuration: "auto",
            enableMEVProtection: true
          }
        }
      },
      {
        id: "limit-order-1",
        type: "limitOrder",
        position: { x: 1000, y: 450 },
        data: {
          label: "1inch Limit Orders",
          config: {
            apiKey: "",
            orderType: "limit",
            enableAdvancedStrategies: true
          }
        }
      },
      {
        id: "portfolio-tracker-1",
        type: "portfolioAPI",
        position: { x: 1300, y: 100 },
        data: {
          label: "1inch Portfolio API",
          config: {
            apiKey: "",
            trackHistory: true,
            enableAnalytics: true
          }
        }
      },
      {
        id: "price-impact-1",
        type: "priceImpactCalculator",
        position: { x: 700, y: 280 },
        data: {
          label: "Price Impact Analysis",
          config: {
            warningThreshold: 3,
            maxImpactThreshold: 15,
            includeSlippage: true,
            detailedAnalysis: true
          }
        }
      },
      {
        id: "oneinch-swap-1",
        type: "oneInchSwap",
        position: { x: 1000, y: 280 },
        data: {
          label: "1inch Swap Executor",
          config: {
            apiKey: "",
            enableMEVProtection: true,
            useFusion: false,
            gasOptimization: "balanced"
          }
        }
      },
      {
        id: "transaction-monitor-1",
        type: "transactionMonitor",
        position: { x: 1300, y: 280 },
        data: {
          label: "Transaction Monitor",
          config: {
            confirmationsRequired: 1,
            timeoutMinutes: 30,
            enableAlerts: true,
            includeGasTracking: true,
            enableMEVDetection: true
          }
        }
      },
      {
        id: "defi-dashboard-1",
        type: "defiDashboard",
        position: { x: 700, y: 100 },
        data: {
          label: "1inch DeFi Dashboard",
          config: {
            title: "1inch-Powered DeFi Suite",
            enableMultiSwap: true,
            showPortfolio: true,
            enableLimitOrders: true,
            showAnalytics: true,
            theme: "1inch-branded"
          }
        }
      }
    ],
    edges: [
      // Main swap flow
      { id: "e1", source: "wallet-connector-1", target: "token-selector-1" },
      { id: "e2", source: "token-selector-1", target: "oneinch-quote-1" },
      { id: "e3", source: "oneinch-quote-1", target: "price-impact-1" },
      { id: "e4", source: "price-impact-1", target: "oneinch-swap-1" },
      { id: "e5", source: "oneinch-swap-1", target: "transaction-monitor-1" },
      
      // Alternative swap methods
      { id: "e6", source: "token-selector-1", target: "fusion-swap-1" },
      { id: "e7", source: "token-selector-1", target: "limit-order-1" },
      { id: "e8", source: "fusion-swap-1", target: "transaction-monitor-1" },
      { id: "e9", source: "limit-order-1", target: "transaction-monitor-1" },
      
      // Dashboard connections
      { id: "e10", source: "wallet-connector-1", target: "defi-dashboard-1" },
      { id: "e11", source: "wallet-connector-1", target: "portfolio-tracker-1" },
      { id: "e12", source: "portfolio-tracker-1", target: "defi-dashboard-1" },
      { id: "e13", source: "transaction-monitor-1", target: "defi-dashboard-1" },
      { id: "e14", source: "price-impact-1", target: "defi-dashboard-1" }
    ],
    requiredInputs: [
      {
        key: "appName",
        label: "DeFi Suite Name",
        description: "Name for your 1inch-powered DeFi application",
        type: "string",
        required: false,
        defaultValue: "My 1inch DeFi Suite"
      },
      {
        key: "hackathonMode",
        label: "Unite DeFi Hackathon Mode",
        description: "Enable hackathon-specific features and 1inch API showcase",
        type: "boolean",
        required: false,
        defaultValue: true
      }
    ]
  },
  {
    id: "oneinch-swap-dashboard",
    name: "1inch Swap Dashboard",
    description: "Complete DEX aggregator dashboard using 1inch Pathfinder algorithm with MEV protection and optimal routing across multiple chains",
    category: "defi",
    difficulty: "intermediate",
    estimatedTime: "45 minutes",
    features: [
      "1inch Pathfinder routing algorithm",
      "MEV protection with Fusion mode",
      "Multi-chain support (12+ chains)",
      "Real-time quotes with sub-400ms response",
      "Gas optimization settings",
      "Professional trading interface"
    ],
    nodes: [
      {
        id: "wallet-connector-1",
        type: "walletConnector",
        position: { x: 100, y: 100 },
        data: {
          label: "Wallet Connector",
          config: {
            supportedWallets: ["MetaMask", "WalletConnect", "Coinbase Wallet"],
            autoConnect: true,
            networkChainId: "1"
          }
        }
      },
      {
        id: "token-input-1",
        type: "tokenInput",
        position: { x: 100, y: 250 },
        data: {
          label: "Token Input",
          config: {
            fromToken: "ETH",
            toToken: "USDC",
            amount: "1.0",
            supportedTokens: ["ETH", "USDC", "USDT", "DAI", "WBTC", "1INCH"]
          }
        }
      },
      {
        id: "chain-selector-1",
        type: "chainSelector",
        position: { x: 400, y: 100 },
        data: {
          label: "Chain Selector",
          config: {
            selectedChain: "ethereum",
            supportedChains: ["ethereum", "polygon", "bnb", "arbitrum", "optimism", "solana"]
          }
        }
      },
      {
        id: "oneinch-quote-1",
        type: "oneInchQuote",
        position: { x: 400, y: 250 },
        data: {
          label: "1inch Quote Engine",
          config: {
            apiKey: "",
            slippage: 1,
            includeGas: true,
            includeProtocols: true,
            enablePathfinder: true
          }
        }
      },
      {
        id: "oneinch-swap-1",
        type: "oneInchSwap",
        position: { x: 700, y: 250 },
        data: {
          label: "1inch Swap Executor",
          config: {
            apiKey: "",
            enableMEVProtection: true,
            useFusion: false,
            gasOptimization: "balanced"
          }
        }
      },
      {
        id: "swap-interface-1",
        type: "swapInterface",
        position: { x: 700, y: 100 },
        data: {
          label: "Swap Interface",
          config: {
            title: "1inch Swap Dashboard",
            showAdvancedSettings: true,
            theme: "modern",
            enablePriceChart: true
          }
        }
      }
    ],
    edges: [
      { id: "e1", source: "wallet-connector-1", target: "token-input-1" },
      { id: "e2", source: "wallet-connector-1", target: "chain-selector-1" },
      { id: "e3", source: "token-input-1", target: "oneinch-quote-1" },
      { id: "e4", source: "chain-selector-1", target: "oneinch-quote-1" },
      { id: "e5", source: "oneinch-quote-1", target: "oneinch-swap-1" },
      { id: "e6", source: "oneinch-swap-1", target: "swap-interface-1" }
    ],
    requiredInputs: [
      {
        key: "oneInchApiKey",
        label: "1inch API Key",
        description: "Your 1inch API key for accessing the aggregation protocol",
        type: "string",
        required: true
      },
      {
        key: "supportedChains",
        label: "Supported Chains",
        description: "Which chains to support for swapping",
        type: "select",
        options: ["Ethereum Only", "Multi-Chain (ETH+Polygon+BSC)", "All Supported Chains"],
        required: true,
        defaultValue: "Multi-Chain (ETH+Polygon+BSC)"
      },
      {
        key: "enableFusion",
        label: "Enable Fusion Mode",
        description: "Enable 1inch Fusion for MEV protection",
        type: "boolean",
        required: false,
        defaultValue: true
      }
    ]
  },
  {
    id: "crosschain-fusion-bridge",
    name: "Cross-Chain Bridge with Fusion+",
    description: "Secure cross-chain token transfers using 1inch Fusion+ with MEV protection and zero gas fees on supported chains",
    category: "defi",
    difficulty: "advanced",
    estimatedTime: "60 minutes",
    features: [
      "1inch Fusion+ cross-chain swaps",
      "Zero gas fees on supported chains",
      "MEV protection across chains",
      "Support for 12+ blockchains",
      "Real-time bridge status tracking",
      "Optimal liquidity routing"
    ],
    nodes: [
      {
        id: "source-chain-1",
        type: "sourceChain",
        position: { x: 100, y: 250 },
        data: {
          label: "Source Chain",
          config: {
            chain: "ethereum",
            supportedChains: ["ethereum", "polygon", "bnb", "arbitrum", "optimism"]
          }
        }
      },
      {
        id: "destination-chain-1",
        type: "destinationChain",
        position: { x: 100, y: 400 },
        data: {
          label: "Destination Chain",
          config: {
            chain: "solana",
            supportedChains: ["ethereum", "polygon", "bnb", "arbitrum", "optimism", "solana"]
          }
        }
      },
      {
        id: "fusion-plus-1",
        type: "fusionPlus",
        position: { x: 700, y: 250 },
        data: {
          label: "1inch Fusion+",
          config: {
            apiKey: "",
            enableMEVProtection: true,
            enableGaslessSwap: true,
            crossChainRouting: "optimal"
          }
        }
      }
    ],
    edges: [
      { id: "e1", source: "source-chain-1", target: "fusion-plus-1" },
      { id: "e2", source: "destination-chain-1", target: "fusion-plus-1" }
    ],
    requiredInputs: [
      {
        key: "oneInchApiKey",
        label: "1inch API Key",
        description: "Your 1inch API key for Fusion+ access",
        type: "string",
        required: true
      },
      {
        key: "supportedChains",
        label: "Bridge Chains",
        description: "Which chains to support for bridging",
        type: "select",
        options: ["ETH-Polygon", "ETH-BSC", "ETH-Solana", "All Chains"],
        required: true,
        defaultValue: "ETH-Polygon"
      }
    ]
  },
  {
    id: "limit-order-dashboard",
    name: "Advanced Limit Order Dashboard",
    description: "Professional trading interface with limit orders, stop-loss, and P2P swaps using 1inch Limit Order Protocol",
    category: "defi",
    difficulty: "advanced",
    estimatedTime: "75 minutes",
    features: [
      "1inch Limit Order Protocol integration",
      "Multiple order types (limit, stop-loss, P2P)",
      "Professional order book interface",
      "Real-time order status tracking",
      "Advanced trading parameters",
      "Order history and analytics"
    ],
    nodes: [
      {
        id: "limit-order-protocol-1",
        type: "limitOrderProtocol",
        position: { x: 700, y: 250 },
        data: {
          label: "1inch Limit Order",
          config: {
            apiKey: "",
            protocolVersion: "v3",
            enableRFQ: true,
            gasOptimization: true
          }
        }
      }
    ],
    edges: [],
    requiredInputs: [
      {
        key: "oneInchApiKey",
        label: "1inch API Key",
        description: "Your 1inch API key for Limit Order Protocol",
        type: "string",
        required: true
      },
      {
        key: "orderTypes",
        label: "Supported Order Types",
        description: "Which order types to enable",
        type: "select",
        options: ["Limit Orders Only", "Limit + Stop Loss", "All Order Types"],
        required: true,
        defaultValue: "All Order Types"
      }
    ]
  },
  {
    id: "yield-farming-aggregator",
    name: "Multi-Protocol Yield Aggregator",
    description: "Comprehensive yield farming dashboard aggregating opportunities across Aave, Compound, Curve with 1inch for optimal token swaps",
    category: "defi",
    difficulty: "advanced",
    estimatedTime: "90 minutes",
    features: [
      "Multi-protocol yield aggregation",
      "1inch integration for token swaps",
      "Real-time APY tracking",
      "Automated yield optimization",
      "Portfolio tracking and analytics",
      "Risk assessment metrics"
    ],
    nodes: [
      {
        id: "yield-optimizer-1",
        type: "yieldOptimizer",
        position: { x: 700, y: 250 },
        data: {
          label: "Yield Optimizer",
          config: {
            optimizationStrategy: "highest-apy",
            riskTolerance: "medium",
            autoCompound: true,
            rebalanceThreshold: 0.5
          }
        }
      }
    ],
    edges: [],
    requiredInputs: [
      {
        key: "protocols",
        label: "Supported Protocols",
        description: "Which DeFi protocols to aggregate",
        type: "select",
        options: ["Aave + Compound", "Aave + Compound + Curve", "All Protocols"],
        required: true,
        defaultValue: "Aave + Compound + Curve"
      }
    ]
  },
  {
    id: "dao-governance-treasury",
    name: "DAO Governance & Treasury Management",
    description: "Complete DAO governance system with proposal creation, voting mechanisms, and treasury management using 1inch for asset swaps",
    category: "dao",
    difficulty: "advanced",
    estimatedTime: "120 minutes",
    features: [
      "Token-based governance system",
      "Proposal creation and voting",
      "Treasury management with 1inch",
      "Delegation and voting power",
      "Multi-signature treasury",
      "Governance analytics dashboard"
    ],
    nodes: [
      {
        id: "governance-results-1",
        type: "governanceResults",
        position: { x: 1000, y: 250 },
        data: {
          label: "Results & Execution",
          config: {
            showVotingResults: true,
            enableAutoExecution: true,
            trackProposalStatus: true,
            notifyOnExecution: true
          }
        }
      }
    ],
    edges: [],
    requiredInputs: [
      {
        key: "governanceToken",
        label: "Governance Token",
        description: "Token used for voting (e.g., 1INCH, UNI)",
        type: "string",
        required: true,
        defaultValue: "1INCH"
      },
      {
        key: "votingPeriod",
        label: "Voting Period",
        description: "How long proposals remain open for voting",
        type: "select",
        options: ["3 days", "7 days", "14 days"],
        required: true,
        defaultValue: "7 days"
      }
    ]
  }
]

export const getTemplateById = (id: string): FlowTemplate | undefined => {
  return FLOW_TEMPLATES.find(template => template.id === id)
}

export const getTemplatesByCategory = (category: FlowTemplate["category"]): FlowTemplate[] => {
  return FLOW_TEMPLATES.filter(template => template.category === category)
} 