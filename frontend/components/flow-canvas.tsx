"use client"

import type React from "react"
import { useState, useCallback, useRef } from "react"
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
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)

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
      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 2000))
      console.log("Code generated for:", { projectId, nodes, edges })
      // Handle success (show notification, etc.)
    } catch (error) {
      console.error("Error generating code:", error)
    }
    setGenerating(false)
  }

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
                  <Button onClick={generateCode} disabled={generating} size="sm">
                    <Play className="w-4 h-4 mr-2" />
                    {generating ? "Generating..." : "Generate Code"}
                  </Button>
                </div>
              </Panel>
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
    </div>
  )
}
