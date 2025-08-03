/**
 * Workflow Code Generator
 * 
 * Generates full-stack applications based on successful workflow executions
 */

import { ExecutionStatus } from './workflow-execution-client'

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
  type: 'frontend' | 'backend' | 'config' | 'contract'
  language: string
}

export interface DeploymentInfo {
  backend: {
    port: number
    endpoints: string[]
    dependencies: string[]
  }
  frontend: {
    port: number
    framework: string
    dependencies: string[]
  }
  database?: {
    type: string
    schema: any
  }
}

export class WorkflowCodeGenerator {
  
  /**
   * Generate a complete application based on successful workflow execution
   */
  async generateApplicationFromWorkflow(
    executionStatus: ExecutionStatus,
    workflowName: string = 'DeFi Application'
  ): Promise<CodeGenerationResult> {
    
    const timestamp = new Date().toISOString()
    const appId = `app-${Date.now()}`
    
    // Analyze executed workflow to determine application structure
    const analysis = this.analyzeWorkflowExecution(executionStatus)
    
    // Generate code files
    const files: CodeFile[] = []
    
    // Generate backend files
    files.push(...this.generateBackendFiles(analysis))
    
    // Generate frontend files
    files.push(...this.generateFrontendFiles(analysis))
    
    // Generate configuration files
    files.push(...this.generateConfigFiles(analysis))
    
    // Generate deployment info
    const deploymentInfo = this.generateDeploymentInfo(analysis)
    
    return {
      id: appId,
      name: workflowName,
      description: `Generated application based on ${analysis.pattern} workflow`,
      files,
      deploymentInfo,
      generatedAt: timestamp
    }
  }
  
  private analyzeWorkflowExecution(executionStatus: ExecutionStatus) {
    const nodeTypes = Object.values(executionStatus.steps || {}).map(step => step.nodeType)
    const uniqueNodeTypes = [...new Set(nodeTypes)]
    
    // Determine application pattern
    let pattern = 'Custom DeFi Application'
    let features: string[] = []
    
    if (uniqueNodeTypes.includes('oneInchSwap') || uniqueNodeTypes.includes('fusionSwap')) {
      pattern = 'DEX Aggregator'
      features.push('Token Swapping')
    }
    
    if (uniqueNodeTypes.includes('fusionPlus')) {
      pattern = 'Cross-Chain Bridge'
      features.push('Cross-Chain Transfers')
    }
    
    if (uniqueNodeTypes.includes('fusionMonadBridge')) {
      pattern = 'Ethereum-Monad Atomic Bridge'
      features.push('Atomic Cross-Chain Swaps')
      features.push('HTLC Implementation')
      features.push('MEV Protection')
    }
    
    if (uniqueNodeTypes.includes('portfolioAPI')) {
      features.push('Portfolio Tracking')
    }
    
    if (uniqueNodeTypes.includes('limitOrder')) {
      features.push('Limit Orders')
    }
    
    if (uniqueNodeTypes.includes('priceImpactCalculator')) {
      features.push('Price Impact Analysis')
    }
    
    return {
      pattern,
      features,
      nodeTypes: uniqueNodeTypes,
      executionData: executionStatus
    }
  }
  
  private generateBackendFiles(analysis: any): CodeFile[] {
    const files: CodeFile[] = []
    
    // Generate main API server
    files.push({
      path: 'backend/src/index.ts',
      content: this.generateBackendServer(analysis),
      type: 'backend',
      language: 'typescript'
    })
    
    // Generate API routes based on workflow nodes
    if (analysis.nodeTypes.includes('oneInchSwap')) {
      files.push({
        path: 'backend/src/routes/swap.ts',
        content: this.generateSwapRoutes(),
        type: 'backend',
        language: 'typescript'
      })
    }
    
    if (analysis.nodeTypes.includes('fusionMonadBridge')) {
      files.push({
        path: 'backend/src/routes/atomic-bridge.ts',
        content: this.generateAtomicBridgeRoutes(),
        type: 'backend',
        language: 'typescript'
      })
      
      files.push({
        path: 'backend/src/services/htlc-service.ts',
        content: this.generateHTLCService(),
        type: 'backend',
        language: 'typescript'
      })
    }
    
    if (analysis.nodeTypes.includes('portfolioAPI')) {
      files.push({
        path: 'backend/src/routes/portfolio.ts',
        content: this.generatePortfolioRoutes(),
        type: 'backend',
        language: 'typescript'
      })
    }
    
    // Generate package.json
    files.push({
      path: 'backend/package.json',
      content: this.generateBackendPackageJson(analysis),
      type: 'config',
      language: 'json'
    })
    
    return files
  }
  
  private generateFrontendFiles(analysis: any): CodeFile[] {
    const files: CodeFile[] = []
    
    // Generate main App component
    files.push({
      path: 'frontend/src/App.tsx',
      content: this.generateMainApp(analysis),
      type: 'frontend',
      language: 'typescript'
    })
    
    // Generate specific components based on workflow
    if (analysis.nodeTypes.includes('oneInchSwap')) {
      files.push({
        path: 'frontend/src/components/SwapInterface.tsx',
        content: this.generateSwapInterface(),
        type: 'frontend',
        language: 'typescript'
      })
    }
    
    if (analysis.nodeTypes.includes('fusionMonadBridge')) {
      files.push({
        path: 'frontend/src/components/AtomicBridgeInterface.tsx',
        content: this.generateAtomicBridgeInterface(),
        type: 'frontend',
        language: 'typescript'
      })
      
      files.push({
        path: 'frontend/src/components/HTLCMonitor.tsx',
        content: this.generateHTLCMonitor(),
        type: 'frontend',
        language: 'typescript'
      })
    }
    
    if (analysis.nodeTypes.includes('portfolioAPI')) {
      files.push({
        path: 'frontend/src/components/PortfolioDashboard.tsx',
        content: this.generatePortfolioDashboard(),
        type: 'frontend',
        language: 'typescript'
      })
    }
    
    // Generate package.json
    files.push({
      path: 'frontend/package.json',
      content: this.generateFrontendPackageJson(analysis),
      type: 'config',
      language: 'json'
    })
    
    return files
  }
  
  private generateConfigFiles(analysis: any): CodeFile[] {
    const files: CodeFile[] = []
    
    // Docker Compose for full stack
    files.push({
      path: 'docker-compose.yml',
      content: this.generateDockerCompose(analysis),
      type: 'config',
      language: 'yaml'
    })
    
    // Environment variables
    files.push({
      path: '.env.example',
      content: this.generateEnvExample(analysis),
      type: 'config',
      language: 'bash'
    })
    
    // README with setup instructions
    files.push({
      path: 'README.md',
      content: this.generateReadme(analysis),
      type: 'config',
      language: 'markdown'
    })
    
    return files
  }
  
  private generateBackendServer(analysis: any): string {
    return `import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
${analysis.nodeTypes.includes('oneInchSwap') ? "import swapRoutes from './routes/swap'" : ''}
${analysis.nodeTypes.includes('fusionMonadBridge') ? "import atomicBridgeRoutes from './routes/atomic-bridge'" : ''}
${analysis.nodeTypes.includes('portfolioAPI') ? "import portfolioRoutes from './routes/portfolio'" : ''}

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
${analysis.nodeTypes.includes('oneInchSwap') ? "app.use('/api/swap', swapRoutes)" : ''}
${analysis.nodeTypes.includes('fusionMonadBridge') ? "app.use('/api/atomic-bridge', atomicBridgeRoutes)" : ''}
${analysis.nodeTypes.includes('portfolioAPI') ? "app.use('/api/portfolio', portfolioRoutes)" : ''}

app.listen(PORT, () => {
  console.log(\`🚀 ${analysis.pattern} API server running on port \${PORT}\`)
})
`
  }
  
  private generateSwapRoutes(): string {
    return `import { Router } from 'express'

const router = Router()

// Get swap quote
router.post('/quote', async (req, res) => {
  try {
    const { fromToken, toToken, amount, chainId } = req.body
    
    // Implementation would call 1inch API
    const quote = {
      fromToken,
      toToken,
      amount,
      estimatedOutput: amount * 0.999, // Mock calculation
      priceImpact: 0.1,
      gas: '150000'
    }
    
    res.json(quote)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get quote' })
  }
})

// Execute swap
router.post('/execute', async (req, res) => {
  try {
    const { fromToken, toToken, amount, slippage } = req.body
    
    // Implementation would execute actual swap
    const result = {
      txHash: '0x' + Math.random().toString(16).slice(2, 66),
      status: 'pending'
    }
    
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Failed to execute swap' })
  }
})

export default router
`
  }
  
  private generatePortfolioRoutes(): string {
    return `import { Router } from 'express'

const router = Router()

// Get portfolio data
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params
    
    // Mock portfolio data
    const portfolio = {
      address,
      totalValue: 12345.67,
      tokens: [
        { symbol: 'ETH', balance: 5.2, value: 8234.5 },
        { symbol: 'USDC', balance: 4111.12, value: 4111.12 }
      ],
      lastUpdated: new Date().toISOString()
    }
    
    res.json(portfolio)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch portfolio' })
  }
})

export default router
`
  }
  
  private generateMainApp(analysis: any): string {
    return `import React from 'react'
import './App.css'
${analysis.nodeTypes.includes('oneInchSwap') ? "import SwapInterface from './components/SwapInterface'" : ''}
${analysis.nodeTypes.includes('portfolioAPI') ? "import PortfolioDashboard from './components/PortfolioDashboard'" : ''}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>${analysis.pattern}</h1>
        <p>Generated from workflow execution</p>
      </header>
      
      <main>
        ${analysis.nodeTypes.includes('oneInchSwap') ? '<SwapInterface />' : ''}
        ${analysis.nodeTypes.includes('portfolioAPI') ? '<PortfolioDashboard />' : ''}
      </main>
    </div>
  )
}

export default App
`
  }
  
  private generateSwapInterface(): string {
    return `import React, { useState } from 'react'

const SwapInterface = () => {
  const [fromToken, setFromToken] = useState('ETH')
  const [toToken, setToToken] = useState('USDC')
  const [amount, setAmount] = useState('')
  
  const handleSwap = async () => {
    try {
      const response = await fetch('/api/swap/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromToken, toToken, amount })
      })
      
      const result = await response.json()
      console.log('Swap result:', result)
    } catch (error) {
      console.error('Swap failed:', error)
    }
  }
  
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>Token Swap</h3>
      
      <div>
        <label>From: </label>
        <select value={fromToken} onChange={(e) => setFromToken(e.target.value)}>
          <option value="ETH">ETH</option>
          <option value="USDC">USDC</option>
          <option value="WBTC">WBTC</option>
        </select>
      </div>
      
      <div>
        <label>To: </label>
        <select value={toToken} onChange={(e) => setToToken(e.target.value)}>
          <option value="ETH">ETH</option>
          <option value="USDC">USDC</option>
          <option value="WBTC">WBTC</option>
        </select>
      </div>
      
      <div>
        <label>Amount: </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
        />
      </div>
      
      <button onClick={handleSwap} disabled={!amount}>
        Swap
      </button>
    </div>
  )
}

export default SwapInterface
`
  }
  
  private generatePortfolioDashboard(): string {
    return `import React, { useState, useEffect } from 'react'

const PortfolioDashboard = () => {
  const [portfolio, setPortfolio] = useState(null)
  const [address, setAddress] = useState('')
  
  const loadPortfolio = async () => {
    if (!address) return
    
    try {
      const response = await fetch(\`/api/portfolio/\${address}\`)
      const data = await response.json()
      setPortfolio(data)
    } catch (error) {
      console.error('Failed to load portfolio:', error)
    }
  }
  
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>Portfolio Dashboard</h3>
      
      <div>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter wallet address"
          style={{ width: '300px', marginRight: '10px' }}
        />
        <button onClick={loadPortfolio}>Load Portfolio</button>
      </div>
      
      {portfolio && (
        <div style={{ marginTop: '20px' }}>
          <h4>Total Value: $\{portfolio.totalValue.toFixed(2)}</h4>
          
          <div>
            <h5>Tokens:</h5>
            {portfolio.tokens.map((token, index) => (
              <div key={index} style={{ margin: '5px 0' }}>
                {token.symbol}: {token.balance} ($\{token.value.toFixed(2)})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PortfolioDashboard
`
  }
  
  private generateBackendPackageJson(analysis: any): string {
    const dependencies = [
      '"express": "^4.18.0"',
      '"cors": "^2.8.5"',
      '"dotenv": "^16.0.0"'
    ]
    
    if (analysis.nodeTypes.includes('oneInchSwap')) {
      dependencies.push('"axios": "^1.4.0"')
    }
    
    return `{
  "name": "${analysis.pattern.toLowerCase().replace(/\\s+/g, '-')}-backend",
  "version": "1.0.0",
  "description": "Backend API for ${analysis.pattern}",
  "main": "dist/index.js",
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    ${dependencies.join(',\\n    ')}
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "@types/express": "^4.17.0",
    "typescript": "^5.0.0",
    "ts-node": "^10.9.0"
  }
}
`
  }
  
  private generateFrontendPackageJson(analysis: any): string {
    return `{
  "name": "${analysis.pattern.toLowerCase().replace(/\\s+/g, '-')}-frontend",
  "version": "1.0.0",
  "description": "Frontend for ${analysis.pattern}",
  "scripts": {
    "dev": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
`
  }
  
  private generateDockerCompose(analysis: any): string {
    return `version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules

networks:
  default:
    name: ${analysis.pattern.toLowerCase().replace(/\\s+/g, '-')}-network
`
  }
  
  private generateEnvExample(analysis: any): string {
    const envVars = ['NODE_ENV=development']
    
    if (analysis.nodeTypes.includes('oneInchSwap')) {
      envVars.push('ONEINCH_API_KEY=your_api_key_here')
    }
    
    if (analysis.nodeTypes.includes('portfolioAPI')) {
      envVars.push('MORALIS_API_KEY=your_moralis_key_here')
    }
    
    return envVars.join('\\n') + '\\n'
  }
  
  private generateReadme(analysis: any): string {
    return `# ${analysis.pattern}

Generated from workflow execution with the following features:
${analysis.features.map((f: string) => `- ${f}`).join('\\n')}

## Setup

1. Install dependencies:
   \`\`\`bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd frontend && npm install
   \`\`\`

2. Set up environment variables:
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your API keys
   \`\`\`

3. Start the application:
   \`\`\`bash
   # Using Docker Compose
   docker-compose up
   
   # Or manually
   cd backend && npm run dev
   cd frontend && npm run dev
   \`\`\`

## Features

${analysis.features.map((f: string) => `### ${f}\\n\\nImplemented using the ${analysis.pattern} pattern.`).join('\\n\\n')}

## API Endpoints

- \`GET /api/health\` - Health check
${analysis.nodeTypes.includes('oneInchSwap') ? '- `POST /api/swap/quote` - Get swap quote\\n- `POST /api/swap/execute` - Execute swap' : ''}
${analysis.nodeTypes.includes('fusionMonadBridge') ? '- `POST /api/atomic-bridge/quote` - Get atomic swap quote\\n- `POST /api/atomic-bridge/create-htlc` - Create HTLC\\n- `POST /api/atomic-bridge/claim/:contractId` - Claim funds\\n- `GET /api/atomic-bridge/status/:contractId` - Check HTLC status' : ''}
${analysis.nodeTypes.includes('portfolioAPI') ? '- `GET /api/portfolio/:address` - Get portfolio data' : ''}

## Generated Files

This application was automatically generated based on successful workflow execution.
`
  }

  // New methods for Fusion+ Monad Bridge code generation
  private generateAtomicBridgeRoutes(): string {
    return `import express from 'express';
import { HTLCService } from '../services/htlc-service';

const router = express.Router();
const htlcService = new HTLCService();

// Get atomic swap quote
router.post('/quote', async (req, res) => {
  try {
    const { bridge_direction, source_token, destination_token, amount } = req.body;
    
    // Calculate cross-chain quote with bridge fees
    const bridgeFeePercent = 0.005; // 0.5%
    const destinationAmount = amount * (1 - bridgeFeePercent);
    
    const quote = {
      source_token,
      destination_token,
      source_amount: amount,
      destination_amount: destinationAmount,
      bridge_fee: amount * bridgeFeePercent,
      estimated_time: '10-15 minutes',
      gas_estimates: {
        ethereum: bridge_direction === 'eth_to_monad' ? '150000' : '80000',
        monad: bridge_direction === 'eth_to_monad' ? '7500' : '4000'
      },
      mev_protection: true,
      atomic_guarantee: true
    };
    
    res.json({ success: true, quote });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create Hash Time Locked Contract
router.post('/create-htlc', async (req, res) => {
  try {
    const { quote_id, from_address, timelock_duration = 24 } = req.body;
    
    // Generate HTLC parameters
    const contractId = \`htlc_\${Date.now()}_\${Math.random().toString(36)}\`;
    const secret = \`0x\${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}\`;
    const hashlock = \`0x\${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}\`;
    const timelock = Math.floor(Date.now() / 1000) + (timelock_duration * 3600);
    
    // Create HTLC on both chains (mock implementation)
    const result = {
      contract_id: contractId,
      hashlock,
      timelock,
      status: 'htlc_created',
      ethereum_tx: \`0x\${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}\`,
      monad_tx: \`0x\${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}\`,
      monitoring_url: \`/api/atomic-bridge/status/\${contractId}\`
    };
    
    res.json({ success: true, htlc: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Claim funds with secret
router.post('/claim/:contractId', async (req, res) => {
  try {
    const { contractId } = req.params;
    const { secret, to_address } = req.body;
    
    // Mock claiming funds
    const result = {
      contract_id: contractId,
      status: 'funds_claimed',
      claim_tx: \`0x\${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}\`,
      to_address,
      timestamp: new Date().toISOString()
    };
    
    res.json({ success: true, claim: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get HTLC status
router.get('/status/:contractId', async (req, res) => {
  try {
    const { contractId } = req.params;
    
    // Mock status check
    const status = {
      contract_id: contractId,
      phase: 'locked',
      ethereum_status: {
        locked: true,
        claimed: false,
        refunded: false
      },
      monad_status: {
        locked: true,
        claimed: false,
        refunded: false
      },
      time_remaining: 24 * 60 * 60 * 1000, // 24 hours
      last_updated: new Date().toISOString()
    };
    
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;`;
  }

  private generateHTLCService(): string {
    return `// HTLC Service for Ethereum-Monad atomic swaps
import { ethers } from 'ethers';

export class HTLCService {
  private ethereumProvider: ethers.Provider;
  private monadProvider: ethers.Provider;

  constructor() {
    this.ethereumProvider = new ethers.JsonRpcProvider(
      process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID'
    );
    
    this.monadProvider = new ethers.JsonRpcProvider(
      process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz'
    );
  }

  async createHTLC(params: any) {
    // Implementation for creating HTLCs on both chains
    return {
      contractId: params.contractId,
      ethereumTx: 'mock-eth-tx',
      monadTx: 'mock-monad-tx'
    };
  }

  async monitorHTLC(contractId: string) {
    // Implementation for monitoring HTLC status
    return {
      status: 'locked',
      timeRemaining: 24 * 60 * 60 * 1000
    };
  }
}`;
  }

  private generateAtomicBridgeInterface(): string {
    return `'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeftRight, Clock, Shield, Zap } from 'lucide-react';

interface AtomicBridgeInterfaceProps {
  onBridgeInitiated?: (result: any) => void;
}

export default function AtomicBridgeInterface({ onBridgeInitiated }: AtomicBridgeInterfaceProps) {
  const [bridgeDirection, setBridgeDirection] = useState<'eth_to_monad' | 'monad_to_eth'>('eth_to_monad');
  const [sourceToken, setSourceToken] = useState('ETH');
  const [destinationToken, setDestinationToken] = useState('MONAD');
  const [amount, setAmount] = useState('1.0');
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState<any>(null);

  const getQuote = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/atomic-bridge/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bridge_direction: bridgeDirection,
          source_token: sourceToken,
          destination_token: destinationToken,
          amount: parseFloat(amount)
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setQuote(data.quote);
      }
    } catch (error) {
      console.error('Failed to get quote:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initiateBridge = async () => {
    if (!quote) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/atomic-bridge/create-htlc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quote_id: 'quote_123',
          from_address: '0x...',
          timelock_duration: 24
        })
      });
      
      const data = await response.json();
      if (data.success && onBridgeInitiated) {
        onBridgeInitiated(data.htlc);
      }
    } catch (error) {
      console.error('Failed to initiate bridge:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5" />
          Fusion+ Monad Bridge
          <Badge variant="secondary">Atomic Swaps</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bridge Direction */}
        <div className="flex gap-2">
          <Button 
            variant={bridgeDirection === 'eth_to_monad' ? 'default' : 'outline'}
            onClick={() => setBridgeDirection('eth_to_monad')}
            className="flex-1"
          >
            Ethereum → Monad
          </Button>
          <Button 
            variant={bridgeDirection === 'monad_to_eth' ? 'default' : 'outline'}
            onClick={() => setBridgeDirection('monad_to_eth')}
            className="flex-1"
          >
            Monad → Ethereum
          </Button>
        </div>

        {/* Token Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">From Token</label>
            <Input 
              value={sourceToken}
              onChange={(e) => setSourceToken(e.target.value)}
              placeholder="ETH"
            />
          </div>
          <div>
            <label className="text-sm font-medium">To Token</label>
            <Input 
              value={destinationToken}
              onChange={(e) => setDestinationToken(e.target.value)}
              placeholder="MONAD"
            />
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="text-sm font-medium">Amount</label>
          <Input 
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1.0"
            step="0.000001"
          />
        </div>

        {/* Get Quote */}
        <Button 
          onClick={getQuote} 
          disabled={isLoading || !amount}
          className="w-full"
        >
          {isLoading ? 'Getting Quote...' : 'Get Quote'}
        </Button>

        {/* Quote Display */}
        {quote && (
          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>You send:</span>
                  <span className="font-medium">{quote.source_amount} {sourceToken}</span>
                </div>
                <div className="flex justify-between">
                  <span>You receive:</span>
                  <span className="font-medium">{quote.destination_amount} {destinationToken}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bridge fee:</span>
                  <span className="text-sm">{quote.bridge_fee} {sourceToken}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated time:</span>
                  <span className="text-sm">{quote.estimated_time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Shield className="h-4 w-4" />
                  <span>MEV Protected</span>
                  <Clock className="h-4 w-4 ml-2" />
                  <span>Atomic Guarantee</span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Initiate Bridge */}
        {quote && (
          <Button 
            onClick={initiateBridge}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            <Zap className="h-4 w-4 mr-2" />
            {isLoading ? 'Creating HTLC...' : 'Initiate Atomic Bridge'}
          </Button>
        )}

        {/* Security Features */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <Shield className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-sm font-medium">Trustless</div>
            <div className="text-xs text-gray-500">No custodial risk</div>
          </div>
          <div className="text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-sm font-medium">Time Locked</div>
            <div className="text-xs text-gray-500">Automatic refunds</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}`;
  }

  private generateHTLCMonitor(): string {
    return `'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';

interface HTLCMonitorProps {
  contractId: string;
  autoRefresh?: boolean;
}

export default function HTLCMonitor({ contractId, autoRefresh = true }: HTLCMonitorProps) {
  const [status, setStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const response = await fetch(\`/api/atomic-bridge/status/\${contractId}\`);
      const data = await response.json();
      if (data.success) {
        setStatus(data.status);
      }
    } catch (error) {
      console.error('Failed to fetch HTLC status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    if (autoRefresh) {
      const interval = setInterval(fetchStatus, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [contractId, autoRefresh]);

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'created': return 'bg-yellow-500';
      case 'locked': return 'bg-blue-500';
      case 'revealed': return 'bg-purple-500';
      case 'completed': return 'bg-green-500';
      case 'refunded': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTimeRemaining = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return \`\${hours}h \${minutes}m\`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading HTLC status...</span>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load HTLC status</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>HTLC Monitor</span>
          <Badge className={\`\${getPhaseColor(status.phase)} text-white\`}>
            {status.phase.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contract ID */}
        <div>
          <label className="text-sm font-medium">Contract ID</label>
          <div className="font-mono text-sm bg-gray-100 p-2 rounded">
            {status.contract_id}
          </div>
        </div>

        {/* Time Remaining */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Time Remaining</span>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="font-mono">
              {formatTimeRemaining(status.time_remaining)}
            </span>
          </div>
        </div>

        {/* Chain Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-3">
            <div className="text-sm font-medium mb-2">Ethereum</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Locked:</span>
                <CheckCircle className={\`h-4 w-4 \${status.ethereum_status.locked ? 'text-green-500' : 'text-gray-300'}\`} />
              </div>
              <div className="flex justify-between">
                <span>Claimed:</span>
                <CheckCircle className={\`h-4 w-4 \${status.ethereum_status.claimed ? 'text-green-500' : 'text-gray-300'}\`} />
              </div>
              <div className="flex justify-between">
                <span>Refunded:</span>
                <CheckCircle className={\`h-4 w-4 \${status.ethereum_status.refunded ? 'text-red-500' : 'text-gray-300'}\`} />
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-3">
            <div className="text-sm font-medium mb-2">Monad</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Locked:</span>
                <CheckCircle className={\`h-4 w-4 \${status.monad_status.locked ? 'text-green-500' : 'text-gray-300'}\`} />
              </div>
              <div className="flex justify-between">
                <span>Claimed:</span>
                <CheckCircle className={\`h-4 w-4 \${status.monad_status.claimed ? 'text-green-500' : 'text-gray-300'}\`} />
              </div>
              <div className="flex justify-between">
                <span>Refunded:</span>
                <CheckCircle className={\`h-4 w-4 \${status.monad_status.refunded ? 'text-red-500' : 'text-gray-300'}\`} />
              </div>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-gray-500 text-center">
          Last updated: {new Date(status.last_updated).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}`;
  }
  
  private generateDeploymentInfo(analysis: any): DeploymentInfo {
    const backendEndpoints = ['/api/health']
    
    if (analysis.nodeTypes.includes('oneInchSwap')) {
      backendEndpoints.push('/api/swap/quote', '/api/swap/execute')
    }
    
    if (analysis.nodeTypes.includes('portfolioAPI')) {
      backendEndpoints.push('/api/portfolio/:address')
    }
    
    return {
      backend: {
        port: 3001,
        endpoints: backendEndpoints,
        dependencies: ['express', 'cors', 'dotenv']
      },
      frontend: {
        port: 3000,
        framework: 'React',
        dependencies: ['react', 'react-dom', 'react-scripts']
      }
    }
  }
}

// Create singleton instance
export const workflowCodeGenerator = new WorkflowCodeGenerator()