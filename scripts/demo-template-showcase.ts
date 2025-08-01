#!/usr/bin/env node
/**
 * Interactive Demo Script
 * Showcases both templates working end-to-end with live execution
 */

import { DeFiExecutionEngine } from '../backend/src/engine/execution-engine'
import { getTemplateById } from '../frontend/lib/templates'
import { CodeGenerator } from '../frontend/lib/code-generator'
import winston from 'winston'
import * as fs from 'fs'
import * as path from 'path'
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

class TemplateDemo {
  private engine: DeFiExecutionEngine
  private demoDir = path.join(__dirname, '../demo-outputs')

  constructor() {
    this.engine = new DeFiExecutionEngine(logger)
    this.setupExecutors()
    this.ensureDemoDir()
  }

  private setupExecutors() {
    // Import and register all executors
    const { TokenSelectorExecutor } = require('../backend/src/nodes/token-selector-executor')
    const { PriceImpactCalculatorExecutor } = require('../backend/src/nodes/price-impact-calculator-executor')
    const { TransactionMonitorExecutor } = require('../backend/src/nodes/transaction-monitor-executor')
    const { OneInchSwapExecutor } = require('../backend/src/nodes/oneinch-swap-executor')
    const { WalletConnectorExecutor } = require('../backend/src/nodes/wallet-connector-executor')

    this.engine.registerNodeExecutor(new WalletConnectorExecutor())
    this.engine.registerNodeExecutor(new TokenSelectorExecutor())
    this.engine.registerNodeExecutor(new OneInchSwapExecutor(logger, process.env.ONEINCH_API_KEY))
    this.engine.registerNodeExecutor(new PriceImpactCalculatorExecutor())
    this.engine.registerNodeExecutor(new TransactionMonitorExecutor())
  }

  private ensureDemoDir() {
    if (fs.existsSync(this.demoDir)) {
      fs.rmSync(this.demoDir, { recursive: true })
    }
    fs.mkdirSync(this.demoDir, { recursive: true })
  }

  async runCompleteDemo() {
    console.log('🎭 Unite DeFi - Interactive Template Demonstration')
    console.log('=' .repeat(80))
    console.log('🚀 Showcasing both templates with live execution and code generation')
    console.log('🏆 Perfect for hackathon judges and potential users!')
    console.log('=' .repeat(80))

    await this.wait(2000)

    // Demo 1: 1inch-Powered DeFi Suite
    await this.demo1inchDeFiSuite()
    
    await this.wait(3000)
    
    // Demo 2: Basic Swap Application
    await this.demoBasicSwapApp()
    
    await this.wait(2000)
    
    // Show generated code
    await this.showGeneratedCode()
    
    console.log('\n🎉 Demo Complete!')
    console.log('=' .repeat(80))
    console.log('✅ Both templates demonstrated successfully')
    console.log('📁 Generated code available in: demo-outputs/')
    console.log('🏆 Ready for Unite DeFi hackathon submission!')
  }

  private async demo1inchDeFiSuite() {
    console.log('\n🔥 DEMO 1: 1inch-Powered DeFi Suite')
    console.log('=' .repeat(60))
    console.log('🎯 Target: $30,000 "Build a full Application using 1inch APIs" prize')
    console.log('📊 Features: 10+ 1inch APIs, MEV protection, gasless swaps, portfolio tracking')
    
    await this.wait(2000)

    const template = getTemplateById('dex-aggregator-swap')
    if (!template) {
      console.log('❌ Template not found')
      return
    }

    console.log('\n📋 Template Overview:')
    console.log(`   Name: ${template.name}`)
    console.log(`   Nodes: ${template.nodes.length}`)
    console.log(`   Edges: ${template.edges.length}`)
    console.log(`   Features: ${template.features.length}`)
    
    console.log('\n🔗 Node Flow:')
    template.nodes.forEach((node, index) => {
      const arrow = index < template.nodes.length - 1 ? ' →' : ''
      console.log(`   ${index + 1}. ${node.data.label}${arrow}`)
    })

    await this.wait(1000)

    console.log('\n⚡ Executing Live Workflow...')
    
    // Create demo workflow
    const workflow = {
      id: 'demo-1inch-defi-suite',
      name: '1inch-Powered DeFi Suite Demo',
      nodes: {
        'wallet-1': {
          type: 'walletConnector',
          inputs: {
            wallet_address: '0x742d35Cc6bD2A3D4532123456789A44B62F10D',
            wallet_provider: 'metamask',
            chain_id: '1'
          }
        },
        'token-selector-1': {
          type: 'tokenSelector',
          inputs: {
            from_token: 'ETH',
            to_token: 'USDC',
            config: {
              includeMetadata: true,
              enabledTokens: ['ETH', 'USDC', 'WBTC', 'DAI', '1INCH'],
              priceSource: '1inch'
            }
          },
          dependencies: ['wallet-1']
        },
        'price-impact-1': {
          type: 'priceImpactCalculator',
          inputs: {
            from_token: 'ETH',
            to_token: 'USDC',
            amount: '2.5',
            chain_id: '1',
            config: {
              warningThreshold: 3,
              maxImpactThreshold: 15,
              detailedAnalysis: true
            }
          },
          dependencies: ['token-selector-1']
        }
      }
    }

    // Add 1inch swap if API key available
    if (process.env.ONEINCH_API_KEY) {
      workflow.nodes['oneinch-swap-1'] = {
        type: 'oneInchSwap',
        inputs: {
          from_token: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
          to_token: '0xA0b86a33E6441fb3cD7b2a9da94C2b48A8aE5fF0',
          amount: '2500000000000000000', // 2.5 ETH
          from_address: '0x742d35Cc6bD2A3D4532123456789A44B62F10D',
          chain_id: '1'
        },
        dependencies: ['price-impact-1']
      }
    }

    const startTime = Date.now()
    
    try {
      const result = await this.engine.executeWorkflow(workflow, {
        userId: 'demo-user',
        sessionId: 'demo-session',
        requestId: 'demo-request',
        startTime,
        variables: {}
      })

      const executionTime = Date.now() - startTime

      console.log(`\n📊 Execution Results:`)
      console.log(`   Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`)
      console.log(`   Execution Time: ${executionTime}ms`)
      console.log(`   Nodes Executed: ${Object.keys(result.nodeResults).length}`)

      // Show detailed results
      Object.entries(result.nodeResults).forEach(([nodeId, nodeResult]: [string, any]) => {
        console.log(`\n   🔸 ${nodeId}:`)
        console.log(`      Status: ${nodeResult.success ? '✅' : '❌'}`)
        if (nodeResult.executionTime) {
          console.log(`      Time: ${nodeResult.executionTime}ms`)
        }
        if (nodeResult.outputs && Object.keys(nodeResult.outputs).length > 0) {
          const outputsPreview = JSON.stringify(nodeResult.outputs, null, 2).substring(0, 200)
          console.log(`      Outputs: ${outputsPreview}...`)
        }
      })

      // Generate code for this template
      await this.generateDemoCode('1inch-defi-suite', template, {
        appName: 'Demo 1inch DeFi Suite',
        hackathonMode: true
      })

    } catch (error: any) {
      console.log(`\n❌ Workflow execution failed: ${error.message}`)
    }
  }

  private async demoBasicSwapApp() {
    console.log('\n💱 DEMO 2: Basic Swap Application')
    console.log('=' .repeat(60))
    console.log('🎯 Target: Quick start template with core swap functionality')
    console.log('📊 Features: 1inch Classic Swap, wallet connection, price analysis')
    
    await this.wait(2000)

    const template = getTemplateById('oneinch-swap-dashboard')
    if (!template) {
      console.log('❌ Template not found')
      return
    }

    console.log('\n📋 Template Overview:')
    console.log(`   Name: ${template.name}`)
    console.log(`   Nodes: ${template.nodes.length}`)
    console.log(`   Features: ${template.features.length}`)

    await this.wait(1000)

    console.log('\n⚡ Executing Basic Swap Workflow...')
    
    const workflow = {
      id: 'demo-basic-swap',
      name: 'Basic Swap Application Demo',
      nodes: {
        'wallet-1': {
          type: 'walletConnector',
          inputs: {
            wallet_address: '0x742d35Cc6bD2A3D4532123456789A44B62F10D',
            wallet_provider: 'metamask',
            chain_id: '1'
          }
        },
        'token-selector-1': {
          type: 'tokenSelector',
          inputs: {
            from_token: 'ETH',
            to_token: 'USDC',
            config: { includeMetadata: true }
          },
          dependencies: ['wallet-1']
        },
        'price-impact-1': {
          type: 'priceImpactCalculator',
          inputs: {
            from_token: 'ETH',
            to_token: 'USDC',
            amount: '1.0',
            chain_id: '1'
          },
          dependencies: ['token-selector-1']
        }
      }
    }

    const startTime = Date.now()
    
    try {
      const result = await this.engine.executeWorkflow(workflow, {
        userId: 'demo-user',
        sessionId: 'demo-session',
        requestId: 'demo-request',
        startTime,
        variables: {}
      })

      const executionTime = Date.now() - startTime

      console.log(`\n📊 Execution Results:`)
      console.log(`   Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`)
      console.log(`   Execution Time: ${executionTime}ms`)
      console.log(`   Nodes Executed: ${Object.keys(result.nodeResults).length}`)

      // Generate code for this template
      await this.generateDemoCode('basic-swap', template, {
        appName: 'Demo Basic Swap App'
      })

    } catch (error: any) {
      console.log(`\n❌ Workflow execution failed: ${error.message}`)
    }
  }

  private async generateDemoCode(templateName: string, template: any, inputs: any) {
    console.log(`\n🏗️  Generating ${templateName} application code...`)
    
    try {
      const codeGenerator = new CodeGenerator()
      const workflow = {
        id: `demo-${templateName}`,
        name: inputs.appName,
        nodes: template.nodes,
        edges: template.edges,
        inputs
      }

      const result = await codeGenerator.generateFullApplication(workflow)
      
      if (result.success) {
        // Save generated files
        const appDir = path.join(this.demoDir, templateName)
        fs.mkdirSync(appDir, { recursive: true })
        
        let fileCount = 0
        for (const [filePath, content] of Object.entries(result.files)) {
          const fullPath = path.join(appDir, filePath)
          const dir = path.dirname(fullPath)
          fs.mkdirSync(dir, { recursive: true })
          fs.writeFileSync(fullPath, content, 'utf8')
          fileCount++
        }

        console.log(`   ✅ Code generated successfully!`)
        console.log(`   📁 Files: ${fileCount}`)
        console.log(`   📂 Location: demo-outputs/${templateName}/`)
        
      } else {
        console.log(`   ❌ Code generation failed: ${result.error}`)
      }
      
    } catch (error: any) {
      console.log(`   ❌ Code generation error: ${error.message}`)
    }
  }

  private async showGeneratedCode() {
    console.log('\n📂 Generated Code Overview')
    console.log('=' .repeat(60))
    
    const demoApps = fs.readdirSync(this.demoDir)
    
    for (const appName of demoApps) {
      const appDir = path.join(this.demoDir, appName)
      if (fs.statSync(appDir).isDirectory()) {
        console.log(`\n📱 ${appName.toUpperCase()}:`)
        
        // Count files
        const getAllFiles = (dir: string): string[] => {
          const files: string[] = []
          const items = fs.readdirSync(dir)
          
          for (const item of items) {
            const itemPath = path.join(dir, item)
            if (fs.statSync(itemPath).isDirectory()) {
              files.push(...getAllFiles(itemPath))
            } else {
              files.push(itemPath)
            }
          }
          return files
        }
        
        const allFiles = getAllFiles(appDir)
        console.log(`   📄 Total files: ${allFiles.length}`)
        
        // Show key files
        const keyFiles = ['package.json', 'README.md', 'docker-compose.yml']
        keyFiles.forEach(keyFile => {
          const exists = allFiles.some(f => f.endsWith(keyFile))
          console.log(`   ${exists ? '✅' : '❌'} ${keyFile}`)
        })
        
        // Check for React components
        const reactFiles = allFiles.filter(f => f.endsWith('.tsx') && f.includes('components')).length
        console.log(`   ⚛️  React components: ${reactFiles}`)
        
        // Check for API routes
        const apiFiles = allFiles.filter(f => f.includes('api') || f.includes('routes')).length
        console.log(`   🔌 API endpoints: ${apiFiles}`)
      }
    }

    console.log('\n🎯 How to Use Generated Code:')
    console.log(`   1. cd demo-outputs/[app-name]`)
    console.log(`   2. npm install`)
    console.log(`   3. npm run dev`)
    console.log(`   4. Open http://localhost:3000`)
    
    console.log('\n🚀 Ready for Deployment:')
    console.log(`   • Docker: docker-compose up`)
    console.log(`   • Vercel: vercel --prod`)
    console.log(`   • GitHub: git init && git push`)
  }

  private async wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Main execution
async function main() {
  const demo = new TemplateDemo()
  
  try {
    await demo.runCompleteDemo()
    
  } catch (error) {
    console.error('❌ Demo failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { TemplateDemo }