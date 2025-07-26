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

export const FLOW_TEMPLATES: FlowTemplate[] = [
  {
    id: "basic-swap-app",
    name: "Basic Swap Application",
    description: "A complete DEX swap interface with Uniswap V3 integration, wallet connection, and responsive UI",
    category: "defi",
    difficulty: "beginner",
    estimatedTime: "10 minutes",
    features: [
      "Token swap functionality",
      "Wallet connection (MetaMask, WalletConnect)",
      "Real-time price feeds",
      "Slippage protection",
      "Transaction history",
      "Responsive dashboard UI"
    ],
    nodes: [
      // Smart Contract Layer
      {
        id: "uniswap-v3-router",
        type: "uniswapV3Router",
        position: { x: 100, y: 100 },
        data: {
          label: "Uniswap V3 Router",
          config: {
            routerAddress: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
            network: "ethereum",
            slippageTolerance: "0.5",
            deadline: "20"
          }
        }
      },
      {
        id: "price-oracle",
        type: "chainlinkOracle",
        position: { x: 100, y: 250 },
        data: {
          label: "Price Oracle",
          config: {
            priceFeedAddresses: {
              "ETH/USD": "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
              "USDC/USD": "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6"
            },
            updateInterval: "30"
          }
        }
      },
      
      // Frontend UI Layer
      {
        id: "swap-interface",
        type: "swapInterface",
        position: { x: 400, y: 100 },
        data: {
          label: "Swap Interface",
          config: {
            title: "Token Swap",
            defaultTokens: ["ETH", "USDC", "USDT", "DAI"],
            showAdvancedSettings: true,
            theme: "modern"
          }
        }
      },
      {
        id: "wallet-connector",
        type: "walletConnector",
        position: { x: 400, y: 250 },
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
        id: "transaction-history",
        type: "transactionHistory",
        position: { x: 400, y: 400 },
        data: {
          label: "Transaction History",
          config: {
            maxTransactions: "50",
            showPendingTx: true,
            enableFiltering: true
          }
        }
      },
      
      // Backend API Layer
      {
        id: "swap-api",
        type: "swapAPI",
        position: { x: 700, y: 100 },
        data: {
          label: "Swap API",
          config: {
            endpoints: [
              "/api/swap/quote",
              "/api/swap/execute",
              "/api/tokens/list",
              "/api/user/history"
            ],
            rateLimit: "100",
            authentication: false
          }
        }
      },
      {
        id: "token-data-service",
        type: "tokenDataService",
        position: { x: 700, y: 250 },
        data: {
          label: "Token Data Service",
          config: {
            dataProviders: ["CoinGecko", "CoinMarketCap"],
            cacheDuration: "300",
            supportedNetworks: ["ethereum", "polygon", "arbitrum"]
          }
        }
      }
    ],
    edges: [
      // Smart Contract to Frontend connections
      {
        id: "e1",
        source: "uniswap-v3-router",
        target: "swap-interface",
        sourceHandle: null,
        targetHandle: null
      },
      {
        id: "e2",
        source: "price-oracle",
        target: "swap-interface",
        sourceHandle: null,
        targetHandle: null
      },
      {
        id: "e3",
        source: "wallet-connector",
        target: "swap-interface",
        sourceHandle: null,
        targetHandle: null
      },
      
      // Frontend to Backend connections
      {
        id: "e4",
        source: "swap-interface",
        target: "swap-api",
        sourceHandle: null,
        targetHandle: null
      },
      {
        id: "e5",
        source: "transaction-history",
        target: "swap-api",
        sourceHandle: null,
        targetHandle: null
      },
      {
        id: "e6",
        source: "token-data-service",
        target: "swap-interface",
        sourceHandle: null,
        targetHandle: null
      },
      
      // Backend internal connections
      {
        id: "e7",
        source: "swap-api",
        target: "token-data-service",
        sourceHandle: null,
        targetHandle: null
      }
    ],
    requiredInputs: [
      {
        key: "appName",
        label: "Application Name",
        description: "Name of your swap application",
        type: "string",
        required: true,
        defaultValue: "MySwap"
      },
      {
        key: "supportedTokens",
        label: "Supported Tokens",
        description: "Which tokens to support for swapping",
        type: "select",
        options: ["ETH+Stablecoins", "Top 10 Tokens", "All ERC-20"],
        required: true,
        defaultValue: "ETH+Stablecoins"
      },
      {
        key: "network",
        label: "Blockchain Network",
        description: "Which network to deploy on",
        type: "select",
        options: ["Ethereum", "Polygon", "Arbitrum", "Base"],
        required: true,
        defaultValue: "Ethereum"
      },
      {
        key: "feeRecipient",
        label: "Fee Recipient Address",
        description: "Address to receive trading fees (optional)",
        type: "string",
        required: false
      }
    ]
  },
  
  // Add more templates here
  {
    id: "basic-dao-governance",
    name: "Basic DAO Governance",
    description: "Simple DAO with token-based voting and proposal system",
    category: "dao",
    difficulty: "intermediate",
    estimatedTime: "15 minutes",
    features: [
      "ERC-20 governance token",
      "Proposal creation and voting",
      "Treasury management",
      "Delegation system"
    ],
    nodes: [],
    edges: []
  },
  
  {
    id: "ai-trading-bot",
    name: "AI Trading Bot",
    description: "Automated trading bot with AI decision making",
    category: "ai",
    difficulty: "advanced", 
    estimatedTime: "25 minutes",
    features: [
      "AI-powered trading decisions",
      "Risk management",
      "Multi-DEX arbitrage",
      "Performance analytics"
    ],
    nodes: [],
    edges: []
  }
]

export const getTemplateById = (id: string): FlowTemplate | undefined => {
  return FLOW_TEMPLATES.find(template => template.id === id)
}

export const getTemplatesByCategory = (category: FlowTemplate["category"]): FlowTemplate[] => {
  return FLOW_TEMPLATES.filter(template => template.category === category)
} 