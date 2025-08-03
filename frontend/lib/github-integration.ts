// lib/github-integration.ts
import { createGitHubOAuth, type GitHubUser } from './github-oauth'
import type { CodeGenerationResult } from './oneinch-code-generator'

export interface GitHubPublishOptions {
  repositoryName: string
  description: string
  isPrivate?: boolean
  includeReadme?: boolean
  autoDeployVercel?: boolean
}

export interface GitHubPublishResult {
  success: boolean
  repository?: {
    name: string
    url: string
    clone_url: string
    html_url: string
  }
  error?: string
  deploymentUrl?: string
}

export class GitHubIntegrationService {
  private githubOAuth = createGitHubOAuth()

  /**
   * Check if user is authenticated with GitHub
   */
  isAuthenticated(): boolean {
    return this.githubOAuth.isAuthenticated()
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return this.githubOAuth.getStoredAccessToken()
  }

  /**
   * Get authenticated user information
   */
  async getUser(): Promise<GitHubUser | null> {
    const token = this.getAccessToken()
    if (!token) return null

    try {
      return await this.githubOAuth.getUser(token)
    } catch (error) {
      console.error('Failed to get user:', error)
      // Clear invalid token
      this.githubOAuth.clearAccessToken()
      return null
    }
  }

  /**
   * Initiate GitHub OAuth flow
   */
  async initiateAuth(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Generate and store state for security
      const state = Math.random().toString(36).substring(7)
      this.githubOAuth.storeState(state)
      
      // Open GitHub OAuth in popup
      const authUrl = this.githubOAuth.getAuthorizationUrl(state)
      const popup = window.open(
        authUrl,
        'github-oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      )

      // Listen for OAuth completion
      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return

        if (event.data.type === 'GITHUB_AUTH_SUCCESS') {
          popup?.close()
          window.removeEventListener('message', messageHandler)
          resolve()
        } else if (event.data.type === 'GITHUB_AUTH_ERROR') {
          popup?.close()
          window.removeEventListener('message', messageHandler)
          reject(new Error(event.data.error))
        }
      }

      window.addEventListener('message', messageHandler)

      // Handle popup closed manually
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed)
          window.removeEventListener('message', messageHandler)
          reject(new Error('OAuth flow was cancelled'))
        }
      }, 1000)
    })
  }

  /**
   * Disconnect from GitHub
   */
  disconnect(): void {
    this.githubOAuth.clearAccessToken()
  }

  /**
   * Publish project to GitHub
   */
  async publishProject(
    codeResult: CodeGenerationResult,
    options: GitHubPublishOptions
  ): Promise<GitHubPublishResult> {
    const token = this.getAccessToken()
    if (!token) {
      return {
        success: false,
        error: 'Not authenticated with GitHub. Please connect your account first.'
      }
    }

    try {
      // Get user info for repository creation
      const user = await this.getUser()
      if (!user) {
        return {
          success: false,
          error: 'Failed to get user information. Please reconnect to GitHub.'
        }
      }

      // Step 1: Create repository
      console.log('Creating GitHub repository:', options.repositoryName)
      const repository = await this.githubOAuth.createRepository(
        token,
        options.repositoryName,
        options.description,
        options.isPrivate || false
      )

      // Step 2: Prepare files for upload
      const filesToUpload = Object.entries(codeResult.files || {}).map(([path, content]) => ({
        path,
        content
      }))

      if (filesToUpload.length === 0) {
        return {
          success: false,
          error: 'No files to upload. Please generate code first.'
        }
      }

      // Step 3: Upload files to repository
      console.log(`Uploading ${filesToUpload.length} files to repository...`)
      await this.githubOAuth.uploadFiles(
        token,
        user.login,
        repository.name,
        filesToUpload,
        'Initial commit: DeFi application from Unite DeFi Platform'
      )

      // Step 4: Generate deployment URL if requested
      let deploymentUrl: string | undefined
      if (options.autoDeployVercel) {
        deploymentUrl = `https://vercel.com/new/git/external?repository-url=${repository.clone_url}`
      }

      return {
        success: true,
        repository: {
          name: repository.name,
          url: repository.html_url,
          clone_url: repository.clone_url,
          html_url: repository.html_url
        },
        deploymentUrl
      }

    } catch (error: any) {
      console.error('GitHub publish failed:', error)
      return {
        success: false,
        error: error.message || 'Failed to publish to GitHub'
      }
    }
  }

  /**
   * Validate repository name
   */
  validateRepositoryName(name: string): { valid: boolean; error?: string } {
    if (!name || name.trim().length === 0) {
      return { valid: false, error: 'Repository name is required' }
    }

    if (name.length > 100) {
      return { valid: false, error: 'Repository name must be 100 characters or less' }
    }

    // GitHub repository name restrictions
    const validNameRegex = /^[a-zA-Z0-9._-]+$/
    if (!validNameRegex.test(name)) {
      return { 
        valid: false, 
        error: 'Repository name can only contain alphanumeric characters, periods, hyphens, and underscores' 
      }
    }

    // Reserved names
    const reservedNames = ['con', 'prn', 'aux', 'nul', 'com1', 'com2', 'com3', 'com4', 'com5', 'com6', 'com7', 'com8', 'com9', 'lpt1', 'lpt2', 'lpt3', 'lpt4', 'lpt5', 'lpt6', 'lpt7', 'lpt8', 'lpt9']
    if (reservedNames.includes(name.toLowerCase())) {
      return { valid: false, error: 'Repository name cannot be a reserved name' }
    }

    // Cannot start or end with period
    if (name.startsWith('.') || name.endsWith('.')) {
      return { valid: false, error: 'Repository name cannot start or end with a period' }
    }

    // Cannot contain consecutive periods
    if (name.includes('..')) {
      return { valid: false, error: 'Repository name cannot contain consecutive periods' }
    }

    return { valid: true }
  }

  /**
   * Get repository size and file count for preview
   */
  async getRepositoryStats(owner: string, repo: string): Promise<{
    size: number
    fileCount: number
    lastCommit?: string
  } | null> {
    const token = this.getAccessToken()
    if (!token) return null

    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!response.ok) return null

      const data = await response.json()
      return {
        size: data.size,
        fileCount: data.files || 0,
        lastCommit: data.updated_at
      }
    } catch (error) {
      console.error('Failed to get repository stats:', error)
      return null
    }
  }

  /**
   * Check if repository name is available
   */
  async isRepositoryNameAvailable(name: string): Promise<boolean> {
    const user = await this.getUser()
    if (!user) return false

    const token = this.getAccessToken()
    if (!token) return false

    try {
      const response = await fetch(`https://api.github.com/repos/${user.login}/${name}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      // If repository exists, name is not available
      return response.status === 404
    } catch (error) {
      console.error('Failed to check repository availability:', error)
      return false
    }
  }

  /**
   * Generate unique repository name suggestion
   */
  async generateUniqueRepositoryName(baseName: string): Promise<string> {
    const user = await this.getUser()
    if (!user) return baseName

    let counter = 1
    let suggestedName = baseName

    while (!(await this.isRepositoryNameAvailable(suggestedName))) {
      suggestedName = `${baseName}-${counter}`
      counter++
      
      // Prevent infinite loop
      if (counter > 100) break
    }

    return suggestedName
  }

  /**
   * Get user's repository list
   */
  async getUserRepositories(): Promise<Array<{
    name: string
    description: string
    private: boolean
    html_url: string
    created_at: string
  }> | null> {
    const token = this.getAccessToken()
    if (!token) return null

    try {
      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=10', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!response.ok) return null

      const repositories = await response.json()
      return repositories.map((repo: any) => ({
        name: repo.name,
        description: repo.description,
        private: repo.private,
        html_url: repo.html_url,
        created_at: repo.created_at
      }))
    } catch (error) {
      console.error('Failed to get user repositories:', error)
      return null
    }
  }
}

// Export singleton instance
export const githubIntegration = new GitHubIntegrationService() 