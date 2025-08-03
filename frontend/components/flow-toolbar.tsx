"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings, HelpCircle, Link } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface FlowToolbarProps {
  projectId: string
  autoConnect: boolean
  setAutoConnect: (value: boolean) => void
}

export function FlowToolbar({ projectId, autoConnect, setAutoConnect }: FlowToolbarProps) {
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

      <div className="w-px h-4 sm:h-6 bg-gray-200 mx-1 sm:mx-2" />

      {/* Auto-connect toggle */}
      <div className="flex items-center gap-2">
        <Link className="w-3 sm:w-4 h-3 sm:h-4 text-gray-600" />
        <Label htmlFor="auto-connect" className="text-xs sm:text-sm text-gray-600 cursor-pointer">
          Auto-connect
        </Label>
        <Switch 
          id="auto-connect"
          checked={autoConnect}
          onCheckedChange={setAutoConnect}
          className="scale-75 sm:scale-100"
        />
      </div>

      <div className="w-px h-4 sm:h-6 bg-gray-200 mx-1 sm:mx-2" />

      <Button variant="ghost" size="sm" className="p-1 sm:p-2">
        <Settings className="w-3 sm:w-4 h-3 sm:h-4" />
      </Button>

      <Button variant="ghost" size="sm" className="p-1 sm:p-2">
        <HelpCircle className="w-3 sm:w-4 h-3 sm:h-4" />
      </Button>
    </div>
  )
}
