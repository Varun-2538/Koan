"use client"

import { useCallback, useEffect, useState, useRef } from "react"
import { useReactFlow, Node, Edge, useKeyPress, useOnSelectionChange } from "@xyflow/react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  ContextMenu,
  nodeContextMenuItems,
  canvasContextMenuItems,
  edgeContextMenuItems,
  useContextMenu,
  type ContextMenuPosition
} from "./context-menus"

interface EnhancedCanvasInteractionsProps {
  children: React.ReactNode
  onNodeExecute?: (nodeId: string) => void
  onNodeStop?: (nodeId: string) => void
  onWorkflowExecute?: () => void
  onWorkflowStop?: () => void
  onNodeDelete?: (nodeIds: string[]) => void
  onNodeDuplicate?: (nodeIds: string[]) => void
  onAutoLayout?: () => void
  onFitView?: () => void
}

export function EnhancedCanvasInteractions({
  children,
  onNodeExecute,
  onNodeStop,
  onWorkflowExecute,
  onWorkflowStop,
  onNodeDelete,
  onNodeDuplicate,
  onAutoLayout,
  onFitView
}: EnhancedCanvasInteractionsProps) {
  const {
    getNodes,
    getEdges,
    setNodes,
    setEdges,
    addNodes,
    deleteElements,
    fitView,
    zoomTo,
    getIntersectingNodes
  } = useReactFlow()

  const [selectedNodes, setSelectedNodes] = useState<Node[]>([])
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([])
  const [clipboard, setClipboard] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null)
  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu()

  // Track selection changes
  useOnSelectionChange({
    onChange: ({ nodes, edges }) => {
      setSelectedNodes(nodes)
      setSelectedEdges(edges)
    }
  })

  // Keyboard shortcuts
  const deletePressed = useKeyPress('Delete')
  const backspacePressed = useKeyPress('Backspace')
  const ctrlPressed = useKeyPress('Control')
  const shiftPressed = useKeyPress('Shift')
  const aPressed = useKeyPress('a')
  const cPressed = useKeyPress('c')
  const vPressed = useKeyPress('v')
  const xPressed = useKeyPress('x')
  const dPressed = useKeyPress('d')
  const ePressed = useKeyPress('e')
  const sPressed = useKeyPress('s')
  const zPressed = useKeyPress('z')
  const yPressed = useKeyPress('y')
  const zeroPressed = useKeyPress('0')
  const plusPressed = useKeyPress('=')
  const minusPressed = useKeyPress('-')

  // Handle keyboard shortcuts
  useEffect(() => {
    if (deletePressed || backspacePressed) {
      if (selectedNodes.length > 0 || selectedEdges.length > 0) {
        handleDelete()
      }
    }
  }, [deletePressed, backspacePressed, selectedNodes, selectedEdges])

  useEffect(() => {
    if (ctrlPressed && aPressed) {
      handleSelectAll()
    }
  }, [ctrlPressed, aPressed])

  useEffect(() => {
    if (ctrlPressed && cPressed) {
      handleCopy()
    }
  }, [ctrlPressed, cPressed])

  useEffect(() => {
    if (ctrlPressed && vPressed) {
      handlePaste()
    }
  }, [ctrlPressed, vPressed])

  useEffect(() => {
    if (ctrlPressed && xPressed) {
      handleCut()
    }
  }, [ctrlPressed, xPressed])

  useEffect(() => {
    if (ctrlPressed && dPressed) {
      handleDuplicate()
    }
  }, [ctrlPressed, dPressed])

  useEffect(() => {
    if (ctrlPressed && ePressed) {
      handleExecuteSelected()
    }
  }, [ctrlPressed, ePressed])

  useEffect(() => {
    if (ctrlPressed && zeroPressed) {
      fitView()
      onFitView?.()
    }
  }, [ctrlPressed, zeroPressed])

  useEffect(() => {
    if (ctrlPressed && plusPressed) {
      zoomTo(1.2)
    }
  }, [ctrlPressed, plusPressed])

  useEffect(() => {
    if (ctrlPressed && minusPressed) {
      zoomTo(0.8)
    }
  }, [ctrlPressed, minusPressed])

  // Context menu handlers
  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault()

    const position: ContextMenuPosition = {
      x: event.clientX,
      y: event.clientY
    }

    // Check if clicking on a node
    const nodes = getNodes()
    const clickedNode = nodes.find(node => {
      const nodeElement = document.querySelector(`[data-id="${node.id}"]`)
      return nodeElement?.contains(event.target as Node)
    })

    // Check if clicking on an edge
    const edges = getEdges()
    const clickedEdge = edges.find(edge => {
      const edgeElement = document.querySelector(`[data-id="${edge.id}"]`)
      return edgeElement?.contains(event.target as Node)
    })

    if (clickedNode) {
      // Node context menu
      const items = nodeContextMenuItems(clickedNode, {
        onExecute: () => onNodeExecute?.(clickedNode.id),
        onStop: () => onNodeStop?.(clickedNode.id),
        onConfigure: () => {
          // Open node configuration panel
          console.log('Configure node:', clickedNode.id)
        },
        onDelete: () => onNodeDelete?.([clickedNode.id]),
        onDuplicate: () => onNodeDuplicate?.([clickedNode.id]),
        onCopy: () => handleCopySelected([clickedNode]),
        onCut: () => handleCutSelected([clickedNode]),
        onGroup: () => handleGroupNodes([clickedNode]),
        onHide: () => handleHideNodes([clickedNode])
      })
      showContextMenu(items, position)
    } else if (clickedEdge) {
      // Edge context menu
      const items = edgeContextMenuItems(clickedEdge, {
        onDelete: () => handleDeleteEdges([clickedEdge]),
        onEdit: () => {
          // Open edge configuration
          console.log('Edit edge:', clickedEdge.id)
        }
      })
      showContextMenu(items, position)
    } else {
      // Canvas context menu
      const items = canvasContextMenuItems({
        onPaste: () => handlePaste(),
        onSelectAll: () => handleSelectAll(),
        onClearSelection: () => handleClearSelection(),
        onAutoLayout: () => {
          onAutoLayout?.()
          toast.success('Auto-layout applied')
        },
        onFitView: () => {
          fitView()
          onFitView?.()
        },
        onExport: () => handleExport(),
        onImport: () => handleImport()
      })
      showContextMenu(items, position)
    }
  }, [getNodes, getEdges, showContextMenu, onNodeExecute, onNodeStop, onNodeDelete, onNodeDuplicate, onAutoLayout, onFitView, fitView])

  // Selection handlers
  const handleSelectAll = useCallback(() => {
    const nodes = getNodes()
    setNodes(nodes.map(node => ({ ...node, selected: true })))
    toast.success(`Selected ${nodes.length} nodes`)
  }, [getNodes, setNodes])

  const handleClearSelection = useCallback(() => {
    setNodes(nodes => nodes.map(node => ({ ...node, selected: false })))
    setEdges(edges => edges.map(edge => ({ ...edge, selected: false })))
  }, [setNodes, setEdges])

  // Clipboard operations
  const handleCopy = useCallback(() => {
    if (selectedNodes.length > 0 || selectedEdges.length > 0) {
      const nodesToCopy = selectedNodes.map(node => ({
        ...node,
        id: `${node.id}-copy`,
        position: { x: node.position.x + 50, y: node.position.y + 50 }
      }))

      const edgesToCopy = selectedEdges.map(edge => ({
        ...edge,
        id: `${edge.id}-copy`,
        source: `${edge.source}-copy`,
        target: `${edge.target}-copy`
      }))

      setClipboard({ nodes: nodesToCopy, edges: edgesToCopy })
      toast.success(`Copied ${selectedNodes.length} nodes and ${selectedEdges.length} edges`)
    }
  }, [selectedNodes, selectedEdges])

  const handleCopySelected = useCallback((nodes: Node[]) => {
    const nodesToCopy = nodes.map(node => ({
      ...node,
      id: `${node.id}-copy`,
      position: { x: node.position.x + 50, y: node.position.y + 50 }
    }))

    const relatedEdges = getEdges().filter(edge =>
      nodes.some(node => node.id === edge.source || node.id === edge.target)
    ).map(edge => ({
      ...edge,
      id: `${edge.id}-copy`,
      source: edge.source.includes('-copy') ? edge.source : `${edge.source}-copy`,
      target: edge.target.includes('-copy') ? edge.target : `${edge.target}-copy`
    }))

    setClipboard({ nodes: nodesToCopy, edges: relatedEdges })
    toast.success(`Copied ${nodes.length} nodes`)
  }, [getEdges])

  const handlePaste = useCallback(() => {
    if (clipboard) {
      addNodes(clipboard.nodes)
      setEdges(edges => [...edges, ...clipboard.edges])
      toast.success(`Pasted ${clipboard.nodes.length} nodes and ${clipboard.edges.length} edges`)
    }
  }, [clipboard, addNodes, setEdges])

  const handleCut = useCallback(() => {
    if (selectedNodes.length > 0 || selectedEdges.length > 0) {
      handleCopy()
      handleDelete()
    }
  }, [selectedNodes, selectedEdges, handleCopy])

  const handleCutSelected = useCallback((nodes: Node[]) => {
    handleCopySelected(nodes)
    onNodeDelete?.(nodes.map(n => n.id))
  }, [handleCopySelected, onNodeDelete])

  // Node operations
  const handleDelete = useCallback(() => {
    const nodeIds = selectedNodes.map(node => node.id)
    const edgeIds = selectedEdges.map(edge => edge.id)

    if (nodeIds.length > 0 || edgeIds.length > 0) {
      deleteElements({ nodes: selectedNodes, edges: selectedEdges })
      onNodeDelete?.(nodeIds)
      toast.success(`Deleted ${nodeIds.length} nodes and ${edgeIds.length} edges`)
    }
  }, [selectedNodes, selectedEdges, deleteElements, onNodeDelete])

  const handleDeleteEdges = useCallback((edges: Edge[]) => {
    const edgeIds = edges.map(edge => edge.id)
    setEdges(currentEdges => currentEdges.filter(edge => !edgeIds.includes(edge.id)))
    toast.success(`Deleted ${edges.length} connections`)
  }, [setEdges])

  const handleDuplicate = useCallback(() => {
    if (selectedNodes.length > 0) {
      handleCopy()
      handlePaste()
      onNodeDuplicate?.(selectedNodes.map(n => n.id))
    }
  }, [selectedNodes, handleCopy, handlePaste, onNodeDuplicate])

  const handleExecuteSelected = useCallback(() => {
    if (selectedNodes.length === 1) {
      onNodeExecute?.(selectedNodes[0].id)
    } else if (selectedNodes.length > 1) {
      onWorkflowExecute?.()
    }
  }, [selectedNodes, onNodeExecute, onWorkflowExecute])

  // Grouping operations
  const handleGroupNodes = useCallback((nodes: Node[]) => {
    if (nodes.length < 2) {
      toast.error('Select at least 2 nodes to group')
      return
    }

    // Calculate group bounds
    const minX = Math.min(...nodes.map(n => n.position.x))
    const minY = Math.min(...nodes.map(n => n.position.y))
    const maxX = Math.max(...nodes.map(n => n.position.x + (n.width || 200)))
    const maxY = Math.max(...nodes.map(n => n.position.y + (n.height || 100)))

    // Create group node
    const groupNode: Node = {
      id: `group-${Date.now()}`,
      type: 'group',
      position: { x: minX - 20, y: minY - 20 },
      data: {
        label: `Group (${nodes.length} nodes)`,
        nodes: nodes.map(n => n.id)
      },
      style: {
        width: maxX - minX + 40,
        height: maxY - minY + 40,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        border: '2px dashed #3b82f6'
      }
    }

    addNodes([groupNode])
    toast.success(`Grouped ${nodes.length} nodes`)
  }, [addNodes])

  const handleHideNodes = useCallback((nodes: Node[]) => {
    setNodes(currentNodes =>
      currentNodes.map(node =>
        nodes.some(n => n.id === node.id)
          ? { ...node, hidden: true }
          : node
      )
    )
    toast.success(`Hid ${nodes.length} nodes`)
  }, [setNodes])

  // File operations
  const handleExport = useCallback(() => {
    const workflow = {
      nodes: getNodes(),
      edges: getEdges(),
      viewport: { x: 0, y: 0, zoom: 1 }
    }

    const blob = new Blob([JSON.stringify(workflow, null, 2)], {
      type: 'application/json'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'workflow.json'
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Workflow exported')
  }, [getNodes, getEdges])

  const handleImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const workflow = JSON.parse(e.target?.result as string)
            if (workflow.nodes && workflow.edges) {
              setNodes(workflow.nodes)
              setEdges(workflow.edges)
              toast.success('Workflow imported successfully')
            }
          } catch (error) {
            toast.error('Invalid workflow file')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }, [setNodes, setEdges])

  return (
    <div
      className="w-full h-full relative"
      onContextMenu={handleContextMenu}
    >
      {children}

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          items={contextMenu.items}
          position={contextMenu.position}
          onClose={hideContextMenu}
        />
      )}

      {/* Keyboard shortcuts hint */}
      <div className="absolute bottom-4 right-4 bg-white border border-gray-200 rounded-lg p-2 shadow-sm text-xs text-gray-600">
        <div className="font-medium mb-1">Keyboard Shortcuts:</div>
        <div>Ctrl+A: Select All</div>
        <div>Ctrl+C: Copy</div>
        <div>Ctrl+V: Paste</div>
        <div>Ctrl+D: Duplicate</div>
        <div>Ctrl+E: Execute</div>
        <div>Delete: Remove</div>
        <div>Ctrl+0: Fit View</div>
      </div>
    </div>
  )
}
