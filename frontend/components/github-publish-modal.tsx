"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  X, 
  Github, 
  Lock, 
  Globe, 
  CheckCircle, 
  AlertCircle,
  Upload,
  GitBranch,
  Star,
  Loader2,
  Code2,
  FileText,
  Eye,
  Copy,
  User,
  LogOut
} from "lucide-react"
import type { CodeGenerationResult } from "@/lib/oneinch-code-generator"
import { createGitHubOAuth, type GitHubUser } from "@/lib/github-oauth"

interface GitHubPublishModalProps {
  isOpen: boolean
  onClose: () => void
  codeResult: CodeGenerationResult | null
  projectName?: string
}

export function GitHubPublishModal({ isOpen, onClose, codeResult, projectName }: GitHubPublishModalProps) {
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishComplete, setPublishComplete] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [repositoryUrl, setRepositoryUrl] = useState<string>("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [copiedFile, setCopiedFile] = useState<string | null>(null)
  
  const [repoConfig, setRepoConfig] = useState({
    name: projectName || codeResult?.projectName || "my-defi-app",
    description: codeResult?.description || "DeFi application built with Unite DeFi Platform",
    isPrivate: false,
    includeReadme: true,
    autoDeployVercel: true,
    initializeWithGitignore: true
  })

  const githubOAuth = createGitHubOAuth()

  // Helper function to normalize files for display
  const getFilesArray = (codeResult: CodeGenerationResult | null) => {
    if (!codeResult || !codeResult.files) return []
    return codeResult.files
  }

  const filesArray = getFilesArray(codeResult)

  // Check for existing authentication on mount
  useEffect(() => {
    if (isOpen) {
      const storedToken = githubOAuth.getStoredAccessToken()
      if (storedToken) {
        setAccessToken(storedToken)
        // Fetch user info
        fetchUserInfo(storedToken)
      }
    }
  }, [isOpen])

  const fetchUserInfo = async (token: string) => {
    try {
      const user = await githubOAuth.getUser(token)
      setGithubUser(user)
    } catch (error) {
      console.error('Failed to fetch user info:', error)
      // Clear invalid token
      githubOAuth.clearAccessToken()
      setAccessToken(null)
    }
  }

  const handleGitHubConnect = () => {
    setIsConnecting(true)
    setPublishError(null)
    
    // Generate state for security
    const state = Math.random().toString(36).substring(7)
    
    console.log('Generated OAuth state:', state)
    
    // Store state directly in localStorage (not through githubOAuth instance)
    localStorage.setItem('github_oauth_state', state)
    
    console.log('State stored in localStorage:', localStorage.getItem('github_oauth_state'))
    
    // Create auth URL with the same state
    const authUrl = githubOAuth.getAuthorizationUrl(state)
    
    console.log('Opening OAuth URL:', authUrl)
    
    const popup = window.open(
      authUrl,
      'github-oauth',
      'width=600,height=700,scrollbars=yes,resizable=yes'
    )

    if (!popup) {
      setIsConnecting(false)
      setPublishError('Popup blocked. Please allow popups for this site and try again.')
      return
    }

    // Listen for OAuth completion
    const messageHandler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return

      if (event.data.type === 'GITHUB_AUTH_SUCCESS') {
        console.log('Received auth success message')
        setAccessToken(event.data.accessToken)
        setGithubUser(event.data.user)
        setIsConnecting(false)
        popup?.close()
        window.removeEventListener('message', messageHandler)
        clearInterval(checkClosed)
      } else if (event.data.type === 'GITHUB_AUTH_ERROR') {
        console.log('Received auth error message:', event.data.error)
        setPublishError(event.data.error)
        setIsConnecting(false)
        popup?.close()
        window.removeEventListener('message', messageHandler)
        clearInterval(checkClosed)
      }
    }

    window.addEventListener('message', messageHandler)

    // Handle popup closed manually
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        console.log('Popup closed manually')
        setIsConnecting(false)
        clearInterval(checkClosed)
        window.removeEventListener('message', messageHandler)
      }
    }, 1000)
  }

  const handleDisconnect = () => {
    githubOAuth.clearAccessToken()
    setAccessToken(null)
    setGithubUser(null)
  }

  const handlePublish = async () => {
    if (!codeResult) {
      setPublishError("No code to publish. Please generate code first.")
      return
    }

    if (!accessToken || !githubUser) {
      setPublishError("Please connect to GitHub first.")
      return
    }

    setIsPublishing(true)
    setPublishError(null)
    
    try {
      console.log("Publishing to GitHub:", {
        repoConfig,
        user: githubUser.login,
        fileCount: (codeResult.files || []).length
      })

      // Create repository
      const repository = await githubOAuth.createRepository(
        accessToken,
        repoConfig.name,
        repoConfig.description,
        repoConfig.isPrivate
      )

      // Prepare files for upload
      const filesToUpload = (codeResult.files || []).map(file => ({
        path: file.path,
        content: file.content
      }))

      // Upload files to repository
      await githubOAuth.uploadFiles(
        accessToken,
        githubUser.login,
        repository.name,
        filesToUpload,
        "Initial commit: DeFi application from Unite DeFi Platform"
      )

      setRepositoryUrl(repository.html_url)
      setPublishComplete(true)
      
    } catch (error: any) {
      console.error('Publishing failed:', error)
      setPublishError(error.message || 'Failed to publish to GitHub')
    } finally {
      setIsPublishing(false)
    }
  }

  const handleConfigChange = (key: string, value: any) => {
    setRepoConfig(prev => ({ ...prev, [key]: value }))
  }

  const handleCopyFile = async (filename: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedFile(filename)
      setTimeout(() => setCopiedFile(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.tsx') || filename.endsWith('.ts')) {
      return <Code2 className="w-4 h-4" />
    }
    if (filename.endsWith('.json')) {
      return <FileText className="w-4 h-4" />
    }
    return <FileText className="w-4 h-4" />
  }

  const getLanguage = (filename: string) => {
    if (filename.endsWith('.tsx') || filename.endsWith('.ts')) return 'typescript'
    if (filename.endsWith('.json')) return 'json'
    if (filename.endsWith('.css')) return 'css'
    if (filename.endsWith('.md')) return 'markdown'
    return 'text'
  }

  const resetModal = () => {
    setPublishComplete(false)
    setPublishError(null)
    setRepositoryUrl("")
    setIsPublishing(false)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  if (!isOpen) return null

  // Success state
  if (publishComplete) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-md p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-2">Repository Created!</h2>
              <p className="text-gray-600 text-sm">
                Your DeFi application has been successfully published to GitHub.
              </p>
            </div>

            <div className="space-y-2">
              <Button 
                className="w-full" 
                onClick={() => window.open(repositoryUrl, '_blank')}
              >
                <Github className="w-4 h-4 mr-2" />
                View Repository
              </Button>
              
              {repoConfig.autoDeployVercel && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(`https://vercel.com/new/git/external?repository-url=${repositoryUrl}`, '_blank')}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Deploy to Vercel
                </Button>
              )}
            </div>

            <Button variant="ghost" onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <Github className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Publish to GitHub</h2>
              <p className="text-sm text-gray-600">Review code and create a new repository</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          <Tabs defaultValue="repository" className="flex-1 flex flex-col">
            <TabsList className="mx-6 mt-4 grid w-full grid-cols-2">
              <TabsTrigger value="repository">Repository Settings</TabsTrigger>
              <TabsTrigger value="code-preview">Code Preview</TabsTrigger>
            </TabsList>

            {/* Repository Settings Tab */}
            <TabsContent value="repository" className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Error Display */}
              {publishError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900">Error</h4>
                      <p className="text-sm text-red-800 mt-1">{publishError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* GitHub Connection */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Github className="w-5 h-5" />
                    <div>
                      <h4 className="font-medium">GitHub Account</h4>
                      {githubUser ? (
                        <div className="flex items-center gap-2 mt-1">
                          <img 
                            src={githubUser.avatar_url} 
                            alt={githubUser.login}
                            className="w-5 h-5 rounded-full"
                          />
                          <span className="text-sm text-gray-600">@{githubUser.login}</span>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">Connect your GitHub account to publish</p>
                      )}
                    </div>
                  </div>
                  
                  {githubUser ? (
                    <Button variant="outline" size="sm" onClick={handleDisconnect}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Disconnect
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleGitHubConnect} 
                      disabled={isConnecting}
                      size="sm"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <User className="w-4 h-4 mr-2" />
                          Connect GitHub
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Repository Settings */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="repo-name">Repository Name</Label>
                  <Input
                    id="repo-name"
                    value={repoConfig.name}
                    onChange={(e) => handleConfigChange('name', e.target.value)}
                    placeholder="my-defi-app"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="repo-description">Description</Label>
                  <Textarea
                    id="repo-description"
                    value={repoConfig.description}
                    onChange={(e) => handleConfigChange('description', e.target.value)}
                    placeholder="DeFi application built with Unite DeFi Platform"
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Repository Visibility</Label>
                    <div className="text-sm text-gray-600">
                      {repoConfig.isPrivate ? "Only you can see this repository" : "Anyone can see this repository"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <Switch
                      checked={repoConfig.isPrivate}
                      onCheckedChange={(checked) => handleConfigChange('isPrivate', checked)}
                    />
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Include README.md</Label>
                    <Switch
                      checked={repoConfig.includeReadme}
                      onCheckedChange={(checked) => handleConfigChange('includeReadme', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Auto-deploy to Vercel</Label>
                    <Switch
                      checked={repoConfig.autoDeployVercel}
                      onCheckedChange={(checked) => handleConfigChange('autoDeployVercel', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  <span className="font-medium">{githubUser?.login || 'your-username'}/{repoConfig.name}</span>
                  <Badge variant={repoConfig.isPrivate ? "secondary" : "outline"}>
                    {repoConfig.isPrivate ? "Private" : "Public"}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600">
                  {repoConfig.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>TypeScript</span>
                  <span>React</span>
                  <span>Next.js</span>
                  <span>1inch Protocol</span>
                </div>

                {codeResult?.files && (
                  <div className="pt-2 border-t">
                    <div className="text-xs text-gray-500">Files to be published:</div>
                    <div className="mt-2 space-y-1">
                      {filesArray.slice(0, 5).map(file => (
                        <div key={file.path} className="text-xs text-gray-600 font-mono flex items-center gap-2">
                          {getFileIcon(file.path)}
                          {file.path}
                        </div>
                      ))}
                      {filesArray.length > 5 && (
                        <div className="text-xs text-gray-500">
                          + {filesArray.length - 5} more files
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Code Preview Tab */}
            <TabsContent value="code-preview" className="flex-1 flex flex-col overflow-hidden">
              {filesArray.length > 0 ? (
                <div className="flex-1 flex overflow-hidden">
                  {/* File List */}
                  <div className="w-80 border-r bg-gray-50 overflow-y-auto">
                    <div className="p-4 border-b">
                      <h3 className="font-medium text-sm">Generated Files ({filesArray.length})</h3>
                    </div>
                    <div className="p-2">
                      {filesArray.map((file, index) => (
                        <button
                          key={index}
                          className="w-full text-left p-2 rounded hover:bg-white text-sm font-mono flex items-center gap-2 group"
                          onClick={() => {
                            // You can implement file selection here
                          }}
                        >
                          {getFileIcon(file.path)}
                          <span className="truncate">{file.path}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 ml-auto h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCopyFile(file.path, file.content)
                            }}
                          >
                            {copiedFile === file.path ? (
                              <CheckCircle className="w-3 h-3 text-green-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* File Content */}
                  <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                      <div className="p-4">
                        <div className="space-y-6">
                          {filesArray.map((file, index) => (
                            <div key={index} className="border rounded-lg overflow-hidden">
                              <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {getFileIcon(file.path)}
                                  <span className="font-mono text-sm">{file.path}</span>
                                  {file.type && (
                                    <Badge variant="outline" className="text-xs">
                                      {file.type}
                                    </Badge>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyFile(file.path, file.content)}
                                >
                                  {copiedFile === file.path ? (
                                    <>
                                      <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                      Copied!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-4 h-4 mr-2" />
                                      Copy
                                    </>
                                  )}
                                </Button>
                              </div>
                              <pre className="p-4 text-sm overflow-x-auto bg-gray-50 max-h-96">
                                <code>{file.content}</code>
                              </pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Code2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Code Generated</h3>
                    <p className="text-gray-600">Generate code first to preview files</p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {githubUser ? (
                `Repository will be created under @${githubUser.login}`
              ) : (
                "Connect GitHub to publish your repository"
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} disabled={isPublishing}>
                Cancel
              </Button>
              <Button 
                onClick={handlePublish} 
                disabled={isPublishing || !repoConfig.name || !codeResult || !githubUser}
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Github className="w-4 h-4 mr-2" />
                    Create Repository
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}