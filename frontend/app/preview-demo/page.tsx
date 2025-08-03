'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmbeddedPreviewPanel } from '@/components/embedded-preview-panel';
import { StaticFlowPreview } from '@/components/static-flow-preview';
import { Eye, Code2, Zap } from 'lucide-react';
import type { Node, Edge } from "@xyflow/react";

// Mock 1inch DeFi Suite flow data
const mock1inchNodes: Node[] = [
  {
    id: "wallet-connector-1",
    type: "walletConnector",
    position: { x: 100, y: 100 },
    data: {
      label: "Multi-Chain Wallet Connection",
      config: {
        supportedWallets: ["MetaMask", "WalletConnect", "Coinbase Wallet"],
        supportedChains: ["1", "137", "56", "42161", "10", "43114"],
      }
    }
  },
  {
    id: "token-selector-1", 
    type: "tokenSelector",
    position: { x: 100, y: 280 },
    data: {
      label: "Multi-Chain Token Selector",
      config: {
        fromToken: "ETH",
        toToken: "USDC",
        supportedChains: ["1", "137", "56", "42161", "10", "43114"],
      }
    }
  },
  {
    id: "oneinch-quote-1",
    type: "oneInchQuote", 
    position: { x: 400, y: 100 },
    data: {
      label: "1inch Quote Engine",
      config: {
        supportedChains: ["1", "137", "56", "42161", "10", "43114"],
        quoteRefreshInterval: 10,
      }
    }
  },
  {
    id: "oneinch-swap-1",
    type: "oneInchSwap",
    position: { x: 700, y: 100 },
    data: {
      label: "1inch Swap Executor",
      config: {
        supportedChains: ["1", "137", "56", "42161", "10", "43114"],
        enableFusion: true,
      }
    }
  },
  {
    id: "fusion-plus-1",
    type: "fusionPlus",
    position: { x: 700, y: 280 },
    data: {
      label: "Fusion+ Cross-Chain",
      config: {
        supportedChains: ["1", "137", "56", "42161", "10", "43114"],
        enableMEVProtection: true,
      }
    }
  },
  {
    id: "limitOrder-1",
    type: "limitOrder",
    position: { x: 1000, y: 100 },
    data: {
      label: "Limit Order Protocol",
      config: {
        orderType: "limit",
        supportedChains: ["1", "137", "56", "42161", "10", "43114"]
      }
    }
  }
];

const mock1inchEdges: Edge[] = [
  { id: 'e1-2', source: 'wallet-connector-1', target: 'token-selector-1' },
  { id: 'e2-3', source: 'token-selector-1', target: 'oneinch-quote-1' },
  { id: 'e3-4', source: 'oneinch-quote-1', target: 'oneinch-swap-1' },
  { id: 'e3-5', source: 'oneinch-quote-1', target: 'fusion-plus-1' },
  { id: 'e4-6', source: 'oneinch-swap-1', target: 'limitOrder-1' },
];

export default function PreviewDemoPage() {
  const [activePreview, setActivePreview] = useState<'embedded' | 'static' | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Embedded Preview Demo
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Test the new embedded preview functionality for your 1inch DeFi Suite
          </p>
          <div className="flex justify-center gap-2 mb-8">
            <Badge className="bg-green-100 text-green-800">✅ No Backend Required</Badge>
            <Badge className="bg-blue-100 text-blue-800">⚡ Real-time Updates</Badge>
            <Badge className="bg-purple-100 text-purple-800">🎨 Interactive UI</Badge>
          </div>
        </div>

        {/* Demo Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActivePreview('embedded')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Embedded Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Full-featured preview panel with configuration options, iframe preview, and real-time logs.
              </p>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>• 🔧 API key configuration</li>
                <li>• 🌐 Multi-chain support</li>
                <li>• 📱 Responsive iframe preview</li>
                <li>• 📊 Real-time execution logs</li>
                <li>• 🔄 Auto-refresh capability</li>
              </ul>
              <Button className="w-full">
                Try Embedded Preview
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActivePreview('static')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-purple-600" />
                Static Flow Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Lightweight preview showing flow components and their status in a clean, organized layout.
              </p>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>• 📋 Flow component overview</li>
                <li>• 🎯 Component status indicators</li>
                <li>• 🎨 Clean, minimal interface</li>
                <li>• ⚡ Instant load time</li>
                <li>• 📱 Collapsible design</li>
              </ul>
              <Button variant="outline" className="w-full">
                Try Static Preview
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Mock Flow Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              Mock 1inch DeFi Suite Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium mb-2">Components ({mock1inchNodes.length})</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {mock1inchNodes.map(node => (
                    <li key={node.id}>• {node.data.label}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Features</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Multi-chain wallet support</li>
                  <li>• 1inch API integration</li>
                  <li>• Cross-chain swaps</li>
                  <li>• Limit order protocol</li>
                  <li>• MEV protection</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Supported Chains</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Ethereum</li>
                  <li>• Polygon</li>
                  <li>• BSC</li>
                  <li>• Arbitrum</li>
                  <li>• Optimism</li>
                  <li>• Avalanche</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Container */}
        <div className="relative">
          {activePreview && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg w-full max-w-6xl h-[80vh] flex overflow-hidden">
                <div className="flex-1 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      {activePreview === 'embedded' ? 'Embedded Live Preview' : 'Static Flow Preview'}
                    </h3>
                    <Button onClick={() => setActivePreview(null)} variant="ghost">
                      ✕
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    This is a demonstration of how the preview will look when integrated into your canvas.
                  </div>
                  
                  {/* Mock Canvas Area */}
                  <div className="bg-gray-100 rounded-lg p-4 h-[60vh] flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="text-6xl mb-4">🎨</div>
                      <div className="text-lg font-medium mb-2">Flow Canvas Area</div>
                      <div className="text-sm">
                        Your visual flow builder would be here.<br/>
                        The preview panel appears on the right side.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview Panel */}
                {activePreview === 'embedded' && (
                  <EmbeddedPreviewPanel
                    nodes={mock1inchNodes}
                    edges={mock1inchEdges}
                    projectName="My1inchDeFiSuite"
                    isVisible={true}
                    onToggle={() => {}}
                  />
                )}

                {activePreview === 'static' && (
                  <StaticFlowPreview
                    nodes={mock1inchNodes}
                    edges={mock1inchEdges}
                    projectName="My1inchDeFiSuite"
                    isVisible={true}
                    onToggle={() => {}}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">1. Integration</h4>
                <p className="text-sm text-gray-600">
                  The preview panels are already integrated into your FlowCanvas component. 
                  Click the eye icon in the toolbar to toggle the preview.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">2. Testing Your 1inch Flow</h4>
                <p className="text-sm text-gray-600">
                  Load the "1inch-Powered DeFi Suite" template, then click the preview button to see your flow in action.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">3. Configuration</h4>
                <p className="text-sm text-gray-600">
                  For the embedded preview, you'll need to add your 1inch API key in the configuration tab.
                  Get your API key from <a href="https://portal.1inch.dev" target="_blank" className="text-blue-600 underline">portal.1inch.dev</a>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}