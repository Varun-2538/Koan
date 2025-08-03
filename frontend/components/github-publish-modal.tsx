"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  X, 
  Github, 
  Lock, 
  Globe, 
  CheckCircle, 
  AlertCircle,
  Upload,
  GitBranch,
  Star
} from "lucide-react"

interface GitHubPublishModalProps {
  isOpen: boolean
  onClose: () => void
  projectData: any
}

export function GitHubPublishModal({ isOpen, onClose, projectData }: GitHubPublishModalProps) {
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishComplete, setPublishComplete] = useState(false)
  const [repoConfig, setRepoConfig] = useState({
    name: projectData?.projectName || "my-defi-app",
    description: projectData?.description || "DeFi application built with Unite DeFi Platform",
    isPrivate: false,
    includeReadme: true,
    autoDeployVercel: true,
    initializeWithGitignore: true
  })

  if (!isOpen) return null

  const handlePublish = async () => {
    setIsPublishing(true)
    
    try {
      // Simulate publishing process
      await new Promise(resolve => setTimeout(resolve, 3000))
      setPublishComplete(true)
    } catch (error) {
      console.error('Publishing failed:', error)
    } finally {
      setIsPublishing(false)
    }
  }

  const handleConfigChange = (key: string, value: any) => {
    setRepoConfig(prev => ({ ...prev, [key]: value }))
  }

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
                onClick={() => window.open(`https://github.com/username/${repoConfig.name}`, '_blank')}
              >
                <Github className="w-4 h-4 mr-2" />
                View Repository
              </Button>
              
              {repoConfig.autoDeployVercel && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(`https://vercel.com/new/git/external?repository-url=https://github.com/username/${repoConfig.name}`, '_blank')}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Deploy to Vercel
                </Button>
              )}
            </div>

            <Button variant="ghost" onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <Github className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Publish to GitHub</h2>
              <p className="text-sm text-gray-600">Create a new repository for your DeFi application</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
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
              <p className="text-xs text-gray-500 mt-1">
                Repository name must be unique in your account
              </p>
            </div>

            <div>
              <Label htmlFor="repo-description">Description</Label>
              <Textarea
                id="repo-description"
                value={repoConfig.description}
                onChange={(e) => handleConfigChange('description', e.target.value)}
                placeholder="Describe your DeFi application..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Repository Visibility</Label>
                <p className="text-sm text-gray-600">
                  {repoConfig.isPrivate ? 'Only you can see this repository' : 'Anyone can see this repository'}
                </p>
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
          </div>

          {/* Repository Options */}
          <div className="space-y-4">
            <h3 className="font-medium">Repository Options</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Include README</Label>
                  <p className="text-sm text-gray-600">Add a README with project description and setup instructions</p>
                </div>
                <Switch
                  checked={repoConfig.includeReadme}
                  onCheckedChange={(checked) => handleConfigChange('includeReadme', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Initialize .gitignore</Label>
                  <p className="text-sm text-gray-600">Add Node.js .gitignore file</p>
                </div>
                <Switch
                  checked={repoConfig.initializeWithGitignore}
                  onCheckedChange={(checked) => handleConfigChange('initializeWithGitignore', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-deploy to Vercel</Label>
                  <p className="text-sm text-gray-600">Set up automatic deployment on push</p>
                </div>
                <Switch
                  checked={repoConfig.autoDeployVercel}
                  onCheckedChange={(checked) => handleConfigChange('autoDeployVercel', checked)}
                />
              </div>
            </div>
          </div>

          {/* Project Preview */}
          <div className="space-y-4">
            <h3 className="font-medium">Project Preview</h3>
            
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium">username/{repoConfig.name}</span>
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

              <div className="pt-2 border-t">
                <div className="text-xs text-gray-500">Files to be included:</div>
                <div className="mt-2 space-y-1">
                  {Object.keys(projectData?.files || {}).slice(0, 5).map(filename => (
                    <div key={filename} className="text-xs text-gray-600 font-mono">
                      📄 {filename}
                    </div>
                  ))}
                  {Object.keys(projectData?.files || {}).length > 5 && (
                    <div className="text-xs text-gray-500">
                      + {Object.keys(projectData?.files || {}).length - 5} more files
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-blue-900">Before Publishing</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• Make sure to add your 1inch API key to environment variables</p>
                  <p>• Review the generated code for any sensitive information</p>
                  <p>• Consider making the repository private if it contains proprietary logic</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Repository will be created under your GitHub account
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handlePublish} 
                disabled={isPublishing || !repoConfig.name}
              >
                {isPublishing ? (
                  <>Publishing...</>
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