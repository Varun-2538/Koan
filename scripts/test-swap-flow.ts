#!/usr/bin/env node
/**
 * Test script for the DEX Aggregator Swap Flow
 * This script demonstrates the complete workflow execution
 */

import { DeFiExecutionEngine } from '../backend/src/engine/execution-engine'
import { OneInchSwapExecutor } from '../backend/src/nodes/oneinch-swap-executor'
import { TokenSelectorExecutor } from '../backend/src/nodes/token-selector-executor'
import { PriceImpactCalculatorExecutor } from '../backend/src/nodes/price-impact-calculator-executor'
import { TransactionMonitorExecutor } from '../backend/src/nodes/transaction-monitor-executor'
import { WalletConnectorExecutor } from '../backend/src/nodes/wallet-connector-executor'
import winston from 'winston'

// Create logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [new winston.transports.Console()]
})

async function testSwapFlow() {
  console.log('🚀 Starting DEX Aggregator Swap Flow Test\n')

  // Create execution engine
  const engine = new DeFiExecutionEngine(logger)

  // Register executors
  engine.registerNodeExecutor(new WalletConnectorExecutor())
  engine.registerNodeExecutor(new TokenSelectorExecutor())
  engine.registerNodeExecutor(new OneInchSwapExecutor(logger, process.env.ONEINCH_API_KEY))
  engine.registerNodeExecutor(new PriceImpactCalculatorExecutor())
  engine.registerNodeExecutor(new TransactionMonitorExecutor())

  // Define test workflow
  const workflow = {
    id: 'test-swap-flow',
    name: 'Test DEX Aggregator Swap',
    nodes: {
      'wallet-1': {
        type: 'walletConnector',
        inputs: {
          wallet_address: '0x742d35Cc6bD2A3D4532123456789A44B62F10D',
          wallet_provider: 'metamask',
          chain_id: '1'
        }
      },
      'tokens-1': {
        type: 'tokenSelector',
        inputs: {
          from_token: 'ETH',
          to_token: 'USDC',
          chain_id: '1',
          config: {
            includeMetadata: true,
            priceSource: '1inch'
          }
        },
        dependencies: ['wallet-1']
      },
      'quote-1': {
        type: 'oneInchSwap',
        inputs: {
          from_token: 'ETH',
          to_token: 'USDC',
          amount: '1000000000000000000', // 1 ETH in wei
          from_address: '0x742d35Cc6bD2A3D4532123456789A44B62F10D',
          chain_id: '1',
          slippage: 1
        },
        dependencies: ['tokens-1']
      },
      'impact-1': {
        type: 'priceImpactCalculator',
        inputs: {
          from_token: 'ETH',
          to_token: 'USDC',
          amount: '1.0',
          chain_id: '1',
          config: {
            warningThreshold: 3,
            maxImpactThreshold: 15,
            detailedAnalysis: true
          }
        },
        dependencies: ['quote-1']
      },
      'monitor-1': {
        type: 'transactionMonitor',
        inputs: {
          transaction_hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          chain_id: '1',
          config: {
            confirmationsRequired: 1,
            timeoutMinutes: 30,
            enableMEVDetection: true
          }
        },
        dependencies: ['impact-1']
      }
    }
  }

  try {
    console.log('📋 Workflow Definition:')
    console.log(JSON.stringify(workflow, null, 2))
    console.log('\n' + '='.repeat(80) + '\n')

    // Execute workflow
    console.log('⚡ Executing workflow...\n')
    
    const result = await engine.executeWorkflow(workflow, {
      userId: 'test-user',
      sessionId: 'test-session',
      requestId: 'test-request',
      startTime: Date.now(),
      variables: {}
    })

    console.log('\n' + '='.repeat(80))
    console.log('✅ Workflow Execution Results:')
    console.log('='.repeat(80))
    
    if (result.success) {
      console.log('✅ Status: SUCCESS')
      console.log(`⏱️ Execution Time: ${result.executionTime}ms`)
      console.log(`🔧 Nodes Executed: ${Object.keys(result.nodeResults).length}`)
      
      console.log('\n📊 Node Results:')
      Object.entries(result.nodeResults).forEach(([nodeId, nodeResult]) => {
        console.log(`\n🔸 ${nodeId}:`)
        console.log(`   Status: ${nodeResult.success ? '✅ Success' : '❌ Failed'}`)
        if (nodeResult.executionTime) {
          console.log(`   Time: ${nodeResult.executionTime}ms`)
        }
        if (nodeResult.outputs && Object.keys(nodeResult.outputs).length > 0) {
          console.log(`   Outputs: ${JSON.stringify(nodeResult.outputs, null, 4)}`)
        }
        if (nodeResult.logs && nodeResult.logs.length > 0) {
          console.log(`   Logs:`)
          nodeResult.logs.forEach(log => console.log(`     - ${log}`))
        }
      })
    } else {
      console.log('❌ Status: FAILED')
      console.log(`❌ Error: ${result.error}`)
    }

    console.log('\n' + '='.repeat(80))
    console.log('🎉 Test completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

async function testIndividualNodes() {
  console.log('\n🧪 Testing Individual Nodes\n')

  const testCases = [
    {
      name: 'Wallet Connector',
      executor: new WalletConnectorExecutor(),
      inputs: {
        wallet_address: '0x742d35Cc6bD2A3D4532123456789A44B62F10D',
        wallet_provider: 'metamask',
        chain_id: '1'
      }
    },
    {
      name: 'Token Selector',
      executor: new TokenSelectorExecutor(),
      inputs: {
        from_token: 'ETH',
        to_token: 'USDC',
        config: { includeMetadata: true }
      }
    },
    {
      name: 'Price Impact Calculator',
      executor: new PriceImpactCalculatorExecutor(),
      inputs: {
        from_token: 'ETH',
        to_token: 'USDC',
        amount: '1.0',
        chain_id: '1'
      }
    },
    {
      name: 'Transaction Monitor',
      executor: new TransactionMonitorExecutor(),
      inputs: {
        transaction_hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        chain_id: '1'
      }
    }
  ]

  for (const testCase of testCases) {
    console.log(`🧪 Testing ${testCase.name}...`)
    
    try {
      // Validate inputs
      await testCase.executor.validate(testCase.inputs)
      console.log(`   ✅ Validation passed`)
      
      // Execute node
      const result = await testCase.executor.execute(testCase.inputs, {
        userId: 'test',
        sessionId: 'test',
        requestId: 'test',
        startTime: Date.now(),
        variables: {}
      })
      
      console.log(`   ✅ Execution: ${result.success ? 'Success' : 'Failed'}`)
      if (result.logs && result.logs.length > 0) {
        console.log(`   📋 Logs: ${result.logs.join(', ')}`)
      }
      
    } catch (error) {
      console.log(` ❌ Failed: ${error}`)
    }
    
    console.log('')
  }
}

// Run tests
async function main() {
  try {
    await testIndividualNodes()
    await testSwapFlow()
  } catch (error) {
    console.error('❌ Test suite failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}