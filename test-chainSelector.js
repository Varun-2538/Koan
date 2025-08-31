// Simple test to verify chainSelector plugin registration and execution
const testWorkflow = {
  id: "test-chain-selector",
  name: "Test Chain Selector",
  description: "Test chainSelector plugin",
  nodes: [
    {
      id: "chain-selector-1",
      type: "chainSelector",
      position: { x: 100, y: 100 },
      data: {
        label: "Test Chain Selector",
        config: {
          primary_chain: "43113",
          enable_testnet: true,
          available_chains: "icm_compatible"
        }
      }
    }
  ],
  edges: []
}

console.log("Test workflow:")
console.log(JSON.stringify(testWorkflow, null, 2))

// Test by sending to backend
const backendUrl = 'http://localhost:3001'

async function testChainSelector() {
  try {
    const response = await fetch(`${backendUrl}/api/workflows/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow: testWorkflow,
        context: {
          environment: 'test'
        }
      })
    })

    if (response.ok) {
      const result = await response.json()
      console.log("✅ Chain selector test successful:", result)
    } else {
      const error = await response.text()
      console.log("❌ Chain selector test failed:", response.status, error)
    }
  } catch (error) {
    console.error("❌ Network error:", error.message)
  }
}

if (typeof fetch !== 'undefined') {
  testChainSelector()
} else {
  console.log("Run this in a browser environment or with node-fetch")
}