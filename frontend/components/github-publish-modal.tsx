"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { GitHubPublisher, GitHubPublishResult } from "@/lib/github-publisher"
import { CodeGenerationResult } from "@/lib/oneinch-code-generator"
import { createGitHubOAuth, GitHubUser } from "@/lib/github-oauth"
import { CheckCircle, ExternalLink, Github, Loader2, AlertCircle, User, LogOut } from "lucide-react"

interface GitHubPublishModalProps {
  isOpen: boolean
  onClose: () => void
  codeResult: CodeGenerationResult | null
  projectName: string
}

export function GitHubPublishModal({ isOpen, onClose, codeResult, projectName }: GitHubPublishModalProps) {
  const [repositoryName, setRepositoryName] = useState(projectName.toLowerCase().replace(/\s+/g, '-'))
  const [description, setDescription] = useState(`Complete 1inch-Powered DeFi Suite - Built with Unite DeFi Platform`)
  const [isPrivate, setIsPrivate] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [publishResult, setPublishResult] = useState<GitHubPublishResult | null>(null)
  const [step, setStep] = useState<'auth' | 'setup' | 'publishing' | 'complete'>('auth')
  
  // GitHub OAuth state
  const [githubOAuth] = useState(() => createGitHubOAuth())
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null)
  const [authLoading, setAuthLoading] = useState(false)

  // Check authentication status on modal open
  useEffect(() => {
    if (isOpen) {
      checkAuthStatus()
    }
  }, [isOpen])

  // Listen for OAuth callback messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return

      if (event.data.type === 'GITHUB_AUTH_SUCCESS') {
        setGithubUser(event.data.user)
        setIsAuthenticated(true)
        setStep('setup')
      } else if (event.data.type === 'GITHUB_AUTH_ERROR') {
        console.error('GitHub auth error:', event.data.error)
        setAuthLoading(false)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const checkAuthStatus = async () => {
    const token = githubOAuth.getStoredAccessToken()
    if (token) {
      try {
        const user = await githubOAuth.getUser(token)
        setGithubUser(user)
        setIsAuthenticated(true)
        setStep('setup')
      } catch (error) {
        // Token might be expired, clear it
        githubOAuth.clearAccessToken()
        setIsAuthenticated(false)
        setStep('auth')
      }
    } else {
      setIsAuthenticated(false)
      setStep('auth')
    }
  }

  const handleGitHubLogin = () => {
    setAuthLoading(true)
    const state = Math.random().toString(36).substring(7)
    githubOAuth.storeState(state)
    
    const authUrl = githubOAuth.getAuthorizationUrl(state)
    
    // Open in popup window
    const popup = window.open(
      authUrl,
      'github-oauth',
      'width=600,height=700,scrollbars=yes,resizable=yes'
    )

    // Check if popup was blocked
    if (!popup) {
      setAuthLoading(false)
      alert('Popup blocked. Please allow popups for this site and try again.')
      return
    }

    // Monitor popup closure
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed)
        setAuthLoading(false)
      }
    }, 1000)
  }

  const handleLogout = () => {
    githubOAuth.clearAccessToken()
    setGithubUser(null)
    setIsAuthenticated(false)
    setStep('auth')
  }

  const handlePublish = async () => {
    if (!codeResult || !githubUser) return

    setPublishing(true)
    setStep('publishing')
    
    try {
      const accessToken = githubOAuth.getStoredAccessToken()
      if (!accessToken) {
        throw new Error('No GitHub access token found')
      }

      // Create repository
      const repo = await githubOAuth.createRepository(
        accessToken,
        repositoryName,
        description,
        isPrivate
      )

      // Upload all files
      await githubOAuth.uploadFiles(
        accessToken,
        githubUser.login,
        repositoryName,
        codeResult.files,
        codeResult.gitCommitMessage
      )

      setPublishResult({
        success: true,
        repositoryUrl: repo.html_url,
        deploymentUrl: `https://${repositoryName}.vercel.app` // Simulated deployment URL
      })
      setStep('complete')
    } catch (error: any) {
      setPublishResult({
        success: false,
        error: error.message || 'Unknown error occurred'
      })
      setStep('complete')
    } finally {
      setPublishing(false)
    }
  }

  const resetModal = () => {
    setStep(isAuthenticated ? 'setup' : 'auth')
    setPublishResult(null)
    setPublishing(false)
    setAuthLoading(false)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  if (!codeResult) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="w-5 h-5" />
            Publish to GitHub
          </DialogTitle>
        </DialogHeader>

        {step === 'auth' && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <Github className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Connect Your GitHub Account
              </h3>
              <p className="text-gray-600 mb-6">
                Connect your GitHub account to automatically create repositories and push your generated DeFi applications.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
                <h4 className="font-medium text-blue-900 mb-2">🔐 Permissions Required:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Create repositories</strong> - To create new repos for your projects</li>
                  <li>• <strong>Push code</strong> - To upload your generated application files</li>
                  <li>• <strong>Read user info</strong> - To display your GitHub profile</li>
                </ul>
              </div>

              <Button
                onClick={handleGitHubLogin}
                disabled={authLoading}
                className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-3"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Github className="w-4 h-4 mr-2" />
                    Connect GitHub Account
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500 mt-4">
                Your credentials are secure and only used for repository creation
              </p>
            </div>
          </div>
        )}

        {step === 'setup' && (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <div className="flex items-center mb-2">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="font-medium text-green-900">GitHub Connected!</h3>
              </div>
              <div className="flex items-center">
                <img
                  src={githubUser?.avatar_url}
                  alt={githubUser?.login}
                  className="w-8 h-8 rounded-full mr-3"
                />
                <div className="flex-1">
                  <div className="font-medium text-green-900">{githubUser?.name || githubUser?.login}</div>
                  <div className="text-sm text-green-700">@{githubUser?.login}</div>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="text-gray-600 hover:text-gray-800"
                >
                  <LogOut className="w-3 h-3 mr-1" />
                  Logout
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">🚀 Ready to Deploy Your 1inch DeFi Suite!</h3>
              <p className="text-sm text-blue-700">
                Your complete DeFi application will be automatically created in your GitHub account with full source code, 
                documentation, and deployment instructions.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="repoName">Repository Name</Label>
                <Input
                  id="repoName"
                  value={repositoryName}
                  onChange={(e) => setRepositoryName(e.target.value)}
                  placeholder="my-1inch-defi-suite"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userName">GitHub Username</Label>
                <Input
                  id="userName"
                  value={githubUser?.login || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe your DeFi application..."
              />
            </div>



            <div className="flex items-center space-x-2">
              <Checkbox
                id="private"
                checked={isPrivate}
                onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
              />
              <Label htmlFor="private" className="text-sm">Make repository private</Label>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">📁 Generated Files Preview:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>📊 Total Files: <span className="font-medium">{codeResult.files.length}</span></div>
                <div>🎯 Frontend: <span className="font-medium">{codeResult.files.filter(f => f.type === 'frontend').length} files</span></div>
                <div>⚙️ Backend: <span className="font-medium">{codeResult.files.filter(f => f.type === 'backend').length} files</span></div>
                <div>📋 Config: <span className="font-medium">{codeResult.files.filter(f => f.type === 'config').length} files</span></div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleClose} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handlePublish} className="flex-1" disabled={!repositoryName || !githubUser}>
                <Github className="w-4 h-4 mr-2" />
                Create Repository & Push Code
              </Button>
            </div>
          </div>
        )}

        {step === 'publishing' && (
          <div className="space-y-6 text-center py-8">
            <div className="flex justify-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Publishing Your DeFi Suite...</h3>
              <p className="text-gray-600">
                Creating repository and uploading {codeResult.files.length} files
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-left">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Generating complete 1inch DeFi application
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Creating frontend with React & Next.js
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Building backend APIs with Express
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  Publishing to GitHub repository...
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="space-y-6">
            {publishResult?.success ? (
              <div className="text-center py-4">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-green-700 mb-2">
                  🎉 Successfully Published!
                </h3>
                <p className="text-gray-600 mb-6">
                  Your 1inch-Powered DeFi Suite has been published to GitHub
                </p>

                <div className="bg-green-50 p-4 rounded-lg space-y-3">
                  {publishResult.repositoryUrl && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Repository:</span>
                      <a
                        href={publishResult.repositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        View on GitHub <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {publishResult.deploymentUrl && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Live Demo:</span>
                      <a
                        href={publishResult.deploymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        View Live App <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg text-left mt-4">
                  <h4 className="font-medium mb-2">🚀 Next Steps:</h4>
                  <ol className="text-sm space-y-1 list-decimal list-inside text-gray-700">
                    <li>Clone your repository locally</li>
                    <li>Add your 1inch API key to .env files</li>
                    <li>Run `npm install` in both frontend and backend</li>
                    <li>Start development with `npm run dev`</li>
                    <li>Deploy to production when ready!</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="flex justify-center mb-4">
                  <AlertCircle className="w-16 h-16 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-red-700 mb-2">
                  Publishing Failed
                </h3>
                <p className="text-gray-600 mb-4">
                  {publishResult?.error || 'An unknown error occurred'}
                </p>
                <div className="bg-yellow-50 p-4 rounded-lg text-left">
                  <h4 className="font-medium mb-2">💡 Manual Setup Instructions:</h4>
                  <ol className="text-sm space-y-1 list-decimal list-inside text-gray-700">
                    <li>Create a new repository on GitHub manually</li>
                    <li>Download the generated code from the Code Preview</li>
                    <li>Upload files to your repository</li>
                    <li>Follow the README.md for setup instructions</li>
                  </ol>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={handleClose} variant="outline" className="flex-1">
                Close
              </Button>
              {publishResult?.success && publishResult.repositoryUrl && (
                <Button asChild className="flex-1">
                  <a href={publishResult.repositoryUrl} target="_blank" rel="noopener noreferrer">
                    <Github className="w-4 h-4 mr-2" />
                    View Repository
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}