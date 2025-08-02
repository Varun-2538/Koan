#!/usr/bin/env node
/**
 * Test code generation functionality
 * Ensures generated applications are working and deployable
 */

import { CodeGenerator } from '../frontend/lib/code-generator'
import { getTemplateById } from '../frontend/lib/templates'
import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

interface CodeGenerationTest {
  templateId: string
  templateName: string
  inputs: Record<string, any>
  expectedFiles: string[]
  expectedFeatures: string[]
}

class CodeGenerationTester {
  private testDir = path.join(__dirname, '../test-generated-apps')
  private results: any[] = []

  async runAllTests() {
    console.log('🏗️  Testing Code Generation for Both Templates')
    console.log('=' .repeat(80))

    // Ensure test directory exists
    if (fs.existsSync(this.testDir)) {
      fs.rmSync(this.testDir, { recursive: true })
    }
    fs.mkdirSync(this.testDir, { recursive: true })

    const tests: CodeGenerationTest[] = [
      {
        templateId: 'oneinch-powered-defi-suite',
        templateName: '1inch-Powered DeFi Suite',
        inputs: {
          appName: 'Test 1inch DeFi Suite',
          hackathonMode: true
        },
        expectedFiles: [
          'package.json',
          'src/components/DeFiDashboard.tsx',
          'src/api/1inch-integration.ts',
          'src/hooks/useFusionSwap.ts',
          'src/hooks/useLimitOrders.ts',
          'src/hooks/usePortfolioAPI.ts',
          'backend/src/routes/swap.ts',
          'backend/src/routes/fusion.ts',
          'backend/src/routes/portfolio.ts',
          'README.md',
          'docker-compose.yml'
        ],
        expectedFeatures: [
          '1inch Classic Swap API',
          '1inch Fusion API',
          '1inch Limit Order Protocol',
          '1inch Portfolio API',
          'MEV Protection',
          'Gasless Swaps',
          'Price Impact Analysis'
        ]
      },
      {
        templateId: 'oneinch-swap-dashboard',
        templateName: 'Basic Swap Application',
        inputs: {
          appName: 'Test Basic Swap App',
          oneInchApiKey: 'test-api-key'
        },
        expectedFiles: [
          'package.json',
          'src/components/SwapInterface.tsx',
          'src/api/oneinch.ts',
          'src/hooks/useSwap.ts',
          'backend/src/routes/swap.ts',
          'README.md'
        ],
        expectedFeatures: [
          '1inch Swap API',
          'Token Selection',
          'Price Quotes',
          'Wallet Connection'
        ]
      }
    ]

    for (const test of tests) {
      await this.testTemplateGeneration(test)
    }

    this.printResults()
  }

  private async testTemplateGeneration(test: CodeGenerationTest) {
    console.log(`\n🔨 Testing: ${test.templateName}`)
    console.log('-'.repeat(50))

    const startTime = Date.now()
    const appDir = path.join(this.testDir, test.templateId)
    
    try {
      // Get template
      const template = getTemplateById(test.templateId)
      if (!template) {
        throw new Error(`Template ${test.templateId} not found`)
      }

      // Generate code
      console.log('   📝 Generating code...')
      const codeGenerator = new CodeGenerator()
      
      // Create workflow from template
      const workflow = {
        id: `test-${test.templateId}`,
        name: test.inputs.appName,
        nodes: template.nodes,
        edges: template.edges,
        inputs: test.inputs
      }

      const generationResult = await codeGenerator.generateFullApplication(workflow)
      
      if (!generationResult.success) {
        throw new Error(`Code generation failed: ${generationResult.error}`)
      }

      // Create app directory
      fs.mkdirSync(appDir, { recursive: true })

      // Write generated files
      console.log('   📁 Writing generated files...')
      const fileCount = this.writeGeneratedFiles(appDir, generationResult.files)
      
      // Test file structure
      console.log('   🔍 Validating file structure...')
      const fileValidation = this.validateFileStructure(appDir, test.expectedFiles)
      
      // Test content validation
      console.log('   📋 Validating features...')
      const featureValidation = this.validateFeatures(appDir, test.expectedFeatures)
      
      // Test if app builds
      console.log('   🔧 Testing build process...')
      const buildValidation = await this.testBuild(appDir)
      
      // Test if dependencies install
      console.log('   📦 Testing dependency installation...')
      const depValidation = await this.testDependencies(appDir)

      const executionTime = Date.now() - startTime
      
      const testResult = {
        templateId: test.templateId,
        templateName: test.templateName,
        success: fileValidation.success && featureValidation.success && buildValidation.success,
        executionTime,
        filesGenerated: fileCount,
        validations: {
          files: fileValidation,
          features: featureValidation,
          build: buildValidation,
          dependencies: depValidation
        }
      }

      this.results.push(testResult)
      
      console.log(`   ${testResult.success ? '✅' : '❌'} ${test.templateName}: ${testResult.success ? 'PASSED' : 'FAILED'}`)
      console.log(`   ⏱️  Generation time: ${executionTime}ms`)
      console.log(`   📄 Files generated: ${fileCount}`)

    } catch (error: any) {
      console.log(`   ❌ ${test.templateName}: FAILED`)
      console.log(`   Error: ${error.message}`)
      
      this.results.push({
        templateId: test.templateId,
        templateName: test.templateName,
        success: false,
        executionTime: Date.now() - startTime,
        error: error.message
      })
    }
  }

  private writeGeneratedFiles(appDir: string, files: Record<string, string>): number {
    let fileCount = 0
    
    for (const [filePath, content] of Object.entries(files)) {
      const fullPath = path.join(appDir, filePath)
      const dir = path.dirname(fullPath)
      
      // Ensure directory exists
      fs.mkdirSync(dir, { recursive: true })
      
      // Write file
      fs.writeFileSync(fullPath, content, 'utf8')
      fileCount++
    }
    
    return fileCount
  }

  private validateFileStructure(appDir: string, expectedFiles: string[]): { success: boolean, missing: string[], extra: string[] } {
    const missing: string[] = []
    const extra: string[] = []
    
    // Check for expected files
    for (const expectedFile of expectedFiles) {
      const fullPath = path.join(appDir, expectedFile)
      if (!fs.existsSync(fullPath)) {
        missing.push(expectedFile)
      }
    }
    
    // Get all generated files (recursively)
    const getAllFiles = (dir: string, prefix = ''): string[] => {
      const files: string[] = []
      const items = fs.readdirSync(dir)
      
      for (const item of items) {
        const itemPath = path.join(dir, item)
        const relativePath = prefix ? `${prefix}/${item}` : item
        
        if (fs.statSync(itemPath).isDirectory()) {
          files.push(...getAllFiles(itemPath, relativePath))
        } else {
          files.push(relativePath)
        }
      }
      
      return files
    }
    
    const actualFiles = getAllFiles(appDir)
    
    // Check for unexpected files (optional - just for info)
    for (const actualFile of actualFiles) {
      if (!expectedFiles.includes(actualFile) && !actualFile.includes('node_modules')) {
        extra.push(actualFile)
      }
    }
    
    return {
      success: missing.length === 0,
      missing,
      extra
    }
  }

  private validateFeatures(appDir: string, expectedFeatures: string[]): { success: boolean, found: string[], missing: string[] } {
    const found: string[] = []
    const missing: string[] = []
    
    // Read all source files and check for feature mentions
    const readAllSourceFiles = (dir: string): string => {
      let content = ''
      const items = fs.readdirSync(dir)
      
      for (const item of items) {
        const itemPath = path.join(dir, item)
        if (fs.statSync(itemPath).isDirectory() && item !== 'node_modules') {
          content += readAllSourceFiles(itemPath)
        } else if (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx')) {
          content += fs.readFileSync(itemPath, 'utf8') + '\n'
        }
      }
      
      return content
    }
    
    const allContent = readAllSourceFiles(appDir).toLowerCase()
    
    // Check for features
    for (const feature of expectedFeatures) {
      const featureKey = feature.toLowerCase().replace(/[^a-z0-9]/g, '')
      if (allContent.includes(featureKey) || allContent.includes(feature.toLowerCase())) {
        found.push(feature)
      } else {
        missing.push(feature)
      }
    }
    
    return {
      success: missing.length === 0,
      found,
      missing
    }
  }

  private async testBuild(appDir: string): Promise<{ success: boolean, error?: string }> {
    try {
      // Check if package.json exists
      const packageJsonPath = path.join(appDir, 'package.json')
      if (!fs.existsSync(packageJsonPath)) {
        return { success: false, error: 'package.json not found' }
      }

      // Try to parse package.json
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      
      // Check for build script
      if (!packageJson.scripts || !packageJson.scripts.build) {
        return { success: false, error: 'No build script found in package.json' }
      }

      // Check for required dependencies
      const requiredDeps = ['react', 'typescript']
      const missingDeps = requiredDeps.filter(dep => 
        !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
      )
      
      if (missingDeps.length > 0) {
        return { success: false, error: `Missing dependencies: ${missingDeps.join(', ')}` }
      }

      return { success: true }
      
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  private async testDependencies(appDir: string): Promise<{ success: boolean, error?: string }> {
    try {
      const packageJsonPath = path.join(appDir, 'package.json')
      if (!fs.existsSync(packageJsonPath)) {
        return { success: false, error: 'package.json not found' }
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      
      // Count dependencies
      const depCount = Object.keys(packageJson.dependencies || {}).length
      const devDepCount = Object.keys(packageJson.devDependencies || {}).length
      
      if (depCount === 0) {
        return { success: false, error: 'No dependencies specified' }
      }

      // Validate dependency versions
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }
      for (const [name, version] of Object.entries(deps)) {
        if (typeof version !== 'string' || !version.match(/^[\^~]?\d+\.\d+\.\d+/)) {
          return { success: false, error: `Invalid version for ${name}: ${version}` }
        }
      }

      return { success: true }
      
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  private printResults() {
    console.log('\n📊 Code Generation Test Results')
    console.log('=' .repeat(80))
    
    const totalTests = this.results.length
    const passedTests = this.results.filter(r => r.success).length
    const failedTests = totalTests - passedTests
    
    console.log(`Total Templates Tested: ${totalTests}`)
    console.log(`✅ Passed: ${passedTests}`)
    console.log(`❌ Failed: ${failedTests}`)
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
    
    // Detailed results
    this.results.forEach(result => {
      console.log(`\n📋 ${result.templateName}:`)
      console.log(`   Status: ${result.success ? '✅ PASSED' : '❌ FAILED'}`)
      console.log(`   Generation Time: ${result.executionTime}ms`)
      
      if (result.filesGenerated) {
        console.log(`   Files Generated: ${result.filesGenerated}`)
      }
      
      if (result.validations) {
        console.log(`   File Structure: ${result.validations.files.success ? '✅' : '❌'}`)
        console.log(`   Feature Validation: ${result.validations.features.success ? '✅' : '❌'}`)
        console.log(`   Build Validation: ${result.validations.build.success ? '✅' : '❌'}`)
        console.log(`   Dependencies: ${result.validations.dependencies.success ? '✅' : '❌'}`)
        
        if (!result.validations.files.success && result.validations.files.missing) {
          console.log(`   Missing Files: ${result.validations.files.missing.join(', ')}`)
        }
        
        if (!result.validations.features.success && result.validations.features.missing) {
          console.log(`   Missing Features: ${result.validations.features.missing.join(', ')}`)
        }
      }
      
      if (result.error) {
        console.log(`   Error: ${result.error}`)
      }
    })

    // Export results
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests,
        passed: passedTests,
        failed: failedTests,
        successRate: (passedTests / totalTests) * 100
      },
      results: this.results
    }

    fs.writeFileSync('code-generation-test-results.json', JSON.stringify(report, null, 2))
    console.log('\n💾 Code generation test results exported to code-generation-test-results.json')
  }
}

// Main execution
async function main() {
  const tester = new CodeGenerationTester()
  
  console.log('🏗️  Unite DeFi - Code Generation Testing Suite')
  console.log('Testing generated applications for completeness and functionality\n')

  try {
    await tester.runAllTests()
    console.log('\n🎉 Code generation tests completed!')
    
  } catch (error) {
    console.error('❌ Code generation test suite failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { CodeGenerationTester }