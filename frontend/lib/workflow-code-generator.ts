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
  projectName?: string
  framework?: string
  features?: string[]
  dependencies?: {
    dependencies: Record<string, string>
    devDependencies: Record<string, string>
  }
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
      generatedAt: timestamp,
      projectName: workflowName,
      framework: "Next.js 14 + TypeScript",
      features: analysis.features,
      dependencies: {
        dependencies: {
          "next": "14.0.4",
          "react": "^18.2.0",
          "react-dom": "^18.2.0",
          "@tanstack/react-query": "^5.8.4",
          "ethers": "^6.8.1",
          "wagmi": "^2.0.8",
          "@rainbow-me/rainbowkit": "^2.0.0",
          "tailwindcss": "^3.3.6",
          "lucide-react": "^0.294.0"
        },
        devDependencies: {
          "@types/node": "^20.9.0",
          "@types/react": "^18.2.37",
          "@types/react-dom": "^18.2.15",
          "typescript": "^5.2.2",
          "autoprefixer": "^10.4.16",
          "postcss": "^8.4.31"
        }
      }
    }
  }

  /**
   * Generate application from visual workflow nodes (without execution)
   */
  async generateFromNodes(
    nodes: any[],
    edges: any[],
    projectName: string = 'Custom DeFi App',
    options: {
      framework?: string
      generateAPI?: boolean
      generateUI?: boolean
      generateTests?: boolean
    } = {}
  ): Promise<CodeGenerationResult> {
    
    const timestamp = new Date().toISOString()
    const appId = `app-${Date.now()}`
    
    // Analyze nodes to determine application structure
    const analysis = this.analyzeNodesConfiguration(nodes, edges)
    
    // Generate code files
    const files: CodeFile[] = []
    
    if (options.generateAPI !== false) {
      files.push(...this.generateBackendFiles(analysis))
    }
    
    if (options.generateUI !== false) {
      files.push(...this.generateFrontendFiles(analysis))
    }
    
    // Generate configuration files
    files.push(...this.generateConfigFiles(analysis))
    
    // Generate deployment info
    const deploymentInfo = this.generateDeploymentInfo(analysis)
    
    return {
      id: appId,
      name: projectName,
      description: `Generated application based on custom workflow with ${analysis.nodeTypes.length} nodes`,
      files,
      deploymentInfo,
      generatedAt: timestamp,
      projectName,
      framework: options.framework || "Next.js 14 + TypeScript",
      features: analysis.features,
      dependencies: {
        dependencies: {
          "next": "14.0.4",
          "react": "^18.2.0",
          "react-dom": "^18.2.0",
          "@tanstack/react-query": "^5.8.4",
          "ethers": "^6.8.1",
          "wagmi": "^2.0.8",
          "@rainbow-me/rainbowkit": "^2.0.0",
          "tailwindcss": "^3.3.6",
          "lucide-react": "^0.294.0"
        },
        devDependencies: {
          "@types/node": "^20.9.0",
          "@types/react": "^18.2.37",
          "@types/react-dom": "^18.2.15",
          "typescript": "^5.2.2",
          "autoprefixer": "^10.4.16",
          "postcss": "^8.4.31"
        }
      }
    }
  }

  /**
   * Analyze nodes configuration to determine application structure
   */
  private analyzeNodesConfiguration(nodes: any[], edges: any[]) {
    const nodeTypes = nodes.map(node => node.type)
    const uniqueNodeTypes = [...new Set(nodeTypes)]
    
    // Determine application pattern based on node types
    let pattern = 'Custom DeFi Application'
    let features: string[] = []
    
    if (uniqueNodeTypes.includes('oneInchSwap') || uniqueNodeTypes.includes('fusionSwap')) {
      pattern = 'DEX Aggregator'
      features.push('Token Swapping')
    }
    
    if (uniqueNodeTypes.includes('fusionPlus') || uniqueNodeTypes.includes('fusionMonadBridge')) {
      pattern = 'Cross-Chain Bridge'
      features.push('Cross-Chain Transfers')
      if (uniqueNodeTypes.includes('fusionMonadBridge')) {
        features.push('Ethereum ↔ Monad Bridge')
      }
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
    
    if (uniqueNodeTypes.includes('walletConnector')) {
      features.push('Wallet Integration')
    }
    
    if (uniqueNodeTypes.includes('tokenSelector')) {
      features.push('Token Selection')
    }
    
    if (uniqueNodeTypes.includes('chainSelector')) {
      features.push('Multi-Chain Support')
    }
    
    if (uniqueNodeTypes.includes('transactionMonitor')) {
      features.push('Transaction Monitoring')
    }
    
    if (uniqueNodeTypes.includes('defiDashboard')) {
      features.push('DeFi Analytics Dashboard')
    }
    
    // If no specific pattern detected, use a comprehensive approach
    if (features.length === 0) {
      features.push('Custom Workflow Integration')
    }
    
    return {
      pattern,
      features,
      nodeTypes: uniqueNodeTypes,
      nodes,
      edges,
      nodeCount: nodes.length,
      edgeCount: edges.length
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
    
    if (analysis.nodeTypes.includes('portfolioAPI')) {
      files.push({
        path: 'backend/src/routes/portfolio.ts',
        content: this.generatePortfolioRoutes(),
        type: 'backend',
        language: 'typescript'
      })
    }
    
    if (analysis.nodeTypes.includes('fusionMonadBridge')) {
      files.push({
        path: 'backend/src/routes/bridge.ts',
        content: this.generateBridgeRoutes(),
        type: 'backend',
        language: 'typescript'
      })
    }
    
    if (analysis.nodeTypes.includes('transactionMonitor')) {
      files.push({
        path: 'backend/src/routes/monitor.ts',
        content: this.generateMonitorRoutes(),
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
    
    if (analysis.nodeTypes.includes('portfolioAPI')) {
      files.push({
        path: 'frontend/src/components/PortfolioDashboard.tsx',
        content: this.generatePortfolioDashboard(),
        type: 'frontend',
        language: 'typescript'
      })
    }
    
    if (analysis.nodeTypes.includes('fusionMonadBridge')) {
      files.push({
        path: 'frontend/src/components/BridgeInterface.tsx',
        content: this.generateBridgeInterface(),
        type: 'frontend',
        language: 'typescript'
      })
    }
    
    if (analysis.nodeTypes.includes('transactionMonitor')) {
      files.push({
        path: 'frontend/src/components/TransactionMonitor.tsx',
        content: this.generateTransactionMonitorComponent(),
        type: 'frontend',
        language: 'typescript'
      })
    }
    
    if (analysis.nodeTypes.includes('walletConnector')) {
      files.push({
        path: 'frontend/src/components/WalletConnector.tsx',
        content: this.generateWalletConnectorComponent(),
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
${analysis.nodeTypes.includes('portfolioAPI') ? "import portfolioRoutes from './routes/portfolio'" : ''}
${analysis.nodeTypes.includes('fusionMonadBridge') ? "import bridgeRoutes from './routes/bridge'" : ''}
${analysis.nodeTypes.includes('transactionMonitor') ? "import monitorRoutes from './routes/monitor'" : ''}

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
${analysis.nodeTypes.includes('portfolioAPI') ? "app.use('/api/portfolio', portfolioRoutes)" : ''}
${analysis.nodeTypes.includes('fusionMonadBridge') ? "app.use('/api/bridge', bridgeRoutes)" : ''}
${analysis.nodeTypes.includes('transactionMonitor') ? "app.use('/api/monitor', monitorRoutes)" : ''}

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
  
  private generateBridgeRoutes(): string {
    return `import { Router } from 'express'

const router = Router()

// Get bridge quote for cross-chain transfer
router.post('/quote', async (req, res) => {
  try {
    const { fromChain, toChain, fromToken, toToken, amount } = req.body
    
    // Mock bridge quote
    const quote = {
      fromChain,
      toChain,
      fromToken,
      toToken,
      amount,
      estimatedOutput: amount * 0.995, // Bridge fee
      estimatedTime: '10-15 minutes',
      bridgeFee: amount * 0.005,
      gasEstimate: '250000'
    }
    
    res.json(quote)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get bridge quote' })
  }
})

// Execute cross-chain bridge
router.post('/execute', async (req, res) => {
  try {
    const { fromChain, toChain, fromToken, toToken, amount, recipientAddress } = req.body
    
    // Implementation would execute actual bridge
    const result = {
      bridgeId: 'bridge-' + Math.random().toString(36).slice(2, 10),
      sourceTxHash: '0x' + Math.random().toString(16).slice(2, 66),
      status: 'pending',
      estimatedCompletion: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    }
    
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Failed to execute bridge' })
  }
})

// Check bridge status
router.get('/status/:bridgeId', async (req, res) => {
  try {
    const { bridgeId } = req.params
    
    // Mock bridge status
    const status = {
      bridgeId,
      status: 'completed',
      sourceTxHash: '0x' + Math.random().toString(16).slice(2, 66),
      destinationTxHash: '0x' + Math.random().toString(16).slice(2, 66),
      completedAt: new Date().toISOString()
    }
    
    res.json(status)
  } catch (error) {
    res.status(500).json({ error: 'Failed to check bridge status' })
  }
})

export default router
`
  }
  
  private generateMonitorRoutes(): string {
    return `import { Router } from 'express'

const router = Router()

// Get transaction status
router.get('/tx/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params
    
    // Mock transaction data
    const transaction = {
      hash: txHash,
      status: 'confirmed',
      blockNumber: 18500000 + Math.floor(Math.random() * 1000),
      confirmations: 12,
      gasUsed: '150000',
      timestamp: new Date().toISOString()
    }
    
    res.json(transaction)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transaction' })
  }
})

// Monitor wallet activity
router.get('/wallet/:address', async (req, res) => {
  try {
    const { address } = req.params
    
    // Mock wallet monitoring data
    const activity = {
      address,
      recentTransactions: [
        {
          hash: '0x' + Math.random().toString(16).slice(2, 66),
          type: 'swap',
          timestamp: new Date().toISOString(),
          status: 'confirmed'
        },
        {
          hash: '0x' + Math.random().toString(16).slice(2, 66),
          type: 'bridge',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          status: 'confirmed'
        }
      ],
      pendingTransactions: [],
      lastUpdate: new Date().toISOString()
    }
    
    res.json(activity)
  } catch (error) {
    res.status(500).json({ error: 'Failed to monitor wallet' })
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
${analysis.nodeTypes.includes('fusionMonadBridge') ? "import BridgeInterface from './components/BridgeInterface'" : ''}
${analysis.nodeTypes.includes('transactionMonitor') ? "import TransactionMonitor from './components/TransactionMonitor'" : ''}
${analysis.nodeTypes.includes('walletConnector') ? "import WalletConnector from './components/WalletConnector'" : ''}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>${analysis.pattern}</h1>
        <p>Generated from workflow execution</p>
      </header>
      
      <main>
        ${analysis.nodeTypes.includes('walletConnector') ? '<WalletConnector />' : ''}
        ${analysis.nodeTypes.includes('oneInchSwap') ? '<SwapInterface />' : ''}
        ${analysis.nodeTypes.includes('fusionMonadBridge') ? '<BridgeInterface />' : ''}
        ${analysis.nodeTypes.includes('portfolioAPI') ? '<PortfolioDashboard />' : ''}
        ${analysis.nodeTypes.includes('transactionMonitor') ? '<TransactionMonitor />' : ''}
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
  
  private generateBridgeInterface(): string {
    return `import React, { useState } from 'react'

const BridgeInterface = () => {
  const [fromChain, setFromChain] = useState('Ethereum')
  const [toChain, setToChain] = useState('Monad')
  const [fromToken, setFromToken] = useState('ETH')
  const [toToken, setToToken] = useState('MONAD')
  const [amount, setAmount] = useState('')
  const [quote, setQuote] = useState(null)
  
  const handleGetQuote = async () => {
    try {
      const response = await fetch('/api/bridge/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromChain, toChain, fromToken, toToken, amount })
      })
      
      const quoteData = await response.json()
      setQuote(quoteData)
    } catch (error) {
      console.error('Quote failed:', error)
    }
  }
  
  const handleBridge = async () => {
    try {
      const response = await fetch('/api/bridge/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fromChain, 
          toChain, 
          fromToken, 
          toToken, 
          amount,
          recipientAddress: '0x...' // Would be from wallet
        })
      })
      
      const result = await response.json()
      console.log('Bridge result:', result)
    } catch (error) {
      console.error('Bridge failed:', error)
    }
  }
  
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', margin: '10px' }}>
      <h3>Cross-Chain Bridge</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h4>From</h4>
          <select value={fromChain} onChange={(e) => setFromChain(e.target.value)}>
            <option value="Ethereum">Ethereum</option>
            <option value="Polygon">Polygon</option>
            <option value="BSC">BSC</option>
          </select>
          <select value={fromToken} onChange={(e) => setFromToken(e.target.value)}>
            <option value="ETH">ETH</option>
            <option value="USDC">USDC</option>
            <option value="WBTC">WBTC</option>
          </select>
        </div>
        
        <div>
          <h4>To</h4>
          <select value={toChain} onChange={(e) => setToChain(e.target.value)}>
            <option value="Monad">Monad</option>
            <option value="Arbitrum">Arbitrum</option>
            <option value="Optimism">Optimism</option>
          </select>
          <select value={toToken} onChange={(e) => setToToken(e.target.value)}>
            <option value="MONAD">MONAD</option>
            <option value="USDC">USDC</option>
            <option value="WETH">WETH</option>
          </select>
        </div>
      </div>
      
      <div style={{ margin: '20px 0' }}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount to bridge"
          style={{ width: '200px', marginRight: '10px' }}
        />
        <button onClick={handleGetQuote} disabled={!amount}>
          Get Quote
        </button>
      </div>
      
      {quote && (
        <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
          <h4>Bridge Quote</h4>
          <p>You will receive: {quote.estimatedOutput} {toToken}</p>
          <p>Bridge fee: {quote.bridgeFee} {fromToken}</p>
          <p>Estimated time: {quote.estimatedTime}</p>
          <button onClick={handleBridge} style={{ marginTop: '10px' }}>
            Execute Bridge
          </button>
        </div>
      )}
    </div>
  )
}

export default BridgeInterface
`
  }
  
  private generateTransactionMonitorComponent(): string {
    return `import React, { useState, useEffect } from 'react'

const TransactionMonitor = () => {
  const [txHash, setTxHash] = useState('')
  const [txData, setTxData] = useState(null)
  const [walletAddress, setWalletAddress] = useState('')
  const [walletActivity, setWalletActivity] = useState(null)
  
  const monitorTransaction = async () => {
    if (!txHash) return
    
    try {
      const response = await fetch(\`/api/monitor/tx/\${txHash}\`)
      const data = await response.json()
      setTxData(data)
    } catch (error) {
      console.error('Failed to monitor transaction:', error)
    }
  }
  
  const monitorWallet = async () => {
    if (!walletAddress) return
    
    try {
      const response = await fetch(\`/api/monitor/wallet/\${walletAddress}\`)
      const data = await response.json()
      setWalletActivity(data)
    } catch (error) {
      console.error('Failed to monitor wallet:', error)
    }
  }
  
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', margin: '10px' }}>
      <h3>Transaction Monitor</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Monitor Transaction</h4>
        <input
          type="text"
          value={txHash}
          onChange={(e) => setTxHash(e.target.value)}
          placeholder="Enter transaction hash"
          style={{ width: '400px', marginRight: '10px' }}
        />
        <button onClick={monitorTransaction}>Monitor</button>
        
        {txData && (
          <div style={{ marginTop: '10px', backgroundColor: '#f5f5f5', padding: '10px' }}>
            <p><strong>Status:</strong> {txData.status}</p>
            <p><strong>Block:</strong> {txData.blockNumber}</p>
            <p><strong>Confirmations:</strong> {txData.confirmations}</p>
            <p><strong>Gas Used:</strong> {txData.gasUsed}</p>
          </div>
        )}
      </div>
      
      <div>
        <h4>Monitor Wallet Activity</h4>
        <input
          type="text"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          placeholder="Enter wallet address"
          style={{ width: '400px', marginRight: '10px' }}
        />
        <button onClick={monitorWallet}>Monitor</button>
        
        {walletActivity && (
          <div style={{ marginTop: '10px', backgroundColor: '#f5f5f5', padding: '10px' }}>
            <h5>Recent Transactions:</h5>
            {walletActivity.recentTransactions.map((tx, index) => (
              <div key={index} style={{ margin: '5px 0', padding: '5px', border: '1px solid #ddd' }}>
                <p><strong>Type:</strong> {tx.type}</p>
                <p><strong>Status:</strong> {tx.status}</p>
                <p><strong>Hash:</strong> {tx.hash.slice(0, 10)}...</p>
                <p><strong>Time:</strong> {new Date(tx.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionMonitor
`
  }
  
  private generateWalletConnectorComponent(): string {
    return `import React, { useState, useEffect } from 'react'

const WalletConnector = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState('')
  const [balance, setBalance] = useState('')
  const [network, setNetwork] = useState('')
  
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        setAccount(accounts[0])
        setIsConnected(true)
        
        // Get balance
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [accounts[0], 'latest']
        })
        setBalance((parseInt(balance, 16) / 1e18).toFixed(4))
        
        // Get network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' })
        setNetwork(chainId === '0x1' ? 'Ethereum' : \`Chain \${chainId}\`)
      } else {
        alert('Please install MetaMask!')
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }
  
  const disconnectWallet = () => {
    setIsConnected(false)
    setAccount('')
    setBalance('')
    setNetwork('')
  }
  
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', margin: '10px' }}>
      <h3>Wallet Connection</h3>
      
      {!isConnected ? (
        <button onClick={connectWallet} style={{ padding: '10px 20px', fontSize: '16px' }}>
          Connect Wallet
        </button>
      ) : (
        <div>
          <div style={{ backgroundColor: '#e8f5e8', padding: '15px', borderRadius: '5px' }}>
            <p><strong>Connected Account:</strong> {account}</p>
            <p><strong>Balance:</strong> {balance} ETH</p>
            <p><strong>Network:</strong> {network}</p>
            <button onClick={disconnectWallet} style={{ marginTop: '10px' }}>
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default WalletConnector
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
${analysis.nodeTypes.includes('portfolioAPI') ? '- `GET /api/portfolio/:address` - Get portfolio data' : ''}

## Generated Files

This application was automatically generated based on successful workflow execution.
`
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