#!/usr/bin/env python3
"""
Main terminal input handler for DeFi flow testing.
Entry point that demonstrates the complete agent workflow simulation.
"""

import sys
from typing import Optional
from dummy_agents import simulate_agent_workflow
from flow_visualizer import visualize_flow


def print_banner():
    """Print a nice banner for the test application."""
    print("=" * 80)
    print("🚀 UNITE DEFI - Node Flow Generator Test")
    print("=" * 80)
    print("Testing agent workflow simulation with ASCII visualization")
    print("")


def get_user_input() -> str:
    """Get user input from terminal."""
    print("> Enter your DeFi request:")
    try:
        user_input = input().strip()
        if not user_input:
            return "I want to create a swap application for my DeFi protocol that supports ETH, USDC, and WBTC with slippage protection"
        return user_input
    except (KeyboardInterrupt, EOFError):
        print("\nGoodbye!")
        sys.exit(0)


def run_test_with_input(user_input: str) -> None:
    """Run the complete test flow with given input."""
    print(f"Input: {user_input}")
    print("")
    
    try:
        # Simulate the complete agent workflow
        nodes, metadata, connections = simulate_agent_workflow(user_input)
        
        print("")  # Add spacing after tool calls
        
        # Generate and display the visualization
        result = visualize_flow(nodes, metadata, connections)
        print(result)
        
        # Print summary
        print("")
        print("=" * 50)
        print("📊 SUMMARY")
        print("=" * 50)
        print(f"✅ Nodes Generated: {len(nodes)}")
        print(f"✅ Tool Calls Made: {metadata.get('tool_calls_made', 'N/A')}")
        print(f"✅ Template Matched: {metadata.get('template', 'N/A')}")
        print(f"✅ Flow Connections: {len(connections)}")
        print("")
        
        # List all generated nodes
        print("Generated Nodes:")
        for i, node in enumerate(nodes, 1):
            print(f"  {i}. {node.name}")
            if hasattr(node, 'params') and node.params:
                key_params = []
                if 'supported_tokens' in node.params:
                    key_params.append(f"tokens: {','.join(node.params['supported_tokens'])}")
                if 'max_slippage' in node.params:
                    key_params.append(f"slippage: {node.params['max_slippage']}")
                if 'slippage_protection' in node.params:
                    key_params.append("slippage_protection: enabled")
                
                if key_params:
                    print(f"     └─ {', '.join(key_params)}")
        
        print("")
        
    except Exception as e:
        print(f"❌ Error during processing: {e}")
        import traceback
        traceback.print_exc()


def run_interactive_mode():
    """Run in interactive mode for user input."""
    print_banner()
    
    while True:
        try:
            user_input = get_user_input()
            run_test_with_input(user_input)
            
            print("\n" + "=" * 80)
            print("Press Enter to test again, or Ctrl+C to exit...")
            input()
            print("")
            
        except (KeyboardInterrupt, EOFError):
            print("\nThanks for testing Unite DeFi! 🚀")
            break


def run_demo_mode():
    """Run with the specific test input from the plan."""
    print_banner()
    
    # Use the exact test input specified in the plan
    demo_input = "I want to create a swap application for my DeFi protocol that supports ETH, USDC, and WBTC with slippage protection"
    
    print("🎯 DEMO MODE: Running with predefined test input")
    print("")
    
    run_test_with_input(demo_input)


def main():
    """Main entry point."""
    if len(sys.argv) > 1:
        if sys.argv[1] == "--demo":
            run_demo_mode()
        elif sys.argv[1] == "--help":
            print("Usage:")
            print("  python main.py           # Interactive mode")
            print("  python main.py --demo    # Demo mode with predefined input")
            print("  python main.py --help    # Show this help")
        else:
            # Use command line argument as input
            user_input = " ".join(sys.argv[1:])
            print_banner()
            run_test_with_input(user_input)
    else:
        run_interactive_mode()


if __name__ == "__main__":
    main() 