'use client'

import { useState, useEffect } from 'react';
import { useAccount, useBalance, useWriteContract, useWaitForTransaction, useReadContract } from 'wagmi';
import { toast } from 'react-hot-toast';
import { formatEther, parseEther, parseUnits, formatUnits, maxUint256 } from 'viem';
import axios from 'axios';

// ERC-20 ABI for approval and allowance
const ERC20_ABI = [
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function'
  }
] as const;

// 1inch Router addresses by chain
const ONEINCH_ROUTER_V5 = '0x1111111254EEB25477B68fb85Ed929f73A960582';

interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI?: string;
}

interface SwapQuote {
  toAmount: string;
  estimatedGas: string;
  protocols: any[];
  tx?: {
    to: string;
    data: string;
    value: string;
    gas: string;
    gasPrice: string;
  };
}

const TOKENS: Record<string, Token> = {
  ETH: { symbol: 'ETH', name: 'Ethereum', address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', decimals: 18 },
  USDC: { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86a33E6441203206448619dd91e2df9dd2abF', decimals: 6 },
  USDT: { symbol: 'USDT', name: 'Tether USD', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
  DAI: { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 },
  WBTC: { symbol: 'WBTC', name: 'Wrapped Bitcoin', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8 }
};

export function EnhancedSwapDemo() {
  const { address, isConnected } = useAccount();
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDC');
  const [amount, setAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [swapMode, setSwapMode] = useState('classic');
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [slippage, setSlippage] = useState(1);
  const [isGettingQuote, setIsGettingQuote] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // Get balance for from token
  const { data: ethBalance } = useBalance({
    address,
    watch: true,
  });

  const { data: tokenBalance } = useBalance({
    address,
    token: fromToken !== 'ETH' ? TOKENS[fromToken]?.address as `0x${string}` : undefined,
    watch: true,
  });

  // Check allowance for ERC-20 tokens
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: fromToken !== 'ETH' ? TOKENS[fromToken]?.address as `0x${string}` : undefined,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && fromToken !== 'ETH' ? [address, ONEINCH_ROUTER_V5] : undefined,
    watch: true,
  });

  // Contract write hooks
  const { 
    writeContract: writeApproval, 
    data: approvalHash, 
    error: approvalError, 
    isPending: isApprovalPending 
  } = useWriteContract();

  const { 
    writeContract: writeSwap, 
    data: swapHash, 
    error: swapError, 
    isPending: isSwapPending 
  } = useWriteContract();

  // Wait for approval transaction
  const { 
    isLoading: isApprovalLoading, 
    isSuccess: isApprovalSuccess 
  } = useWaitForTransaction({
    hash: approvalHash,
  });

  // Wait for swap transaction
  const { 
    isLoading: isSwapLoading, 
    isSuccess: isSwapSuccess 
  } = useWaitForTransaction({
    hash: swapHash,
  });

  // Get current balance
  const getCurrentBalance = () => {
    if (fromToken === 'ETH') {
      return ethBalance;
    } else {
      return tokenBalance;
    }
  };

  // Format balance for display
  const formatBalance = (balance: any) => {
    if (!balance) return '0.00';
    try {
      const formatted = formatUnits(balance.value, balance.decimals);
      return parseFloat(formatted).toFixed(4);
    } catch (error) {
      return '0.00';
    }
  };

  // Check if approval is needed
  useEffect(() => {
    if (fromToken === 'ETH' || !amount || !allowance) {
      setNeedsApproval(false);
      return;
    }

    try {
      const amountInWei = parseUnits(amount, TOKENS[fromToken].decimals);
      const hasEnoughAllowance = allowance >= amountInWei;
      setNeedsApproval(!hasEnoughAllowance);
    } catch (error) {
      setNeedsApproval(false);
    }
  }, [fromToken, amount, allowance]);

  // Refetch allowance after successful approval
  useEffect(() => {
    if (isApprovalSuccess) {
      toast.success('Token approval successful!');
      setIsApproving(false);
      refetchAllowance();
    }
  }, [isApprovalSuccess, refetchAllowance]);

  // Handle successful swap
  useEffect(() => {
    if (isSwapSuccess) {
      toast.success('Swap completed successfully!');
      setAmount('');
      setToAmount('');
      setQuote(null);
      setLoading(false);
    }
  }, [isSwapSuccess]);

  // Handle errors
  useEffect(() => {
    if (approvalError) {
      console.error('Approval error:', approvalError);
      toast.error(approvalError.message || 'Approval failed');
      setIsApproving(false);
    }
  }, [approvalError]);

  useEffect(() => {
    if (swapError) {
      console.error('Swap error:', swapError);
      toast.error(swapError.message || 'Swap failed');
      setLoading(false);
    }
  }, [swapError]);

  // Get quote from 1inch API
  const getQuote = async () => {
    if (!amount || !fromToken || !toToken || parseFloat(amount) <= 0) {
      setQuote(null);
      setToAmount('');
      return;
    }

    setIsGettingQuote(true);
    try {
      const fromTokenData = TOKENS[fromToken];
      const toTokenData = TOKENS[toToken];
      
      if (!fromTokenData || !toTokenData) {
        throw new Error('Token not found');
      }

      // Convert amount to wei/token units
      const amountInWei = parseUnits(amount, fromTokenData.decimals).toString();

      // Get quote from backend API
      const response = await axios.get('/api/1inch/quote', {
        params: {
          chainId: 1, // Ethereum mainnet
          src: fromTokenData.address,
          dst: toTokenData.address,
          amount: amountInWei,
          from: address,
          slippage: slippage
        }
      });

      const quoteData = response.data;
      setQuote(quoteData);
      
      // Format the to amount for display
      const toAmountFormatted = formatUnits(BigInt(quoteData.toAmount), toTokenData.decimals);
      setToAmount(parseFloat(toAmountFormatted).toFixed(6));

    } catch (error: any) {
      console.error('Failed to get quote:', error);
      toast.error(error.response?.data?.error || 'Failed to get quote');
      setQuote(null);
      setToAmount('');
    } finally {
      setIsGettingQuote(false);
    }
  };

  // Debounced quote fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      if (amount && parseFloat(amount) > 0) {
        getQuote();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [amount, fromToken, toToken, slippage, address]);

  // Handle token approval
  const handleApprove = async () => {
    if (fromToken === 'ETH') return;

    setIsApproving(true);
    try {
      await writeApproval({
        address: TOKENS[fromToken].address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [ONEINCH_ROUTER_V5, maxUint256], // Approve maximum amount
      });

      toast.info('Approval transaction submitted...');
    } catch (error: any) {
      console.error('Approval failed:', error);
      toast.error('Approval failed');
      setIsApproving(false);
    }
  };

  // Handle swap execution
  const handleSwap = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    if (needsApproval) {
      await handleApprove();
      return;
    }

    if (!quote) {
      toast.error('Please wait for quote to load');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    
    try {
      const fromTokenData = TOKENS[fromToken];
      const toTokenData = TOKENS[toToken];
      
      if (!fromTokenData || !toTokenData) {
        throw new Error('Token not found');
      }

      // Convert amount to wei/token units
      const amountInWei = parseUnits(amount, fromTokenData.decimals).toString();

      // Get swap transaction data from backend
      const response = await axios.post('/api/1inch/swap', {
        chainId: 1,
        src: fromTokenData.address,
        dst: toTokenData.address,
        amount: amountInWei,
        from: address,
        slippage: slippage
      });

      const swapData = response.data;

      if (!swapData.tx) {
        throw new Error('No transaction data received');
      }

      // Execute the swap transaction
      await writeSwap({
        to: swapData.tx.to as `0x${string}`,
        data: swapData.tx.data as `0x${string}`,
        value: BigInt(swapData.tx.value || '0'),
      });

      toast.info('Swap transaction submitted, waiting for confirmation...');

    } catch (error: any) {
      console.error('Swap failed:', error);
      toast.error(error.response?.data?.error || error.message || 'Swap failed');
      setLoading(false);
    }
  };

  const swapTokens = () => {
    const tempFrom = fromToken;
    setFromToken(toToken);
    setToToken(tempFrom);
    setAmount('');
    setToAmount('');
    setQuote(null);
  };

  const isInsufficientBalance = () => {
    const balance = getCurrentBalance();
    if (!balance || !amount) return false;
    
    try {
      const amountBigInt = parseUnits(amount, TOKENS[fromToken].decimals);
      return amountBigInt > balance.value;
    } catch {
      return false;
    }
  };

  const getButtonText = () => {
    if (!isConnected) return 'Connect Wallet';
    if (isInsufficientBalance()) return 'Insufficient Balance';
    if (!amount) return 'Enter Amount';
    if (isGettingQuote) return 'Getting Quote...';
    if (!quote) return 'No Quote Available';
    if (needsApproval && !isApproving) return `Approve ${fromToken}`;
    if (isApproving || isApprovalPending || isApprovalLoading) return 'Approving...';
    if (loading || isSwapPending || isSwapLoading) return 'Swapping...';
    return `Swap ${fromToken} for ${toToken}`;
  };

  const isButtonDisabled = () => {
    return !isConnected || 
           !amount || 
           !quote || 
           isInsufficientBalance() || 
           isApproving || 
           isApprovalPending || 
           isApprovalLoading ||
           loading || 
           isSwapPending || 
           isSwapLoading ||
           isGettingQuote;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Enhanced Swap Demo</h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setSwapMode('classic')}
            className={`px-3 py-1 rounded text-sm ${
              swapMode === 'classic' ? 'bg-white shadow' : ''
            }`}
          >
            Classic
          </button>
          <button
            onClick={() => setSwapMode('fusion')}
            className={`px-3 py-1 rounded text-sm ${
              swapMode === 'fusion' ? 'bg-white shadow' : ''
            }`}
          >
            Fusion ⚡
          </button>
        </div>
      </div>

      {/* Slippage Settings */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Slippage Tolerance</span>
          <div className="flex gap-2">
            {[0.5, 1, 3].map((value) => (
              <button
                key={value}
                onClick={() => setSlippage(value)}
                className={`px-2 py-1 text-xs rounded ${
                  slippage === value ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
                }`}
              >
                {value}%
              </button>
            ))}
            <input
              type="number"
              value={slippage}
              onChange={(e) => setSlippage(parseFloat(e.target.value) || 1)}
              className="w-16 px-2 py-1 text-xs border rounded"
              step="0.1"
              min="0.1"
              max="50"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* From Token */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">From</span>
            <span className="text-sm text-gray-500">
              Balance: {formatBalance(getCurrentBalance())} {fromToken}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="text-2xl font-medium bg-transparent outline-none w-full"
            />
            <select
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value)}
              className="bg-gray-100 rounded-lg px-3 py-2 font-medium ml-2"
            >
              {Object.keys(TOKENS).map((symbol) => (
                <option key={symbol} value={symbol}>
                  {symbol}
                </option>
              ))}
            </select>
          </div>
          {isInsufficientBalance() && (
            <p className="text-red-500 text-sm mt-1">Insufficient balance</p>
          )}
          {needsApproval && fromToken !== 'ETH' && (
            <p className="text-orange-500 text-sm mt-1">
              Approval required for {fromToken}
            </p>
          )}
        </div>

        {/* Swap Arrow */}
        <div className="flex justify-center">
          <button 
            onClick={swapTokens}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            ↓
          </button>
        </div>

        {/* To Token */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">To</span>
            {quote && (
              <span className="text-sm text-green-600">
                Rate: 1 {fromToken} = {(parseFloat(toAmount) / parseFloat(amount || '1')).toFixed(4)} {toToken}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={isGettingQuote ? 'Loading...' : toAmount}
              placeholder="0.0"
              className="text-2xl font-medium bg-transparent outline-none w-full"
              readOnly
            />
            <select
              value={toToken}
              onChange={(e) => setToToken(e.target.value)}
              className="bg-gray-100 rounded-lg px-3 py-2 font-medium ml-2"
            >
              {Object.keys(TOKENS).map((symbol) => (
                <option key={symbol} value={symbol}>
                  {symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quote Information */}
        {quote && (
          <div className="p-3 bg-blue-50 rounded-lg text-sm space-y-1">
            <div className="flex justify-between">
              <span>Estimated Gas:</span>
              <span>{parseInt(quote.estimatedGas).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Protocols:</span>
              <span>{quote.protocols?.length || 0} DEXs</span>
            </div>
            {allowance && fromToken !== 'ETH' && (
              <div className="flex justify-between">
                <span>Allowance:</span>
                <span className={needsApproval ? 'text-orange-600' : 'text-green-600'}>
                  {needsApproval ? 'Insufficient' : 'Sufficient'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          disabled={isButtonDisabled()}
          className={`w-full py-4 rounded-lg font-medium transition-colors ${
            needsApproval && !isApproving
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          } disabled:bg-gray-300 disabled:cursor-not-allowed`}
        >
          {getButtonText()}
        </button>
      </div>

      {/* Transaction Hashes */}
      {approvalHash && (
        <div className="mt-4 p-3 bg-orange-50 rounded-lg">
          <p className="text-sm text-orange-700 font-medium">Approval Transaction:</p>
          <a
            href={`https://etherscan.io/tx/${approvalHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-600 text-sm font-mono break-all hover:underline"
          >
            {approvalHash}
          </a>
        </div>
      )}

      {swapHash && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-700 font-medium">Swap Transaction:</p>
          <a
            href={`https://etherscan.io/tx/${swapHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 text-sm font-mono break-all hover:underline"
          >
            {swapHash}
          </a>
        </div>
      )}

      {/* Debug Information (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs">
          <details>
            <summary className="cursor-pointer text-gray-600">Debug Info</summary>
            <div className="mt-2 space-y-1 text-gray-500">
              <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
              <div>Address: {address}</div>
              <div>Needs Approval: {needsApproval ? 'Yes' : 'No'}</div>
              <div>Allowance: {allowance?.toString()}</div>
              <div>Quote Available: {quote ? 'Yes' : 'No'}</div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
} 