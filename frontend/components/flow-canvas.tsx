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
import { Save, Play, Zap, Trash2, Menu, X } from "lucide-react"
import { getTemplateById } from "@/lib/templates"
import { OneInchCodeGenerator, type CodeGenerationResult as OneInchCodeResult } from "@/lib/oneinch-code-generator"
import { CodePreviewModal } from "./code-preview-modal"
import { GitHubPublishModal } from "./github-publish-modal"
import { LiveDashboardPreview } from "./live-dashboard-preview"
import { EmbeddedPreviewPanel } from "./embedded-preview-panel"
import { FunctionalPreviewPanel } from "./functional-preview-panel"
import { RealTestnetPreview } from "./real-testnet-preview"
import { AIChatbotPanel } from "./ai-chatbot-panel"
import { executionClient } from "@/lib/execution-client"
import { workflowExecutionClient, type ExecutionStatus, type WorkflowDefinition } from "@/lib/workflow-execution-client"
import { workflowCodeGenerator, type CodeGenerationResult } from "@/lib/workflow-code-generator"
import { useIsMobile } from "@/hooks/use-mobile"
import { useToast } from "@/hooks/use-toast"

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
  const [codeResult, setCodeResult] = useState<CodeGenerationResult | OneInchCodeResult | null>(null)
  const [showCodeModal, setShowCodeModal] = useState(false)
  const [showGitHubModal, setShowGitHubModal] = useState(false)
  const [autoConnect, setAutoConnect] = useState(true)
  
  // Mobile responsiveness
  const isMobile = useIsMobile()
  const [showMobilePalette, setShowMobilePalette] = useState(false)
  const { toast } = useToast()

  // Add validation and direct deploy function
  const deployToGitHub = async () => {
    try {
      const result = await generateCodeAndReturn()
      if (result) {
        setCodeResult(result)
        setShowGitHubModal(true)
      } else {
        throw new Error('No code result generated')
      }
    } catch (error) {
      console.error('Failed to generate code for GitHub deployment:', error)
      toast({
        title: 'Code Generation Failed',
        description: 'Please try generating code again before deploying to GitHub.',
        variant: 'destructive',
      })
    }
  }
  const [showLivePreviewModal, setShowLivePreviewModal] = useState(false)
  const [showEmbeddedPreview, setShowEmbeddedPreview] = useState(false)
  const [previewMode, setPreviewMode] = useState<'static' | 'functional' | 'testnet'>('testnet')
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
  
  // Execution engine state
  const [executing, setExecuting] = useState(false)
  const [executionStatus, setExecutionStatus] = useState<string>("")
  const [executionResult, setExecutionResult] = useState<any>(null)
  const [executionError, setExecutionError] = useState<string | null>(null)
  
  // AI Chatbot state
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)
  
  // Workflow execution state
  const [workflowExecutionStatus, setWorkflowExecutionStatus] = useState<ExecutionStatus | null>(null)
  const [nodeExecutionStatuses, setNodeExecutionStatuses] = useState<Record<string, any>>({})

  // Handle workflow generation from AI chatbot
  const handleWorkflowGenerated = useCallback((workflow: any) => {
    console.log('Workflow generated:', workflow)
    // Store the workflow for potential approval
  }, [])

  // Handle workflow approval and canvas generation
  const handleWorkflowApproved = useCallback((workflow: any) => {
    console.log('Workflow approved:', workflow)
    
    // Convert workflow to canvas nodes and edges
    const newNodes: Node[] = []
    const newEdges: Edge[] = []
    
    if (workflow.nodes && Array.isArray(workflow.nodes)) {
      workflow.nodes.forEach((node: any, index: number) => {
        const nodeId = `${node.type}-${index + 1}`
        newNodes.push({
          id: nodeId,
          type: node.type,
          position: { 
            x: 150 + (index % 3) * 250, 
            y: 100 + Math.floor(index / 3) * 150 
          },
          data: {
            label: node.label || node.type,
            config: node.config || {}
          }
        })
        
        // Create edges between consecutive nodes
        if (index > 0) {
          const prevNodeId = `${workflow.nodes[index - 1].type}-${index}`
          newEdges.push({
            id: `${prevNodeId}-${nodeId}`,
            source: prevNodeId,
            target: nodeId
          })
        }
      })
    }
    
    // Clear existing nodes and set new ones
    setNodes(newNodes)
    setEdges(newEdges)
    
    // Close chatbot after successful generation
    setIsChatbotOpen(false)
  }, [setNodes, setEdges])

  // Execute workflow on backend
  const executeWorkflow = useCallback(async () => {
    if (nodes.length === 0) {
      console.warn('No nodes to execute')
      return
    }

    setExecuting(true)
    setExecutionError(null)
    setExecutionStatus("Preparing workflow execution...")

    try {
      // Convert React Flow nodes to workflow definition
      const workflowDefinition: WorkflowDefinition = {
        id: `workflow-${Date.now()}`,
        name: `Canvas Workflow`,
        description: 'Workflow generated from canvas',
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type || 'unknown',
          position: node.position,
          data: {
            label: typeof node.data?.label === 'string' ? node.data.label : (node.type || 'Node'),
            config: node.data?.config || {}
          }
        })),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          ...(edge.sourceHandle && { sourceHandle: edge.sourceHandle }),
          ...(edge.targetHandle && { targetHandle: edge.targetHandle })
        }))
      }

      // Validate workflow
      const validation = workflowExecutionClient.validateWorkflow(workflowDefinition)
      if (!validation.valid) {
        throw new Error(`Workflow validation failed: ${validation.errors.join(', ')}`)
      }

      setExecutionStatus("Starting workflow execution...")
      
      // Execute workflow
      const { executionId } = await workflowExecutionClient.executeWorkflow(workflowDefinition)
      setExecutionStatus(`Execution started: ${executionId}`)

      // Monitor execution progress
      for await (const status of workflowExecutionClient.monitorExecution(executionId)) {
        console.log('Execution status update:', status)
        setWorkflowExecutionStatus(status)
        setNodeExecutionStatuses(status.steps || {})
        
        if (status.status === 'completed') {
          setExecutionStatus("Workflow completed successfully!")
          setExecutionResult(status)
          
          // Automatically generate code after successful execution
          try {
            setExecutionStatus("Generating application code...")
            const codeResult = await generateCodeAndReturn()
            if (codeResult) {
              setCodeResult(codeResult)
            }
            setExecutionStatus("Code generation completed!")
          } catch (codeError) {
            console.error('Code generation failed:', codeError)
            setExecutionStatus("Workflow completed (code generation failed)")
          }
          
          break
        } else if (status.status === 'failed') {
          setExecutionError(status.error || 'Workflow execution failed')
          setExecutionStatus("Workflow execution failed")
          break
        } else {
          const statusText = status.status || 'running'
          setExecutionStatus(`Workflow ${statusText}...`)
        }
      }

    } catch (error) {
      console.error('Workflow execution error:', error)
      setExecutionError(error instanceof Error ? error.message : 'Unknown error')
      setExecutionStatus("Execution failed")
    } finally {
      setExecuting(false)
    }
  }, [nodes, edges])

  // Load template data if project is created from template
  useEffect(() => {
    const loadTemplateFlow = () => {
      // Check if this is a template-based project
      if (projectId.startsWith('template-') && !templateLoaded) {
        // Extract template ID from project ID
        let templateId = projectId.replace('template-', '')
        
        console.log('🎯 Loading template:', templateId, 'from projectId:', projectId)
        
        const template = getTemplateById(templateId)
        if (template) {
          console.log('✅ Template found:', template.name)
          console.log('📊 Loading nodes:', template.nodes.length)
          console.log('🔗 Loading edges:', template.edges.length)
          
          // Load the complete template flow
          setNodes(template.nodes)
          setEdges(template.edges) 
          setTemplateLoaded(true)
          
          // Optional: Focus on the flow after loading
          setTimeout(() => {
            if (reactFlowInstance) {
              reactFlowInstance.fitView({ padding: 0.1 })
            }
          }, 100)
        } else {
          console.warn('❌ Template not found:', templateId)
        }
      }
    }

    loadTemplateFlow()
  }, [projectId, setNodes, setEdges, templateLoaded, reactFlowInstance])

  // Reset template loaded state when projectId changes
  useEffect(() => {
    setTemplateLoaded(false)
    
    // Clear template inputs if switching to a non-template project
    if (!projectId.startsWith('template-')) {
      window.templateInputs = {}
      console.log('🧹 Cleared template inputs for non-template project')
    }
  }, [projectId])

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  // Auto-connection logic for newly dropped nodes
  const createAutoConnections = useCallback((newNode: Node, existingNodes: Node[]) => {
    const connections: Edge[] = []
    
    // Define logical connection patterns
    const connectionRules: Record<string, { canConnectTo: string[], canConnectFrom: string[] }> = {
      // Infrastructure nodes
      walletConnector: {
        canConnectTo: ["tokenSelector", "tokenInput", "chainSelector", "oneInchQuote", "oneInchSwap"],
        canConnectFrom: []
      },
      chainSelector: {
        canConnectTo: ["tokenSelector", "oneInchSwap", "oneInchQuote", "fusionPlus", "fusionMonadBridge"],
        canConnectFrom: ["walletConnector"]
      },
      
      // Input nodes
      tokenSelector: {
        canConnectTo: ["oneInchQuote", "oneInchSwap", "fusionPlus", "fusionMonadBridge", "portfolioAPI"],
        canConnectFrom: ["walletConnector", "chainSelector"]
      },
      tokenInput: {
        canConnectTo: ["oneInchQuote", "slippageControl"],
        canConnectFrom: ["walletConnector"]
      },
      slippageControl: {
        canConnectTo: ["oneInchSwap"],
        canConnectFrom: ["tokenInput", "oneInchQuote"]
      },
      
      // DeFi execution nodes
      oneInchQuote: {
        canConnectTo: ["priceImpactCalculator", "oneInchSwap", "fusionPlus", "slippageControl"],
        canConnectFrom: ["walletConnector", "tokenSelector", "tokenInput", "chainSelector"]
      },
      oneInchSwap: {
        canConnectTo: ["limitOrder", "portfolioAPI", "transactionMonitor", "swapInterface"],
        canConnectFrom: ["oneInchQuote", "priceImpactCalculator", "slippageControl", "chainSelector", "tokenSelector"]
      },
      fusionPlus: {
        canConnectTo: ["limitOrder", "transactionMonitor"],
        canConnectFrom: ["oneInchQuote", "tokenSelector", "chainSelector"]
      },
      fusionMonadBridge: {
        canConnectTo: ["transactionMonitor", "portfolioAPI"],
        canConnectFrom: ["tokenSelector", "chainSelector"]
      },
      
      // Advanced DeFi nodes
      priceImpactCalculator: {
        canConnectTo: ["oneInchSwap"],
        canConnectFrom: ["oneInchQuote"]
      },
      limitOrder: {
        canConnectTo: ["transactionMonitor"],
        canConnectFrom: ["oneInchSwap", "fusionPlus"]
      },
      
      // API and monitoring nodes
      portfolioAPI: {
        canConnectTo: ["defiDashboard", "dashboard"],
        canConnectFrom: ["oneInchSwap", "tokenSelector", "fusionMonadBridge"]
      },
      transactionMonitor: {
        canConnectTo: ["defiDashboard", "dashboard"],
        canConnectFrom: ["oneInchSwap", "limitOrder", "fusionPlus", "fusionMonadBridge"]
      },
      
      // UI nodes
      swapInterface: {
        canConnectTo: [],
        canConnectFrom: ["oneInchSwap"]
      },
      defiDashboard: {
        canConnectTo: [],
        canConnectFrom: ["portfolioAPI", "transactionMonitor"]
      },
      dashboard: {
        canConnectTo: [],
        canConnectFrom: ["portfolioAPI", "transactionMonitor", "oneInchSwap"]
      }
    }

    const newNodeType = newNode.type
    const rules = connectionRules[newNodeType!]
    
    if (!rules) return connections

    // Find best connection candidates
    const candidatesForInput = existingNodes.filter(node => 
      rules.canConnectFrom.includes(node.type!) && 
      !edges.some(edge => edge.source === node.id && edge.target === newNode.id)
    )
    
    const candidatesForOutput = existingNodes.filter(node => 
      rules.canConnectTo.includes(node.type!) && 
      !edges.some(edge => edge.source === newNode.id && edge.target === node.id)
    )

    // Create input connections (nodes that should connect TO this new node)
    if (candidatesForInput.length > 0) {
      // Find the most recent or closest node
      const bestInputCandidate = candidatesForInput.reduce((best, current) => {
        const bestDistance = Math.abs(best.position.x - newNode.position.x) + Math.abs(best.position.y - newNode.position.y)
        const currentDistance = Math.abs(current.position.x - newNode.position.x) + Math.abs(current.position.y - newNode.position.y)
        return currentDistance < bestDistance ? current : best
      })

      connections.push({
        id: `e-${bestInputCandidate.id}-${newNode.id}`,
        source: bestInputCandidate.id,
        target: newNode.id,
        type: "default"
      })
    }

    // Create output connections (nodes this new node should connect TO)
    if (candidatesForOutput.length > 0) {
      // For output connections, prioritize certain types
      const priorityOrder = ["oneInchSwap", "fusionPlus", "fusionMonadBridge", "defiDashboard", "dashboard", "swapInterface"]
      
      let bestOutputCandidate = candidatesForOutput[0]
      for (const priorityType of priorityOrder) {
        const priorityCandidate = candidatesForOutput.find(node => node.type === priorityType)
        if (priorityCandidate) {
          bestOutputCandidate = priorityCandidate
          break
        }
      }

      connections.push({
        id: `e-${newNode.id}-${bestOutputCandidate.id}`,
        source: newNode.id,
        target: bestOutputCandidate.id,
        type: "default"
      })
    }

    return connections
  }, [edges])

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

      // Add the new node
      setNodes((nds) => {
        const updatedNodes = nds.concat(newNode)
        
        // Create auto-connections if enabled and there are existing nodes
        if (autoConnect && nds.length > 0) {
          const autoConnections = createAutoConnections(newNode, nds)
          if (autoConnections.length > 0) {
            // Add connections after a small delay to ensure node is added first
            setTimeout(() => {
              setEdges((eds) => [...eds, ...autoConnections])
            }, 100)
          }
        }
        
        return updatedNodes
      })
    },
    [reactFlowInstance, setNodes, setEdges, createAutoConnections, autoConnect],
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
      case "fusionMonadBridge":
        return {
          api_key: "",
          bridge_direction: "eth_to_monad",
          source_token: "ETH",
          destination_token: "ETH",
          amount: "1.0",
          timelock_duration: 24,
          enable_partial_fills: true,
          enable_mev_protection: true,
          slippage_tolerance: 1,
          gas_optimization: "balanced",
          relayer_config: {
            auto_relay: true,
            timeout_minutes: 30,
            max_retries: 3
          },
          ui_config: {
            theme: "modern",
            show_atomic_status: true,
            show_timelock_countdown: true,
            show_gas_estimates: true,
            enable_advanced_options: false
          }
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

  // Helper function that generates code and returns the result
  const generateCodeAndReturn = async (): Promise<CodeGenerationResult | OneInchCodeResult | null> => {
    const projectName = isTemplateProject ? "My1inchDeFiSuite" : "MyDeFiApp"
    
    if (isTemplateProject) {
      // Always use 1inch code generator for template projects, regardless of execution status
      console.log('🎯 Generating code for template project using OneInchCodeGenerator')
      const result = OneInchCodeGenerator.generateFromWorkflow(
        nodes, 
        edges, 
        projectName,
        { 
          network: "Ethereum",
          hackathonMode: true,
          oneInchApiKey: "template-mode-no-key-needed"
        }
      )
      return result
    } else {
      // For custom workflows: always generate from the current node configuration.
      // If an executed workflow is available, we'll also try generating from execution
      // and pick whichever result has MORE files (to avoid the 7-file regression).

      console.log('🎯 Generating code from current nodes using workflowCodeGenerator.generateFromNodes')
      const nodesResult = await workflowCodeGenerator.generateFromNodes(
        nodes,
        edges,
        projectName,
        {
          framework: "Next.js 14",
          generateAPI: true,
          generateUI: true,
          generateTests: false
        }
      )

      if (workflowExecutionStatus && workflowExecutionStatus.status === 'completed') {
        console.log('🎯 Also generating code from execution using workflowCodeGenerator.generateApplicationFromWorkflow')
        const execResult = await workflowCodeGenerator.generateApplicationFromWorkflow(
          workflowExecutionStatus,
          projectName
        )

        // Choose the result with more files (usually the richer, 26-file version)
        return execResult.files.length > nodesResult.files.length ? execResult : nodesResult
      }

      return nodesResult
    }
  }

  const generateCode = async () => {
    setGenerating(true)
    try {
      const result = await generateCodeAndReturn()
      if (result) {
        setCodeResult(result)
        setShowCodeModal(true)
      } else {
        throw new Error('Failed to generate code')
      }
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
      // Get template inputs from the project configuration
      const templateInputs = window.templateInputs || {} // You need to pass this from template selector
      
      // Log template inputs for debugging
      if (projectId.startsWith('template-')) {
        console.log('🎯 Template inputs for project:', projectId, templateInputs)
        
        // Validate template inputs
        if (!validateTemplateInputs(templateInputs, projectId)) {
          setExecutionError('Missing required template inputs. Please check the console for details.')
          return
        }
      }
      
      // Convert React Flow nodes/edges to workflow definition
      const workflow: WorkflowDefinition = {
        id: `workflow-${projectId}-${Date.now()}`,
        name: `Flow Execution - ${projectId}`,
        description: "Executing DeFi workflow from visual canvas",
        nodes: nodes.map(node => {
          // Prepare config for backend
          const backendConfig: any = node.data?.config ? { ...node.data.config } : {}
          
          // For 1inch nodes, inject the API key from template inputs
          if (node.type === "oneInchSwap" || node.type === "oneInchQuote" || node.type === "portfolioAPI") {
            if (templateInputs.oneInchApiKey) {
              backendConfig.api_key = templateInputs.oneInchApiKey
              backendConfig.oneinch_api_key = templateInputs.oneInchApiKey
              console.log(`🔑 Injected API key for ${node.type} node:`, templateInputs.oneInchApiKey ? 'Present' : 'Missing')
            }
            // Convert frontend apiKey to backend api_key
            if (backendConfig.apiKey) {
              backendConfig.api_key = backendConfig.apiKey
            }
          }
          
          // For template execution, ensure we pass the required fields
          if (projectId.startsWith('template-')) {
            // For oneInchQuote, provide default values if missing
            if (node.type === "oneInchQuote") {
              backendConfig.from_token = backendConfig.from_token || "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
              backendConfig.to_token = backendConfig.to_token || "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
              // Use a smaller default amount for template mode to avoid large transaction amounts
              // Only set default if no amount is provided
              if (!backendConfig.amount) {
                backendConfig.amount = "100000000000000000" // 0.1 ETH instead of 1 ETH
              }
              backendConfig.chain_id = backendConfig.chain_id || "1"
            }
            
            // For oneInchSwap, ensure we use the same amount as the quote
            if (node.type === "oneInchSwap") {
              // Don't override the amount if it's already set (should come from quote)
              backendConfig.from_token = backendConfig.from_token || "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
              backendConfig.to_token = backendConfig.to_token || "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
              backendConfig.chain_id = backendConfig.chain_id || "1"
              // Note: amount should be passed from the quote node, not set as default
              // The backend execution engine will automatically pass the amount from the quote node
              // to the swap node through the collectStepInputs method
            }
          }

          // Convert camelCase to snake_case for wallet connector nodes
          if (node.type === 'walletConnector') {
            if (backendConfig.walletAddress) {
              backendConfig.wallet_address = backendConfig.walletAddress
            }
            if (backendConfig.walletProvider) {
              backendConfig.wallet_provider = backendConfig.walletProvider
            }
            if (backendConfig.supportedWallets) {
              backendConfig.supported_wallets = backendConfig.supportedWallets
            }
            if (backendConfig.supportedNetworks) {
              backendConfig.supported_networks = backendConfig.supportedNetworks
            }
            if (backendConfig.defaultNetwork) {
              backendConfig.default_network = backendConfig.defaultNetwork
            }
            if (backendConfig.autoConnect !== undefined) {
              backendConfig.auto_connect = backendConfig.autoConnect
            }
            if (backendConfig.showBalance !== undefined) {
              backendConfig.show_balance = backendConfig.showBalance
            }
            if (backendConfig.showNetworkSwitcher !== undefined) {
              backendConfig.show_network_switcher = backendConfig.showNetworkSwitcher
            }
          }

          // Convert camelCase to snake_case for transaction monitor nodes
          if (node.type === 'transactionMonitor') {
            if (backendConfig.transactionHash) {
              backendConfig.transaction_hash = backendConfig.transactionHash
            }
            if (backendConfig.transactionData) {
              backendConfig.transaction_data = backendConfig.transactionData
            }
            if (backendConfig.confirmationsRequired !== undefined) {
              backendConfig.confirmations_required = backendConfig.confirmationsRequired
            }
            if (backendConfig.timeoutMinutes !== undefined) {
              backendConfig.timeout_minutes = backendConfig.timeoutMinutes
            }
          }

          // Convert camelCase to snake_case for transaction status nodes
          if (node.type === 'transactionStatus') {
            if (backendConfig.transactionHash) {
              backendConfig.transaction_hash = backendConfig.transactionHash
            }
            if (backendConfig.includeReceipt !== undefined) {
              backendConfig.include_receipt = backendConfig.includeReceipt
            }
            if (backendConfig.waitForConfirmations !== undefined) {
              backendConfig.wait_for_confirmations = backendConfig.waitForConfirmations
            }
          }
          
          // Add template mode flag for execution
          if (projectId.startsWith('template-')) {
            backendConfig.template_creation_mode = true
          }

          // FOR ALL TOKEN SELECTOR NODES, ALSO ADD:
          if (node.type === 'tokenSelector') {
            backendConfig.template_creation_mode = true
            
            // Convert camelCase token fields to snake_case for backend
            if (backendConfig.fromToken) {
              backendConfig.from_token = backendConfig.fromToken
            }
            if (backendConfig.toToken) {
              backendConfig.to_token = backendConfig.toToken
            }
            if (backendConfig.chainId) {
              backendConfig.chain_id = backendConfig.chainId
            }
            if (backendConfig.networkChainId) {
              backendConfig.chain_id = backendConfig.networkChainId
            }
            if (backendConfig.defaultTokens) {
              backendConfig.default_tokens = backendConfig.defaultTokens
            }
            if (backendConfig.enabledTokens) {
              backendConfig.enabled_tokens = backendConfig.enabledTokens
            }
            if (backendConfig.defaultFromToken) {
              backendConfig.default_from_token = backendConfig.defaultFromToken
            }
            if (backendConfig.defaultToToken) {
              backendConfig.default_to_token = backendConfig.defaultToToken
            }
            if (backendConfig.allowCustomTokens !== undefined) {
              backendConfig.allow_custom_tokens = backendConfig.allowCustomTokens
            }
            if (backendConfig.showPopularTokens !== undefined) {
              backendConfig.show_popular_tokens = backendConfig.showPopularTokens
            }
            if (backendConfig.showBalances !== undefined) {
              backendConfig.show_balances = backendConfig.showBalances
            }
            if (backendConfig.priceSource) {
              backendConfig.price_source = backendConfig.priceSource
            }
            if (backendConfig.includeMetadata !== undefined) {
              backendConfig.include_metadata = backendConfig.includeMetadata
            }
          }

          return {
            id: node.id,
            type: node.type || 'default',
            position: node.position,
            data: {
              label: typeof node.data?.label === 'string' ? node.data.label : (node.type || 'Node'),
              config: backendConfig
            }
          }
        }),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          ...(edge.sourceHandle && { sourceHandle: edge.sourceHandle }),
          ...(edge.targetHandle && { targetHandle: edge.targetHandle })
        }))
      }

      console.log('🚀 Executing workflow with nodes:', workflow.nodes.length)
      console.log('📊 Node configurations:')
      workflow.nodes.forEach(node => {
        console.log(`  - ${node.id} (${node.type}):`, {
          hasApiKey: !!node.data.config.api_key || !!node.data.config.apiKey,
          configKeys: Object.keys(node.data.config)
        })
      })

      // Set up execution event listeners
      executionClient.on('execution.started', (data: any) => {
        setExecutionStatus(`Execution started: ${data.executionId}`)
        console.log('🚀 Execution started:', data)
      })

      executionClient.on('node.started', (data: any) => {
        setExecutionStatus(`Executing node: ${data.nodeId}`)
        console.log('⚡ Node started:', data)
      })

      executionClient.on('node.completed', (data: any) => {
        setExecutionStatus(`Node completed: ${data.nodeId}`)
        console.log('✅ Node completed:', data)
      })

      executionClient.on('execution.completed', (data: any) => {
        setExecutionStatus("Execution completed successfully!")
        setExecutionResult(data)
        console.log('🎉 Execution completed:', data)
      })

      executionClient.on('execution.failed', (data: any) => {
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
  
  // Helper function to validate template inputs
  const validateTemplateInputs = (inputs: Record<string, any>, projectId: string) => {
    if (!projectId.startsWith('template-')) return true
    
    const template = getTemplateById(projectId.replace('template-', ''))
    if (!template?.requiredInputs) return true
    
    const missingInputs = template.requiredInputs
      .filter(input => input.required && !inputs[input.key])
      .map(input => input.label)
    
    if (missingInputs.length > 0) {
      console.warn('⚠️ Missing required template inputs:', missingInputs)
      return false
    }
    
    return true
  }

  return (
    <div className="h-screen flex">
      <ComponentPalette />

      <div className="flex-1 relative flex">
        <div className={`${showEmbeddedPreview ? 'flex-1' : 'w-full'} relative`}>
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
                <FlowToolbar 
                  projectId={projectId} 
                  showPreview={showEmbeddedPreview}
                  onTogglePreview={() => setShowEmbeddedPreview(!showEmbeddedPreview)}
                  previewMode={previewMode}
                  onPreviewModeChange={setPreviewMode}
                />
              </Panel>

              {/* Execution Status Panel */}
              <Panel position="bottom-left">
                {executing || executionStatus ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-sm shadow-sm">
                    <div className="font-medium text-gray-800 mb-2">🚀 Execution Status</div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>{executionStatus}</div>
                      {executionError && (
                        <div className="text-red-600 text-xs">Error: {executionError}</div>
                      )}
                      {executing && (
                        <div className="flex items-center gap-2 text-xs">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                          Processing...
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3 max-w-xs sm:max-w-sm shadow-sm">
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="font-medium text-gray-800 mb-2">💡 Quick Tips:</div>
                      <div className="hidden sm:block">• Use AI chatbot to generate workflows</div>
                      <div>• Click a node to select it</div>
                      <div className="hidden sm:block">• Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Delete</kbd> to delete nodes</div>
                      <div className="hidden sm:block">• Execute workflows to generate code</div>
                      <div className="sm:hidden">• Tap nodes to configure</div>
                    </div>
                  </div>
                )}
              </Panel>

              <Panel position="top-right">
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
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
                      className="text-xs"
                    >
                      <Trash2 className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Delete Node</span>
                      <span className="sm:hidden">Delete</span>
                    </Button>
                  )}
                  <Button onClick={saveFlow} disabled={saving} size="sm" className="text-xs">
                    <Save className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{saving ? "Saving..." : "Save"}</span>
                    <span className="sm:hidden">{saving ? "..." : "Save"}</span>
                  </Button>
                  <Button 
                    onClick={executeWorkflow}
                    disabled={executing || nodes.length === 0} 
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white text-xs"
                  >
                    <Zap className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{executing ? "Executing..." : "Execute Flow"}</span>
                    <span className="sm:hidden">{executing ? "..." : "Run"}</span>
                  </Button>
                  <Button 
                    onClick={isTemplateProject ? deployToGitHub : generateCode}
                    disabled={generating} 
                    size="sm"
                    className={`text-xs ${isTemplateProject ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}`}
                  >
                    <Play className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{generating ? "Generating..." : isTemplateProject ? "Deploy to GitHub" : "Generate Code"}</span>
                    <span className="sm:hidden">{generating ? "..." : isTemplateProject ? "Deploy" : "Generate"}</span>
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

        {/* Embedded Preview Panel */}
        {previewMode === 'static' ? (
          <EmbeddedPreviewPanel
            nodes={nodes}
            edges={edges}
            projectName={isTemplateProject ? "My1inchDeFiSuite" : "MyDeFiApp"}
            isVisible={showEmbeddedPreview}
            onToggle={() => setShowEmbeddedPreview(!showEmbeddedPreview)}
            codeResult={codeResult}
          />
        ) : previewMode === 'functional' ? (
          <FunctionalPreviewPanel
            nodes={nodes}
            edges={edges}
            projectName={isTemplateProject ? "My1inchDeFiSuite" : "MyDeFiApp"}
            isVisible={showEmbeddedPreview}
            onToggle={() => setShowEmbeddedPreview(!showEmbeddedPreview)}
            codeResult={codeResult}
          />
        ) : (
          <RealTestnetPreview
            nodes={nodes}
            edges={edges}
            projectName={isTemplateProject ? "My1inchDeFiSuite" : "MyDeFiApp"}
            isVisible={showEmbeddedPreview}
            onToggle={() => setShowEmbeddedPreview(!showEmbeddedPreview)}
            codeResult={codeResult}
          />
        )}
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
        codeResult={codeResult as OneInchCodeResult | null}
        projectName={isTemplateProject ? "My1inchDeFiSuite" : "MyDeFiApp"}
        onPublishToGitHub={() => {
          setShowCodeModal(false)
          setShowGitHubModal(true)
        }}
        onLivePreview={() => {
          setShowCodeModal(false)
          setShowEmbeddedPreview(true)
        }}
      />

      <GitHubPublishModal
        isOpen={showGitHubModal}
        onClose={() => setShowGitHubModal(false)}
        codeResult={codeResult as OneInchCodeResult | null}                    // ✅ Correct prop
        projectName={isTemplateProject ? "My1inchDeFiSuite" : "MyDeFiApp"}
      />

      <LiveDashboardPreview
        isOpen={showLivePreviewModal}
        onClose={() => setShowLivePreviewModal(false)}
        codeResult={codeResult as any}
        projectName={isTemplateProject ? "My1inchDeFiSuite" : "MyDeFiApp"}
      />

      {/* AI Chatbot Panel */}
      <AIChatbotPanel
        isOpen={isChatbotOpen}
        onToggle={() => setIsChatbotOpen(!isChatbotOpen)}
        onWorkflowGenerated={handleWorkflowGenerated}
        onWorkflowApproved={handleWorkflowApproved}
      />
    </div>
  )
}