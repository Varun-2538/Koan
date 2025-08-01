"use client"

import type React from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import {
  ReactFlow,
  type Node,
  type Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  ReactFlowProvider,
  Controls,
  Background,
  MiniMap,
  Panel,
  type NodeTypes,
  ConnectionMode,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { ComponentPalette } from "./component-palette"
import { NodeConfigPanel } from "./node-config-panel"
import { FlowToolbar } from "./flow-toolbar"
import { CustomNodes } from "./custom-nodes"
import { Button } from "@/components/ui/button"
import { Save, Play, Zap, Trash2 } from "lucide-react"
import { getTemplateById } from "@/lib/templates"
import { CodeGenerator, type CodeGenerationResult } from "@/lib/code-generator"
import { CodePreviewModal } from "./code-preview-modal"
import { executionClient, type WorkflowDefinition } from "@/lib/execution-client"

const nodeTypes: NodeTypes = CustomNodes

interface FlowCanvasProps {
  projectId: string
}

const initialNodes: Node[] = [
  {
    id: "demo-token-1",
    type: "erc20Token",
    position: { x: 100, y: 100 },
    data: {
      label: "Demo Token",
      config: {
        name: "DemoToken",
        symbol: "DEMO",
        totalSupply: "1000000",
        decimals: "18",
      },
    },
  },
  {
    id: "demo-dashboard-1",
    type: "dashboard",
    position: { x: 400, y: 100 },
    data: {
      label: "Token Dashboard",
      config: {
        title: "Token Dashboard",
        components: ["header", "charts", "tables"],
      },
    },
  },
]

const initialEdges: Edge[] = []

export function FlowCanvas({ projectId }: FlowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [templateLoaded, setTemplateLoaded] = useState(false)
  const [codeResult, setCodeResult] = useState<CodeGenerationResult | null>(null)
  const [showCodeModal, setShowCodeModal] = useState(false)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
  
  // Execution engine state
  const [executing, setExecuting] = useState(false)
  const [executionStatus, setExecutionStatus] = useState<string>("")
  const [executionResult, setExecutionResult] = useState<any>(null)
  const [executionError, setExecutionError] = useState<string | null>(null)

  // Load template data if project is created from template
  useEffect(() => {
    const loadTemplateFlow = () => {
              // Check if this is a template-based project
        if (projectId.startsWith('template-') && !templateLoaded) {
          // In a real app, you'd fetch this from your database
          // For demo, we'll check if it's the swap template
          const template = getTemplateById('dex-aggregator-swap')
          if (template) {
            setNodes(template.nodes)
            setEdges(template.edges)
            setTemplateLoaded(true)
        }
      }
    }

    loadTemplateFlow()
  }, [projectId, setNodes, setEdges, templateLoaded])

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  // Handle node deletion with keyboard
  const onNodesDelete = useCallback((deletedNodes: Node[]) => {
    // Close config panel if deleted node was selected
    const deletedNodeIds = deletedNodes.map(node => node.id)
    if (selectedNode && deletedNodeIds.includes(selectedNode.id)) {
      setSelectedNode(null)
    }
  }, [selectedNode])

  // Handle keyboard events for deletion
  const onKeyDown = useCallback((event: KeyboardEvent) => {
    if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNode) {
      event.preventDefault()
      setNodes((nodes) => nodes.filter((node) => node.id !== selectedNode.id))
      setEdges((edges) => edges.filter((edge) => 
        edge.source !== selectedNode.id && edge.target !== selectedNode.id
      ))
      setSelectedNode(null)
    }
  }, [selectedNode, setNodes, setEdges])

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onKeyDown])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData("application/reactflow")
      if (typeof type === "undefined" || !type) {
        return
      }

      const position = reactFlowInstance?.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: {
          label: type.charAt(0).toUpperCase() + type.slice(1),
          config: getDefaultConfig(type),
        },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [reactFlowInstance, setNodes],
  )

  const getDefaultConfig = (type: string) => {
    switch (type) {
      // 1inch and Trading Nodes
      case "oneInchSwap":
        return {
          apiKey: "",
          enableMEVProtection: true,
          useFusion: false,
          gasOptimization: "balanced"
        }
      case "oneInchQuote":
        return {
          apiKey: "",
          slippage: 1,
          includeGas: true,
          includeProtocols: true,
          enablePathfinder: true,
          gasOptimization: "balanced"
        }
      case "fusionPlus":
        return {
          api_key: "",
          supported_chains: ["1", "137"],
          default_bridge_pairs: [
            { 
              from: { chain: "1", token: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", symbol: "ETH" },
              to: { chain: "137", token: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", symbol: "WETH" },
              label: "ETH → Polygon WETH"
            }
          ],
          enable_mev_protection: true,
          enable_gasless: true,
          default_timeout: 30,
          ui_config: {
            theme: "modern",
            showBridgeStatus: true,
            showEstimatedTime: true,
            showFees: true,
            enableChainSelector: true,
            showAdvancedOptions: false
          },
          rate_limits: {
            requests_per_minute: 30,
            requests_per_hour: 500,
            enable_caching: true,
            cache_duration: 300
          }
        }
      case "orderType":
        return {
          orderType: "limit",
          supportedTypes: ["limit", "stop-loss", "trailing-stop", "p2p-swap"],
          allowMultipleOrders: true
        }
      case "priceTrigger":
        return {
          triggerPrice: "3000",
          triggerType: "above",
          percentageChange: "5",
          useMarketPrice: false
        }

      // Chain and Bridge Nodes
      case "chainSelector":
        return {
          supported_chains: ["1", "137"],
          default_chain: "1",
          enable_testnet: false,
          ui_config: {
            theme: "modern",
            showChainLogos: true,
            showNetworkStatus: true,
            enableQuickSwitch: true,
            showGasPrice: false
          },
          rpc_endpoints: {}
        }
      case "sourceChain":
        return {
          chain: "ethereum",
          supportedChains: ["ethereum", "polygon", "bnb", "arbitrum", "optimism"]
        }
      case "destinationChain":
        return {
          chain: "polygon",
          supportedChains: ["ethereum", "polygon", "bnb", "arbitrum", "optimism", "solana"]
        }

      // DeFi Core Nodes
      case "tokenSelector":
        return {
          defaultFromToken: "ETH",
          defaultToToken: "USDC",
          enabledTokens: ["ETH", "USDC", "WBTC", "USDT", "DAI", "1INCH"],
          includeMetadata: true,
          priceSource: "1inch"
        }
      case "priceImpactCalculator":
        return {
          warningThreshold: 3,
          maxImpactThreshold: 15,
          includeSlippage: true,
          detailedAnalysis: true
        }
      case "transactionMonitor":
        return {
          confirmationsRequired: 1,
          timeoutMinutes: 30,
          enableAlerts: true,
          includeGasTracking: true,
          enableMEVDetection: true
        }
      case "tokenInput":
        return {
          fromToken: "ETH",
          toToken: "USDC",
          amount: "1.0",
          supportedTokens: ["ETH", "USDC", "USDT", "DAI", "WBTC", "1INCH"]
        }
      case "slippageControl":
        return {
          slippage: 1.0,
          minSlippage: 0.1,
          maxSlippage: 5.0,
          autoSlippage: true
        }
      case "transactionStatus":
        return {
          showPendingState: true,
          enableNotifications: true,
          trackGasUsed: true
        }

      // Yield and Farming Nodes
      case "yieldOptimizer":
        return {
          optimizationStrategy: "highest-apy",
          riskTolerance: "medium",
          autoCompound: true,
          rebalanceThreshold: 0.5
        }
      case "portfolioTracker":
        return {
          trackStakedAssets: true,
          showEarnedRewards: true,
          calculateTotalValue: true,
          enablePnLTracking: true
        }

      // Governance Nodes
      case "governanceResults":
        return {
          showVotingResults: true,
          enableAutoExecution: true,
          trackProposalStatus: true,
          notifyOnExecution: true
        }

      // Existing nodes
      case "erc20Token":
        return {
          name: "MyToken",
          symbol: "MTK",
          totalSupply: "1000000",
          decimals: "18",
        }
      case "governance":
        return {
          votingDelay: "1",
          votingPeriod: "7",
          proposalThreshold: "1000",
        }
      case "dashboard":
        return {
          title: "Dashboard",
          components: ["header", "sidebar", "main"],
        }
      case "apiEndpoint":
        return {
          method: "GET",
          path: "/api/data",
          authentication: false,
        }
      case "aiAgent":
        return {
          type: "decision-making",
          model: "gpt-3.5-turbo",
          prompt: "You are a helpful assistant",
        }
      // Legacy DeFi node defaults
      case "uniswapV3Router":
        return {
          routerAddress: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
          network: "ethereum",
          slippageTolerance: "0.5",
          deadline: "20"
        }
      case "chainlinkOracle":
        return {
          priceFeedAddresses: {
            "ETH/USD": "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
            "USDC/USD": "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6"
          },
          updateInterval: "30"
        }
      case "swapInterface":
        return {
          title: "Token Swap",
          defaultTokens: ["ETH", "USDC", "USDT", "DAI"],
          showAdvancedSettings: true,
          theme: "modern"
        }
      case "walletConnector":
        return {
          supportedWallets: ["MetaMask", "WalletConnect", "Coinbase Wallet"],
          autoConnect: true,
          networkChainId: "1"
        }
      case "swapInterface":
        return {
          title: "DEX Aggregator Swap",
          showAdvancedSettings: true,
          theme: "modern",
          enablePriceChart: true,
          showPriceImpact: true,
          enableTransactionHistory: true
        }
      case "fusionSwap":
        return {
          apiKey: "",
          enableGaslessSwaps: true,
          auctionDuration: "auto",
          enableMEVProtection: true
        }
      case "limitOrder":
        return {
          apiKey: "",
          orderType: "limit",
          enableAdvancedStrategies: true
        }
      case "portfolioAPI":
        return {
          apiKey: "",
          trackHistory: true,
          enableAnalytics: true
        }
      case "defiDashboard":
        return {
          title: "1inch-Powered DeFi Suite",
          enableMultiSwap: true,
          showPortfolio: true,
          enableLimitOrders: true,
          showAnalytics: true,
          theme: "1inch-branded"
        }
      case "transactionHistory":
        return {
          maxTransactions: "50",
          showPendingTx: true,
          enableFiltering: true
        }
      case "swapAPI":
        return {
          endpoints: ["/api/swap/quote", "/api/swap/execute", "/api/tokens/list", "/api/user/history"],
          rateLimit: "100",
          authentication: false
        }
      case "tokenDataService":
        return {
          dataProviders: ["CoinGecko", "CoinMarketCap"],
          cacheDuration: "300",
          supportedNetworks: ["ethereum", "polygon", "arbitrum"]
        }
      default:
        return {}
    }
  }

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const updateNodeConfig = useCallback(
    (nodeId: string, config: any) => {
      setNodes((nds) => nds.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, config } } : node)))
    },
    [setNodes],
  )

  const saveFlow = async () => {
    setSaving(true)
    // Simulate saving delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log("Flow saved:", { projectId, nodes, edges })
    setSaving(false)
  }

  const generateCode = async () => {
    setGenerating(true)
    try {
      // Use the actual code generator
      const projectName = isTemplateProject ? "MySwap" : "MyDApp"
      const result = CodeGenerator.generateFromFlow(nodes, edges, projectName)
      
      // Show the code preview modal
      setCodeResult(result)
      setShowCodeModal(true)
      
    } catch (error) {
      console.error("Error generating code:", error)
      alert("❌ Error generating code. Please check the console for details.")
    }
    setGenerating(false)
  }

  const executeFlow = async () => {
    setExecuting(true)
    setExecutionStatus("Starting execution...")
    setExecutionError(null)
    setExecutionResult(null)

    try {
      // Convert React Flow nodes/edges to workflow definition
      const workflow: WorkflowDefinition = {
        id: `workflow-${projectId}-${Date.now()}`,
        name: `Flow Execution - ${projectId}`,
        description: "Executing DeFi workflow from visual canvas",
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type || 'default',
          position: node.position,
          data: {
            label: node.data?.label || node.type || 'Node',
            config: node.data?.config || {}
          }
        })),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle
        }))
      }

      // Set up execution event listeners
      executionClient.on('execution.started', (data) => {
        setExecutionStatus(`Execution started: ${data.executionId}`)
        console.log('🚀 Execution started:', data)
      })

      executionClient.on('node.started', (data) => {
        setExecutionStatus(`Executing node: ${data.nodeId}`)
        console.log('⚡ Node started:', data)
      })

      executionClient.on('node.completed', (data) => {
        setExecutionStatus(`Node completed: ${data.nodeId}`)
        console.log('✅ Node completed:', data)
      })

      executionClient.on('execution.completed', (data) => {
        setExecutionStatus("Execution completed successfully!")
        setExecutionResult(data)
        console.log('🎉 Execution completed:', data)
      })

      executionClient.on('execution.failed', (data) => {
        setExecutionStatus("Execution failed")
        setExecutionError(data.error || 'Unknown error')
        console.error('❌ Execution failed:', data)
      })

      // Execute the workflow
      const executionId = await executionClient.executeWorkflow(workflow)
      console.log('📊 Workflow execution initiated:', executionId)

    } catch (error) {
      console.error('❌ Execution error:', error)
      setExecutionStatus("Execution failed")
      setExecutionError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setExecuting(false)
    }
  }

  const isTemplateProject = projectId.startsWith('template-')

  return (
    <div className="h-screen flex">
      <ComponentPalette />

      <div className="flex-1 relative">
        <ReactFlowProvider>
          <div className="h-full" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              onNodesDelete={onNodesDelete}
              nodeTypes={nodeTypes}
              connectionMode={ConnectionMode.Loose}
              fitView
              className="bg-gray-50"
            >
              <Controls />
              <MiniMap />
              <Background gap={12} size={1} />

              <Panel position="top-left">
                <FlowToolbar projectId={projectId} />
              </Panel>

              {/* Instructions Panel */}
              <Panel position="bottom-left">
                <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-sm shadow-sm">
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="font-medium text-gray-800 mb-2">💡 Quick Tips:</div>
                    <div>• Click a node to select it</div>
                    <div>• Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Delete</kbd> or <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Backspace</kbd> to delete</div>
                    <div>• Use the <span className="text-red-600">Delete Node</span> button</div>
                    <div>• Click empty space to deselect</div>
                  </div>
                </div>
              </Panel>

              <Panel position="top-right">
                <div className="flex gap-2">
                  {selectedNode && (
                    <Button 
                      onClick={() => {
                        setNodes((nodes) => nodes.filter((node) => node.id !== selectedNode.id))
                        setEdges((edges) => edges.filter((edge) => 
                          edge.source !== selectedNode.id && edge.target !== selectedNode.id
                        ))
                        setSelectedNode(null)
                      }}
                      size="sm"
                      variant="destructive"
                      title="Delete selected node (Delete key)"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Node
                    </Button>
                  )}
                  <Button onClick={saveFlow} disabled={saving} size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button 
                    onClick={executeFlow}
                    disabled={executing || nodes.length === 0} 
                    size="sm"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {executing ? "Executing..." : "Execute Flow"}
                  </Button>
                  <Button 
                    onClick={generateCode} 
                    disabled={generating} 
                    size="sm"
                    className={isTemplateProject ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" : ""}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {generating ? "Generating..." : isTemplateProject ? "Deploy to GitHub" : "Generate Code"}
                  </Button>
                </div>
              </Panel>

              {/* Template Info Panel */}
              {isTemplateProject && templateLoaded && (
                <Panel position="bottom-left">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3 max-w-md">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">💱</span>
                      <span className="font-medium text-blue-900">Basic Swap Application Template</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      This template includes a complete DEX with Uniswap integration, wallet connection, and responsive UI. 
                      Ready to deploy in minutes!
                    </p>
                  </div>
                </Panel>
              )}

              {/* Execution Status Panel */}
              {(executing || executionStatus || executionResult || executionError) && (
                <Panel position="bottom-right">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-md shadow-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">⚡</span>
                      <span className="font-medium text-gray-900">Execution Status</span>
                    </div>
                    
                    {executing && (
                      <div className="text-sm text-blue-600 mb-2">
                        {executionStatus}
                      </div>
                    )}
                    
                    {executionResult && (
                      <div className="text-sm text-green-600 mb-2">
                        ✅ {executionStatus}
                      </div>
                    )}
                    
                    {executionError && (
                      <div className="text-sm text-red-600 mb-2">
                        ❌ {executionError}
                      </div>
                    )}
                    
                    {executionResult && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-600">View Results</summary>
                        <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-32">
                          {JSON.stringify(executionResult, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </Panel>
              )}
            </ReactFlow>
          </div>
        </ReactFlowProvider>
      </div>

      {selectedNode && (
        <NodeConfigPanel
          node={selectedNode}
          onConfigChange={(config) => updateNodeConfig(selectedNode.id, config)}
          onClose={() => setSelectedNode(null)}
        />
      )}

      <CodePreviewModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        result={codeResult}
        projectName={isTemplateProject ? "MySwap" : "MyDApp"}
      />
    </div>
  )
}
