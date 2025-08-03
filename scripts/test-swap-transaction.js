// test-swap-transaction.js - Test swap transaction generation
const axios = require('axios');

const ONEINCH_API_KEY = 'IBbEIN4jebemuGceiCR7IDeOOgj1U1ip';

async function testSwapTransaction() {
  console.log('🔄 Testing Swap Transaction Generation');
  console.log('=' .repeat(50));
  
  try {
    console.log('\n1️⃣ Getting swap transaction data...');
    
    const response = await axios.get('https://api.1inch.dev/swap/v6.0/137/swap', {
      headers: {
        'Authorization': `Bearer ${ONEINCH_API_KEY}`,
        'accept': 'application/json'
      },
      params: {
        src: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // MATIC
        dst: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT
        amount: '100000000000000000', // 0.1 MATIC
        from: '0xae3068f47b279d24a68c701edf16cc180388d974',
        slippage: '1'
      }
    });
    
    console.log('✅ Swap Response Status:', response.status);
    console.log('📦 Swap Data Structure:');
    console.log('   Keys:', Object.keys(response.data));
    
    if (response.data.tx) {
      console.log('\n🔍 Transaction Data:');
      console.log('   To:', response.data.tx.to);
      console.log('   Value:', response.data.tx.value, '(type:', typeof response.data.tx.value, ')');
      console.log('   Data:', response.data.tx.data ? `${response.data.tx.data.slice(0, 20)}...` : 'undefined');
      console.log('   Gas:', response.data.tx.gas, '(type:', typeof response.data.tx.gas, ')');
      console.log('   Gas Price:', response.data.tx.gasPrice);
      
      // Test hex formatting
      const formatHex = (value) => {
        if (!value) return '0x0';
        const str = String(value);
        if (str.startsWith('0x')) return str;
        return `0x${parseInt(str).toString(16)}`;
      };
      
      console.log('\n🛠️ Formatted for MetaMask:');
      console.log('   Value (hex):', formatHex(response.data.tx.value));
      console.log('   Gas (hex):', formatHex(response.data.tx.gas));
      
      // Validate transaction structure
      const txParams = {
        from: '0xae3068f47b279d24a68c701edf16cc180388d974',
        to: response.data.tx.to,
        value: formatHex(response.data.tx.value),
        data: response.data.tx.data,
        gas: formatHex(response.data.tx.gas)
      };
      
      console.log('\n✅ Final Transaction Parameters:');
      console.log(JSON.stringify(txParams, null, 2));
      
    } else {
      console.log('❌ No transaction data in response');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.log('❌ Swap transaction test failed:', error.response?.data || error.message);
    console.log('Error details:', error.response?.status, error.response?.statusText);
  }
  
  console.log('\n🎯 This transaction structure should work with MetaMask!');
}

testSwapTransaction().catch(console.error);