"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Wallet, 
  Coins, 
  TrendingUp, 
  Zap, 
  Activity, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  ArrowRight,
  Play,
  Square,
  RefreshCw
} from "lucide-react"
import { getTemplateById } from "@/lib/templates"
import { FlowCanvas } from "@/components/flow-canvas"

interface NodeExecutionStatus {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  logs: string[]
  executionTime?: number
  outputs?: Record<string, any>
}

export default function SwapAggregatorDemo() {
  const [isExecuting, setIsExecuting] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [nodeStatuses, setNodeStatuses] = useState<NodeExecutionStatus[]>([])
  const [overallProgress, setOverallProgress] = useState(0)
  const [demoResults, setDemoResults] = useState<any>(null)

  const template = getTemplateById("dex-aggregator-swap")

  const nodeSequence = [
    { id: "wallet-connector-1", name: "Wallet Connection", icon: Wallet },
    { id: "token-selector-1", name: "Token Selector", icon: Coins },
    { id: "oneinch-quote-1", name: "1inch Quote Engine", icon: TrendingUp },
    { id: "price-impact-1", name: "Price Impact Analysis", icon: TrendingUp },
    { id: "oneinch-swap-1", name: "1inch Swap Executor", icon: Zap },
    { id: "transaction-monitor-1", name: "Transaction Monitor", icon: Activity }
  ]

  useEffect(() => {
    // Initialize node statuses
    const initialStatuses = nodeSequence.map(node => ({
      id: node.id,
      name: node.name,
      status: 'pending' as const,
      progress: 0,
      logs: []
    }))
    setNodeStatuses(initialStatuses)
  }, [])

  const simulateNodeExecution = async (nodeIndex: number): Promise<any> => {
    const node = nodeSequence[nodeIndex]
    
    // Update status to running
    setNodeStatuses(prev => prev.map(n => 
      n.id === node.id ? { ...n, status: 'running', logs: [...n.logs, `Starting ${node.name}...`] } : n
    ))

    // Simulate execution with progress updates
    for (let progress = 0; progress <= 100; progress += 20) {
      await new Promise(resolve => setTimeout(resolve, 300))
      setNodeStatuses(prev => prev.map(n => 
        n.id === node.id ? { ...n, progress } : n
      ))
    }

    // Simulate specific node logic
    let outputs: any = {}
    let logs: string[] = [`Starting ${node.name}...`]

    switch (node.id) {
      case "wallet-connector-1":
        outputs = {
          walletAddress: "0x742d35Cc6bD2A3D4532123456789A44B62F10D",
          chainId: "1",
          balance: "2.5 ETH",
          provider: "MetaMask"
        }
        logs.push("✅ Connected to MetaMask wallet")
        logs.push(`Wallet address: ${outputs.walletAddress}`)
        logs.push(`Current balance: ${outputs.balance}`)
        break

      case "token-selector-1":
        outputs = {
          fromToken: {
            symbol: "ETH",
            address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            decimals: 18,
            price: 3247.82
          },
          toToken: {
            symbol: "USDC",
            address: "0xA0b86a33E6441fb3cD7b2a9da94C2b48A8aE5fF0",
            decimals: 6,
            price: 1.00
          },
          amount: "1.0"
        }
        logs.push("✅ Selected tokens: ETH → USDC")
        logs.push(`Amount: ${outputs.amount} ETH`)
        logs.push(`ETH Price: $${outputs.fromToken.price}`)
        break

      case "oneinch-quote-1":
        outputs = {
          dstAmount: "3240.15",
          expectedReturn: "3240.15 USDC",
          protocols: ["Uniswap V3", "Curve", "Balancer"],
          gasEstimate: "180000",
          pathfinder: true
        }
        logs.push("✅ Quote received from 1inch Pathfinder")
        logs.push(`Expected return: ${outputs.expectedReturn}`)
        logs.push(`Gas estimate: ${outputs.gasEstimate}`)
        logs.push(`Protocols used: ${outputs.protocols.join(", ")}`)
        break

      case "price-impact-1":
        outputs = {
          priceImpact: 0.23,
          warningLevel: "low",
          recommendation: "Trade appears safe to execute",
          impactUSD: 7.45,
          gasEfficiency: 95
        }
        logs.push("✅ Price impact analysis completed")
        logs.push(`Price impact: ${outputs.priceImpact}%`)
        logs.push(`Warning level: ${outputs.warningLevel}`)
        logs.push(`Impact in USD: $${outputs.impactUSD}`)
        break

      case "oneinch-swap-1":
        outputs = {
          transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          status: "submitted",
          gasPrice: "20 Gwei",
          mevProtection: true
        }
        logs.push("✅ Swap transaction submitted")
        logs.push(`Transaction hash: ${outputs.transactionHash}`)
        logs.push(`MEV protection: ${outputs.mevProtection ? 'Enabled' : 'Disabled'}`)
        break

      case "transaction-monitor-1":
        outputs = {
          status: "confirmed",
          confirmations: 1,
          gasUsed: "165432",
          blockNumber: 18952847,
          executionTime: 45000,
          finalAmount: "3240.15 USDC"
        }
        logs.push("✅ Transaction confirmed!")
        logs.push(`Block number: ${outputs.blockNumber}`)
        logs.push(`Gas used: ${outputs.gasUsed}`)
        logs.push(`Final amount received: ${outputs.finalAmount}`)
        break
    }

    // Update to completed
    setNodeStatuses(prev => prev.map(n => 
      n.id === node.id ? { 
        ...n, 
        status: 'completed', 
        progress: 100, 
        logs,
        outputs,
        executionTime: Math.floor(Math.random() * 5000) + 1000
      } : n
    ))

    return outputs
  }

  const executeWorkflow = async () => {
    setIsExecuting(true)
    setCurrentStep(0)
    setOverallProgress(0)
    
    const results: any = {}

    for (let i = 0; i < nodeSequence.length; i++) {
      setCurrentStep(i)
      
      try {
        const result = await simulateNodeExecution(i)
        results[nodeSequence[i].id] = result
        
        // Update overall progress
        const progress = ((i + 1) / nodeSequence.length) * 100
        setOverallProgress(progress)
        
        // Small delay between nodes
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        console.error(`Error executing node ${nodeSequence[i].name}:`, error)
        setNodeStatuses(prev => prev.map(n => 
          n.id === nodeSequence[i].id ? { 
            ...n, 
            status: 'failed', 
            logs: [...n.logs, `❌ Error: ${error}`] 
          } : n
        ))
        break
      }
    }

    setDemoResults(results)
    setIsExecuting(false)
  }

  const resetDemo = () => {
    setIsExecuting(false)
    setCurrentStep(0)
    setOverallProgress(0)
    setDemoResults(null)
    const resetStatuses = nodeSequence.map(node => ({
      id: node.id,
      name: node.name,
      status: 'pending' as const,
      progress: 0,
      logs: []
    }))
    setNodeStatuses(resetStatuses)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'running': return <Clock className="w-4 h-4 text-blue-500 animate-spin" />
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-500" />
      default: return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            DEX Aggregator Swap Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience a complete DeFi swap workflow with wallet connection, token selection, 
            1inch integration, price impact analysis, and real-time transaction monitoring.
          </p>
        </div>

        {/* Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Workflow Execution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={executeWorkflow} 
                disabled={isExecuting}
                className="flex items-center gap-2"
              >
                {isExecuting ? (
                  <>
                    <Square className="w-4 h-4" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Execute Swap Flow
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={resetDemo}
                disabled={isExecuting}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reset Demo
              </Button>
            </div>
            
            {isExecuting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Node Execution Status */}
          <Card>
            <CardHeader>
              <CardTitle>Node Execution Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {nodeSequence.map((node, index) => {
                    const status = nodeStatuses.find(s => s.id === node.id)
                    const Icon = node.icon
                    
                    return (
                      <div key={node.id} className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-gray-600" />
                          <span className="font-medium">{node.name}</span>
                          {getStatusIcon(status?.status || 'pending')}
                          {status?.executionTime && (
                            <Badge variant="secondary">
                              {status.executionTime}ms
                            </Badge>
                          )}
                        </div>
                        
                        {status?.status === 'running' && (
                          <Progress value={status.progress} className="h-1" />
                        )}
                        
                        {status?.logs && status.logs.length > 0 && (
                          <div className="ml-8 space-y-1">
                            {status.logs.map((log, logIndex) => (
                              <div key={logIndex} className="text-sm text-gray-600 fonts-mono">
                                {log}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {index < nodeSequence.length - 1 && (
                          <div className="ml-2.5">
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Execution Results</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {demoResults ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h3 className="font-semibold text-green-800 mb-2">✅ Swap Completed Successfully!</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">From:</span>
                          <div className="font-medium">1.0 ETH</div>
                        </div>
                        <div>
                          <span className="text-gray-600">To:</span>
                          <div className="font-medium">3,240.15 USDC</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Price Impact:</span>
                          <div className="font-medium">0.23%</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Gas Used:</span>
                          <div className="font-medium">165,432</div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">Detailed Results:</h4>
                      {Object.entries(demoResults).map(([nodeId, result]: [string, any]) => {
                        const node = nodeSequence.find(n => n.id === nodeId)
                        return (
                          <div key={nodeId} className="p-3 bg-gray-50 rounded-lg">
                            <h5 className="font-medium text-sm">{node?.name}</h5>
                            <pre className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">
                              {JSON.stringify(result, null, 2)}
                            </pre>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Execute the workflow to see results</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Flow Visualization */}
        {template && (
          <Card>
            <CardHeader>
              <CardTitle>Flow Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 border rounded-lg">
                <FlowCanvas projectId="demo-swap-aggregator" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}