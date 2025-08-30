"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Play, Settings, Zap } from 'lucide-react'
import AvalancheL1Node from '@/components/nodes/avalanche-l1-node'

export default function AvalancheL1DemoPage() {
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle')
  const [deploymentResult, setDeploymentResult] = useState<any>(null)

  const handleDeploy = async () => {
    setIsDeploying(true)
    setDeploymentStatus('deploying')

    try {
      // Simulate deployment process
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Mock successful deployment result
      const result = {
        l1Info: {
          name: 'DemoL1',
          chainId: 12345,
          blockchainId: 'demo-blockchain-id-' + Date.now(),
          rpcUrl: 'http://localhost:9650/ext/bc/demo/rpc',
          wsUrl: 'ws://localhost:9650/ext/bc/demo/ws',
          explorerUrl: 'http://localhost:3000/explorer',
          tokenSymbol: 'DEMO',
          tokenAddress: '0x000000000000000000000000000000000000DEMO',
          controlKey: 'demo-control-key',
          validatorInfo: [
            {
              nodeId: 'NodeID-Demo123',
              stakeAmount: '2000000000000',
              rewardAddress: '0x742d35Cc6bD2A3D4532123456789A44B62F10D'
            }
          ],
          deploymentTimestamp: Date.now(),
          deploymentTx: '0x' + '0'.repeat(64),
          networkConfig: {
            gasLimit: 12000000,
            gasPrice: '25000000000',
            consensus: 'poa'
          },
          status: 'deployed'
        }
      }

      setDeploymentResult(result)
      setDeploymentStatus('success')
    } catch (error) {
      setDeploymentStatus('error')
    } finally {
      setIsDeploying(false)
    }
  }

  const getStatusIcon = () => {
    switch (deploymentStatus) {
      case 'deploying':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Play className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusText = () => {
    switch (deploymentStatus) {
      case 'deploying':
        return 'Deploying L1...'
      case 'success':
        return 'L1 Deployed Successfully!'
      case 'error':
        return 'Deployment Failed'
      default:
        return 'Ready to Deploy'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Avalanche L1 Deployment Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the power of visual L1 deployment with Kōan. Configure, validate, and deploy
            your custom Avalanche subnet with our drag-and-drop interface.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Node Configuration Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  L1 Configuration Node
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AvalancheL1Node
                  id="demo-avalanche-l1"
                  type="avalancheL1Deploy"
                  dragging={false}
                  draggable={true}
                  zIndex={1}
                  selectable={true}
                  deletable={true}
                  isConnectable={true}
                  positionAbsoluteX={0}
                  positionAbsoluteY={0}
                  data={{
                    l1Name: 'DemoL1',
                    chainId: 12345,
                    tokenSymbol: 'DEMO',
                    tokenName: 'Demo Token',
                    initialSupply: '1000000000000000000000000',
                    vmType: 'subnet-evm',
                    consensusMechanism: 'poa',
                    gasLimit: 12000000,
                    gasPriceStrategy: 'constant',
                    feeRecipient: '0x742d35Cc6bD2A3D4532123456789A44B62F10D',
                    feeBurning: false,
                    minBaseFee: '25000000000',
                    allocations: [{
                      address: '0x742d35Cc6bD2A3D4532123456789A44B62F10D',
                      amount: '500000000000000000000000'
                    }],
                    precompiledContracts: {
                      nativeMinter: true,
                      contractDeployerAllowlist: false,
                      transactionAllowlist: false,
                      feeManager: true
                    },
                    adminAddresses: ['0x742d35Cc6bD2A3D4532123456789A44B62F10D'],
                    controlKeyName: 'demo-control-key',
                    validatorStakeAmount: '2000000000000',
                    stakeDuration: '336h',
                    additionalValidators: [],
                    targetNetwork: 'fuji',
                    enableBlockExplorer: true,
                    enableMetrics: false,
                    webhookUrls: []
                  }}
                  selected={true}
                />
              </CardContent>
            </Card>

            {/* Deployment Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Deployment Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon()}
                    <span className="font-medium">{getStatusText()}</span>
                  </div>
                  <Badge variant={deploymentStatus === 'success' ? 'default' : 'secondary'}>
                    {deploymentStatus.toUpperCase()}
                  </Badge>
                </div>

                <Button
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  className="w-full"
                  size="lg"
                >
                  {isDeploying ? 'Deploying...' : 'Deploy L1'}
                </Button>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Estimated deployment time: 3-5 minutes</p>
                  <p>• Cost: ~0.1 AVAX on Fuji testnet</p>
                  <p>• This is a demo - no real deployment occurs</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Deployment Results</CardTitle>
              </CardHeader>
              <CardContent>
                {deploymentResult ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">L1 Name</Label>
                        <p className="text-sm text-gray-600">{deploymentResult.l1Info.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Chain ID</Label>
                        <p className="text-sm text-gray-600">{deploymentResult.l1Info.chainId}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Token Symbol</Label>
                        <p className="text-sm text-gray-600">{deploymentResult.l1Info.tokenSymbol}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <Badge variant="default">{deploymentResult.l1Info.status}</Badge>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">RPC URL</Label>
                      <p className="text-sm text-gray-600 font-mono break-all">
                        {deploymentResult.l1Info.rpcUrl}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Blockchain ID</Label>
                      <p className="text-sm text-gray-600 font-mono break-all">
                        {deploymentResult.l1Info.blockchainId}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Token Address</Label>
                      <p className="text-sm text-gray-600 font-mono break-all">
                        {deploymentResult.l1Info.tokenAddress}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Configure and deploy your L1 to see results here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features Showcase */}
            <Card>
              <CardHeader>
                <CardTitle>✨ Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Visual Configuration</p>
                      <p className="text-sm text-gray-600">Drag-and-drop interface for all L1 parameters</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Real-time Validation</p>
                      <p className="text-sm text-gray-600">Immediate feedback on configuration errors</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Pre-deployment Testing</p>
                      <p className="text-sm text-gray-600">Validate configuration before actual deployment</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Workflow Integration</p>
                      <p className="text-sm text-gray-600">Connect with other DeFi nodes seamlessly</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600">
            Ready to deploy your own L1? Check out the full Kōan platform for production deployments.
          </p>
          <Button className="mt-4" variant="outline">
            Learn More About Kōan
          </Button>
        </div>
      </div>
    </div>
  )
}
