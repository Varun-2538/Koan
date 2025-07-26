"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FLOW_TEMPLATES, type FlowTemplate } from "@/lib/templates"
import { Search, Clock, Star, Zap, ArrowRight, Settings } from "lucide-react"
import { GridBackground } from "@/components/grid-background"

interface TemplateSelectorProps {
  onTemplateSelect: (templateId: string, inputs: Record<string, any>) => void
  onClose: () => void
}

export function TemplateSelector({ onTemplateSelect, onClose }: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedTemplate, setSelectedTemplate] = useState<FlowTemplate | null>(null)
  const [showInputDialog, setShowInputDialog] = useState(false)
  const [templateInputs, setTemplateInputs] = useState<Record<string, any>>({})

  const categories = ["all", "defi", "dao", "nft", "ai", "infrastructure"]

  const filteredTemplates = FLOW_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500/20 text-green-300 border-green-500/30"
      case "intermediate": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "advanced": return "bg-red-500/20 text-red-300 border-red-500/30"
      default: return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "defi": return "💱"
      case "dao": return "🏛️"
      case "nft": return "🎨"
      case "ai": return "🤖"
      case "infrastructure": return "⚙️"
      default: return "📦"
    }
  }

  const handleTemplateClick = (template: FlowTemplate) => {
    setSelectedTemplate(template)
    
    // Initialize inputs with default values
    const initialInputs: Record<string, any> = {}
    template.requiredInputs?.forEach(input => {
      initialInputs[input.key] = input.defaultValue || ""
    })
    setTemplateInputs(initialInputs)
    
    if (template.requiredInputs && template.requiredInputs.length > 0) {
      setShowInputDialog(true)
    } else {
      onTemplateSelect(template.id, {})
    }
  }

  const handleInputChange = (key: string, value: any) => {
    setTemplateInputs(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleCreateProject = () => {
    if (selectedTemplate) {
      onTemplateSelect(selectedTemplate.id, templateInputs)
      setShowInputDialog(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-black relative overflow-hidden">
        <GridBackground />
        
        <div className="relative z-10 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white">Choose a Template</h1>
                <p className="text-gray-300 mt-2">Start with a pre-built flow template to get up and running quickly</p>
              </div>
              <Button 
                variant="outline" 
                onClick={onClose}
                className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 bg-transparent"
              >
                Start from Scratch
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-500"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {categories.map(category => (
                    <SelectItem key={category} value={category} className="text-white hover:bg-gray-700">
                      {category === "all" ? "All Categories" : 
                       `${getCategoryIcon(category)} ${category.charAt(0).toUpperCase() + category.slice(1)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>
                  <Card className="relative cursor-pointer hover:shadow-2xl transition-all duration-300 group bg-gray-900/80 backdrop-blur-sm border-gray-600/30 hover:border-gray-500/50">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getCategoryIcon(template.category)}</span>
                          <div>
                            <CardTitle className="text-lg text-white">{template.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`${getDifficultyColor(template.difficulty)} border`}>
                                {template.difficulty}
                              </Badge>
                              <div className="flex items-center gap-1 text-sm text-gray-400">
                                <Clock className="w-3 h-3" />
                                {template.estimatedTime}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <CardDescription className="mt-2 text-gray-300">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Features:</h4>
                          <div className="flex flex-wrap gap-1">
                            {template.features.slice(0, 3).map((feature, index) => (
                              <Badge key={index} variant="secondary" className="text-xs bg-gray-700/50 text-gray-300 border-gray-600">
                                {feature}
                              </Badge>
                            ))}
                            {template.features.length > 3 && (
                              <Badge variant="secondary" className="text-xs bg-gray-700/50 text-gray-300 border-gray-600">
                                +{template.features.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2">
                          <div className="text-sm text-gray-400">
                            {template.nodes.length} components
                          </div>
                          <Button 
                            onClick={() => handleTemplateClick(template)}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold transition-all duration-200 transform hover:scale-105"
                          >
                            Use Template
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-white mb-2">No templates found</h3>
                <p className="text-gray-400">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Template Configuration Dialog */}
      <Dialog open={showInputDialog} onOpenChange={setShowInputDialog}>
        <DialogContent className="max-w-2xl bg-gray-900 border-gray-600">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Settings className="w-5 h-5" />
              Configure {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Customize your template with the following settings to generate a personalized flow.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {selectedTemplate?.requiredInputs?.map((input) => (
              <div key={input.key} className="space-y-2">
                <Label htmlFor={input.key} className="flex items-center gap-2 text-gray-300">
                  {input.label}
                  {input.required && <span className="text-red-400">*</span>}
                </Label>
                <p className="text-sm text-gray-400">{input.description}</p>
                
                {input.type === "select" ? (
                  <Select 
                    value={templateInputs[input.key] || input.defaultValue} 
                    onValueChange={(value) => handleInputChange(input.key, value)}
                  >
                    <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                      <SelectValue placeholder={`Select ${input.label}`} />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {input.options?.map((option) => (
                        <SelectItem key={option} value={option} className="text-white hover:bg-gray-700">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={input.key}
                    type={input.type === "number" ? "number" : "text"}
                    value={templateInputs[input.key] || ""}
                    onChange={(e) => handleInputChange(input.key, e.target.value)}
                    placeholder={input.defaultValue?.toString() || `Enter ${input.label}`}
                    className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-500"
                  />
                )}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowInputDialog(false)}
              className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 bg-transparent"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateProject}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
            >
              Create Project
              <Zap className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 