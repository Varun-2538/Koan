const axios = require('axios');

const ONEINCH_API_KEY = process.env.ONEINCH_API_KEY || 'IBbEIN4jebemuGceiCR7IDeOOgj1U1ip';
const BASE_URL = 'https://api.1inch.dev';

async function getTokenAddresses() {
  console.log('🔍 Fetching token addresses from 1inch API...\n');

  try {
    const response = await axios.get(`${BASE_URL}/swap/v5.2/1/tokens`, {
      headers: {
        'Authorization': `Bearer ${ONEINCH_API_KEY}`,
        'accept': 'application/json'
      }
    });

    const tokens = response.data.tokens;
    console.log('✅ Successfully fetched tokens\n');

    // Find common tokens
    const commonTokens = {
      ETH: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      USDC: null,
      USDT: null,
      DAI: null,
      WBTC: null,
      WETH: null
    };

    // Search for tokens by symbol
    for (const [address, token] of Object.entries(tokens)) {
      const symbol = token.symbol?.toUpperCase();
      if (symbol === 'USDC' && !commonTokens.USDC) {
        commonTokens.USDC = address;
      } else if (symbol === 'USDT' && !commonTokens.USDT) {
        commonTokens.USDT = address;
      } else if (symbol === 'DAI' && !commonTokens.DAI) {
        commonTokens.DAI = address;
      } else if (symbol === 'WBTC' && !commonTokens.WBTC) {
        commonTokens.WBTC = address;
      } else if (symbol === 'WETH' && !commonTokens.WETH) {
        commonTokens.WETH = address;
      }
    }

    console.log('📋 Common Token Addresses:');
    console.log('========================');
    for (const [symbol, address] of Object.entries(commonTokens)) {
      if (address) {
        console.log(`${symbol}: ${address}`);
      } else {
        console.log(`${symbol}: Not found`);
      }
    }

    console.log('\n💡 Use these addresses in your test scripts and components!');

    return commonTokens;

  } catch (error) {
    console.error('❌ Failed to fetch tokens:', error.response?.data?.description || error.message);
    return null;
  }
}

// Run the script
getTokenAddresses().catch(console.error); 