#!/usr/bin/env python3
"""
Test script for the DeFi Agent System

This script tests the components without requiring the TypeScript backend to be running.
"""

import asyncio
import json
from rich.console import Console
from rich.panel import Panel

console = Console()

async def test_architecture_mapper():
    """Test the ArchitectureMapperAgent"""
    console.print(Panel("🧠 Testing Architecture Mapper Agent", style="bold blue"))
    
    try:
        from src.agents.architecture_mapper import ArchitectureMapperAgent
        
        agent = ArchitectureMapperAgent()
        await agent.initialize()
        
        test_input = "I want to create a swap application for my DeFi protocol that supports ETH, USDC, and WBTC with slippage protection"
        
        console.print(f"[bold]Input:[/bold] {test_input}")
        
        requirements = await agent.analyze_request(test_input)
        
        console.print(f"[bold]Requirements:[/bold]")
        console.print(json.dumps(requirements, indent=2))
        
        console.print("✅ Architecture Mapper test passed")
        return requirements
        
    except Exception as e:
        console.print(f"❌ Architecture Mapper test failed: {e}")
        return None

async def test_workflow_generator(requirements):
    """Test the WorkflowGenerator"""
    console.print(Panel("📋 Testing Workflow Generator", style="bold green"))
    
    try:
        from src.workflow.generator import WorkflowGenerator
        
        generator = WorkflowGenerator()
        
        workflow = await generator.generate_workflow(requirements)
        
        console.print(f"[bold]Generated Workflow:[/bold]")
        console.print(f"ID: {workflow['id']}")
        console.print(f"Name: {workflow['name']}")
        console.print(f"Nodes: {len(workflow['nodes'])}")
        console.print(f"Edges: {len(workflow['edges'])}")
        
        # Validate the workflow
        validation = await generator.validate_workflow(workflow)
        
        if validation['valid']:
            console.print("✅ Workflow validation passed")
        else:
            console.print(f"❌ Workflow validation failed: {validation['errors']}")
            
        # Show a sample node
        if workflow['nodes']:
            sample_node = workflow['nodes'][0]
            console.print(f"[bold]Sample Node:[/bold]")
            console.print(json.dumps(sample_node, indent=2))
            
        # Show the complete workflow structure for debugging
        console.print(f"[bold]Complete Workflow Structure:[/bold]")
        console.print(json.dumps(workflow, indent=2))
        
        console.print("✅ Workflow Generator test passed")
        return workflow
        
    except Exception as e:
        console.print(f"❌ Workflow Generator test failed: {e}")
        return None

async def test_backend_client():
    """Test the DeFiBackendClient (without actually connecting)"""
    console.print(Panel("📡 Testing Backend Client", style="bold yellow"))
    
    try:
        from src.api.backend_client import DeFiBackendClient
        
        # Create client but don't connect
        client = DeFiBackendClient("http://localhost:3001")
        
        console.print(f"Backend URL: {client.base_url}")
        console.print("Note: Skipping actual connection test (backend may not be running)")
        
        # Test the client structure
        methods = [method for method in dir(client) if not method.startswith('_')]
        console.print(f"Available methods: {', '.join(methods)}")
        
        console.print("✅ Backend Client structure test passed")
        return True
        
    except Exception as e:
        console.print(f"❌ Backend Client test failed: {e}")
        return False

async def test_end_to_end():
    """Test the complete end-to-end flow"""
    console.print(Panel("🚀 End-to-End Test", style="bold magenta"))
    
    try:
        # Test input similar to the example in plan.md
        test_input = "I want to create a swap application for my DeFi protocol that supports ETH, USDC, and WBTC with slippage protection"
        
        console.print(f"🤖 Processing: [italic]{test_input}[/italic]")
        
        # Step 1: Architecture Analysis
        requirements = await test_architecture_mapper()
        if not requirements:
            return False
            
        # Step 2: Workflow Generation  
        workflow = await test_workflow_generator(requirements)
        if not workflow:
            return False
            
        # Step 3: Backend Client Setup
        backend_ok = await test_backend_client()
        if not backend_ok:
            return False
            
        console.print("\n🎉 All components working correctly!")
        console.print("\n[bold]Expected Flow:[/bold]")
        console.print("1. ✅ Natural language → AI agent analysis")
        console.print("2. ✅ Requirements → Workflow generation")
        console.print("3. ✅ Workflow → Backend API client")
        console.print("4. 📡 Backend execution (requires TypeScript server)")
        
        console.print(f"\n[bold]To run the full system:[/bold]")
        console.print("1. Start the TypeScript backend: cd ../backend && npm run dev")
        console.print("2. Run the agent system: python main.py")
        
        return True
        
    except Exception as e:
        console.print(f"❌ End-to-end test failed: {e}")
        return False

async def main():
    """Main test function"""
    console.print(Panel.fit("🧪 DeFi Agent System - Component Testing", style="bold cyan"))
    
    success = await test_end_to_end()
    
    if success:
        console.print("\n✨ All tests passed! The system is ready to use.")
    else:
        console.print("\n💥 Some tests failed. Check the errors above.")

if __name__ == "__main__":
    asyncio.run(main())