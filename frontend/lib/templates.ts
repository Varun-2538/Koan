import type { Node, Edge } from "@xyflow/react"

export interface FlowTemplate {
  id: string
  name: string
  description: string
  category: "defi" | "dao" | "nft" | "ai" | "infrastructure" | "avalanche"
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
            template_creation_mode: true,
            supportedWallets: ["MetaMask", "WalletConnect", "Coinbase Wallet"],
            autoConnect: true,
            supportedChains: ["1", "137", "56", "42161", "10", "43114"],
            defaultChain: "1"
          }
        }
      },
      {
        id: "token-selector-1", 
        type: "tokenSelector", // Changed from "tokenInput" to match backend
        position: { x: 100, y: 280 },
        data: {
          label: "Multi-Chain Token Selector",
          config: {
            template_creation_mode: true,
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
            // Template mode flag
            template_creation_mode: true,
            
            // Backend required fields
            api_key: "",
            
            // Frontend config fields
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
        type: "priceImpactCalculator", // Changed from "slippageControl" to match backend
        position: { x: 400, y: 280 },
        data: {
          label: "Price Impact Analysis",
          config: {
            template_creation_mode: true,
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
            // Template mode flag
            template_creation_mode: true,
            
            // Backend required fields
            api_key: "",
            
            // Frontend config fields
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
            // Template mode flag
            template_creation_mode: true,
            
            // Required fields for backend validation
            api_key: "",
            source_chain: "1", // Ethereum
            destination_chain: "137", // Polygon
            from_token: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // ETH
            to_token: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", // WETH on Polygon
            amount: "1000000000000000000", // 1 ETH in wei
            from_address: "0x1234567890123456789012345678901234567890", // Demo address
            
            // Original config fields
            apiKey: "",
            supportedChains: ["1", "137", "56", "42161", "10", "43114"],
            enableMEVProtection: true,
            enableGasless: true,
            defaultTimeout: 30
          }
        }
      },
      {
        id: "limitOrder-1",
        type: "limitOrder",
        position: { x: 1000, y: 100 },
        data: {
          label: "Limit Order Protocol",
          config: {
            // Template mode flag
            template_creation_mode: true,
            
            // Backend required fields  
            api_key: "",
            
            // Frontend config fields
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
            // Template mode flag
            template_creation_mode: true,
            
            // Backend required fields
            api_key: "",
            
            // Frontend config fields
            apiKey: "",
            trackHistory: true,
            enableAnalytics: true,
            supportedChains: ["1", "137", "56", "42161", "10", "43114"]
          }
        }
      },
      {
        id: "transaction-monitor-1",
        type: "transactionMonitor", // Changed from "transactionHistory" to match backend
        position: { x: 1300, y: 100 },
        data: {
          label: "Transaction Monitor",
          config: {
            template_creation_mode: true,
            maxTransactions: "50",
            showPendingTx: true,
            enableFiltering: true,
            realTimeUpdates: true
          }
        }
      },
      {
        id: "defi-dashboard-1",
        type: "defiDashboard", // This should match backend
        position: { x: 1300, y: 280 },
        data: {
          label: "DeFi Analytics Dashboard",
          config: {
            template_creation_mode: true,
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
      { id: "e5-7", source: "oneinch-swap-1", target: "limitOrder-1", type: "default" }, // Fixed ID
      { id: "e5-8", source: "oneinch-swap-1", target: "portfolio-api-1", type: "default" },
      { id: "e7-9", source: "limitOrder-1", target: "transaction-monitor-1", type: "default" }, // Fixed ID
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
            template_creation_mode: true,
            supportedWallets: ["MetaMask", "WalletConnect"],
            autoConnect: true,
            networkChainId: "1"
          }
        }
      },
      {
        id: "token-input-1",
        type: "tokenSelector", // Changed from "tokenInput" to match backend
        position: { x: 400, y: 150 },
        data: {
          label: "Token Selector",
          config: {
            template_creation_mode: true,
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
            template_creation_mode: true,
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
        type: "priceImpactCalculator", // Changed from "slippageControl" to match backend
        position: { x: 700, y: 300 },
        data: {
          label: "Slippage Control",
          config: {
            template_creation_mode: true,
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
            template_creation_mode: true,
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
        type: "defiDashboard", // Changed from "swapInterface" to match backend available type
        position: { x: 1300, y: 150 },
        data: {
          label: "Swap Interface",
          config: {
            template_creation_mode: true,
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
            template_creation_mode: true,
            supportedWallets: ["MetaMask", "WalletConnect", "Gnosis Safe"],
            autoConnect: true,
            supportedChains: ["1", "137"]
          }
        }
      },
      {
        id: "token-selector-1",
        type: "tokenSelector", // Changed from "tokenInput" 
        position: { x: 100, y: 280 },
        data: {
          label: "Governance Token",
          config: {
            template_creation_mode: true,
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
        type: "chainSelector", // This should match backend
        position: { x: 400, y: 100 },
        data: {
          label: "Multi-Chain DAO",
          config: {
            template_creation_mode: true,
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
            template_creation_mode: true,
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
            template_creation_mode: true,
            apiKey: "",
            trackHistory: true,
            enableAnalytics: true,
            treasuryView: true
          }
        }
      },
      {
        id: "dashboard-1",
        type: "defiDashboard", // Changed from "dashboard" to match backend
        position: { x: 1000, y: 100 },
        data: {
          label: "DAO Governance Dashboard",
          config: {
            template_creation_mode: true,
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
            template_creation_mode: true,
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
            template_creation_mode: true,
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
            template_creation_mode: true,
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
            template_creation_mode: true,
            apiKey: "",
            trackHistory: true,
            enableAnalytics: true,
            nftMode: true
          }
        }
      },
      {
        id: "dashboard-1",
        type: "defiDashboard", // Changed from "dashboard" to match backend
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
  },
  {
    id: "avalanche-icm-workflow",
    name: "Avalanche ICM Cross-Chain Messaging",
    description: "Complete cross-chain messaging workflow using Avalanche Teleporter for secure interchain communication between subnets and mainnets",
    category: "avalanche",
    difficulty: "intermediate",
    estimatedTime: "30 minutes",
    features: [
      "📤 Avalanche Teleporter ICM integration",
      "🔐 Secure cross-chain message sending",
      "📥 Real-time message reception and decoding",
      "🏔️ Fuji testnet support with mainnet compatibility",
      "💰 Automatic fee calculation and gas optimization",
      "⚡ Real-time transaction monitoring",
      "🔍 Message payload validation and parsing",
      "🛡️ Frontend-controlled signing (no backend PK access)"
    ],
    nodes: [
      {
        id: "wallet-connector-1",
        type: "walletConnector",
        position: { x: 100, y: 100 },
        data: {
          label: "Avalanche Wallet Connection",
          config: {
            template_creation_mode: true,
            supportedWallets: ["MetaMask", "Core Wallet", "WalletConnect"],
            autoConnect: true,
            supportedChains: ["43113"], // Fuji testnet
            defaultChain: "43113"
          }
        }
      },
      {
        id: "chain-selector-1",
        type: "chainSelector",
        position: { x: 100, y: 280 },
        data: {
          label: "Chain Selector",
          config: {
            template_creation_mode: true,
            supportedChains: ["43113"], // Fuji C-Chain
            defaultChain: "43113",
            enableTestnet: true
          }
        }
      },
      {
        id: "icm-sender-1",
        type: "icmSender",
        position: { x: 400, y: 100 },
        data: {
          label: "ICM Message Sender",
          config: {
            template_creation_mode: true,
            sourceChain: "C",
            destinationChainID: "11111111111111111111111111111111LpoYY", // Fuji subnet
            amount: "Hello from Avalanche ICM!",
            payloadType: "string",
            gasLimit: 100000
          }
        }
      },
      {
        id: "icm-receiver-1",
        type: "icmReceiver",
        position: { x: 700, y: 100 },
        data: {
          label: "ICM Message Receiver",
          config: {
            template_creation_mode: true,
            messageID: "template_msg_123", // Will be set by sender
            sourceChainID: "11111111111111111111111111111111LpoYY",
            pollingTimeout: 30
          }
        }
      },
      {
        id: "transaction-monitor-1",
        type: "transactionMonitor",
        position: { x: 400, y: 280 },
        data: {
          label: "ICM Transaction Monitor",
          config: {
            template_creation_mode: true,
            maxTransactions: "10",
            showPendingTx: true,
            enableFiltering: true,
            realTimeUpdates: true
          }
        }
      },
      {
        id: "dashboard-1",
        type: "defiDashboard",
        position: { x: 1000, y: 100 },
        data: {
          label: "ICM Analytics Dashboard",
          config: {
            template_creation_mode: true,
            title: "Avalanche ICM Dashboard",
            components: ["messages", "transactions", "analytics"],
            theme: "avalanche-branded",
            enableRealTime: true
          }
        }
      }
    ],
    edges: [
      { id: "e1-2", source: "wallet-connector-1", target: "chain-selector-1", type: "default" },
      { id: "e1-3", source: "wallet-connector-1", target: "icm-sender-1", type: "default" },
      { id: "e2-3", source: "chain-selector-1", target: "icm-sender-1", type: "default" },
      { id: "e3-4", source: "icm-sender-1", target: "icm-receiver-1", type: "default" },
      { id: "e3-5", source: "icm-sender-1", target: "transaction-monitor-1", type: "default" },
      { id: "e4-6", source: "icm-receiver-1", target: "dashboard-1", type: "default" },
      { id: "e5-6", source: "transaction-monitor-1", target: "dashboard-1", type: "default" }
    ],
    requiredInputs: [
      {
        key: "destinationSubnet",
        label: "Destination Subnet ID",
        description: "The subnet ID where you want to send the ICM message",
        type: "string",
        required: true,
        defaultValue: "11111111111111111111111111111111LpoYY"
      },
      {
        key: "messageContent",
        label: "Message Content",
        description: "The content of your cross-chain message",
        type: "string",
        required: true,
        defaultValue: "Hello from Avalanche ICM!"
      },
      {
        key: "gasLimit",
        label: "Gas Limit",
        description: "Gas limit for the cross-chain message",
        type: "number",
        required: false,
        defaultValue: 100000
      }
    ]
  },
  {
    id: "avalanche-l1-simulation",
    name: "Avalanche L1 Subnet Creation & ICM",
    description: "Complete workflow for creating custom Avalanche L1 subnets and demonstrating cross-chain messaging between them",
    category: "avalanche",
    difficulty: "advanced",
    estimatedTime: "45 minutes",
    features: [
      "🏗️ Custom L1 subnet configuration generation",
      "📋 Genesis JSON creation with token allocation",
      "🚀 Simulated subnet deployment with realistic parameters",
      "🔗 Cross-chain messaging between custom subnets",
      "💰 Automatic fee calculation for ICM transactions",
      "📊 Real-time deployment and messaging analytics",
      "🎭 Production-ready simulation for demo purposes",
      "🛡️ Secure wallet integration throughout the process"
    ],
    nodes: [
      {
        id: "wallet-connector-1",
        type: "walletConnector",
        position: { x: 100, y: 100 },
        data: {
          label: "Avalanche Wallet Connection",
          config: {
            template_creation_mode: true,
            supportedWallets: ["MetaMask", "Core Wallet"],
            autoConnect: true,
            supportedChains: ["43113"], // Fuji testnet
            defaultChain: "43113"
          }
        }
      },
      {
        id: "l1-config-1",
        type: "l1Config",
        position: { x: 100, y: 280 },
        data: {
          label: "L1 Subnet Configuration",
          config: {
            template_creation_mode: true,
            vmType: "SubnetEVM",
            chainId: 12345,
            tokenSymbol: "CUSTOM",
            initialSupply: 1000000,
            gasLimit: 8000000
          }
        }
      },
      {
        id: "l1-simulator-deployer-1",
        type: "l1SimulatorDeployer",
        position: { x: 400, y: 100 },
        data: {
          label: "Subnet Deployment Simulator",
          config: {
            template_creation_mode: true,
            controlKeys: [],
            threshold: 1
          }
        }
      },
      {
        id: "icm-sender-1",
        type: "icmSender",
        position: { x: 700, y: 100 },
        data: {
          label: "Cross-Subnet ICM Sender",
          config: {
            template_creation_mode: true,
            sourceChain: "C",
            destinationChainID: "", // Will be set by deployer
            amount: "Welcome to your custom subnet!",
            payloadType: "string",
            gasLimit: 100000
          }
        }
      },
      {
        id: "icm-receiver-1",
        type: "icmReceiver",
        position: { x: 1000, y: 100 },
        data: {
          label: "Cross-Subnet ICM Receiver",
          config: {
            template_creation_mode: true,
            messageID: "", // Will be set by sender
            sourceChainID: "", // Will be set by deployer
            pollingTimeout: 30
          }
        }
      },
      {
        id: "transaction-monitor-1",
        type: "transactionMonitor",
        position: { x: 400, y: 280 },
        data: {
          label: "Deployment & ICM Monitor",
          config: {
            template_creation_mode: true,
            maxTransactions: "20",
            showPendingTx: true,
            enableFiltering: true,
            realTimeUpdates: true
          }
        }
      },
      {
        id: "dashboard-1",
        type: "defiDashboard",
        position: { x: 1300, y: 100 },
        data: {
          label: "Avalanche L1 & ICM Dashboard",
          config: {
            template_creation_mode: true,
            title: "Custom Subnet & ICM Analytics",
            components: ["subnet", "icm", "transactions", "analytics"],
            theme: "avalanche-branded",
            enableRealTime: true
          }
        }
      }
    ],
    edges: [
      { id: "e1-2", source: "wallet-connector-1", target: "l1-config-1", type: "default" },
      { id: "e2-3", source: "l1-config-1", target: "l1-simulator-deployer-1", type: "default" },
      { id: "e3-4", source: "l1-simulator-deployer-1", target: "icm-sender-1", type: "default" },
      { id: "e4-5", source: "icm-sender-1", target: "icm-receiver-1", type: "default" },
      { id: "e3-6", source: "l1-simulator-deployer-1", target: "transaction-monitor-1", type: "default" },
      { id: "e4-6", source: "icm-sender-1", target: "transaction-monitor-1", type: "default" },
      { id: "e5-7", source: "icm-receiver-1", target: "dashboard-1", type: "default" },
      { id: "e6-7", source: "transaction-monitor-1", target: "dashboard-1", type: "default" }
    ],
    requiredInputs: [
      {
        key: "subnetName",
        label: "Subnet Name",
        description: "Name for your custom subnet",
        type: "string",
        required: true,
        defaultValue: "MyCustomSubnet"
      },
      {
        key: "chainId",
        label: "Chain ID",
        description: "Unique chain ID for your subnet (must be unique)",
        type: "number",
        required: true,
        defaultValue: 12345
      },
      {
        key: "nativeToken",
        label: "Native Token Symbol",
        description: "Symbol for the native token of your subnet",
        type: "string",
        required: true,
        defaultValue: "CUSTOM"
      },
      {
        key: "initialSupply",
        label: "Initial Token Supply",
        description: "Initial supply of native tokens",
        type: "number",
        required: true,
        defaultValue: 1000000
      },
      {
        key: "welcomeMessage",
        label: "Welcome Message",
        description: "Message to send to your new subnet",
        type: "string",
        required: false,
        defaultValue: "Welcome to your custom Avalanche subnet!"
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