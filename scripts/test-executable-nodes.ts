#!/usr/bin/env node
/**
 * Comprehensive testing script for executable nodes
 * Tests each node individually and in complete workflows
 */

import { DeFiExecutionEngine } from '../backend/src/engine/execution-engine'
import { TokenSelectorExecutor } from '../backend/src/nodes/token-selector-executor'
import { PriceImpactCalculatorExecutor } from '../backend/src/nodes/price-impact-calculator-executor'
import { TransactionMonitorExecutor } from '../backend/src/nodes/transaction-monitor-executor'
import { OneInchSwapExecutor } from '../backend/src/nodes/oneinch-swap-executor'
import { WalletConnectorExecutor } from '../backend/src/nodes/wallet-connector-executor'
import winston from 'winston'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

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

interface TestResult {
  nodeType: string
  testName: string
  success: boolean
  executionTime: number
  outputs?: any
  error?: string
  logs?: string[]
}

class NodeTester {
  private results: TestResult[] = []
  private engine: DeFiExecutionEngine

  constructor() {
    this.engine = new DeFiExecutionEngine(logger)
    this.setupExecutors()
  }

  private setupExecutors() {
    // Register all executors
    this.engine.registerNodeExecutor(new WalletConnectorExecutor())
    this.engine.registerNodeExecutor(new TokenSelectorExecutor())
    this.engine.registerNodeExecutor(new OneInchSwapExecutor(logger, process.env.ONEINCH_API_KEY))
    this.engine.registerNodeExecutor(new PriceImpactCalculatorExecutor())
    this.engine.registerNodeExecutor(new TransactionMonitorExecutor())
  }

  async testIndividualNodes() {
    console.log('\n🧪 Testing Individual Executable Nodes\n')
    console.log('=' .repeat(80))

    // Test Wallet Connector
    await this.testWalletConnector()
    
    // Test Token Selector
    await this.testTokenSelector()
    
    // Test 1inch Swap (if API key available)
    if (process.env.ONEINCH_API_KEY) {
      await this.test1inchSwap()
    } else {
      console.log('⚠️  Skipping 1inch Swap test (no API key)')
    }
    
    // Test Price Impact Calculator
    await this.testPriceImpactCalculator()
    
    // Test Transaction Monitor
    await this.testTransactionMonitor()

    this.printTestSummary()
  }

  private async testWalletConnector() {
    console.log('\n💳 Testing Wallet Connector Node...')
    
    const executor = new WalletConnectorExecutor()
    const testCases = [
      {
        name: 'Template Configuration Mode',
        inputs: {
          template_creation_mode: true,
          supported_wallets: ['metamask', 'walletconnect', 'coinbase'],
          supported_networks: [1, 137, 42161],
          default_network: 1
        }
      },
      {
        name: 'Valid Ethereum Address (Execution Mode)',
        inputs: {
          wallet_address: '0x742d35Cc6bD2A3D4532123456789A44B62F10D',
          wallet_provider: 'metamask',
          chain_id: '1'
        }
      },
      {
        name: 'Invalid Address Format (Should Fail)',
        inputs: {
          wallet_address: 'invalid-address',
          wallet_provider: 'metamask',
          chain_id: '1'
        }
      }
    ]

    for (const testCase of testCases) {
      const startTime = Date.now()
      try {
        await executor.validate(testCase.inputs)
        const result = await executor.execute(testCase.inputs, {
          workflowId: 'test',
          executionId: 'test',
          userId: 'test',
          environment: 'test' as const,
          startTime,
          variables: {},
          secrets: {}
        })

        this.results.push({
          nodeType: 'walletConnector',
          testName: testCase.name,
          success: result.success,
          executionTime: result.executionTime || (Date.now() - startTime),
          outputs: result.outputs,
          error: result.error,
          logs: result.logs
        })

        console.log(`   ${result.success ? '✅' : '❌'} ${testCase.name}: ${result.success ? 'PASSED' : 'FAILED'}`)
        if (result.error) console.log(`      Error: ${result.error}`)

      } catch (validationError: any) {
        this.results.push({
          nodeType: 'walletConnector',
          testName: testCase.name,
          success: false,
          executionTime: Date.now() - startTime,
          error: validationError.message
        })
        console.log(`   ❌ ${testCase.name}: VALIDATION FAILED - ${validationError.message}`)
      }
    }
  }

  private async testTokenSelector() {
    console.log('\n🪙 Testing Token Selector Node...')
    
    const executor = new TokenSelectorExecutor()
    const testCases = [
      {
        name: 'Template Configuration Mode',
        inputs: {
          template_creation_mode: true,
          default_tokens: ['ETH', 'USDC', 'WBTC', 'DAI'],
          enabled_tokens: ['ETH', 'USDC', 'WBTC', 'DAI', 'USDT', '1INCH'],
          default_from_token: 'ETH',
          default_to_token: 'USDC',
          allow_custom_tokens: true
        }
      },
      {
        name: 'ETH to USDC Selection (Execution Mode)',
        inputs: {
          from_token: 'ETH',
          to_token: 'USDC',
          config: {
            includeMetadata: true,
            priceSource: '1inch'
          }
        }
      },
      {
        name: 'Invalid Token (Should Fail)',
        inputs: {
          from_token: 'INVALID_TOKEN',
          to_token: 'USDC'
        }
      }
    ]

    for (const testCase of testCases) {
      await this.runNodeTest('tokenSelector', executor, testCase)
    }
  }

  private async test1inchSwap() {
    console.log('\n⚡ Testing 1inch Swap Node...')
    
    const executor = new OneInchSwapExecutor(logger, process.env.ONEINCH_API_KEY)
    const testCases = [
      {
        name: 'ETH to USDC Quote',
        inputs: {
          from_token: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
          to_token: '0xA0b86a33E6441fb3cD7b2a9da94C2b48A8aE5fF0',
          amount: '1000000000000000000', // 1 ETH
          from_address: '0x742d35Cc6bD2A3D4532123456789A44B62F10D',
          chain_id: '1',
          slippage: 1
        }
      }
    ]

    for (const testCase of testCases) {
      await this.runNodeTest('oneInchSwap', executor, testCase)
    }
  }

  private async testPriceImpactCalculator() {
    console.log('\n📊 Testing Price Impact Calculator Node...')
    
    const executor = new PriceImpactCalculatorExecutor()
    const testCases = [
      {
        name: 'Small Trade Impact',
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
        }
      },
      {
        name: 'Large Trade Impact',
        inputs: {
          from_token: 'ETH',
          to_token: 'USDC',
          amount: '100.0',
          chain_id: '1'
        }
      }
    ]

    for (const testCase of testCases) {
      await this.runNodeTest('priceImpactCalculator', executor, testCase)
    }
  }

  private async testTransactionMonitor() {
    console.log('\n📡 Testing Transaction Monitor Node...')
    
    const executor = new TransactionMonitorExecutor()
    const testCases = [
      {
        name: 'Monitor Existing Transaction',
        inputs: {
          transaction_hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          chain_id: '1',
          config: {
            confirmationsRequired: 1,
            timeoutMinutes: 5,
            enableMEVDetection: true
          }
        }
      },
      {
        name: 'Invalid Transaction Hash',
        inputs: {
          transaction_hash: 'invalid-hash',
          chain_id: '1'
        }
      }
    ]

    for (const testCase of testCases) {
      await this.runNodeTest('transactionMonitor', executor, testCase)
    }
  }

  private async runNodeTest(nodeType: string, executor: any, testCase: any) {
    const startTime = Date.now()
    try {
      await executor.validate(testCase.inputs)
      const result = await executor.execute(testCase.inputs, {
        workflowId: 'test',
        executionId: 'test',
        userId: 'test',
        environment: 'test' as const,
        startTime,
        variables: {},
        secrets: {}
      })

      this.results.push({
        nodeType,
        testName: testCase.name,
        success: result.success,
        executionTime: result.executionTime || (Date.now() - startTime),
        outputs: result.outputs,
        error: result.error,
        logs: result.logs
      })

      console.log(`   ${result.success ? '✅' : '❌'} ${testCase.name}: ${result.success ? 'PASSED' : 'FAILED'}`)
      if (result.error) console.log(`      Error: ${result.error}`)
      if (result.outputs && Object.keys(result.outputs).length > 0) {
        console.log(`      Outputs: ${JSON.stringify(result.outputs, null, 2).substring(0, 200)}...`)
      }

    } catch (validationError: any) {
      this.results.push({
        nodeType,
        testName: testCase.name,
        success: false,
        executionTime: Date.now() - startTime,
        error: validationError.message
      })
      console.log(`   ❌ ${testCase.name}: VALIDATION FAILED - ${validationError.message}`)
    }
  }

  async testCompleteWorkflows() {
    console.log('\n🔄 Testing Complete Workflow Execution\n')
    console.log('=' .repeat(80))

    // Test Basic Swap Application Template workflow
    await this.testBasicSwapWorkflow()
    
    // Test 1inch-Powered DeFi Suite workflow
    await this.test1inchDeFiSuiteWorkflow()
  }

  private async testBasicSwapWorkflow() {
    console.log('\n🔄 Testing Basic Swap Application Workflow...')

    const workflow = {
      id: 'basic-swap-test',
      name: 'Basic Swap Application Test',
      nodes: {
        'wallet-1': {
          type: 'walletConnector',
          inputs: {
            template_creation_mode: true,
            supported_wallets: ['metamask', 'walletconnect', 'coinbase'],
            supported_networks: [1, 137, 42161],
            default_network: 1
          }
        },
        'token-selector-1': {
          type: 'tokenSelector',
          inputs: {
            template_creation_mode: true,
            default_tokens: ['ETH', 'USDC', 'WBTC', 'DAI'],
            default_from_token: 'ETH',
            default_to_token: 'USDC',
            allow_custom_tokens: true
          },
          dependencies: ['wallet-1']
        },
        'price-impact-1': {
          type: 'priceImpactCalculator',
          inputs: {
            template_creation_mode: true,
            warning_threshold: 3,
            max_impact_threshold: 15,
            detailed_analysis: true
          },
          dependencies: ['token-selector-1']
        },
        'monitor-1': {
          type: 'transactionMonitor',
          inputs: {
            template_creation_mode: true,
            confirmations_required: 1,
            timeout_minutes: 5,
            enable_mev_detection: true
          },
          dependencies: ['price-impact-1']
        }
      }
    }

    await this.runWorkflowTest('Basic Swap Application', workflow)
  }

  private async test1inchDeFiSuiteWorkflow() {
    console.log('\n🏛️ Testing 1inch-Powered DeFi Suite Workflow...')

    const workflow = {
      id: '1inch-defi-suite-test',
      name: '1inch-Powered DeFi Suite Test',
      nodes: {
        'wallet-1': {
          type: 'walletConnector',
          inputs: {
            template_creation_mode: true,
            supported_wallets: ['metamask', 'walletconnect', 'coinbase', 'rainbow'],
            supported_networks: [1, 137, 42161, 10],
            default_network: 1
          }
        },
        'token-selector-1': {
          type: 'tokenSelector',
          inputs: {
            template_creation_mode: true,
            default_tokens: ['ETH', 'USDC', 'WBTC', 'DAI', '1INCH'],
            enabled_tokens: ['ETH', 'USDC', 'WBTC', 'DAI', 'USDT', '1INCH', 'LINK', 'UNI', 'AAVE'],
            default_from_token: 'ETH',
            default_to_token: 'USDC',
            allow_custom_tokens: true
          },
          dependencies: ['wallet-1']
        },
        'price-impact-1': {
          type: 'priceImpactCalculator',
          inputs: {
            template_creation_mode: true,
            warning_threshold: 3,
            max_impact_threshold: 15,
            detailed_analysis: true,
            show_route_analysis: true
          },
          dependencies: ['token-selector-1']
        }
      }
    }

    // Add 1inch swap if API key is available
    if (process.env.ONEINCH_API_KEY) {
      (workflow.nodes as any)['oneinch-swap-1'] = {
        type: 'oneInchSwap',
        inputs: {
          template_creation_mode: true,
          api_integration: '1inch',
          swap_types: ['classic', 'fusion', 'limit_order'],
          mev_protection: true
        },
        dependencies: ['price-impact-1']
      }
    }

    await this.runWorkflowTest('1inch-Powered DeFi Suite', workflow)
  }

  private async runWorkflowTest(workflowName: string, workflow: any) {
    const startTime = Date.now()
    
    try {
      console.log(`\n   ▶️  Executing ${workflowName} workflow...`)
      
      const result = await this.engine.executeWorkflow(workflow, {
        workflowId: workflow.id,
        executionId: 'test-execution',
        userId: 'test-user',
        environment: 'test' as const,
        startTime,
        variables: {},
        secrets: {}
      })

      const executionTime = Date.now() - startTime
      
      if (result.success) {
        console.log(`   ✅ ${workflowName}: WORKFLOW COMPLETED`)
        console.log(`      Execution time: ${executionTime}ms`)
        console.log(`      Nodes executed: ${Object.keys(result.nodeResults).length}`)
        
        // Show results for each node
        Object.entries(result.nodeResults).forEach(([nodeId, nodeResult]: [string, any]) => {
          console.log(`      📦 ${nodeId}: ${nodeResult.success ? '✅' : '❌'} ${nodeResult.success ? 'Success' : 'Failed'}`)
          if (!nodeResult.success && nodeResult.error) {
            console.log(`         Error: ${nodeResult.error}`)
          }
        })
      } else {
        console.log(`   ❌ ${workflowName}: WORKFLOW FAILED`)
        console.log(`      Error: ${result.error}`)
      }

      this.results.push({
        nodeType: 'workflow',
        testName: workflowName,
        success: result.success,
        executionTime,
        outputs: result.nodeResults,
        error: result.error
      })

    } catch (error: any) {
      console.log(`   ❌ ${workflowName}: EXECUTION ERROR`)
      console.log(`      Error: ${error.message}`)
      
      this.results.push({
        nodeType: 'workflow',
        testName: workflowName,
        success: false,
        executionTime: Date.now() - startTime,
        error: error.message
      })
    }
  }

  private printTestSummary() {
    console.log('\n📊 Test Results Summary')
    console.log('=' .repeat(80))
    
    const totalTests = this.results.length
    const passedTests = this.results.filter(r => r.success).length
    const failedTests = totalTests - passedTests
    
    console.log(`Total Tests: ${totalTests}`)
    console.log(`✅ Passed: ${passedTests}`)
    console.log(`❌ Failed: ${failedTests}`)
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
    
    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:')
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`   ${r.nodeType}/${r.testName}: ${r.error}`)
        })
    }

    // Performance summary
    console.log('\n⚡ Performance Summary:')
    const avgExecutionTime = this.results.reduce((sum, r) => sum + r.executionTime, 0) / totalTests
    console.log(`Average execution time: ${avgExecutionTime.toFixed(2)}ms`)
    
    const nodePerformance = this.results
      .filter(r => r.success && r.nodeType !== 'workflow')
      .reduce((acc, r) => {
        if (!acc[r.nodeType]) acc[r.nodeType] = []
        acc[r.nodeType].push(r.executionTime)
        return acc
      }, {} as Record<string, number[]>)

    Object.entries(nodePerformance).forEach(([nodeType, times]) => {
      const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length
      console.log(`   ${nodeType}: ${avgTime.toFixed(2)}ms average`)
    })
  }

  exportResults() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.results.length,
        passed: this.results.filter(r => r.success).length,
        failed: this.results.filter(r => !r.success).length,
        successRate: (this.results.filter(r => r.success).length / this.results.length) * 100
      },
      results: this.results
    }

    require('fs').writeFileSync('test-results.json', JSON.stringify(report, null, 2))
    console.log('\n💾 Test results exported to test-results.json')
  }
}

// Main execution
async function main() {
  const tester = new NodeTester()
  
  console.log('🚀 Unite DeFi - Executable Node Testing Suite')
  console.log('Testing both "Basic Swap Application" and "1inch-Powered DeFi Suite" templates\n')

  try {
    // Test individual nodes
    await tester.testIndividualNodes()
    
    // Test complete workflows
    await tester.testCompleteWorkflows()
    
    // Export results
    tester.exportResults()
    
    console.log('\n🎉 All tests completed!')
    
  } catch (error) {
    console.error('❌ Test suite failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { NodeTester }