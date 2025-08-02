'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Settings, 
  ExternalLink, 
  Zap, 
  Wallet, 
  Coins, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Code,
  Globe
} from 'lucide-react';
import type { CodeGenerationResult } from '@/lib/oneinch-code-generator';

interface LiveDashboardPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  codeResult: CodeGenerationResult | null;
  projectName: string;
}

interface ApiConfig {
  oneInchApiKey: string;
  chainId: string;
  rpcUrl: string;
}

interface PreviewState {
  isRunning: boolean;
  previewUrl: string | null;
  error: string | null;
  logs: string[];
}

export function LiveDashboardPreview({ 
  isOpen, 
  onClose, 
  codeResult, 
  projectName 
}: LiveDashboardPreviewProps) {
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    oneInchApiKey: '',
    chainId: '1',
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/demo'
  });
  
  const [previewState, setPreviewState] = useState<PreviewState>({
    isRunning: false,
    previewUrl: null,
    error: null,
    logs: []
  });

  const [activeTab, setActiveTab] = useState('config');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFirefox, setIsFirefox] = useState(false);
  const [iframeBlocked, setIframeBlocked] = useState(false);

  // Detect browser type
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isFirefoxBrowser = userAgent.includes('firefox');
    setIsFirefox(isFirefoxBrowser);
    
    // Set iframe blocked for Firefox by default
    if (isFirefoxBrowser) {
      setIframeBlocked(true);
    }
  }, []);

  const addLog = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setPreviewState(prev => ({
      ...prev,
      logs: [...prev.logs, `[${timestamp}] ${type.toUpperCase()}: ${message}`]
    }));
  };

  const validateApiConfig = (): boolean => {
    if (!apiConfig.oneInchApiKey.trim()) {
      setPreviewState(prev => ({ ...prev, error: '1inch API key is required' }));
      return false;
    }
    if (!apiConfig.chainId.trim()) {
      setPreviewState(prev => ({ ...prev, error: 'Chain ID is required' }));
      return false;
    }
    if (!apiConfig.rpcUrl.trim()) {
      setPreviewState(prev => ({ ...prev, error: 'RPC URL is required' }));
      return false;
    }
    return true;
  };

  const startPreviewServer = async () => {
    if (!validateApiConfig() || !codeResult) return;

    setPreviewState(prev => ({ 
      ...prev, 
      isRunning: true, 
      error: null,
      logs: []
    }));

    addLog('Starting preview server...', 'info');

    try {
      // Call the preview server API
      const response = await fetch('http://localhost:3002/api/preview/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName,
          config: apiConfig,
          codeResult
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start preview server');
      }

      const data = await response.json();
      
      setPreviewState(prev => ({ 
        ...prev, 
        previewUrl: data.previewUrl,
        isRunning: true 
      }));

      addLog(`Preview server started at ${data.previewUrl}`, 'success');
      addLog('Dashboard is ready for interaction!', 'success');
      addLog(`Port ${data.port} assigned successfully`, 'info');

    } catch (error: any) {
      addLog(`Failed to start preview server: ${error.message}`, 'error');
      
      // Provide specific error messages for common issues
      if (error.message.includes('port') && error.message.includes('not available')) {
        addLog('Port conflict detected. Please try again or restart the backend server.', 'error');
      } else if (error.message.includes('ECONNREFUSED')) {
        addLog('Cannot connect to preview server. Please ensure backend is running.', 'error');
      }
      
      setPreviewState(prev => ({ 
        ...prev, 
        error: error.message,
        isRunning: false 
      }));
    }
  };

  const stopPreviewServer = async () => {
    addLog('Stopping preview server...', 'info');
    
    try {
      // Call the preview server API to stop
      const response = await fetch('http://localhost:3002/api/preview/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceId: previewState.previewUrl?.split('/').pop() || ''
        })
      });

      if (response.ok) {
        addLog('Preview server stopped successfully', 'success');
      } else {
        addLog('Failed to stop preview server', 'error');
      }
    } catch (error: any) {
      addLog(`Error stopping server: ${error.message}`, 'error');
    }
    
    setPreviewState(prev => ({ 
      ...prev, 
      isRunning: false,
      previewUrl: null 
    }));
  };

  useEffect(() => {
    if (!isOpen) {
      stopPreviewServer();
    }
  }, [isOpen]);

  const handleApiConfigChange = (field: keyof ApiConfig, value: string) => {
    setApiConfig(prev => ({ ...prev, [field]: value }));
    setPreviewState(prev => ({ ...prev, error: null }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Live Dashboard Preview
          </DialogTitle>
          <DialogDescription>
            Test your DeFi application with real API keys and wallet connections
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="config" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configuration
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Live Preview
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Logs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="config" className="flex-1 flex flex-col">
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    API Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure your API keys and network settings for live testing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="oneInchApiKey" className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        1inch API Key
                      </Label>
                      <Input
                        id="oneInchApiKey"
                        type="password"
                        placeholder="Enter your 1inch API key"
                        value={apiConfig.oneInchApiKey}
                        onChange={(e) => handleApiConfigChange('oneInchApiKey', e.target.value)}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Get your API key from{' '}
                        <a 
                          href="https://portal.1inch.dev/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          1inch Developer Portal
                        </a>
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="chainId" className="flex items-center gap-2">
                        <Coins className="w-4 h-4" />
                        Chain ID
                      </Label>
                      <Input
                        id="chainId"
                        placeholder="1 (Ethereum Mainnet)"
                        value={apiConfig.chainId}
                        onChange={(e) => handleApiConfigChange('chainId', e.target.value)}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Common chains: 1 (Ethereum), 137 (Polygon), 56 (BSC)
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="rpcUrl" className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        RPC URL
                      </Label>
                      <Input
                        id="rpcUrl"
                        placeholder="https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY"
                        value={apiConfig.rpcUrl}
                        onChange={(e) => handleApiConfigChange('rpcUrl', e.target.value)}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Use Alchemy, Infura, or your own RPC endpoint
                      </p>
                    </div>
                  </div>

                  {previewState.error && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{previewState.error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      onClick={startPreviewServer}
                      disabled={previewState.isRunning}
                      className="flex-1"
                    >
                      {previewState.isRunning ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Starting Preview...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start Live Preview
                        </>
                      )}
                    </Button>
                    
                    {previewState.isRunning && (
                      <Button 
                        onClick={stopPreviewServer}
                        variant="outline"
                      >
                        Stop Preview
                      </Button>
                    )}
                  </div>

                  {previewState.isRunning && previewState.previewUrl && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Preview server is running! Switch to the "Live Preview" tab to interact with your dashboard.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="flex-1 flex flex-col">
              {previewState.isRunning && previewState.previewUrl ? (
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Live Preview Running
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {previewState.previewUrl}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(previewState.previewUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open in New Tab
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const url = previewState.previewUrl;
                          if (url) {
                            // Try to open in new window with specific features
                            const newWindow = window.open(url, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
                            if (!newWindow) {
                              // Fallback: copy URL to clipboard
                              navigator.clipboard.writeText(url);
                              alert('URL copied to clipboard! Please paste it in a new tab.');
                            }
                          }
                        }}
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Open in New Window
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex-1 border rounded-lg overflow-hidden">
                    <div className="h-full flex flex-col">
                      {/* Browser Security Notice */}
                      <div className="bg-yellow-50 border-b border-yellow-200 p-3">
                        <div className="flex items-center gap-2 text-yellow-800">
                          <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm font-medium">Browser Security Notice</span>
                        </div>
                        <p className="text-xs text-yellow-700 mt-1">
                          Some browsers (like Firefox) block localhost iframes for security. 
                          Use the buttons above to open the preview in a new tab/window.
                        </p>
                      </div>
                      
                      {/* Iframe with fallback */}
                      <div className="flex-1 relative">
                        {!iframeBlocked ? (
                          <iframe
                            ref={iframeRef}
                            src={previewState.previewUrl}
                            className="w-full h-full"
                            title="Live Dashboard Preview"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                            onLoad={() => {
                              console.log('Iframe loaded successfully');
                              setIframeBlocked(false);
                            }}
                            onError={() => {
                              console.log('Iframe failed to load - showing fallback');
                              setIframeBlocked(true);
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
                            <div className="text-center p-6">
                              <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {isFirefox ? 'Firefox Security Block' : 'Preview Blocked by Browser'}
                              </h3>
                              <p className="text-gray-600 mb-4">
                                {isFirefox 
                                  ? 'Firefox blocks localhost iframes for security. Please use the buttons above to open the preview.'
                                  : 'Your browser blocked the preview for security reasons.'
                                }
                              </p>
                              <div className="space-y-2">
                                <Button
                                  onClick={() => window.open(previewState.previewUrl, '_blank')}
                                  className="w-full"
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Open in New Tab
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    const url = previewState.previewUrl;
                                    if (url) {
                                      navigator.clipboard.writeText(url);
                                      alert('URL copied to clipboard!');
                                    }
                                  }}
                                  className="w-full"
                                >
                                  Copy URL
                                </Button>
                                {!isFirefox && (
                                  <Button
                                    variant="outline"
                                    onClick={() => setIframeBlocked(false)}
                                    className="w-full"
                                  >
                                    Try Iframe Again
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Access Instructions */}
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="font-medium text-blue-900 mb-2">Quick Access:</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p>• <strong>New Tab:</strong> Click "Open in New Tab" to view the full dashboard</p>
                      <p>• <strong>New Window:</strong> Click "Open in New Window" for a dedicated preview</p>
                      <p>• <strong>Direct URL:</strong> Copy and paste the URL in your browser</p>
                    </div>
                  </div>
                </div>
              ) : (
                <Card className="flex-1 flex items-center justify-center">
                  <CardContent className="text-center">
                    <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Preview Not Started
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Configure your API keys and start the preview server to see your dashboard in action.
                    </p>
                    <Button onClick={() => setActiveTab('config')}>
                      <Settings className="w-4 h-4 mr-2" />
                      Go to Configuration
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="logs" className="flex-1 flex flex-col">
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Server Logs
                  </CardTitle>
                  <CardDescription>
                    Real-time logs from the preview server
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
                    {previewState.logs.length === 0 ? (
                      <div className="text-gray-500">No logs yet. Start the preview server to see logs.</div>
                    ) : (
                      previewState.logs.map((log, index) => (
                        <div key={index} className="mb-1">
                          {log}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
} 