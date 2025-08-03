"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, FolderOpen, Calendar, Zap, Layers } from "lucide-react"
import { TemplateSelector } from "./template-selector"
import { getTemplateById } from "@/lib/templates"

interface Project {
  id: string
  name: string
  description: string
  created_at: string
  templateId?: string
}

interface ProjectSelectorProps {
  onProjectSelect: (projectId: string) => void
}

export function ProjectSelector({ onProjectSelect }: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")
  const [creating, setCreating] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    const demoProjects = [
      {
        id: "demo-1",
        name: "DeFi Trading Bot",
        description: "AI-powered trading bot with smart contracts",
        created_at: new Date().toISOString(),
        templateId: "ai-trading-bot"
      },
      {
        id: "demo-2",
        name: "DAO Governance Platform",
        description: "Decentralized voting and proposal system",
        created_at: new Date().toISOString(),
        templateId: "basic-dao-governance"
      },
      {
        id: "demo-3",
        name: "NFT Marketplace",
        description: "Complete NFT trading platform with AI curation",
        created_at: new Date().toISOString(),
      },
    ]
    setProjects(demoProjects)
    setLoading(false)
  }

  const createProject = async () => {
    if (!newProjectName.trim()) return

    setCreating(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const newProject = {
      id: `demo-${Date.now()}`,
      name: newProjectName,
      description: newProjectDescription,
      created_at: new Date().toISOString(),
    }
    setProjects([newProject, ...projects])
    setNewProjectName("")
    setNewProjectDescription("")
    setDialogOpen(false)
    setCreating(false)
  }

  const handleTemplateSelect = async (templateId: string, inputs: Record<string, any>) => {
    const template = getTemplateById(templateId)
    if (!template) return

    // Store the template inputs globally for access in flow-canvas
    window.templateInputs = inputs

    // Create project with template - IMPORTANT: Include templateId in the project ID
    const projectName = inputs.appName || template.name
    const newProject = {
      id: `template-${templateId}`, // Use templateId directly in project ID
      name: projectName,
      description: `Created from ${template.name} template`,
      created_at: new Date().toISOString(),
      templateId: templateId,
      templateInputs: inputs
    }
    
    setProjects([newProject, ...projects])
    setShowTemplateSelector(false)
    
    // Automatically select the new project
    onProjectSelect(newProject.id)
  }

  const getProjectIcon = (project: Project) => {
    if (project.templateId) {
      const template = getTemplateById(project.templateId)
      switch (template?.category) {
        case "defi": return "💱"
        case "dao": return "🏛️"
        case "nft": return "🎨"
        case "ai": return "🤖"
        default: return "📦"
      }
    }
    return <FolderOpen className="w-5 h-5" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400"></div>
      </div>
    )
  }

  if (showTemplateSelector) {
    return (
      <TemplateSelector 
        onTemplateSelect={handleTemplateSelect}
        onClose={() => setShowTemplateSelector(false)}
      />
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Your Projects</h1>
            <p className="text-gray-300 mt-2">Select a project to start building flows</p>
          </div>
          <div className="flex gap-4">
            <Button 
              variant="outline"
              onClick={() => setShowTemplateSelector(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700"
            >
              <Layers className="w-4 h-4 mr-2" />
              Use Template
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white border-0">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>Create a new project to organize your flows and generated code.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input
                      id="project-name"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="My Awesome DApp"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-description">Description</Label>
                    <Input
                      id="project-description"
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                      placeholder="A decentralized application with AI agents"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createProject} disabled={creating}>
                    {creating ? "Creating..." : "Create Project"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="cursor-pointer transition-all duration-300 hover:scale-[1.02] bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  {typeof getProjectIcon(project) === 'string' ? (
                    <span className="text-xl">{getProjectIcon(project)}</span>
                  ) : (
                    <div className="text-blue-400">{getProjectIcon(project)}</div>
                  )}
                  {project.name}
                  {project.templateId && (
                    <Badge variant="secondary" className="ml-auto bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Template
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-gray-300">{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {new Date(project.created_at).toLocaleDateString()}
                  </div>
                  <Button 
                    onClick={() => onProjectSelect(project.id)}
                    className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white border-0"
                  >
                    Open
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 max-w-lg mx-auto">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-lg font-medium text-white mb-2">Ready to build something amazing?</h3>
              <p className="text-gray-300 mb-6">Get started quickly with a template or create a project from scratch</p>
              
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => setShowTemplateSelector(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700"
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Start with Template
                </Button>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-white/30 text-gray-300 hover:text-white hover:border-white/50 bg-white/5 backdrop-blur-sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Create from Scratch
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
