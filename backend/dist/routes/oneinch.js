"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const router = express_1.default.Router();
// 1inch API configuration
const ONEINCH_API_KEY = process.env.ONEINCH_API_KEY;
const ONEINCH_BASE_URL = 'https://api.1inch.dev';
if (!ONEINCH_API_KEY) {
    console.warn('WARNING: ONEINCH_API_KEY not set in environment variables');
}
// Helper function to make 1inch API requests with optional per-user override
async function make1inchRequest(endpoint, params = {}, apiKeyOverride) {
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
        const response = await axios_1.default.get(url, config);
        return response.data;
    }
    catch (error) {
        console.error('1inch API Error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.description || error.message || '1inch API request failed');
    }
}
// Get swap quote
router.get('/quote', async (req, res) => {
    try {
        const { chainId, src, dst, amount, from, slippage, apiKey } = req.query;
        // Validate required parameters
        if (!chainId || !src || !dst || !amount) {
            return res.status(400).json({
                error: 'Missing required parameters: chainId, src, dst, amount'
            });
        }
        const params = {
            src: src,
            dst: dst,
            amount: amount,
            includeTokensInfo: 'true',
            includeProtocols: 'true',
            includeGas: 'true'
        };
        // Add optional parameters
        if (from)
            params['from'] = from;
        if (slippage)
            params['slippage'] = slippage;
        const quote = await make1inchRequest(`/swap/v5.2/${chainId}/quote`, params, apiKey);
        res.json(quote);
    }
    catch (error) {
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
            src: src,
            dst: dst,
            amount: amount,
            from: from,
            slippage: (slippage || 1).toString(),
            disableEstimate: 'false',
            allowPartialFill: 'true'
        };
        // Add optional referral parameters
        if (referrer && fee) {
            params['referrer'] = referrer;
            params['fee'] = fee;
        }
        const swap = await make1inchRequest(`/swap/v5.2/${chainId}/swap`, params, apiKey);
        res.json(swap);
    }
    catch (error) {
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
        const { chainId, apiKey } = req.query;
        if (!chainId) {
            return res.status(400).json({ error: 'chainId is required' });
        }
        const tokens = await make1inchRequest(`/swap/v5.2/${chainId}/tokens`, {}, apiKey);
        res.json(tokens);
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
exports.default = router;
//# sourceMappingURL=oneinch.js.map