export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string;
  email: string;
  public_repos: number;
}

export interface GitHubOAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string[];
}

export class GitHubOAuth {
  private static readonly GITHUB_API_BASE = 'https://api.github.com';
  private static readonly GITHUB_OAUTH_BASE = 'https://github.com/login/oauth';
  
  private config: GitHubOAuthConfig;

  constructor(config: GitHubOAuthConfig) {
    this.config = config;
  }

  /**
   * Generate GitHub OAuth authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope.join(' '),
      state: state || this.generateState(),
      response_type: 'code'
    });

    return `${GitHubOAuth.GITHUB_OAUTH_BASE}/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, state?: string): Promise<string> {
    try {
      const response = await fetch('/api/github/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          state,
          client_id: this.config.clientId,
          redirect_uri: this.config.redirectUri
        })
      });

      if (!response.ok) {
        throw new Error(`OAuth token exchange failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`GitHub OAuth error: ${data.error_description || data.error}`);
      }

      return data.access_token;
    } catch (error) {
      console.error('Token exchange error:', error);
      throw error;
    }
  }

  /**
   * Get authenticated user information
   */
  async getUser(accessToken: string): Promise<GitHubUser> {
    try {
      const response = await fetch(`${GitHubOAuth.GITHUB_API_BASE}/user`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Unite-DeFi-Platform'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }

  /**
   * Create a new repository
   */
  async createRepository(
    accessToken: string, 
    name: string, 
    description: string, 
    isPrivate: boolean = false
  ): Promise<any> {
    try {
      const response = await fetch(`${GitHubOAuth.GITHUB_API_BASE}/user/repos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Unite-DeFi-Platform'
        },
        body: JSON.stringify({
          name,
          description,
          private: isPrivate,
          auto_init: true,
          gitignore_template: 'Node',
          license_template: 'mit'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create repository: ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Create repository error:', error);
      throw error;
    }
  }

  /**
   * Upload files to repository using GitHub Contents API
   */
  async uploadFiles(
    accessToken: string,
    owner: string,
    repo: string,
    files: Array<{ path: string; content: string }>,
    commitMessage: string
  ): Promise<void> {
    try {
      // Upload files one by one using Contents API
      for (const file of files) {
        await this.uploadSingleFile(
          accessToken,
          owner,
          repo,
          file.path,
          file.content,
          commitMessage
        );
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('Upload files error:', error);
      throw error;
    }
  }

  /**
   * Upload a single file to repository
   */
  private async uploadSingleFile(
    accessToken: string,
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string
  ): Promise<void> {
    try {
      // Check if file already exists to get SHA for update
      let sha: string | undefined;
      try {
        const existingResponse = await fetch(
          `${GitHubOAuth.GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'Unite-DeFi-Platform'
            }
          }
        );
        
        if (existingResponse.ok) {
          const existingData = await existingResponse.json();
          sha = existingData.sha;
        }
      } catch (error) {
        // File doesn't exist, which is fine for new files
      }

      const response = await fetch(
        `${GitHubOAuth.GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': 'Unite-DeFi-Platform'
          },
          body: JSON.stringify({
            message,
            content: btoa(unescape(encodeURIComponent(content))), // Base64 encode with UTF-8 support
            ...(sha && { sha }) // Include SHA if updating existing file
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to upload ${path}: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error(`Upload single file error for ${path}:`, error);
      throw error;
    }
  }

  /**
   * Generate a random state for OAuth security
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Store OAuth state in localStorage for verification
   */
  storeState(state: string): void {
    console.log('Storing OAuth state:', state);
    localStorage.setItem('github_oauth_state', state);
    
    // Verify it was stored
    const stored = localStorage.getItem('github_oauth_state');
    console.log('Verification - stored state:', stored);
  }

  /**
   * Verify OAuth state from localStorage
   */
  verifyState(state: string): boolean {
    const storedState = localStorage.getItem('github_oauth_state');
    
    // Add debugging
    console.log('Verifying OAuth state:', {
      received: state,
      stored: storedState,
      match: storedState === state
    });
    
    // Clean up stored state
    localStorage.removeItem('github_oauth_state');
    
    return storedState === state;
  }

  /**
   * Store access token securely
   */
  storeAccessToken(token: string): void {
    // In production, consider using more secure storage
    localStorage.setItem('github_access_token', token);
  }

  /**
   * Get stored access token
   */
  getStoredAccessToken(): string | null {
    return localStorage.getItem('github_access_token');
  }

  /**
   * Clear stored access token
   */
  clearAccessToken(): void {
    localStorage.removeItem('github_access_token');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getStoredAccessToken();
  }
}

// Replace the createGitHubOAuth function at the bottom of frontend/lib/github-oauth.ts

// Add this to the very end of your frontend/lib/github-oauth.ts file
// Make sure it's after the GitHubOAuth class definition

// Default configuration with hardcoded values
export const createGitHubOAuth = () => {
  const config: GitHubOAuthConfig = {
    clientId: 'Ov23lij7oQUxuK5VpghA', // Hardcoded client ID
    redirectUri: `${window.location.origin}/github/callback`,
    scope: ['repo', 'user:email']
  };

  console.log('Creating GitHub OAuth with hardcoded config:', {
    clientId: config.clientId,
    redirectUri: config.redirectUri,
    scope: config.scope
  });

  return new GitHubOAuth(config);
};