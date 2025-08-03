// debug-api-response.js - Debug what the API actually returns
const axios = require('axios');

const ONEINCH_API_KEY = 'IBbEIN4jebemuGceiCR7IDeOOgj1U1ip';

async function debugApiResponse() {
  console.log('🔍 Debugging API Response Structure');
  console.log('=' .repeat(50));
  
  try {
    console.log('\n1️⃣ Testing direct API call...');
    const response = await axios.get('https://api.1inch.dev/swap/v6.0/137/quote', {
      headers: {
        'Authorization': `Bearer ${ONEINCH_API_KEY}`,
        'accept': 'application/json'
      },
      params: {
        src: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        dst: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        amount: '100000000000000000' // 0.1 MATIC
      }
    });
    
    console.log('✅ Response Status:', response.status);
    console.log('📦 Response Data:', JSON.stringify(response.data, null, 2));
    console.log('📊 Data Keys:', Object.keys(response.data));
    console.log('📏 Response Size:', JSON.stringify(response.data).length, 'characters');
    
    // Check if it has expected fields
    const expectedFields = ['toAmount', 'toTokenAmount', 'estimatedGas', 'protocols'];
    console.log('\n🔍 Field Analysis:');
    expectedFields.forEach(field => {
      const hasField = response.data.hasOwnProperty(field);
      console.log(`   ${field}: ${hasField ? '✅ Present' : '❌ Missing'}`);
      if (hasField) {
        console.log(`      Value: ${response.data[field]}`);
      }
    });
    
  } catch (error) {
    console.log('❌ Direct API call failed:', error.response?.data || error.message);
  }
  
  try {
    console.log('\n2️⃣ Testing through local proxy...');
    const proxyResponse = await axios.get('http://localhost:3000/api/oneinch-proxy', {
      headers: {
        'x-api-key': ONEINCH_API_KEY
      },
      params: {
        chainId: '137',
        endpoint: 'quote',
        src: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        dst: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        amount: '100000000000000000'
      }
    });
    
    console.log('✅ Proxy Response Status:', proxyResponse.status);
    console.log('📦 Proxy Response Data:', JSON.stringify(proxyResponse.data, null, 2));
    console.log('📊 Proxy Data Keys:', Object.keys(proxyResponse.data));
    console.log('📏 Proxy Response Size:', JSON.stringify(proxyResponse.data).length, 'characters');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('⚠️ Frontend server not running. Start with: cd frontend && npm run dev');
    } else {
      console.log('❌ Proxy call failed:', error.response?.data || error.message);
    }
  }
}

debugApiResponse().catch(console.error);