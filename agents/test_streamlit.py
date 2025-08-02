"""
Test script for the Streamlit visual DeFi flow generator
"""

import asyncio
import sys
import os

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from agents.visual_architecture_agent import VisualArchitectureAgent

async def test_visual_agent():
    """Test the visual architecture agent without Streamlit"""
    
    print("🧪 Testing Visual Architecture Agent")
    print("=" * 50)
    
    # Initialize agent
    agent = VisualArchitectureAgent()
    
    # Test input from plan.md
    test_input = "I want to create a swap application for my DeFi protocol that supports ETH, USDC, and WBTC with slippage protection"
    
    print(f"📝 Test Input: {test_input}")
    print()
    
    # Generate workflow
    workflow = await agent.generate_workflow(test_input)
    
    if workflow:
        print("✅ Workflow Generated Successfully!")
        print(f"📊 Workflow Name: {workflow.name}")
        print(f"📄 Description: {workflow.description}")
        print(f"🔧 Nodes: {len(workflow.nodes)}")
        print(f"🔗 Connections: {len(workflow.connections)}")
        print()
        
        print("📋 Node Details:")
        for i, node in enumerate(workflow.nodes, 1):
            print(f"  {i}. {node.icon} {node.label} ({node.type.value})")
        
        print()
        print("🔗 Connections:")
        for i, conn in enumerate(workflow.connections, 1):
            source_node = workflow.get_node_by_id(conn.source_node_id)
            target_node = workflow.get_node_by_id(conn.target_node_id)
            if source_node and target_node:
                print(f"  {i}. {source_node.label} → {target_node.label}")
        
        return True
    else:
        print("❌ Failed to generate workflow")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_visual_agent())
    
    if success:
        print("\n🎉 Test completed successfully!")
        print("\n🌐 Streamlit App Instructions:")
        print("1. The Streamlit app is running at: http://localhost:8501")
        print("2. Enter the test prompt in the text area")
        print("3. Click 'Generate Flow' to see the visual workflow")
        print("4. Check the sidebar for real-time agent logging")
    else:
        print("\n❌ Test failed - check your configuration")