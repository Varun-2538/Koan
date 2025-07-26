"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Coins, Vote, Layout, Server, Bot, Repeat, Link, Clock, Database, Wallet } from "lucide-react"

const nodeCategories = [
  {
    name: "DeFi Protocols",
    nodes: [
      {
        type: "uniswapV3Router",
        label: "Uniswap V3 Router",
        description: "Decentralized exchange router for token swaps",
        icon: Repeat,
        color: "bg-pink-500",
      },
      {
        type: "chainlinkOracle",
        label: "Chainlink Oracle",
        description: "Decentralized price feeds and data",
        icon: Link,
        color: "bg-blue-600",
      },
    ],
  },
  {
    name: "Smart Contracts",
    nodes: [
      {
        type: "erc20Token",
        label: "ERC-20 Token",
        description: "Standard fungible token contract",
        icon: Coins,
        color: "bg-blue-500",
      },
      {
        type: "governance",
        label: "Governance",
        description: "DAO governance and voting system",
        icon: Vote,
        color: "bg-purple-500",
      },
    ],
  },
  {
    name: "Frontend UI",
    nodes: [
      {
        type: "swapInterface",
        label: "Swap Interface",
        description: "Token swap UI with advanced features",
        icon: Layout,
        color: "bg-purple-500",
      },
      {
        type: "walletConnector",
        label: "Wallet Connector",
        description: "Multi-wallet connection component",
        icon: Wallet,
        color: "bg-yellow-500",
      },
      {
        type: "transactionHistory",
        label: "Transaction History",
        description: "User transaction history display",
        icon: Clock,
        color: "bg-indigo-500",
      },
      {
        type: "dashboard",
        label: "Dashboard Page",
        description: "Admin dashboard with charts and data",
        icon: Layout,
        color: "bg-green-500",
      },
    ],
  },
  {
    name: "Backend API",
    nodes: [
      {
        type: "swapAPI",
        label: "Swap API",
        description: "RESTful API for swap operations",
        icon: Server,
        color: "bg-emerald-500",
      },
      {
        type: "tokenDataService",
        label: "Token Data Service",
        description: "Token prices and metadata service",
        icon: Database,
        color: "bg-teal-500",
      },
      {
        type: "apiEndpoint",
        label: "API Endpoint",
        description: "REST API endpoint with CRUD operations",
        icon: Server,
        color: "bg-orange-500",
      },
    ],
  },
  {
    name: "AI Agents",
    nodes: [
      {
        type: "aiAgent",
        label: "AI Agent",
        description: "Intelligent decision-making agent",
        icon: Bot,
        color: "bg-pink-500",
      },
    ],
  },
]

interface ComponentPaletteProps {}

export function ComponentPalette({}: ComponentPaletteProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(nodeCategories.map(cat => cat.name))
  )

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName)
    } else {
      newExpanded.add(categoryName)
    }
    setExpandedCategories(newExpanded)
  }

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType)
    event.dataTransfer.effectAllowed = "move"
  }

  const filteredCategories = nodeCategories.map(category => ({
    ...category,
    nodes: category.nodes.filter(
      node =>
        node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.nodes.length > 0)

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-3">Components</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredCategories.map((category) => (
          <div key={category.name}>
            <button
              className="flex items-center justify-between w-full text-left font-medium text-gray-700 hover:text-gray-900 mb-2"
              onClick={() => toggleCategory(category.name)}
            >
              <span>{category.name}</span>
              <span className="text-xs text-gray-500">
                {expandedCategories.has(category.name) ? "−" : "+"}
              </span>
            </button>

            {expandedCategories.has(category.name) && (
              <div className="space-y-2 ml-2">
                {category.nodes.map((node) => (
                  <Card
                    key={node.type}
                    className="cursor-grab hover:shadow-md transition-shadow border-l-4"
                    style={{ borderLeftColor: node.color.replace('bg-', '').replace('-500', '') }}
                    draggable
                    onDragStart={(event) => onDragStart(event, node.type)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 ${node.color} text-white rounded-lg`}>
                          <node.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-gray-900 truncate">
                            {node.label}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {node.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">🔍</div>
          <p className="text-gray-500 text-sm">No components found</p>
        </div>
      )}

      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <h3 className="font-medium text-blue-900 mb-2">💡 Quick Start</h3>
        <p className="text-sm text-blue-700">
          Drag components from the palette to the canvas to build your flow. Connect them to create your DeFi application!
        </p>
      </div>
    </div>
  )
}
