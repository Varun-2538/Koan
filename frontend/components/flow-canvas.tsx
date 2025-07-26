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
import { Save, Play } from "lucide-react"
import { getTemplateById } from "@/lib/templates"
import { CodeGenerator, type CodeGenerationResult } from "@/lib/code-generator"
import { CodePreviewModal } from "./code-preview-modal"

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

  // Load template data if project is created from template
  useEffect(() => {
    const loadTemplateFlow = () => {
      // Check if this is a template-based project
      if (projectId.startsWith('template-') && !templateLoaded) {
        // In a real app, you'd fetch this from your database
        // For demo, we'll check if it's the swap template
        const template = getTemplateById('basic-swap-app')
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
      // New DeFi/Swap node defaults
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
              nodeTypes={nodeTypes}
              connectionMode={ConnectionMode.Loose}
              fitView
              className="bg-gray-50"
            >
              <Controls />
              <MiniMap />
              <Background variant="dots" gap={12} size={1} />

              <Panel position="top-left">
                <FlowToolbar projectId={projectId} />
              </Panel>

              <Panel position="top-right">
                <div className="flex gap-2">
                  <Button onClick={saveFlow} disabled={saving} size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Save"}
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
