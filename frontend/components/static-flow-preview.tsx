'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Eye, 
  EyeOff, 
  Maximize2, 
  Minimize2,
  RefreshCw,
  Wallet,
  Coins,
  TrendingUp,
  Repeat,
  Zap,
  BarChart3,
  Globe
} from 'lucide-react';
import type { Node, Edge } from "@xyflow/react";

interface StaticFlowPreviewProps {
  nodes: Node[]
  edges: Edge[]
  projectName: string
  isVisible: boolean
  onToggle: () => void
}

export function StaticFlowPreview({ 
  nodes, 
  edges, 
  projectName, 
  isVisible, 
  onToggle 
}: StaticFlowPreviewProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isVisible) return null;

  // Analyze nodes to determine what components are present
  const hasWallet = nodes.some(n => n.type === 'walletConnector');
  const hasTokenSelector = nodes.some(n => n.type === 'tokenSelector');
  const hasOneInchQuote = nodes.some(n => n.type === 'oneInchQuote');
  const hasOneInchSwap = nodes.some(n => n.type === 'oneInchSwap');
  const hasFusionPlus = nodes.some(n => n.type === 'fusionPlus');
  const hasLimitOrder = nodes.some(n => n.type === 'limitOrder');
  const hasPortfolioAPI = nodes.some(n => n.type === 'portfolioAPI');
  const hasPriceImpact = nodes.some(n => n.type === 'priceImpactCalculator');

  const panelWidth = isFullscreen ? 'w-full' : isMinimized ? 'w-12' : 'w-96';

  const getNodeIcon = (nodeType: string) => {
    switch (nodeType) {
      case 'walletConnector': return <Wallet className="w-4 h-4" />;
      case 'tokenSelector': return <Coins className="w-4 h-4" />;
      case 'oneInchQuote': return <TrendingUp className="w-4 h-4" />;
      case 'oneInchSwap': return <Repeat className="w-4 h-4" />;
      case 'fusionPlus': return <Zap className="w-4 h-4" />;
      case 'limitOrder': return <BarChart3 className="w-4 h-4" />;
      case 'portfolioAPI': return <Globe className="w-4 h-4" />;
      default: return <div className="w-4 h-4 bg-gray-300 rounded" />;
    }
  };

  return (
    <div className={`${panelWidth} h-full bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50' : 'relative'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        {!isMinimized && (
          <>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <h3 className="font-medium text-sm">Flow Preview</h3>
              <Badge variant="default" className="text-xs bg-green-500">
                Live
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                onClick={() => setIsFullscreen(!isFullscreen)} 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0"
              >
                {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
              </Button>
              <Button 
                onClick={() => setIsMinimized(!isMinimized)} 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0"
              >
                <EyeOff className="w-3 h-3" />
              </Button>
              <Button onClick={onToggle} variant="ghost" size="sm" className="h-7 w-7 p-0">
                ✕
              </Button>
            </div>
          </>
        )}
        {isMinimized && (
          <Button 
            onClick={() => setIsMinimized(false)} 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0 mx-auto"
          >
            <Eye className="w-3 h-3" />
          </Button>
        )}
      </div>

      {!isMinimized && (
        <>
          {/* Project Header */}
          <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <h2 className="font-bold text-lg mb-1">{projectName}</h2>
            <p className="text-sm opacity-90">
              {nodes.length} components • {edges.length} connections
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Flow Overview */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Flow Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {nodes.map((node) => (
                  <div key={node.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {getNodeIcon(node.type)}
                      <span className="text-sm font-medium">
                        {node.data.label || node.type}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {node.type}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Feature Cards */}
            {hasWallet && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-blue-600" />
                    Wallet Connection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge className="bg-green-100 text-green-800">Ready</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Supported:</span>
                      <span>MetaMask, WalletConnect</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Chains:</span>
                      <span>6 networks</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {hasTokenSelector && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Coins className="w-4 h-4 text-green-600" />
                    Token Selection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="font-medium">From: ETH</div>
                      <div className="text-gray-600">Balance: 2.45 ETH</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="font-medium">To: USDC</div>
                      <div className="text-gray-600">Balance: 1,234.56 USDC</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {hasOneInchQuote && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                    Price Quotes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rate:</span>
                      <span className="font-medium">1 ETH = 2,456.78 USDC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gas Fee:</span>
                      <span className="font-medium">~$12.34</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price Impact:</span>
                      <span className="font-medium text-green-600">0.02%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="text-gray-500">2s ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {hasOneInchSwap && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-purple-600" />
                    1inch Swap Engine
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">DEX Sources:</span>
                      <span className="font-medium">100+ DEXs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">MEV Protection:</span>
                      <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Slippage:</span>
                      <span>1.0%</span>
                    </div>
                    <Button className="w-full mt-2 h-7 text-xs bg-gradient-to-r from-purple-500 to-pink-600">
                      Execute Swap
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {hasFusionPlus && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-600" />
                    Fusion+ Cross-Chain
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Route:</span>
                      <span>Ethereum → Polygon</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span>~2-3 minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gas:</span>
                      <Badge className="bg-green-100 text-green-800">Gasless</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {hasLimitOrder && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-red-600" />
                    Limit Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="p-2 bg-gray-50 rounded text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">ETH → USDC</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="text-gray-600">
                        Target: $2,500 | Current: $2,456
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t space-y-2">
              <Button className="w-full h-8 text-xs bg-gradient-to-r from-green-500 to-teal-600">
                Generate Full Code
              </Button>
              <Button variant="outline" className="w-full h-8 text-xs">
                Deploy to GitHub
              </Button>
            </div>

            {/* Status Footer */}
            <div className="text-center text-xs text-gray-500 pt-2 border-t">
              <div className="flex items-center justify-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live preview • {nodes.length} components ready
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}