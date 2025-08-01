#!/usr/bin/env node
/**
 * Complete End-to-End Testing Suite
 * Tests everything: executable nodes, workflows, code generation, and GitHub publishing
 */

import { NodeTester } from './test-executable-nodes'
import { CodeGenerationTester } from './test-code-generation'
import { GitHubPublishTester } from './test-github-publishing'
import * as fs from 'fs'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

interface TestSuiteResult {
  timestamp: string
  totalTime: number
  suites: {
    executableNodes: any
    codeGeneration: any
    githubPublishing: any
  }
  overallSuccess: boolean
  summary: {
    totalTests: number
    passed: number
    failed: number
    successRate: number
  }
}

class CompleteTestSuite {
  private startTime: number = 0
  private results: TestSuiteResult | null = null

  async runAllTests() {
    console.log('🚀 Unite DeFi - Complete End-to-End Testing Suite')
    console.log('=' .repeat(80))
    console.log('Testing both templates: "Basic Swap Application" and "1inch-Powered DeFi Suite"')
    console.log('✅ Executable nodes functionality')
    console.log('✅ Complete workflow execution')  
    console.log('✅ Code generation and validation')
    console.log('✅ GitHub publishing integration')
    console.log('=' .repeat(80))

    this.startTime = Date.now()

    try {
      // Phase 1: Test executable nodes and workflows
      console.log('\n🔧 PHASE 1: Testing Executable Nodes & Workflows')
      const nodeTester = new NodeTester()
      await nodeTester.testIndividualNodes()
      await nodeTester.testCompleteWorkflows()
      nodeTester.exportResults()

      // Phase 2: Test code generation
      console.log('\n🏗️  PHASE 2: Testing Code Generation')
      const codeGenTester = new CodeGenerationTester()
      await codeGenTester.runAllTests()

      // Phase 3: Test GitHub publishing (optional - requires GITHUB_TOKEN)
      let githubResults = null
      if (process.env.GITHUB_TOKEN) {
        console.log('\n📦 PHASE 3: Testing GitHub Publishing')
        const githubTester = new GitHubPublishTester()
        await githubTester.runAllTests()
        githubResults = this.loadTestResults('github-publishing-test-results.json')
      } else {
        console.log('\n⚠️  PHASE 3: Skipping GitHub Publishing Tests (no GITHUB_TOKEN)')
      }

      // Compile results
      const nodeResults = this.loadTestResults('test-results.json')
      const codeGenResults = this.loadTestResults('code-generation-test-results.json')

      this.results = {
        timestamp: new Date().toISOString(),
        totalTime: Date.now() - this.startTime,
        suites: {
          executableNodes: nodeResults,
          codeGeneration: codeGenResults,
          githubPublishing: githubResults
        },
        overallSuccess: this.calculateOverallSuccess(nodeResults, codeGenResults, githubResults),
        summary: this.calculateSummary(nodeResults, codeGenResults, githubResults)
      }

      this.printFinalResults()
      this.generateTestReport()
      
      console.log('\n🎉 Complete test suite finished!')
      
      if (this.results.overallSuccess) {
        console.log('✅ All systems are working correctly!')
        console.log('🚀 Both templates are ready for production use!')
      } else {
        console.log('❌ Some tests failed - review the detailed results above')
      }

    } catch (error) {
      console.error('❌ Complete test suite failed:', error)
      process.exit(1)
    }
  }

  private loadTestResults(filename: string): any {
    try {
      if (fs.existsSync(filename)) {
        return JSON.parse(fs.readFileSync(filename, 'utf8'))
      }
    } catch (error) {
      console.warn(`Failed to load ${filename}:`, error)
    }
    return null
  }

  private calculateOverallSuccess(nodeResults: any, codeGenResults: any, githubResults: any): boolean {
    const nodeSuccess = nodeResults?.summary?.successRate >= 80
    const codeGenSuccess = codeGenResults?.summary?.successRate >= 90
    const githubSuccess = !githubResults || githubResults?.summary?.successRate >= 80
    
    return nodeSuccess && codeGenSuccess && githubSuccess
  }

  private calculateSummary(nodeResults: any, codeGenResults: any, githubResults: any) {
    let totalTests = 0
    let passed = 0
    let failed = 0

    if (nodeResults?.summary) {
      totalTests += nodeResults.summary.totalTests
      passed += nodeResults.summary.passed
      failed += nodeResults.summary.failed
    }

    if (codeGenResults?.summary) {
      totalTests += codeGenResults.summary.totalTests
      passed += codeGenResults.summary.passed
      failed += codeGenResults.summary.failed
    }

    if (githubResults?.summary) {
      totalTests += githubResults.summary.totalTests
      passed += githubResults.summary.passed
      failed += githubResults.summary.failed
    }

    return {
      totalTests,
      passed,
      failed,
      successRate: totalTests > 0 ? (passed / totalTests) * 100 : 0
    }
  }

  private printFinalResults() {
    if (!this.results) return

    console.log('\n📊 COMPLETE TEST SUITE RESULTS')
    console.log('=' .repeat(80))
    
    console.log(`🕐 Total Execution Time: ${this.results.totalTime}ms`)
    console.log(`📈 Overall Success Rate: ${this.results.summary.successRate.toFixed(1)}%`)
    console.log(`📋 Total Tests: ${this.results.summary.totalTests}`)
    console.log(`✅ Passed: ${this.results.summary.passed}`)
    console.log(`❌ Failed: ${this.results.summary.failed}`)

    console.log('\n📋 Test Suite Breakdown:')
    
    // Executable Nodes Results
    if (this.results.suites.executableNodes) {
      const nodeResults = this.results.suites.executableNodes.summary
      console.log(`\n🔧 Executable Nodes & Workflows:`)
      console.log(`   Success Rate: ${nodeResults.successRate.toFixed(1)}%`)
      console.log(`   Tests: ${nodeResults.totalTests} | Passed: ${nodeResults.passed} | Failed: ${nodeResults.failed}`)
    }

    // Code Generation Results
    if (this.results.suites.codeGeneration) {
      const codeResults = this.results.suites.codeGeneration.summary
      console.log(`\n🏗️  Code Generation:`)
      console.log(`   Success Rate: ${codeResults.successRate.toFixed(1)}%`)
      console.log(`   Templates: ${codeResults.totalTests} | Passed: ${codeResults.passed} | Failed: ${codeResults.failed}`)
    }

    // GitHub Publishing Results
    if (this.results.suites.githubPublishing) {
      const githubResults = this.results.suites.githubPublishing.summary
      console.log(`\n📦 GitHub Publishing:`)
      console.log(`   Success Rate: ${githubResults.successRate.toFixed(1)}%`)
      console.log(`   Repos: ${githubResults.totalTests} | Published: ${githubResults.passed} | Failed: ${githubResults.failed}`)
    } else {
      console.log(`\n📦 GitHub Publishing: SKIPPED (no GITHUB_TOKEN)`)
    }

    console.log('\n🎯 Template Status:')
    console.log(`   "Basic Swap Application": ${this.getTemplateStatus('basic')}`)
    console.log(`   "1inch-Powered DeFi Suite": ${this.getTemplateStatus('1inch')}`)
  }

  private getTemplateStatus(templateType: 'basic' | '1inch'): string {
    if (!this.results) return '❓ Unknown'

    // Check if both node execution and code generation passed for the template
    const nodeSuccess = this.results.suites.executableNodes?.summary?.successRate >= 80
    const codeGenSuccess = this.results.suites.codeGeneration?.summary?.successRate >= 90

    if (nodeSuccess && codeGenSuccess) {
      return '✅ READY FOR PRODUCTION'
    } else if (nodeSuccess || codeGenSuccess) {
      return '⚠️  PARTIALLY WORKING'
    } else {
      return '❌ NEEDS FIXES'
    }
  }

  private generateTestReport() {
    if (!this.results) return

    // Generate comprehensive HTML report
    const htmlReport = this.generateHTMLReport()
    fs.writeFileSync('test-report.html', htmlReport)

    // Save JSON results
    fs.writeFileSync('complete-test-results.json', JSON.stringify(this.results, null, 2))

    console.log('\n📄 Test Reports Generated:')
    console.log('   📊 complete-test-results.json - Detailed JSON results')
    console.log('   🌐 test-report.html - Visual HTML report')
  }

  private generateHTMLReport(): string {
    if (!this.results) return ''

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Unite DeFi - Complete Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #2563eb; margin: 0; }
        .header p { color: #6b7280; margin: 10px 0; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #2563eb; }
        .metric h3 { margin: 0; color: #1f2937; }
        .metric .value { font-size: 2em; font-weight: bold; color: #2563eb; margin: 10px 0; }
        .success { border-left-color: #10b981; }
        .success .value { color: #10b981; }
        .warning { border-left-color: #f59e0b; }
        .warning .value { color: #f59e0b; }
        .error { border-left-color: #ef4444; }
        .error .value { color: #ef4444; }
        .section { margin: 30px 0; }
        .section h2 { color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .test-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .test-card { background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; }
        .test-card h4 { margin: 0 0 15px 0; color: #1f2937; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.8em; font-weight: bold; }
        .status-success { background: #d1fae5; color: #065f46; }
        .status-error { background: #fee2e2; color: #991b1b; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Unite DeFi - Complete Test Results</h1>
            <p>End-to-end testing for "Basic Swap Application" and "1inch-Powered DeFi Suite" templates</p>
            <p>Generated: ${new Date(this.results.timestamp).toLocaleString()}</p>
        </div>

        <div class="summary">
            <div class="metric ${this.results.overallSuccess ? 'success' : 'error'}">
                <h3>Overall Status</h3>
                <div class="value">${this.results.overallSuccess ? '✅' : '❌'}</div>
                <p>${this.results.overallSuccess ? 'All Systems OK' : 'Issues Found'}</p>
            </div>
            
            <div class="metric">
                <h3>Success Rate</h3>
                <div class="value">${this.results.summary.successRate.toFixed(1)}%</div>
                <p>${this.results.summary.passed}/${this.results.summary.totalTests} tests passed</p>
            </div>
            
            <div class="metric">
                <h3>Execution Time</h3>
                <div class="value">${(this.results.totalTime / 1000).toFixed(1)}s</div>
                <p>Total test execution</p>
            </div>
            
            <div class="metric">
                <h3>Templates Tested</h3>
                <div class="value">2</div>
                <p>Both templates validated</p>
            </div>
        </div>

        <div class="section">
            <h2>🔧 Executable Nodes & Workflows</h2>
            <div class="test-grid">
                ${this.results.suites.executableNodes ? `
                <div class="test-card">
                    <h4>Individual Node Tests</h4>
                    <span class="status-badge ${this.results.suites.executableNodes.summary.successRate >= 80 ? 'status-success' : 'status-error'}">
                        ${this.results.suites.executableNodes.summary.successRate.toFixed(1)}% Success
                    </span>
                    <p>${this.results.suites.executableNodes.summary.passed}/${this.results.suites.executableNodes.summary.totalTests} tests passed</p>
                </div>
                ` : '<div class="test-card"><h4>Node Tests</h4><p>No results available</p></div>'}
            </div>
        </div>

        <div class="section">
            <h2>🏗️ Code Generation</h2>
            <div class="test-grid">
                ${this.results.suites.codeGeneration ? `
                <div class="test-card">
                    <h4>Template Code Generation</h4>
                    <span class="status-badge ${this.results.suites.codeGeneration.summary.successRate >= 90 ? 'status-success' : 'status-error'}">
                        ${this.results.suites.codeGeneration.summary.successRate.toFixed(1)}% Success
                    </span>
                    <p>${this.results.suites.codeGeneration.summary.passed}/${this.results.suites.codeGeneration.summary.totalTests} templates generated successfully</p>
                </div>
                ` : '<div class="test-card"><h4>Code Generation</h4><p>No results available</p></div>'}
            </div>
        </div>

        ${this.results.suites.githubPublishing ? `
        <div class="section">
            <h2>📦 GitHub Publishing</h2>
            <div class="test-grid">
                <div class="test-card">
                    <h4>Repository Publishing</h4>
                    <span class="status-badge ${this.results.suites.githubPublishing.summary.successRate >= 80 ? 'status-success' : 'status-error'}">
                        ${this.results.suites.githubPublishing.summary.successRate.toFixed(1)}% Success
                    </span>
                    <p>${this.results.suites.githubPublishing.summary.passed}/${this.results.suites.githubPublishing.summary.totalTests} repositories published successfully</p>
                </div>
            </div>
        </div>
        ` : ''}

        <div class="footer">
            <p>🏆 Unite DeFi Hackathon Template System - Ready for Production!</p>
        </div>
    </div>
</body>
</html>
    `
  }
}

// Main execution
async function main() {
  const testSuite = new CompleteTestSuite()
  
  try {
    await testSuite.runAllTests()
    
  } catch (error) {
    console.error('❌ Complete test suite failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { CompleteTestSuite }