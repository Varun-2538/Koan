'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Play, 
  Square, 
  ExternalLink, 
  Settings, 
  Globe, 
  ChevronLeft, 
  ChevronRight,
  Maximize2,
  Minimize2,
  RefreshCw,
  Eye,
  Code2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { Node, Edge } from "@xyflow/react";

interface CodeGenerationResult {
  projectName?: string
  description?: string
  framework?: string
  features?: string[]
  files?: Record<string, string>
  dependencies?: any
}

interface EmbeddedPreviewPanelProps {
  nodes: Node[]
  edges: Edge[]
  projectName: string
  isVisible: boolean
  onToggle: () => void
  codeResult?: CodeGenerationResult | null
}

interface PreviewConfig {
  oneInchApiKey?: string;
  chainId: string;
  rpcUrl?: string;
  walletConnectProjectId?: string;
  enabledChains: string[];
  defaultTokens: Record<string, string[]>;
}

const SUPPORTED_CHAINS = {
  '1': { name: 'Ethereum', symbol: 'ETH', rpc: 'https://eth.llamarpc.com' },
  '137': { name: 'Polygon', symbol: 'MATIC', rpc: 'https://polygon-rpc.com' },
  '56': { name: 'BSC', symbol: 'BNB', rpc: 'https://bsc-dataseed1.binance.org' },
  '42161': { name: 'Arbitrum', symbol: 'ETH', rpc: 'https://arb1.arbitrum.io/rpc' },
  '10': { name: 'Optimism', symbol: 'ETH', rpc: 'https://mainnet.optimism.io' },
  '43114': { name: 'Avalanche', symbol: 'AVAX', rpc: 'https://api.avax.network/ext/bc/C/rpc' }
};

const DEFAULT_TOKENS = {
  '1': ['ETH', 'USDC', 'USDT', 'DAI', 'WBTC', '1INCH'],
  '137': ['MATIC', 'USDC', 'USDT', 'DAI', 'WETH', 'AAVE'],
  '56': ['BNB', 'USDT', 'BUSD', 'CAKE', 'ETH'],
  '42161': ['ETH', 'USDC', 'USDT', 'ARB'],
  '10': ['ETH', 'USDC', 'OP'],
  '43114': ['AVAX', 'USDC', 'USDT']
};

export function EmbeddedPreviewPanel({ 
  nodes, 
  edges, 
  projectName, 
  isVisible, 
  onToggle,
  codeResult 
}: EmbeddedPreviewPanelProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'preview' | 'config' | 'logs'>('preview');
  const [config, setConfig] = useState<PreviewConfig>({
    chainId: '1',
    enabledChains: ['1', '137', '56'],
    defaultTokens: DEFAULT_TOKENS
  });
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Check configuration completeness
  const isConfigValid = config.oneInchApiKey && config.chainId;

  // Generate static preview content based on nodes
  const generateStaticPreview = () => {
    const hasWallet = nodes.some(n => n.type === 'walletConnector');
    const hasTokenSelector = nodes.some(n => n.type === 'tokenSelector');
    const hasOneInchQuote = nodes.some(n => n.type === 'oneInchQuote');
    const hasOneInchSwap = nodes.some(n => n.type === 'oneInchSwap');
    const hasFusionPlus = nodes.some(n => n.type === 'fusionPlus');
    const hasLimitOrder = nodes.some(n => n.type === 'limitOrder');

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${projectName} - Preview</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
          .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          .glass-effect { backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.1); }
        </style>
      </head>
      <body class="bg-gray-50 min-h-screen">
        <div class="gradient-bg text-white py-16">
          <div class="container mx-auto px-4 text-center">
            <h1 class="text-4xl font-bold mb-4">${projectName}</h1>
            <p class="text-xl opacity-90 mb-8">Complete DeFi Suite with 1inch Integration</p>
            <div class="flex flex-wrap justify-center gap-2">
              ${hasWallet ? '<span class="glass-effect px-3 py-1 rounded-full text-sm">🔗 Multi-Wallet Support</span>' : ''}
              ${hasTokenSelector ? '<span class="glass-effect px-3 py-1 rounded-full text-sm">🪙 Token Selection</span>' : ''}
              ${hasOneInchQuote ? '<span class="glass-effect px-3 py-1 rounded-full text-sm">📊 Real-time Quotes</span>' : ''}
              ${hasOneInchSwap ? '<span class="glass-effect px-3 py-1 rounded-full text-sm">🔄 1inch Swaps</span>' : ''}
              ${hasFusionPlus ? '<span class="glass-effect px-3 py-1 rounded-full text-sm">🌉 Cross-chain</span>' : ''}
              ${hasLimitOrder ? '<span class="glass-effect px-3 py-1 rounded-full text-sm">📈 Limit Orders</span>' : ''}
            </div>
          </div>
        </div>

        <div class="container mx-auto px-4 py-8">
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${hasWallet ? `
            <div class="bg-white rounded-xl shadow-lg p-6">
              <div class="flex items-center mb-4">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span class="text-blue-600 text-xl">🔗</span>
                </div>
                <h3 class="ml-3 text-lg font-semibold">Wallet Connection</h3>
              </div>
              <p class="text-gray-600 mb-4">Connect with MetaMask, WalletConnect, or Coinbase Wallet</p>
              <button class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity">
                Connect Wallet
              </button>
            </div>
            ` : ''}

            ${hasTokenSelector ? `
            <div class="bg-white rounded-xl shadow-lg p-6">
              <div class="flex items-center mb-4">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span class="text-green-600 text-xl">🪙</span>
                </div>
                <h3 class="ml-3 text-lg font-semibold">Token Selector</h3>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span class="font-medium">From: ETH</span>
                  <span class="text-gray-500">Balance: 2.45</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span class="font-medium">To: USDC</span>
                  <span class="text-gray-500">Balance: 1,234.56</span>
                </div>
              </div>
            </div>
            ` : ''}

            ${hasOneInchQuote ? `
            <div class="bg-white rounded-xl shadow-lg p-6">
              <div class="flex items-center mb-4">
                <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span class="text-orange-600 text-xl">📊</span>
                </div>
                <h3 class="ml-3 text-lg font-semibold">Price Quotes</h3>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-600">Rate:</span>
                  <span class="font-medium">1 ETH = 2,456.78 USDC</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Gas Fee:</span>
                  <span class="font-medium">~$12.34</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Price Impact:</span>
                  <span class="font-medium text-green-600">0.02%</span>
                </div>
              </div>
            </div>
            ` : ''}

            ${hasOneInchSwap ? `
            <div class="bg-white rounded-xl shadow-lg p-6">
              <div class="flex items-center mb-4">
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span class="text-purple-600 text-xl">🔄</span>
                </div>
                <h3 class="ml-3 text-lg font-semibold">1inch Swap</h3>
              </div>
              <p class="text-gray-600 mb-4">Best rates across 100+ DEXs with MEV protection</p>
              <button class="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity">
                Execute Swap
              </button>
            </div>
            ` : ''}

            ${hasFusionPlus ? `
            <div class="bg-white rounded-xl shadow-lg p-6">
              <div class="flex items-center mb-4">
                <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span class="text-indigo-600 text-xl">🌉</span>
                </div>
                <h3 class="ml-3 text-lg font-semibold">Fusion+ Cross-Chain</h3>
              </div>
              <p class="text-gray-600 mb-4">Gasless cross-chain swaps with optimal routing</p>
              <div class="flex items-center justify-between text-sm text-gray-500">
                <span>Ethereum → Polygon</span>
                <span>~2-3 minutes</span>
              </div>
            </div>
            ` : ''}

            ${hasLimitOrder ? `
            <div class="bg-white rounded-xl shadow-lg p-6">
              <div class="flex items-center mb-4">
                <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <span class="text-red-600 text-xl">📈</span>
                </div>
                <h3 class="ml-3 text-lg font-semibold">Limit Orders</h3>
              </div>
              <div class="space-y-3">
                <div class="p-3 bg-gray-50 rounded-lg">
                  <div class="flex justify-between items-center">
                    <span class="text-sm font-medium">ETH → USDC</span>
                    <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                  </div>
                  <div class="text-sm text-gray-600 mt-1">
                    Target: $2,500 | Current: $2,456
                  </div>
                </div>
              </div>
            </div>
            ` : ''}
          </div>

          <div class="mt-12 text-center">
            <div class="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
              <h2 class="text-2xl font-bold mb-4">🚀 Ready to Deploy?</h2>
              <p class="text-gray-600 mb-6">
                Your DeFi application is configured and ready. Click generate to create the full codebase.
              </p>
              <div class="flex flex-wrap justify-center gap-4">
                <button class="bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity">
                  Generate Code
                </button>
                <button class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity">
                  Deploy to GitHub
                </button>
              </div>
            </div>
          </div>
        </div>

        <script>
          // Add some interactivity
          document.addEventListener('DOMContentLoaded', function() {
            const buttons = document.querySelectorAll('button');
            buttons.forEach(button => {
              button.addEventListener('click', function() {
                if (this.textContent.includes('Connect Wallet')) {
                  this.textContent = '🔗 Wallet Connected';
                  this.classList.add('bg-green-500');
                } else if (this.textContent.includes('Execute Swap')) {
                  this.textContent = '⏳ Swapping...';
                  setTimeout(() => {
                    this.textContent = '✅ Swap Complete';
                    this.classList.add('bg-green-500');
                  }, 2000);
                }
              });
            });
          });
        </script>
      </body>
      </html>
    `;
  };

  const handleConfigChange = (key: keyof PreviewConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const startLivePreview = async () => {
    if (!isConfigValid) {
      toast.error('Please configure your 1inch API key');
      return;
    }

    setIsStarting(true);
    try {
      // For now, we'll use static preview. In production, you'd call your backend
      const staticContent = generateStaticPreview();
      const blob = new Blob([staticContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setIsRunning(true);
      setLogs(['✅ Preview generated successfully', '🎯 Static preview loaded', '📊 Flow analyzed: ' + nodes.length + ' nodes']);
      toast.success('Preview ready!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate preview');
      console.error('Preview error:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const stopPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setIsRunning(false);
    setLogs([]);
  };

  const refreshPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const staticContent = generateStaticPreview();
    const blob = new Blob([staticContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    setLogs(prev => [...prev, '🔄 Preview refreshed']);
  };

  if (!isVisible) return null;

  const panelWidth = isFullscreen ? 'w-full' : isMinimized ? 'w-12' : 'w-96';
  const panelHeight = isFullscreen ? 'h-full' : 'h-full';

  return (
    <div className={`${panelWidth} ${panelHeight} bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50' : 'relative'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        {!isMinimized && (
          <>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <h3 className="font-medium text-sm">Live Preview</h3>
              <Badge variant={isRunning ? "default" : "secondary"} className="text-xs">
                {isRunning ? "Running" : "Ready"}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              {previewUrl && (
                <Button onClick={refreshPreview} variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <RefreshCw className="w-3 h-3" />
                </Button>
              )}
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
                {isMinimized ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
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
            <ChevronLeft className="w-3 h-3" />
          </Button>
        )}
      </div>

      {!isMinimized && (
        <>
          {/* Tabs */}
          <div className="border-b">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-8">
                <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
                <TabsTrigger value="config" className="text-xs">Config</TabsTrigger>
                <TabsTrigger value="logs" className="text-xs">Logs</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'preview' && (
              <div className="h-full flex flex-col">
                {previewUrl ? (
                  <iframe
                    ref={iframeRef}
                    src={previewUrl}
                    className="flex-1 border-0 w-full"
                    title="Live Preview"
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center">
                      <Globe className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h4 className="font-medium mb-2">Preview Ready</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Configure your API key and start the preview
                      </p>
                      <Button 
                        onClick={startLivePreview}
                        disabled={isStarting}
                        size="sm"
                      >
                        {isStarting ? (
                          <>Starting...</>
                        ) : (
                          <>
                            <Play className="w-3 h-3 mr-1" />
                            Start Preview
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'config' && (
              <div className="p-4 space-y-4 overflow-y-auto">
                <div className="space-y-2">
                  <Label className="text-xs">1inch API Key *</Label>
                  <Input
                    type="password"
                    placeholder="Enter API key"
                    value={config.oneInchApiKey || ''}
                    onChange={(e) => handleConfigChange('oneInchApiKey', e.target.value)}
                    className="h-8 text-xs"
                  />
                  <p className="text-xs text-gray-500">
                    Get from{' '}
                    <a href="https://portal.1inch.dev" target="_blank" className="underline">
                      portal.1inch.dev
                    </a>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Default Chain</Label>
                  <Select value={config.chainId} onValueChange={(value) => handleConfigChange('chainId', value)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SUPPORTED_CHAINS).map(([id, chain]) => (
                        <SelectItem key={id} value={id} className="text-xs">
                          {chain.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 border-t">
                  {!isRunning ? (
                    <Button
                      onClick={startLivePreview}
                      disabled={isStarting || !isConfigValid}
                      className="w-full h-8 text-xs"
                    >
                      {isStarting ? 'Starting...' : 'Start Preview'}
                    </Button>
                  ) : (
                    <Button
                      onClick={stopPreview}
                      variant="destructive"
                      className="w-full h-8 text-xs"
                    >
                      Stop Preview
                    </Button>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="p-4 h-full overflow-y-auto">
                <div className="space-y-1">
                  {logs.length > 0 ? (
                    logs.map((log, index) => (
                      <div key={index} className="text-xs font-mono text-gray-600 py-1">
                        {log}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-500 text-center py-8">
                      No logs yet. Start the preview to see activity.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}