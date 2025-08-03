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
    type: "string" | "number" | "boolean" | "select" | "multiselect" | "json"
    options?: Array<{ value: string; label: string }>
    required: boolean
    defaultValue?: any
    livePreviewOnly?: boolean
  }[]
}

// Complete templates with pre-made flows
export const FLOW_TEMPLATES: FlowTemplate[] = [
  {
    id: "oneinch-powered-defi-suite",
    name: "1inch-Powered DeFi Suite",
    description: "Complete multi-chain DeFi application with 1inch integration, supporting swaps, limit orders, and portfolio tracking across 12+ blockchains",
    category: "defi",
    difficulty: "intermediate",
    estimatedTime: "45 minutes",
    features: [
      "🔥 Multi-chain 1inch Classic Swap API integration",
      "⚡ Multi-chain 1inch Fusion gasless swaps", 
      "🌉 Cross-chain swaps with 1inch Fusion+",
      "📊 Multi-chain 1inch Limit Order Protocol",
      "💰 Multi-chain 1inch Portfolio & Balance APIs",
      "📈 Real-time price feeds across 12+ chains",
      "🛡️ MEV protection with Fusion mode",
      "📱 Professional multi-chain trading interface",
      "🔍 Real-time transaction monitoring",
      "💎 Advanced multi-chain DeFi analytics",
      "🌐 Support for Ethereum, Polygon, BSC, Arbitrum, Optimism, Avalanche"
    ],
    nodes: [
      {
        id: "wallet-connector-1",
        type: "walletConnector",
        position: { x: 100, y: 100 },
        data: {
          label: "Multi-Chain Wallet Connection",
          config: {
            supportedWallets: ["MetaMask", "WalletConnect", "Coinbase Wallet"],
            autoConnect: true,
            supportedChains: ["1", "137", "56", "42161", "10", "43114"],
            defaultChain: "1"
          }
        }
      },
      {
        id: "token-selector-1", 
        type: "tokenInput",
        position: { x: 100, y: 280 },
        data: {
          label: "Multi-Chain Token Selector",
          config: {
            fromToken: "ETH",
            toToken: "USDC",
            amount: "1.0",
            supportedChains: ["1", "137", "56", "42161", "10", "43114"],
            showPriceData: true,
            enable1inchTokenList: true
          }
        }
      },
      {
        id: "oneinch-quote-1",
        type: "oneInchQuote", 
        position: { x: 400, y: 100 },
        data: {
          label: "1inch Quote Engine",
          config: {
            apiKey: "",
            supportedChains: ["1", "137", "56", "42161", "10", "43114"],
            quoteRefreshInterval: 10,
            showPriceChart: true,
            showGasEstimate: true,
            enablePathfinder: true
          }
        }
      },
      {
        id: "price-impact-1",
        type: "slippageControl",
        position: { x: 400, y: 280 },
        data: {
          label: "Price Impact Analysis",
          config: {
            slippage: 1.0,
            autoSlippage: true,
            showPriceImpact: true,
            warnOnHighImpact: true,
            maxImpactThreshold: 5.0
          }
        }
      },
      {
        id: "oneinch-swap-1",
        type: "oneInchSwap",
        position: { x: 700, y: 100 },
        data: {
          label: "1inch Swap Executor",
          config: {
            apiKey: "",
            supportedChains: ["1", "137", "56", "42161", "10", "43114"],
            enableFusion: true,
            enableMEVProtection: true,
            defaultSlippage: 1
          }
        }
      },
      {
        id: "fusion-plus-1",
        type: "fusionPlus",
        position: { x: 700, y: 280 },
        data: {
          label: "Fusion+ Cross-Chain",
          config: {
            apiKey: "",
            supportedChains: ["1", "137", "56", "42161", "10", "43114"],
            enableMEVProtection: true,
            enableGasless: true,
            defaultTimeout: 30
          }
        }
      },
      {
        id: "limit-order-1",
        type: "limitOrder",
        position: { x: 1000, y: 100 },
        data: {
          label: "Limit Order Protocol",
          config: {
            apiKey: "",
            orderType: "limit",
            enableAdvancedStrategies: true,
            supportedChains: ["1", "137", "56", "42161", "10", "43114"]
          }
        }
      },
      {
        id: "portfolio-api-1",
        type: "portfolioAPI",
        position: { x: 1000, y: 280 },
        data: {
          label: "Portfolio & Balance API",
          config: {
            apiKey: "",
            trackHistory: true,
            enableAnalytics: true,
            supportedChains: ["1", "137", "56", "42161", "10", "43114"]
          }
        }
      },
      {
        id: "transaction-monitor-1",
        type: "transactionHistory",
        position: { x: 1300, y: 100 },
        data: {
          label: "Transaction Monitor",
          config: {
            maxTransactions: "50",
            showPendingTx: true,
            enableFiltering: true,
            realTimeUpdates: true
          }
        }
      },
      {
        id: "defi-dashboard-1",
        type: "defiDashboard",
        position: { x: 1300, y: 280 },
        data: {
          label: "DeFi Analytics Dashboard",
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
      { id: "e1-2", source: "wallet-connector-1", target: "token-selector-1", type: "default" },
      { id: "e2-3", source: "token-selector-1", target: "oneinch-quote-1", type: "default" },
      { id: "e3-4", source: "oneinch-quote-1", target: "price-impact-1", type: "default" },
      { id: "e4-5", source: "price-impact-1", target: "oneinch-swap-1", type: "default" },
      { id: "e3-6", source: "oneinch-quote-1", target: "fusion-plus-1", type: "default" },
      { id: "e5-7", source: "oneinch-swap-1", target: "limit-order-1", type: "default" },
      { id: "e5-8", source: "oneinch-swap-1", target: "portfolio-api-1", type: "default" },
      { id: "e7-9", source: "limit-order-1", target: "transaction-monitor-1", type: "default" },
      { id: "e8-10", source: "portfolio-api-1", target: "defi-dashboard-1", type: "default" },
      { id: "e9-10", source: "transaction-monitor-1", target: "defi-dashboard-1", type: "default" }
    ],
    requiredInputs: [
      {
        key: "oneInchApiKey",
        label: "1inch API Key",
        description: "Your 1inch API key for accessing all 1inch services",
        type: "string",
        required: true,
        defaultValue: ""
      },
      {
        key: "supportedChains",
        label: "Blockchain Networks",
        description: "Select which blockchains to support",
        type: "multiselect",
        options: [
          { value: "1", label: "Ethereum" },
          { value: "137", label: "Polygon" },
          { value: "56", label: "BNB Chain" },
          { value: "42161", label: "Arbitrum" },
          { value: "10", label: "Optimism" },
          { value: "43114", label: "Avalanche" }
        ],
        required: true,
        defaultValue: ["1", "137", "56"]
      }
    ]
  },
  {
    id: "dex-aggregator-swap",
    name: "Basic Swap Application",
    description: "Simple yet powerful DEX aggregator with 1inch integration, perfect for getting started with DeFi development",
    category: "defi",
    difficulty: "beginner", 
    estimatedTime: "20 minutes",
    features: [
      "🔄 1inch Swap API integration",
      "💰 Real-time token quotes",
      "🎯 Price impact protection",
      "📱 Mobile-responsive interface",
      "⚡ Fast execution",
      "🔐 Secure wallet connection"
    ],
    nodes: [
      {
        id: "wallet-connector-1",
        type: "walletConnector",
        position: { x: 100, y: 150 },
        data: {
          label: "Wallet Connection",
          config: {
            supportedWallets: ["MetaMask", "WalletConnect"],
            autoConnect: true,
            networkChainId: "1"
          }
        }
      },
      {
        id: "token-input-1",
        type: "tokenInput", 
        position: { x: 400, y: 150 },
        data: {
          label: "Token Selector",
          config: {
            fromToken: "ETH",
            toToken: "USDC",
            amount: "1.0",
            showTokenSearch: true
          }
        }
      },
      {
        id: "oneinch-quote-1",
        type: "oneInchQuote",
        position: { x: 700, y: 150 },
        data: {
          label: "1inch Quote",
          config: {
            apiKey: "",
            supportedChains: ["1"],
            quoteRefreshInterval: 10,
            showPriceChart: false,
            showGasEstimate: true
          }
        }
      },
      {
        id: "slippage-control-1",
        type: "slippageControl",
        position: { x: 700, y: 300 },
        data: {
          label: "Slippage Control",
          config: {
            slippage: 1.0,
            autoSlippage: false,
            minSlippage: 0.1,
            maxSlippage: 50
          }
        }
      },
      {
        id: "oneinch-swap-1",
        type: "oneInchSwap",
        position: { x: 1000, y: 150 },
        data: {
          label: "Execute Swap",
          config: {
            apiKey: "",
            supportedChains: ["1"],
            enableFusion: false,
            enableMEVProtection: true,
            defaultSlippage: 1
          }
        }
      },
      {
        id: "swap-interface-1", 
        type: "swapInterface",
        position: { x: 1300, y: 150 },
        data: {
          label: "Swap Interface",
          config: {
            title: "DEX Aggregator Swap",
            showAdvancedSettings: true,
            theme: "modern",
            enablePriceChart: true,
            showPriceImpact: true
          }
        }
      }
    ],
    edges: [
      { id: "e1-2", source: "wallet-connector-1", target: "token-input-1", type: "default" },
      { id: "e2-3", source: "token-input-1", target: "oneinch-quote-1", type: "default" },
      { id: "e3-4", source: "oneinch-quote-1", target: "slippage-control-1", type: "default" },
      { id: "e3-5", source: "oneinch-quote-1", target: "oneinch-swap-1", type: "default" },
      { id: "e4-5", source: "slippage-control-1", target: "oneinch-swap-1", type: "default" },
      { id: "e5-6", source: "oneinch-swap-1", target: "swap-interface-1", type: "default" }
    ],
    requiredInputs: [
      {
        key: "oneInchApiKey",
        label: "1inch API Key",
        description: "Your 1inch API key for swap functionality",
        type: "string",
        required: true,
        defaultValue: ""
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
      "🗳️ Token-based governance system",
      "📝 Proposal creation and voting",
      "💼 Treasury management with 1inch",
      "👥 Delegation and voting power",
      "🔐 Multi-signature treasury",
      "📊 Governance analytics dashboard"
    ],
    nodes: [
      {
        id: "wallet-connector-1",
        type: "walletConnector",
        position: { x: 100, y: 100 },
        data: {
          label: "DAO Member Connection",
          config: {
            supportedWallets: ["MetaMask", "WalletConnect", "Gnosis Safe"],
            autoConnect: true,
            supportedChains: ["1", "137"]
          }
        }
      },
      {
        id: "token-selector-1",
        type: "tokenInput",
        position: { x: 100, y: 280 },
        data: {
          label: "Governance Token",
          config: {
            fromToken: "1INCH",
            toToken: "USDC", 
            amount: "1000",
            showTokenSearch: true,
            governanceMode: true
          }
        }
      },
      {
        id: "chain-selector-1",
        type: "chainSelector",
        position: { x: 400, y: 100 },
        data: {
          label: "Multi-Chain DAO",
          config: {
            supportedChains: ["1", "137", "42161"],
            defaultChain: "1",
            enableTestnet: false
          }
        }
      },
      {
        id: "oneinch-swap-1",
        type: "oneInchSwap",
        position: { x: 700, y: 100 },
        data: {
          label: "Treasury Swap Manager",
          config: {
            apiKey: "",
            supportedChains: ["1", "137", "42161"],
            enableFusion: true,
            enableMEVProtection: true,
            treasuryMode: true
          }
        }
      },
      {
        id: "portfolio-api-1",
        type: "portfolioAPI",
        position: { x: 700, y: 280 },
        data: {
          label: "Treasury Analytics",
          config: {
            apiKey: "",
            trackHistory: true,
            enableAnalytics: true,
            treasuryView: true
          }
        }
      },
      {
        id: "dashboard-1",
        type: "dashboard",
        position: { x: 1000, y: 100 },
        data: {
          label: "DAO Governance Dashboard",
          config: {
            title: "DAO Governance & Treasury",
            components: ["proposals", "voting", "treasury", "analytics"],
            theme: "professional"
          }
        }
      }
    ],
    edges: [
      { id: "e1-2", source: "wallet-connector-1", target: "token-selector-1", type: "default" },
      { id: "e1-3", source: "wallet-connector-1", target: "chain-selector-1", type: "default" },
      { id: "e3-4", source: "chain-selector-1", target: "oneinch-swap-1", type: "default" },
      { id: "e2-5", source: "token-selector-1", target: "portfolio-api-1", type: "default" },
      { id: "e4-6", source: "oneinch-swap-1", target: "dashboard-1", type: "default" },
      { id: "e5-6", source: "portfolio-api-1", target: "dashboard-1", type: "default" }
    ],
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
        options: [
          { value: "3-days", label: "3 days" },
          { value: "7-days", label: "7 days" },
          { value: "14-days", label: "14 days" }
        ],
        required: true,
        defaultValue: "7-days"
      }
    ]
  },
  {
    id: "nft-marketplace-defi",
    name: "NFT Marketplace with DeFi Integration",
    description: "NFT marketplace with integrated DeFi features using 1inch for payments and liquidity",
    category: "nft",
    difficulty: "advanced",
    estimatedTime: "90 minutes", 
    features: [
      "🎨 NFT marketplace functionality",
      "💱 1inch payment processing",
      "💧 NFT liquidity pools",
      "📊 Price discovery mechanisms",
      "🔄 Cross-chain NFT transfers",
      "💎 Fractionalized NFT trading"
    ],
    nodes: [
      {
        id: "wallet-connector-1",
        type: "walletConnector", 
        position: { x: 100, y: 150 },
        data: {
          label: "NFT Wallet Connection",
          config: {
            supportedWallets: ["MetaMask", "WalletConnect", "Coinbase Wallet"],
            autoConnect: true,
            supportedChains: ["1", "137", "42161"]
          }
        }
      },
      {
        id: "chain-selector-1",
        type: "chainSelector",
        position: { x: 400, y: 100 },
        data: {
          label: "Multi-Chain NFTs",
          config: {
            supportedChains: ["1", "137", "42161"],
            defaultChain: "1",
            enableTestnet: false
          }
        }
      },
      {
        id: "oneinch-swap-1", 
        type: "oneInchSwap",
        position: { x: 400, y: 250 },
        data: {
          label: "Payment Processor",
          config: {
            apiKey: "",
            supportedChains: ["1", "137", "42161"],
            enableFusion: true,
            nftPaymentMode: true
          }
        }
      },
      {
        id: "portfolio-api-1",
        type: "portfolioAPI",
        position: { x: 700, y: 150 },
        data: {
          label: "NFT Portfolio Tracker",
          config: {
            apiKey: "",
            trackHistory: true,
            enableAnalytics: true,
            nftMode: true
          }
        }
      },
      {
        id: "dashboard-1",
        type: "dashboard",
        position: { x: 1000, y: 150 },
        data: {
          label: "NFT Marketplace",
          config: {
            title: "NFT Marketplace with DeFi",
            components: ["marketplace", "portfolio", "analytics"],
            theme: "creative"
          }
        }
      }
    ],
    edges: [
      { id: "e1-2", source: "wallet-connector-1", target: "chain-selector-1", type: "default" },
      { id: "e1-3", source: "wallet-connector-1", target: "oneinch-swap-1", type: "default" },
      { id: "e2-4", source: "chain-selector-1", target: "portfolio-api-1", type: "default" },
      { id: "e3-4", source: "oneinch-swap-1", target: "portfolio-api-1", type: "default" },
      { id: "e4-5", source: "portfolio-api-1", target: "dashboard-1", type: "default" }
    ],
    requiredInputs: [
      {
        key: "oneInchApiKey",
        label: "1inch API Key",
        description: "Your 1inch API key for payment processing",
        type: "string", 
        required: true,
        defaultValue: ""
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