"""
Simulated agent calls for DeFi flow generation testing.
This module simulates the actual agent system behavior by logging tool calls
and generating appropriate node specifications.
"""

import time
import re
from typing import List, Dict, Any, Tuple
from dummy_nodes import DummyNode, create_defi_swap_flow


class ToolCallSimulator:
    """Simulates tool calls and agent interactions for testing purposes."""
    
    def __init__(self, verbose: bool = True):
        self.verbose = verbose
        self.call_count = 0
    
    def log_tool_call(self, message: str) -> None:
        """Log a tool call with proper formatting."""
        self.call_count += 1
        if self.verbose:
            print(f"[TOOL CALL] {message}")
            time.sleep(0.1)  # Small delay to simulate processing
    
    def analyze_user_request(self, user_input: str) -> Dict[str, Any]:
        """Simulate analyzing user request and extracting requirements."""
        self.log_tool_call("Calling ArchitectureMapper Agent...")
        time.sleep(0.2)
        
        # Extract tokens mentioned
        tokens = []
        for token in ["ETH", "USDC", "WBTC", "BTC", "USDT", "DAI"]:
            if token.lower() in user_input.lower():
                tokens.append(token)
        
        # Extract features mentioned
        features = []
        if "slippage" in user_input.lower():
            features.append("slippage protection")
        if "swap" in user_input.lower():
            features.append("token swapping")
        if "defi" in user_input.lower():
            features.append("DeFi integration")
        
        self.log_tool_call(f"Analyzing request for: {', '.join(features) if features else 'swap application'}")
        if tokens:
            self.log_tool_call(f"Detected tokens: {', '.join(tokens)}")
        
        return {
            "tokens": tokens if tokens else ["ETH", "USDC", "WBTC"],
            "features": features,
            "application_type": "swap",
            "complexity": "basic"
        }
    
    def match_template(self, analysis: Dict[str, Any]) -> str:
        """Simulate template matching based on analysis."""
        self.log_tool_call("Matching to template: Basic DEX Aggregator")
        return "Basic DEX Aggregator"
    
    def generate_node_specification(self, node_type: str, context: Dict[str, Any]) -> DummyNode:
        """Simulate generating a specific node based on type and context."""
        node_name_map = {
            "wallet": "Wallet Connection",
            "token_selector": f"Token Selector ({', '.join(context.get('tokens', ['ETH', 'USDC', 'WBTC']))})",
            "quote": "1inch Quote (with slippage limits)",
            "price_calculator": "Price Impact Calculator", 
            "execution": "Swap Execution",
            "monitor": "Transaction Monitor"
        }
        
        self.log_tool_call(f"Generating Node: {node_name_map.get(node_type, node_type.title())}")
        
        # Create appropriate node based on type
        if node_type == "wallet":
            from dummy_nodes import WalletConnectionNode
            return WalletConnectionNode()
        elif node_type == "token_selector":
            from dummy_nodes import TokenSelectorNode
            return TokenSelectorNode(context.get('tokens', ['ETH', 'USDC', 'WBTC']))
        elif node_type == "quote":
            from dummy_nodes import OneinchQuoteNode
            return OneinchQuoteNode()
        elif node_type == "price_calculator":
            from dummy_nodes import PriceImpactCalculatorNode
            return PriceImpactCalculatorNode()
        elif node_type == "execution":
            from dummy_nodes import SwapExecutionNode
            return SwapExecutionNode()
        elif node_type == "monitor":
            from dummy_nodes import TransactionMonitorNode
            return TransactionMonitorNode()
        else:
            # Fallback
            from dummy_nodes import DummyNode
            return DummyNode(node_type.title(), f"Generated {node_type} node")


class MockArchitectureMapper:
    """Mock version of the ArchitectureMapper that simulates the full agent workflow."""
    
    def __init__(self):
        self.simulator = ToolCallSimulator()
        self.templates = {
            "Basic DEX Aggregator": {
                "description": "Basic decentralized exchange aggregator with slippage protection",
                "nodes": ["wallet", "token_selector", "quote", "price_calculator", "execution", "monitor"],
                "additional_features": ["Price alerts", "transaction history"]
            }
        }
    
    def process_user_request(self, user_input: str) -> Tuple[List[DummyNode], Dict[str, Any]]:
        """
        Main processing function that simulates the complete agent workflow.
        Returns tuple of (generated_nodes, metadata)
        """
        print("\nProcessing request...")
        
        # Step 1: Analyze user request
        analysis = self.simulator.analyze_user_request(user_input)
        
        # Step 2: Match to template
        template_name = self.simulator.match_template(analysis)
        template = self.templates[template_name]
        
        # Step 3: Generate nodes
        generated_nodes = []
        for node_type in template["nodes"]:
            node = self.simulator.generate_node_specification(node_type, analysis)
            generated_nodes.append(node)
        
        # Create metadata
        metadata = {
            "template": template_name,
            "description": template["description"],
            "additional_features": template["additional_features"],
            "tokens": analysis["tokens"],
            "tool_calls_made": self.simulator.call_count
        }
        
        return generated_nodes, metadata
    
    def get_flow_connections(self, nodes: List[DummyNode]) -> List[Tuple[int, int]]:
        """Generate flow connections between nodes (as indices)."""
        connections = []
        
        # Basic linear flow with some parallel branches
        if len(nodes) >= 6:
            # Main flow: wallet -> token_selector -> quote -> execution -> monitor
            connections.extend([
                (0, 1),  # wallet -> token_selector
                (1, 2),  # token_selector -> quote
                (2, 4),  # quote -> execution (skip price calculator for main flow)
                (4, 5),  # execution -> monitor
                
                # Side flow: quote -> price_calculator -> execution
                (2, 3),  # quote -> price_calculator
                (3, 4),  # price_calculator -> execution
                
                # Additional connections
                (0, 4),  # wallet -> execution (for address)
            ])
        else:
            # Simple linear flow for fewer nodes
            for i in range(len(nodes) - 1):
                connections.append((i, i + 1))
        
        return connections


# Global instance for easy access
mock_mapper = MockArchitectureMapper()


def simulate_agent_workflow(user_input: str) -> Tuple[List[DummyNode], Dict[str, Any], List[Tuple[int, int]]]:
    """
    Main function to simulate the complete agent workflow.
    Returns: (nodes, metadata, connections)
    """
    nodes, metadata = mock_mapper.process_user_request(user_input)
    connections = mock_mapper.get_flow_connections(nodes)
    
    return nodes, metadata, connections 