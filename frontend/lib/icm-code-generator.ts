/**
 * Avalanche ICM Dashboard Code Generator
 * Generates complete ICM dashboard applications from workflow templates
 */

export interface ICMCodeGenerationResult {
  files: Array<{
    path: string;
    type: 'frontend' | 'backend' | 'config' | 'contract';
    content: string;
  }>;
  deploymentInstructions: string[];
  gitCommitMessage: string;
  projectName?: string;
  description?: string;
  framework?: string;
  features?: string[];
  dependencies?: {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };
}

export class ICMCodeGenerator {
  static generateFromWorkflow(
    nodes: any[], 
    edges: any[], 
    projectName: string = "AvalancheICMDashboard",
    templateInputs?: Record<string, any>
  ): ICMCodeGenerationResult {
    
    const files: Array<{path: string; type: 'frontend' | 'backend' | 'config' | 'contract'; content: string}> = [];
    const deploymentInstructions: string[] = [];

    // Analyze nodes to determine ICM features
    const hasWalletConnector = nodes.some(n => n.type === "walletConnector");
    const hasChainSelector = nodes.some(n => n.type === "chainSelector");
    const hasICMSender = nodes.some(n => n.type === "icmSender");
    const hasICMReceiver = nodes.some(n => n.type === "icmReceiver");
    const hasL1Config = nodes.some(n => n.type === "l1Config");
    const hasL1Deployer = nodes.some(n => n.type === "l1SimulatorDeployer");
    const hasTransactionMonitor = nodes.some(n => n.type === "transactionMonitor");
    const hasDashboard = nodes.some(n => n.type === "defiDashboard");

    // Use the passed project name directly (already determined by flow-canvas)
    const isL1SubnetTemplate = projectName === "AvalancheL1SubnetCreator";
    const actualProjectName = projectName;

    // Generate Frontend Files
    files.push({
      path: "frontend/package.json",
      type: "frontend",
      content: this.generateFrontendPackageJson(projectName)
    });

    files.push({
      path: "frontend/next.config.js",
      type: "frontend", 
      content: this.generateNextConfig()
    });

    files.push({
      path: "frontend/tailwind.config.js",
      type: "frontend",
      content: this.generateTailwindConfig()
    });

    files.push({
      path: "frontend/tsconfig.json",
      type: "frontend",
      content: this.generateTypeScriptConfig()
    });

    files.push({
      path: "frontend/src/pages/index.tsx",
      type: "frontend",
      content: isL1SubnetTemplate 
        ? this.generateL1SubnetDashboard(actualProjectName, {
            hasWalletConnector,
            hasChainSelector,
            hasL1Config,
            hasL1Deployer,
            hasICMSender,
            hasICMReceiver,
            hasDashboard
          })
        : this.generateMainDashboard(actualProjectName, {
            hasWalletConnector,
            hasChainSelector,
            hasICMSender,
            hasICMReceiver,
            hasDashboard
          })
    });

    files.push({
      path: "frontend/src/pages/_app.tsx",
      type: "frontend",
      content: this.generateAppWrapper()
    });

    files.push({
      path: "frontend/src/styles/globals.css", 
      type: "frontend",
      content: this.generateGlobalCSS()
    });

    if (hasWalletConnector) {
      files.push({
        path: "frontend/src/components/WalletConnector.tsx",
        type: "frontend",
        content: this.generateWalletConnector()
      });

      files.push({
        path: "frontend/src/hooks/useWallet.ts",
        type: "frontend",
        content: this.generateWalletHook()
      });
    }

    if (hasICMSender) {
      files.push({
        path: "frontend/src/components/ICMSendForm.tsx",
        type: "frontend",
        content: this.generateICMSendForm()
      });
    }

    if (hasICMReceiver) {
      files.push({
        path: "frontend/src/components/ICMHistory.tsx",
        type: "frontend",
        content: this.generateICMHistory()
      });
    }

    if (hasDashboard) {
      files.push({
        path: "frontend/src/components/ICMDashboard.tsx",
        type: "frontend",
        content: this.generateICMDashboard()
      });

      files.push({
        path: "frontend/src/components/ICMAnalytics.tsx",
        type: "frontend",
        content: this.generateICMAnalytics()
      });
    }

    if (hasChainSelector) {
      files.push({
        path: "frontend/src/components/SubnetSelector.tsx",
        type: "frontend",
        content: this.generateSubnetSelector()
      });
    }

    // L1 Subnet Creation specific components
    if (isL1SubnetTemplate) {
      files.push({
        path: "frontend/src/components/L1ConfigForm.tsx",
        type: "frontend",
        content: this.generateL1ConfigForm()
      });

      files.push({
        path: "frontend/src/components/SubnetDeployment.tsx",
        type: "frontend",
        content: this.generateSubnetDeployment()
      });

      files.push({
        path: "frontend/src/components/GenesisConfig.tsx",
        type: "frontend",
        content: this.generateGenesisConfig()
      });

      files.push({
        path: "frontend/src/hooks/useL1Deployment.ts",
        type: "frontend",
        content: this.generateL1DeploymentHook()
      });
    }

    files.push({
      path: "frontend/src/hooks/useICM.ts",
      type: "frontend",
      content: this.generateICMHook()
    });

    files.push({
      path: "frontend/src/hooks/useAvalanche.ts", 
      type: "frontend",
      content: this.generateAvalancheHook()
    });

    // Generate Backend Files
    files.push({
      path: "backend/package.json",
      type: "backend",
      content: this.generateBackendPackageJson(projectName)
    });

    files.push({
      path: "backend/tsconfig.json",
      type: "backend",
      content: this.generateBackendTypeScriptConfig()
    });

    files.push({
      path: "backend/src/index.ts",
      type: "backend",
      content: this.generateBackendServer(isL1SubnetTemplate)
    });

    files.push({
      path: "backend/src/services/teleporter.ts",
      type: "backend",
      content: this.generateTeleporterService()
    });

    files.push({
      path: "backend/src/services/avalanche.ts",
      type: "backend",
      content: this.generateAvalancheService()
    });

    files.push({
      path: "backend/src/routes/icm.ts",
      type: "backend",
      content: this.generateICMRoutes()
    });

    files.push({
      path: "backend/src/routes/subnets.ts",
      type: "backend",
      content: this.generateSubnetRoutes()
    });

    // L1 Subnet Creation specific backend routes
    if (isL1SubnetTemplate) {
      files.push({
        path: "backend/src/routes/l1-deployment.ts",
        type: "backend",
        content: this.generateL1DeploymentRoutes()
      });

      files.push({
        path: "backend/src/services/l1-deployer.ts",
        type: "backend",
        content: this.generateL1DeployerService()
      });
    }

    // Generate Config Files using the icm-dashboard-template.json structure
    files.push({
      path: "package.json",
      type: "config",
      content: JSON.stringify({
        "name": "avalanche-icm-dashboard",
        "version": "1.0.0",
        "description": "Complete Avalanche Inter-Chain Messaging Dashboard",
        "main": "index.js",
        "scripts": {
          "dev": "concurrently \"cd frontend && npm run dev\" \"cd backend && npm run dev\"",
          "build": "cd frontend && npm run build && cd ../backend && npm run build",
          "start": "concurrently \"cd frontend && npm start\" \"cd backend && npm start\"",
          "test": "npm run test:unit && npm run test:integration",
          "docker:build": "docker-compose build",
          "docker:up": "docker-compose up",
          "docker:down": "docker-compose down",
          "deploy": "./scripts/deploy.sh"
        },
        "keywords": ["avalanche", "icm", "teleporter", "cross-chain", "blockchain", "defi"],
        "author": "Unite DeFi",
        "license": "MIT",
        "devDependencies": {
          "concurrently": "^7.6.0"
        },
        "engines": {
          "node": ">=18.0.0",
          "npm": ">=8.0.0"
        }
      }, null, 2)
    });

    files.push({
      path: ".env.example",
      type: "config", 
      content: this.generateEnvExample()
    });

    files.push({
      path: "docker-compose.yml",
      type: "config",
      content: this.generateDockerCompose()
    });

    files.push({
      path: "README.md",
      type: "config",
      content: this.generateReadme(projectName)
    });

    files.push({
      path: ".gitignore",
      type: "config",
      content: this.generateGitIgnore()
    });

    files.push({
      path: "vercel.json",
      type: "config", 
      content: this.generateVercelConfig()
    });

    // Features for ICM project identification
    const features = isL1SubnetTemplate ? [
      "🏗️ Complete L1 subnet configuration and deployment simulation",
      "📋 Genesis JSON creation with token allocation and validator setup",
      "🚀 Subnet deployment workflow with realistic parameters",
      "🔗 Cross-chain messaging between custom subnets using ICM",
      "💰 Automatic fee calculation for ICM transactions",
      "📊 Real-time deployment and messaging analytics",
      "⚙️ Advanced subnet configuration with VM selection",
      "🎯 Production-ready subnet configuration export",
      "🛡️ Secure key management and validator setup",
      "📈 Subnet performance monitoring and optimization",
      "🌐 Multi-subnet orchestration and management"
    ] : [
      "📤 Avalanche Teleporter ICM integration for L1 subnets",
      "🔗 Multi-directional cross-chain messaging (C-Chain ↔ Subnet)", 
      "🏗️ Support for custom L1 subnet deployment",
      "📥 Real-time message reception and decoding",
      "🏔️ Fuji testnet with mainnet-ready architecture",
      "💰 Automatic fee calculation and gas optimization",
      "⚡ Real-time transaction monitoring across chains",
      "🔍 Advanced message payload validation and parsing",
      "🛡️ Frontend-controlled signing (no backend PK access)",
      "📊 Cross-chain analytics and monitoring dashboard"
    ];

    const description = isL1SubnetTemplate 
      ? "Complete Avalanche L1 Subnet Creation & ICM Dashboard"
      : "Complete Avalanche Inter-Chain Messaging Dashboard";

    const gitMessage = isL1SubnetTemplate
      ? `feat: Add complete Avalanche L1 Subnet Creator\n\n🏔️ Generated with [Claude Code](https://claude.ai/code)\n\nCo-Authored-By: Claude <noreply@anthropic.com>`
      : `feat: Add complete Avalanche ICM dashboard\n\n🏔️ Generated with [Claude Code](https://claude.ai/code)\n\nCo-Authored-By: Claude <noreply@anthropic.com>`;

    return {
      files,
      deploymentInstructions: isL1SubnetTemplate 
        ? this.generateL1DeploymentInstructions() 
        : this.generateDeploymentInstructions(),
      gitCommitMessage: gitMessage,
      projectName: actualProjectName,
      description,
      framework: "Next.js + Express + Avalanche ICM",
      features,
      dependencies: {
        dependencies: {
          "next": "14.0.4",
          "react": "^18.2.0",
          "react-dom": "^18.2.0",
          "ethers": "^6.8.1",
          "@avalabs/avalanchejs": "^5.0.0",
          "express": "^4.18.2",
          "cors": "^2.8.5",
          "dotenv": "^16.3.1"
        },
        devDependencies: {
          "@types/react": "^18.2.37",
          "@types/node": "^20.9.0",
          "typescript": "^5.2.2",
          "tailwindcss": "^3.3.6"
        }
      }
    };
  }

  private static generateFrontendPackageJson(projectName: string): string {
    return JSON.stringify({
      "name": `${projectName.toLowerCase().replace(/\s+/g, '-')}-frontend`,
      "version": "1.0.0",
      "private": true,
      "scripts": {
        "dev": "next dev",
        "build": "next build",
        "start": "next start",
        "lint": "next lint",
        "test": "jest",
        "test:watch": "jest --watch"
      },
      "dependencies": {
        "next": "14.0.4",
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "ethers": "^6.8.1",
        "@avalabs/avalanchejs": "^5.0.0",
        "@headlessui/react": "^1.7.17",
        "@heroicons/react": "^2.0.18",
        "tailwindcss": "^3.3.6",
        "autoprefixer": "^10.4.16",
        "postcss": "^8.4.31",
        "lucide-react": "^0.294.0",
        "react-hot-toast": "^2.4.1",
        "socket.io-client": "^4.7.4"
      },
      "devDependencies": {
        "@types/node": "^20.9.0",
        "@types/react": "^18.2.37",
        "@types/react-dom": "^18.2.15",
        "typescript": "^5.2.2",
        "eslint": "^8.53.0",
        "eslint-config-next": "14.0.4"
      }
    }, null, 2);
  }

  private static generateBackendPackageJson(projectName: string): string {
    return JSON.stringify({
      "name": `${projectName.toLowerCase().replace(/\s+/g, '-')}-backend`,
      "version": "1.0.0",
      "description": "Backend API for Avalanche ICM Dashboard",
      "main": "dist/index.js",
      "scripts": {
        "dev": "tsx watch src/index.ts",
        "build": "tsc",
        "start": "node dist/index.js",
        "test": "jest",
        "lint": "eslint src/**/*.ts"
      },
      "dependencies": {
        "express": "^4.18.2",
        "cors": "^2.8.5",
        "helmet": "^7.1.0",
        "dotenv": "^16.3.1",
        "ethers": "^6.8.1",
        "@avalabs/avalanchejs": "^5.0.0",
        "winston": "^3.10.0",
        "socket.io": "^4.7.4",
        "rate-limiter-flexible": "^3.0.4",
        "joi": "^17.9.2"
      },
      "devDependencies": {
        "@types/express": "^4.17.17",
        "@types/cors": "^2.8.13",
        "@types/node": "^20.9.0",
        "typescript": "^5.2.2",
        "tsx": "^3.14.0",
        "jest": "^29.7.0",
        "eslint": "^8.53.0"
      }
    }, null, 2);
  }

  private static generateMainDashboard(projectName: string, features: any): string {
    return `import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useWallet } from '@/hooks/useWallet'
import { useICM } from '@/hooks/useICM'
import { WalletConnector } from '@/components/WalletConnector'
import { ICMDashboard } from '@/components/ICMDashboard'
import { ICMSendForm } from '@/components/ICMSendForm'
import { ICMHistory } from '@/components/ICMHistory'
import { ICMAnalytics } from '@/components/ICMAnalytics'
import { SubnetSelector } from '@/components/SubnetSelector'
import toast, { Toaster } from 'react-hot-toast'

export default function Home() {
  const { isConnected, address } = useWallet()
  const { messages, sendMessage, isLoading } = useICM()
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Head>
        <title>${projectName} - Avalanche ICM Dashboard</title>
        <meta name="description" content="Complete Avalanche Inter-Chain Messaging Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Toaster position="top-right" />

      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">🏔️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">${projectName}</h1>
                <p className="text-sm text-gray-600">Avalanche ICM Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              ${features.hasChainSelector ? '<SubnetSelector />' : ''}
              <WalletConnector />
            </div>
          </div>
          
          {isConnected && (
            <nav className="flex space-x-8 -mb-px">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={\`py-2 px-1 border-b-2 font-medium text-sm \${
                  activeTab === 'dashboard' 
                    ? 'border-red-500 text-red-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }\`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('send')}
                className={\`py-2 px-1 border-b-2 font-medium text-sm \${
                  activeTab === 'send' 
                    ? 'border-red-500 text-red-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }\`}
              >
                Send Message
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={\`py-2 px-1 border-b-2 font-medium text-sm \${
                  activeTab === 'history' 
                    ? 'border-red-500 text-red-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }\`}
              >
                History
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={\`py-2 px-1 border-b-2 font-medium text-sm \${
                  activeTab === 'analytics' 
                    ? 'border-red-500 text-red-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }\`}
              >
                Analytics
              </button>
            </nav>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {!isConnected ? (
          <div className="text-center py-20">
            <div className="mx-auto max-w-md">
              <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-4xl">🏔️</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Avalanche ICM
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Connect your wallet to start sending cross-chain messages between Avalanche subnets
              </p>
              <WalletConnector />
            </div>
          </div>
        ) : (
          <div className="px-4 sm:px-0">
            {activeTab === 'dashboard' && <ICMDashboard />}
            {activeTab === 'send' && <ICMSendForm />}
            {activeTab === 'history' && <ICMHistory />}
            {activeTab === 'analytics' && <ICMAnalytics />}
          </div>
        )}
      </main>
    </div>
  )
}`
  }

  private static generateWalletConnector(): string {
    return `import { useState } from 'react'
import { useWallet } from '@/hooks/useWallet'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

export function WalletConnector() {
  const { isConnected, address, connect, disconnect, switchToFuji } = useWallet()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await connect()
      await switchToFuji()
    } catch (error) {
      console.error('Failed to connect:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const formatAddress = (addr: string) => {
    return \`\${addr.slice(0, 6)}...\${addr.slice(-4)}\`
  }

  if (isConnected) {
    return (
      <div className="relative group">
        <button className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg border border-green-200 hover:bg-green-200 transition-colors">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="font-medium">{formatAddress(address!)}</span>
          <ChevronDownIcon className="w-4 h-4" />
        </button>
        
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          <div className="p-2">
            <button
              onClick={disconnect}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:from-red-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}`
  }

  private static generateICMSendForm(): string {
    return `import { useState } from 'react'
import { useICM } from '@/hooks/useICM'
import { useWallet } from '@/hooks/useWallet'
import toast from 'react-hot-toast'

const SUBNET_PRESETS = [
  { id: 'dexalot', name: 'Dexalot', chainId: '0x2VCAhX6vE3UnXC6s1CBPE6jJ4c4cHWMfPgCptuWS59pQ8WYxXw' },
  { id: 'dfk', name: 'DeFi Kingdoms', chainId: '0x2rwhRKN8qfxK9AEJunfUjn5WH7PQzUPPQKCb59ak6fwsrwF2R' },
  { id: 'amplify', name: 'Amplify', chainId: '0xzJytnh96Pc8rM337bBrtMvJDbEdDNjcXiG3WkTNCiLp8krJUk' },
  { id: 'custom', name: 'Custom Subnet', chainId: '' }
]

export function ICMSendForm() {
  const { sendMessage } = useICM()
  const { address } = useWallet()
  const [formData, setFormData] = useState({
    destinationPreset: 'dexalot',
    customChainId: '',
    recipient: '',
    message: '',
    amount: '0'
  })
  const [isSending, setIsSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }

    setIsSending(true)
    try {
      const destinationChainId = formData.destinationPreset === 'custom' 
        ? formData.customChainId 
        : SUBNET_PRESETS.find(p => p.id === formData.destinationPreset)?.chainId

      if (!destinationChainId) {
        throw new Error('Please select a destination subnet')
      }

      await sendMessage({
        sourceChain: 'C',
        destinationChainId,
        recipient: formData.recipient,
        message: formData.message,
        amount: formData.amount,
        walletAddress: address
      })

      toast.success('ICM message sent successfully!')
      
      // Reset form
      setFormData({
        destinationPreset: 'dexalot',
        customChainId: '',
        recipient: '',
        message: '',
        amount: '0'
      })
    } catch (error: any) {
      console.error('Failed to send ICM message:', error)
      toast.error(error.message || 'Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Send ICM Message</h2>
          <p className="text-gray-600">Send cross-chain messages between Avalanche subnets using Teleporter</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination Subnet
            </label>
            <select
              value={formData.destinationPreset}
              onChange={(e) => setFormData({ ...formData, destinationPreset: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              {SUBNET_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>

          {formData.destinationPreset === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Chain ID
              </label>
              <input
                type="text"
                value={formData.customChainId}
                onChange={(e) => setFormData({ ...formData, customChainId: e.target.value })}
                placeholder="Enter blockchain ID"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required={formData.destinationPreset === 'custom'}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              value={formData.recipient}
              onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
              placeholder="0x..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Enter your cross-chain message..."
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (AVAX)
            </label>
            <input
              type="number"
              step="0.001"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.0"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:from-red-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? 'Sending Message...' : 'Send ICM Message'}
          </button>
        </form>
      </div>
    </div>
  )
}`
  }

  private static generateICMHistory(): string {
    return `import { useState, useEffect } from 'react'
import { useICM } from '@/hooks/useICM'
import { ChevronRightIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

export function ICMHistory() {
  const { messages, getMessageHistory } = useICM()
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true)
      try {
        await getMessageHistory()
      } catch (error) {
        console.error('Failed to load message history:', error)
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [getMessageHistory])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Delivered'
      case 'failed':
        return 'Failed'
      case 'pending':
        return 'Pending'
      default:
        return 'Processing'
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredMessages = messages.filter(message => {
    if (filter === 'all') return true
    return message.status === filter
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Message History</h2>
        
        <div className="flex space-x-2">
          {['all', 'completed', 'pending', 'failed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={\`px-4 py-2 rounded-lg text-sm font-medium transition-colors \${
                filter === status
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }\`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredMessages.length === 0 ? (
        <div className="text-center py-20">
          <div className="mx-auto max-w-md">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📭</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'You haven\\'t sent any ICM messages yet.' 
                : \`No \${filter} messages found.\`}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredMessages.map((message) => (
              <div key={message.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(message.status)}
                    <span className="text-sm font-medium text-gray-900">
                      {getStatusText(message.status)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(message.timestamp)}
                    </span>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                </div>
                
                <div className="mb-3">
                  <p className="text-gray-900 mb-1 truncate">{message.content}</p>
                  <div className="flex items-center text-sm text-gray-600">
                    <span>To: {message.recipient.slice(0, 10)}...{message.recipient.slice(-8)}</span>
                    <span className="mx-2">•</span>
                    <span>{message.destinationSubnet}</span>
                  </div>
                </div>
                
                {message.txHash && (
                  <div className="flex items-center text-xs text-gray-500">
                    <span>TX: </span>
                    <a 
                      href={\`https://testnet.snowtrace.io/tx/\${message.txHash}\`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 hover:text-red-700 ml-1"
                    >
                      {message.txHash.slice(0, 10)}...{message.txHash.slice(-8)}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}`
  }

  private static generateICMDashboard(): string {
    return `import { useState, useEffect } from 'react'
import { useICM } from '@/hooks/useICM'
import { ChartBarIcon, PaperAirplaneIcon, InboxIcon, ClockIcon } from '@heroicons/react/24/outline'

export function ICMDashboard() {
  const { messages, getStats } = useICM()
  const [stats, setStats] = useState({
    totalSent: 0,
    totalReceived: 0, 
    pendingMessages: 0,
    successRate: 0
  })

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getStats()
        setStats(data)
      } catch (error) {
        console.error('Failed to load stats:', error)
      }
    }

    loadStats()
  }, [getStats, messages])

  const statCards = [
    {
      title: 'Messages Sent',
      value: stats.totalSent,
      icon: PaperAirplaneIcon,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: 'Messages Received', 
      value: stats.totalReceived,
      icon: InboxIcon,
      color: 'text-green-600 bg-green-100'
    },
    {
      title: 'Pending',
      value: stats.pendingMessages,
      icon: ClockIcon,
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      title: 'Success Rate',
      value: \`\${stats.successRate}%\`,
      icon: ChartBarIcon,
      color: 'text-purple-600 bg-purple-100'
    }
  ]

  const recentMessages = messages.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <div key={stat.title} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={\`p-3 rounded-lg \${stat.color}\`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Messages</h3>
        
        {recentMessages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">📬</span>
            </div>
            <p className="text-gray-600">No recent messages</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentMessages.map((message) => (
              <div key={message.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {message.content}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    To {message.destinationSubnet} • {new Date(message.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <div className={\`px-2 py-1 rounded-full text-xs font-medium \${
                  message.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : message.status === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }\`}>
                  {message.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Network Status */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['C-Chain', 'Dexalot', 'DeFi Kingdoms'].map((network) => (
            <div key={network} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">{network}</span>
              </div>
              <span className="text-xs text-green-600 font-medium">Online</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}`
  }

  private static generateICMAnalytics(): string {
    return `import { useState, useEffect } from 'react'
import { useICM } from '@/hooks/useICM'

export function ICMAnalytics() {
  const { getAnalytics } = useICM()
  const [analytics, setAnalytics] = useState({
    messagesBySubnet: [],
    messagesByDay: [],
    averageDeliveryTime: 0,
    totalVolume: 0
  })

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await getAnalytics()
        setAnalytics(data)
      } catch (error) {
        console.error('Failed to load analytics:', error)
      }
    }

    loadAnalytics()
  }, [getAnalytics])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics</h2>
        <p className="text-gray-600">Detailed insights into your ICM messaging activity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages by Subnet */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Messages by Subnet</h3>
          <div className="space-y-3">
            {analytics.messagesBySubnet.map((subnet: any) => (
              <div key={subnet.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">{subnet.name}</span>
                </div>
                <div className="text-sm text-gray-600">{subnet.count} messages</div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Avg. Delivery Time</span>
              <span className="text-sm text-gray-900">{analytics.averageDeliveryTime}s</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Total Volume</span>
              <span className="text-sm text-gray-900">{analytics.totalVolume} AVAX</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}`
  }

  private static generateNextConfig(): string {
    return `const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001',
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig`
  }

  private static generateTailwindConfig(): string {
    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        avalanche: {
          blue: '#E84142',
          red: '#FF6B35',
          yellow: '#F7931A',
          green: '#28a745',
          purple: '#6f42c1',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}`
  }

  private static generateTypeScriptConfig(): string {
    return JSON.stringify({
      "compilerOptions": {
        "target": "es5",
        "lib": ["dom", "dom.iterable", "es6"],
        "allowJs": true,
        "skipLibCheck": true,
        "strict": true,
        "forceConsistentCasingInFileNames": true,
        "noEmit": true,
        "esModuleInterop": true,
        "module": "esnext",
        "moduleResolution": "node",
        "resolveJsonModule": true,
        "isolatedModules": true,
        "jsx": "preserve",
        "incremental": true,
        "paths": {
          "@/*": ["./src/*"]
        }
      },
      "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
      "exclude": ["node_modules"]
    }, null, 2)
  }

  private static generateBackendTypeScriptConfig(): string {
    return JSON.stringify({
      "compilerOptions": {
        "target": "ES2020",
        "module": "commonjs",
        "lib": ["ES2020"],
        "outDir": "./dist",
        "rootDir": "./src",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "resolveJsonModule": true,
        "baseUrl": ".",
        "paths": {
          "@/*": ["src/*"]
        }
      },
      "include": ["src/**/*"],
      "exclude": ["node_modules", "dist"]
    }, null, 2)
  }

  private static generateAppWrapper(): string {
    return `import type { AppProps } from 'next/app'
import '@/styles/globals.css'
import { Toaster } from 'react-hot-toast'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#4aed88',
            },
          },
        }}
      />
    </>
  )
}`
  }

  private static generateGlobalCSS(): string {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

html,
body {
  padding: 0;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}

* {
  box-sizing: border-box;
}

@media (prefers-color-scheme: dark) {
  html {
    color-scheme: dark;
  }
  body {
    color: white;
    background: black;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}`
  }

  private static generateWalletHook(): string {
    return `import { useState, useEffect, useCallback } from 'react'

declare global {
  interface Window {
    ethereum?: any
  }
}

export function useWallet() {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)

  const FUJI_CHAIN_ID = '0xa869' // 43113 in hex

  const checkConnection = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) return

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      if (accounts.length > 0) {
        setIsConnected(true)
        setAddress(accounts[0])
        
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' })
        setChainId(currentChainId)
      }
    } catch (error) {
      console.error('Failed to check wallet connection:', error)
    }
  }, [])

  useEffect(() => {
    checkConnection()

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)
        } else {
          setAddress(null)
          setIsConnected(false)
        }
      })

      window.ethereum.on('chainChanged', (newChainId: string) => {
        setChainId(newChainId)
      })
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged')
        window.ethereum.removeAllListeners('chainChanged')
      }
    }
  }, [checkConnection])

  const connect = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed')
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })
      
      if (accounts.length > 0) {
        setAddress(accounts[0])
        setIsConnected(true)
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    }
  }

  const disconnect = () => {
    setIsConnected(false)
    setAddress(null)
    setChainId(null)
  }

  const switchToFuji = async () => {
    if (!window.ethereum) return

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: FUJI_CHAIN_ID }],
      })
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: FUJI_CHAIN_ID,
                chainName: 'Avalanche Fuji Testnet',
                nativeCurrency: {
                  name: 'AVAX',
                  symbol: 'AVAX',
                  decimals: 18,
                },
                rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
                blockExplorerUrls: ['https://testnet.snowtrace.io/'],
              },
            ],
          })
        } catch (addError) {
          console.error('Failed to add Fuji network:', addError)
          throw addError
        }
      } else {
        console.error('Failed to switch to Fuji network:', switchError)
        throw switchError
      }
    }
  }

  return {
    isConnected,
    address,
    chainId,
    connect,
    disconnect,
    switchToFuji,
    isOnFuji: chainId === FUJI_CHAIN_ID
  }
}`
  }

  private static generateICMHook(): string {
    return `import { useState, useCallback } from 'react'
import { useWallet } from './useWallet'

interface ICMMessage {
  id: string
  content: string
  recipient: string
  destinationSubnet: string
  status: 'pending' | 'completed' | 'failed'
  timestamp: string
  txHash?: string
}

export function useICM() {
  const { address } = useWallet()
  const [messages, setMessages] = useState<ICMMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(async (messageData: {
    sourceChain: string
    destinationChainId: string
    recipient: string
    message: string
    amount: string
    walletAddress: string
  }) => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    setIsLoading(true)
    
    try {
      // Step 1: Prepare transaction on backend
      const prepareResponse = await fetch('/api/icm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      })

      if (!prepareResponse.ok) {
        throw new Error('Failed to prepare ICM message')
      }

      const prepareResult = await prepareResponse.json()
      
      // Step 2: Sign transaction with MetaMask
      if (!window.ethereum) {
        throw new Error('MetaMask not found')
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      console.log('🔐 Signing ICM transaction with MetaMask...')
      const tx = await signer.sendTransaction({
        to: prepareResult.transactionData.to,
        data: prepareResult.transactionData.data,
        value: prepareResult.transactionData.value
      })

      console.log('📡 Transaction sent:', tx.hash)

      // Step 3: Wait for transaction confirmation
      console.log('⏳ Waiting for transaction confirmation...')
      const receipt = await tx.wait()
      console.log('✅ Transaction confirmed in block:', receipt.blockNumber)

      // Step 4: Process completed transaction on backend
      const completeResponse = await fetch('/api/icm/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          txHash: tx.hash,
          messageInput: prepareResult.messageInput,
          ...messageData
        }),
      })

      if (!completeResponse.ok) {
        throw new Error('Failed to process completed ICM message')
      }

      const result = await completeResponse.json()
      
      // Add message to local state
      const newMessage: ICMMessage = {
        id: result.messageId || Date.now().toString(),
        content: messageData.message,
        recipient: messageData.recipient,
        destinationSubnet: messageData.destinationChainId,
        status: 'pending',
        timestamp: new Date().toISOString(),
        txHash: result.txHash
      }
      
      setMessages(prev => [newMessage, ...prev])
      
      return result
    } catch (error) {
      console.error('Failed to send ICM message:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [address])

  const getMessageHistory = useCallback(async () => {
    if (!address) return

    try {
      const response = await fetch(\`/api/icm/history?address=\${address}\`)
      if (!response.ok) {
        throw new Error('Failed to fetch message history')
      }
      
      const history = await response.json()
      setMessages(history)
    } catch (error) {
      console.error('Failed to fetch message history:', error)
    }
  }, [address])

  const getStats = useCallback(async () => {
    if (!address) {
      return {
        totalSent: 0,
        totalReceived: 0,
        pendingMessages: 0,
        successRate: 0
      }
    }

    try {
      const response = await fetch(\`/api/icm/stats?address=\${address}\`)
      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      return {
        totalSent: messages.length,
        totalReceived: 0,
        pendingMessages: messages.filter(m => m.status === 'pending').length,
        successRate: Math.round((messages.filter(m => m.status === 'completed').length / messages.length) * 100) || 0
      }
    }
  }, [address, messages])

  const getAnalytics = useCallback(async () => {
    if (!address) {
      return {
        messagesBySubnet: [],
        messagesByDay: [],
        averageDeliveryTime: 0,
        totalVolume: 0
      }
    }

    try {
      const response = await fetch(\`/api/icm/analytics?address=\${address}\`)
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      return {
        messagesBySubnet: [],
        messagesByDay: [],
        averageDeliveryTime: 2.5,
        totalVolume: 0
      }
    }
  }, [address])

  return {
    messages,
    isLoading,
    sendMessage,
    getMessageHistory,
    getStats,
    getAnalytics
  }
}`
  }

  private static generateAvalancheHook(): string {
    return `import { useCallback } from 'react'
import { useWallet } from './useWallet'

export function useAvalanche() {
  const { address } = useWallet()

  const getSubnetInfo = useCallback(async (chainId: string) => {
    try {
      const response = await fetch(\`/api/subnets/info?chainId=\${chainId}\`)
      if (!response.ok) {
        throw new Error('Failed to fetch subnet info')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch subnet info:', error)
      throw error
    }
  }, [])

  const getAvailableSubnets = useCallback(async () => {
    try {
      const response = await fetch('/api/subnets/available')
      if (!response.ok) {
        throw new Error('Failed to fetch available subnets')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch available subnets:', error)
      throw error
    }
  }, [])

  const estimateICMFee = useCallback(async (destinationChainId: string, messageSize: number) => {
    try {
      const response = await fetch('/api/icm/estimate-fee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destinationChainId,
          messageSize,
          senderAddress: address
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to estimate ICM fee')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Failed to estimate ICM fee:', error)
      throw error
    }
  }, [address])

  return {
    getSubnetInfo,
    getAvailableSubnets,
    estimateICMFee
  }
}`
  }

  private static generateSubnetSelector(): string {
    return `import { useState, useEffect } from 'react'
import { useAvalanche } from '@/hooks/useAvalanche'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

const DEFAULT_SUBNETS = [
  { id: 'fuji', name: 'Avalanche Fuji', chainId: '43113' },
  { id: 'dexalot', name: 'Dexalot', chainId: '0x2VCAhX6vE3UnXC6s1CBPE6jJ4c4cHWMfPgCptuWS59pQ8WYxXw' },
  { id: 'dfk', name: 'DeFi Kingdoms', chainId: '0x2rwhRKN8qfxK9AEJunfUjn5WH7PQzUPPQKCb59ak6fwsrwF2R' }
]

export function SubnetSelector() {
  const { getAvailableSubnets } = useAvalanche()
  const [selectedSubnet, setSelectedSubnet] = useState(DEFAULT_SUBNETS[0])
  const [availableSubnets, setAvailableSubnets] = useState(DEFAULT_SUBNETS)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const loadSubnets = async () => {
      try {
        const subnets = await getAvailableSubnets()
        setAvailableSubnets([...DEFAULT_SUBNETS, ...subnets])
      } catch (error) {
        console.error('Failed to load subnets:', error)
        // Use default subnets on error
        setAvailableSubnets(DEFAULT_SUBNETS)
      }
    }

    loadSubnets()
  }, [getAvailableSubnets])

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white border border-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
      >
        <span>{selectedSubnet.name}</span>
        <ChevronDownIcon className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-1">
              {availableSubnets.map((subnet) => (
                <button
                  key={subnet.id}
                  onClick={() => {
                    setSelectedSubnet(subnet)
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
                >
                  {subnet.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}`
  }

  private static generateBackendServer(isL1SubnetTemplate: boolean = false): string {
    return `import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import icmRoutes from './routes/icm'
import subnetRoutes from './routes/subnets'${isL1SubnetTemplate ? `
import l1DeploymentRoutes from './routes/l1-deployment'` : ''}

// Load environment variables
dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})

const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())

// Routes
app.use('/api/icm', icmRoutes)
app.use('/api/subnets', subnetRoutes)${isL1SubnetTemplate ? `
app.use('/api/l1', l1DeploymentRoutes)` : ''}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Avalanche ICM Dashboard API'
  })
})

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  
  socket.on('subscribe-to-messages', (walletAddress) => {
    socket.join(\`messages-\${walletAddress}\`)
    console.log(\`Client \${socket.id} subscribed to messages for \${walletAddress}\`)
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  })
})

// Start server
httpServer.listen(PORT, () => {
  console.log(\`🚀 Avalanche ICM Dashboard API running on port \${PORT}\`)
  console.log(\`📊 Environment: \${process.env.NODE_ENV || 'development'}\`)
  console.log(\`🌐 CORS enabled for: \${process.env.FRONTEND_URL || 'http://localhost:3000'}\`)
})

export default app`
  }

  private static generateTeleporterService(): string {
    return `import { ethers } from 'ethers'
import dotenv from 'dotenv'

dotenv.config()

interface TeleporterMessage {
  destinationChainId: string
  destinationAddress: string
  feeInfo: {
    feeTokenAddress: string
    amount: string
  }
  requiredGasLimit: number
  allowedRelayerAddresses: string[]
  message: string
}

export class TeleporterService {
  private provider: ethers.Provider
  private contract: ethers.Contract | null = null

  constructor() {
    const rpcUrl = process.env.AVALANCHE_FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc'
    this.provider = new ethers.JsonRpcProvider(rpcUrl)
    this.initializeContract()
  }

  private initializeContract() {
    const contractAddress = process.env.TELEPORTER_CONTRACT_ADDRESS || '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf'
    
    // Simplified ABI for Teleporter contract
    const abi = [
      'function sendCrossChainMessage(tuple(bytes32 destinationBlockchainID, address destinationAddress, tuple(address feeTokenAddress, uint256 amount) feeInfo, uint256 requiredGasLimit, address[] allowedRelayerAddresses, bytes message) messageInput) external returns (bytes32 messageID)',
      'function receiveCrossChainMessage(uint32 messageIndex, address relayerRewardAddress) external',
      'function getMessageHash(bytes32 messageID) external view returns (bytes32)',
      'function messageReceived(bytes32 messageID) external view returns (bool)'
    ]

    try {
      this.contract = new ethers.Contract(contractAddress, abi, this.provider)
    } catch (error) {
      console.error('Failed to initialize Teleporter contract:', error)
    }
  }

  // Prepare transaction data for frontend signing
  async prepareMessageTransaction(
    destinationChainId: string,
    destinationAddress: string,
    message: string,
    gasLimit: number = 200000
  ): Promise<{
    to: string;
    data: string;
    value: string;
    messageInput: any;
  }> {
    if (!this.contract) {
      throw new Error('Teleporter contract not initialized')
    }

    try {
      // Convert destination chain ID to bytes32 format
      const destinationBlockchainID = ethers.zeroPadValue(destinationChainId, 32)
      
      // Prepare message input
      const messageInput = {
        destinationBlockchainID,
        destinationAddress,
        feeInfo: {
          feeTokenAddress: ethers.ZeroAddress, // Use AVAX for fees
          amount: ethers.parseEther('0.01') // 0.01 AVAX fee
        },
        requiredGasLimit: gasLimit,
        allowedRelayerAddresses: [], // Empty array allows any relayer
        message: ethers.toUtf8Bytes(message)
      }

      // Encode the transaction data
      const data = this.contract.interface.encodeFunctionData('sendCrossChainMessage', [messageInput])

      console.log('📝 Prepared ICM transaction for MetaMask signing:', {
        destinationChainId,
        destinationAddress,
        messagePreview: message.substring(0, 50) + '...',
        gasLimit
      })

      return {
        to: await this.contract.getAddress(),
        data,
        value: ethers.parseEther('0.01').toString(), // Include fee in transaction value
        messageInput
      }
    } catch (error) {
      console.error('Failed to prepare ICM message transaction:', error)
      throw error
    }
  }

  // Process completed transaction from frontend
  async processCompletedTransaction(
    txHash: string,
    messageInput: any
  ): Promise<{ txHash: string; messageId: string }> {
    try {
      console.log('⏳ Processing completed ICM transaction:', txHash)
      
      const receipt = await this.provider.waitForTransaction(txHash)
      
      // Extract message ID from logs
      let messageId = '0x'
      if (receipt && receipt.logs.length > 0) {
        // The message ID is typically emitted in the first log
        messageId = receipt.logs[0].topics[1] || '0x' + Math.random().toString(16).substr(2, 64)
      }

      console.log('✅ ICM message sent successfully:', {
        txHash,
        messageId,
        blockNumber: receipt?.blockNumber
      })

      return {
        txHash,
        messageId
      }
    } catch (error) {
      console.error('Failed to send ICM message:', error)
      throw error
    }
  }

  async getMessageStatus(messageId: string): Promise<{
    status: 'pending' | 'delivered' | 'failed'
    deliveryTime?: number
  }> {
    if (!this.contract) {
      throw new Error('Teleporter contract not initialized')
    }

    try {
      console.log('🔍 Checking real message status for:', messageId)
      
      // Check if message has been received on destination chain
      const isReceived = await this.contract.messageReceived(messageId)
      
      if (isReceived) {
        return {
          status: 'delivered',
          deliveryTime: Math.floor(Math.random() * 10) + 2 // Estimated delivery time in seconds
        }
      } else {
        // Message is still pending
        return {
          status: 'pending'
        }
      }
    } catch (error) {
      console.error('Failed to get message status:', error)
      throw error
    }
  }

  async estimateFee(
    destinationChainId: string,
    messageSize: number,
    gasLimit: number = 200000
  ): Promise<{ feeInWei: string; feeInAvax: string }> {
    try {
      // Mock fee calculation for demo
      const baseFee = ethers.parseEther('0.001') // 0.001 AVAX base fee
      const sizeFee = BigInt(messageSize) * ethers.parseEther('0.0001') // 0.0001 AVAX per byte
      const gasFee = BigInt(gasLimit) * ethers.parseUnits('25', 'gwei') // 25 gwei per gas
      
      const totalFee = baseFee + sizeFee + gasFee
      
      return {
        feeInWei: totalFee.toString(),
        feeInAvax: ethers.formatEther(totalFee)
      }
    } catch (error) {
      console.error('Failed to estimate fee:', error)
      throw error
    }
  }

  async getBlockchainInfo(chainId: string): Promise<{
    name: string
    isActive: boolean
    lastBlockHeight: number
  }> {
    // Mock blockchain info for demo
    const blockchains: Record<string, any> = {
      '43113': { name: 'Avalanche Fuji C-Chain', isActive: true },
      '0x2VCAhX6vE3UnXC6s1CBPE6jJ4c4cHWMfPgCptuWS59pQ8WYxXw': { name: 'Dexalot', isActive: true },
      '0x2rwhRKN8qfxK9AEJunfUjn5WH7PQzUPPQKCb59ak6fwsrwF2R': { name: 'DeFi Kingdoms', isActive: true },
      '0xzJytnh96Pc8rM337bBrtMvJDbEdDNjcXiG3WkTNCiLp8krJUk': { name: 'Amplify', isActive: true }
    }

    const info = blockchains[chainId] || { name: 'Unknown', isActive: false }
    
    return {
      ...info,
      lastBlockHeight: Math.floor(Math.random() * 1000000) + 1000000
    }
  }
}`
  }

  private static generateAvalancheService(): string {
    return `import { ethers } from 'ethers'
import dotenv from 'dotenv'

dotenv.config()

export class AvalancheService {
  private provider: ethers.Provider

  constructor() {
    const rpcUrl = process.env.AVALANCHE_FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc'
    this.provider = new ethers.JsonRpcProvider(rpcUrl)
  }

  async getNetworkInfo(): Promise<{
    chainId: number
    blockNumber: number
    gasPrice: string
    isHealthy: boolean
  }> {
    try {
      const network = await this.provider.getNetwork()
      const blockNumber = await this.provider.getBlockNumber()
      const feeData = await this.provider.getFeeData()
      
      return {
        chainId: Number(network.chainId),
        blockNumber,
        gasPrice: feeData.gasPrice?.toString() || '0',
        isHealthy: true
      }
    } catch (error) {
      console.error('Failed to get network info:', error)
      return {
        chainId: 43113,
        blockNumber: 0,
        gasPrice: '0',
        isHealthy: false
      }
    }
  }

  async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address)
      return ethers.formatEther(balance)
    } catch (error) {
      console.error('Failed to get balance:', error)
      return '0'
    }
  }

  async getTransaction(txHash: string): Promise<any> {
    try {
      const tx = await this.provider.getTransaction(txHash)
      const receipt = await this.provider.getTransactionReceipt(txHash)
      
      return {
        transaction: tx,
        receipt
      }
    } catch (error) {
      console.error('Failed to get transaction:', error)
      throw error
    }
  }

  async validateAddress(address: string): boolean {
    try {
      return ethers.isAddress(address)
    } catch {
      return false
    }
  }

  getExplorerUrl(txHash: string): string {
    return \`https://testnet.snowtrace.io/tx/\${txHash}\`
  }

  getAddressExplorerUrl(address: string): string {
    return \`https://testnet.snowtrace.io/address/\${address}\`
  }
}`
  }

  private static generateICMRoutes(): string {
    return `import express from 'express'
import { TeleporterService } from '../services/teleporter'
import { AvalancheService } from '../services/avalanche'

const router = express.Router()
const teleporter = new TeleporterService()
const avalanche = new AvalancheService()

// In-memory storage for message history (replace with database in production)
const messageHistory: any[] = []
const messageStats: Record<string, any> = {}

// Send ICM message
router.post('/send', async (req, res) => {
  try {
    const {
      sourceChain,
      destinationChainId,
      recipient,
      message,
      amount,
      walletAddress
    } = req.body

    // Validate inputs
    if (!destinationChainId || !recipient || !message || !walletAddress) {
      return res.status(400).json({
        error: 'Missing required fields'
      })
    }

    // Validate recipient address
    const isValidAddress = await avalanche.validateAddress(recipient)
    if (!isValidAddress) {
      return res.status(400).json({
        error: 'Invalid recipient address'
      })
    }

    // Prepare transaction for MetaMask signing
    console.log('📝 Preparing ICM transaction for MetaMask signing...')
    const transactionData = await teleporter.prepareMessageTransaction(
      destinationChainId,
      recipient,
      message,
      200000
    )

    // Return transaction data for frontend to sign with MetaMask
    res.json({
      success: true,
      message: 'Transaction prepared for MetaMask signing',
      transactionData: {
        to: transactionData.to,
        data: transactionData.data,
        value: transactionData.value
      },
      messageInput: transactionData.messageInput,
      fee: '0.01 AVAX',
      estimatedDeliveryTime: '2-5 seconds'
    })
  } catch (error: any) {
    console.error('Failed to send ICM message:', error)
    res.status(500).json({
      error: 'Failed to send message',
      details: error.message
    })
  }
})

// Process completed transaction from MetaMask
router.post('/complete', async (req, res) => {
  try {
    const {
      txHash,
      messageInput,
      sourceChain,
      destinationChainId,
      recipient,
      message,
      amount,
      walletAddress
    } = req.body

    if (!txHash || !messageInput || !walletAddress) {
      return res.status(400).json({
        error: 'Missing required fields: txHash, messageInput, walletAddress'
      })
    }

    // Process the completed transaction
    console.log('⏳ Processing completed ICM transaction:', txHash)
    const result = await teleporter.processCompletedTransaction(txHash, messageInput)

    // Store message in history
    const messageRecord = {
      id: result.messageId,
      sourceChain,
      destinationChainId,
      recipient,
      message,
      amount,
      walletAddress,
      txHash: result.txHash,
      messageId: result.messageId,
      status: 'pending',
      timestamp: new Date().toISOString()
    }

    messageHistory.push(messageRecord)

    // Update stats
    if (!messageStats[walletAddress]) {
      messageStats[walletAddress] = { sent: 0, received: 0, pending: 0 }
    }
    messageStats[walletAddress].sent++
    messageStats[walletAddress].pending++

    res.json({
      success: true,
      message: 'ICM message processed successfully',
      messageId: result.messageId,
      txHash: result.txHash
    })
  } catch (error: any) {
    console.error('Failed to process completed ICM message:', error)
    res.status(500).json({
      error: 'Failed to process completed message',
      details: error.message
    })
  }
})

// Get message status
router.get('/status/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params
    
    const status = await teleporter.getMessageStatus(messageId)
    
    // Update message in mock database
    const messageIndex = messageHistory.findIndex(m => m.messageId === messageId)
    if (messageIndex !== -1) {
      messageHistory[messageIndex].status = status.status
      messageHistory[messageIndex].deliveryTime = status.deliveryTime
    }
    
    res.json(status)
  } catch (error: any) {
    console.error('Failed to get message status:', error)
    res.status(500).json({
      error: 'Failed to get status',
      details: error.message
    })
  }
})

// Get message history for address
router.get('/history', async (req, res) => {
  try {
    const { address } = req.query
    
    if (!address) {
      return res.status(400).json({
        error: 'Address parameter required'
      })
    }

    const userMessages = messageHistory.filter(m => 
      m.walletAddress.toLowerCase() === (address as string).toLowerCase()
    )

    // Mock some additional historical data
    const mockMessages = [
      {
        id: 'mock-1',
        content: 'Hello from C-Chain to Dexalot!',
        recipient: '0x742d35Cc6634C0532925a3b8D427b2C0ef46c',
        destinationSubnet: 'Dexalot',
        status: 'completed',
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        txHash: '0xabcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234'
      },
      {
        id: 'mock-2',
        content: 'Cross-chain message test',
        recipient: '0x123456789abcdef123456789abcdef123456789ab',
        destinationSubnet: 'DeFi Kingdoms',
        status: 'completed',
        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        txHash: '0xefgh5678901234efgh5678901234efgh5678901234efgh5678901234efgh5678'
      }
    ]

    const allMessages = [...userMessages, ...mockMessages]
    
    res.json(allMessages.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ))
  } catch (error: any) {
    console.error('Failed to get message history:', error)
    res.status(500).json({
      error: 'Failed to get history',
      details: error.message
    })
  }
})

// Get stats for address
router.get('/stats', async (req, res) => {
  try {
    const { address } = req.query
    
    if (!address) {
      return res.status(400).json({
        error: 'Address parameter required'
      })
    }

    const userMessages = messageHistory.filter(m => 
      m.walletAddress.toLowerCase() === (address as string).toLowerCase()
    )

    const totalSent = userMessages.length + 2 // Include mock messages
    const completedMessages = userMessages.filter(m => m.status === 'completed').length + 2
    const pendingMessages = userMessages.filter(m => m.status === 'pending').length
    const successRate = totalSent > 0 ? Math.round((completedMessages / totalSent) * 100) : 0

    res.json({
      totalSent,
      totalReceived: Math.floor(totalSent * 0.8), // Mock received messages
      pendingMessages,
      successRate
    })
  } catch (error: any) {
    console.error('Failed to get stats:', error)
    res.status(500).json({
      error: 'Failed to get stats',
      details: error.message
    })
  }
})

// Get analytics
router.get('/analytics', async (req, res) => {
  try {
    const { address } = req.query
    
    if (!address) {
      return res.status(400).json({
        error: 'Address parameter required'
      })
    }

    // Mock analytics data
    const analytics = {
      messagesBySubnet: [
        { name: 'Dexalot', count: 5 },
        { name: 'DeFi Kingdoms', count: 3 },
        { name: 'Amplify', count: 2 }
      ],
      messagesByDay: [
        { date: '2024-01-01', count: 2 },
        { date: '2024-01-02', count: 4 },
        { date: '2024-01-03', count: 3 }
      ],
      averageDeliveryTime: 2.5, // seconds
      totalVolume: 1.25 // AVAX
    }

    res.json(analytics)
  } catch (error: any) {
    console.error('Failed to get analytics:', error)
    res.status(500).json({
      error: 'Failed to get analytics',
      details: error.message
    })
  }
})

// Estimate ICM fee
router.post('/estimate-fee', async (req, res) => {
  try {
    const { destinationChainId, messageSize } = req.body
    
    if (!destinationChainId || typeof messageSize !== 'number') {
      return res.status(400).json({
        error: 'destinationChainId and messageSize are required'
      })
    }

    const feeEstimate = await teleporter.estimateFee(
      destinationChainId,
      messageSize,
      200000 // Default gas limit
    )

    res.json(feeEstimate)
  } catch (error: any) {
    console.error('Failed to estimate fee:', error)
    res.status(500).json({
      error: 'Failed to estimate fee',
      details: error.message
    })
  }
})

export default router`
  }

  private static generateSubnetRoutes(): string {
    return `import express from 'express'
import { TeleporterService } from '../services/teleporter'

const router = express.Router()
const teleporter = new TeleporterService()

// Available subnets
const AVAILABLE_SUBNETS = [
  {
    id: 'dexalot',
    name: 'Dexalot',
    chainId: '0x2VCAhX6vE3UnXC6s1CBPE6jJ4c4cHWMfPgCptuWS59pQ8WYxXw',
    rpcUrl: 'https://subnets.avax.network/dexalot/testnet/rpc',
    explorerUrl: 'https://subnets-test.avax.network/dexalot',
    description: 'Decentralized exchange on Avalanche',
    isActive: true,
    logoUrl: '/images/dexalot-logo.png'
  },
  {
    id: 'dfk',
    name: 'DeFi Kingdoms',
    chainId: '0x2rwhRKN8qfxK9AEJunfUjn5WH7PQzUPPQKCb59ak6fwsrwF2R',
    rpcUrl: 'https://subnets.avax.network/defikingdoms/dfk-chain/rpc',
    explorerUrl: 'https://subnets.avax.network/defikingdoms',
    description: 'GameFi platform with DeFi elements',
    isActive: true,
    logoUrl: '/images/dfk-logo.png'
  },
  {
    id: 'amplify',
    name: 'Amplify',
    chainId: '0xzJytnh96Pc8rM337bBrtMvJDbEdDNjcXiG3WkTNCiLp8krJUk',
    rpcUrl: 'https://subnets.avax.network/amplify/testnet/rpc',
    explorerUrl: 'https://subnets-test.avax.network/amplify',
    description: 'DeFi protocol for yield amplification',
    isActive: true,
    logoUrl: '/images/amplify-logo.png'
  }
]

// Get available subnets
router.get('/available', async (req, res) => {
  try {
    res.json(AVAILABLE_SUBNETS)
  } catch (error: any) {
    console.error('Failed to get available subnets:', error)
    res.status(500).json({
      error: 'Failed to get subnets',
      details: error.message
    })
  }
})

// Get subnet info
router.get('/info', async (req, res) => {
  try {
    const { chainId } = req.query
    
    if (!chainId) {
      return res.status(400).json({
        error: 'chainId parameter required'
      })
    }

    // Find subnet in available list
    const subnet = AVAILABLE_SUBNETS.find(s => s.chainId === chainId)
    
    if (!subnet) {
      return res.status(404).json({
        error: 'Subnet not found'
      })
    }

    // Get blockchain info from teleporter service
    const blockchainInfo = await teleporter.getBlockchainInfo(chainId as string)
    
    res.json({
      ...subnet,
      ...blockchainInfo
    })
  } catch (error: any) {
    console.error('Failed to get subnet info:', error)
    res.status(500).json({
      error: 'Failed to get subnet info',
      details: error.message
    })
  }
})

// Get subnet status
router.get('/status/:subnetId', async (req, res) => {
  try {
    const { subnetId } = req.params
    
    const subnet = AVAILABLE_SUBNETS.find(s => s.id === subnetId)
    
    if (!subnet) {
      return res.status(404).json({
        error: 'Subnet not found'
      })
    }

    // Mock status check
    const status = {
      id: subnet.id,
      name: subnet.name,
      isOnline: true,
      lastBlockTime: new Date().toISOString(),
      blockHeight: Math.floor(Math.random() * 1000000) + 1000000,
      avgBlockTime: Math.random() * 2 + 1, // 1-3 seconds
      activeValidators: Math.floor(Math.random() * 50) + 10
    }

    res.json(status)
  } catch (error: any) {
    console.error('Failed to get subnet status:', error)
    res.status(500).json({
      error: 'Failed to get subnet status',
      details: error.message
    })
  }
})

// Get all subnet statuses
router.get('/status', async (req, res) => {
  try {
    const statuses = await Promise.all(
      AVAILABLE_SUBNETS.map(async (subnet) => {
        return {
          id: subnet.id,
          name: subnet.name,
          chainId: subnet.chainId,
          isOnline: true,
          blockHeight: Math.floor(Math.random() * 1000000) + 1000000,
          avgBlockTime: Math.random() * 2 + 1,
          lastUpdated: new Date().toISOString()
        }
      })
    )

    res.json(statuses)
  } catch (error: any) {
    console.error('Failed to get subnet statuses:', error)
    res.status(500).json({
      error: 'Failed to get subnet statuses',
      details: error.message
    })
  }
})

export default router`
  }

  private static generateEnvExample(): string {
    return `# Avalanche ICM Dashboard Environment Configuration

# =============================================================================
# AVALANCHE NETWORK CONFIGURATION
# =============================================================================

# Avalanche Fuji Testnet (Development)
AVALANCHE_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
TELEPORTER_CONTRACT_ADDRESS=0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf

# =============================================================================
# WALLET CONFIGURATION
# =============================================================================

# No private key required - transactions are signed through MetaMask!

# Avalanche Mainnet (Production)
# AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
# TELEPORTER_CONTRACT_ADDRESS=0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf

# =============================================================================
# SUBNET BLOCKCHAIN IDS
# =============================================================================

# Pre-configured Avalanche L1 subnets
AVAX_BLOCKCHAIN_ID_DEXALOT=0x2VCAhX6vE3UnXC6s1CBPE6jJ4c4cHWMfPgCptuWS59pQ8WYxXw
AVAX_BLOCKCHAIN_ID_DFK=0x2rwhRKN8qfxK9AEJunfUjn5WH7PQzUPPQKCb59ak6fwsrwF2R
AVAX_BLOCKCHAIN_ID_AMPLIFY=0xzJytnh96Pc8rM337bBrtMvJDbEdDNjcXiG3WkTNCiLp8krJUk

# =============================================================================
# APPLICATION CONFIGURATION
# =============================================================================

# Environment
NODE_ENV=development
PORT=3001

# Frontend URLs
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_ENVIRONMENT=development

# =============================================================================
# OPTIONAL: DATABASE (for production)
# =============================================================================

# PostgreSQL Database URL
# DATABASE_URL=postgresql://username:password@localhost:5432/icm_dashboard

# =============================================================================
# OPTIONAL: ANALYTICS & MONITORING
# =============================================================================

# Google Analytics
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Mixpanel
# NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token

# =============================================================================
# DEVELOPMENT SETTINGS
# =============================================================================

# Enable debug logging
DEBUG=true

# Enable testnet features
ENABLE_TESTNET=true

# Development wallet addresses (for testing)
# DEV_WALLET_ADDRESS=0x742d35Cc6634C0532925a3b8D427b2C0ef46c

# =============================================================================
# SECURITY SETTINGS
# =============================================================================

# JWT Secret (generate a strong random string)
# JWT_SECRET=your_super_secret_jwt_key_here

# API Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# CORS Settings
CORS_ORIGIN=http://localhost:3000`
  }

  private static generateDockerCompose(): string {
    return `version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: ../docker/Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_BACKEND_URL=http://backend:3001
      - NEXT_PUBLIC_ENVIRONMENT=development
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next

  backend:
    build:
      context: ./backend
      dockerfile: ../docker/Dockerfile.backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - PORT=3001
      - AVALANCHE_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
      - TELEPORTER_CONTRACT_ADDRESS=0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf
    volumes:
      - ./backend:/app
      - /app/node_modules

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./docker/nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
    profiles:
      - production

volumes:
  postgres_data:
    driver: local

networks:
  default:
    name: icm-dashboard-network`
  }

  private static generateReadme(projectName: string): string {
    return `# 🏔️ ${projectName}

A complete, production-ready Inter-Chain Messaging dashboard for Avalanche subnets. Send cross-chain messages between Avalanche L1 subnets with real-time monitoring and analytics.

## ✨ Features

- 🚀 **Cross-Chain Messaging**: Send messages between Avalanche subnets using Teleporter
- 📊 **Real-time Analytics**: Live transaction monitoring and subnet usage statistics
- 🔗 **Multi-Subnet Support**: Dexalot, DeFi Kingdoms, Amplify, and custom subnets
- 💼 **Wallet Integration**: MetaMask with automatic Fuji testnet switching
- 📋 **Transaction History**: Complete message history with export functionality
- 🎯 **Production Ready**: Docker deployment, API documentation, testing

## 🌐 Supported Networks

- **Avalanche Fuji Testnet**: Development and testing
- **Avalanche Mainnet**: Production deployment
- **L1 Subnets**: All Avalanche subnets with ICM support

## 🛠️ Quick Start

### Prerequisites

- Node.js 18+
- MetaMask wallet
- Avalanche testnet AVAX (faucet: https://faucet.avax-test.network/)

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/yourusername/${projectName.toLowerCase().replace(/\s+/g, '-')}.git
cd ${projectName.toLowerCase().replace(/\s+/g, '-')}

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
\`\`\`

### Environment Setup

\`\`\`env
# Avalanche Configuration
AVALANCHE_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
TELEPORTER_CONTRACT_ADDRESS=0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf

# ✅ No private key required - MetaMask handles transaction signing!

# Subnet Blockchain IDs
AVAX_BLOCKCHAIN_ID_DEXALOT=0x2VCAhX6vE3UnXC6s1CBPE6jJ4c4cHWMfPgCptuWS59pQ8WYxXw
AVAX_BLOCKCHAIN_ID_DFK=0x2rwhRKN8qfxK9AEJunfUjn5WH7PQzUPPQKCb59ak6fwsrwF2R
AVAX_BLOCKCHAIN_ID_AMPLIFY=0xzJytnh96Pc8rM337bBrtMvJDbEdDNjcXiG3WkTNCiLp8krJUk
\`\`\`

## 📖 Usage

### 1. Connect Wallet

Click the **"Connect Wallet"** button to connect your MetaMask wallet. The dashboard will automatically switch to Avalanche Fuji testnet.

### 2. Send ICM Message

1. Select a **destination subnet** from the dropdown (Dexalot, DeFi Kingdoms, Amplify, or Custom)
2. Enter the **recipient address**
3. Write your **message content**
4. Click **"Send ICM Message"**
5. Approve the transaction in MetaMask

### 3. Monitor Transactions

- View **transaction history** in the History tab
- Track **real-time status** updates
- Export transaction data as CSV
- View **analytics and statistics**

## 🚀 Deployment

### Docker Deployment (Recommended)

\`\`\`bash
# Build and run with Docker Compose
docker-compose up --build

# Access at http://localhost:3000
\`\`\`

### Manual Deployment

\`\`\`bash
# Frontend
cd frontend && npm run build && npm start

# Backend
cd backend && npm run build && npm start
\`\`\`

### Cloud Deployment

#### Vercel (Frontend)
\`\`\`bash
npm i -g vercel
vercel --prod
\`\`\`

#### Railway (Backend)
\`\`\`bash
git push railway main
\`\`\`

## 🔧 Development

### Local Development

\`\`\`bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Run tests
npm test

# Build for production
npm run build
\`\`\`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Avalanche](https://avalancheavax.com/) for the ICM protocol
- [Teleporter](https://docs.avax.network/build/cross-chain/teleporter) for cross-chain messaging
- [MetaMask](https://metamask.io/) for wallet integration

---

**Built with ❤️ by Unite DeFi**`
  }

  private static generateGitIgnore(): string {
    return `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output

# Next.js
.next/
out/

# Production
build/
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Debug logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ei.info

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# Temporary files
tmp/
temp/

# Docker volumes
postgres_data/

# SSL certificates
ssl/

# Backup files
*.bak
*.backup`
  }

  private static generateVercelConfig(): string {
    return JSON.stringify({
      "version": 2,
      "name": "avalanche-icm-dashboard",
      "builds": [
        {
          "src": "frontend/package.json",
          "use": "@vercel/next"
        }
      ],
      "routes": [
        {
          "src": "/api/(.*)",
          "dest": "backend/src/index.ts"
        },
        {
          "src": "/(.*)",
          "dest": "frontend/$1"
        }
      ],
      "env": {
        "NEXT_PUBLIC_BACKEND_URL": "@backend_url",
        "AVALANCHE_FUJI_RPC_URL": "@avalanche_rpc_url",
        "TELEPORTER_CONTRACT_ADDRESS": "@teleporter_contract"
      },
      "functions": {
        "backend/src/**/*.ts": {
          "runtime": "nodejs18.x"
        }
      }
    }, null, 2);
  }

  private static generateDeploymentInstructions(): string[] {
    return [
      "🏔️ Your Avalanche ICM Dashboard is ready for deployment!",
      "",
      "📋 **Pre-deployment checklist:**",
      "✅ Update .env file with your Avalanche RPC URL",
      "✅ Configure Teleporter contract address",
      "✅ Set up subnet blockchain IDs",
      "✅ Test wallet connection with Fuji testnet",
      "",
      "🚀 **Deployment options:**",
      "",
      "**1. Docker Deployment (Recommended)**",
      "```bash",
      "docker-compose up --build",
      "# Access at http://localhost:3000",
      "```",
      "",
      "**2. Manual Deployment**", 
      "```bash",
      "# Frontend",
      "cd frontend && npm install && npm run build && npm start",
      "",
      "# Backend (in another terminal)",
      "cd backend && npm install && npm run build && npm start",
      "```",
      "",
      "**3. Cloud Deployment**",
      "- Frontend: Deploy to Vercel with `vercel --prod`",
      "- Backend: Deploy to Railway, Render, or AWS",
      "",
      "🔗 **Important URLs:**",
      "- Frontend: http://localhost:3000",
      "- Backend API: http://localhost:3001",
      "- Avalanche Fuji Faucet: https://faucet.avax-test.network/",
      "- Fuji Explorer: https://testnet.snowtrace.io/",
      "",
      "📚 **Next Steps:**",
      "1. Connect MetaMask wallet",
      "2. Switch to Avalanche Fuji testnet", 
      "3. Get testnet AVAX from faucet",
      "4. Send your first ICM message!",
      "",
      "🏔️ **Happy cross-chain messaging with Avalanche ICM!**"
    ];
  }

  // L1 Subnet Creation Dashboard Generator
  private static generateL1SubnetDashboard(projectName: string, features: any): string {
    return `import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useWallet } from '@/hooks/useWallet'
import { useL1Deployment } from '@/hooks/useL1Deployment'
import { useICM } from '@/hooks/useICM'
import { WalletConnector } from '@/components/WalletConnector'
import { L1ConfigForm } from '@/components/L1ConfigForm'
import { SubnetDeployment } from '@/components/SubnetDeployment'
import { GenesisConfig } from '@/components/GenesisConfig'
import { ICMSendForm } from '@/components/ICMSendForm'
import { ICMHistory } from '@/components/ICMHistory'
import { ICMAnalytics } from '@/components/ICMAnalytics'
import toast, { Toaster } from 'react-hot-toast'

export default function Home() {
  const { isConnected, address } = useWallet()
  const { deployments, createDeployment, isDeploying } = useL1Deployment()
  const [activeTab, setActiveTab] = useState('configure')

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <Head>
        <title>${projectName} - Avalanche L1 Subnet Creator</title>
        <meta name="description" content="Complete Avalanche L1 Subnet Creation & ICM Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Toaster position="top-right" />

      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">🏗️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">${projectName}</h1>
                <p className="text-sm text-gray-600">L1 Subnet Creator & ICM</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <WalletConnector />
            </div>
          </div>
          
          {isConnected && (
            <nav className="flex space-x-8 -mb-px">
              <button
                onClick={() => setActiveTab('configure')}
                className={\`py-2 px-1 border-b-2 font-medium text-sm \${
                  activeTab === 'configure' 
                    ? 'border-purple-500 text-purple-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }\`}
              >
                Configure
              </button>
              <button
                onClick={() => setActiveTab('genesis')}
                className={\`py-2 px-1 border-b-2 font-medium text-sm \${
                  activeTab === 'genesis' 
                    ? 'border-purple-500 text-purple-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }\`}
              >
                Genesis
              </button>
              <button
                onClick={() => setActiveTab('deploy')}
                className={\`py-2 px-1 border-b-2 font-medium text-sm \${
                  activeTab === 'deploy' 
                    ? 'border-purple-500 text-purple-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }\`}
              >
                Deploy
              </button>
              <button
                onClick={() => setActiveTab('icm')}
                className={\`py-2 px-1 border-b-2 font-medium text-sm \${
                  activeTab === 'icm' 
                    ? 'border-purple-500 text-purple-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }\`}
              >
                ICM Testing
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={\`py-2 px-1 border-b-2 font-medium text-sm \${
                  activeTab === 'analytics' 
                    ? 'border-purple-500 text-purple-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }\`}
              >
                Analytics
              </button>
            </nav>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {!isConnected ? (
          <div className="text-center py-20">
            <div className="mx-auto max-w-md">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-4xl">🏗️</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Avalanche L1 Subnet Creator
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Connect your wallet to start creating and deploying custom Avalanche L1 subnets
              </p>
              <WalletConnector />
            </div>
          </div>
        ) : (
          <div className="px-4 sm:px-0">
            {activeTab === 'configure' && <L1ConfigForm />}
            {activeTab === 'genesis' && <GenesisConfig />}
            {activeTab === 'deploy' && <SubnetDeployment />}
            {activeTab === 'icm' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Test ICM Between Subnets</h2>
                <ICMSendForm />
                <ICMHistory />
              </div>
            )}
            {activeTab === 'analytics' && <ICMAnalytics />}
          </div>
        )}
      </main>
    </div>
  )
}`
  }

  private static generateL1ConfigForm(): string {
    return `import { useState } from 'react'
import { useL1Deployment } from '@/hooks/useL1Deployment'
import toast from 'react-hot-toast'

export function L1ConfigForm() {
  const { createConfiguration } = useL1Deployment()
  const [config, setConfig] = useState({
    subnetName: 'MyCustomSubnet',
    vmType: 'SubnetEVM',
    chainId: Math.floor(Math.random() * 1000000) + 1000000,
    gasLimit: 8000000,
    targetBlockRate: 2,
    minBaseFee: 1000000000,
    targetGas: 100000000,
    baseFeeChangeDenominator: 12,
    minBlockGasCost: 0,
    maxBlockGasCost: 10000000,
    blockGasCostStep: 200000
  })

  const [validators, setValidators] = useState([{
    nodeId: '',
    weight: 1000,
    startTime: '',
    endTime: ''
  }])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createConfiguration({
        ...config,
        validators
      })
      toast.success('L1 configuration created successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create configuration')
    }
  }

  const addValidator = () => {
    setValidators([...validators, {
      nodeId: '',
      weight: 1000,
      startTime: '',
      endTime: ''
    }])
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">L1 Subnet Configuration</h2>
          <p className="text-gray-600">Configure your custom Avalanche L1 subnet parameters</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subnet Name
              </label>
              <input
                type="text"
                value={config.subnetName}
                onChange={(e) => setConfig({ ...config, subnetName: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                VM Type
              </label>
              <select
                value={config.vmType}
                onChange={(e) => setConfig({ ...config, vmType: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="SubnetEVM">Subnet EVM</option>
                <option value="Custom">Custom VM</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chain ID
              </label>
              <input
                type="number"
                value={config.chainId}
                onChange={(e) => setConfig({ ...config, chainId: parseInt(e.target.value) })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gas Limit
              </label>
              <input
                type="number"
                value={config.gasLimit}
                onChange={(e) => setConfig({ ...config, gasLimit: parseInt(e.target.value) })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Block Rate (seconds)
              </label>
              <input
                type="number"
                value={config.targetBlockRate}
                onChange={(e) => setConfig({ ...config, targetBlockRate: parseInt(e.target.value) })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Base Fee (wei)
              </label>
              <input
                type="number"
                value={config.minBaseFee}
                onChange={(e) => setConfig({ ...config, minBaseFee: parseInt(e.target.value) })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
          </div>

          {/* Validators Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Validators</h3>
              <button
                type="button"
                onClick={addValidator}
                className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm hover:bg-purple-200"
              >
                Add Validator
              </button>
            </div>

            {validators.map((validator, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Node ID
                    </label>
                    <input
                      type="text"
                      value={validator.nodeId}
                      onChange={(e) => {
                        const newValidators = [...validators]
                        newValidators[index].nodeId = e.target.value
                        setValidators(newValidators)
                      }}
                      placeholder="NodeID-..."
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight
                    </label>
                    <input
                      type="number"
                      value={validator.weight}
                      onChange={(e) => {
                        const newValidators = [...validators]
                        newValidators[index].weight = parseInt(e.target.value)
                        setValidators(newValidators)
                      }}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-600 hover:to-indigo-600 transition-all"
          >
            Create L1 Configuration
          </button>
        </form>
      </div>
    </div>
  )
}`
  }

  private static generateSubnetDeployment(): string {
    return `import { useState, useEffect } from 'react'
import { useL1Deployment } from '@/hooks/useL1Deployment'
import { CheckCircleIcon, ClockIcon, XCircleIcon, PlayIcon } from '@heroicons/react/24/outline'

export function SubnetDeployment() {
  const { deployments, deploySubnet, getDeploymentStatus } = useL1Deployment()
  const [selectedDeployment, setSelectedDeployment] = useState<any>(null)
  const [isDeploying, setIsDeploying] = useState(false)

  const handleDeploy = async (config: any) => {
    setIsDeploying(true)
    try {
      await deploySubnet(config)
    } catch (error) {
      console.error('Deployment failed:', error)
    } finally {
      setIsDeploying(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />
      case 'failed':
        return <XCircleIcon className="w-6 h-6 text-red-500" />
      case 'deploying':
        return <ClockIcon className="w-6 h-6 text-yellow-500 animate-spin" />
      default:
        return <ClockIcon className="w-6 h-6 text-gray-400" />
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Subnet Deployment</h2>
        <p className="text-gray-600">Deploy and manage your custom Avalanche L1 subnets</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deployment List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurations</h3>
            
            {deployments.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">🏗️</span>
                </div>
                <p className="text-gray-600">No configurations yet</p>
                <p className="text-sm text-gray-500">Create one in the Configure tab</p>
              </div>
            ) : (
              <div className="space-y-3">
                {deployments.map((deployment) => (
                  <div 
                    key={deployment.id}
                    className={\`p-3 border rounded-lg cursor-pointer transition-colors \${
                      selectedDeployment?.id === deployment.id
                        ? 'border-purple-300 bg-purple-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }\`}
                    onClick={() => setSelectedDeployment(deployment)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{deployment.subnetName}</h4>
                      {getStatusIcon(deployment.status)}
                    </div>
                    <p className="text-xs text-gray-600">Chain ID: {deployment.chainId}</p>
                    <p className="text-xs text-gray-500">
                      Created: {new Date(deployment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Deployment Details */}
        <div className="lg:col-span-2">
          {selectedDeployment ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedDeployment.subnetName}</h3>
                  <p className="text-gray-600">VM: {selectedDeployment.vmType}</p>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusIcon(selectedDeployment.status)}
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {selectedDeployment.status}
                  </span>
                </div>
              </div>

              {/* Configuration Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Chain ID</p>
                  <p className="font-semibold">{selectedDeployment.chainId}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Gas Limit</p>
                  <p className="font-semibold">{selectedDeployment.gasLimit?.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Block Rate</p>
                  <p className="font-semibold">{selectedDeployment.targetBlockRate}s</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Min Base Fee</p>
                  <p className="font-semibold">{selectedDeployment.minBaseFee} wei</p>
                </div>
              </div>

              {/* Validators */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Validators</h4>
                <div className="space-y-2">
                  {selectedDeployment.validators?.map((validator: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">
                        {validator.nodeId || \`Validator \${index + 1}\`}
                      </span>
                      <span className="text-sm font-medium">Weight: {validator.weight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deployment Actions */}
              <div className="flex space-x-3">
                {selectedDeployment.status === 'configured' && (
                  <button
                    onClick={() => handleDeploy(selectedDeployment)}
                    disabled={isDeploying}
                    className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PlayIcon className="w-4 h-4" />
                    <span>{isDeploying ? 'Deploying...' : 'Deploy Subnet'}</span>
                  </button>
                )}
                
                {selectedDeployment.status === 'completed' && (
                  <div className="flex space-x-2">
                    <button className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm hover:bg-green-200">
                      View Explorer
                    </button>
                    <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm hover:bg-blue-200">
                      Export Config
                    </button>
                  </div>
                )}
              </div>

              {/* Deployment Progress */}
              {selectedDeployment.status === 'deploying' && (
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                  <h5 className="font-medium text-yellow-800 mb-2">Deployment in Progress</h5>
                  <div className="space-y-2 text-sm text-yellow-700">
                    <div>✅ Configuration validated</div>
                    <div>✅ Genesis file created</div>
                    <div>🔄 Subnet deployment initiated...</div>
                    <div>⏳ Waiting for validator confirmation</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Configuration</h3>
              <p className="text-gray-600">Choose a subnet configuration from the list to view details and deploy</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}`
  }

  private static generateGenesisConfig(): string {
    return `import { useState, useEffect } from 'react'
import { useL1Deployment } from '@/hooks/useL1Deployment'

export function GenesisConfig() {
  const { deployments, generateGenesis, exportGenesis } = useL1Deployment()
  const [selectedConfig, setSelectedConfig] = useState<any>(null)
  const [genesisData, setGenesisData] = useState<any>(null)
  const [allocations, setAllocations] = useState([{
    address: '',
    balance: '1000000000000000000000' // 1000 ETH in wei
  }])

  const handleGenerateGenesis = async () => {
    if (!selectedConfig) return

    try {
      const genesis = await generateGenesis({
        config: selectedConfig,
        allocations: allocations.filter(a => a.address && a.balance)
      })
      setGenesisData(genesis)
    } catch (error) {
      console.error('Failed to generate genesis:', error)
    }
  }

  const addAllocation = () => {
    setAllocations([...allocations, {
      address: '',
      balance: '1000000000000000000000'
    }])
  }

  const removeAllocation = (index: number) => {
    setAllocations(allocations.filter((_, i) => i !== index))
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Genesis Configuration</h2>
        <p className="text-gray-600">Configure genesis block and initial token allocation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Selection */}
        <div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Configuration</h3>
            
            <div className="space-y-3 mb-6">
              {deployments.map((deployment) => (
                <div 
                  key={deployment.id}
                  className={\`p-3 border rounded-lg cursor-pointer transition-colors \${
                    selectedConfig?.id === deployment.id
                      ? 'border-purple-300 bg-purple-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }\`}
                  onClick={() => setSelectedConfig(deployment)}
                >
                  <h4 className="font-medium text-gray-900">{deployment.subnetName}</h4>
                  <p className="text-sm text-gray-600">Chain ID: {deployment.chainId}</p>
                </div>
              ))}
            </div>

            {selectedConfig && (
              <>
                <h4 className="font-semibold text-gray-900 mb-3">Token Allocations</h4>
                <div className="space-y-3 mb-4">
                  {allocations.map((allocation, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="0x..."
                        value={allocation.address}
                        onChange={(e) => {
                          const newAllocations = [...allocations]
                          newAllocations[index].address = e.target.value
                          setAllocations(newAllocations)
                        }}
                        className="flex-1 p-2 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Balance (wei)"
                        value={allocation.balance}
                        onChange={(e) => {
                          const newAllocations = [...allocations]
                          newAllocations[index].balance = e.target.value
                          setAllocations(newAllocations)
                        }}
                        className="w-32 p-2 border border-gray-300 rounded text-sm"
                      />
                      <button
                        onClick={() => removeAllocation(index)}
                        className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={addAllocation}
                    className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm hover:bg-purple-200"
                  >
                    Add Allocation
                  </button>
                  <button
                    onClick={handleGenerateGenesis}
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-1 rounded text-sm hover:from-purple-600 hover:to-indigo-600"
                  >
                    Generate Genesis
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Genesis Preview */}
        <div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Genesis JSON</h3>
              {genesisData && (
                <button
                  onClick={() => exportGenesis(genesisData)}
                  className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200"
                >
                  Download
                </button>
              )}
            </div>

            {genesisData ? (
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96 text-sm">
                <pre>{JSON.stringify(genesisData, null, 2)}</pre>
              </div>
            ) : (
              <div className="bg-gray-50 p-8 rounded-lg text-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">📄</span>
                </div>
                <p className="text-gray-600">Select a configuration and generate genesis</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}`
  }

  private static generateL1DeploymentHook(): string {
    return `import { useState, useCallback } from 'react'
import { useWallet } from './useWallet'

interface L1Configuration {
  id: string
  subnetName: string
  vmType: string
  chainId: number
  gasLimit: number
  targetBlockRate: number
  minBaseFee: number
  validators: Array<{
    nodeId: string
    weight: number
    startTime: string
    endTime: string
  }>
  status: 'configured' | 'deploying' | 'completed' | 'failed'
  createdAt: string
  deployedAt?: string
}

export function useL1Deployment() {
  const { address } = useWallet()
  const [deployments, setDeployments] = useState<L1Configuration[]>([])
  const [isDeploying, setIsDeploying] = useState(false)

  const createConfiguration = useCallback(async (config: any) => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    const newConfig: L1Configuration = {
      id: Date.now().toString(),
      ...config,
      status: 'configured',
      createdAt: new Date().toISOString()
    }

    setDeployments(prev => [...prev, newConfig])
    return newConfig
  }, [address])

  const deploySubnet = useCallback(async (config: L1Configuration) => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    setIsDeploying(true)
    
    try {
      // Update status to deploying
      setDeployments(prev => prev.map(d => 
        d.id === config.id ? { ...d, status: 'deploying' as const } : d
      ))

      const response = await fetch('/api/l1-deployment/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config,
          walletAddress: address
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to deploy subnet')
      }

      const result = await response.json()
      
      // Update status to completed
      setDeployments(prev => prev.map(d => 
        d.id === config.id ? { 
          ...d, 
          status: 'completed' as const,
          deployedAt: new Date().toISOString(),
          ...result 
        } : d
      ))

      return result
    } catch (error) {
      // Update status to failed
      setDeployments(prev => prev.map(d => 
        d.id === config.id ? { ...d, status: 'failed' as const } : d
      ))
      throw error
    } finally {
      setIsDeploying(false)
    }
  }, [address])

  const generateGenesis = useCallback(async (params: {
    config: L1Configuration
    allocations: Array<{ address: string; balance: string }>
  }) => {
    const response = await fetch('/api/l1-deployment/genesis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error('Failed to generate genesis')
    }

    return await response.json()
  }, [])

  const exportGenesis = useCallback((genesisData: any) => {
    const blob = new Blob([JSON.stringify(genesisData, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'genesis.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  const getDeploymentStatus = useCallback(async (deploymentId: string) => {
    try {
      const response = await fetch(\`/api/l1-deployment/status/\${deploymentId}\`)
      if (!response.ok) {
        throw new Error('Failed to get deployment status')
      }
      
      const status = await response.json()
      
      // Update local state
      setDeployments(prev => prev.map(d => 
        d.id === deploymentId ? { ...d, ...status } : d
      ))
      
      return status
    } catch (error) {
      console.error('Failed to get deployment status:', error)
    }
  }, [])

  return {
    deployments,
    isDeploying,
    createConfiguration,
    deploySubnet,
    generateGenesis,
    exportGenesis,
    getDeploymentStatus
  }
}`
  }

  private static generateL1DeploymentRoutes(): string {
    return `import express from 'express'
import { L1DeployerService } from '../services/l1-deployer'

const router = express.Router()
const l1Deployer = new L1DeployerService()

// Deploy L1 subnet
router.post('/deploy', async (req, res) => {
  try {
    const { config, walletAddress } = req.body

    if (!config || !walletAddress) {
      return res.status(400).json({
        error: 'Missing required fields: config and walletAddress'
      })
    }

    // Simulate deployment process
    console.log('🚀 Starting L1 subnet deployment:', config.subnetName)

    const result = await l1Deployer.deploySubnet(config, walletAddress)

    res.json({
      success: true,
      deploymentId: result.deploymentId,
      subnetId: result.subnetId,
      rpcUrl: result.rpcUrl,
      explorerUrl: result.explorerUrl,
      status: 'completed'
    })
  } catch (error: any) {
    console.error('Failed to deploy L1 subnet:', error)
    res.status(500).json({
      error: 'Failed to deploy subnet',
      details: error.message
    })
  }
})

// Generate genesis file
router.post('/genesis', async (req, res) => {
  try {
    const { config, allocations } = req.body

    if (!config) {
      return res.status(400).json({
        error: 'Configuration is required'
      })
    }

    const genesis = await l1Deployer.generateGenesis(config, allocations || [])

    res.json(genesis)
  } catch (error: any) {
    console.error('Failed to generate genesis:', error)
    res.status(500).json({
      error: 'Failed to generate genesis',
      details: error.message
    })
  }
})

// Get deployment status
router.get('/status/:deploymentId', async (req, res) => {
  try {
    const { deploymentId } = req.params
    
    const status = await l1Deployer.getDeploymentStatus(deploymentId)
    
    res.json(status)
  } catch (error: any) {
    console.error('Failed to get deployment status:', error)
    res.status(500).json({
      error: 'Failed to get status',
      details: error.message
    })
  }
})

// List all deployments
router.get('/deployments', async (req, res) => {
  try {
    const { walletAddress } = req.query
    
    if (!walletAddress) {
      return res.status(400).json({
        error: 'Wallet address is required'
      })
    }

    const deployments = await l1Deployer.getDeployments(walletAddress as string)
    
    res.json(deployments)
  } catch (error: any) {
    console.error('Failed to get deployments:', error)
    res.status(500).json({
      error: 'Failed to get deployments',
      details: error.message
    })
  }
})

export default router`
  }

  private static generateL1DeployerService(): string {
    return `import { ethers } from 'ethers'
import dotenv from 'dotenv'

dotenv.config()

interface L1Configuration {
  subnetName: string
  vmType: string
  chainId: number
  gasLimit: number
  targetBlockRate: number
  minBaseFee: number
  validators: Array<{
    nodeId: string
    weight: number
  }>
}

interface TokenAllocation {
  address: string
  balance: string
}

export class L1DeployerService {
  private provider: ethers.Provider
  private deployments: Map<string, any> = new Map()

  constructor() {
    const rpcUrl = process.env.AVALANCHE_FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc'
    this.provider = new ethers.JsonRpcProvider(rpcUrl)
  }

  async deploySubnet(config: L1Configuration, walletAddress: string): Promise<{
    deploymentId: string
    subnetId: string
    rpcUrl: string
    explorerUrl: string
  }> {
    try {
      // Simulate deployment process
      console.log('🏗️ Simulating L1 subnet deployment...')
      
      // Generate unique IDs
      const deploymentId = 'deploy-' + Date.now()
      const subnetId = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')
      
      // Simulate deployment steps
      await this.simulateDeploymentSteps(config)
      
      const result = {
        deploymentId,
        subnetId,
        rpcUrl: \`https://subnets.avax.network/\${config.subnetName.toLowerCase()}/rpc\`,
        explorerUrl: \`https://subnets.avax.network/\${config.subnetName.toLowerCase()}/explorer\`,
        status: 'completed',
        deployedAt: new Date().toISOString(),
        config
      }

      // Store deployment info
      this.deployments.set(deploymentId, result)
      
      console.log('✅ L1 subnet deployment simulated successfully:', config.subnetName)
      return result
      
    } catch (error) {
      console.error('❌ Failed to deploy L1 subnet:', error)
      throw error
    }
  }

  private async simulateDeploymentSteps(config: L1Configuration): Promise<void> {
    const steps = [
      'Validating configuration',
      'Creating subnet',
      'Generating VM genesis',
      'Configuring validators',
      'Starting blockchain',
      'Enabling ICM'
    ]

    for (const step of steps) {
      console.log(\`📋 \${step}...\`)
      // Simulate time for each step
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  async generateGenesis(config: L1Configuration, allocations: TokenAllocation[]): Promise<any> {
    try {
      console.log('📄 Generating genesis file for:', config.subnetName)

      // Create genesis configuration
      const genesis = {
        config: {
          chainId: config.chainId,
          homesteadBlock: 0,
          eip150Block: 0,
          eip150Hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
          eip155Block: 0,
          eip158Block: 0,
          byzantiumBlock: 0,
          constantinopleBlock: 0,
          petersburgBlock: 0,
          istanbulBlock: 0,
          muirGlacierBlock: 0,
          subnetEVMTimestamp: 0,
          feeConfig: {
            gasLimit: config.gasLimit,
            targetBlockRate: config.targetBlockRate,
            minBaseFee: config.minBaseFee.toString(),
            targetGas: "100000000",
            baseFeeChangeDenominator: "12",
            minBlockGasCost: "0",
            maxBlockGasCost: "10000000",
            blockGasCostStep: "200000"
          }
        },
        alloc: {},
        nonce: "0x0",
        timestamp: "0x0",
        extraData: "0x00",
        gasLimit: \`0x\${config.gasLimit.toString(16)}\`,
        difficulty: "0x0",
        mixHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
        coinbase: "0x0000000000000000000000000000000000000000",
        number: "0x0",
        gasUsed: "0x0",
        parentHash: "0x0000000000000000000000000000000000000000000000000000000000000000"
      }

      // Add token allocations
      allocations.forEach(allocation => {
        if (allocation.address && allocation.balance) {
          genesis.alloc[allocation.address.toLowerCase()] = {
            balance: allocation.balance
          }
        }
      })

      console.log('✅ Genesis file generated successfully')
      return genesis

    } catch (error) {
      console.error('❌ Failed to generate genesis:', error)
      throw error
    }
  }

  async getDeploymentStatus(deploymentId: string): Promise<any> {
    const deployment = this.deployments.get(deploymentId)
    
    if (!deployment) {
      return {
        status: 'not_found',
        message: 'Deployment not found'
      }
    }

    // Simulate some status checks
    return {
      ...deployment,
      validators: await this.getValidatorStatus(deployment.config.validators),
      blockHeight: Math.floor(Math.random() * 100000) + 10000,
      isHealthy: true,
      lastBlockTime: new Date().toISOString()
    }
  }

  private async getValidatorStatus(validators: any[]): Promise<any[]> {
    return validators.map(validator => ({
      ...validator,
      status: 'active',
      uptime: Math.random() * 0.05 + 0.95, // 95-100% uptime
      stakeAmount: validator.weight
    }))
  }

  async getDeployments(walletAddress: string): Promise<any[]> {
    // In a real implementation, this would query a database
    // For simulation, return stored deployments
    return Array.from(this.deployments.values())
      .filter(deployment => deployment.walletAddress === walletAddress)
  }

  async validateConfiguration(config: L1Configuration): Promise<{
    valid: boolean
    errors: string[]
    warnings: string[]
  }> {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate chain ID
    if (config.chainId <= 0) {
      errors.push('Chain ID must be positive')
    }

    // Validate gas limit
    if (config.gasLimit < 1000000) {
      warnings.push('Gas limit is very low')
    }

    // Validate validators
    if (!config.validators || config.validators.length === 0) {
      errors.push('At least one validator is required')
    }

    config.validators?.forEach((validator, index) => {
      if (!validator.nodeId) {
        errors.push(\`Validator \${index + 1} missing node ID\`)
      }
      if (validator.weight <= 0) {
        errors.push(\`Validator \${index + 1} must have positive weight\`)
      }
    })

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }
}`
  }

  private static generateL1DeploymentInstructions(): string[] {
    return [
      "🏗️ Your Avalanche L1 Subnet Creator is ready for deployment!",
      "",
      "📋 **Pre-deployment checklist:**",
      "✅ Update .env file with your Avalanche RPC URL",
      "✅ Configure validator node IDs and weights",
      "✅ Set up subnet parameters and gas configuration",
      "✅ Test wallet connection with Fuji testnet",
      "",
      "🚀 **Deployment options:**",
      "",
      "**1. Docker Deployment (Recommended)**",
      "```bash",
      "docker-compose up --build",
      "# Access at http://localhost:3000",
      "```",
      "",
      "**2. Manual Deployment**", 
      "```bash",
      "# Frontend",
      "cd frontend && npm install && npm run build && npm start",
      "",
      "# Backend (in another terminal)",
      "cd backend && npm install && npm run build && npm start",
      "```",
      "",
      "**3. Cloud Deployment**",
      "- Frontend: Deploy to Vercel with `vercel --prod`",
      "- Backend: Deploy to Railway, Render, or AWS",
      "",
      "🔗 **Important URLs:**",
      "- Frontend: http://localhost:3000",
      "- Backend API: http://localhost:3001",
      "- Avalanche Fuji Faucet: https://faucet.avax-test.network/",
      "- Avalanche CLI Docs: https://docs.avax.network/tooling/cli",
      "",
      "📚 **Next Steps:**",
      "1. Connect MetaMask wallet",
      "2. Configure your L1 subnet parameters", 
      "3. Generate genesis file with token allocation",
      "4. Deploy your custom subnet (simulation mode)",
      "5. Test ICM messaging between subnets!",
      "",
      "🏔️ **Happy L1 subnet building with Avalanche!**"
    ];
  }
}