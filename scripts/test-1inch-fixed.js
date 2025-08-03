// Using built-in fetch (Node.js 18+)

// Test 1inch API integration with the fixes
async function test1inchAPI() {
  console.log('🧪 Testing 1inch API integration with fixes...\n');

  // Test configuration
  const config = {
    apiKey: process.env.ONEINCH_API_KEY || 'IBbEIN4jebemuGceiCR7IDeOOgj1U1ip',
    chainId: '137', // Polygon
    fromToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // MATIC
    toToken: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT
    amount: '1000000000000000000', // 1 MATIC in wei
    fromAddress: '0xae3068f47b279d24a68c701edf16cc180388d974'
  };

  try {
    // Test 1: Quote endpoint
    console.log('📊 Testing Quote endpoint...');
    const quoteParams = new URLSearchParams({
      fromTokenAddress: config.fromToken,
      toTokenAddress: config.toToken,
      amount: config.amount,
      from: config.fromAddress,
      slippage: '0.5'
    });

    const quoteUrl = `https://api.1inch.dev/swap/v6.0/${config.chainId}/quote?${quoteParams}`;
    console.log(`🔗 Quote URL: ${quoteUrl}`);

    const quoteResponse = await fetch(quoteUrl, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'accept': 'application/json'
      }
    });

    if (!quoteResponse.ok) {
      const errorData = await quoteResponse.json();
      console.error('❌ Quote API Error:', errorData);
      return;
    }

    const quoteData = await quoteResponse.json();
    console.log('✅ Quote Response:');
    console.log(`  From Amount: ${quoteData.srcAmount} wei`);
    console.log(`  To Amount: ${quoteData.dstAmount} wei`);
    console.log(`  Protocols: ${quoteData.protocols?.length || 0} protocols used`);
    console.log(`  Gas Estimate: ${quoteData.gas || 'Not provided'}\n`);

    // Test 2: Swap endpoint
    console.log('🔄 Testing Swap endpoint...');
    const swapParams = new URLSearchParams({
      fromTokenAddress: config.fromToken,
      toTokenAddress: config.toToken,
      amount: config.amount,
      from: config.fromAddress,
      slippage: '0.5',
      disableEstimate: 'false',
      allowPartialFill: 'true'
    });

    const swapUrl = `https://api.1inch.dev/swap/v5.2/${config.chainId}/swap?${swapParams}`;
    console.log(`🔗 Swap URL: ${swapUrl}`);

    const swapResponse = await fetch(swapUrl, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'accept': 'application/json'
      }
    });

    if (!swapResponse.ok) {
      const errorData = await swapResponse.json();
      console.error('❌ Swap API Error:', errorData);
      return;
    }

    const swapData = await swapResponse.json();
    console.log('✅ Swap Response:');
    console.log(`  Transaction To: ${swapData.tx?.to || 'Not provided'}`);
    console.log(`  Transaction Value: ${swapData.tx?.value || '0'} wei`);
    console.log(`  Transaction Data Length: ${swapData.tx?.data?.length || 0}`);
    console.log(`  Gas Limit: ${swapData.tx?.gas || 'Not provided'}`);
    console.log(`  Gas Price: ${swapData.tx?.gasPrice || 'Not provided'}`);
    console.log(`  Dst Amount: ${swapData.dstAmount || 'Not provided'}\n`);

    // Validate transaction data
    if (swapData.tx) {
      console.log('🔍 Transaction Validation:');
      console.log(`  Has 'to' address: ${!!swapData.tx.to}`);
      console.log(`  Has 'data': ${!!swapData.tx.data}`);
      console.log(`  Value matches amount: ${swapData.tx.value === config.amount ? '✅' : '❌'}`);
      console.log(`  Value in ETH: ${parseInt(swapData.tx.value || '0') / 1e18} ETH`);
      
      if (swapData.tx.value !== config.amount) {
        console.log(`⚠️  Warning: Transaction value (${swapData.tx.value}) doesn't match requested amount (${config.amount})`);
      }
    }

    console.log('\n🎉 1inch API test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
test1inchAPI();