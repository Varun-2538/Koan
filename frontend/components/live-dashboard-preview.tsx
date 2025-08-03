'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Square, ExternalLink, Settings, Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Import the type we need
interface CodeGenerationResult {
  projectName?: string
  description?: string
  framework?: string
  features?: string[]
  files?: Record<string, string>
  dependencies?: any
}

interface LivePreviewProps {
  isOpen: boolean
  onClose: () => void
  codeResult: CodeGenerationResult | null
  projectName: string
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

// Named export instead of default export
export function LiveDashboardPreview({ isOpen, onClose, codeResult, projectName }: LivePreviewProps) {
  const [isStarting, setIsStarting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [config, setConfig] = useState<PreviewConfig>({
    chainId: '1',
    enabledChains: ['1', '137', '56'],
    defaultTokens: DEFAULT_TOKENS
  });

  // Check configuration completeness
  const isConfigValid = config.oneInchApiKey && config.chainId;

  const handleConfigChange = (key: keyof PreviewConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const generateWorkflowConfig = () => {
    return {
      projectName: projectName,
      codeResult: codeResult,
      config: {
        oneInchApiKey: config.oneInchApiKey,
        defaultChain: config.chainId,
        enabledChains: config.enabledChains,
        rpcEndpoints: Object.fromEntries(
          config.enabledChains.map(chainId => [
            chainId,
            config.rpcUrl || SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS]?.rpc
          ])
        ),
        walletConnectProjectId: config.walletConnectProjectId,
        defaultTokens: config.defaultTokens
      }
    };
  }

  // Don't render if modal is not open
  if (!isOpen) return null;

  const startPreview = async () => {
    if (!isConfigValid) {
      toast.error('Please configure all required settings');
      return;
    }

    setIsStarting(true);
    try {
      const workflowConfig = generateWorkflowConfig();
      
      const response = await fetch('/api/preview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowConfig)
      });

      const result = await response.json();
      
      if (result.success) {
        setIsRunning(true);
        setPreviewUrl(result.url);
        setLogs(['✅ Preview instance started successfully']);
        toast.success('Live preview started!');
        
        // Start listening for logs
        connectToLogs(result.instanceId);
      } else {
        throw new Error(result.error || 'Failed to start preview');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to start live preview');
      console.error('Preview start error:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const stopPreview = async () => {
    try {
      if (previewUrl) {
        const instanceId = previewUrl.split('/').pop();
        await fetch(`/api/preview/stop/${instanceId}`, { method: 'POST' });
      }
      
      setIsRunning(false);
      setPreviewUrl(null);
      setLogs([]);
      toast.success('Preview stopped');
    } catch (error) {
      toast.error('Failed to stop preview');
    }
  };

  const connectToLogs = (instanceId: string) => {
    // WebSocket connection for real-time logs
    const ws = new WebSocket(`ws://localhost:3001`);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe-logs', instanceId }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'log') {
        setLogs(prev => [...prev, data.message]);
      }
    };

    ws.onerror = () => {
      // Silently handle WebSocket errors for now
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Live Preview</h2>
            <Badge variant={isRunning ? "default" : "secondary"}>
              {isRunning ? "Running" : "Stopped"}
            </Badge>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm">
            ✕
          </Button>
        </div>

        <div className="flex-1 flex">
          {/* Configuration Panel */}
          <div className="w-80 border-r p-4 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4" />
              <h3 className="font-medium">Configuration</h3>
            </div>

            <Tabs defaultValue="api" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="api">API</TabsTrigger>
                <TabsTrigger value="chains">Chains</TabsTrigger>
              </TabsList>

              <TabsContent value="api" className="space-y-4">
                <div className="space-y-2">
                  <Label>1inch API Key *</Label>
                  <Input
                    type="password"
                    placeholder="Enter your 1inch API key"
                    value={config.oneInchApiKey || ''}
                    onChange={(e) => handleConfigChange('oneInchApiKey', e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Get your API key from{' '}
                    <a href="https://portal.1inch.dev" target="_blank" className="underline">
                      portal.1inch.dev
                    </a>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>WalletConnect Project ID</Label>
                  <Input
                    placeholder="Optional WalletConnect Project ID"
                    value={config.walletConnectProjectId || ''}
                    onChange={(e) => handleConfigChange('walletConnectProjectId', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Default Chain</Label>
                  <Select value={config.chainId} onValueChange={(value) => handleConfigChange('chainId', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SUPPORTED_CHAINS).map(([id, chain]) => (
                        <SelectItem key={id} value={id}>
                          {chain.name} ({chain.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="chains" className="space-y-4">
                <div className="space-y-2">
                  <Label>Enabled Chains</Label>
                  {Object.entries(SUPPORTED_CHAINS).map(([id, chain]) => (
                    <div key={id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`chain-${id}`}
                        checked={config.enabledChains.includes(id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleConfigChange('enabledChains', [...config.enabledChains, id]);
                          } else {
                            handleConfigChange('enabledChains', config.enabledChains.filter(c => c !== id));
                          }
                        }}
                      />
                      <label htmlFor={`chain-${id}`} className="text-sm">
                        {chain.name} ({chain.symbol})
                      </label>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-4 border-t">
              {!isRunning ? (
                <Button
                  onClick={startPreview}
                  disabled={isStarting || !isConfigValid}
                  className="w-full"
                >
                  {isStarting ? (
                    <>Starting...</>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Live Preview
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button
                    onClick={() => window.open(previewUrl!, '_blank')}
                    className="w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Preview
                  </Button>
                  <Button
                    onClick={stopPreview}
                    variant="destructive"
                    className="w-full"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop Preview
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="flex-1 flex flex-col">
            {previewUrl ? (
              <iframe
                src={previewUrl}
                className="flex-1 border-0"
                title="Live Preview"
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Ready for Live Preview</h3>
                  <p className="text-sm">Configure your settings and click "Start Live Preview"</p>
                </div>
              </div>
            )}

            {/* Logs Panel */}
            {logs.length > 0 && (
              <div className="h-40 border-t bg-gray-50 p-4 overflow-y-auto">
                <h4 className="text-sm font-medium mb-2">Live Logs</h4>
                <div className="text-xs font-mono space-y-1">
                  {logs.map((log, index) => (
                    <div key={index} className="text-gray-600">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}