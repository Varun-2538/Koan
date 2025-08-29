"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Search,
  Package,
  Download,
  Trash2,
  Settings,
  RefreshCw,
  ExternalLink,
  Star,
  Users,
  Calendar,
  Code,
  FileText,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Plus,
  Filter,
  SortAsc,
  X
} from "lucide-react"
import { unitePluginSystem } from "@/lib/plugin-system"
import { PluginDefinition } from "@/lib/plugin-system/types"

interface PluginManagementPanelProps {
  isOpen: boolean
  onClose: () => void
}

interface MarketplacePlugin extends PluginDefinition {
  downloads: number
  rating: number
  author: string
  lastUpdated: string
  isInstalled: boolean
  screenshots?: string[]
  changelog?: string
  license?: string
}

export function PluginManagementPanel({ isOpen, onClose }: PluginManagementPanelProps) {
  const [installedPlugins, setInstalledPlugins] = useState<PluginDefinition[]>([])
  const [marketplacePlugins, setMarketplacePlugins] = useState<MarketplacePlugin[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [loading, setLoading] = useState(false)
  const [selectedPlugin, setSelectedPlugin] = useState<MarketplacePlugin | null>(null)
  const [installing, setInstalling] = useState<string | null>(null)
  const [uninstalling, setUninstalling] = useState<string | null>(null)

  const categories = ["All", "DeFi", "Bridge", "Logic", "Data", "Wallet", "UI", "Infrastructure", "Analytics", "Custom"]

  useEffect(() => {
    if (isOpen) {
      loadInstalledPlugins()
      loadMarketplacePlugins()
    }
  }, [isOpen])

  const loadInstalledPlugins = async () => {
    try {
      const plugins = unitePluginSystem.registry.getAllPlugins()
      setInstalledPlugins(plugins)
    } catch (error) {
      console.error('Failed to load installed plugins:', error)
    }
  }

  const loadMarketplacePlugins = async () => {
    setLoading(true)
    try {
      // Mock marketplace data - in a real app, this would fetch from a plugin marketplace API
      const mockPlugins: MarketplacePlugin[] = [
        {
          id: 'advanced-defi-analytics',
          name: 'Advanced DeFi Analytics',
          version: '2.1.0',
          description: 'Advanced analytics and reporting for DeFi operations with custom charts and metrics',
          category: 'Analytics',
          tags: ['analytics', 'charts', 'defi', 'reporting'],
          inputs: [
            { key: 'timeRange', type: 'select', label: 'Time Range', required: true, options: [
              { label: '24 Hours', value: '24h' },
              { label: '7 Days', value: '7d' },
              { label: '30 Days', value: '30d' }
            ]},
            { key: 'protocols', type: 'multiselect', label: 'Protocols', required: false, options: [
              { label: 'Uniswap', value: 'uniswap' },
              { label: 'Compound', value: 'compound' },
              { label: 'Aave', value: 'aave' }
            ]}
          ],
          outputs: [
            { key: 'analytics', type: 'object', label: 'Analytics Data', required: true },
            { key: 'charts', type: 'array', label: 'Chart Data', required: false }
          ],
          executor: { type: 'javascript', timeout: 30000 },
          downloads: 15420,
          rating: 4.8,
          author: 'DeFi Analytics Team',
          lastUpdated: '2024-01-15',
          isInstalled: false,
          license: 'MIT'
        },
        {
          id: 'multi-chain-bridge',
          name: 'Multi-Chain Bridge',
          version: '1.5.2',
          description: 'Cross-chain bridge supporting 15+ networks with atomic swaps and low fees',
          category: 'Bridge',
          tags: ['bridge', 'cross-chain', 'multichain', 'atomic-swaps'],
          inputs: [
            { key: 'sourceChain', type: 'select', label: 'Source Chain', required: true, options: [
              { label: 'Ethereum', value: 'ethereum' },
              { label: 'Polygon', value: 'polygon' },
              { label: 'Arbitrum', value: 'arbitrum' }
            ]},
            { key: 'targetChain', type: 'select', label: 'Target Chain', required: true, options: [
              { label: 'Ethereum', value: 'ethereum' },
              { label: 'Polygon', value: 'polygon' },
              { label: 'Arbitrum', value: 'arbitrum' }
            ]},
            { key: 'amount', type: 'number', label: 'Amount', required: true },
            { key: 'token', type: 'text', label: 'Token Address', required: true }
          ],
          outputs: [
            { key: 'bridgeTransaction', type: 'transaction', label: 'Bridge Transaction', required: true },
            { key: 'estimatedTime', type: 'number', label: 'Estimated Time (minutes)', required: false }
          ],
          executor: { type: 'defi', timeout: 60000 },
          downloads: 8930,
          rating: 4.6,
          author: 'CrossChain Labs',
          lastUpdated: '2024-01-20',
          isInstalled: false,
          license: 'Apache-2.0'
        },
        {
          id: 'ai-trading-signals',
          name: 'AI Trading Signals',
          version: '3.0.1',
          description: 'Machine learning-powered trading signals with 85% accuracy rate',
          category: 'Logic',
          tags: ['ai', 'trading', 'signals', 'ml', 'predictions'],
          inputs: [
            { key: 'pair', type: 'text', label: 'Trading Pair', required: true },
            { key: 'timeframe', type: 'select', label: 'Timeframe', required: true, options: [
              { label: '5 minutes', value: '5m' },
              { label: '15 minutes', value: '15m' },
              { label: '1 hour', value: '1h' },
              { label: '4 hours', value: '4h' }
            ]},
            { key: 'confidence', type: 'slider', label: 'Minimum Confidence', required: false, min: 0.5, max: 0.95, step: 0.05, defaultValue: 0.75 }
          ],
          outputs: [
            { key: 'signal', type: 'string', label: 'Signal (BUY/SELL/HOLD)', required: true },
            { key: 'confidence', type: 'number', label: 'Confidence Score', required: true },
            { key: 'analysis', type: 'object', label: 'Detailed Analysis', required: false }
          ],
          executor: { type: 'python', timeout: 45000 },
          downloads: 23150,
          rating: 4.9,
          author: 'AI Trade Pro',
          lastUpdated: '2024-01-25',
          isInstalled: true,
          license: 'Commercial'
        },
        {
          id: 'nft-portfolio-tracker',
          name: 'NFT Portfolio Tracker',
          version: '1.2.0',
          description: 'Track and analyze your NFT portfolio across multiple marketplaces',
          category: 'Analytics',
          tags: ['nft', 'portfolio', 'opensea', 'tracker'],
          inputs: [
            { key: 'walletAddress', type: 'text', label: 'Wallet Address', required: true },
            { key: 'marketplaces', type: 'multiselect', label: 'Marketplaces', required: false, options: [
              { label: 'OpenSea', value: 'opensea' },
              { label: 'Blur', value: 'blur' },
              { label: 'LooksRare', value: 'looksrare' }
            ]}
          ],
          outputs: [
            { key: 'portfolio', type: 'array', label: 'NFT Portfolio', required: true },
            { key: 'totalValue', type: 'number', label: 'Total Value (ETH)', required: true }
          ],
          executor: { type: 'api', endpoint: 'https://api.nfttracker.example.com', timeout: 30000 },
          downloads: 5670,
          rating: 4.3,
          author: 'NFT Tools Inc',
          lastUpdated: '2024-01-18',
          isInstalled: false,
          license: 'MIT'
        }
      ]

      // Mark installed plugins
      const installedIds = new Set(installedPlugins.map(p => p.id))
      const updatedPlugins = mockPlugins.map(plugin => ({
        ...plugin,
        isInstalled: installedIds.has(plugin.id)
      }))

      setMarketplacePlugins(updatedPlugins)
    } catch (error) {
      console.error('Failed to load marketplace plugins:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInstallPlugin = async (plugin: MarketplacePlugin) => {
    setInstalling(plugin.id)
    try {
      // Mock installation process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Register the plugin
      unitePluginSystem.registry.registerPlugin(plugin)
      
      // Update state
      setMarketplacePlugins(prev =>
        prev.map(p => p.id === plugin.id ? { ...p, isInstalled: true } : p)
      )
      
      await loadInstalledPlugins()
      
      console.log(`Plugin ${plugin.name} installed successfully`)
    } catch (error) {
      console.error('Failed to install plugin:', error)
    } finally {
      setInstalling(null)
    }
  }

  const handleUninstallPlugin = async (pluginId: string) => {
    setUninstalling(pluginId)
    try {
      // Mock uninstallation process
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Unregister the plugin
      // Note: This would need to be implemented in the plugin system
      console.log(`Uninstalling plugin: ${pluginId}`)
      
      // Update state
      setMarketplacePlugins(prev =>
        prev.map(p => p.id === pluginId ? { ...p, isInstalled: false } : p)
      )
      
      await loadInstalledPlugins()
      
      console.log(`Plugin ${pluginId} uninstalled successfully`)
    } catch (error) {
      console.error('Failed to uninstall plugin:', error)
    } finally {
      setUninstalling(null)
    }
  }

  const filteredMarketplacePlugins = marketplacePlugins.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "All" || plugin.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3 h-3 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      )
    }
    return stars
  }

  const renderPluginCard = (plugin: MarketplacePlugin) => (
    <Card key={plugin.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-sm font-semibold">{plugin.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">{plugin.category}</Badge>
              <Badge variant="secondary" className="text-xs">v{plugin.version}</Badge>
              {plugin.isInstalled && (
                <Badge className="text-xs bg-green-100 text-green-800">Installed</Badge>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedPlugin(plugin)}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-gray-600 line-clamp-2">{plugin.description}</p>
        
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            {renderStars(plugin.rating)}
            <span>({plugin.rating})</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            <span>{plugin.downloads.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{plugin.author}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {plugin.isInstalled ? (
            <Button
              onClick={() => handleUninstallPlugin(plugin.id)}
              disabled={uninstalling === plugin.id}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              {uninstalling === plugin.id ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Uninstalling...
                </>
              ) : (
                <>
                  <Trash2 className="w-3 h-3 mr-1" />
                  Uninstall
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => handleInstallPlugin(plugin)}
              disabled={installing === plugin.id}
              size="sm"
              className="flex-1"
            >
              {installing === plugin.id ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Installing...
                </>
              ) : (
                <>
                  <Download className="w-3 h-3 mr-1" />
                  Install
                </>
              )}
            </Button>
          )}
          <Button
            onClick={() => setSelectedPlugin(plugin)}
            variant="outline"
            size="sm"
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderInstalledPluginCard = (plugin: PluginDefinition) => (
    <Card key={plugin.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-sm font-semibold">{plugin.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">{plugin.category}</Badge>
              <Badge variant="secondary" className="text-xs">v{plugin.version}</Badge>
              <Badge className="text-xs bg-green-100 text-green-800">Active</Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const marketplacePlugin = marketplacePlugins.find(p => p.id === plugin.id)
              if (marketplacePlugin) {
                setSelectedPlugin(marketplacePlugin)
              }
            }}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-gray-600 line-clamp-2">{plugin.description}</p>
        
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Code className="w-3 h-3" />
            <span>{plugin.executor.type}</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            <span>{plugin.inputs.length} inputs</span>
          </div>
          <div className="flex items-center gap-1">
            <Package className="w-3 h-3" />
            <span>{plugin.outputs.length} outputs</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleUninstallPlugin(plugin.id)}
            disabled={uninstalling === plugin.id}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            {uninstalling === plugin.id ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Uninstalling...
              </>
            ) : (
              <>
                <Trash2 className="w-3 h-3 mr-1" />
                Uninstall
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Plugin Management
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="marketplace" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="marketplace">Plugin Marketplace</TabsTrigger>
            <TabsTrigger value="installed">
              Installed ({installedPlugins.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace" className="flex-1 flex flex-col space-y-4">
            {/* Search and Filters */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search plugins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <Button
                onClick={loadMarketplacePlugins}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Plugin Grid */}
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                  {filteredMarketplacePlugins.map(renderPluginCard)}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="installed" className="flex-1 flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {installedPlugins.length} plugins installed
              </p>
              <Button
                onClick={loadInstalledPlugins}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
            </div>

            <ScrollArea className="flex-1">
              {installedPlugins.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                  {installedPlugins.map(renderInstalledPluginCard)}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-gray-600">No plugins installed</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Browse the marketplace to install plugins
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Plugin Detail Dialog */}
        {selectedPlugin && (
          <Dialog open={!!selectedPlugin} onOpenChange={() => setSelectedPlugin(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedPlugin.name}
                  <Badge variant="secondary" className="text-xs">
                    v{selectedPlugin.version}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <ScrollArea className="max-h-96">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      {renderStars(selectedPlugin.rating)}
                      <span>({selectedPlugin.rating})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      <span>{selectedPlugin.downloads.toLocaleString()} downloads</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Updated {selectedPlugin.lastUpdated}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-gray-600">{selectedPlugin.description}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Author</h4>
                    <p className="text-sm text-gray-600">{selectedPlugin.author}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedPlugin.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">License</h4>
                    <p className="text-sm text-gray-600">{selectedPlugin.license}</p>
                  </div>

                  <div className="flex gap-2 pt-4">
                    {selectedPlugin.isInstalled ? (
                      <Button
                        onClick={() => handleUninstallPlugin(selectedPlugin.id)}
                        disabled={uninstalling === selectedPlugin.id}
                        variant="outline"
                        className="flex-1"
                      >
                        {uninstalling === selectedPlugin.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uninstalling...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Uninstall
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleInstallPlugin(selectedPlugin)}
                        disabled={installing === selectedPlugin.id}
                        className="flex-1"
                      >
                        {installing === selectedPlugin.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Installing...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Install
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      onClick={() => setSelectedPlugin(null)}
                      variant="outline"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  )
}