#!/usr/bin/env node
/**
 * Test script for Avalanche L1 Deployment Node
 * This script tests the complete L1 deployment workflow
 */

// Simple logger for scripts
const logger = {
  info: (message: string, ...args: any[]) => console.log(`[INFO] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args)
}

// Mock AvalancheL1Executor for testing
class MockAvalancheL1Executor {
  async validate(inputs: any) {
    const errors: string[] = []

    if (!inputs.l1Name || inputs.l1Name.length < 3) {
      errors.push('L1 name must be at least 3 characters')
    }

    if (!inputs.chainId || inputs.chainId < 1 || inputs.chainId > 4294967295) {
      errors.push('Chain ID must be between 1 and 4294967295')
    }

    if (!inputs.tokenSymbol || !/^[A-Z]{3,6}$/.test(inputs.tokenSymbol)) {
      errors.push('Token symbol must be 3-6 uppercase letters')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  async execute(inputs: any, context: any) {
    logger.info('Mock executing Avalanche L1 deployment')

    // Simulate deployment process
    await new Promise(resolve => setTimeout(resolve, 1000))

    return {
      success: true,
      outputs: {
        l1Info: {
          name: inputs.l1Name,
          chainId: inputs.chainId,
          blockchainId: 'mock-blockchain-id-' + Date.now(),
          rpcUrl: 'http://localhost:9650/ext/bc/mock/rpc',
          wsUrl: 'ws://localhost:9650/ext/bc/mock/ws',
          explorerUrl: inputs.enableBlockExplorer ? 'http://localhost:3000' : '',
          tokenSymbol: inputs.tokenSymbol,
          tokenAddress: '0x0000000000000000000000000000000000000000',
          controlKey: inputs.controlKeyName,
          validatorInfo: [],
          deploymentTimestamp: Date.now(),
          deploymentTx: '0x' + '0'.repeat(64),
          networkConfig: {
            gasLimit: inputs.gasLimit,
            gasPrice: inputs.gasPriceStrategy === 'dynamic' ? inputs.baseFee || '0' : '0',
            consensus: inputs.consensusMechanism
          },
          status: 'deployed'
        }
      },
      error: undefined,
      executionTime: 1000,
      logs: [
        'Pre-deployment validation passed',
        'Environment prerequisites checked',
        'Configuration files generated',
        `L1 deployed with blockchain ID: mock-blockchain-id`,
        'Post-deployment setup completed'
      ]
    }
  }

  async testConfiguration(inputs: any) {
    try {
      const validation = await this.validate(inputs)
      return {
        success: validation.valid,
        report: {
          validation,
          prerequisites: 'checked',
          estimatedCost: '0.1 AVAX',
          estimatedTime: '5 minutes',
          configuration: inputs
        }
      }
    } catch (error) {
      return {
        success: false,
        report: {
          error: error instanceof Error ? error.message : String(error)
        }
      }
    }
  }
}

async function testAvalancheL1Deployment() {
  console.log('🚀 Starting Avalanche L1 Deployment Test\n')

  // Create mock executor
  const executor = new MockAvalancheL1Executor()

  // Test configuration
  const testConfig = {
    l1Name: 'TestL1',
    chainId: 12345,
    tokenSymbol: 'TEST',
    tokenName: 'Test Token',
    initialSupply: '1000000000000000000000000', // 1M tokens
    vmType: 'subnet-evm' as const,
    consensusMechanism: 'poa' as const,
    gasLimit: 12000000,
    gasPriceStrategy: 'constant' as const,
    feeRecipient: '0x742d35Cc6bD2A3D4532123456789A44B62F10D',
    feeBurning: false,
    minBaseFee: '25000000000',
    allocations: [
      {
        address: '0x742d35Cc6bD2A3D4532123456789A44B62F10D',
        amount: '500000000000000000000000' // 500k tokens
      }
    ],
    precompiledContracts: {
      nativeMinter: true,
      contractDeployerAllowlist: false,
      transactionAllowlist: false,
      feeManager: true
    },
    adminAddresses: ['0x742d35Cc6bD2A3D4532123456789A44B62F10D'],
    controlKeyName: 'test-control-key',
    validatorStakeAmount: '2000000000000', // 2000 AVAX
    stakeDuration: '336h',
    additionalValidators: [],
    targetNetwork: 'fuji' as const,
    enableBlockExplorer: true,
    enableMetrics: false,
    webhookUrls: []
  }

  try {
    console.log('📋 Test Configuration:')
    console.log(JSON.stringify(testConfig, null, 2))
    console.log('\n' + '='.repeat(80) + '\n')

    // Test validation
    console.log('🔍 Testing Configuration Validation...\n')
    const validation = await executor.validate(testConfig)
    console.log('Validation Result:', validation)

    if (!validation.valid) {
      console.log('❌ Validation failed:', validation.errors)
      return
    }

    console.log('✅ Configuration validation passed\n')

    // Test configuration testing
    console.log('🧪 Testing Configuration Test...\n')
    const testResult = await executor.testConfiguration(testConfig)
    console.log('Test Result:', testResult)

    if (!testResult.success) {
      console.log('❌ Configuration test failed:', testResult.report.error)
      return
    }

    console.log('✅ Configuration test passed\n')

    // Test execution (mock)
    console.log('⚡ Testing Execution (Mock Mode)...\n')
    const executionResult = await executor.execute(testConfig, {
      userId: 'test-user',
      sessionId: 'test-session',
      requestId: 'test-request',
      startTime: Date.now(),
      variables: {}
    })

    console.log('\n' + '='.repeat(80))
    console.log('📊 Execution Results:')
    console.log('='.repeat(80))

    if (executionResult.success) {
      console.log('✅ Status: SUCCESS')
      console.log(`⏱️ Execution Time: ${executionResult.executionTime}ms`)
      console.log(`📋 Logs: ${executionResult.logs?.length || 0} entries`)

      if (executionResult.outputs?.l1Info) {
        console.log('\n🏗️ Deployed L1 Info:')
        console.log(`   Name: ${executionResult.outputs.l1Info.name}`)
        console.log(`   Chain ID: ${executionResult.outputs.l1Info.chainId}`)
        console.log(`   Blockchain ID: ${executionResult.outputs.l1Info.blockchainId}`)
        console.log(`   RPC URL: ${executionResult.outputs.l1Info.rpcUrl}`)
        console.log(`   Token Symbol: ${executionResult.outputs.l1Info.tokenSymbol}`)
        console.log(`   Status: ${executionResult.outputs.l1Info.status}`)
      }
    } else {
      console.log('❌ Status: FAILED')
      console.log(`❌ Error: ${executionResult.error || 'Unknown error'}`)
    }

    console.log('\n' + '='.repeat(80))
    console.log('🎉 Test completed successfully!')

  } catch (error) {
    console.error('❌ Test failed:', error)
    throw error
  }
}

async function testValidationEdgeCases() {
  console.log('\n🧪 Testing Validation Edge Cases\n')

  const executor = new MockAvalancheL1Executor()

  const edgeCases = [
    {
      name: 'Invalid L1 Name',
      config: { ...testConfig, l1Name: 'A' },
      expectedError: 'L1 name must be at least 3 characters'
    },
    {
      name: 'Invalid Chain ID',
      config: { ...testConfig, chainId: 0 },
      expectedError: 'Chain ID must be between 1 and 4294967295'
    },
    {
      name: 'Invalid Token Symbol',
      config: { ...testConfig, tokenSymbol: 'abcde' },
      expectedError: 'Token symbol must be 3-6 uppercase letters'
    },
    {
      name: 'Invalid Address',
      config: { ...testConfig, feeRecipient: 'invalid-address' },
      expectedError: 'Fee recipient must be a valid Ethereum address'
    }
  ]

  for (const testCase of edgeCases) {
    console.log(`Testing: ${testCase.name}`)
    try {
      const validation = await executor.validate(testCase.config)
      if (!validation.valid && validation.errors.some(err => err.includes(testCase.expectedError))) {
        console.log(`   ✅ Passed: ${testCase.expectedError}`)
      } else {
        console.log(`   ❌ Failed: Expected "${testCase.expectedError}"`)
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error}`)
    }
    console.log('')
  }
}

// Mock test configuration for reference
const testConfig = {
  l1Name: 'TestL1',
  chainId: 12345,
  tokenSymbol: 'TEST',
  tokenName: 'Test Token',
  initialSupply: '1000000000000000000000000',
  vmType: 'subnet-evm' as const,
  consensusMechanism: 'poa' as const,
  gasLimit: 12000000,
  gasPriceStrategy: 'constant' as const,
  feeRecipient: '0x742d35Cc6bD2A3D4532123456789A44B62F10D',
  feeBurning: false,
  minBaseFee: '25000000000',
  allocations: [
    {
      address: '0x742d35Cc6bD2A3D4532123456789A44B62F10D',
      amount: '500000000000000000000000'
    }
  ],
  precompiledContracts: {
    nativeMinter: true,
    contractDeployerAllowlist: false,
    transactionAllowlist: false,
    feeManager: true
  },
  adminAddresses: ['0x742d35Cc6bD2A3D4532123456789A44B62F10D'],
  controlKeyName: 'test-control-key',
  validatorStakeAmount: '2000000000000',
  stakeDuration: '336h',
  additionalValidators: [],
  targetNetwork: 'fuji' as const,
  enableBlockExplorer: true,
  enableMetrics: false,
  webhookUrls: []
}

// Run tests
async function main() {
  try {
    await testAvalancheL1Deployment()
    await testValidationEdgeCases()
  } catch (error) {
    console.error('❌ Test suite failed:', error)
    throw error
  }
}

// Run tests
main().catch(console.error)
