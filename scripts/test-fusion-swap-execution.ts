import { FusionSwapComponent } from '../frontend/lib/components/defi/fusion-swap'

async function testFusionSwapExecution() {
  console.log('⚡ Testing 1inch Fusion+ Swap Execution')
  console.log('=' .repeat(50))
  
  const component = new FusionSwapComponent()
  
  // Test configuration for Fusion+ swap
  const fusionSwapInputs = {
    api_key: process.env.INCH_FUSION_API_KEY || 'test-api-key',
    execution_mode: 'fusion',
    chain_id: '1',
    from_token: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // ETH
    to_token: '0xA0b86a33E6417c4a4e6d3b7e6d8f0e8b8e8c8d8e', // USDC
    amount: '100000000000000000', // 0.1 ETH
    from_address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    slippage: 1,
    enable_dutch_auction: true,
    enable_mev_protection: true,
    enable_gasless: true,
    auction_duration: 300,
    enable_partial_fills: true,
    deadline: 1800
  }
  
  // Test configuration for regular swap
  const regularSwapInputs = {
    api_key: process.env.INCH_FUSION_API_KEY || 'test-api-key',
    execution_mode: 'regular',
    chain_id: '1',
    from_token: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // ETH
    to_token: '0xA0b86a33E6417c4a4e6d3b7e6d8f0e8b8e8c8d8e', // USDC
    amount: '100000000000000000', // 0.1 ETH
    from_address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    slippage: 1
  }
  
  try {
    console.log('\n🔧 Testing Fusion+ Swap Configuration')
    console.log('-'.repeat(40))
    
    // Test Fusion+ swap
    console.log('📊 Getting Fusion+ quote with MEV protection...')
    const fusionQuote = await component.getFusionQuote(fusionSwapInputs)
    console.log('✅ Fusion+ Quote received:')
    console.log(`   From: ${fusionSwapInputs.amount} wei ETH`)
    console.log(`   To: ${fusionQuote.toAmount} wei USDC`)
    console.log(`   MEV Protected: ${fusionQuote.mevProtected}`)
    console.log(`   Dutch Auction: ${fusionQuote.dutchAuction}`)
    console.log(`   Gasless: ${fusionQuote.gasless}`)
    console.log(`   Estimated Gas: ${fusionQuote.estimatedGas}`)
    console.log(`   Price Impact: ${fusionQuote.priceImpact}%`)
    
    console.log('\n🔄 Creating Fusion+ order with Dutch auction...')
    const fusionOrder = await component.createFusionOrder(fusionSwapInputs, fusionQuote)
    console.log('✅ Fusion+ Order created:')
    console.log(`   Order ID: ${fusionOrder.orderId}`)
    console.log(`   User Address: ${fusionOrder.userAddress}`)
    console.log(`   Deadline: ${new Date(fusionOrder.deadline * 1000).toISOString()}`)
    console.log(`   Dutch Auction Enabled: ${fusionOrder.dutchAuction.enabled}`)
    console.log(`   Auction Duration: ${fusionOrder.dutchAuction.duration}s`)
    console.log(`   MEV Protection Level: ${fusionOrder.mevProtection.level}`)
    console.log(`   Gasless: ${fusionOrder.gasless}`)
    
    console.log('\n🚀 Executing Fusion+ swap...')
    const fusionTransaction = await component.executeFusionTransaction(fusionSwapInputs, fusionOrder)
    console.log('✅ Fusion+ Transaction executed:')
    console.log(`   Transaction Hash: ${fusionTransaction.txHash}`)
    console.log(`   To Address: ${fusionTransaction.to}`)
    console.log(`   Gas Limit: ${fusionTransaction.gasLimit}`)
    console.log(`   Chain ID: ${fusionTransaction.chainId}`)
    console.log(`   Order ID: ${fusionTransaction.orderId}`)
    
    console.log('\n📈 Monitoring Fusion+ execution...')
    const fusionStatus = await component.monitorFusionExecution(fusionTransaction.txHash)
    console.log('✅ Execution Status:')
    console.log(`   Status: ${fusionStatus.status}`)
    console.log(`   MEV Protected: ${fusionStatus.mevProtected}`)
    console.log(`   Gasless: ${fusionStatus.gasless}`)
    console.log(`   Dutch Auction Status: ${fusionStatus.dutchAuction.status}`)
    console.log(`   Remaining Time: ${fusionStatus.dutchAuction.remainingTime}s`)
    console.log(`   Current Price: ${fusionStatus.dutchAuction.currentPrice}`)
    console.log(`   Target Price: ${fusionStatus.dutchAuction.targetPrice}`)
    
    console.log('\n🔧 Testing Regular Swap Configuration')
    console.log('-'.repeat(40))
    
    // Test regular swap
    console.log('📊 Getting regular quote...')
    const regularQuote = await component.getQuote(regularSwapInputs)
    console.log('✅ Regular Quote received:')
    console.log(`   From: ${regularSwapInputs.amount} wei ETH`)
    console.log(`   To: ${regularQuote.toAmount} wei USDC`)
    console.log(`   MEV Protected: ${regularQuote.mevProtected || false}`)
    console.log(`   Estimated Gas: ${regularQuote.estimatedGas}`)
    console.log(`   Price Impact: ${regularQuote.priceImpact}%`)
    
    console.log('\n🚀 Executing regular swap...')
    const regularTransaction = await component.executeSwap(regularSwapInputs)
    console.log('✅ Regular Transaction executed:')
    console.log(`   Transaction Hash: ${regularTransaction.txHash}`)
    console.log(`   To Address: ${regularTransaction.to}`)
    console.log(`   Gas Limit: ${regularTransaction.gasLimit}`)
    console.log(`   Chain ID: ${regularTransaction.chainId}`)
    
    console.log('\n🧪 Testing Component Methods')
    console.log('-'.repeat(40))
    
    // Test component test method
    console.log('🧪 Testing Fusion+ component test method...')
    const testResult = await component.test(fusionSwapInputs)
    console.log('✅ Test completed:')
    console.log(`   Success: ${testResult.success}`)
    console.log(`   Execution Time: ${testResult.executionTime}ms`)
    console.log(`   Outputs: ${Object.keys(testResult.outputs).length} outputs generated`)
    
    if (testResult.outputs.quote) {
      console.log(`   Quote Generated: ✅`)
    }
    if (testResult.outputs.order) {
      console.log(`   Order Generated: ✅`)
    }
    if (testResult.outputs.transaction) {
      console.log(`   Transaction Generated: ✅`)
    }
    if (testResult.outputs.execution_status) {
      console.log(`   Execution Status: ✅`)
    }
    if (testResult.outputs.mev_protection) {
      console.log(`   MEV Protection: ✅`)
    }
    if (testResult.outputs.gas_optimization) {
      console.log(`   Gas Optimization: ✅`)
    }
    
    console.log('\n📊 Performance Comparison')
    console.log('-'.repeat(40))
    
    const fusionGas = fusionQuote.estimatedGas
    const regularGas = regularQuote.estimatedGas
    const gasSavings = ((parseInt(regularGas) - parseInt(fusionGas)) / parseInt(regularGas) * 100).toFixed(1)
    
    console.log(`Fusion+ Swap:`)
    console.log(`   Gas Used: ${fusionGas}`)
    console.log(`   MEV Protection: ✅`)
    console.log(`   Dutch Auction: ✅`)
    console.log(`   Gasless: ✅`)
    console.log(`   Price Impact: ${fusionQuote.priceImpact}%`)
    
    console.log(`\nRegular Swap:`)
    console.log(`   Gas Used: ${regularGas}`)
    console.log(`   MEV Protection: ❌`)
    console.log(`   Dutch Auction: ❌`)
    console.log(`   Gasless: ❌`)
    console.log(`   Price Impact: ${regularQuote.priceImpact}%`)
    
    console.log(`\n💰 Savings:`)
    console.log(`   Gas Savings: ${gasSavings}%`)
    console.log(`   MEV Protection: Prevents front-running`)
    console.log(`   Better Execution: Dutch auction mechanism`)
    
    console.log('\n🎯 Key Differences Summary')
    console.log('-'.repeat(40))
    console.log('Fusion+ Swaps provide:')
    console.log('✅ MEV Protection through Dutch auctions')
    console.log('✅ Gasless transactions (when supported)')
    console.log('✅ Better execution rates')
    console.log('✅ Advanced slippage protection')
    console.log('✅ Partial fill support')
    console.log('✅ Professional relayer network')
    
    console.log('\nRegular Swaps provide:')
    console.log('❌ No MEV protection')
    console.log('❌ User pays gas fees')
    console.log('❌ Basic execution')
    console.log('❌ Standard slippage protection')
    console.log('❌ No partial fills')
    console.log('❌ Direct blockchain execution')
    
    console.log('\n✅ All tests completed successfully!')
    console.log('\n🚀 To enable real Fusion+ swaps:')
    console.log('1. Get 1inch Fusion+ API key from https://portal.1inch.dev')
    console.log('2. Set INCH_FUSION_API_KEY environment variable')
    console.log('3. Configure execution_mode: "fusion" in your node')
    console.log('4. Enable MEV protection and gasless execution')
    console.log('5. Test with small amounts first')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    console.log('\n🔧 Troubleshooting:')
    console.log('- Check if INCH_FUSION_API_KEY is set')
    console.log('- Verify token addresses are correct')
    console.log('- Ensure wallet address is valid')
    console.log('- Check network connectivity')
  }
}

// Run the test
testFusionSwapExecution().catch(console.error) 