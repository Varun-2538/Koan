"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings, HelpCircle, Eye, EyeOff, Code2, Zap, Link } from "lucide-react"

interface FlowToolbarProps {
  projectId: string
  showPreview?: boolean
  onTogglePreview?: () => void
  previewMode?: 'static' | 'functional' | 'testnet'
  onPreviewModeChange?: (mode: 'static' | 'functional' | 'testnet') => void
}

export function FlowToolbar({ 
  projectId, 
  showPreview = false, 
  onTogglePreview, 
  previewMode = 'testnet',
  onPreviewModeChange 
}: FlowToolbarProps) {
  const handleBackToProjects = () => {
    window.location.reload() // Simple way to go back to project selector
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-lg shadow-sm border p-1 sm:p-2">
      <Button variant="ghost" size="sm" onClick={handleBackToProjects} className="text-xs sm:text-sm">
        <ArrowLeft className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
        <span className="hidden sm:inline">Back to Projects</span>
        <span className="sm:hidden">Back</span>
      </Button>

      <div className="w-px h-6 bg-gray-200 mx-2" />

      {onTogglePreview && (
        <>
          <Button 
            variant={showPreview ? "default" : "ghost"} 
            size="sm" 
            onClick={onTogglePreview}
            title="Toggle Live Preview"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          
          {showPreview && onPreviewModeChange && (
            <div className="flex bg-gray-100 rounded-md p-1">
              <Button
                variant={previewMode === 'static' ? "default" : "ghost"}
                size="sm"
                onClick={() => onPreviewModeChange('static')}
                className="h-6 px-2 text-xs"
                title="Static Preview"
              >
                <Code2 className="w-3 h-3" />
              </Button>
              <Button
                variant={previewMode === 'functional' ? "default" : "ghost"}
                size="sm"
                onClick={() => onPreviewModeChange('functional')}
                className="h-6 px-2 text-xs"
                title="Mock Testing"
              >
                <Zap className="w-3 h-3" />
              </Button>
              <Button
                variant={previewMode === 'testnet' ? "default" : "ghost"}
                size="sm"
                onClick={() => onPreviewModeChange('testnet')}
                className="h-6 px-2 text-xs"
                title="Real Mainnet"
              >
                <Link className="w-3 h-3" />
              </Button>
            </div>
          )}
        </>
      )}

      <Button variant="ghost" size="sm" className="p-1 sm:p-2">
        <Settings className="w-3 sm:w-4 h-3 sm:h-4" />
      </Button>

      <Button variant="ghost" size="sm" className="p-1 sm:p-2">
        <HelpCircle className="w-3 sm:w-4 h-3 sm:h-4" />
      </Button>
    </div>
  )
}