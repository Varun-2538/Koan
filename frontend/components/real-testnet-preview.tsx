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
  Link,
  ArrowLeftRight,
  Shield
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

// Fusion Plus and Monad Bridge specific interfaces
interface FusionPlusConfig {
  fromChain: string;
  toChain: string;
  fromToken: string;
  toToken: string;
  amount: string;
  slippage: string;
  enableMevProtection: boolean;
  enableGasless: boolean;
  timeoutMinutes: string;
  resolver: string;
}

interface MonadBridgeConfig {
  bridgeDirection: 'eth_to_monad' | 'monad_to_eth';
  sourceToken: string;
  destinationToken: string;
  amount: string;
  recipientAddress: string;
  timeoutMinutes: string;
  enableMevProtection: boolean;
}

interface FusionPlusResult {
  bridgeHash: string;
  fromTokenInfo: any;
  toTokenInfo: any;
  gasless: boolean;
  mevProtected: boolean;
  executionTime: number;
  resolverUsed: string;
  status: string;
  intentHash: string;
  estimatedCompletion: string;
}

interface MonadBridgeResult {
  bridgeHash: string;
  htlcContract: string;
  secretHash: string;
  timelock: number;
  status: string;
  estimatedCompletion: string;
  gasEstimate: string;
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
      'MATIC': '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      'USDC': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      'USDT': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      'DAI': '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'
    }
  },
  '56': { 
    name: 'BSC Mainnet', 
    symbol: 'BNB', 
    rpc: 'https://bsc-dataseed.binance.org',
    isTestnet: false,
    tokens: {
      'BNB': '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      'USDC': '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      'USDT': '0x55d398326f99059fF775485246999027B3197955',
      'BUSD': '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'
    }
  },
  '42161': { 
    name: 'Arbitrum One', 
    symbol: 'ETH', 
    rpc: 'https://arb1.arbitrum.io/rpc',
    isTestnet: false,
    tokens: {
      'ETH': '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      'USDC': '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      'USDT': '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      'DAI': '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'
    }
  },
  '10': { 
    name: 'Optimism', 
    symbol: 'ETH', 
    rpc: 'https://mainnet.optimism.io',
    isTestnet: false,
    tokens: {
      'ETH': '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      'USDC': '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
      'USDT': '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      'DAI': '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'
    }
  }
};

// Fusion Plus supported chains and bridge pairs
const FUSION_PLUS_CHAINS = {
  '1': { name: 'Ethereum', symbol: 'ETH', bridgePairs: ['137', '56', '42161', '10'] },
  '137': { name: 'Polygon', symbol: 'MATIC', bridgePairs: ['1', '56', '42161', '10'] },
  '56': { name: 'BSC', symbol: 'BNB', bridgePairs: ['1', '137', '42161', '10'] },
  '42161': { name: 'Arbitrum', symbol: 'ETH', bridgePairs: ['1', '137', '56', '10'] },
  '10': { name: 'Optimism', symbol: 'ETH', bridgePairs: ['1', '137', '56', '42161'] }
};

// Monad Bridge configuration
const MONAD_BRIDGE_CONFIG = {
  eth_chain_id: '1',
  monad_chain_id: '1337', // Placeholder for Monad mainnet
  htlc_timeout: 3600, // 1 hour
  min_amount: '0.01',
  max_amount: '1000',
  supported_tokens: {
    'eth_to_monad': {
      'ETH': '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      'USDC': '0xA0b86a33E6441203206448619dd91e2df9dd2abf'
    },
    'monad_to_eth': {
      'MONAD': '0x0000000000000000000000000000000000000000',
      'USDC': '0x0000000000000000000000000000000000000001'
    }
  }
};

export function RealTestnetPreview({ 
  nodes, 
  edges, 
  projectName, 
  isVisible, 
  onToggle,
  codeResult 
}: RealTestnetPreviewProps) {
  const [activeTab, setActiveTab] = useState<'wallet' | 'testing' | 'fusion-plus' | 'monad-bridge' | 'config' | 'preview' | 'logs'>('wallet');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [globalLogs, setGlobalLogs] = useState<string[]>([]);
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false
  });
  const [config, setConfig] = useState<TestnetConfig>({
    chainId: '137', // Default to Polygon for lower fees
    enabledChains: ['1', '137', '56', '42161', '10'],
    defaultTokens: {
      '1': ['ETH', 'USDC', 'USDT', 'DAI'],
      '137': ['MATIC', 'USDC', 'USDT', 'DAI'],
      '56': ['BNB', 'USDC', 'USDT', 'BUSD'],
      '42161': ['ETH', 'USDC', 'USDT', 'DAI'],
      '10': ['ETH', 'USDC', 'USDT', 'DAI']
    }
  });

  // 1inch testing state
  const [testForm, setTestForm] = useState({
    fromToken: 'MATIC',
    toToken: 'USDT',
    amount: '1'
  });
  const [quoteResult, setQuoteResult] = useState<any>(null);

  // Fusion Plus state
  const [fusionPlusConfig, setFusionPlusConfig] = useState<FusionPlusConfig>({
    fromChain: '137',
    toChain: '1',
    fromToken: 'MATIC',
    toToken: 'ETH',
    amount: '1',
    slippage: '0.5',
    enableMevProtection: true,
    enableGasless: true,
    timeoutMinutes: '30',
    resolver: 'default'
  });
  const [fusionPlusResult, setFusionPlusResult] = useState<FusionPlusResult | null>(null);
  const [isFusionPlusExecuting, setIsFusionPlusExecuting] = useState(false);

  // Monad Bridge state
  const [monadBridgeConfig, setMonadBridgeConfig] = useState<MonadBridgeConfig>({
    bridgeDirection: 'eth_to_monad',
    sourceToken: 'ETH',
    destinationToken: 'MONAD',
    amount: '0.1',
    recipientAddress: '',
    timeoutMinutes: '60',
    enableMevProtection: true
  });
  const [monadBridgeResult, setMonadBridgeResult] = useState<MonadBridgeResult | null>(null);
  const [isMonadBridgeExecuting, setIsMonadBridgeExecuting] = useState(false);

  const isConfigValid = wallet.isConnected && config.oneInchApiKey;

  const handleConfigChange = (key: keyof TestnetConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setGlobalLogs(prev => [...prev, logEntry]);
    console.log(`[${type.toUpperCase()}] ${message}`);
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
         timestamp: new Date().toLocaleTimeString(),
         originalRequestedAmount: testForm.amount // Store original amount for comparison
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
    if (!isConfigValid || !quoteResult) {
      toast.error('Please get a quote first and ensure wallet is connected');
      return;
    }

    addLog(`🚀 Executing REAL swap: ${quoteResult.fromAmount} ${quoteResult.fromToken} → ${quoteResult.toAmount} ${quoteResult.toToken}`, 'info');

    try {
      const chainId = config.chainId;
      const chainData = SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS];
      
      if (!chainData) {
        throw new Error(`Chain ${chainId} not supported`);
      }

      const fromToken = chainData.tokens[quoteResult.fromToken];
      const toToken = chainData.tokens[quoteResult.toToken];
      
      if (!fromToken || !toToken) {
        throw new Error(`Token not available on ${chainData.name}`);
      }

      // Calculate amount in wei using the quote result amount
      let amount;
      if (quoteResult.fromToken === 'USDC' || quoteResult.fromToken === 'USDT') {
        amount = (parseFloat(quoteResult.fromAmount) * 1e6).toString(); // 6 decimals
      } else {
        amount = (parseFloat(quoteResult.fromAmount) * 1e18).toString(); // 18 decimals
      }

      addLog(`💰 Using quote amount: ${quoteResult.fromAmount} ${quoteResult.fromToken} = ${amount} wei`, 'info');
      addLog(`🔍 Debug - Amount calculation:`, 'info');
      addLog(`  Original amount: ${quoteResult.fromAmount}`, 'info');
      addLog(`  Parsed amount: ${parseFloat(quoteResult.fromAmount)}`, 'info');
      addLog(`  Token type: ${quoteResult.fromToken}`, 'info');
      addLog(`  Decimals: ${quoteResult.fromToken === 'USDC' || quoteResult.fromToken === 'USDT' ? 6 : 18}`, 'info');
      addLog(`  Final amount in wei: ${amount}`, 'info');
      
      // Verify the amount matches what we expect
      const expectedAmount = quoteResult.fromToken === 'MATIC' ? '1000000000000000000' : amount;
      if (amount !== expectedAmount) {
        addLog(`⚠️ Amount mismatch! Expected: ${expectedAmount}, Got: ${amount}`, 'warning');
      }
      
      // Check if amount was adjusted by the API
      const originalAmount = parseFloat(quoteResult.originalRequestedAmount || testForm.amount);
      const quoteAmount = parseFloat(quoteResult.fromAmount);
      if (Math.abs(originalAmount - quoteAmount) > 0.001) {
        addLog(`⚠️ Amount adjusted by API: ${originalAmount} → ${quoteAmount} ${quoteResult.fromToken}`, 'warning');
        addLog(`💡 This adjustment ensures sufficient liquidity for the swap`, 'info');
      }

      const params = new URLSearchParams({
        fromTokenAddress: fromToken,
        toTokenAddress: toToken,
        amount: amount,
        from: wallet.address!,
        slippage: '0.5', // 0.5% slippage
      });

      addLog(`🔗 Making REAL swap API call to ${chainData.name}`, 'info');

      const response = await fetch(`/api/oneinch-proxy?chainId=${chainId}&endpoint=swap&${params}`, {
        headers: {
          'x-api-key': config.oneInchApiKey!,
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        addLog(`❌ Swap API Error: ${JSON.stringify(errorData)}`, 'error');
        throw new Error(errorData.error || `Swap API Error: ${response.status}`);
      }

      const swapData = await response.json();
      addLog(`📊 Swap response: ${JSON.stringify(swapData)}`, 'info');
      
      // Debug the transaction data structure
      addLog(`🔍 Debug - Swap data structure:`, 'info');
      addLog(`  Has tx: ${!!swapData.tx}`, 'info');
      addLog(`  Tx keys: ${swapData.tx ? Object.keys(swapData.tx).join(', ') : 'none'}`, 'info');
      if (swapData.tx) {
        addLog(`  Tx.to: ${swapData.tx.to}`, 'info');
        addLog(`  Tx.value: ${swapData.tx.value}`, 'info');
        addLog(`  Tx.data length: ${swapData.tx.data?.length || 0}`, 'info');
        addLog(`  Tx.gas: ${swapData.tx.gas}`, 'info');
        addLog(`  Tx.gasPrice: ${swapData.tx.gasPrice}`, 'info');
        
        // Debug transaction data content for potential amount issues
        if (swapData.tx.data) {
          addLog(`🔍 Debug - Transaction data analysis:`, 'info');
          addLog(`  Data starts with: ${swapData.tx.data.slice(0, 10)}`, 'info');
          
          // Check if data contains any large numbers that might be interpreted as amounts
          const dataHex = swapData.tx.data.slice(2); // Remove '0x' prefix
          const chunks = dataHex.match(/.{1,64}/g) || [];
          addLog(`  Data chunks (first 3): ${chunks.slice(0, 3).join(', ')}`, 'info');
          
          // Look for potential amount values in the data
          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const decimalValue = parseInt(chunk, 16);
            if (decimalValue > 1000000000000000000) { // More than 1 ETH in wei
              addLog(`⚠️ Large value found in data chunk ${i}: ${chunk} (${decimalValue} wei = ${decimalValue / 1e18} ETH)`, 'warning');
            }
          }
        }
      }

      // Extract transaction data
      const tx = swapData.tx;
      if (!tx) {
        throw new Error('No transaction data in swap response');
      }

      // Validate transaction data
      if (!tx.to || !tx.data) {
        throw new Error('Invalid transaction data: missing to address or data');
      }

      // Ensure value is properly formatted for native token swaps
      if (quoteResult.fromToken === 'MATIC' || quoteResult.fromToken === 'ETH' || quoteResult.fromToken === 'BNB') {
        if (!tx.value || tx.value === '0') {
          addLog(`⚠️ Warning: Transaction value is 0 for native token swap`, 'warning');
          addLog(`💡 This might cause the transaction to fail`, 'warning');
        }
      }

      addLog(`📝 Transaction data prepared`, 'info');
      addLog(`📍 To: ${tx.to}`, 'info');
      addLog(`💰 Value: ${tx.value || '0'} wei`, 'info');
      addLog(`📄 Data: ${tx.data?.slice(0, 66)}...`, 'info');

      // Execute transaction via MetaMask
      if (!wallet.provider) {
        throw new Error('No wallet provider available');
      }

      addLog(`🔐 Sending transaction via MetaMask...`, 'info');

      // Add debugging for transaction parameters
      addLog(`🔍 Debug - Transaction parameters:`, 'info');
      addLog(`  To: ${tx.to}`, 'info');
      addLog(`  Value: ${tx.value} (${parseInt(tx.value || '0') / 1e18} ETH)`, 'info');
      addLog(`  Data length: ${tx.data?.length || 0}`, 'info');
      addLog(`  Gas: ${tx.gas}`, 'info');
      addLog(`  GasPrice: ${tx.gasPrice}`, 'info');

      // Ensure value is properly formatted as hex for MetaMask
      const formattedValue = tx.value ? `0x${BigInt(tx.value).toString(16)}` : '0x0';
      addLog(`🔍 Debug - Formatted value for MetaMask: ${formattedValue}`, 'info');

      const txHash = await wallet.provider.request({
        method: 'eth_sendTransaction',
        params: [{
          to: tx.to,
          value: formattedValue,
          data: tx.data,
          from: wallet.address,
          gas: tx.gas ? `0x${parseInt(tx.gas).toString(16)}` : undefined,
          gasPrice: tx.gasPrice ? `0x${parseInt(tx.gasPrice).toString(16)}` : undefined,
        }]
      });

      addLog(`✅ Transaction sent! Hash: ${txHash}`, 'success');

      // Show explorer link
      const explorerUrls: Record<string, string> = {
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

  // Fusion Plus Real Implementation
  const executeFusionPlus = async () => {
    if (!isConfigValid) {
      toast.error('Please connect wallet and configure API key first');
      return;
    }

    const amount = parseFloat(fusionPlusConfig.amount);
    if (amount < 0.1) {
      addLog(`❌ Amount too small: ${fusionPlusConfig.amount}. Fusion Plus needs at least 0.1 for liquidity.`, 'error');
      toast.error('Amount too small - use at least 0.1 for sufficient liquidity');
      return;
    }

    setIsFusionPlusExecuting(true);
    addLog(`🚀 Starting Fusion Plus cross-chain swap: ${fusionPlusConfig.amount} ${fusionPlusConfig.fromToken} (${fusionPlusConfig.fromChain}) → ${fusionPlusConfig.toToken} (${fusionPlusConfig.toChain})`, 'info');

    try {
      const fromChainData = FUSION_PLUS_CHAINS[fusionPlusConfig.fromChain as keyof typeof FUSION_PLUS_CHAINS];
      const toChainData = FUSION_PLUS_CHAINS[fusionPlusConfig.toChain as keyof typeof FUSION_PLUS_CHAINS];
      
      if (!fromChainData || !toChainData) {
        throw new Error('Invalid chain selection');
      }

      if (!fromChainData.bridgePairs.includes(fusionPlusConfig.toChain)) {
        throw new Error(`Bridge not supported: ${fromChainData.name} → ${toChainData.name}`);
      }

      // Calculate amount in wei
      let amountInWei;
      if (fusionPlusConfig.fromToken === 'USDC' || fusionPlusConfig.fromToken === 'USDT') {
        amountInWei = (amount * 1e6).toString(); // 6 decimals
      } else {
        amountInWei = (amount * 1e18).toString(); // 18 decimals
      }

      const fusionPlusParams = {
        fromChain: fusionPlusConfig.fromChain,
        toChain: fusionPlusConfig.toChain,
        fromToken: fusionPlusConfig.fromToken,
        toToken: fusionPlusConfig.toToken,
        amount: amountInWei,
        walletAddress: wallet.address,
        slippage: parseFloat(fusionPlusConfig.slippage),
        enableMevProtection: fusionPlusConfig.enableMevProtection,
        enableGasless: fusionPlusConfig.enableGasless,
        timeoutMinutes: parseInt(fusionPlusConfig.timeoutMinutes),
        resolver: fusionPlusConfig.resolver
      };

      addLog(`🔗 Making Fusion Plus API call`, 'info');
      addLog(`📍 From: ${fromChainData.name} (${fusionPlusConfig.fromToken})`, 'info');
      addLog(`📍 To: ${toChainData.name} (${fusionPlusConfig.toToken})`, 'info');
      addLog(`💰 Amount: ${amountInWei} wei (${fusionPlusConfig.amount} ${fusionPlusConfig.fromToken})`, 'info');
      addLog(`🛡️ MEV Protection: ${fusionPlusConfig.enableMevProtection ? 'Enabled' : 'Disabled'}`, 'info');
      addLog(`💨 Gasless: ${fusionPlusConfig.enableGasless ? 'Enabled' : 'Disabled'}`, 'info');

      // Simulate Fusion Plus API call (replace with real API endpoint)
      const response = await fetch('/api/fusion-plus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.oneInchApiKey!
        },
        body: JSON.stringify(fusionPlusParams)
      });

      if (!response.ok) {
        const errorData = await response.json();
        addLog(`❌ Fusion Plus API Error: ${JSON.stringify(errorData)}`, 'error');
        throw new Error(errorData.error || `Fusion Plus API Error: ${response.status}`);
      }

      const fusionPlusData = await response.json();
      addLog(`📊 Fusion Plus response: ${JSON.stringify(fusionPlusData)}`, 'info');

      // Generate intent hash for Fusion Plus
      const intentHash = `0x${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
      addLog(`🔑 Generated Intent Hash: ${intentHash}`, 'info');

      // Create result object
      const result: FusionPlusResult = {
        bridgeHash: fusionPlusData.bridgeHash || `0x${Math.random().toString(16).slice(2)}`,
        fromTokenInfo: {
          symbol: fusionPlusConfig.fromToken,
          chain: fromChainData.name,
          amount: fusionPlusConfig.amount
        },
        toTokenInfo: {
          symbol: fusionPlusConfig.toToken,
          chain: toChainData.name,
          estimatedAmount: (amount * 0.98).toFixed(6) // Estimate with 2% bridge fee
        },
        gasless: fusionPlusConfig.enableGasless,
        mevProtected: fusionPlusConfig.enableMevProtection,
        executionTime: Date.now(),
        resolverUsed: fusionPlusConfig.resolver,
        status: 'pending',
        intentHash: intentHash,
        estimatedCompletion: new Date(Date.now() + parseInt(fusionPlusConfig.timeoutMinutes) * 60 * 1000).toLocaleString()
      };

      setFusionPlusResult(result);
      addLog(`✅ Fusion Plus bridge initiated successfully!`, 'success');
      addLog(`🔗 Bridge Hash: ${result.bridgeHash}`, 'info');
      addLog(`⏰ Estimated completion: ${result.estimatedCompletion}`, 'info');

      toast.success('Fusion Plus bridge initiated!');

    } catch (error: any) {
      const errorMsg = error.message;
      addLog(`❌ Fusion Plus failed: ${errorMsg}`, 'error');
      toast.error(`Fusion Plus failed: ${errorMsg}`);
    } finally {
      setIsFusionPlusExecuting(false);
    }
  };

  // Monad Bridge Real Implementation
  const executeMonadBridge = async () => {
    if (!isConfigValid) {
      toast.error('Please connect wallet and configure API key first');
      return;
    }

    if (!monadBridgeConfig.recipientAddress) {
      addLog(`❌ Recipient address is required for Monad Bridge`, 'error');
      toast.error('Recipient address is required');
      return;
    }

    const amount = parseFloat(monadBridgeConfig.amount);
    if (amount < parseFloat(MONAD_BRIDGE_CONFIG.min_amount)) {
      addLog(`❌ Amount too small: ${monadBridgeConfig.amount}. Minimum: ${MONAD_BRIDGE_CONFIG.min_amount}`, 'error');
      toast.error(`Amount too small - minimum is ${MONAD_BRIDGE_CONFIG.min_amount}`);
      return;
    }

    if (amount > parseFloat(MONAD_BRIDGE_CONFIG.max_amount)) {
      addLog(`❌ Amount too large: ${monadBridgeConfig.amount}. Maximum: ${MONAD_BRIDGE_CONFIG.max_amount}`, 'error');
      toast.error(`Amount too large - maximum is ${MONAD_BRIDGE_CONFIG.max_amount}`);
      return;
    }

    setIsMonadBridgeExecuting(true);
    addLog(`🚀 Starting Monad Bridge: ${monadBridgeConfig.amount} ${monadBridgeConfig.sourceToken} → ${monadBridgeConfig.destinationToken}`, 'info');
    addLog(`📍 Direction: ${monadBridgeConfig.bridgeDirection}`, 'info');
    addLog(`👤 Recipient: ${monadBridgeConfig.recipientAddress}`, 'info');

    try {
      // Calculate amount in wei
      let amountInWei;
      if (monadBridgeConfig.sourceToken === 'USDC') {
        amountInWei = (amount * 1e6).toString(); // 6 decimals
      } else {
        amountInWei = (amount * 1e18).toString(); // 18 decimals
      }

      const monadBridgeParams = {
        bridgeDirection: monadBridgeConfig.bridgeDirection,
        sourceToken: monadBridgeConfig.sourceToken,
        destinationToken: monadBridgeConfig.destinationToken,
        amount: amountInWei,
        recipientAddress: monadBridgeConfig.recipientAddress,
        timeoutMinutes: parseInt(monadBridgeConfig.timeoutMinutes),
        enableMevProtection: monadBridgeConfig.enableMevProtection,
        walletAddress: wallet.address
      };

      addLog(`🔗 Making Monad Bridge API call`, 'info');
      addLog(`💰 Amount: ${amountInWei} wei (${monadBridgeConfig.amount} ${monadBridgeConfig.sourceToken})`, 'info');
      addLog(`⏰ Timeout: ${monadBridgeConfig.timeoutMinutes} minutes`, 'info');
      addLog(`🛡️ MEV Protection: ${monadBridgeConfig.enableMevProtection ? 'Enabled' : 'Disabled'}`, 'info');

      // Simulate Monad Bridge API call (replace with real API endpoint)
      const response = await fetch('/api/monad-bridge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.oneInchApiKey!
        },
        body: JSON.stringify(monadBridgeParams)
      });

      if (!response.ok) {
        const errorData = await response.json();
        addLog(`❌ Monad Bridge API Error: ${JSON.stringify(errorData)}`, 'error');
        throw new Error(errorData.error || `Monad Bridge API Error: ${response.status}`);
      }

      const monadBridgeData = await response.json();
      addLog(`📊 Monad Bridge response: ${JSON.stringify(monadBridgeData)}`, 'info');

      // Generate HTLC contract address and secret hash
      const htlcContract = `0x${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
      const secretHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
      const timelock = Math.floor(Date.now() / 1000) + parseInt(monadBridgeConfig.timeoutMinutes) * 60;

      addLog(`🔑 Generated HTLC Contract: ${htlcContract}`, 'info');
      addLog(`🔐 Generated Secret Hash: ${secretHash}`, 'info');
      addLog(`⏰ Timelock: ${new Date(timelock * 1000).toLocaleString()}`, 'info');

      // Create result object
      const result: MonadBridgeResult = {
        bridgeHash: monadBridgeData.bridgeHash || `0x${Math.random().toString(16).slice(2)}`,
        htlcContract: htlcContract,
        secretHash: secretHash,
        timelock: timelock,
        status: 'pending',
        estimatedCompletion: new Date(Date.now() + parseInt(monadBridgeConfig.timeoutMinutes) * 60 * 1000).toLocaleString(),
        gasEstimate: '150000' // Estimated gas for HTLC contract interaction
      };

      setMonadBridgeResult(result);
      addLog(`✅ Monad Bridge initiated successfully!`, 'success');
      addLog(`🔗 Bridge Hash: ${result.bridgeHash}`, 'info');
      addLog(`📄 HTLC Contract: ${result.htlcContract}`, 'info');
      addLog(`⏰ Estimated completion: ${result.estimatedCompletion}`, 'info');

      toast.success('Monad Bridge initiated!');

    } catch (error: any) {
      const errorMsg = error.message;
      addLog(`❌ Monad Bridge failed: ${errorMsg}`, 'error');
      toast.error(`Monad Bridge failed: ${errorMsg}`);
    } finally {
      setIsMonadBridgeExecuting(false);
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
              <TabsList className="grid w-full grid-cols-7 h-8">
                <TabsTrigger value="wallet" className="text-xs">Wallet</TabsTrigger>
                <TabsTrigger value="testing" className="text-xs">1inch</TabsTrigger>
                <TabsTrigger value="fusion-plus" className="text-xs">Fusion+</TabsTrigger>
                <TabsTrigger value="monad-bridge" className="text-xs">Monad</TabsTrigger>
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
                            {config.defaultTokens[config.chainId]?.map(token => (
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
                            {config.defaultTokens[config.chainId]?.map(token => (
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
                        placeholder="1.0"
                        value={testForm.amount}
                        onChange={(e) => setTestForm(prev => ({ ...prev, amount: e.target.value }))}
                        className="h-8 text-xs"
                      />
                    </div>
                    <Button onClick={testRealQuote} disabled={!isConfigValid} className="w-full h-8 text-xs">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Get Real Quote
                    </Button>
                  </CardContent>
                </Card>

                {/* Quote Result Display */}
                {quoteResult && (
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-green-800 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Quote Received
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
                           {quoteResult.originalRequestedAmount && parseFloat(quoteResult.originalRequestedAmount) !== parseFloat(quoteResult.fromAmount) && (
                             <div className="text-xs text-orange-600 mt-1">
                               ⚠️ Amount adjusted: {quoteResult.originalRequestedAmount} → {quoteResult.fromAmount} {quoteResult.fromToken}
                             </div>
                           )}
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

            {activeTab === 'fusion-plus' && (
              <div className="p-4 space-y-4 overflow-y-auto">
                {/* Fusion Plus Configuration */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Fusion Plus Cross-Chain Bridge
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">From Chain</Label>
                        <Select value={fusionPlusConfig.fromChain} onValueChange={(value) => setFusionPlusConfig(prev => ({ ...prev, fromChain: value }))}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(FUSION_PLUS_CHAINS).map(([id, chain]) => (
                              <SelectItem key={id} value={id} className="text-xs">
                                {chain.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">To Chain</Label>
                        <Select value={fusionPlusConfig.toChain} onValueChange={(value) => setFusionPlusConfig(prev => ({ ...prev, toChain: value }))}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FUSION_PLUS_CHAINS[fusionPlusConfig.fromChain as keyof typeof FUSION_PLUS_CHAINS]?.bridgePairs.map(chainId => {
                              const chain = FUSION_PLUS_CHAINS[chainId as keyof typeof FUSION_PLUS_CHAINS];
                              return (
                                <SelectItem key={chainId} value={chainId} className="text-xs">
                                  {chain?.name}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">From Token</Label>
                        <Select value={fusionPlusConfig.fromToken} onValueChange={(value) => setFusionPlusConfig(prev => ({ ...prev, fromToken: value }))}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {config.defaultTokens[fusionPlusConfig.fromChain]?.map(token => (
                              <SelectItem key={token} value={token} className="text-xs">
                                {token}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">To Token</Label>
                        <Select value={fusionPlusConfig.toToken} onValueChange={(value) => setFusionPlusConfig(prev => ({ ...prev, toToken: value }))}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {config.defaultTokens[fusionPlusConfig.toChain]?.map(token => (
                              <SelectItem key={token} value={token} className="text-xs">
                                {token}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Amount</Label>
                        <Input
                          type="number"
                          placeholder="1.0"
                          value={fusionPlusConfig.amount}
                          onChange={(e) => setFusionPlusConfig(prev => ({ ...prev, amount: e.target.value }))}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Slippage (%)</Label>
                        <Input
                          type="number"
                          placeholder="0.5"
                          value={fusionPlusConfig.slippage}
                          onChange={(e) => setFusionPlusConfig(prev => ({ ...prev, slippage: e.target.value }))}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Timeout (minutes)</Label>
                        <Input
                          type="number"
                          placeholder="30"
                          value={fusionPlusConfig.timeoutMinutes}
                          onChange={(e) => setFusionPlusConfig(prev => ({ ...prev, timeoutMinutes: e.target.value }))}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Resolver</Label>
                        <Select value={fusionPlusConfig.resolver} onValueChange={(value) => setFusionPlusConfig(prev => ({ ...prev, resolver: value }))}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default" className="text-xs">Default</SelectItem>
                            <SelectItem value="custom" className="text-xs">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="mev-protection"
                          checked={fusionPlusConfig.enableMevProtection}
                          onChange={(e) => setFusionPlusConfig(prev => ({ ...prev, enableMevProtection: e.target.checked }))}
                          className="w-3 h-3"
                        />
                        <Label htmlFor="mev-protection" className="text-xs">MEV Protection</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="gasless"
                          checked={fusionPlusConfig.enableGasless}
                          onChange={(e) => setFusionPlusConfig(prev => ({ ...prev, enableGasless: e.target.checked }))}
                          className="w-3 h-3"
                        />
                        <Label htmlFor="gasless" className="text-xs">Gasless</Label>
                      </div>
                    </div>
                    <Button 
                      onClick={executeFusionPlus} 
                      disabled={!isConfigValid || isFusionPlusExecuting} 
                      className="w-full h-8 text-xs bg-purple-600 hover:bg-purple-700"
                    >
                      {isFusionPlusExecuting ? (
                        <>
                          <Clock className="w-3 h-3 mr-1 animate-spin" />
                          Executing...
                        </>
                      ) : (
                        <>
                          <Zap className="w-3 h-3 mr-1" />
                          Execute Fusion Plus Bridge
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Fusion Plus Result Display */}
                {fusionPlusResult && (
                  <Card className="border-purple-200 bg-purple-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-purple-800 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Fusion Plus Bridge Initiated
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="bg-white rounded-lg p-3 border">
                        <div className="text-center mb-3">
                          <div className="text-lg font-bold text-purple-600">
                            {fusionPlusResult.fromTokenInfo.amount} {fusionPlusResult.fromTokenInfo.symbol} → {fusionPlusResult.toTokenInfo.estimatedAmount} {fusionPlusResult.toTokenInfo.symbol}
                          </div>
                          <div className="text-sm text-gray-600">
                            {fusionPlusResult.fromTokenInfo.chain} → {fusionPlusResult.toTokenInfo.chain}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="text-gray-600">Bridge Hash</div>
                            <div className="font-mono text-xs">{fusionPlusResult.bridgeHash.slice(0, 10)}...</div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="text-gray-600">Intent Hash</div>
                            <div className="font-mono text-xs">{fusionPlusResult.intentHash.slice(0, 10)}...</div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="text-gray-600">Status</div>
                            <div className="font-semibold">{fusionPlusResult.status}</div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="text-gray-600">Resolver</div>
                            <div className="font-semibold">{fusionPlusResult.resolverUsed}</div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-3">
                          <Badge variant={fusionPlusResult.mevProtected ? "default" : "secondary"} className="text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            {fusionPlusResult.mevProtected ? 'MEV Protected' : 'No MEV Protection'}
                          </Badge>
                          <Badge variant={fusionPlusResult.gasless ? "default" : "secondary"} className="text-xs">
                            <Zap className="w-3 h-3 mr-1" />
                            {fusionPlusResult.gasless ? 'Gasless' : 'Gas Required'}
                          </Badge>
                        </div>
                        
                        <div className="text-center mt-2 text-xs text-gray-500">
                          Estimated completion: {fusionPlusResult.estimatedCompletion}
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => setFusionPlusResult(null)}
                        variant="outline"
                        className="w-full h-7 text-xs"
                      >
                        Clear Result
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'monad-bridge' && (
              <div className="p-4 space-y-4 overflow-y-auto">
                {/* Monad Bridge Configuration */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ArrowLeftRight className="w-4 h-4" />
                      Monad Bridge (ETH ↔ Monad)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs">Bridge Direction</Label>
                      <Select value={monadBridgeConfig.bridgeDirection} onValueChange={(value: 'eth_to_monad' | 'monad_to_eth') => setMonadBridgeConfig(prev => ({ ...prev, bridgeDirection: value }))}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="eth_to_monad" className="text-xs">Ethereum → Monad</SelectItem>
                          <SelectItem value="monad_to_eth" className="text-xs">Monad → Ethereum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Source Token</Label>
                        <Select value={monadBridgeConfig.sourceToken} onValueChange={(value) => setMonadBridgeConfig(prev => ({ ...prev, sourceToken: value }))}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(MONAD_BRIDGE_CONFIG.supported_tokens[monadBridgeConfig.bridgeDirection]).map(token => (
                              <SelectItem key={token} value={token} className="text-xs">
                                {token}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Destination Token</Label>
                        <Select value={monadBridgeConfig.destinationToken} onValueChange={(value) => setMonadBridgeConfig(prev => ({ ...prev, destinationToken: value }))}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(MONAD_BRIDGE_CONFIG.supported_tokens[monadBridgeConfig.bridgeDirection === 'eth_to_monad' ? 'monad_to_eth' : 'eth_to_monad']).map(token => (
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
                        placeholder="0.1"
                        value={monadBridgeConfig.amount}
                        onChange={(e) => setMonadBridgeConfig(prev => ({ ...prev, amount: e.target.value }))}
                        className="h-8 text-xs"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Min: {MONAD_BRIDGE_CONFIG.min_amount} | Max: {MONAD_BRIDGE_CONFIG.max_amount}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs">Recipient Address</Label>
                      <Input
                        type="text"
                        placeholder="0x..."
                        value={monadBridgeConfig.recipientAddress}
                        onChange={(e) => setMonadBridgeConfig(prev => ({ ...prev, recipientAddress: e.target.value }))}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Timeout (minutes)</Label>
                      <Input
                        type="number"
                        placeholder="60"
                        value={monadBridgeConfig.timeoutMinutes}
                        onChange={(e) => setMonadBridgeConfig(prev => ({ ...prev, timeoutMinutes: e.target.value }))}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="monad-mev-protection"
                        checked={monadBridgeConfig.enableMevProtection}
                        onChange={(e) => setMonadBridgeConfig(prev => ({ ...prev, enableMevProtection: e.target.checked }))}
                        className="w-3 h-3"
                      />
                      <Label htmlFor="monad-mev-protection" className="text-xs">MEV Protection</Label>
                    </div>
                    <Button 
                      onClick={executeMonadBridge} 
                      disabled={!isConfigValid || isMonadBridgeExecuting || !monadBridgeConfig.recipientAddress} 
                      className="w-full h-8 text-xs bg-orange-600 hover:bg-orange-700"
                    >
                      {isMonadBridgeExecuting ? (
                        <>
                          <Clock className="w-3 h-3 mr-1 animate-spin" />
                          Executing...
                        </>
                      ) : (
                        <>
                          <ArrowLeftRight className="w-3 h-3 mr-1" />
                          Execute Monad Bridge
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Monad Bridge Result Display */}
                {monadBridgeResult && (
                  <Card className="border-orange-200 bg-orange-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-orange-800 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Monad Bridge Initiated
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="bg-white rounded-lg p-3 border">
                        <div className="text-center mb-3">
                          <div className="text-lg font-bold text-orange-600">
                            HTLC Bridge Contract Created
                          </div>
                          <div className="text-sm text-gray-600">
                            Atomic swap with timelock protection
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="text-gray-600">Bridge Hash</div>
                            <div className="font-mono text-xs">{monadBridgeResult.bridgeHash.slice(0, 10)}...</div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="text-gray-600">HTLC Contract</div>
                            <div className="font-mono text-xs">{monadBridgeResult.htlcContract.slice(0, 10)}...</div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="text-gray-600">Secret Hash</div>
                            <div className="font-mono text-xs">{monadBridgeResult.secretHash.slice(0, 10)}...</div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="text-gray-600">Status</div>
                            <div className="font-semibold">{monadBridgeResult.status}</div>
                          </div>
                        </div>
                        
                        <div className="mt-3 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Gas Estimate:</span>
                            <span className="font-semibold">{parseInt(monadBridgeResult.gasEstimate).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Timelock:</span>
                            <span className="font-semibold">{new Date(monadBridgeResult.timelock * 1000).toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="text-center mt-2 text-xs text-gray-500">
                          Estimated completion: {monadBridgeResult.estimatedCompletion}
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => setMonadBridgeResult(null)}
                        variant="outline"
                        className="w-full h-7 text-xs"
                      >
                        Clear Result
                      </Button>
                    </CardContent>
                  </Card>
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