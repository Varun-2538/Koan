import express from 'express';
import axios from 'axios';

const router = express.Router();

// 1inch API configuration
const ONEINCH_API_KEY = process.env.ONEINCH_API_KEY;
const ONEINCH_BASE_URL = 'https://api.1inch.dev';

if (!ONEINCH_API_KEY) {
  console.warn('WARNING: ONEINCH_API_KEY not set in environment variables');
}

// Helper function to make 1inch API requests with optional per-user override
async function make1inchRequest(endpoint: string, params: any = {}, apiKeyOverride?: string) {
  try {
    const url = `${ONEINCH_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Authorization': `Bearer ${apiKeyOverride || ONEINCH_API_KEY}`,
        'accept': 'application/json'
      },
      params
    };

    console.log(`Making 1inch API request to: ${url}`);
    console.log('Params:', params);

    const response = await axios.get(url, config);
    return response.data;
  } catch (error: any) {
    console.error('1inch API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.description || error.message || '1inch API request failed');
  }
}

// Get swap quote
router.get('/quote', async (req, res) => {
  try {
    const { chainId, src, dst, amount, from, slippage, apiKey } = req.query as any;
    
    // Validate required parameters
    if (!chainId || !src || !dst || !amount) {
      return res.status(400).json({ 
        error: 'Missing required parameters: chainId, src, dst, amount' 
      });
    }

    const params = {
      src: src as string,
      dst: dst as string,
      amount: amount as string,
      includeTokensInfo: 'true',
      includeProtocols: 'true',
      includeGas: 'true'
    };

    // Add optional parameters
    if (from) params['from'] = from as string;
    if (slippage) params['slippage'] = slippage as string;

    const quote = await make1inchRequest(`/swap/v5.2/${chainId}/quote`, params, apiKey as string | undefined);
    
    res.json(quote);
  } catch (error: any) {
    console.error('Quote error:', error);
    res.status(400).json({ 
      error: error.message,
      details: 'Failed to get swap quote from 1inch'
    });
  }
});

// Execute swap
router.post('/swap', async (req, res) => {
  try {
    const { chainId, src, dst, amount, from, slippage, referrer, fee, apiKey } = req.body;
    
    // Validate required parameters
    if (!chainId || !src || !dst || !amount || !from) {
      return res.status(400).json({ 
        error: 'Missing required parameters: chainId, src, dst, amount, from' 
      });
    }

    const params = {
      src: src as string,
      dst: dst as string,
      amount: amount as string,
      from: from as string,
      slippage: (slippage || 1).toString(),
      disableEstimate: 'false',
      allowPartialFill: 'true'
    };

    // Add optional referral parameters
    if (referrer && fee) {
      params['referrer'] = referrer;
      params['fee'] = fee;
    }

    const swap = await make1inchRequest(`/swap/v5.2/${chainId}/swap`, params, apiKey as string | undefined);
    
    res.json(swap);
  } catch (error: any) {
    console.error('Swap error:', error);
    res.status(400).json({ 
      error: error.message,
      details: 'Failed to execute swap with 1inch'
    });
  }
});

// Get supported tokens
router.get('/tokens', async (req, res) => {
  try {
    const { chainId, apiKey } = req.query as any;
    
    if (!chainId) {
      return res.status(400).json({ error: 'chainId is required' });
    }

    const tokens = await make1inchRequest(`/swap/v5.2/${chainId}/tokens`, {}, apiKey as string | undefined);
    res.json(tokens);
  } catch (error: any) {
    console.error('Tokens error:', error);
    res.status(400).json({ 
      error: error.message,
      details: 'Failed to get tokens from 1inch'
    });
  }
});

// Get supported protocols
router.get('/protocols', async (req, res) => {
  try {
    const { chainId } = req.query;
    
    if (!chainId) {
      return res.status(400).json({ error: 'chainId is required' });
    }

    const protocols = await make1inchRequest(`/swap/v5.2/${chainId}/liquidity-sources`);
    res.json(protocols);
  } catch (error: any) {
    console.error('Protocols error:', error);
    res.status(400).json({ 
      error: error.message,
      details: 'Failed to get protocols from 1inch'
    });
  }
});

// Health check for 1inch API
router.get('/health', async (req, res) => {
  try {
    // Test with Ethereum mainnet tokens endpoint
    await make1inchRequest('/swap/v5.2/1/tokens');
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error: any) {
    res.status(503).json({ 
      status: 'unhealthy', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router; 