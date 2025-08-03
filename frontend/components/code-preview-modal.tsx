"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  X, 
  Download, 
  Copy, 
  Eye, 
  Code, 
  FileText,
  ExternalLink,
  CheckCircle
} from "lucide-react"
import type { CodeGenerationResult } from "@/lib/oneinch-code-generator"

interface CodePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  codeResult: CodeGenerationResult | null
  projectName?: string
}

export function CodePreviewModal({ isOpen, onClose, codeResult, projectName = 'DeFi Application' }: CodePreviewModalProps) {
  const [copiedFile, setCopiedFile] = useState<string | null>(null)

  if (!isOpen || !codeResult) return null

  const handleCopyFile = async (filename: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedFile(filename)
      setTimeout(() => setCopiedFile(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleDownloadAll = () => {
    const files = codeResult.files || []
    const zip = files.map(file => 
      `// ${file.path}\n${file.content}`
    ).join('\n\n//=================\n\n')
    
    const blob = new Blob([zip], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectName || 'generated-code'}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.tsx') || filename.endsWith('.ts')) {
      return <Code className="w-4 h-4" />
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
    return 'text'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Generated Code Preview</h2>
            <p className="text-sm text-gray-600 mt-1">
              {projectName || 'DeFi Application'} • {(codeResult.files || []).length} files
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleDownloadAll}>
              <Download className="w-4 h-4 mr-2" />
              Download All
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex">
          {/* File List */}
          <div className="w-80 border-r bg-gray-50">
            <div className="p-4 border-b bg-white">
              <h3 className="font-medium text-sm">Generated Files</h3>
              <p className="text-xs text-gray-500 mt-1">
                Click to preview file contents
              </p>
            </div>
            
            <ScrollArea className="h-full">
              <div className="p-2">
                {(codeResult.files || []).map((file) => (
                  <div
                    key={file.path}
                    className="p-3 rounded-lg hover:bg-white cursor-pointer transition-colors border mb-2"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getFileIcon(file.path)}
                      <span className="text-sm font-medium truncate">{file.path}</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {file.content.length} characters
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyFile(file.path, file.content)}
                        className="h-6 px-2 text-xs"
                      >
                        {copiedFile === file.path ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Code Preview */}
          <div className="flex-1 flex flex-col">
            <Tabs defaultValue="overview" className="flex-1 flex flex-col">
              <div className="border-b px-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="preview">Live Preview</TabsTrigger>
                  <TabsTrigger value="deployment">Deployment</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="flex-1 p-6">
                <div className="space-y-6">
                  {/* Project Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Project Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Project Name</label>
                        <p className="text-sm text-gray-600">{codeResult.projectName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <p className="text-sm text-gray-600">{codeResult.description}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Framework</label>
                        <p className="text-sm text-gray-600">{codeResult.framework}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Features</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {codeResult.features?.map((feature: string) => (
                            <Badge key={feature} variant="outline">{feature}</Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* File Structure */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">File Structure</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="font-mono text-sm space-y-1">
                        {(codeResult.files || []).map(file => (
                          <div key={file.path} className="flex items-center gap-2">
                            {getFileIcon(file.path)}
                            <span className="text-gray-700">{file.path}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Dependencies */}
                  {codeResult.dependencies && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Dependencies</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-sm mb-2">Production</h4>
                            <div className="space-y-1">
                              {Object.entries(codeResult.dependencies.dependencies || {}).map(([name, version]) => (
                                <div key={name} className="flex justify-between text-sm">
                                  <span>{name}</span>
                                  <span className="text-gray-500">{version as string}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm mb-2">Development</h4>
                            <div className="space-y-1">
                              {Object.entries(codeResult.dependencies.devDependencies || {}).map(([name, version]) => (
                                <div key={name} className="flex justify-between text-sm">
                                  <span>{name}</span>
                                  <span className="text-gray-500">{version as string}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="preview" className="flex-1 p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Live Preview</h3>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in New Tab
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 text-sm text-gray-600 border-b">
                      Preview Environment: localhost:3000
                    </div>
                    <div className="aspect-video bg-gray-50 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <h4 className="text-lg font-medium mb-2">Live Preview</h4>
                        <p className="text-sm">Deploy your application to see it live</p>
                        <Button className="mt-4">
                          Deploy Application
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="deployment" className="flex-1 p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Deployment Options</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">▲</span>
                            </div>
                            <h4 className="font-medium">Deploy to Vercel</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            Deploy your Next.js application to Vercel with one click
                          </p>
                          <Button size="sm" className="w-full">
                            Deploy to Vercel
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">N</span>
                            </div>
                            <h4 className="font-medium">Deploy to Netlify</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            Deploy your application to Netlify with continuous deployment
                          </p>
                          <Button size="sm" variant="outline" className="w-full">
                            Deploy to Netlify
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Manual Deployment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">1. Install Dependencies</h4>
                        <div className="bg-gray-100 rounded p-3 font-mono text-sm">
                          npm install
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-2">2. Build Application</h4>
                        <div className="bg-gray-100 rounded p-3 font-mono text-sm">
                          npm run build
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-2">3. Start Production Server</h4>
                        <div className="bg-gray-100 rounded p-3 font-mono text-sm">
                          npm run start
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Environment Variables */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Environment Variables</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600 mb-3">
                          Add these environment variables to your deployment:
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <code className="text-sm">NEXT_PUBLIC_1INCH_API_KEY</code>
                            <Badge variant="outline">Required</Badge>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <code className="text-sm">NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID</code>
                            <Badge variant="secondary">Optional</Badge>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <code className="text-sm">NEXT_PUBLIC_CHAIN_ID</code>
                            <Badge variant="secondary">Optional</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Generated {(codeResult.files || []).length} files • Ready for deployment
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={handleDownloadAll}>
                <Download className="w-4 h-4 mr-2" />
                Download Project
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 