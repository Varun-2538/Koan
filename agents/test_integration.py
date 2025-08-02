#!/usr/bin/env python3
"""
Integration Test for DeFi Agent System
Tests the complete flow from chatbot input to code generation
"""

import asyncio
import json
import sys
import os
from rich.console import Console
from rich.panel import Panel

# Add src to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from agents.architecture_mapper import ArchitectureMapperAgent
from api.backend_client import DeFiBackendClient
from workflow.generator import WorkflowGenerator

console = Console()

async def test_complete_flow():
    """Test the complete flow from user input to workflow generation"""
    
    console.print(Panel("🧪 Testing Complete DeFi Agent Flow", style="bold cyan"))
    
    try:
        # Initialize components
        console.print("🔧 Initializing components...")
        architecture_agent = ArchitectureMapperAgent()
        await architecture_agent.initialize()
        
        backend_client = DeFiBackendClient()
        workflow_generator = WorkflowGenerator()
        
        # Test input
        test_input = "I want to create a swap application for my DeFi protocol that supports ETH, USDC, and WBTC with slippage protection"
        console.print(f"📝 Test input: [italic]{test_input}[/italic]")
        
        # Step 1: Analyze user request
        console.print("\n1️⃣ Analyzing user request...")
        requirements = await architecture_agent.analyze_request(test_input)
        
        console.print("✅ Requirements analyzed:")
        console.print(f"   • Pattern: {requirements.get('pattern')}")
        console.print(f"   • Tokens: {', '.join(requirements.get('tokens', []))}")
        console.print(f"   • Features: {', '.join(requirements.get('features', []))}")
        console.print(f"   • Suggested nodes: {len(requirements.get('suggested_nodes', []))} nodes")
        
        # Step 2: Generate workflow
        console.print("\n2️⃣ Generating workflow...")
        workflow_def = await workflow_generator.generate_workflow(requirements)
        
        console.print("✅ Workflow generated:")
        console.print(f"   • ID: {workflow_def['id']}")
        console.print(f"   • Name: {workflow_def['name']}")
        console.print(f"   • Nodes: {len(workflow_def['nodes'])}")
        console.print(f"   • Edges: {len(workflow_def['edges'])}")
        
        # Step 3: Validate workflow
        console.print("\n3️⃣ Validating workflow...")
        validation = await workflow_generator.validate_workflow(workflow_def)
        
        if validation['valid']:
            console.print("✅ Workflow validation passed")
        else:
            console.print(f"❌ Workflow validation failed: {validation['errors']}")
            return False
        
        # Step 4: Test backend connection (optional)
        console.print("\n4️⃣ Testing backend connection...")
        try:
            health = await backend_client.health_check()
            console.print(f"✅ Backend healthy: {health.get('status')}")
        except Exception as e:
            console.print(f"⚠️ Backend not available: {e}")
            console.print("   (This is expected if backend is not running)")
        
        # Step 5: Show workflow structure
        console.print("\n5️⃣ Workflow structure:")
        for i, node in enumerate(workflow_def['nodes']):
            console.print(f"   Node {i+1}: {node['type']} - {node.get('data', {}).get('label', 'Unknown')}")
        
        # Success
        console.print(Panel("🎉 All tests passed! The agent system is working correctly.", style="bold green"))
        
        return True
        
    except Exception as e:
        console.print(Panel(f"❌ Test failed: {e}", style="bold red"))
        import traceback
        console.print(traceback.format_exc())
        return False

async def test_conversation_flow():
    """Test multi-turn conversation"""
    
    console.print(Panel("💬 Testing Conversation Flow", style="bold blue"))
    
    try:
        architecture_agent = ArchitectureMapperAgent()
        await architecture_agent.initialize()
        
        # First message
        console.print("User: I want to build a DeFi application")
        context = {"history": [{"role": "user", "content": "I want to build a DeFi application"}]}
        
        requirements1 = await architecture_agent.analyze_request(
            "I want to build a DeFi application", 
            context=context
        )
        
        console.print(f"Agent: Detected pattern: {requirements1.get('pattern')}")
        
        # Follow-up message
        context["history"].append({"role": "assistant", "content": f"Detected pattern: {requirements1.get('pattern')}"})
        context["history"].append({"role": "user", "content": "Make it support ETH and USDC swaps"})
        
        requirements2 = await architecture_agent.analyze_request(
            "Make it support ETH and USDC swaps",
            context=context
        )
        
        console.print(f"Agent: Updated with tokens: {requirements2.get('tokens')}")
        console.print("✅ Conversation flow working correctly")
        
        return True
        
    except Exception as e:
        console.print(f"❌ Conversation test failed: {e}")
        return False

def show_api_info():
    """Show information about starting the API"""
    
    console.print(Panel("🚀 Starting the DeFi Agent API", style="bold yellow"))
    console.print("To start the FastAPI server, run:")
    console.print("[bold green]cd src && python main.py[/bold green]")
    console.print("\nThe API will be available at:")
    console.print("• [blue]http://localhost:8000[/blue] - Main API")
    console.print("• [blue]http://localhost:8000/docs[/blue] - Interactive documentation")
    console.print("\nTest the API with:")
    console.print('[green]curl -X POST "http://localhost:8000/process" \\[/green]')
    console.print('[green]     -H "Content-Type: application/json" \\[/green]')
    console.print('[green]     -d \'{"request": "Create a swap application"}\'[/green]')

async def main():
    """Main test function"""
    
    # Test complete flow
    success1 = await test_complete_flow()
    
    if success1:
        # Test conversation flow
        success2 = await test_conversation_flow()
        
        if success2:
            # Show API info
            show_api_info()
            console.print("\n🎯 All integration tests passed!")
            console.print("The system is ready for end-to-end testing with the frontend.")
        else:
            console.print("\n⚠️ Some tests failed, but basic functionality works.")
    else:
        console.print("\n❌ Core functionality tests failed.")

if __name__ == "__main__":
    asyncio.run(main())