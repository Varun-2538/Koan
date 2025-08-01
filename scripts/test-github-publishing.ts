#!/usr/bin/env node
/**
 * Test GitHub publishing functionality
 * Ensures code can be published to GitHub with proper structure
 */

import { Octokit } from '@octokit/rest'
import { CodeGenerator } from '../frontend/lib/code-generator'
import { getTemplateById } from '../frontend/lib/templates'
import * as fs from 'fs'
import * as path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

interface GitHubPublishTest {
  templateId: string
  templateName: string
  repoName: string
  inputs: Record<string, any>
}

class GitHubPublishTester {
  private octokit: Octokit
  private testRepos: string[] = []
  private results: any[] = []

  constructor() {
    if (!process.env.GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN environment variable is required for GitHub publishing tests')
    }

    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    })
  }

  async runAllTests() {
    console.log('🚀 Testing GitHub Publishing Functionality')
    console.log('=' .repeat(80))

    const tests: GitHubPublishTest[] = [
      {
        templateId: 'dex-aggregator-swap',
        templateName: '1inch-Powered DeFi Suite',
        repoName: `test-1inch-defi-suite-${Date.now()}`,
        inputs: {
          appName: 'Test 1inch DeFi Suite',
          hackathonMode: true
        }
      },
      {
        templateId: 'oneinch-swap-dashboard',
        templateName: 'Basic Swap Application',
        repoName: `test-basic-swap-${Date.now()}`,
        inputs: {
          appName: 'Test Basic Swap App'
        }
      }
    ]

    for (const test of tests) {
      await this.testGitHubPublishing(test)
    }

    await this.cleanup()
    this.printResults()
  }

  private async testGitHubPublishing(test: GitHubPublishTest) {
    console.log(`\n📦 Testing GitHub Publishing: ${test.templateName}`)
    console.log('-'.repeat(50))

    const startTime = Date.now()
    
    try {
      // Step 1: Generate code
      console.log('   📝 Generating application code...')
      const template = getTemplateById(test.templateId)
      if (!template) {
        throw new Error(`Template ${test.templateId} not found`)
      }

      const codeGenerator = new CodeGenerator()
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

      // Step 2: Create GitHub repository
      console.log('   🏗️  Creating GitHub repository...')
      const repo = await this.createRepository(test.repoName, test.templateName)
      this.testRepos.push(test.repoName)

      // Step 3: Upload files to repository
      console.log('   📤 Uploading files to GitHub...')
      await this.uploadFiles(test.repoName, generationResult.files)

      // Step 4: Validate repository structure
      console.log('   🔍 Validating repository structure...')
      const repoValidation = await this.validateRepository(test.repoName)

      // Step 5: Test README and documentation
      console.log('   📚 Validating documentation...')
      const docValidation = await this.validateDocumentation(test.repoName)

      // Step 6: Test if repository is accessible
      console.log('   🌐 Testing repository accessibility...')
      const accessValidation = await this.validateAccess(test.repoName)

      const executionTime = Date.now() - startTime
      
      const testResult = {
        templateId: test.templateId,
        templateName: test.templateName,
        repoName: test.repoName,
        repoUrl: `https://github.com/${process.env.GITHUB_USERNAME || 'test-user'}/${test.repoName}`,
        success: repoValidation.success && docValidation.success && accessValidation.success,
        executionTime,
        validations: {
          repository: repoValidation,
          documentation: docValidation,
          access: accessValidation
        }
      }

      this.results.push(testResult)
      
      console.log(`   ${testResult.success ? '✅' : '❌'} ${test.templateName}: ${testResult.success ? 'PUBLISHED' : 'FAILED'}`)
      console.log(`   ⏱️  Publishing time: ${executionTime}ms`)
      console.log(`   🔗 Repository: ${testResult.repoUrl}`)

    } catch (error: any) {
      console.log(`   ❌ ${test.templateName}: PUBLISHING FAILED`)
      console.log(`   Error: ${error.message}`)
      
      this.results.push({
        templateId: test.templateId,
        templateName: test.templateName,
        repoName: test.repoName,
        success: false,
        executionTime: Date.now() - startTime,
        error: error.message
      })
    }
  }

  private async createRepository(repoName: string, description: string) {
    try {
      const response = await this.octokit.repos.createForAuthenticatedUser({
        name: repoName,
        description: `${description} - Generated by Unite DeFi Template System`,
        private: false,
        auto_init: true
      })

      return response.data
    } catch (error: any) {
      if (error.status === 422) {
        throw new Error(`Repository ${repoName} already exists`)
      }
      throw new Error(`Failed to create repository: ${error.message}`)
    }
  }

  private async uploadFiles(repoName: string, files: Record<string, string>) {
    const owner = process.env.GITHUB_USERNAME || 'test-user'
    const uploadPromises: Promise<any>[] = []

    for (const [filePath, content] of Object.entries(files)) {
      // Skip empty files or directories
      if (!content.trim()) continue

      const uploadPromise = this.octokit.repos.createOrUpdateFileContents({
        owner,
        repo: repoName,
        path: filePath,
        message: `Add ${filePath}`,
        content: Buffer.from(content, 'utf8').toString('base64')
      }).catch(error => {
        console.warn(`Failed to upload ${filePath}: ${error.message}`)
        return null
      })

      uploadPromises.push(uploadPromise)

      // Batch uploads to avoid rate limiting
      if (uploadPromises.length >= 10) {
        await Promise.all(uploadPromises)
        uploadPromises.length = 0
        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Upload remaining files
    if (uploadPromises.length > 0) {
      await Promise.all(uploadPromises)
    }
  }

  private async validateRepository(repoName: string): Promise<{ success: boolean, error?: string, stats?: any }> {
    try {
      const owner = process.env.GITHUB_USERNAME || 'test-user'
      
      // Get repository info
      const repo = await this.octokit.repos.get({
        owner,
        repo: repoName
      })

      // Get repository contents
      const contents = await this.octokit.repos.getContent({
        owner,
        repo: repoName,
        path: ''
      })

      const stats = {
        size: repo.data.size,
        fileCount: Array.isArray(contents.data) ? contents.data.length : 1,
        hasReadme: Array.isArray(contents.data) ? 
          contents.data.some((file: any) => file.name.toLowerCase() === 'readme.md') : 
          false,
        hasPackageJson: Array.isArray(contents.data) ? 
          contents.data.some((file: any) => file.name === 'package.json') : 
          false
      }

      return {
        success: stats.fileCount > 5 && stats.hasReadme && stats.hasPackageJson,
        stats
      }

    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  private async validateDocumentation(repoName: string): Promise<{ success: boolean, error?: string, readmeLength?: number }> {
    try {
      const owner = process.env.GITHUB_USERNAME || 'test-user'
      
      // Get README content
      const readme = await this.octokit.repos.getContent({
        owner,
        repo: repoName,
        path: 'README.md'
      })

      if ('content' in readme.data) {
        const content = Buffer.from(readme.data.content, 'base64').toString('utf8')
        const requiredSections = [
          '# ',  // Title
          '## ', // At least one section
          'install', // Installation instructions
          'run', // Run instructions
          '1inch' // Should mention 1inch
        ]

        const hasRequiredSections = requiredSections.every(section => 
          content.toLowerCase().includes(section.toLowerCase())
        )

        return {
          success: hasRequiredSections && content.length > 500,
          readmeLength: content.length
        }
      }

      return {
        success: false,
        error: 'README.md not found or empty'
      }

    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  private async validateAccess(repoName: string): Promise<{ success: boolean, error?: string }> {
    try {
      const owner = process.env.GITHUB_USERNAME || 'test-user'
      
      // Try to access repository via public API (without auth)
      const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}`)
      
      if (response.ok) {
        const repoData = await response.json()
        return {
          success: !repoData.private && repoData.visibility === 'public'
        }
      }

      return {
        success: false,
        error: `Repository not accessible: ${response.status}`
      }

    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  private async cleanup() {
    console.log('\n🧹 Cleaning up test repositories...')
    
    const owner = process.env.GITHUB_USERNAME || 'test-user'
    
    for (const repoName of this.testRepos) {
      try {
        await this.octokit.repos.delete({
          owner,
          repo: repoName
        })
        console.log(`   🗑️  Deleted test repository: ${repoName}`)
      } catch (error: any) {
        console.warn(`   ⚠️  Failed to delete ${repoName}: ${error.message}`)
      }
    }
  }

  private printResults() {
    console.log('\n📊 GitHub Publishing Test Results')
    console.log('=' .repeat(80))
    
    const totalTests = this.results.length
    const passedTests = this.results.filter(r => r.success).length
    const failedTests = totalTests - passedTests
    
    console.log(`Total Templates Tested: ${totalTests}`)
    console.log(`✅ Successfully Published: ${passedTests}`)
    console.log(`❌ Failed to Publish: ${failedTests}`)
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
    
    // Detailed results
    this.results.forEach(result => {
      console.log(`\n📦 ${result.templateName}:`)
      console.log(`   Status: ${result.success ? '✅ PUBLISHED' : '❌ FAILED'}`)
      console.log(`   Publishing Time: ${result.executionTime}ms`)
      
      if (result.repoUrl) {
        console.log(`   Repository URL: ${result.repoUrl}`)
      }
      
      if (result.validations) {
        console.log(`   Repository Structure: ${result.validations.repository.success ? '✅' : '❌'}`)
        console.log(`   Documentation: ${result.validations.documentation.success ? '✅' : '❌'}`)
        console.log(`   Public Access: ${result.validations.access.success ? '✅' : '❌'}`)
        
        if (result.validations.repository.stats) {
          const stats = result.validations.repository.stats
          console.log(`   Files: ${stats.fileCount}, Size: ${stats.size}KB`)
          console.log(`   README: ${stats.hasReadme ? '✅' : '❌'}, package.json: ${stats.hasPackageJson ? '✅' : '❌'}`)
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

    fs.writeFileSync('github-publishing-test-results.json', JSON.stringify(report, null, 2))
    console.log('\n💾 GitHub publishing test results exported to github-publishing-test-results.json')
  }
}

// Main execution
async function main() {
  if (!process.env.GITHUB_TOKEN) {
    console.error('❌ GITHUB_TOKEN environment variable is required')
    console.log('Please set GITHUB_TOKEN in your .env file or environment')
    process.exit(1)
  }

  const tester = new GitHubPublishTester()
  
  console.log('🚀 Unite DeFi - GitHub Publishing Testing Suite')
  console.log('Testing automated GitHub repository creation and code publishing\n')

  try {
    await tester.runAllTests()
    console.log('\n🎉 GitHub publishing tests completed!')
    
  } catch (error) {
    console.error('❌ GitHub publishing test suite failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { GitHubPublishTester }