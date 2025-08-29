"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Coins, 
  Clock, 
  Repeat, 
  Wallet, 
  Layout, 
  Server, 
  Database, 
  TrendingUp, 
  Activity, 
  Zap,
  ChevronDown,
  ChevronRight,
  Search,
  ArrowLeftRight,
  Loader2
} from "lucide-react"
import { unitePluginSystem } from "@/lib/plugin-system"
import { PluginDefinition } from "@/lib/plugin-system/types"

interface ComponentItem {
  id: string
  name: string
  description: string
  category: string
  icon: React.ReactNode
  version?: string
  tags?: string[]
  plugin?: PluginDefinition
}

// Icon mapping for plugin categories
const getIconForCategory = (category: string) => {
  switch (category) {
    case 'DeFi': return <Repeat className="w-4 h-4" />
    case 'Bridge': return <ArrowLeftRight className="w-4 h-4" />
    case 'Logic': return <span className="text-xs">🔀</span>
    case 'Data': return <span className="text-xs">🔄</span>
    case 'Wallet': return <Wallet className="w-4 h-4" />
    case 'UI': return <Layout className="w-4 h-4" />
    case 'Infrastructure': return <Server className="w-4 h-4" />
    case 'Analytics': return <TrendingUp className="w-4 h-4" />
    default: return <Activity className="w-4 h-4" />
  }
}

// Convert plugin to component item
const pluginToComponent = (plugin: PluginDefinition): ComponentItem => ({
  id: plugin.id,
  name: plugin.name,
  description: plugin.description,
  category: plugin.category,
  version: plugin.version,
  tags: plugin.tags,
  icon: getIconForCategory(plugin.category),
  plugin
})

export function ComponentPalette() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["DeFi"]))
  const [components, setComponents] = useState<ComponentItem[]>([])
  const [categories, setCategories] = useState<string[]>(["All"])
  const [loading, setLoading] = useState(true)

  // Load components from plugin registry
  useEffect(() => {
    const loadComponents = async () => {
      try {
        setLoading(true)
        
        // Discover and load plugins
        await unitePluginSystem.registry.discoverPlugins()
        
        // Get all registered plugins
        const plugins = unitePluginSystem.registry.getAllPlugins()
        
        // Convert plugins to components
        const pluginComponents = plugins.map(pluginToComponent)
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(plugins.map(p => p.category))
        ).sort()
        
        setComponents(pluginComponents)
        setCategories(["All", ...uniqueCategories])
        
      } catch (error) {
        console.error('Failed to load plugin components:', error)
        // Fallback to empty state
        setComponents([])
        setCategories(["All"])
      } finally {
        setLoading(false)
      }
    }

    loadComponents()
  }, [])

  const filteredComponents = components.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (component.tags && component.tags.some(tag => 
                           tag.toLowerCase().includes(searchTerm.toLowerCase())
                         ))
    const matchesCategory = selectedCategory === "All" || component.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType)
    event.dataTransfer.effectAllowed = "move"
  }

  const groupedComponents = categories.slice(1).reduce((acc, category) => {
    acc[category] = filteredComponents.filter(comp => comp.category === category)
    return acc
  }, {} as Record<string, ComponentItem[]>)

  if (loading) {
    return (
      <div className="w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col h-full max-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-sm text-gray-600">Loading plugins...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col h-full max-h-screen">
      <div className="p-2 sm:p-4 border-b">
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <h2 className="text-base sm:text-lg font-semibold">Components</h2>
          <Badge variant="outline" className="text-xs">
            {components.length}
          </Badge>
        </div>
        
        {/* Search */}
        <div className="relative mb-2 sm:mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {categories.map(category => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
              {category !== "All" && (
                <span className="ml-1 opacity-70">
                  ({components.filter(c => c.category === category).length})
                </span>
              )}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4">
        {selectedCategory === "All" ? (
          // Show grouped by category
          Object.entries(groupedComponents).map(([category, components]) => (
            <div key={category} className="space-y-1 sm:space-y-2">
              <button
                onClick={() => toggleCategory(category)}
                className="flex items-center gap-2 w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                {expandedCategories.has(category) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                {category} ({components.length})
              </button>
              
              {expandedCategories.has(category) && (
                <div className="pl-6 space-y-1 sm:space-y-2">
                  {components.map(component => (
                    <ComponentCard
                      key={component.id}
                      component={component}
                      onDragStart={onDragStart}
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          // Show flat list for specific category
          <div className="space-y-1 sm:space-y-2">
            {filteredComponents.map(component => (
              <ComponentCard
                key={component.id}
                component={component}
                onDragStart={onDragStart}
              />
            ))}
          </div>
        )}

        {filteredComponents.length === 0 && (
          <div className="text-center text-gray-500 py-4 sm:py-8">
            <Search className="w-6 sm:w-8 h-6 sm:h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No components found</p>
            <p className="text-xs">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-2 sm:p-4 border-t bg-gray-50">
        <div className="text-xs text-gray-600 space-y-1">
          <div className="font-medium">💡 How to use:</div>
          <div className="hidden sm:block">• Drag components to the canvas</div>
          <div className="hidden sm:block">• Connect nodes to create workflows</div>
          <div className="hidden sm:block">• Click nodes to configure them</div>
          <div className="sm:hidden">• Tap components to add</div>
          <div className="sm:hidden">• Long press to configure</div>
          <div className="text-xs text-gray-400 mt-2">
            Powered by Plugin System v{unitePluginSystem.version}
          </div>
        </div>
      </div>
    </div>
  )
}

function ComponentCard({ 
  component, 
  onDragStart 
}: { 
  component: ComponentItem
  onDragStart: (event: React.DragEvent, nodeType: string) => void 
}) {
  return (
    <Card
      className="cursor-grab hover:shadow-md transition-shadow border border-gray-200"
      draggable
      onDragStart={(event) => onDragStart(event, component.id)}
    >
      <CardContent className="p-2 sm:p-3">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="flex-shrink-0 p-1.5 sm:p-2 bg-blue-50 rounded-lg">
            {component.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1">
              <h3 className="font-medium text-xs sm:text-sm text-gray-900 truncate">
                {component.name}
              </h3>
              {component.version && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  v{component.version}
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 sm:line-clamp-none">
              {component.description}
            </p>
            <div className="flex items-center gap-2 mt-1 sm:mt-2">
              <Badge variant="outline" className="text-xs">
                {component.category}
              </Badge>
              {component.tags && component.tags.length > 0 && (
                <div className="flex gap-1">
                  {component.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs px-1 py-0 opacity-70">
                      {tag}
                    </Badge>
                  ))}
                  {component.tags.length > 2 && (
                    <span className="text-xs text-gray-400">+{component.tags.length - 2}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
