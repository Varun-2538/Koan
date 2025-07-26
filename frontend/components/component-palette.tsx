"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Coins, Vote, Layout, Server, Bot } from "lucide-react"

const nodeCategories = [
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

export function ComponentPalette() {
  const [searchTerm, setSearchTerm] = useState("")

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType)
    event.dataTransfer.effectAllowed = "move"
  }

  const filteredCategories = nodeCategories
    .map((category) => ({
      ...category,
      nodes: category.nodes.filter(
        (node) =>
          node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.description.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((category) => category.nodes.length > 0)

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Components</h2>
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

      <div className="space-y-6">
        {filteredCategories.map((category) => (
          <div key={category.name}>
            <h3 className="text-sm font-medium text-gray-700 mb-3">{category.name}</h3>
            <div className="space-y-2">
              {category.nodes.map((node) => {
                const IconComponent = node.icon
                return (
                  <Card
                    key={node.type}
                    className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={(event) => onDragStart(event, node.type)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${node.color} text-white flex-shrink-0`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{node.label}</h4>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{node.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-8">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No components found</p>
        </div>
      )}
    </div>
  )
}
