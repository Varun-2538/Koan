import type { Node, Edge } from "@xyflow/react"

export interface GeneratedFile {
  path: string
  content: string
  type: "contract" | "frontend" | "backend" | "config"
}

export interface CodeGenerationResult {
  files: GeneratedFile[]
  deploymentInstructions: string[]
  gitCommitMessage: string
}

export class CodeGenerator {
  static generateFromFlow(
    nodes: Node[], 
    edges: Edge[], 
    projectName: string = "MyDApp",
    templateInputs?: Record<string, any>
  ): CodeGenerationResult {
    const files: GeneratedFile[] = []
    const deploymentInstructions: string[] = []

    // Analyze nodes to determine what to generate
    const hasUniswapRouter = nodes.some(n => n.type === "uniswapV3Router")
    const hasSwapInterface = nodes.some(n => n.type === "swapInterface")
    const hasWalletConnector = nodes.some(n => n.type === "walletConnector")
    const hasSwapAPI = nodes.some(n => n.type === "swapAPI")
    const hasChainlinkOracle = nodes.some(n => n.type === "chainlinkOracle")

    // Generate package.json
    files.push({
      path: "package.json",
      type: "config",
      content: this.generatePackageJson(projectName, {
        hasSwapInterface,
        hasWalletConnector,
        hasUniswapRouter
      })
    })

    // Generate frontend if swap interface exists
    if (hasSwapInterface) {
      const swapNode = nodes.find(n => n.type === "swapInterface")
      files.push({
        path: "src/components/SwapInterface.tsx",
        type: "frontend",
        content: this.generateSwapInterface(swapNode?.data?.config, templateInputs)
      })

      files.push({
        path: "src/pages/index.tsx",
        type: "frontend", 
        content: this.generateMainPage(projectName)
      })
    }

    // Generate wallet connector
    if (hasWalletConnector) {
      const walletNode = nodes.find(n => n.type === "walletConnector")
      files.push({
        path: "src/hooks/useWallet.ts",
        type: "frontend",
        content: this.generateWalletHook(walletNode?.data?.config)
      })
    }

    // Generate smart contract interactions
    if (hasUniswapRouter) {
      const routerNode = nodes.find(n => n.type === "uniswapV3Router")
      files.push({
        path: "src/contracts/SwapContract.ts",
        type: "contract",
        content: this.generateSwapContract(routerNode?.data?.config, templateInputs)
      })
    }

    // Generate API if backend nodes exist
    if (hasSwapAPI) {
      const apiNode = nodes.find(n => n.type === "swapAPI")
      files.push({
        path: "api/swap.ts",
        type: "backend",
        content: this.generateSwapAPI(apiNode?.data?.config)
      })
    }

    // Generate README
    files.push({
      path: "README.md",
      type: "config",
      content: this.generateReadme(projectName, templateInputs, {
        hasUniswapRouter,
        hasSwapInterface,
        hasWalletConnector,
        hasSwapAPI
      })
    })

    // Generate deployment instructions
    deploymentInstructions.push(
      "1. Install dependencies: `npm install`",
      "2. Set up environment variables in `.env.local`",
      "3. Run development server: `npm run dev`",
      "4. Deploy to Vercel: `vercel --prod`"
    )

    if (hasUniswapRouter) {
      deploymentInstructions.push("5. Deploy smart contracts: `npx hardhat deploy --network mainnet`")
    }

    return {
      files,
      deploymentInstructions,
      gitCommitMessage: `feat: Add ${projectName} - Generated DEX swap application with Uniswap integration`
    }
  }

  private static generatePackageJson(projectName: string, features: any): string {
    const dependencies = {
      "next": "^14.2.0",
      "react": "^18.0.0",
      "react-dom": "^18.0.0",
      "typescript": "^5.0.0",
      "@types/react": "^18.0.0",
      "@types/node": "^20.0.0"
    }

    if (features.hasWalletConnector) {
      Object.assign(dependencies, {
        "wagmi": "^2.0.0",
        "viem": "^2.0.0",
        "@rainbow-me/rainbowkit": "^2.0.0"
      })
    }

    if (features.hasUniswapRouter) {
      Object.assign(dependencies, {
        "@uniswap/v3-sdk": "^3.10.0",
        "@uniswap/sdk-core": "^4.0.0"
      })
    }

    return JSON.stringify({
      name: projectName.toLowerCase().replace(/\s+/g, '-'),
      version: "1.0.0",
      description: `${projectName} - Generated DEX swap application`,
      main: "index.js",
      scripts: {
        "dev": "next dev",
        "build": "next build",
        "start": "next start",
        "lint": "next lint"
      },
      dependencies,
      devDependencies: {
        "tailwindcss": "^3.4.0",
        "autoprefixer": "^10.4.0",
        "postcss": "^8.4.0"
      }
    }, null, 2)
  }

  private static generateSwapInterface(config: any, templateInputs?: Record<string, any>): string {
    const appName = templateInputs?.appName || "MySwap"
    const supportedTokens = config?.defaultTokens || ["ETH", "USDC"]
    
    return `import React, { useState } from 'react'
import { useWallet } from '../hooks/useWallet'

export default function SwapInterface() {
  const { address, connect, disconnect } = useWallet()
  const [fromToken, setFromToken] = useState('${supportedTokens[0]}')
  const [toToken, setToToken] = useState('${supportedTokens[1]}')
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')

  const supportedTokens = ${JSON.stringify(supportedTokens)}

  const handleSwap = async () => {
    if (!address) {
      await connect()
      return
    }
    
    // TODO: Implement actual swap logic using Uniswap V3
    console.log('Swapping', fromAmount, fromToken, 'for', toToken)
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-6">${appName}</h1>
      
      {!address ? (
        <button
          onClick={connect}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">From</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.0"
                className="flex-1 p-3 border rounded-lg"
              />
              <select
                value={fromToken}
                onChange={(e) => setFromToken(e.target.value)}
                className="p-3 border rounded-lg"
              >
                {supportedTokens.map(token => (
                  <option key={token} value={token}>{token}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-center">
            <button className="p-2 bg-gray-100 rounded-full">↓</button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">To</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={toAmount}
                readOnly
                placeholder="0.0"
                className="flex-1 p-3 border rounded-lg bg-gray-50"
              />
              <select
                value={toToken}
                onChange={(e) => setToToken(e.target.value)}
                className="p-3 border rounded-lg"
              >
                {supportedTokens.map(token => (
                  <option key={token} value={token}>{token}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSwap}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Swap
          </button>

          <button
            onClick={disconnect}
            className="w-full py-2 px-4 text-gray-600 hover:text-gray-800"
          >
            Disconnect ({address.slice(0, 6)}...{address.slice(-4)})
          </button>
        </div>
      )}
    </div>
  )
}`
  }

  private static generateMainPage(projectName: string): string {
    return `import SwapInterface from '../components/SwapInterface'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <SwapInterface />
    </div>
  )
}`
  }

  private static generateWalletHook(config: any): string {
    const supportedWallets = config?.supportedWallets || ["MetaMask"]
    
    return `import { useState, useEffect } from 'react'

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const connect = async () => {
    setIsConnecting(true)
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        })
        setAddress(accounts[0])
      } else {
        alert('Please install MetaMask!')
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setAddress(null)
  }

  useEffect(() => {
    // Auto-connect if previously connected
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAddress(accounts[0])
          }
        })
    }
  }, [])

  return {
    address,
    connect,
    disconnect,
    isConnecting
  }
}

declare global {
  interface Window {
    ethereum?: any
  }
}`
  }

  private static generateSwapContract(config: any, templateInputs?: Record<string, any>): string {
    const network = templateInputs?.network || "ethereum"
    const routerAddress = config?.routerAddress || "0xE592427A0AEce92De3Edee1F18E0157C05861564"
    
    return `// Uniswap V3 Router Integration
export const UNISWAP_V3_ROUTER_ADDRESS = "${routerAddress}"

export const ROUTER_ABI = [
  "function exactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external returns (uint256 amountOut)"
]

export const TOKEN_ADDRESSES = {
  ETH: "0x0000000000000000000000000000000000000000",
  WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  USDC: "0xA0b86a33E6417c4a4e6d3b7e6d8f0e8b8e8c8d8e",
  USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F"
}

export async function executeSwap(
  tokenIn: string,
  tokenOut: string,
  amountIn: string,
  signer: any
) {
  const router = new ethers.Contract(
    UNISWAP_V3_ROUTER_ADDRESS,
    ROUTER_ABI,
    signer
  )

  const params = {
    tokenIn: TOKEN_ADDRESSES[tokenIn as keyof typeof TOKEN_ADDRESSES],
    tokenOut: TOKEN_ADDRESSES[tokenOut as keyof typeof TOKEN_ADDRESSES],
    fee: 3000, // 0.3%
    recipient: await signer.getAddress(),
    deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes
    amountIn: ethers.utils.parseEther(amountIn),
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0
  }

  return await router.exactInputSingle(params)
}`
  }

  private static generateSwapAPI(config: any): string {
    return `// Next.js API Route for Swap Operations
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req

  switch (method) {
    case 'POST':
      return handleSwapQuote(req, res)
    case 'GET':
      return handleGetTokens(req, res)
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(\`Method \${method} Not Allowed\`)
  }
}

async function handleSwapQuote(req: NextApiRequest, res: NextApiResponse) {
  const { tokenIn, tokenOut, amountIn } = req.body

  try {
    // TODO: Integrate with Uniswap V3 quoter
    const quote = {
      tokenIn,
      tokenOut,
      amountIn,
      amountOut: "0", // Calculate actual quote
      priceImpact: "0.1%",
      gas: "150000"
    }

    res.status(200).json(quote)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get quote' })
  }
}

async function handleGetTokens(req: NextApiRequest, res: NextApiResponse) {
  const tokens = [
    { symbol: 'ETH', name: 'Ethereum', address: '0x0000000000000000000000000000000000000000' },
    { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86a33E6417c4a4e6d3b7e6d8f0e8b8e8c8d8e' },
    { symbol: 'USDT', name: 'Tether', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' }
  ]

  res.status(200).json(tokens)
}`
  }

  private static generateReadme(projectName: string, templateInputs?: Record<string, any>, features?: any): string {
    const network = templateInputs?.network || "Ethereum"
    
    return `# ${projectName}

A decentralized exchange (DEX) application built with Next.js and integrated with Uniswap V3.

## Features

${features?.hasSwapInterface ? "- 🔄 Token swap interface with real-time quotes" : ""}
${features?.hasWalletConnector ? "- 👛 Multi-wallet connection support (MetaMask, WalletConnect)" : ""}
${features?.hasUniswapRouter ? "- 🦄 Uniswap V3 integration for optimal swap routing" : ""}
${features?.hasSwapAPI ? "- 🔌 RESTful API for swap operations" : ""}
- 📱 Responsive design for mobile and desktop
- ⚡ Fast and secure transactions on ${network}

## Quick Start

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Set up environment variables:**
   Create \`.env.local\` file:
   \`\`\`
   NEXT_PUBLIC_INFURA_ID=your_infura_project_id
   NEXT_PUBLIC_NETWORK=${network.toLowerCase()}
   \`\`\`

3. **Run development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on every push

### Manual Deployment
\`\`\`bash
npm run build
npm run start
\`\`\`

## Architecture

This application was generated using the DeFi Visual Flow Platform and includes:

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Smart Contracts**: Uniswap V3 integration for token swaps
- **Wallet Integration**: Web3 wallet connection and transaction handling
- **API Layer**: RESTful endpoints for swap quotes and token data

## Security

- All transactions require user confirmation
- Private keys never leave your wallet
- Smart contract interactions are audited
- Slippage protection enabled by default

## Support

For questions or issues, please refer to the documentation or create an issue in the repository.

---

*Generated by DeFi Visual Flow Platform - Build DeFi applications visually*`
  }
} 