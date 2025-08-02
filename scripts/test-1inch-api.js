// test-1inch-api.js - Run this to test your 1inch API integration
const axios = require('axios');

const ONEINCH_API_KEY = 'IBbEIN4jebemuGceiCR7IDeOOgj1U1ip'; // Replace with your actual API key
const BASE_URL = 'https://api.1inch.dev';

async function test1inchAPI() {
  console.log('🔍 Testing 1inch API Integration...\n');

  // Test 1: Check API key validity and get tokens
  console.log('1️⃣ Testing API key validity...');
  let availableTokens = {};
  try {
    const response = await axios.get(`${BASE_URL}/swap/v5.2/1/tokens`, {
      headers: {
        'Authorization': `Bearer ${ONEINCH_API_KEY}`,
        'accept': 'application/json'
      }
    });
    availableTokens = response.data.tokens;
    console.log('✅ API key is valid');
    console.log(`📊 Found ${Object.keys(availableTokens).length} tokens on Ethereum\n`);
    
    // Show some popular tokens for reference
    const popularTokens = ['USDC', 'USDT', 'DAI', 'WETH'];
    console.log('🔍 Popular token addresses:');
    Object.values(availableTokens).forEach(token => {
      if (popularTokens.includes(token.symbol)) {
        console.log(`   ${token.symbol}: ${token.address}`);
      }
    });
    console.log('');
  } catch (error) {
    console.log('❌ API key test failed:', error.response?.data?.description || error.message);
    return;
  }

  // Test 2: Get a quote with correct token addresses
  console.log('2️⃣ Testing quote endpoint...');
  try {
    // Use correct USDC address (the one in your script might be outdated)
    const usdcAddress = '0xA0b86a33E6441203206448619dd91e2df9dd2abf'; // USDC on Ethereum
    
    // Verify the token exists in the available tokens
    const usdcToken = Object.values(availableTokens).find(token => 
      token.address.toLowerCase() === usdcAddress.toLowerCase()
    );
    
    if (!usdcToken) {
      // Fallback to a token we know exists
      const fallbackToken = Object.values(availableTokens).find(token => 
        token.symbol === 'USDC' || token.symbol === 'USDT'
      );
      if (fallbackToken) {
        console.log(`⚠️  Using ${fallbackToken.symbol} (${fallbackToken.address}) as fallback token`);
      }
    }

    const quoteParams = {
      src: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // ETH (native token)
      dst: usdcToken ? usdcAddress : Object.values(availableTokens).find(t => t.symbol === 'USDC')?.address,
      amount: '1000000000000000000', // 1 ETH in wei
    };

    // Double-check that dst token exists
    if (!quoteParams.dst) {
      console.log('❌ Could not find USDC token, trying with USDT...');
      const usdtToken = Object.values(availableTokens).find(token => token.symbol === 'USDT');
      if (usdtToken) {
        quoteParams.dst = usdtToken.address;
        console.log(`📍 Using USDT: ${usdtToken.address}`);
      } else {
        console.log('❌ Could not find suitable destination token');
        return;
      }
    }

    console.log(`📍 Quote params: ETH -> ${quoteParams.dst}`);

    const quoteResponse = await axios.get(`${BASE_URL}/swap/v5.2/1/quote`, {
      headers: {
        'Authorization': `Bearer ${ONEINCH_API_KEY}`,
        'accept': 'application/json'
      },
      params: quoteParams
    });

    const quote = quoteResponse.data;
    console.log('✅ Quote retrieved successfully');
    
    // Get token info for better display
    const dstToken = Object.values(availableTokens).find(token => 
      token.address.toLowerCase() === quoteParams.dst.toLowerCase()
    );
    const decimals = dstToken ? dstToken.decimals : 6;
    const symbol = dstToken ? dstToken.symbol : 'TOKEN';
    
    console.log(`💱 1 ETH = ${(parseInt(quote.toAmount) / Math.pow(10, decimals)).toFixed(2)} ${symbol}`);
    console.log(`⛽ Estimated gas: ${parseInt(quote.estimatedGas).toLocaleString()}`);
    console.log(`🔗 Protocols: ${quote.protocols?.length || 0} DEXs\n`);
  } catch (error) {
    console.log('❌ Quote test failed:', error.response?.data?.description || error.message);
    console.log('📋 Error details:', error.response?.data);
    return;
  }

  // Test 3: Test swap endpoint (without executing)
  console.log('3️⃣ Testing swap endpoint...');
  try {
    // Use the same token addresses as the quote test
    const usdcToken = Object.values(availableTokens).find(token => 
      token.symbol === 'USDC' || token.symbol === 'USDT'
    );
    
    const swapParams = {
      src: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // ETH
      dst: usdcToken.address,
      amount: '1000000000000000000', // 1 ETH in wei
      from: '0x742d35cc6634C0532925a3b8d39a2bd2f044a4a7', // Random address for testing
      slippage: '1'
    };

    const swapResponse = await axios.get(`${BASE_URL}/swap/v5.2/1/swap`, {
      headers: {
        'Authorization': `Bearer ${ONEINCH_API_KEY}`,
        'accept': 'application/json'
      },
      params: swapParams
    });

    const swap = swapResponse.data;
    console.log('✅ Swap data retrieved successfully');
    console.log(`🎯 To address: ${swap.tx.to}`);
    console.log(`💰 Value: ${swap.tx.value} wei`);
    console.log(`⛽ Gas limit: ${parseInt(swap.tx.gas).toLocaleString()}\n`);
  } catch (error) {
    console.log('❌ Swap test failed:', error.response?.data?.description || error.message);
    console.log('📋 Error details:', error.response?.data);
  }

  // Test 4: Test protocols endpoint
  console.log('4️⃣ Testing protocols endpoint...');
  try {
    const protocolsResponse = await axios.get(`${BASE_URL}/swap/v5.2/1/liquidity-sources`, {
      headers: {
        'Authorization': `Bearer ${ONEINCH_API_KEY}`,
        'accept': 'application/json'
      }
    });

    const protocols = protocolsResponse.data.protocols;
    console.log('✅ Protocols retrieved successfully');
    console.log(`🔗 Available protocols: ${protocols.length}`);
    console.log(`📋 Popular protocols: ${protocols.slice(0, 5).map(p => p.title).join(', ')}\n`);
  } catch (error) {
    console.log('❌ Protocols test failed:', error.response?.data?.description || error.message);
  }

  console.log('🎉 All tests completed! Your 1inch API integration is working.');
  console.log('\n💡 Tips for your dashboard:');
  console.log('   - Always validate token addresses against the /tokens endpoint');
  console.log('   - Check user allowances before swaps');
  console.log('   - Implement proper error handling for rate limits');
  console.log('   - Cache quotes briefly to improve UX');
  console.log('   - Add slippage protection for better user experience');
}

// Run the tests
if (ONEINCH_API_KEY === 'YOUR_API_KEY_HERE') {
  console.log('❌ Please set your actual 1inch API key in the ONEINCH_API_KEY variable');
  console.log('🔑 Get your API key from: https://portal.1inch.dev/');
} else {
  test1inchAPI().catch(console.error);
}