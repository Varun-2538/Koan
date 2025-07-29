"use client"

import { OneInchSwapComponent } from "@/lib/components/defi/oneinch-swap"
import { ExecutableNode } from "@/components/nodes/executable-node"

export default function DemoPage() {
  const component = new OneInchSwapComponent()
  
  // Mock node props for demo
  const mockNodeProps = {
    id: "demo-1inch",
    data: { label: "1inch Swap Demo" },
    selected: false,
    type: "oneInchSwap",
    position: { x: 0, y: 0 },
    dragHandle: "",
    isConnectable: true,
    zIndex: 1,
    xPos: 0,
    yPos: 0,
    dragging: false
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🚀 1inch DeFi Component Demo
          </h1>
          <p className="text-gray-600">
            This demonstrates the new Langflow-style 1inch Swap component with:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
            <li>✅ <strong>Play Button Testing</strong> - Test individual component functionality</li>
            <li>✅ <strong>API Key Management</strong> - Each user brings their own 1inch API key</li>
            <li>✅ <strong>Modular Architecture</strong> - Components work independently</li>
            <li>✅ <strong>Real 1inch Integration</strong> - Uses actual 1inch API v6.0</li>
            <li>✅ <strong>Execution Logs</strong> - See detailed execution information</li>
            <li>✅ <strong>Input Validation</strong> - Proper validation for all inputs</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Interactive 1inch Swap Component</h2>
          <p className="text-gray-600 mb-6">
            Click the <strong>Settings</strong> icon to configure, then click <strong>Test</strong> to run a quote test.
            You'll need a valid 1inch API key to test functionality.
          </p>
          
          <div className="flex justify-center">
            <ExecutableNode {...mockNodeProps} component={component} />
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            🔑 Getting Started
          </h3>
          <div className="space-y-3 text-blue-800">
            <div>
              <strong>1. Get 1inch API Key:</strong>
              <p className="text-sm">Visit <a href="https://portal.1inch.dev/" target="_blank" className="underline">1inch Developer Portal</a> to get your free API key</p>
            </div>
            <div>
              <strong>2. Configure Component:</strong>
              <p className="text-sm">Click the settings icon and enter your API key and wallet address</p>
            </div>
            <div>
              <strong>3. Test Functionality:</strong>
              <p className="text-sm">Click "Test" to get a real quote from 1inch aggregator</p>
            </div>
            <div>
              <strong>4. View Results:</strong>
              <p className="text-sm">See expected output amounts, gas estimates, and protocol routing</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">
            🏗️ Infrastructure Benefits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-green-800">
            <div>
              <h4 className="font-medium">For Platform Users:</h4>
              <ul className="text-sm space-y-1 mt-2">
                <li>• Use your own API keys</li>
                <li>• Test components individually</li>
                <li>• See real execution results</li>
                <li>• Modular, reusable components</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">For Developers:</h4>
              <ul className="text-sm space-y-1 mt-2">
                <li>• Langflow-style architecture</li>
                <li>• Easy to extend and customize</li>
                <li>• Built-in validation and logging</li>
                <li>• Scalable component system</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 