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
      case "beginner": return "bg-green-100 text-green-800"
      case "intermediate": return "bg-yellow-100 text-yellow-800"
      case "advanced": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
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
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Choose a Template</h1>
              <p className="text-gray-600 mt-2">Start with a pre-built flow template to get up and running quickly</p>
            </div>
            <Button variant="outline" onClick={onClose}>
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
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
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
              <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCategoryIcon(template.category)}</span>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getDifficultyColor(template.difficulty)}>
                            {template.difficulty}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-3 h-3" />
                            {template.estimatedTime}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-2">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Features:</h4>
                      <div className="flex flex-wrap gap-1">
                        {template.features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {template.features.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-sm text-gray-500">
                        {template.nodes.length} components
                      </div>
                      <Button 
                        onClick={() => handleTemplateClick(template)}
                        className="group-hover:bg-blue-600"
                      >
                        Use Template
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Template Configuration Dialog */}
      <Dialog open={showInputDialog} onOpenChange={setShowInputDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configure {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              Customize your template with the following settings to generate a personalized flow.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {selectedTemplate?.requiredInputs?.map((input) => (
              <div key={input.key} className="space-y-2">
                <Label htmlFor={input.key} className="flex items-center gap-2">
                  {input.label}
                  {input.required && <span className="text-red-500">*</span>}
                </Label>
                <p className="text-sm text-gray-600">{input.description}</p>
                
                {input.type === "select" ? (
                  <Select 
                    value={templateInputs[input.key] || input.defaultValue} 
                    onValueChange={(value) => handleInputChange(input.key, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${input.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {input.options?.map((option) => (
                        <SelectItem key={option} value={option}>
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
                  />
                )}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInputDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject}>
              Create Project
              <Zap className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 