"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Clock,
  ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: any
}

interface WorkflowProposal {
  id: string
  name: string
  description: string
  nodes: Array<{
    type: string
    label: string
    config: any
  }>
  pattern: string
  tokens: string[]
  features: string[]
}

interface AIChatbotPanelProps {
  isOpen: boolean
  onToggle: () => void
  onWorkflowGenerated?: (workflow: WorkflowProposal) => void
  onWorkflowApproved?: (workflow: WorkflowProposal) => void
}

export function AIChatbotPanel({ 
  isOpen, 
  onToggle, 
  onWorkflowGenerated,
  onWorkflowApproved 
}: AIChatbotPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "system",
      content: "👋 Hi! I'm your DeFi workflow assistant. Describe what you want to build and I'll help you create the perfect workflow. For example: \"I want to create a swap application for ETH, USDC, and WBTC with slippage protection\"",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentProposal, setCurrentProposal] = useState<WorkflowProposal | null>(null)
  const [isApproving, setIsApproving] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue("")
    
    // Add user message
    addMessage({
      type: 'user',
      content: userMessage
    })

    setIsLoading(true)

    try {
      // Call the agents API
      const response = await fetch('http://localhost:8000/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ request: userMessage })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      // Add AI analysis message
      addMessage({
        type: 'assistant',
        content: `🤖 I've analyzed your request and created a workflow proposal:\n\n**Pattern Detected:** ${result.requirements?.pattern || 'Custom DeFi Application'}\n**Tokens:** ${result.requirements?.tokens?.join(', ') || 'None specified'}\n**Features:** ${result.requirements?.features?.join(', ') || 'Basic functionality'}\n\nPlease review the proposed workflow below and approve it to proceed with canvas generation.`
      })

      // Create workflow proposal
      const proposal: WorkflowProposal = {
        id: result.executionId || Date.now().toString(),
        name: result.workflow?.name || `${result.requirements?.pattern || 'Custom'} Workflow`,
        description: result.requirements?.user_intent || userMessage,
        nodes: result.workflow?.nodes || [],
        pattern: result.requirements?.pattern || 'Custom',
        tokens: result.requirements?.tokens || [],
        features: result.requirements?.features || []
      }

      setCurrentProposal(proposal)
      onWorkflowGenerated?.(proposal)

    } catch (error) {
      console.error('Error calling agents API:', error)
      addMessage({
        type: 'assistant',
        content: `❌ Sorry, I encountered an error while processing your request. Please make sure the agents service is running on localhost:8000 and try again.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveWorkflow = async () => {
    if (!currentProposal) return
    
    setIsApproving(true)
    
    try {
      addMessage({
        type: 'system',
        content: `✅ Workflow approved! Generating canvas with ${currentProposal.nodes.length} nodes...`
      })
      
      onWorkflowApproved?.(currentProposal)
      
      // Clear current proposal after approval
      setCurrentProposal(null)
      
    } catch (error) {
      addMessage({
        type: 'assistant',
        content: `❌ Error approving workflow: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setIsApproving(false)
    }
  }

  const handleRejectWorkflow = () => {
    if (!currentProposal) return
    
    addMessage({
      type: 'system',
      content: "❌ Workflow rejected. Please provide more details about what you'd like to change."
    })
    
    setCurrentProposal(null)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-blue-600 hover:bg-blue-700"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white border border-gray-200 rounded-lg shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">DeFi Workflow Assistant</h3>
        </div>
        <Button
          onClick={onToggle}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.type === 'user' && "flex-row-reverse"
              )}
            >
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                message.type === 'user' 
                  ? "bg-blue-600 text-white" 
                  : message.type === 'assistant'
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600"
              )}>
                {message.type === 'user' ? (
                  <User className="h-4 w-4" />
                ) : message.type === 'assistant' ? (
                  <Bot className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
              </div>
              
              <div className={cn(
                "flex-1 max-w-xs",
                message.type === 'user' && "text-right"
              )}>
                <div className={cn(
                  "rounded-lg px-3 py-2 text-sm",
                  message.type === 'user' 
                    ? "bg-blue-600 text-white ml-auto" 
                    : "bg-gray-100 text-gray-900"
                )}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing your request...
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Workflow Proposal Card */}
          {currentProposal && (
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Workflow Proposal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="font-medium text-sm">{currentProposal.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{currentProposal.description}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {currentProposal.pattern}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {currentProposal.nodes.length} nodes
                    </Badge>
                  </div>
                  
                  {currentProposal.tokens.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Tokens:</div>
                      <div className="flex flex-wrap gap-1">
                        {currentProposal.tokens.map((token) => (
                          <Badge key={token} variant="outline" className="text-xs">
                            {token}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {currentProposal.features.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Features:</div>
                      <div className="flex flex-wrap gap-1">
                        {currentProposal.features.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Separator />
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleApproveWorkflow}
                    disabled={isApproving}
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    {isApproving ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    )}
                    Approve & Generate
                  </Button>
                  <Button
                    onClick={handleRejectWorkflow}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Modify
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Describe your DeFi workflow..."
            className="flex-1 min-h-[80px] resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <Button 
            type="submit" 
            disabled={!inputValue.trim() || isLoading}
            size="icon"
            className="self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}