"use client"

import { useState } from "react"
import { FlowCanvas } from "@/components/flow-canvas"
import { ProjectSelector } from "@/components/project-selector"
import { GridBackground } from "@/components/grid-background"

export default function ToolingSelection() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  if (!selectedProject) {
    return (
      <div className="relative min-h-screen bg-black overflow-hidden">
        <GridBackground />
        <div className="relative z-10 flex-1">
          <ProjectSelector onProjectSelect={setSelectedProject} />
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <FlowCanvas projectId={selectedProject} />
    </div>
  )
} 