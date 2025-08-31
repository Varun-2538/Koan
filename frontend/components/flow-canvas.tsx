"use client"

import React, { useState, useCallback, useRef, useEffect } from "react"
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
import { EnhancedNodeConfigPanel } from "./enhanced-node-config-panel"
import { FlowToolbar } from "./flow-toolbar"
import { CustomNodes, useCustomNodes } from "./custom-nodes"
import { unitePluginSystem, pluginRegistry, connectionValidator, executionEngine } from "@/lib/plugin-system"
import type { ExecutionResult, WorkflowExecutionResult } from "@/lib/plugin-system"
import { EnhancedCanvasInteractions } from "./enhanced-canvas-interactions"
import { Button } from "@/components/ui/button"
import { Save, Play, Zap, Trash2, Menu, X } from "lucide-react"
import { getTemplateById } from "@/lib/templates"
import { OneInchCodeGenerator, type CodeGenerationResult as OneInchCodeResult } from "@/lib/oneinch-code-generator"
import { ICMCodeGenerator, type ICMCodeGenerationResult } from "@/lib/icm-code-generator"
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

// Dynamic node types from plugin system
const useNodeTypes = () => {
  const dynamicNodes = useCustomNodes()
  return React.useMemo(() => ({
    ...CustomNodes,
    ...dynamicNodes
  }), [dynamicNodes])
}

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
  // Initialize plugin system
  React.useEffect(() => {
    unitePluginSystem.initialize().catch(console.error)
  }, [])
  
  const nodeTypes = useNodeTypes()
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [templateLoaded, setTemplateLoaded] = useState(false)
  const [codeResult, setCodeResult] = useState<CodeGenerationResult | OneInchCodeResult | ICMCodeGenerationResult | null>(null)
  const [showCodeModal, setShowCodeModal] = useState(false)
  const [showGitHubModal, setShowGitHubModal] = useState(false)
  const [autoConnect, setAutoConnect] = useState(true)
  const [showExecutionPanel, setShowExecutionPanel] = useState(false)
  
  // Execution state
  const [executing, setExecuting] = useState(false)
  const [executionStatus, setExecutionStatus] = useState<string>("")
  const [executionError, setExecutionError] = useState<string | null>(null)
  const [executionResult, setExecutionResult] = useState<any>(null)
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null)
  const [nodeOutputs, setNodeOutputs] = useState<Record<string, any>>({})
  
  // Preview modes
  const [showEmbeddedPreview, setShowEmbeddedPreview] = useState(false)
  const [previewMode, setPreviewMode] = useState<'static' | 'functional' | 'testnet'>('static')
  
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
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
  const [nodeExecutionMode, setNodeExecutionMode] = useState<'batch' | 'individual'>('batch')
  
  // AI Chatbot state
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)
  
  // Workflow execution state
  const [workflowExecutionStatus, setWorkflowExecutionStatus] = useState<ExecutionStatus | null>(null)
  const [nodeExecutionStatuses, setNodeExecutionStatuses] = useState<Record<string, any>>({})

  // Enhanced interactivity state
  const [showDynamicConfig, setShowDynamicConfig] = useState(false)
  const [configuringNode, setConfiguringNode] = useState<Node | null>(null)
  const [nodeDataTypes, setNodeDataTypes] = useState<Record<string, { inputs: Record<string, DataType>, outputs: Record<string, DataType> }>>({})
  const [connectionValidation, setConnectionValidation] = useState<Record<string, boolean>>({})

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

  // Execute individual node using plugin system
  const executeIndividualNode = useCallback(async (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return

    setActiveNodeId(nodeId)
    const componentId = node.data?.componentId || node.type
    setExecutionStatus(`Executing ${componentId}...`)

    try {
      // Get component definition to apply default values
      const component = unitePluginSystem.getComponent(componentId!)
      let nodeConfig = { ...node.data?.config } || {}
      
      // Apply default values from component template if config is missing values
      if (component?.template?.fields || component?.template?.configuration) {
        const fields = component.template?.fields || component.template?.configuration || []
        fields.forEach(field => {
          if (nodeConfig[field.key] === undefined && field.defaultValue !== undefined) {
            nodeConfig[field.key] = field.defaultValue
          }
        })
      }
      
      console.log('🔧 Node config with defaults:', { componentId, nodeConfig, fields: component?.template?.fields?.length || 0 })

      // Execute single node workflow
      const singleNodeWorkflow = {
        id: `single-node-${Date.now()}`,
        name: `Execute ${componentId}`,
        nodes: [{
          id: node.id,
          type: componentId!,
          config: nodeConfig,
          position: node.position
        }],
        connections: []
      }

      const result = await unitePluginSystem.executeWorkflow(
        singleNodeWorkflow,
        {}, // No initial inputs for individual execution
        { environment: 'development' }
      )

      if (result.success) {
        const nodeResult = result.nodeResults[0]
        if (nodeResult) {
          setNodeOutputs(prev => ({ ...prev, [nodeId]: nodeResult.outputs }))
          setExecutionStatus(`✅ ${componentId} executed successfully`)
          
          // Show toast with execution summary
          toast({
            title: "Node Executed",
            description: `${componentId} completed in ${nodeResult.duration}ms`,
            variant: "default"
          })
        }
      } else {
        throw new Error(result.errors[0] || 'Node execution failed')
      }

    } catch (error) {
      console.error('Individual node execution error:', error)
      setExecutionError(`Node execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setExecutionStatus("❌ Node execution failed")
      
      toast({
        title: "Node Execution Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      })
    } finally {
      setActiveNodeId(null)
    }
  }, [nodes])

  // Execute workflow using new plugin system
  const executeWorkflow = useCallback(async () => {
    if (nodes.length === 0) {
      console.warn('No nodes to execute')
      return
    }

    setExecuting(true)
    setExecutionError(null)
    setExecutionStatus("Preparing workflow execution...")

    // Clear previous node outputs
    setNodeOutputs({})

    try {
      // Convert to workflow definition for plugin system with default values
      const workflowDefinition = {
        id: `workflow-${Date.now()}`,
        name: `Canvas Workflow`,
        description: 'Workflow generated from canvas',
        nodes: nodes.map(node => {
          const componentId = node.data?.componentId || node.type || 'unknown'
          let nodeConfig = { ...node.data?.config } || {}
          
          // Apply default values from component template if config is missing values
          const component = unitePluginSystem.getComponent(componentId)
          if (component?.template?.fields || component?.template?.configuration) {
            const fields = component.template?.fields || component.template?.configuration || []
            fields.forEach(field => {
              if (nodeConfig[field.key] === undefined && field.defaultValue !== undefined) {
                nodeConfig[field.key] = field.defaultValue
              }
            })
          }
          
          return {
            id: node.id,
            type: componentId, 
            config: nodeConfig,
            position: node.position
          }
        }),
        connections: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          sourceHandle: edge.sourceHandle || 'output',
          target: edge.target,
          targetHandle: edge.targetHandle || 'input'
        }))
      }
      
      console.log('🔧 Workflow with default configs:', workflowDefinition.nodes.map(n => ({ id: n.id, type: n.type, configKeys: Object.keys(n.config) })))

      setExecutionStatus("Executing workflow...")

      // Try frontend plugin system execution first, fallback to backend if needed
      console.log('🎯 Attempting frontend plugin system execution')
      
      try {
        // Use frontend plugin system execution
        const result = await unitePluginSystem.executeWorkflow(workflowDefinition, {}, { environment: 'development' })
        
        if (result.success) {
          console.log('✅ Frontend plugin system execution successful:', result)
          
          // Update node outputs with results
          const outputUpdates: Record<string, any> = {}
          result.nodeResults.forEach(nodeResult => {
            outputUpdates[nodeResult.nodeId] = nodeResult.outputs
          })
          setNodeOutputs(outputUpdates)
          
          setExecutionStatus("✅ Workflow executed successfully")
          
          toast({
            title: "🎉 Workflow Executed Successfully", 
            description: `All ${result.nodeResults.length} nodes completed`,
            variant: "default"
          })
          
          return // Exit early on success
        }
      } catch (pluginError) {
        console.warn('⚠️ Frontend plugin system execution failed, trying backend:', pluginError)
      }
      
      // Fallback to backend execution for template projects
      if (projectId.startsWith('template-')) {
        console.log('🎯 Using backend execution as fallback')

        // Use backend execution path
        const executionId = await executionClient.executeWorkflow(workflowDefinition)

        // Set up event listeners for backend execution
        const handleExecutionStarted = (data: any) => {
          setExecutionStatus(`Execution started: ${data?.executionId || 'unknown'}`)
          console.log('🚀 Backend execution started:', data)
        }

        const handleNodeStarted = (data: any) => {
          setExecutionStatus(`Executing node: ${data?.nodeId || 'unknown'}`)
          console.log('⚡ Backend node started:', data)
        }

        const handleNodeCompleted = (data: any) => {
          setExecutionStatus(`Node completed: ${data?.nodeId || 'unknown'}`)
          console.log('✅ Backend node completed:', data)
        }

        const handleExecutionCompleted = (data: any) => {
          setExecutionStatus("Execution completed successfully!")
          setExecutionResult(data)
          console.log('🎉 Backend execution completed:', data)
        }

        const handleExecutionFailed = (data: any) => {
          setExecutionStatus("Execution failed")
          setExecutionError(data?.error || data?.message || 'Unknown error')
          console.error('❌ Backend execution failed:', data)
        }

        // Add event listeners
        executionClient.on('execution.started', handleExecutionStarted)
        executionClient.on('node.started', handleNodeStarted) 
        executionClient.on('node.completed', handleNodeCompleted)
        executionClient.on('execution.completed', handleExecutionCompleted)
        executionClient.on('execution.failed', handleExecutionFailed)

        // Clean up event listeners when component unmounts or execution completes
        const cleanup = () => {
          executionClient.off('execution.started', handleExecutionStarted)
          executionClient.off('node.started', handleNodeStarted)
          executionClient.off('node.completed', handleNodeCompleted) 
          executionClient.off('execution.completed', handleExecutionCompleted)
          executionClient.off('execution.failed', handleExecutionFailed)
        }

        // Set up cleanup on completion or error
        setTimeout(cleanup, 60000) // Clean up after 1 minute max

        return // Exit early, backend will handle the rest
      }

      // For custom workflows, use UnitePluginSystem
      console.log('🎯 Using UnitePluginSystem for custom workflow')
      const result: WorkflowExecutionResult = await unitePluginSystem.executeWorkflow(
        workflowDefinition,
        {}, // Initial inputs
        { environment: 'development' }
      )

      if (result.success) {
        setExecutionStatus("Workflow completed successfully!")
        setExecutionResult(result)
        setNodeOutputs(result.results)
        
        // Update node states based on execution results
        result.nodeResults.forEach(nodeResult => {
          // Visual feedback for executed nodes could be added here
          console.log(`Node ${nodeResult.nodeId} completed:`, nodeResult.outputs)
        })
        
        // Automatically generate code after successful execution
        try {
          setExecutionStatus("Generating application code...")
          const codeResult = await unitePluginSystem.generateCode(workflowDefinition)
          if (codeResult) {
            // Convert to expected format
            const files = Array.from(codeResult.modules.entries()).map(([path, module]) => ({
              path,
              content: module.code
            }))
            
            setCodeResult({
              files,
              projectName: 'MyDeFiApp',
              framework: 'Next.js 14',
              dependencies: Array.from(codeResult.dependencies)
            } as any)
          }
          setExecutionStatus("Code generation completed!")
        } catch (codeError) {
          console.error('Code generation failed:', codeError)
          setExecutionStatus("Workflow completed (code generation failed)")
        }
        
      } else {
        setExecutionError(result.errors.join(', '))
        setExecutionStatus("Workflow execution failed")
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

  // Enhanced connection handler with dynamic validation from plugin system
  const onConnect = useCallback(async (params: Connection) => {
    const sourceNode = nodes.find(n => n.id === params.source)
    const targetNode = nodes.find(n => n.id === params.target)

    if (sourceNode && targetNode) {
      try {
        // Use plugin system's dynamic connection validator
        const validationResult = await connectionValidator.validateConnection({
          sourceNodeId: sourceNode.id,
          sourcePortId: params.sourceHandle || 'output',
          sourceDataType: 'any', // Will be determined dynamically by plugin system
          targetNodeId: targetNode.id,
          targetPortId: params.targetHandle || 'input', 
          targetDataType: 'any'
        })

        if (!validationResult.canConnect) {
          toast({
            title: "Connection Invalid",
            description: validationResult.errors[0] || "Cannot connect these node types",
            variant: "destructive"
          })
          return
        }

        // Show transformation warnings if needed
        if (validationResult.warnings.length > 0) {
          toast({
            title: "Connection Warning",
            description: validationResult.warnings[0],
            variant: "default"
          })
        }

        // Add visual feedback for valid connections
        const edgeId = `e-${params.source}-${params.target}`
        setConnectionValidation(prev => ({ ...prev, [edgeId]: validationResult.canConnect }))

        // Create edge with appropriate styling
        setEdges((eds) => addEdge({
          ...params,
          animated: validationResult.canConnect,
          style: { 
            stroke: validationResult.requiresTransformation ? '#f59e0b' : '#10b981', 
            strokeWidth: validationResult.canConnect ? 2 : 1,
            strokeDasharray: validationResult.requiresTransformation ? '5,5' : 'none'
          },
          type: validationResult.canConnect ? 'smoothstep' : 'default',
          label: validationResult.requiresTransformation ? '🔄' : undefined
        }, eds))

        toast({
          title: "Connection Created",
          description: validationResult.requiresTransformation 
            ? "Data will be automatically transformed"
            : "Connection established successfully",
          variant: "default"
        })

      } catch (error) {
        console.error('Connection validation failed:', error)
        toast({
          title: "Connection Error", 
          description: "Failed to validate connection",
          variant: "destructive"
        })
      }
    }
  }, [nodes, setEdges])

  // Enhanced node configuration handler
  const handleNodeConfigure = useCallback((node: Node) => {
    setConfiguringNode(node)
    setShowDynamicConfig(true)
  }, [])

  // Handle node deletion with enhanced feedback
  const handleNodeDelete = useCallback((nodeIds: string[]) => {
    setNodes(nodes => nodes.filter(node => !nodeIds.includes(node.id)))
    setEdges(edges => edges.filter(edge =>
      !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target)
    ))
    toast.success(`Deleted ${nodeIds.length} node${nodeIds.length > 1 ? 's' : ''}`)
  }, [setNodes, setEdges])

  // Handle node duplication
  const handleNodeDuplicate = useCallback((nodeIds: string[]) => {
    const nodesToDuplicate = nodes.filter(node => nodeIds.includes(node.id))
    const duplicatedNodes = nodesToDuplicate.map(node => ({
      ...node,
      id: `${node.id}-copy-${Date.now()}`,
      position: { x: node.position.x + 50, y: node.position.y + 50 },
      selected: false
    }))

    setNodes(nodes => [...nodes, ...duplicatedNodes])
    toast.success(`Duplicated ${nodeIds.length} node${nodeIds.length > 1 ? 's' : ''}`)
  }, [nodes, setNodes])

  // Enhanced auto-layout algorithm
  const handleAutoLayout = useCallback(() => {
    const layoutNodes = [...nodes]
    const nodeWidth = 200
    const nodeHeight = 100
    const horizontalSpacing = 250
    const verticalSpacing = 150

    // Simple hierarchical layout
    const processed = new Set<string>()
    const levels: Node[][] = []

    // Find root nodes (nodes with no incoming edges)
    const hasIncomingEdge = new Set(edges.map(edge => edge.target))
    const rootNodes = layoutNodes.filter(node => !hasIncomingEdge.has(node.id))

    if (rootNodes.length > 0) {
      levels.push(rootNodes)
      processed.add(...rootNodes.map(n => n.id))
    }

    // Process remaining nodes level by level
    let currentLevel = 0
    while (processed.size < layoutNodes.length && currentLevel < 10) {
      const nextLevel: Node[] = []

      layoutNodes.forEach(node => {
        if (!processed.has(node.id)) {
          const incomingEdges = edges.filter(edge => edge.target === node.id)
          const allSourcesProcessed = incomingEdges.every(edge => processed.has(edge.source))

          if (allSourcesProcessed) {
            nextLevel.push(node)
          }
        }
      })

      if (nextLevel.length > 0) {
        levels.push(nextLevel)
        processed.add(...nextLevel.map(n => n.id))
      }

      currentLevel++
    }

    // Add any remaining nodes to the last level
    const remainingNodes = layoutNodes.filter(node => !processed.has(node.id))
    if (remainingNodes.length > 0) {
      levels.push(remainingNodes)
    }

    // Position nodes
    levels.forEach((levelNodes, levelIndex) => {
      levelNodes.forEach((node, nodeIndex) => {
        const x = nodeIndex * horizontalSpacing + 100
        const y = levelIndex * verticalSpacing + 100

        node.position = { x, y }
      })
    })

    setNodes(layoutNodes)
    setTimeout(() => reactFlowInstance?.fitView({ padding: 0.1 }), 100)
    toast.success('Auto-layout applied')
  }, [nodes, edges, setNodes])

  // Enhanced fit view handler
  const handleFitView = useCallback(() => {
    reactFlowInstance?.fitView({ padding: 0.1 })
  }, [reactFlowInstance])

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
        type: 'universalPlugin', // Use universal plugin node type
        position,
        data: {
          componentId: type, // Store the component ID here
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

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    // Check if it was a double-click for execution
    if (event.detail === 2) {
      executeIndividualNode(node.id)
    } else {
      setSelectedNode(node)
    }
  }, [executeIndividualNode])

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

  // Helper function to detect ICM templates
  const isICMTemplate = () => {
    // Check if it's an ICM template by examining nodes for ICM-specific node types
    const hasICMNodes = nodes.some(node => 
      node.type === 'icmSender' || 
      node.type === 'icmReceiver' || 
      node.type === 'l1Config' || 
      node.type === 'l1SimulatorDeployer'
    )
    
    // Also check template ID if it's a predefined template
    const isICMTemplateId = projectId.includes('avalanche') || projectId.includes('icm') || projectId.includes('l1')
    
    return hasICMNodes || isICMTemplateId
  }

  // Helper function to detect L1 Subnet Creation template specifically
  const isL1SubnetTemplate = () => {
    // Check for L1 deployment specific nodes
    const hasL1Nodes = nodes.some(node => 
      node.type === 'l1Config' || 
      node.type === 'l1SimulatorDeployer'
    )
    
    // Check if it's the specific L1 subnet template
    const isL1TemplateId = projectId === 'template-avalanche-l1-simulation'
    
    return hasL1Nodes || isL1TemplateId
  }

  // Helper function that generates code and returns the result
  const generateCodeAndReturn = async (): Promise<CodeGenerationResult | OneInchCodeResult | ICMCodeGenerationResult | null> => {
    const isICM = isICMTemplate()
    const isL1 = isL1SubnetTemplate()
    const projectName = isTemplateProject 
      ? (isL1 ? "AvalancheL1SubnetCreator" : isICM ? "AvalancheICMDashboard" : "My1inchDeFiSuite")
      : "MyDeFiApp"
    
    if (isTemplateProject) {
      if (isICM) {
        // Use ICM code generator for ICM templates
        console.log('🏔️ Generating code for ICM template project using ICMCodeGenerator')
        const result = ICMCodeGenerator.generateFromWorkflow(
          nodes, 
          edges, 
          projectName,
          { 
            network: "Avalanche Fuji",
            templateMode: true,
            avalancheRPC: "https://api.avax-test.network/ext/bc/C/rpc"
          }
        )
        return result
      } else {
        // Use 1inch code generator for DeFi templates
        console.log('🎯 Generating code for 1inch template project using OneInchCodeGenerator')
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
      }
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
              // Set both src/dst and from_token/to_token for compatibility
              backendConfig.src = backendConfig.src || backendConfig.from_token || "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
              backendConfig.dst = backendConfig.dst || backendConfig.to_token || "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
              backendConfig.from_token = backendConfig.from_token || backendConfig.src
              backendConfig.to_token = backendConfig.to_token || backendConfig.dst
              // Use a smaller default amount for template mode to avoid large transaction amounts
              // Only set default if no amount is provided
              if (!backendConfig.amount) {
                backendConfig.amount = "100000000000000000" // 0.1 ETH instead of 1 ETH
              }
              backendConfig.chainId = backendConfig.chainId || backendConfig.chain_id || "1"
              backendConfig.chain_id = backendConfig.chain_id || backendConfig.chainId || "1"
            }

            // For oneInchSwap, ensure we use the same amount as the quote
            if (node.type === "oneInchSwap") {
              // Set both src/dst and from_token/to_token for compatibility
              backendConfig.src = backendConfig.src || backendConfig.from_token || "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
              backendConfig.dst = backendConfig.dst || backendConfig.to_token || "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
              backendConfig.from_token = backendConfig.from_token || backendConfig.src
              backendConfig.to_token = backendConfig.to_token || backendConfig.dst
              backendConfig.chainId = backendConfig.chainId || backendConfig.chain_id || "1"
              backendConfig.chain_id = backendConfig.chain_id || backendConfig.chainId || "1"
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

      console.log('🔗 Workflow edges:', workflow.edges.length)
      workflow.edges.forEach(edge => {
        console.log(`  - ${edge.id}: ${edge.source} → ${edge.target}`)
      })

      console.log('📋 Workflow definition:', workflow)

      // Set up execution event listeners (existing executeFlow function)
      const handleExecutionStarted2 = (data: any) => {
        setExecutionStatus(`Execution started: ${data?.executionId || 'unknown'}`)
        console.log('🚀 Execution started:', data)
      }

      const handleNodeStarted2 = (data: any) => {
        setExecutionStatus(`Executing node: ${data?.nodeId || 'unknown'}`)
        console.log('⚡ Node started:', data)
      }

      const handleNodeCompleted2 = (data: any) => {
        setExecutionStatus(`Node completed: ${data?.nodeId || 'unknown'}`)
        console.log('✅ Node completed:', data)
      }

      const handleExecutionCompleted2 = (data: any) => {
        setExecutionStatus("Execution completed successfully!")
        setExecutionResult(data)
        console.log('🎉 Execution completed:', data)
      }

      const handleExecutionFailed2 = (data: any) => {
        setExecutionStatus("Execution failed")
        setExecutionError(data?.error || data?.message || 'Unknown error')
        console.error('❌ Execution failed:', data)
      }

      // Add event listeners
      executionClient.on('execution.started', handleExecutionStarted2)
      executionClient.on('node.started', handleNodeStarted2)
      executionClient.on('node.completed', handleNodeCompleted2)
      executionClient.on('execution.completed', handleExecutionCompleted2)
      executionClient.on('execution.failed', handleExecutionFailed2)

      // Clean up event listeners
      const cleanup2 = () => {
        executionClient.off('execution.started', handleExecutionStarted2)
        executionClient.off('node.started', handleNodeStarted2)
        executionClient.off('node.completed', handleNodeCompleted2)
        executionClient.off('execution.completed', handleExecutionCompleted2)
        executionClient.off('execution.failed', handleExecutionFailed2)
      }

      // Set up cleanup
      setTimeout(cleanup2, 60000) // Clean up after 1 minute max

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
  
  // Helper function to convert codeResult to preview panel format
  const convertCodeResultForPreviews = (result: CodeGenerationResult | OneInchCodeResult | ICMCodeGenerationResult | null) => {
    if (!result) return null
    
    // Check if it's OneInchCodeResult or ICMCodeGenerationResult (both have array files with path, type, content)
    if ('files' in result && Array.isArray(result.files)) {
      const filesRecord: Record<string, string> = {}
      result.files.forEach(file => {
        filesRecord[file.path] = file.content
      })
      
      return {
        projectName: result.projectName,
        description: result.description,
        files: filesRecord,
        dependencies: (result as any).dependencies,
        framework: (result as any).framework,
        features: (result as any).features
      }
    }
    
    // If it's already in the right format or unknown, return as is
    return result as any
  }
  
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
            <EnhancedCanvasInteractions
              onNodeExecute={executeIndividualNode}
              onNodeStop={(nodeId) => {
                // Stop individual node execution
                setActiveNodeId(null)
                toast.success(`Stopped execution of node ${nodeId}`)
              }}
              onWorkflowExecute={executeWorkflow}
              onWorkflowStop={() => {
                // Stop workflow execution
                setExecuting(false)
                toast.success('Workflow execution stopped')
              }}
              onNodeDelete={handleNodeDelete}
              onNodeDuplicate={handleNodeDuplicate}
              onAutoLayout={handleAutoLayout}
              onFitView={handleFitView}
            >
              <div className="h-full" ref={reactFlowWrapper}>
                <ReactFlow
                  nodes={nodes.map(node => ({
                    ...node,
                    data: {
                      ...node.data,
                      // Enhanced execution state
                      isExecuting: activeNodeId === node.id,
                      hasOutput: !!nodeOutputs[node.id],
                      executionError: false,
                      onExecute: () => executeIndividualNode(node.id),
                      onConfigure: () => handleNodeConfigure(node),
                      // Data type information for connections
                      dataTypes: nodeDataTypes[node.id] || { inputs: {}, outputs: {} }
                    }
                  }))}
                  edges={edges.map(edge => ({
                    ...edge,
                    animated: connectionValidation[edge.id] || false,
                    style: {
                      stroke: connectionValidation[edge.id] ? '#10b981' : '#b1b1b7',
                      strokeWidth: connectionValidation[edge.id] ? 2 : 1
                    },
                    type: connectionValidation[edge.id] ? 'interactive' : 'default'
                  }))}
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

                {/* Interactive Mode Toggle */}
                <div className="mt-2 bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Mode:</span>
                    <Button
                      size="sm"
                      variant={nodeExecutionMode === 'individual' ? 'default' : 'outline'}
                      onClick={() => setNodeExecutionMode('individual')}
                      className="text-xs"
                    >
                      Individual
                    </Button>
                    <Button
                      size="sm"
                      variant={nodeExecutionMode === 'batch' ? 'default' : 'outline'}
                      onClick={() => setNodeExecutionMode('batch')}
                      className="text-xs"
                    >
                      Batch
                    </Button>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {nodeExecutionMode === 'individual'
                      ? 'Double-click nodes to execute individually'
                      : 'Execute entire workflow at once'
                    }
                  </div>
                </div>
              </Panel>

              {/* Execution Status Panel */}
              <Panel position="bottom-left">
                {showExecutionPanel && (executing || executionStatus) ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-sm shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-800">🚀 Execution Status</div>
                      <button
                        onClick={() => setShowExecutionPanel(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Close panel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
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
                      {!executing && (executionStatus || executionResult || executionError) && (
                        <div className="text-xs text-gray-500 mt-2">
                          Panel will auto-close in 3 seconds
                        </div>
                      )}
                    </div>
                  </div>
                ) : showExecutionPanel ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3 max-w-xs sm:max-w-sm shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-800">💡 Quick Tips:</div>
                      <button
                        onClick={() => setShowExecutionPanel(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Close panel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="hidden sm:block">• Use AI chatbot to generate workflows</div>
                      <div>• Click a node to select it</div>
                      <div className="hidden sm:block">• Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Delete</kbd> to delete nodes</div>
                      <div className="hidden sm:block">• Execute workflows to generate code</div>
                      <div className="sm:hidden">• Tap nodes to configure</div>
                    </div>
                  </div>
                ) : null}
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
            </EnhancedCanvasInteractions>
          </ReactFlowProvider>
        </div>

        {/* Embedded Preview Panel */}
        {previewMode === 'static' ? (
          <EmbeddedPreviewPanel
            nodes={nodes}
            edges={edges}
            projectName={isTemplateProject ? (isL1SubnetTemplate() ? "AvalancheL1SubnetCreator" : isICMTemplate() ? "AvalancheICMDashboard" : "My1inchDeFiSuite") : "MyDeFiApp"}
            isVisible={showEmbeddedPreview}
            onToggle={() => setShowEmbeddedPreview(!showEmbeddedPreview)}
            codeResult={convertCodeResultForPreviews(codeResult)}
          />
        ) : previewMode === 'functional' ? (
          <FunctionalPreviewPanel
            nodes={nodes}
            edges={edges}
            projectName={isTemplateProject ? (isL1SubnetTemplate() ? "AvalancheL1SubnetCreator" : isICMTemplate() ? "AvalancheICMDashboard" : "My1inchDeFiSuite") : "MyDeFiApp"}
            isVisible={showEmbeddedPreview}
            onToggle={() => setShowEmbeddedPreview(!showEmbeddedPreview)}
            codeResult={convertCodeResultForPreviews(codeResult)}
          />
        ) : (
          <RealTestnetPreview
            nodes={nodes}
            edges={edges}
            projectName={isTemplateProject ? (isL1SubnetTemplate() ? "AvalancheL1SubnetCreator" : isICMTemplate() ? "AvalancheICMDashboard" : "My1inchDeFiSuite") : "MyDeFiApp"}
            isVisible={showEmbeddedPreview}
            onToggle={() => setShowEmbeddedPreview(!showEmbeddedPreview)}
            codeResult={convertCodeResultForPreviews(codeResult)}
          />
        )}
      </div>

      {selectedNode && (
        <EnhancedNodeConfigPanel
          node={selectedNode}
          onUpdateNode={(nodeId, config) => updateNodeConfig(nodeId, config)}
          onClose={() => setSelectedNode(null)}
        />
      )}

      <CodePreviewModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        codeResult={codeResult as OneInchCodeResult | null}
        projectName={isTemplateProject ? (isL1SubnetTemplate() ? "AvalancheL1SubnetCreator" : isICMTemplate() ? "AvalancheICMDashboard" : "My1inchDeFiSuite") : "MyDeFiApp"}
      />

      <GitHubPublishModal
        isOpen={showGitHubModal}
        onClose={() => setShowGitHubModal(false)}
        codeResult={codeResult as CodeGenerationResult | ICMCodeGenerationResult | null}
        projectName={isTemplateProject ? (isL1SubnetTemplate() ? "AvalancheL1SubnetCreator" : isICMTemplate() ? "AvalancheICMDashboard" : "My1inchDeFiSuite") : "MyDeFiApp"}
      />

      <LiveDashboardPreview
        isOpen={showLivePreviewModal}
        onClose={() => setShowLivePreviewModal(false)}
        codeResult={codeResult as any}
        projectName={isTemplateProject ? (isL1SubnetTemplate() ? "AvalancheL1SubnetCreator" : isICMTemplate() ? "AvalancheICMDashboard" : "My1inchDeFiSuite") : "MyDeFiApp"}
      />

      {/* AI Chatbot Panel */}
      <AIChatbotPanel
        isOpen={isChatbotOpen}
        onToggle={() => setIsChatbotOpen(!isChatbotOpen)}
        onWorkflowGenerated={handleWorkflowGenerated}
        onWorkflowApproved={handleWorkflowApproved}
      />

      {/* Dynamic Node Configuration Modal */}
      {showDynamicConfig && configuringNode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">
                Configure {configuringNode.data?.label || configuringNode.type}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowDynamicConfig(false)
                  setConfiguringNode(null)
                }}
              >
                ✕
              </Button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              <EnhancedNodeConfiguration
                node={configuringNode}
                onUpdateNode={(nodeId, config) => {
                  setNodes(nodes => nodes.map(node =>
                    node.id === nodeId
                      ? {
                          ...node,
                          data: {
                            ...node.data,
                            config,
                            label: config.label || node.data?.label
                          }
                        }
                      : node
                  ))
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}