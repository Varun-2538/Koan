// test-1inch-fixed.js - Fixed 1inch API test following official documentation
const axios = require('axios');

// Configuration - Replace with your actual API key
const ONEINCH_API_KEY = 'IBbEIN4jebemuGceiCR7IDeOOgj1U1ip';
const BASE_URL = 'https://api.1inch.dev';
const API_VERSION = 'v6.0'; // Using latest stable version

// Test configurations for different chains
const TEST_CONFIGS = {
  '1': { // Ethereum
    name: 'Ethereum',
    nativeToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    testAmount: '100000000000000000', // 0.1 ETH
    testWallet: '0x742d35cc6634C0532925a3b8d39a2bd2f044a4a7'
  },
  '137': { // Polygon
    name: 'Polygon',
    nativeToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Use standard format, not 0x001010
    testAmount: '100000000000000000', // 0.1 MATIC
    testWallet: '0x742d35cc6634C0532925a3b8d39a2bd2f044a4a7'
  },
  '56': { // BSC
    name: 'BSC',
    nativeToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    testAmount: '100000000000000000', // 0.1 BNB
    testWallet: '0x742d35cc6634C0532925a3b8d39a2bd2f044a4a7'
  }
};

async function makeAPIRequest(endpoint, params = {}, method = 'GET', chainId = '1') {
  const url = `${BASE_URL}/swap/${API_VERSION}/${chainId}/${endpoint}`;
  
  try {
    const config = {
      method,
      url,
      headers: {
        'Authorization': `Bearer ${ONEINCH_API_KEY}`,
        'accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    if (method === 'GET') {
      config.params = params;
    } else {
      config.data = params;
    }

    console.log(`🔍 ${method} ${url}`);
    console.log(`📋 Params:`, params);

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

async function testChain(chainId) {
  const config = TEST_CONFIGS[chainId];
  console.log(`\n🌐 Testing ${config.name} (Chain ID: ${chainId})`);
  console.log('=' .repeat(50));

  // Test 1: Get available tokens
  console.log('\n1️⃣ Getting available tokens...');
  const tokensResult = await makeAPIRequest('tokens', {}, 'GET', chainId);
  
  if (!tokensResult.success) {
    console.log('❌ Failed to get tokens:', tokensResult.error);
    return false;
  }

  const tokens = tokensResult.data.tokens;
  console.log(`✅ Found ${Object.keys(tokens).length} tokens`);
  
  // Find a popular stablecoin for testing
  const stablecoins = ['USDC', 'USDT', 'DAI'];
  let testToken = null;
  
  for (const symbol of stablecoins) {
    testToken = Object.values(tokens).find(token => 
      token.symbol === symbol && token.decimals >= 6
    );
    if (testToken) break;
  }

  if (!testToken) {
    console.log('❌ No suitable test token found');
    return false;
  }

  console.log(`🎯 Using test token: ${testToken.symbol} (${testToken.address})`);

  // Test 2: Get liquidity sources
  console.log('\n2️⃣ Getting liquidity sources...');
  const liquidityResult = await makeAPIRequest('liquidity-sources', {}, 'GET', chainId);
  
  if (liquidityResult.success) {
    console.log(`✅ Found ${liquidityResult.data.protocols.length} liquidity sources`);
  } else {
    console.log('⚠️ Could not get liquidity sources:', liquidityResult.error);
  }

  // Test 3: Get quote
  console.log('\n3️⃣ Getting quote...');
  const quoteParams = {
    src: config.nativeToken,
    dst: testToken.address,
    amount: config.testAmount
  };

  const quoteResult = await makeAPIRequest('quote', quoteParams, 'GET', chainId);
  
  if (!quoteResult.success) {
    console.log('❌ Quote failed:', quoteResult.error);
    
    // Try with a smaller amount
    console.log('🔄 Trying with smaller amount...');
    quoteParams.amount = '10000000000000000'; // 0.01 native token
    const retryQuote = await makeAPIRequest('quote', quoteParams, 'GET', chainId);
    
    if (!retryQuote.success) {
      console.log('❌ Quote still failed:', retryQuote.error);
      return false;
    } else {
      console.log('✅ Quote successful with smaller amount');
    }
  } else {
    console.log('✅ Quote successful');
    const quote = quoteResult.data;
    const outputAmount = (parseInt(quote.toAmount) / Math.pow(10, testToken.decimals)).toFixed(6);
    console.log(`💱 ${config.testAmount} wei native → ${outputAmount} ${testToken.symbol}`);
    console.log(`⛽ Estimated gas: ${parseInt(quote.estimatedGas).toLocaleString()}`);
  }

  // Test 4: Check allowance (for ERC-20 tokens)
  console.log('\n4️⃣ Checking token allowance...');
  const allowanceParams = {
    tokenAddress: testToken.address,
    walletAddress: config.testWallet
  };

  const allowanceResult = await makeAPIRequest('approve/allowance', allowanceParams, 'GET', chainId);
  
  if (allowanceResult.success) {
    console.log(`✅ Current allowance: ${allowanceResult.data.allowance}`);
  } else {
    console.log('⚠️ Could not check allowance:', allowanceResult.error);
  }

  // Test 5: Get swap transaction (simulation)
  console.log('\n5️⃣ Getting swap transaction...');
  const swapParams = {
    src: config.nativeToken,
    dst: testToken.address,
    amount: '10000000000000000', // Use smaller amount
    from: config.testWallet,
    slippage: 1
  };

  const swapResult = await makeAPIRequest('swap', swapParams, 'GET', chainId);
  
  if (swapResult.success) {
    console.log('✅ Swap transaction generated');
    console.log(`🎯 To: ${swapResult.data.tx.to}`);
    console.log(`💰 Value: ${swapResult.data.tx.value} wei`);
    console.log(`⛽ Gas: ${parseInt(swapResult.data.tx.gas).toLocaleString()}`);
  } else {
    console.log('❌ Swap failed:', swapResult.error);
  }

  return true;
}

async function main() {
  console.log('🚀 1inch API Integration Test (Fixed Version)');
  console.log('📖 Following official 1inch API v6.0 documentation');
  console.log('🔗 https://portal.1inch.dev/documentation/apis/swap/classic-swap/introduction');
  
  if (!ONEINCH_API_KEY || ONEINCH_API_KEY === 'YOUR_API_KEY_HERE') {
    console.log('\n❌ Please set your actual 1inch API key');
    console.log('🔑 Get your API key from: https://portal.1inch.dev/');
    return;
  }

  // Test multiple chains
  const chainsToTest = ['1', '137']; // Ethereum and Polygon
  
  for (const chainId of chainsToTest) {
    try {
      await testChain(chainId);
    } catch (error) {
      console.log(`❌ Chain ${chainId} test failed:`, error.message);
    }
  }

  console.log('\n🎉 Testing completed!');
  console.log('\n💡 Key fixes implemented:');
  console.log('   ✅ Using consistent API version v6.0');
  console.log('   ✅ Fixed native token addresses (using 0xEeee... format)');
  console.log('   ✅ Using appropriate test amounts');
  console.log('   ✅ Proper error handling and retries');
  console.log('   ✅ Following official API documentation');
}

main().catch(console.error);