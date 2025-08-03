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
  Code2,
  Wallet,
  Coins,
  TrendingUp,
  Repeat,
  Zap,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { Node, Edge } from "@xyflow/react";

// Import the actual component classes
import { OneInchSwapComponent } from '@/lib/components/defi/oneinch-swap';

interface CodeGenerationResult {
  projectName?: string
  description?: string
  framework?: string
  features?: string[]
  files?: Record<string, string>
  dependencies?: any
}

interface FunctionalPreviewPanelProps {
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
  testWalletAddress?: string;
}

interface ComponentExecution {
  nodeId: string;
  status: 'idle' | 'running' | 'success' | 'error';
  result?: any;
  error?: string;
  logs: string[];
  executionTime?: number;
}

const SUPPORTED_CHAINS = {
  '1': { 
    name: 'Ethereum', 
    symbol: 'ETH', 
    rpc: 'https://eth.llamarpc.com',
    tokens: {
      'ETH': '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      'USDC': '0xA0b86a33E6417c4a4e6d3b7e6d8f0e8b8e8c8d8e',
      'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F'
    }
  },
  '137': { 
    name: 'Polygon', 
    symbol: 'MATIC', 
    rpc: 'https://polygon-rpc.com',
    tokens: {
      'MATIC': '0x0000000000000000000000000000000000001010',
      'USDC': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      'USDT': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
    }
  },
  '56': { 
    name: 'BSC', 
    symbol: 'BNB', 
    rpc: 'https://bsc-dataseed1.binance.org',
    tokens: {
      'BNB': '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      'USDT': '0x55d398326f99059fF775485246999027B3197955',
      'BUSD': '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'
    }
  }
};

const DEFAULT_TOKENS = {
  '1': ['ETH', 'USDC', 'USDT', 'DAI'],
  '137': ['MATIC', 'USDC', 'USDT'],
  '56': ['BNB', 'USDT', 'BUSD']
};

export function FunctionalPreviewPanel({ 
  nodes, 
  edges, 
  projectName, 
  isVisible, 
  onToggle,
  codeResult 
}: FunctionalPreviewPanelProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'config' | 'logs' | 'testing'>('preview');
  const [config, setConfig] = useState<PreviewConfig>({
    chainId: '1',
    enabledChains: ['1', '137', '56'],
    defaultTokens: DEFAULT_TOKENS,
    testWalletAddress: '0x1234567890123456789012345678901234567890' // Demo address
  });

  // Component execution state
  const [executions, setExecutions] = useState<Record<string, ComponentExecution>>({});
  const [globalLogs, setGlobalLogs] = useState<string[]>([]);
  const [isExecutingFlow, setIsExecutingFlow] = useState(false);

  // Test form state
  const [testForm, setTestForm] = useState({
    fromToken: 'ETH',
    toToken: 'USDC',
    amount: '1.0',
    selectedNode: ''
  });

  // Check configuration completeness
  const isConfigValid = config.oneInchApiKey && config.chainId;
  const [demoMode, setDemoMode] = useState(false);

  const handleConfigChange = (key: keyof PreviewConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    setGlobalLogs(prev => [...prev, logMessage]);
  };

  const getComponentInstance = (nodeType: string) => {
    switch (nodeType) {
      case 'oneInchSwap':
        return new OneInchSwapComponent();
      
      // For now, create mock components for other node types
      case 'walletConnector':
      case 'tokenSelector':
      case 'oneInchQuote':
      case 'priceImpactCalculator':
      case 'fusionPlus':
      case 'limitOrder':
      case 'portfolioAPI':
      case 'transactionMonitor':
      case 'defiDashboard':
        return createMockComponent(nodeType);
      
      default:
        return null;
    }
  };

  // Create a mock component for testing purposes
  const createMockComponent = (nodeType: string) => ({
    execute: async (inputs: Record<string, any>) => {
      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      
      // Mock different behaviors based on node type
      switch (nodeType) {
        case 'walletConnector':
          return {
            success: true,
            outputs: {
              connected: true,
              address: inputs.from_address || '0x1234567890123456789012345678901234567890',
              chainId: inputs.chain_id || '1',
              supportedWallets: ['MetaMask', 'WalletConnect', 'Coinbase Wallet']
            },
            logs: [
              { message: 'Wallet connection initialized', level: 'info' },
              { message: 'Connected to MetaMask', level: 'success' }
            ],
            executionTime: 800
          };
          
        case 'tokenSelector':
          return {
            success: true,
            outputs: {
              fromToken: inputs.from_token || 'ETH',
              toToken: inputs.to_token || 'USDC',
              fromTokenAddress: inputs.from_token,
              toTokenAddress: inputs.to_token,
              amount: inputs.amount || '1.0',
              availableTokens: ['ETH', 'USDC', 'USDT', 'DAI', 'WBTC']
            },
            logs: [
              { message: 'Token selector initialized', level: 'info' },
              { message: `Selected ${inputs.from_token || 'ETH'} → ${inputs.to_token || 'USDC'}`, level: 'success' }
            ],
            executionTime: 300
          };
          
        case 'oneInchQuote':
          // This should use real API - we'll handle this separately
          return {
            success: true,
            outputs: {
              fromTokenAmount: inputs.amount || '100000000000000000', // 0.1 ETH instead of 1 ETH
              toTokenAmount: '245678000', // Mock USDC amount (6 decimals) - adjusted for smaller amount
              estimatedGas: '150000',
              protocols: [['UNISWAP_V3', 'SUSHISWAP']],
              priceImpact: '0.02'
            },
            logs: [
              { message: 'Fetching quote from 1inch API', level: 'info' },
              { message: 'Quote received successfully', level: 'success' }
            ],
            executionTime: 1200
          };
          
        case 'priceImpactCalculator':
          return {
            success: true,
            outputs: {
              priceImpact: '0.02%',
              slippageTolerance: inputs.slippage || '1%',
              minimumReceived: '2432.45 USDC',
              warningLevel: 'low'
            },
            logs: [
              { message: 'Calculating price impact', level: 'info' },
              { message: 'Price impact within acceptable range', level: 'success' }
            ],
            executionTime: 200
          };
          
        default:
          return {
            success: true,
            outputs: {
              status: 'completed',
              nodeType: nodeType,
              message: `${nodeType} executed successfully (mock)`
            },
            logs: [
              { message: `${nodeType} component executed`, level: 'info' },
              { message: 'Mock execution completed', level: 'success' }
            ],
            executionTime: 500
          };
      }
    }
  });

  const executeNode = async (node: Node) => {
    if (!isConfigValid && !demoMode) {
      toast.error('Please configure your API key first or enable demo mode');
      return;
    }

    const nodeId = node.id;
    addLog(`Starting execution of ${node.data.label || node.type}`, 'info');

    // Update execution state
    setExecutions(prev => ({
      ...prev,
      [nodeId]: {
        nodeId,
        status: 'running',
        logs: [],
        result: undefined,
        error: undefined
      }
    }));

    try {
      const component = getComponentInstance(node.type);
      if (!component) {
        throw new Error(`No component implementation found for ${node.type}`);
      }

      // Prepare inputs based on node config and global config
      const inputs = {
        api_key: config.oneInchApiKey,
        chain_id: config.chainId,
        supported_chains: config.enabledChains,
        from_token: SUPPORTED_CHAINS[config.chainId as keyof typeof SUPPORTED_CHAINS]?.tokens[testForm.fromToken],
        to_token: SUPPORTED_CHAINS[config.chainId as keyof typeof SUPPORTED_CHAINS]?.tokens[testForm.toToken],
        amount: testForm.amount,
        from_address: config.testWalletAddress,
        slippage: 1,
        ...node.data.config // Include node-specific config
      };

      addLog(`Executing ${node.type} with inputs: ${Object.keys(inputs).join(', ')}`, 'info');

      // Execute the component
      const result = await component.execute(inputs);

      if (result.success) {
        addLog(`✅ ${node.data.label || node.type} executed successfully`, 'success');
        setExecutions(prev => ({
          ...prev,
          [nodeId]: {
            nodeId,
            status: 'success',
            logs: result.logs?.map(log => log.message) || [],
            result: result.outputs,
            executionTime: result.executionTime
          }
        }));
      } else {
        throw new Error(result.error || 'Component execution failed');
      }

    } catch (error: any) {
      addLog(`❌ ${node.data.label || node.type} failed: ${error.message}`, 'error');
      setExecutions(prev => ({
        ...prev,
        [nodeId]: {
          nodeId,
          status: 'error',
          logs: [],
          error: error.message,
          result: undefined
        }
      }));
    }
  };

  const executeFlow = async () => {
    if (!isConfigValid && !demoMode) {
      toast.error('Please configure your API key first or enable demo mode');
      return;
    }

    setIsExecutingFlow(true);
    addLog('🚀 Starting flow execution...', 'info');

    try {
      // Execute nodes in order (you might want to implement proper dependency resolution)
      for (const node of nodes) {
        await executeNode(node);
        // Add small delay between executions
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      addLog('🎉 Flow execution completed!', 'success');
      toast.success('Flow executed successfully!');
    } catch (error: any) {
      addLog(`💥 Flow execution failed: ${error.message}`, 'error');
      toast.error('Flow execution failed');
    } finally {
      setIsExecutingFlow(false);
    }
  };

  const testQuoteNode = async () => {
    if (!isConfigValid && !demoMode) {
      toast.error('Please configure your API key first or enable demo mode');
      return;
    }

    // If in demo mode, use mock data
    if (demoMode) {
      addLog(`🎭 Demo mode: Getting mock quote for ${testForm.amount} ${testForm.fromToken} → ${testForm.toToken}`, 'info');
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      const mockRate = testForm.fromToken === 'ETH' && testForm.toToken === 'USDC' ? 2456.78 : 1.0;
      const mockAmount = (parseFloat(testForm.amount) * mockRate).toFixed(6);
      
      addLog(`✅ Mock quote received: ${mockAmount} ${testForm.toToken}`, 'success');
      toast.success('Demo quote fetched successfully!');
      return;
    }

    addLog(`Getting quote for ${testForm.amount} ${testForm.fromToken} → ${testForm.toToken}`, 'info');

    try {
      // Make direct API call to 1inch for quote
      const chainId = config.chainId;
      const chainData = SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS];
      
      if (!chainData) {
        throw new Error(`Chain ${chainId} not supported`);
      }

      const fromToken = chainData.tokens[testForm.fromToken];
      const toToken = chainData.tokens[testForm.toToken];
      
      if (!fromToken || !toToken) {
        throw new Error(`Token not available on ${chainData.name}. Available tokens: ${Object.keys(chainData.tokens).join(', ')}`);
      }

      // Calculate amount in wei (18 decimals for ETH, but USDC has 6 decimals)
      let amount;
      if (testForm.fromToken === 'USDC' || testForm.fromToken === 'USDT') {
        amount = (parseFloat(testForm.amount) * 1e6).toString(); // 6 decimals
      } else {
        amount = (parseFloat(testForm.amount) * 1e18).toString(); // 18 decimals
      }

      const params = new URLSearchParams({
        fromTokenAddress: fromToken,
        toTokenAddress: toToken,
        amount: amount,
      });

      addLog(`Making API call to chain ${chainId} (${chainData.name})`, 'info');
      addLog(`From: ${fromToken} (${testForm.fromToken})`, 'info');
      addLog(`To: ${toToken} (${testForm.toToken})`, 'info');
      addLog(`Amount: ${amount}`, 'info');

      const response = await fetch(`/api/oneinch-proxy?chainId=${chainId}&endpoint=quote&${params}`, {
        headers: {
          'x-api-key': config.oneInchApiKey!,
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        addLog(`API Error: ${JSON.stringify(errorData)}`, 'error');
        throw new Error(errorData.error || `API Error: ${response.status}`);
      }

      const quoteData = await response.json();
      addLog(`Raw quote data: ${JSON.stringify(quoteData)}`, 'info');
      
      // Handle v6.0 API response format
      const outputAmount = quoteData.dstAmount || quoteData.toTokenAmount || quoteData.toAmount;
      const gasEstimate = quoteData.gas || quoteData.estimatedGas;
      
      if (!outputAmount) {
        addLog(`❌ No output amount in response: ${JSON.stringify(quoteData)}`, 'error');
        throw new Error('Invalid quote response - no output amount');
      }
      
      // Calculate display amount based on token decimals
      let displayAmount;
      if (testForm.toToken === 'USDC' || testForm.toToken === 'USDT') {
        displayAmount = (parseInt(outputAmount) / 1e6).toFixed(6); // 6 decimals
      } else {
        displayAmount = (parseInt(outputAmount) / 1e18).toFixed(6); // 18 decimals
      }
      
      addLog(`✅ Quote received: ${displayAmount} ${testForm.toToken}`, 'success');
      addLog(`📊 Output amount (wei): ${outputAmount}`, 'info');
      
      // Show gas estimate if available
      if (gasEstimate) {
        addLog(`⛽ Estimated gas: ${parseInt(gasEstimate).toLocaleString()}`, 'info');
      }
      
      // Update execution state for quote node (if it exists)
      const quoteNode = nodes.find(n => n.type === 'oneInchQuote');
      if (quoteNode) {
        setExecutions(prev => ({
          ...prev,
          [quoteNode.id]: {
            nodeId: quoteNode.id,
            status: 'success',
            logs: [`Quote: ${testForm.amount} ${testForm.fromToken} → ${displayAmount} ${testForm.toToken}`],
            result: quoteData,
            executionTime: 0
          }
        }));
      }

      toast.success('Quote fetched successfully!');

    } catch (error: any) {
      addLog(`❌ Quote failed: ${error.message}`, 'error');
      toast.error(`Quote failed: ${error.message}`);
    }
  };

  const getNodeIcon = (nodeType: string) => {
    switch (nodeType) {
      case 'walletConnector': return <Wallet className="w-4 h-4" />;
      case 'tokenSelector': return <Coins className="w-4 h-4" />;
      case 'oneInchQuote': return <TrendingUp className="w-4 h-4" />;
      case 'oneInchSwap': return <Repeat className="w-4 h-4" />;
      case 'fusionPlus': return <Zap className="w-4 h-4" />;
      case 'limitOrder': return <BarChart3 className="w-4 h-4" />;
      default: return <div className="w-4 h-4 bg-gray-300 rounded" />;
    }
  };

  const getStatusIcon = (status: ComponentExecution['status']) => {
    switch (status) {
      case 'running': return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  if (!isVisible) return null;

  const panelWidth = isFullscreen ? 'w-full' : isMinimized ? 'w-12' : 'w-96';
  const panelHeight = isFullscreen ? 'h-full' : 'h-full';

  return (
    <div className={`${panelWidth} ${panelHeight} bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50' : 'relative'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-green-50 to-blue-50">
        {!isMinimized && (
          <>
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-green-600" />
              <h3 className="font-medium text-sm">Functional Testing</h3>
              <Badge variant="default" className="text-xs bg-green-500">
                Real APIs
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
                <ChevronRight className="w-3 h-3" />
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
              <TabsList className="grid w-full grid-cols-4 h-8">
                <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
                <TabsTrigger value="testing" className="text-xs">Testing</TabsTrigger>
                <TabsTrigger value="config" className="text-xs">Config</TabsTrigger>
                <TabsTrigger value="logs" className="text-xs">Logs</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'preview' && (
              <div className="h-full overflow-y-auto p-4 space-y-4">
                {/* Flow Status */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Flow Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {nodes.map((node) => {
                      const execution = executions[node.id];
                      return (
                        <div key={node.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            {getNodeIcon(node.type)}
                            <span className="text-sm font-medium">
                              {node.data.label || node.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(execution?.status || 'idle')}
                            <Button
                              onClick={() => executeNode(node)}
                              disabled={execution?.status === 'running' || (!isConfigValid && !demoMode)}
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-xs"
                            >
                              Test
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Execute All Button */}
                <Button
                  onClick={executeFlow}
                  disabled={isExecutingFlow || (!isConfigValid && !demoMode)}
                  className="w-full"
                >
                  {isExecutingFlow ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Executing Flow...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Execute Full Flow
                    </>
                  )}
                </Button>

                {/* Execution Results */}
                {Object.values(executions).filter(e => e.result || e.error).length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Latest Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {Object.values(executions).map((execution) => {
                        if (!execution.result && !execution.error) return null;
                        return (
                          <div key={execution.nodeId} className="p-2 bg-gray-50 rounded text-xs">
                            <div className="font-medium mb-1 flex items-center gap-2">
                              {getStatusIcon(execution.status)}
                              Node: {execution.nodeId}
                            </div>
                            {execution.result && (
                              <pre className="text-xs text-green-700 overflow-auto max-h-20">
                                {JSON.stringify(execution.result, null, 2)}
                              </pre>
                            )}
                            {execution.error && (
                              <div className="text-xs text-red-700">
                                Error: {execution.error}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'testing' && (
              <div className="p-4 space-y-4 overflow-y-auto">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Quick Test - 1inch Quote</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">From Token</Label>
                        <Select value={testForm.fromToken} onValueChange={(value) => setTestForm(prev => ({ ...prev, fromToken: value }))}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DEFAULT_TOKENS[config.chainId as keyof typeof DEFAULT_TOKENS]?.map(token => (
                              <SelectItem key={token} value={token} className="text-xs">
                                {token}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">To Token</Label>
                        <Select value={testForm.toToken} onValueChange={(value) => setTestForm(prev => ({ ...prev, toToken: value }))}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DEFAULT_TOKENS[config.chainId as keyof typeof DEFAULT_TOKENS]?.map(token => (
                              <SelectItem key={token} value={token} className="text-xs">
                                {token}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Amount</Label>
                      <Input
                        type="number"
                        value={testForm.amount}
                        onChange={(e) => setTestForm(prev => ({ ...prev, amount: e.target.value }))}
                        className="h-8 text-xs"
                        placeholder="1.0"
                      />
                    </div>
                    <Button
                      onClick={testQuoteNode}
                      disabled={!isConfigValid && !demoMode}
                      className="w-full h-8 text-xs"
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Get Real Quote
                    </Button>
                  </CardContent>
                </Card>

                {/* Individual Node Testing */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Individual Node Testing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {nodes.map((node) => (
                      <div key={node.id} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-xs font-medium">{node.data.label || node.type}</span>
                        <Button
                          onClick={() => executeNode(node)}
                          disabled={executions[node.id]?.status === 'running' || (!isConfigValid && !demoMode)}
                          size="sm"
                          className="h-6 px-2 text-xs"
                        >
                          {executions[node.id]?.status === 'running' ? 'Testing...' : 'Test'}
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
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
                  <Label className="text-xs">Test Chain</Label>
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

                <div className="space-y-2">
                  <Label className="text-xs">Test Wallet Address</Label>
                  <Input
                    value={config.testWalletAddress || ''}
                    onChange={(e) => handleConfigChange('testWalletAddress', e.target.value)}
                    className="h-8 text-xs"
                    placeholder="0x..."
                  />
                  <p className="text-xs text-gray-500">
                    Demo address for testing (no real transactions)
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="demo-mode"
                      checked={demoMode}
                      onChange={(e) => setDemoMode(e.target.checked)}
                    />
                    <Label htmlFor="demo-mode" className="text-xs">
                      Demo Mode (Mock data, no API key required)
                    </Label>
                  </div>
                  {demoMode && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                      🎭 Demo mode enabled - using mock data for testing
                    </div>
                  )}
                </div>

                {!isConfigValid && !demoMode && (
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                    ⚠️ Please configure your 1inch API key or enable demo mode to start testing
                  </div>
                )}
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="p-4 h-full overflow-y-auto">
                <div className="space-y-1">
                  {globalLogs.length > 0 ? (
                    globalLogs.map((log, index) => (
                      <div key={index} className="text-xs font-mono text-gray-600 py-1 border-b border-gray-100">
                        {log}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-500 text-center py-8">
                      No logs yet. Start testing to see activity.
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