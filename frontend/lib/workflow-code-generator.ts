/**
 * Simplified Workflow Code Generator
 * 
 * Generates ready-to-deploy DeFi applications from workflow executions
 */

export interface CodeGenerationResult {
  id: string
  name: string
  description: string
  files: CodeFile[]
  deploymentInfo: DeploymentInfo
  generatedAt: string
}

export interface CodeFile {
  path: string
  content: string
  type: 'frontend' | 'backend' | 'config'
  language: string
}

export interface DeploymentInfo {
  framework: string
  deploymentUrl?: string
  repositoryUrl?: string
}

export class WorkflowCodeGenerator {
  async generateFromWorkflow(nodes: any[], edges: any[], workflowName?: string): Promise<CodeGenerationResult> {
    const name = workflowName || 'DeFi Application'
    const appId = `app-${Date.now()}`
    
    // Analyze workflow to determine what to generate
    const analysis = this.analyzeWorkflow(nodes, edges)
    
    // Generate all files
    const files = await this.generateFiles(analysis)
    
    return {
      id: appId,
      name,
      description: `Generated DeFi application with ${analysis.nodeTypes.length} components`,
      files,
      deploymentInfo: {
        framework: 'Next.js + Express',
        deploymentUrl: 'Ready for deployment',
        repositoryUrl: 'Will be created on deploy'
      },
      generatedAt: new Date().toISOString()
    }
  }

  private analyzeWorkflow(nodes: any[], edges: any[]) {
    const nodeTypes = nodes.map(node => node.type).filter(type => type !== 'input' && type !== 'output')
    const hasWallet = nodeTypes.includes('walletConnector')
    const hasSwap = nodeTypes.includes('oneInchSwap')
    const hasBridge = nodeTypes.includes('fusionMonadBridge')
    const hasPortfolio = nodeTypes.includes('portfolioAPI')
    
    return {
      nodeTypes,
      hasWallet,
      hasSwap,
      hasBridge,
      hasPortfolio,
      pattern: this.determinePattern(nodeTypes)
    }
  }

  private determinePattern(nodeTypes: string[]): string {
    if (nodeTypes.includes('oneInchSwap')) return 'DeFi Swap Application'
    if (nodeTypes.includes('fusionMonadBridge')) return 'Cross-Chain Bridge'
    if (nodeTypes.includes('portfolioAPI')) return 'Portfolio Dashboard'
    return 'DeFi Dashboard'
  }

  private async generateFiles(analysis: any): Promise<CodeFile[]> {
    const files: CodeFile[] = []

    // Frontend files
    files.push(...this.generateFrontendFiles(analysis))
    
    // Backend files  
    files.push(...this.generateBackendFiles(analysis))
    
    // Config files
    files.push(...this.generateConfigFiles(analysis))

    return files
  }

  private generateFrontendFiles(analysis: any): CodeFile[] {
    return [
      {
        path: 'package.json',
        content: this.generatePackageJson(analysis),
        type: 'frontend',
        language: 'json'
      },
      {
        path: 'app/page.tsx',
        content: this.generateMainApp(analysis),
        type: 'frontend',
        language: 'typescript'
      },
      {
        path: 'components/SwapInterface.tsx',
        content: this.generateSwapInterface(),
        type: 'frontend',
        language: 'typescript'
      },
      {
        path: 'components/WalletConnector.tsx',
        content: this.generateWalletConnector(),
        type: 'frontend',
        language: 'typescript'
      },
      {
        path: 'styles/globals.css',
        content: this.generateGlobalStyles(),
        type: 'frontend',
        language: 'css'
      }
    ]
  }

  private generateBackendFiles(analysis: any): CodeFile[] {
    return [
      {
        path: 'server/package.json',
        content: this.generateServerPackageJson(),
        type: 'backend',
        language: 'json'
      },
      {
        path: 'server/index.js',
        content: this.generateServerIndex(analysis),
        type: 'backend',
        language: 'javascript'
      },
      {
        path: 'server/routes/swap.js',
        content: this.generateSwapRoutes(),
        type: 'backend',
        language: 'javascript'
      }
    ]
  }

  private generateConfigFiles(analysis: any): CodeFile[] {
    return [
      {
        path: 'next.config.js',
        content: this.generateNextConfig(),
        type: 'config',
        language: 'javascript'
      },
      {
        path: '.env.example',
        content: this.generateEnvExample(),
        type: 'config',
        language: 'bash'
      },
      {
        path: 'README.md',
        content: this.generateReadme(analysis),
        type: 'config',
        language: 'markdown'
      },
      {
        path: 'vercel.json',
        content: this.generateVercelConfig(),
        type: 'config',
        language: 'json'
      }
    ]
  }

  private generatePackageJson(analysis: any): string {
    return JSON.stringify({
      "name": "defi-app",
      "version": "1.0.0",
      "private": true,
      "scripts": {
        "dev": "next dev",
        "build": "next build",
        "start": "next start",
        "lint": "next lint"
      },
      "dependencies": {
        "next": "14.0.0",
        "react": "^18.0.0",
        "react-dom": "^18.0.0",
        "ethers": "^6.8.0",
        "wagmi": "^1.4.0",
        "viem": "^1.16.0",
        "@rainbow-me/rainbowkit": "^1.3.0",
        "@tanstack/react-query": "^4.35.0",
        "axios": "^1.6.0"
      },
      "devDependencies": {
        "@types/node": "^20.0.0",
        "@types/react": "^18.0.0",
        "@types/react-dom": "^18.0.0",
        "typescript": "^5.0.0",
        "tailwindcss": "^3.3.0",
        "autoprefixer": "^10.4.0",
        "postcss": "^8.4.0",
        "eslint": "^8.0.0",
        "eslint-config-next": "14.0.0"
      }
    }, null, 2)
  }

  private generateMainApp(analysis: any): string {
    return `'use client'

import { useState } from 'react'
import SwapInterface from '../components/SwapInterface'
import WalletConnector from '../components/WalletConnector'

export default function Home() {
  const [isConnected, setIsConnected] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ${analysis.pattern}
          </h1>
          <p className="text-xl text-gray-600">
            Powered by Unite DeFi
          </p>
        </header>

        <div className="max-w-md mx-auto">
          <WalletConnector 
            onConnect={() => setIsConnected(true)}
            onDisconnect={() => setIsConnected(false)}
          />
          
          {isConnected && (
            <div className="mt-8">
              <SwapInterface />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}`
  }

  private generateSwapInterface(): string {
    return `'use client'

import { useState } from 'react'

export default function SwapInterface() {
  const [fromToken, setFromToken] = useState('ETH')
  const [toToken, setToToken] = useState('USDC')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSwap = async () => {
    if (!amount) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromToken,
          toToken,
          amount,
          slippage: 1
        })
      })
      
      const result = await response.json()
      console.log('Swap result:', result)
      alert('Swap initiated successfully!')
    } catch (error) {
      console.error('Swap failed:', error)
      alert('Swap failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-6 text-center">Token Swap</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">From</label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 p-3 border rounded-lg"
            />
            <select 
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value)}
              className="p-3 border rounded-lg"
            >
              <option value="ETH">ETH</option>
              <option value="USDC">USDC</option>
              <option value="WBTC">WBTC</option>
            </select>
          </div>
        </div>

        <div className="flex justify-center">
          <button 
            onClick={() => {
              setFromToken(toToken)
              setToToken(fromToken)
            }}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            ↑↓
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">To</label>
          <select 
            value={toToken}
            onChange={(e) => setToToken(e.target.value)}
            className="w-full p-3 border rounded-lg"
          >
            <option value="USDC">USDC</option>
            <option value="ETH">ETH</option>
            <option value="WBTC">WBTC</option>
          </select>
        </div>

        <button
          onClick={handleSwap}
          disabled={!amount || loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          {loading ? 'Swapping...' : 'Swap'}
        </button>
      </div>
    </div>
  )
}`
  }

  private generateWalletConnector(): string {
    return `'use client'

import { useState } from 'react'

interface WalletConnectorProps {
  onConnect: () => void
  onDisconnect: () => void
}

export default function WalletConnector({ onConnect, onDisconnect }: WalletConnectorProps) {
  const [connected, setConnected] = useState(false)
  const [address, setAddress] = useState('')

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        })
        setAddress(accounts[0])
        setConnected(true)
        onConnect()
      } catch (error) {
        console.error('Failed to connect wallet:', error)
      }
    } else {
      alert('Please install MetaMask!')
    }
  }

  const disconnectWallet = () => {
    setConnected(false)
    setAddress('')
    onDisconnect()
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {!connected ? (
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Connect Your Wallet</h3>
          <button
            onClick={connectWallet}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Connect MetaMask
          </button>
        </div>
      ) : (
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Wallet Connected</h3>
          <p className="text-sm text-gray-600 mb-4">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
          <button
            onClick={disconnectWallet}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}`
  }

  private generateServerPackageJson(): string {
    return JSON.stringify({
      "name": "defi-app-server",
      "version": "1.0.0",
      "main": "index.js",
      "scripts": {
        "start": "node index.js",
        "dev": "nodemon index.js"
      },
      "dependencies": {
        "express": "^4.18.0",
        "cors": "^2.8.5",
        "axios": "^1.6.0",
        "ethers": "^6.8.0",
        "dotenv": "^16.3.0"
      },
      "devDependencies": {
        "nodemon": "^3.0.0"
      }
    }, null, 2)
  }

  private generateServerIndex(analysis: any): string {
    return `const express = require('express')
const cors = require('cors')
const swapRoutes = require('./routes/swap')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/swap', swapRoutes)

app.get('/', (req, res) => {
  res.json({ 
    message: '${analysis.pattern} API Server',
    version: '1.0.0',
    status: 'running'
  })
})

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`)
})`
  }

  private generateSwapRoutes(): string {
    return `const express = require('express')
const router = express.Router()

// Mock swap endpoint - replace with actual 1inch integration
router.post('/', async (req, res) => {
  try {
    const { fromToken, toToken, amount, slippage } = req.body
    
    // Mock response - integrate with actual 1inch API
    const mockResponse = {
      success: true,
      txHash: '0x' + Math.random().toString(16).slice(2, 66),
      fromToken,
      toToken,
      amount,
      estimatedGas: '150000',
      timestamp: new Date().toISOString()
    }
    
    res.json(mockResponse)
  } catch (error) {
    res.status(500).json({ error: 'Swap failed' })
  }
})

router.get('/quote', async (req, res) => {
  try {
    const { fromToken, toToken, amount } = req.query
    
    // Mock quote response
    const quote = {
      fromToken,
      toToken,
      fromAmount: amount,
      toAmount: (parseFloat(amount) * 1800).toString(), // Mock rate
      estimatedGas: '150000',
      priceImpact: '0.1'
    }
    
    res.json(quote)
  } catch (error) {
    res.status(500).json({ error: 'Quote failed' })
  }
})

module.exports = router`
  }

  private generateGlobalStyles(): string {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;
  background: #f8fafc;
}

.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}`
  }

  private generateNextConfig(): string {
    return `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*'
      }
    ]
  }
}

module.exports = nextConfig`
  }

  private generateEnvExample(): string {
    return `# Frontend Environment Variables
NEXT_PUBLIC_APP_NAME=DeFi Application
NEXT_PUBLIC_CHAIN_ID=1

# Backend Environment Variables  
PORT=3001
ONEINCH_API_KEY=your_api_key_here
INFURA_PROJECT_ID=your_infura_id
PRIVATE_KEY=your_private_key_here

# Optional
DATABASE_URL=your_database_url
REDIS_URL=your_redis_url`
  }

  private generateReadme(analysis: any): string {
    return `# ${analysis.pattern}

A modern DeFi application built with Next.js and Express, generated by Unite DeFi.

## Features

- 🔗 Wallet Connection (MetaMask)
- 💱 Token Swapping
- 📊 Real-time Data
- 🎨 Modern UI with Tailwind CSS

## Quick Start

### Frontend
\`\`\`bash
npm install
npm run dev
\`\`\`

### Backend
\`\`\`bash
cd server
npm install
npm run dev
\`\`\`

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_REPO_URL)

## Environment Setup

1. Copy \`.env.example\` to \`.env.local\`
2. Fill in your API keys and configuration
3. Start the development servers

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Blockchain**: Ethers.js, 1inch API
- **Deployment**: Vercel (Frontend), Railway (Backend)

## Generated by Unite DeFi

This application was automatically generated from a visual workflow.
Visit [Unite DeFi](https://unite-defi.com) to create your own DeFi applications.`
  }

  private generateVercelConfig(): string {
    return JSON.stringify({
      "version": 2,
      "builds": [
        {
          "src": "package.json",
          "use": "@vercel/next"
        }
      ],
      "routes": [
        {
          "src": "/api/(.*)",
          "dest": "/api/$1"
        }
      ],
      "env": {
        "NEXT_PUBLIC_APP_NAME": "DeFi Application"
      }
    }, null, 2)
  }
}

export const workflowCodeGenerator = new WorkflowCodeGenerator()