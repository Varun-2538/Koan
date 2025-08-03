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
  AlertCircle,
  Link
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

interface RealTestnetPreviewProps {
  nodes: Node[]
  edges: Edge[]
  projectName: string
  isVisible: boolean
  onToggle: () => void
  codeResult?: CodeGenerationResult | null
}

interface TestnetConfig {
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

interface WalletState {
  isConnected: boolean;
  address?: string;
  chainId?: string;
  balance?: string;
  provider?: any;
}

// 1inch supported networks (MAINNETS ONLY - 1inch doesn't support testnets)
const SUPPORTED_CHAINS = {
  '1': { 
    name: 'Ethereum Mainnet', 
    symbol: 'ETH', 
    rpc: 'https://eth.llamarpc.com',
    isTestnet: false,
    tokens: {
      'ETH': '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      'USDC': '0xA0b86a33E6441203206448619dd91e2df9dd2abf',
      'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F'
    }
  },
  '137': { 
    name: 'Polygon Mainnet', 
    symbol: 'MATIC', 
    rpc: 'https://polygon-rpc.com',
    isTestnet: false,
    tokens: {
      'MATIC': '0x0000000000000000000000000000000000001010',
      'USDC': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      'USDT': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
    }
  },
  '56': { 
    name: 'BSC Mainnet', 
    symbol: 'BNB', 
    rpc: 'https://bsc-dataseed1.binance.org',
    isTestnet: false,
    tokens: {
      'BNB': '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      'USDT': '0x55d398326f99059fF775485246999027B3197955',
      'BUSD': '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'
    }
  },
  '42161': { // Arbitrum
    name: 'Arbitrum Mainnet', 
    symbol: 'ETH', 
    rpc: 'https://arb1.arbitrum.io/rpc',
    isTestnet: false,
    tokens: {
      'ETH': '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      'USDC': '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      'USDT': '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'
    }
  },
  '10': { // Optimism
    name: 'Optimism Mainnet', 
    symbol: 'ETH', 
    rpc: 'https://mainnet.optimism.io',
    isTestnet: false,
    tokens: {
      'ETH': '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      'USDC': '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      'USDT': '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58'
    }
  },
  '8453': { // Base
    name: 'Base Mainnet', 
    symbol: 'ETH', 
    rpc: 'https://mainnet.base.org',
    isTestnet: false,
    tokens: {
      'ETH': '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      'USDC': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      'USDT': '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'
    }
  }
};

const DEFAULT_TOKENS = {
  '1': ['ETH', 'USDC', 'USDT', 'DAI'],
  '137': ['MATIC', 'USDC', 'USDT'],
  '56': ['BNB', 'USDT', 'BUSD'],
  '42161': ['ETH', 'USDC', 'USDT'],
  '10': ['ETH', 'USDC', 'USDT'],
  '8453': ['ETH', 'USDC', 'USDT']
};

export function RealTestnetPreview({ 
  nodes, 
  edges, 
  projectName, 
  isVisible, 
  onToggle,
  codeResult 
}: RealTestnetPreviewProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'config' | 'logs' | 'testing' | 'wallet'>('wallet');
  const [config, setConfig] = useState<TestnetConfig>({
    chainId: '137', // Default to Polygon mainnet (lowest fees)
    enabledChains: ['1', '137', '56', '42161', '10', '8453'],
    defaultTokens: DEFAULT_TOKENS
  });

  // Wallet state
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false
  });

  // Component execution state
  const [executions, setExecutions] = useState<Record<string, ComponentExecution>>({});
  const [globalLogs, setGlobalLogs] = useState<string[]>([]);
  const [isExecutingFlow, setIsExecutingFlow] = useState(false);

  // Test form state
  const [testForm, setTestForm] = useState({
    fromToken: 'MATIC',
    toToken: 'USDT',
    amount: '1', // Minimum amount for sufficient liquidity
    selectedNode: ''
  });

  // Quote dashboard state
  const [quoteResult, setQuoteResult] = useState<{
    fromAmount: string;
    toAmount: string;
    fromToken: string;
    toToken: string;
    rate: string;
    gasEstimate: string;
    timestamp: string;
  } | null>(null);

  // Check configuration completeness
  const isConfigValid = config.oneInchApiKey && config.chainId && wallet.isConnected;

  const handleConfigChange = (key: keyof TestnetConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    setGlobalLogs(prev => [...prev, logMessage]);
  };

  // MetaMask wallet connection
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      addLog('Connecting to MetaMask...', 'info');

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please make sure MetaMask is unlocked.');
      }

      // Get current chain ID
      const chainId = await window.ethereum.request({
        method: 'eth_chainId'
      });

      // Get balance
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest']
      });

      const balanceInEth = (parseInt(balance, 16) / 1e18).toFixed(6);

      setWallet({
        isConnected: true,
        address: accounts[0],
        chainId: parseInt(chainId, 16).toString(),
        balance: balanceInEth,
        provider: window.ethereum
      });

      addLog(`✅ Wallet connected: ${accounts[0]}`, 'success');
      addLog(`💰 Balance: ${balanceInEth} ETH`, 'info');
      addLog(`🔗 Chain ID: ${parseInt(chainId, 16)}`, 'info');

      toast.success('Wallet connected successfully!');

      // Check if user is on the correct network
      const expectedChainId = parseInt(config.chainId, 10);
      const currentChainId = parseInt(chainId, 16);

      if (currentChainId !== expectedChainId) {
        addLog(`⚠️ Please switch to ${SUPPORTED_CHAINS[config.chainId as keyof typeof SUPPORTED_CHAINS]?.name}`, 'warning');
        toast.error(`Please switch to ${SUPPORTED_CHAINS[config.chainId as keyof typeof SUPPORTED_CHAINS]?.name} in MetaMask`);
      } else {
        addLog(`🎯 Connected to correct network: ${SUPPORTED_CHAINS[config.chainId as keyof typeof SUPPORTED_CHAINS]?.name}`, 'success');
      }

    } catch (error: any) {
      addLog(`❌ Wallet connection failed: ${error.message}`, 'error');
      toast.error(`Wallet connection failed: ${error.message}`);
    }
  };

  const disconnectWallet = () => {
    setWallet({
      isConnected: false
    });
    addLog('👋 Wallet disconnected', 'info');
    toast.success('Wallet disconnected');
  };

  const switchNetwork = async (chainId: string) => {
    try {
      if (!wallet.provider) {
        throw new Error('Wallet not connected');
      }

      const chainData = SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS];
      if (!chainData) {
        throw new Error('Unsupported chain');
      }

      addLog(`Switching to ${chainData.name}...`, 'info');

      await wallet.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${parseInt(chainId, 10).toString(16)}` }],
      });

      // Update config
      setConfig(prev => ({ ...prev, chainId }));
      
      // Update wallet state
      const newBalance = await wallet.provider.request({
        method: 'eth_getBalance',
        params: [wallet.address, 'latest']
      });

      setWallet(prev => ({
        ...prev,
        chainId,
        balance: (parseInt(newBalance, 16) / 1e18).toFixed(6)
      }));

      addLog(`✅ Switched to ${chainData.name}`, 'success');
      toast.success(`Switched to ${chainData.name}`);

    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added to MetaMask, try to add it
        try {
          const chainData = SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS];
          await wallet.provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${parseInt(chainId, 10).toString(16)}`,
              chainName: chainData.name,
              rpcUrls: [chainData.rpc],
              nativeCurrency: {
                name: chainData.symbol,
                symbol: chainData.symbol,
                decimals: 18
              }
            }]
          });
          
          addLog(`✅ Added and switched to ${chainData.name}`, 'success');
          toast.success(`Added and switched to ${chainData.name}`);
        } catch (addError: any) {
          addLog(`❌ Failed to add network: ${addError.message}`, 'error');
          toast.error(`Failed to add network: ${addError.message}`);
        }
      } else {
        addLog(`❌ Network switch failed: ${error.message}`, 'error');
        toast.error(`Network switch failed: ${error.message}`);
      }
    }
  };

  const testRealQuote = async () => {
    if (!isConfigValid) {
      toast.error('Please connect wallet and configure API key first');
      return;
    }

    // Validate minimum amounts for liquidity
    const amount = parseFloat(testForm.amount);
    if (amount < 0.1) {
      addLog(`❌ Amount too small: ${testForm.amount} ${testForm.fromToken}. 1inch needs at least 0.1 for liquidity.`, 'error');
      toast.error('Amount too small - use at least 0.1 for sufficient liquidity');
      return;
    }

    addLog(`Getting REAL quote for ${testForm.amount} ${testForm.fromToken} → ${testForm.toToken}`, 'info');

    try {
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

      // Calculate amount in wei
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
        from: wallet.address!, // Add wallet address for proper liquidity calculation
      });

      addLog(`🔗 Making REAL API call to ${chainData.name} MAINNET (Chain ${chainId})`, 'info');
      addLog(`📍 From: ${fromToken} (${testForm.fromToken})`, 'info');
      addLog(`📍 To: ${toToken} (${testForm.toToken})`, 'info');
      addLog(`💰 Amount: ${amount} (${testForm.amount} ${testForm.fromToken})`, 'info');
      addLog(`👤 Wallet: ${wallet.address} (for liquidity calculation)`, 'info');

      const response = await fetch(`/api/oneinch-proxy?chainId=${chainId}&endpoint=quote&${params}`, {
        headers: {
          'x-api-key': config.oneInchApiKey!,
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        addLog(`❌ API Error: ${JSON.stringify(errorData)}`, 'error');
        throw new Error(errorData.error || `API Error: ${response.status}`);
      }

      const quoteData = await response.json();
      addLog(`📊 Raw quote data: ${JSON.stringify(quoteData)}`, 'info');
      
      // Handle both v5.2 and v6.0 API response formats
      const outputAmount = quoteData.dstAmount || quoteData.toTokenAmount || quoteData.toAmount;
      const gasEstimate = quoteData.gas || quoteData.estimatedGas;
      
      addLog(`🔍 Debug - Raw outputAmount: "${outputAmount}" (type: ${typeof outputAmount})`, 'info');
      
      if (!outputAmount) {
        addLog(`❌ No output amount in response: ${JSON.stringify(quoteData)}`, 'error');
        throw new Error('Invalid quote response - no output amount');
      }
      
      // Calculate display amount based on token decimals
      let displayAmount;
      const parsedAmount = parseInt(outputAmount);
      addLog(`🔍 Debug - Parsed amount: ${parsedAmount} (isNaN: ${isNaN(parsedAmount)})`, 'info');
      
      if (testForm.toToken === 'USDC' || testForm.toToken === 'USDT') {
        displayAmount = (parsedAmount / 1e6).toFixed(6); // 6 decimals
        addLog(`🔍 Debug - USDT calculation: ${parsedAmount} / 1e6 = ${displayAmount}`, 'info');
      } else {
        displayAmount = (parsedAmount / 1e18).toFixed(6); // 18 decimals
        addLog(`🔍 Debug - Other token calculation: ${parsedAmount} / 1e18 = ${displayAmount}`, 'info');
      }
      
             addLog(`✅ REAL quote received: ${displayAmount} ${testForm.toToken}`, 'success');
       addLog(`📊 Output amount (wei): ${outputAmount}`, 'info');
       
       // Show gas estimate if available
       if (gasEstimate) {
         addLog(`⛽ Estimated gas: ${parseInt(gasEstimate).toLocaleString()}`, 'info');
       } else {
         addLog(`⚠️ No gas estimate in response`, 'info');
       }

       // Save quote result to dashboard
       const rate = (parseFloat(displayAmount) / parseFloat(testForm.amount)).toFixed(6);
       setQuoteResult({
         fromAmount: testForm.amount,
         toAmount: displayAmount,
         fromToken: testForm.fromToken,
         toToken: testForm.toToken,
         rate: rate,
         gasEstimate: gasEstimate ? parseInt(gasEstimate).toLocaleString() : 'N/A',
         timestamp: new Date().toLocaleTimeString()
       });

       toast.success('Real quote fetched successfully!');

    } catch (error: any) {
      const errorMsg = error.message;
      addLog(`❌ Real quote failed: ${errorMsg}`, 'error');
      
      // Provide helpful suggestions for common errors
      if (errorMsg.includes('insufficient liquidity')) {
        addLog(`💡 Try: 1) Increase amount to 1+ ${testForm.fromToken}, 2) Use MATIC→USDT pair, 3) Switch to Ethereum mainnet`, 'info');
        toast.error('Insufficient liquidity - try larger amount (1+ tokens) or different pair');
      } else {
        toast.error(`Quote failed: ${errorMsg}`);
      }
    }
  };

    const checkTokenAllowance = async (tokenAddress: string, amount: string) => {
    try {
      const chainId = config.chainId;
      const params = new URLSearchParams({
        tokenAddress: tokenAddress,
        walletAddress: wallet.address!.toLowerCase()
      });

      addLog(`🔍 Checking token allowance for ${testForm.fromToken}...`, 'info');

      const response = await fetch(`/api/oneinch-proxy?chainId=${chainId}&endpoint=approve/allowance&${params}`, {
        headers: {
          'x-api-key': config.oneInchApiKey!,
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Allowance check failed: ${response.status}`);
      }

      const allowanceData = await response.json();
      const allowance = BigInt(allowanceData.allowance);
      const requiredAmount = BigInt(amount);

      addLog(`💰 Current allowance: ${allowance.toString()}`, 'info');
      addLog(`💰 Required amount: ${requiredAmount.toString()}`, 'info');

      return allowance >= requiredAmount;
    } catch (error: any) {
      addLog(`❌ Allowance check failed: ${error.message}`, 'error');
      throw error;
    }
  };

  const approveToken = async (tokenAddress: string, amount: string) => {
    try {
      const chainId = config.chainId;
      const params = new URLSearchParams({
        tokenAddress: tokenAddress,
        amount: amount
      });

      addLog(`📝 Creating approval transaction for ${testForm.fromToken}...`, 'info');

      const response = await fetch(`/api/oneinch-proxy?chainId=${chainId}&endpoint=approve/transaction&${params}`, {
        headers: {
          'x-api-key': config.oneInchApiKey!,
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Approval transaction failed: ${response.status}`);
      }

      const approvalData = await response.json();
      addLog(`🎯 Approval transaction prepared`, 'success');

      // Send approval transaction via MetaMask
      addLog(`📝 Sending approval to MetaMask...`, 'info');

      const txHash = await wallet.provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: wallet.address,
          to: approvalData.to,
          value: approvalData.value || '0x0',
          data: approvalData.data,
          gas: approvalData.gas
        }]
      });

      addLog(`✅ Approval transaction sent! Hash: ${txHash}`, 'success');
      toast.success(`Approval sent! Hash: ${txHash.slice(0, 10)}...`);

      // Wait for confirmation
      addLog(`⏳ Waiting for approval confirmation...`, 'info');
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds

      return txHash;
    } catch (error: any) {
      if (error.code === 4001) {
        addLog(`❌ Approval rejected by user`, 'error');
        toast.error('Approval rejected by user');
      } else {
        addLog(`❌ Approval failed: ${error.message}`, 'error');
        toast.error(`Approval failed: ${error.message}`);
      }
      throw error;
    }
  };

  const executeRealSwap = async () => {
    if (!isConfigValid) {
      toast.error('Please connect wallet and configure API key first');
      return;
    }

    addLog(`🚀 Starting REAL MAINNET swap: ${testForm.amount} ${testForm.fromToken} → ${testForm.toToken}`, 'info');

    try {
      const chainId = config.chainId;
      const chainData = SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS];
      
      if (!chainData) {
        throw new Error(`Chain ${chainId} not supported`);
      }

      const fromToken = chainData.tokens[testForm.fromToken];
      const toToken = chainData.tokens[testForm.toToken];
      
      if (!fromToken || !toToken) {
        throw new Error(`Token not available on ${chainData.name}`);
      }

      // Calculate amount in wei
      let amount;
      if (testForm.fromToken === 'USDC' || testForm.fromToken === 'USDT') {
        amount = (parseFloat(testForm.amount) * 1e6).toString();
      } else {
        amount = (parseFloat(testForm.amount) * 1e18).toString();
      }

      // Step 1: Check and approve token allowance (skip for native tokens like ETH/MATIC)
      if (fromToken !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
        addLog(`🔐 Step 1: Checking token allowance...`, 'info');
        
        const hasAllowance = await checkTokenAllowance(fromToken, amount);
        
        if (!hasAllowance) {
          addLog(`🔑 Insufficient allowance, requesting approval...`, 'info');
          await approveToken(fromToken, amount);
          addLog(`✅ Token approved successfully!`, 'success');
        } else {
          addLog(`✅ Sufficient allowance already exists`, 'success');
        }
      } else {
        addLog(`ℹ️ Native token (${testForm.fromToken}) - no approval needed`, 'info');
      }

      // Step 2: Execute the swap
      addLog(`💱 Step 2: Preparing swap transaction...`, 'info');

      const swapParams = new URLSearchParams({
        src: fromToken,
        dst: toToken,
        amount: amount,
        from: wallet.address!.toLowerCase(),
        slippage: '1',
        disableEstimate: 'false',
        allowPartialFill: 'false'
      });

      const swapResponse = await fetch(`/api/oneinch-proxy?chainId=${chainId}&endpoint=swap&${swapParams}`, {
        headers: {
          'x-api-key': config.oneInchApiKey!,
          'accept': 'application/json'
        }
      });

      if (!swapResponse.ok) {
        const errorData = await swapResponse.json();
        throw new Error(errorData.error || `Swap API Error: ${swapResponse.status}`);
      }

      const swapData = await swapResponse.json();
      addLog(`📄 Swap transaction prepared`, 'success');
      addLog(`🎯 To: ${swapData.tx.to}`, 'info');
      addLog(`💰 Value: ${swapData.tx.value} wei`, 'info');
      addLog(`⛽ Gas: ${parseInt(swapData.tx.gas || '0').toLocaleString()}`, 'info');

      // Execute the swap transaction via MetaMask
      addLog(`📝 Sending swap transaction to MetaMask...`, 'info');

      // Ensure proper hex formatting
      const formatHex = (value: any) => {
        if (!value) return '0x0';
        const str = String(value);
        if (str.startsWith('0x')) return str;
        return `0x${parseInt(str).toString(16)}`;
      };

      const txParams = {
        from: wallet.address,
        to: swapData.tx.to,
        value: formatHex(swapData.tx.value),
        data: swapData.tx.data,
        gas: formatHex(swapData.tx.gas)
      };

      addLog(`🔍 Transaction params: ${JSON.stringify(txParams)}`, 'info');

      const txHash = await wallet.provider.request({
        method: 'eth_sendTransaction',
        params: [txParams]
      });

      addLog(`✅ Swap transaction sent! Hash: ${txHash}`, 'success');
      
      // Get the correct explorer URL for the current chain
      const explorerUrls = {
        '1': 'https://etherscan.io/tx/',
        '137': 'https://polygonscan.com/tx/',
        '56': 'https://bscscan.com/tx/',
        '42161': 'https://arbiscan.io/tx/',
        '10': 'https://optimistic.etherscan.io/tx/',
        '8453': 'https://basescan.org/tx/'
      };
      
      const explorerUrl = explorerUrls[chainId as keyof typeof explorerUrls] || 'https://etherscan.io/tx/';
      addLog(`🔍 View on explorer: ${explorerUrl}${txHash}`, 'info');

      toast.success(`Swap successful! Hash: ${txHash.slice(0, 10)}...`);

      addLog(`🎉 Swap completed successfully!`, 'success');
      
    } catch (error: any) {
      console.error('Swap error details:', error);
      
      if (error.code === 4001) {
        addLog(`❌ Transaction rejected by user`, 'error');
        toast.error('Transaction rejected by user');
      } else {
        // Safe error message extraction
        const errorMessage = error?.message || error?.reason || error?.data?.message || String(error) || 'Unknown error';
        addLog(`❌ Swap failed: ${errorMessage}`, 'error');
        toast.error(`Swap failed: ${errorMessage}`);
      }
    }
  };

  if (!isVisible) return null;

  const panelWidth = isFullscreen ? 'w-full' : isMinimized ? 'w-12' : 'w-96';
  const panelHeight = isFullscreen ? 'h-full' : 'h-full';

  return (
    <div className={`${panelWidth} ${panelHeight} bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50' : 'relative'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-orange-50 to-red-50">
        {!isMinimized && (
          <>
            <div className="flex items-center gap-2">
              <Link className="w-4 h-4 text-orange-600" />
              <h3 className="font-medium text-sm">Real Mainnet Testing</h3>
              <Badge variant="default" className="text-xs bg-orange-500">
                {wallet.isConnected ? 'Connected' : 'Not Connected'}
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
              <TabsList className="grid w-full grid-cols-5 h-8">
                <TabsTrigger value="wallet" className="text-xs">Wallet</TabsTrigger>
                <TabsTrigger value="testing" className="text-xs">Testing</TabsTrigger>
                <TabsTrigger value="config" className="text-xs">Config</TabsTrigger>
                <TabsTrigger value="preview" className="text-xs">Flow</TabsTrigger>
                <TabsTrigger value="logs" className="text-xs">Logs</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'wallet' && (
              <div className="p-4 space-y-4 overflow-y-auto">
                {/* Wallet Connection */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      MetaMask Connection
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {!wallet.isConnected ? (
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-3">
                          Connect your MetaMask wallet to test real transactions
                        </p>
                        <Button onClick={connectWallet} className="w-full h-8 text-xs">
                          <Wallet className="w-3 h-3 mr-1" />
                          Connect MetaMask
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Address:</span>
                          <span className="font-mono">{wallet.address?.slice(0, 8)}...{wallet.address?.slice(-6)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Balance:</span>
                          <span>{wallet.balance} {SUPPORTED_CHAINS[wallet.chainId as keyof typeof SUPPORTED_CHAINS]?.symbol || 'ETH'}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Network:</span>
                          <span>{SUPPORTED_CHAINS[wallet.chainId as keyof typeof SUPPORTED_CHAINS]?.name || 'Unknown'}</span>
                        </div>
                        <Button onClick={disconnectWallet} variant="outline" className="w-full h-7 text-xs">
                          Disconnect
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Network Switcher */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Network Selection</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Label className="text-xs">Select Network</Label>
                    <Select value={config.chainId} onValueChange={switchNetwork}>
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
                    <p className="text-xs text-orange-600 font-medium">
                      ⚠️ MAINNETS ONLY - Use 1+ MATIC minimum for liquidity
                    </p>
                  </CardContent>
                </Card>

                {/* Safety Warning */}
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-orange-800">⚠️ Real Money Warning</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-xs text-orange-700 space-y-1">
                      <div><strong>1inch only supports MAINNETS</strong></div>
                      <div>• These are REAL networks with REAL money</div>
                      <div>• Start with 1+ MATIC ($0.50+) - 1inch needs liquidity</div> 
                      <div>• Polygon has lowest fees (~$0.01)</div>
                      <div>• Double-check everything before swapping</div>
                      <div>• You are responsible for your funds</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'testing' && (
              <div className="p-4 space-y-4 overflow-y-auto">
                {/* Real Quote Testing */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Real 1inch Quote Test</CardTitle>
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
                        min="0.1"
                        step="0.1"
                      />
                      <div className="flex gap-1 mt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setTestForm(prev => ({ ...prev, amount: '0.5' }))}
                        >
                          0.5
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setTestForm(prev => ({ ...prev, amount: '1' }))}
                        >
                          1
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setTestForm(prev => ({ ...prev, amount: '5' }))}
                        >
                          5
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={testRealQuote}
                        disabled={!isConfigValid}
                        className="h-8 text-xs"
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Get Real Quote
                      </Button>
                      <Button
                        onClick={executeRealSwap}
                        disabled={!isConfigValid}
                        variant="outline"
                        className="h-8 text-xs"
                      >
                        <Repeat className="w-3 h-3 mr-1" />
                        Execute Swap
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-red-600 font-medium">
                        ⚠️ REAL MAINNET TRANSACTIONS - Uses real money!
                      </p>
                      <p className="text-xs text-blue-600">
                        💡 Best pairs: MATIC→USDT, ETH→USDC. Min: 0.1+ tokens
                      </p>
                    </div>
                  </CardContent>
                </Card>

                                 {/* Quote Dashboard */}
                 {quoteResult && (
                   <Card className="border-green-200 bg-green-50">
                     <CardHeader className="pb-2">
                       <CardTitle className="text-sm text-green-800 flex items-center gap-2">
                         <TrendingUp className="w-4 h-4" />
                         Live Quote Dashboard
                       </CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-3">
                       {/* Main Quote Display */}
                       <div className="bg-white rounded-lg p-3 border">
                         <div className="text-center mb-3">
                           <div className="text-2xl font-bold text-green-600">
                             {quoteResult.fromAmount} {quoteResult.fromToken} → {quoteResult.toAmount} {quoteResult.toToken}
                           </div>
                           <div className="text-sm text-gray-600">
                             Rate: 1 {quoteResult.fromToken} = {quoteResult.rate} {quoteResult.toToken}
                           </div>
                         </div>
                         
                         {/* Quote Details */}
                         <div className="grid grid-cols-2 gap-3 text-xs">
                           <div className="bg-gray-50 p-2 rounded">
                             <div className="text-gray-600">From Amount</div>
                             <div className="font-semibold">{quoteResult.fromAmount} {quoteResult.fromToken}</div>
                           </div>
                           <div className="bg-gray-50 p-2 rounded">
                             <div className="text-gray-600">To Amount</div>
                             <div className="font-semibold">{quoteResult.toAmount} {quoteResult.toToken}</div>
                           </div>
                           <div className="bg-gray-50 p-2 rounded">
                             <div className="text-gray-600">Exchange Rate</div>
                             <div className="font-semibold">{quoteResult.rate} {quoteResult.toToken}/{quoteResult.fromToken}</div>
                           </div>
                           <div className="bg-gray-50 p-2 rounded">
                             <div className="text-gray-600">Gas Estimate</div>
                             <div className="font-semibold">{quoteResult.gasEstimate}</div>
                           </div>
                         </div>
                         
                         {/* Timestamp */}
                         <div className="text-center mt-2 text-xs text-gray-500">
                           Quote received at {quoteResult.timestamp}
                         </div>
                       </div>
                       
                       {/* Action Buttons */}
                       <div className="flex gap-2">
                         <Button
                           onClick={executeRealSwap}
                           disabled={!isConfigValid}
                           className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700"
                         >
                           <Repeat className="w-3 h-3 mr-1" />
                           Execute This Swap
                         </Button>
                         <Button
                           onClick={() => setQuoteResult(null)}
                           variant="outline"
                           className="h-8 px-3 text-xs"
                         >
                           Clear
                         </Button>
                       </div>
                     </CardContent>
                   </Card>
                 )}

                 {/* Status */}
                 {!isConfigValid && (
                   <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                     🔑 Connect wallet and configure API key to enable MAINNET testing
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

                {!config.oneInchApiKey && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                    🔑 API key required for real 1inch MAINNET integration
                  </div>
                )}
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="p-4 space-y-4 overflow-y-auto">
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-4">⚠️</div>
                  <div className="text-sm">Real MAINNET flow execution</div>
                  <div className="text-xs text-red-500 mt-2 font-medium">
                    Connect wallet and configure API key to test with REAL money
                  </div>
                </div>
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
                      No logs yet. Connect wallet and start MAINNET testing to see activity.
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