"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Download, Github, ExternalLink, Eye } from "lucide-react"
import type { CodeGenerationResult } from "@/lib/oneinch-code-generator"

interface CodePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  result: CodeGenerationResult | null
  projectName: string
  onPublishToGitHub?: () => void
  onLivePreview?: () => void
}

export function CodePreviewModal({ isOpen, onClose, result, projectName, onPublishToGitHub, onLivePreview }: CodePreviewModalProps) {
  const [copiedFile, setCopiedFile] = useState<string | null>(null)

  if (!result) return null

  const downloadCode = () => {
    if (!result) return;
    
    // Create a zip-like structure by downloading individual files
    result.files.forEach((file, index) => {
      setTimeout(() => {
        const blob = new Blob([file.content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.path.replace('/', '_');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, index * 100); // Stagger downloads
    });
  };

  const copyToClipboard = async (content: string, fileName: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedFile(fileName)
      setTimeout(() => setCopiedFile(null), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'frontend': return 'bg-blue-100 text-blue-800'
      case 'backend': return 'bg-green-100 text-green-800'
      case 'contract': return 'bg-purple-100 text-purple-800'
      case 'config': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFileIcon = (path: string) => {
    if (path.endsWith('.tsx') || path.endsWith('.ts')) return '⚛️'
    if (path.endsWith('.json')) return '📦'
    if (path.endsWith('.md')) return '📖'
    if (path.includes('api/')) return '🔌'
    return '📄'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            Code Generated Successfully!
          </DialogTitle>
          <DialogDescription>
            Your {projectName} application has been generated with {result.files.length} files ready for deployment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Generated Files Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">📁 Generated Files ({result.files.length})</h3>
            <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
              {result.files.map((file, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getFileIcon(file.path)}</span>
                      <span className="font-mono text-sm font-medium">{file.path}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getFileTypeColor(file.type)}>
                        {file.type}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(file.content, file.path)}
                      >
                        {copiedFile === file.path ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="h-32 w-full overflow-auto bg-gray-50 p-2 rounded">
                    <pre className="text-xs">
                      <code>{file.content.slice(0, 500)}...</code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deployment Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3">🚀 Deployment Instructions</h3>
            <ol className="space-y-2 text-sm">
              {result.deploymentInstructions.map((instruction, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Git Integration */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-3">
              <Github className="w-5 h-5 inline mr-2" />
              Git Integration
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-green-800">Commit Message:</label>
                <div className="mt-1 p-2 bg-white border rounded text-sm font-mono">
                  {result.gitCommitMessage}
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  <Github className="w-4 h-4 mr-2" />
                  Push to GitHub
                </Button>
                <Button variant="outline">
                  Create New Repo
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={downloadCode} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Code
          </Button>
          {onLivePreview && (
            <Button onClick={onLivePreview} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
              <Eye className="w-4 h-4 mr-2" />
              Live Preview
            </Button>
          )}
          {onPublishToGitHub && (
            <Button onClick={onPublishToGitHub} className="bg-black text-white hover:bg-gray-800">
              <Github className="w-4 h-4 mr-2" />
              Publish to GitHub
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 