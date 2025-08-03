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
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 bg-white rounded-lg shadow-sm border p-1.5 sm:p-2 md:p-3 lg:p-4 min-w-fit">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBackToProjects} 
          className="text-xs sm:text-sm md:text-base flex-shrink-0 min-w-fit hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Back to Projects</span>
          <span className="sm:hidden">Back</span>
        </Button>

        <div className="w-px h-4 sm:h-5 md:h-6 lg:h-7 bg-gray-200 mx-1 sm:mx-2 flex-shrink-0" />

      {onTogglePreview && (
        <>
          <Button 
            variant={showPreview ? "default" : "ghost"} 
            size="sm" 
            onClick={onTogglePreview}
            title="Toggle Live Preview"
            className="flex-shrink-0 p-1.5 sm:p-2 md:p-2.5 lg:p-3 hover:bg-gray-100 transition-colors"
          >
            {showPreview ? (
              <EyeOff className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5" />
            ) : (
              <Eye className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5" />
            )}
            <span className="hidden md:inline ml-1 sm:ml-2 text-xs sm:text-sm">
              {showPreview ? 'Hide' : 'Show'} Preview
            </span>
          </Button>
          
          {showPreview && onPreviewModeChange && (
            <div className="flex bg-gray-100 rounded-md p-0.5 sm:p-1 flex-shrink-0 overflow-hidden">
              <Button
                variant={previewMode === 'static' ? "default" : "ghost"}
                size="sm"
                onClick={() => onPreviewModeChange('static')}
                className="h-6 sm:h-7 md:h-8 lg:h-9 px-1.5 sm:px-2 md:px-3 lg:px-4 text-xs sm:text-sm min-w-fit hover:bg-white transition-colors"
                title="Static Preview"
              >
                <Code2 className="w-3 sm:w-3.5 md:w-4 h-3 sm:h-3.5 md:h-4" />
                <span className="hidden lg:inline ml-1">Static</span>
              </Button>
              <Button
                variant={previewMode === 'functional' ? "default" : "ghost"}
                size="sm"
                onClick={() => onPreviewModeChange('functional')}
                className="h-6 sm:h-7 md:h-8 lg:h-9 px-1.5 sm:px-2 md:px-3 lg:px-4 text-xs sm:text-sm min-w-fit hover:bg-white transition-colors"
                title="Mock Testing"
              >
                <Zap className="w-3 sm:w-3.5 md:w-4 h-3 sm:h-3.5 md:h-4" />
                <span className="hidden lg:inline ml-1">Mock</span>
              </Button>
              <Button
                variant={previewMode === 'testnet' ? "default" : "ghost"}
                size="sm"
                onClick={() => onPreviewModeChange('testnet')}
                className="h-6 sm:h-7 md:h-8 lg:h-9 px-1.5 sm:px-2 md:px-3 lg:px-4 text-xs sm:text-sm min-w-fit hover:bg-white transition-colors"
                title="Real Mainnet"
              >
                <Link className="w-3 sm:w-3.5 md:w-4 h-3 sm:h-3.5 md:h-4" />
                <span className="hidden lg:inline ml-1">Live</span>
              </Button>
            </div>
          )}
        </>
      )}

      <Button 
        variant="ghost" 
        size="sm" 
        className="p-1.5 sm:p-2 md:p-2.5 lg:p-3 flex-shrink-0 hover:bg-gray-100 transition-colors"
        title="Settings"
      >
        <Settings className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5" />
        <span className="hidden xl:inline ml-2 text-sm">Settings</span>
      </Button>

      <Button 
        variant="ghost" 
        size="sm" 
        className="p-1.5 sm:p-2 md:p-2.5 lg:p-3 flex-shrink-0 hover:bg-gray-100 transition-colors"
        title="Help"
      >
        <HelpCircle className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5" />
        <span className="hidden xl:inline ml-2 text-sm">Help</span>
      </Button>
      </div>
    </div>
  )
}
