"use client"

import { useState } from "react"
import { FlowCanvas } from "@/components/flow-canvas"
import { ProjectSelector } from "@/components/project-selector"
import { DemoNotice } from "@/components/demo-notice"

export default function ToolingSelection() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  if (!selectedProject) {
    return (
      <div className="h-screen flex flex-col">
        <DemoNotice />
        <div className="flex-1">
          <ProjectSelector onProjectSelect={setSelectedProject} />
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <DemoNotice />
      <div className="flex-1">
        <FlowCanvas projectId={selectedProject} />
      </div>
    </div>
  )
} 