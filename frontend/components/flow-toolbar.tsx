"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings, HelpCircle } from "lucide-react"

interface FlowToolbarProps {
  projectId: string
}

export function FlowToolbar({ projectId }: FlowToolbarProps) {
  const handleBackToProjects = () => {
    window.location.reload() // Simple way to go back to project selector
  }

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border p-2">
      <Button variant="ghost" size="sm" onClick={handleBackToProjects}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Projects
      </Button>

      <div className="w-px h-6 bg-gray-200 mx-2" />

      <Button variant="ghost" size="sm">
        <Settings className="w-4 h-4" />
      </Button>

      <Button variant="ghost" size="sm">
        <HelpCircle className="w-4 h-4" />
      </Button>
    </div>
  )
}
