// test-frontend-proxy.js - Test the fixed frontend proxy API
const axios = require('axios');

const ONEINCH_API_KEY = 'IBbEIN4jebemuGceiCR7IDeOOgj1U1ip';
const FRONTEND_URL = 'http://localhost:3000';

async function testFrontendProxy() {
  console.log('🌐 Testing Frontend Proxy API');
  console.log('=' .repeat(50));
  
  // Wait a moment for the server to start
  console.log('⏳ Waiting for frontend server to start...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('\n1️⃣ Testing quote through proxy (original failing scenario)...');
  
  try {
    const response = await axios.get(`${FRONTEND_URL}/api/oneinch-proxy`, {
      headers: {
        'x-api-key': ONEINCH_API_KEY
      },
      params: {
        chainId: '137',
        endpoint: 'quote',
        fromTokenAddress: '0x0000000000000000000000000000000000001010', // Will be auto-corrected
        toTokenAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        amount: '1000000000000000000' // Will be auto-adjusted if needed
      }
    });
    
    console.log('✅ SUCCESS! Proxy quote working');
    console.log(`📊 Response:`, response.data);
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('⚠️ Frontend server not running. Start with: cd frontend && npm run dev');
      return;
    }
    console.log('❌ Proxy test failed:', error.response?.data || error.message);
  }
  
  console.log('\n2️⃣ Testing allowance through proxy...');
  
  try {
    const response = await axios.get(`${FRONTEND_URL}/api/oneinch-proxy`, {
      headers: {
        'x-api-key': ONEINCH_API_KEY
      },
      params: {
        chainId: '137',
        endpoint: 'approve/allowance',
        tokenAddress: '0x0000000000000000000000000000000000001010', // Will be auto-corrected
        walletAddress: '0xae3068f47b279d24a68c701edf16cc180388d974'
      }
    });
    
    console.log('✅ SUCCESS! Proxy allowance working');
    console.log(`📊 Allowance:`, response.data.allowance);
    
  } catch (error) {
    console.log('❌ Allowance test failed:', error.response?.data || error.message);
  }
  
  console.log('\n🎉 Frontend proxy testing completed!');
}

testFrontendProxy().catch(console.error);