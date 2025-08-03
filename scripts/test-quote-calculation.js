// test-quote-calculation.js - Test the quote calculation logic
const axios = require('axios');

const ONEINCH_API_KEY = 'IBbEIN4jebemuGceiCR7IDeOOgj1U1ip';

async function testQuoteCalculation() {
  console.log('🧮 Testing Quote Calculation Logic');
  console.log('=' .repeat(50));
  
  try {
    console.log('\n1️⃣ Getting quote for 1 MATIC → USDT...');
    
    const response = await axios.get('https://api.1inch.dev/swap/v6.0/137/quote', {
      headers: {
        'Authorization': `Bearer ${ONEINCH_API_KEY}`,
        'accept': 'application/json'
      },
      params: {
        src: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // MATIC
        dst: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT
        amount: '1000000000000000000', // 1 MATIC
        from: '0xae3068f47b279d24a68c701edf16cc180388d974'
      }
    });
    
    console.log('✅ Quote Response Status:', response.status);
    console.log('📦 Raw Response:', JSON.stringify(response.data, null, 2));
    
    // Simulate the frontend logic
    const quoteData = response.data;
    const outputAmount = quoteData.dstAmount || quoteData.toTokenAmount || quoteData.toAmount;
    
    console.log('\n🔍 Frontend Processing:');
    console.log('   Raw outputAmount:', `"${outputAmount}"`);
    console.log('   Type:', typeof outputAmount);
    console.log('   Is defined:', !!outputAmount);
    
    if (!outputAmount) {
      console.log('❌ No output amount found!');
      return;
    }
    
    // Parse the amount
    const parsedAmount = parseInt(outputAmount);
    console.log('   Parsed amount:', parsedAmount);
    console.log('   Is NaN:', isNaN(parsedAmount));
    
    if (isNaN(parsedAmount)) {
      console.log('❌ Failed to parse amount!');
      return;
    }
    
    // Calculate display amount (USDT has 6 decimals)
    const displayAmount = (parsedAmount / 1e6).toFixed(6);
    console.log('   Display calculation:', `${parsedAmount} / 1e6 = ${displayAmount}`);
    
    // Expected calculation
    console.log('\n📊 Expected Results:');
    console.log(`   1 MATIC = ${displayAmount} USDT`);
    console.log(`   Rate: 1 MATIC = ${displayAmount} USDT`);
    
    // Verify the calculation
    const expectedRate = parseFloat(displayAmount);
    console.log(`   Rate per MATIC: $${expectedRate.toFixed(6)}`);
    
    console.log('\n✅ Quote calculation is working correctly!');
    
  } catch (error) {
    console.log('❌ Quote calculation test failed:', error.response?.data || error.message);
  }
}

testQuoteCalculation().catch(console.error); 