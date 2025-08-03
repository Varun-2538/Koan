#!/usr/bin/env node

/**
 * Fusion+ Monad Bridge Demo
 * 
 * This script demonstrates the new Fusion+ Monad Bridge integration
 * that enables atomic swaps between Ethereum and Monad using HTLCs.
 */

import { FusionMonadBridgeComponent } from '../frontend/lib/components/defi/fusion-monad-bridge';

async function demonstrateFusionMonadBridge() {
  console.log('🌉 Fusion+ Monad Bridge Demo - ETHGlobal Unite Hackathon');
  console.log('=' .repeat(60));
  
  const component = new FusionMonadBridgeComponent();
  
  console.log(`\n📋 Component Details:`);
  console.log(`   Name: ${component.name}`);
  console.log(`   Description: ${component.description}`);
  console.log(`   Category: ${component.metadata.category}`);
  console.log(`   Tags: ${component.metadata.tags.join(', ')}`);
  
  console.log(`\n🔧 Component Inputs:`);
  component.inputs.forEach((input, index) => {
    console.log(`   ${index + 1}. ${input.label}: ${input.description}`);
    if (input.defaultValue) {
      console.log(`      Default: ${JSON.stringify(input.defaultValue)}`);
    }
  });
  
  console.log(`\n📤 Component Outputs:`);
  component.outputs.forEach((output, index) => {
    console.log(`   ${index + 1}. ${output.label}: ${output.description}`);
  });
  
  console.log(`\n🧪 Testing Component with Sample Configuration:`);
  
  const sampleConfig = {
    api_key: 'demo-api-key',
    bridge_direction: 'eth_to_monad',
    source_token: 'ETH',
    destination_token: 'MONAD', 
    amount: 1.0,
    timelock_duration: 24,
    enable_partial_fills: true,
    enable_mev_protection: true,
    slippage_tolerance: 1,
    gas_optimization: 'balanced'
  };
  
  console.log('   Configuration:');
  Object.entries(sampleConfig).forEach(([key, value]) => {
    console.log(`     ${key}: ${JSON.stringify(value)}`);
  });
  
  try {
    console.log('\n⚡ Executing component test...');
    const result = await component.test(sampleConfig);
    
    if (result.success) {
      console.log('✅ Component test successful!');
      console.log('\n📊 Generated Outputs:');
      
      if (result.outputs.bridge_config) {
        console.log('\n🌉 Bridge Configuration:');
        console.log(`   - Direction: ${result.outputs.bridge_config.bridge_direction}`);
        console.log(`   - Timelock: ${result.outputs.bridge_config.timelock_duration} hours`);
        console.log(`   - MEV Protection: ${result.outputs.bridge_config.enable_mev_protection}`);
        console.log(`   - Partial Fills: ${result.outputs.bridge_config.enable_partial_fills}`);
      }
      
      if (result.outputs.htlc_contracts) {
        console.log('\n🔐 HTLC Contract Configuration:');
        console.log(`   - Ethereum Gas: ${result.outputs.htlc_contracts.ethereum.gas_estimates.create}`);
        console.log(`   - Monad Gas: ${result.outputs.htlc_contracts.monad.gas_estimates.create} (95% reduction!)`);
        console.log(`   - Timelock Duration: ${result.outputs.htlc_contracts.ethereum.timelock_duration}s`);
        console.log(`   - Security: ${result.outputs.htlc_contracts.atomic_guarantees.trustless ? 'Trustless' : 'Trusted'}`);
      }
      
      if (result.outputs.api_endpoints) {
        console.log('\n🔗 API Endpoints:');
        Object.entries(result.outputs.api_endpoints.endpoints).forEach(([name, endpoint]: [string, any]) => {
          console.log(`   - ${endpoint.method} ${endpoint.path}: ${endpoint.description}`);
        });
      }
      
      console.log('\n📝 Execution Logs:');
      (result.logs || []).forEach(log => {
        console.log(`   ${log}`);
      });
      
    } else {
      console.log('❌ Component test failed:');
      console.log(`   Error: ${result.error}`);
    }
    
  } catch (error) {
    console.log('💥 Demo failed with error:');
    console.log(`   ${error}`);
  }
  
  console.log('\n🚀 Next Steps:');
  console.log('   1. Add this component to your workflow canvas');
  console.log('   2. Configure with your 1inch API key');
  console.log('   3. Deploy your HTLC contracts on Ethereum and Monad');
  console.log('   4. Execute atomic swaps with trustless guarantees!');
  
  console.log('\n🏆 ETHGlobal Unite - Fusion+ Monad Track Submission');
  console.log('   This integration demonstrates the first working');
  console.log('   atomic swap bridge between Ethereum and Monad');
  console.log('   using 1inch Fusion+ with Hash Time Locked Contracts.');
  
  console.log('\n' + '=' .repeat(60));
}

// Run the demo
demonstrateFusionMonadBridge().catch(console.error);

export { demonstrateFusionMonadBridge };
