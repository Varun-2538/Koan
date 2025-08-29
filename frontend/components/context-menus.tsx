"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Copy,
  Scissors,
  Trash2,
  Settings,
  Play,
  Square,
  RotateCcw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Move,
  Group,
  Ungroup,
  Eye,
  EyeOff,
  Download,
  Upload,
  Zap,
  Database,
  Link,
  Unlink
} from "lucide-react"

// Context menu item types
export interface ContextMenuItem {
  id: string
  label: string
  icon?: React.ReactNode
  shortcut?: string
  disabled?: boolean
  danger?: boolean
  separator?: boolean
  children?: ContextMenuItem[]
  onClick?: () => void
  condition?: () => boolean
}

export interface ContextMenuPosition {
  x: number
  y: number
}

interface ContextMenuProps {
  items: ContextMenuItem[]
  position: ContextMenuPosition
  onClose: () => void
  className?: string
}

// Individual menu item component
function MenuItem({
  item,
  onClick,
  onSubmenuOpen
}: {
  item: ContextMenuItem
  onClick: (item: ContextMenuItem) => void
  onSubmenuOpen?: (item: ContextMenuItem) => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [submenuPosition, setSubmenuPosition] = useState<ContextMenuPosition | null>(null)
  const itemRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (item.children && item.children.length > 0 && onSubmenuOpen) {
      const rect = itemRef.current?.getBoundingClientRect()
      if (rect) {
        setSubmenuPosition({
          x: rect.right + 5,
          y: rect.top
        })
      }
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setSubmenuPosition(null)
  }

  const handleClick = () => {
    if (item.disabled) return
    if (item.children && item.children.length > 0) return
    item.onClick?.()
    onClick(item)
  }

  if (item.separator) {
    return <Separator className="my-1" />
  }

  return (
    <>
      <div
        ref={itemRef}
        className={`
          flex items-center gap-3 px-3 py-2 text-sm cursor-pointer transition-colors
          ${item.disabled
            ? 'text-gray-400 cursor-not-allowed'
            : item.danger
              ? 'text-red-600 hover:bg-red-50'
              : 'text-gray-700 hover:bg-gray-100'
          }
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
          {item.icon}
        </div>
        <span className="flex-1">{item.label}</span>
        {item.shortcut && (
          <span className="text-xs text-gray-400 ml-auto">
            {item.shortcut}
          </span>
        )}
        {item.children && item.children.length > 0 && (
          <div className="ml-auto">
            ▶
          </div>
        )}
      </div>

      {/* Submenu */}
      {submenuPosition && item.children && item.children.length > 0 && (
        <div className="fixed z-50">
          <ContextMenu
            items={item.children}
            position={submenuPosition}
            onClose={() => setSubmenuPosition(null)}
          />
        </div>
      )}
    </>
  )
}

// Main context menu component
export function ContextMenu({ items, position, onClose, className = "" }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  // Adjust position to stay within viewport
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 200),
    y: Math.min(position.y, window.innerHeight - 300)
  }

  const handleItemClick = (item: ContextMenuItem) => {
    if (!item.disabled && item.onClick) {
      item.onClick()
      onClose()
    }
  }

  return (
    <div
      ref={menuRef}
      className={`
        fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-48
        ${className}
      `}
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y
      }}
    >
      {items.map((item, index) => (
        <MenuItem
          key={`${item.id}-${index}`}
          item={item}
          onClick={handleItemClick}
        />
      ))}
    </div>
  )
}

// Predefined context menu configurations
export const nodeContextMenuItems = (
  node: any,
  actions: {
    onExecute?: () => void
    onStop?: () => void
    onConfigure?: () => void
    onDelete?: () => void
    onDuplicate?: () => void
    onCopy?: () => void
    onCut?: () => void
    onGroup?: () => void
    onHide?: () => void
  }
): ContextMenuItem[] => [
  {
    id: 'execute',
    label: 'Execute Node',
    icon: <Play className="w-4 h-4" />,
    shortcut: 'Ctrl+E',
    onClick: actions.onExecute,
    condition: () => !node.data?.isExecuting
  },
  {
    id: 'stop',
    label: 'Stop Execution',
    icon: <Square className="w-4 h-4" />,
    onClick: actions.onStop,
    condition: () => node.data?.isExecuting
  },
  { id: 'separator1', label: '', separator: true },
  {
    id: 'configure',
    label: 'Configure',
    icon: <Settings className="w-4 h-4" />,
    shortcut: 'Ctrl+,',
    onClick: actions.onConfigure
  },
  { id: 'separator2', label: '', separator: true },
  {
    id: 'edit',
    label: 'Edit',
    icon: <Settings className="w-4 h-4" />,
    children: [
      {
        id: 'duplicate',
        label: 'Duplicate',
        icon: <Copy className="w-4 h-4" />,
        shortcut: 'Ctrl+D',
        onClick: actions.onDuplicate
      },
      {
        id: 'copy',
        label: 'Copy',
        icon: <Copy className="w-4 h-4" />,
        shortcut: 'Ctrl+C',
        onClick: actions.onCopy
      },
      {
        id: 'cut',
        label: 'Cut',
        icon: <Scissors className="w-4 h-4" />,
        shortcut: 'Ctrl+X',
        onClick: actions.onCut
      }
    ]
  },
  {
    id: 'group',
    label: 'Group',
    icon: <Group className="w-4 h-4" />,
    onClick: actions.onGroup
  },
  { id: 'separator3', label: '', separator: true },
  {
    id: 'visibility',
    label: 'Visibility',
    icon: <Eye className="w-4 h-4" />,
    children: [
      {
        id: 'hide',
        label: 'Hide Node',
        icon: <EyeOff className="w-4 h-4" />,
        onClick: actions.onHide
      }
    ]
  },
  { id: 'separator4', label: '', separator: true },
  {
    id: 'delete',
    label: 'Delete',
    icon: <Trash2 className="w-4 h-4" />,
    shortcut: 'Del',
    danger: true,
    onClick: actions.onDelete
  }
]

export const canvasContextMenuItems = (
  actions: {
    onPaste?: () => void
    onSelectAll?: () => void
    onClearSelection?: () => void
    onAutoLayout?: () => void
    onFitView?: () => void
    onExport?: () => void
    onImport?: () => void
  }
): ContextMenuItem[] => [
  {
    id: 'paste',
    label: 'Paste',
    icon: <Upload className="w-4 h-4" />,
    shortcut: 'Ctrl+V',
    onClick: actions.onPaste
  },
  { id: 'separator1', label: '', separator: true },
  {
    id: 'select',
    label: 'Select',
    icon: <Move className="w-4 h-4" />,
    children: [
      {
        id: 'select-all',
        label: 'Select All',
        icon: <Move className="w-4 h-4" />,
        shortcut: 'Ctrl+A',
        onClick: actions.onSelectAll
      },
      {
        id: 'clear-selection',
        label: 'Clear Selection',
        icon: <Square className="w-4 h-4" />,
        onClick: actions.onClearSelection
      }
    ]
  },
  {
    id: 'layout',
    label: 'Layout',
    icon: <AlignLeft className="w-4 h-4" />,
    children: [
      {
        id: 'auto-layout',
        label: 'Auto Layout',
        icon: <Zap className="w-4 h-4" />,
        onClick: actions.onAutoLayout
      },
      {
        id: 'fit-view',
        label: 'Fit to View',
        icon: <Eye className="w-4 h-4" />,
        shortcut: 'Ctrl+0',
        onClick: actions.onFitView
      }
    ]
  },
  { id: 'separator2', label: '', separator: true },
  {
    id: 'file',
    label: 'File',
    icon: <Database className="w-4 h-4" />,
    children: [
      {
        id: 'export',
        label: 'Export Workflow',
        icon: <Download className="w-4 h-4" />,
        onClick: actions.onExport
      },
      {
        id: 'import',
        label: 'Import Workflow',
        icon: <Upload className="w-4 h-4" />,
        onClick: actions.onImport
      }
    ]
  }
]

export const edgeContextMenuItems = (
  edge: any,
  actions: {
    onDelete?: () => void
    onEdit?: () => void
  }
): ContextMenuItem[] => [
  {
    id: 'edit',
    label: 'Edit Connection',
    icon: <Settings className="w-4 h-4" />,
    onClick: actions.onEdit
  },
  { id: 'separator1', label: '', separator: true },
  {
    id: 'delete',
    label: 'Delete Connection',
    icon: <Unlink className="w-4 h-4" />,
    shortcut: 'Del',
    danger: true,
    onClick: actions.onDelete
  }
]

// Context menu hook for managing state
export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState<{
    items: ContextMenuItem[]
    position: ContextMenuPosition
  } | null>(null)

  const showContextMenu = (items: ContextMenuItem[], position: ContextMenuPosition) => {
    setContextMenu({ items, position })
  }

  const hideContextMenu = () => {
    setContextMenu(null)
  }

  return {
    contextMenu,
    showContextMenu,
    hideContextMenu
  }
}
