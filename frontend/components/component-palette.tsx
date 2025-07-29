"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  Coins, 
  Vote, 
  Layout, 
  Server, 
  Bot, 
  Repeat, 
  Link, 
  Clock, 
  Database, 
  Wallet,
  Search,
  Zap,
  TrendingUp,
  ArrowLeftRight,
  Shield,
  Target,
  ChevronDown,
  ChevronRight,
  Layers,
  Settings,
  Activity,
  GripVertical
} from "lucide-react"

interface ComponentItem {
  type: string
  name: string
  description: string
  icon: any
  category: string
  tags: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  hackathonFocus?: boolean
}

interface CategorySection {
  name: string
  icon: any
  description: string
  color: string
  components: ComponentItem[]
}

// Unite DeFi Hackathon Components - Organized like Langflow
const COMPONENT_SECTIONS: CategorySection[] = [
  {
    name: "1inch Protocol",
    icon: Zap,
    description: "1inch Pathfinder, Fusion, and trading components",
    color: "blue",
    components: [
      {
        type: "oneInchSwap",
        name: "1inch Swap",
        description: "Execute swaps using 1inch Pathfinder with MEV protection",
        icon: Zap,
        category: "1inch Protocol",
        tags: ["1inch", "swap", "pathfinder", "mev-protection"],
        difficulty: "intermediate",
        hackathonFocus: true
      },
      {
        type: "oneInchQuote",
        name: "1inch Quote",
        description: "Get real-time quotes with sub-400ms response times",
        icon: TrendingUp,
        category: "1inch Protocol",
        tags: ["1inch", "quote", "real-time"],
        difficulty: "beginner",
        hackathonFocus: true
      },
      {
        type: "fusionPlus",
        name: "Fusion+",
        description: "Cross-chain swaps with MEV protection and gasless mode",
        icon: Shield,
        category: "1inch Protocol",
        tags: ["fusion+", "cross-chain", "mev-protection", "gasless"],
        difficulty: "advanced",
        hackathonFocus: true
      },
      {
        type: "orderType",
        name: "Order Type",
        description: "Configure limit orders, stop-loss, and P2P swaps",
        icon: Target,
        category: "1inch Protocol",
        tags: ["limit-order", "stop-loss", "p2p"],
        difficulty: "advanced"
      },
      {
        type: "priceTrigger",
        name: "Price Trigger",
        description: "Set price conditions for order execution",
        icon: Clock,
        category: "1inch Protocol",
        tags: ["trigger", "price", "automation"],
        difficulty: "intermediate"
      }
    ]
  },
  {
    name: "Blockchain & Chains",
    icon: Link,
    description: "Multi-chain support and blockchain interactions",
    color: "green",
    components: [
      {
        type: "chainSelector",
        name: "Chain Selector",
        description: "Select blockchain networks for multi-chain operations",
        icon: Link,
        category: "Blockchain & Chains",
        tags: ["chain", "network", "multi-chain"],
        difficulty: "beginner",
        hackathonFocus: true
      },
      {
        type: "sourceChain",
        name: "Source Chain",
        description: "Define the originating blockchain for cross-chain operations",
        icon: ArrowLeftRight,
        category: "Blockchain & Chains",
        tags: ["source", "chain", "cross-chain"],
        difficulty: "beginner"
      },
      {
        type: "destinationChain",
        name: "Destination Chain",
        description: "Set the target blockchain for cross-chain transfers",
        icon: ArrowLeftRight,
        category: "Blockchain & Chains",
        tags: ["destination", "chain", "cross-chain"],
        difficulty: "beginner"
      }
    ]
  },
  {
    name: "Wallet & Authentication",
    icon: Wallet,
    description: "Wallet connections and user authentication",
    color: "purple",
    components: [
      {
        type: "walletConnector",
        name: "Wallet Connector",
        description: "Connect to MetaMask, WalletConnect, and other wallets",
        icon: Wallet,
        category: "Wallet & Authentication",
        tags: ["wallet", "metamask", "connection"],
        difficulty: "intermediate",
        hackathonFocus: true
      },
      {
        type: "tokenInput",
        name: "Token Input",
        description: "Token selection and amount input interface",
        icon: Coins,
        category: "Wallet & Authentication",
        tags: ["token", "input", "selection"],
        difficulty: "beginner"
      },
      {
        type: "slippageControl",
        name: "Slippage Control",
        description: "Configure slippage tolerance for trades",
        icon: Settings,
        category: "Wallet & Authentication",
        tags: ["slippage", "tolerance", "settings"],
        difficulty: "beginner"
      }
    ]
  },
  {
    name: "Transaction & Monitoring",
    icon: Activity,
    description: "Transaction tracking and status monitoring",
    color: "orange",
    components: [
      {
        type: "transactionStatus",
        name: "Transaction Status",
        description: "Monitor transaction progress and confirmations",
        icon: Activity,
        category: "Transaction & Monitoring",
        tags: ["transaction", "status", "monitoring"],
        difficulty: "intermediate",
        hackathonFocus: true
      },
      {
        type: "portfolioTracker",
        name: "Portfolio Tracker",
        description: "Track portfolio performance and analytics",
        icon: TrendingUp,
        category: "Transaction & Monitoring",
        tags: ["portfolio", "analytics", "tracking"],
        difficulty: "intermediate"
      },
      {
        type: "yieldOptimizer",
        name: "Yield Optimizer",
        description: "Optimize yield farming across multiple protocols",
        icon: TrendingUp,
        category: "Transaction & Monitoring",
        tags: ["yield", "farming", "optimization"],
        difficulty: "advanced"
      }
    ]
  },
  {
    name: "DeFi Protocols",
    icon: Layers,
    description: "Integration with various DeFi protocols",
    color: "indigo",
    components: [
      {
        type: "governanceResults",
        name: "Governance Results",
        description: "Display DAO voting results and proposals",
        icon: Vote,
        category: "DeFi Protocols",
        tags: ["governance", "dao", "voting"],
        difficulty: "advanced"
      },
      {
        type: "uniswapV3Router",
        name: "Uniswap V3 Router",
        description: "Direct integration with Uniswap V3 protocol",
        icon: Repeat,
        category: "DeFi Protocols",
        tags: ["uniswap", "v3", "router"],
        difficulty: "advanced"
      },
      {
        type: "chainlinkOracle",
        name: "Chainlink Oracle",
        description: "Price feeds and external data integration",
        icon: Database,
        category: "DeFi Protocols",
        tags: ["chainlink", "oracle", "price"],
        difficulty: "advanced"
      }
    ]
  },
  {
    name: "User Interface",
    icon: Layout,
    description: "UI components and interface elements",
    color: "gray",
    components: [
      {
        type: "swapInterface",
        name: "Swap Interface",
        description: "Professional trading interface UI component",
        icon: Layout,
        category: "User Interface",
        tags: ["ui", "interface", "swap"],
        difficulty: "intermediate"
      },
      {
        type: "dashboard",
        name: "Dashboard",
        description: "Analytics dashboard with charts and metrics",
        icon: Layout,
        category: "User Interface",
        tags: ["dashboard", "analytics", "ui"],
        difficulty: "intermediate"
      }
    ]
  },
  {
    name: "Infrastructure",
    icon: Server,
    description: "Backend services and API endpoints",
    color: "slate",
    components: [
      {
        type: "apiEndpoint",
        name: "API Endpoint",
        description: "Create REST API endpoints for your DeFi app",
        icon: Server,
        category: "Infrastructure",
        tags: ["api", "endpoint", "backend"],
        difficulty: "intermediate"
      },
      {
        type: "erc20Token",
        name: "ERC-20 Token",
        description: "Deploy and manage ERC-20 tokens",
        icon: Coins,
        category: "Infrastructure",
        tags: ["token", "erc20", "smart-contract"],
        difficulty: "intermediate"
      }
    ]
  }
]

export function ComponentPalette() {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "1inch Protocol", 
    "Blockchain & Chains", 
    "Wallet & Authentication"
  ])
  const [showHackathonOnly, setShowHackathonOnly] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(320)
  const [isResizing, setIsResizing] = useState(false)

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType)
    event.dataTransfer.effectAllowed = "move"
  }

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionName) 
        ? prev.filter(name => name !== sectionName)
        : [...prev, sectionName]
    )
  }

  const toggleAllSections = () => {
    const allSectionNames = COMPONENT_SECTIONS.map(section => section.name)
    setExpandedSections(prev => 
      prev.length === allSectionNames.length ? [] : allSectionNames
    )
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(280, Math.min(600, e.clientX))
      setSidebarWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const filteredSections = COMPONENT_SECTIONS.map(section => ({
    ...section,
    components: section.components.filter(component => {
      const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           component.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesHackathon = !showHackathonOnly || component.hackathonFocus

      return matchesSearch && matchesHackathon
    })
  })).filter(section => section.components.length > 0)

  const totalComponents = filteredSections.reduce((sum, section) => sum + section.components.length, 0)

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSectionColor = (color: string, type: 'bg' | 'text' | 'border') => {
    const colors = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
      gray: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
      slate: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' }
    }
    return colors[color as keyof typeof colors]?.[type] || colors.gray[type]
  }

  return (
    <div className="relative flex">
      <Card 
        className="h-full border-r flex flex-col relative"
        style={{ width: `${sidebarWidth}px` }}
      >
        <CardHeader className="pb-3 flex-shrink-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            DeFi Components
          </CardTitle>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search components..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant={showHackathonOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowHackathonOnly(!showHackathonOnly)}
                  className="h-7 text-xs"
                >
                  🏆 Hackathon
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAllSections}
                  className="h-7 text-xs"
                >
                  {expandedSections.length === COMPONENT_SECTIONS.length ? 'Collapse All' : 'Expand All'}
                </Button>
              </div>
              <Badge variant="secondary" className="text-xs">
                {totalComponents} nodes
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-2 pb-4">
              {filteredSections.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No components found</p>
                  <p className="text-xs">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredSections.map((section) => {
                    const SectionIcon = section.icon
                    const isExpanded = expandedSections.includes(section.name)
                    
                    return (
                      <Collapsible
                        key={section.name}
                        open={isExpanded}
                        onOpenChange={() => toggleSection(section.name)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            className={`w-full justify-start p-2 h-auto font-medium text-left hover:${getSectionColor(section.color, 'bg')}`}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <div className={`p-1.5 rounded ${getSectionColor(section.color, 'bg')}`}>
                                <SectionIcon className={`w-4 h-4 ${getSectionColor(section.color, 'text')}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-sm truncate">{section.name}</span>
                                  <div className="flex items-center gap-1 ml-2">
                                    <Badge variant="secondary" className="text-xs">
                                      {section.components.length}
                                    </Badge>
                                    {isExpanded ? (
                                      <ChevronDown className="w-4 h-4" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4" />
                                    )}
                                  </div>
                                </div>
                                <p className="text-xs text-gray-500 truncate">{section.description}</p>
                              </div>
                            </div>
                          </Button>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <div className="ml-2 mt-1 space-y-2">
                            {section.components.map((component) => {
                              const ComponentIcon = component.icon
                              return (
                                <div
                                  key={component.type}
                                  className={`p-2 border rounded-lg cursor-move hover:shadow-sm transition-all group ${
                                    component.hackathonFocus 
                                      ? `${getSectionColor(section.color, 'border')} ${getSectionColor(section.color, 'bg')}` 
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                  draggable
                                  onDragStart={(e) => onDragStart(e, component.type)}
                                >
                                  <div className="flex items-start gap-2">
                                    <div className={`p-1.5 rounded-md flex-shrink-0 ${
                                      component.hackathonFocus 
                                        ? getSectionColor(section.color, 'text') + ' bg-white' 
                                        : 'bg-gray-500 text-white'
                                    } group-hover:scale-105 transition-transform`}>
                                      <ComponentIcon className="w-3 h-3" />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0 overflow-hidden">
                                      <div className="flex items-start justify-between mb-1">
                                        <h3 className="font-medium text-xs truncate pr-1">
                                          {component.name}
                                        </h3>
                                        {component.hackathonFocus && (
                                          <Badge className={`text-xs flex-shrink-0 ${getSectionColor(section.color, 'text')} ${getSectionColor(section.color, 'bg')}`}>
                                            🏆
                                          </Badge>
                                        )}
                                      </div>
                                      
                                      <p className="text-xs text-gray-600 mb-2 line-clamp-2 break-words">
                                        {component.description}
                                      </p>
                                      
                                      <div className="flex items-center justify-between gap-1">
                                        <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                                          {component.tags.slice(0, 1).map(tag => (
                                            <Badge key={tag} variant="secondary" className="text-xs truncate">
                                              {tag}
                                            </Badge>
                                          ))}
                                          {component.tags.length > 1 && (
                                            <Badge variant="secondary" className="text-xs">
                                              +{component.tags.length - 1}
                                            </Badge>
                                          )}
                                        </div>
                                        
                                        {component.difficulty && (
                                          <Badge className={`text-xs flex-shrink-0 ${getDifficultyColor(component.difficulty)}`}>
                                            {component.difficulty.charAt(0).toUpperCase()}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        {/* Resize Handle */}
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize bg-gray-300 opacity-0 hover:opacity-100 transition-opacity ${
            isResizing ? 'opacity-100 bg-blue-500' : ''
          }`}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2">
            <GripVertical className="w-4 h-4 text-gray-500" />
          </div>
        </div>
      </Card>
    </div>
  )
}
