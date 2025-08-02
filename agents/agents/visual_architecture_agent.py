"""
Visual Architecture Agent for Streamlit interface
Adapts the existing ArchitectureMapperAgent for visual logging and workflow generation
"""

import sys
import os
import asyncio
from typing import Dict, Any, Optional

# Add src to path for imports  
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from src.agents.architecture_mapper import ArchitectureMapperAgent
from src.workflow.generator import WorkflowGenerator
from models.workflow_models import WorkflowDefinition
from utils.logger import StreamlitLogger

class VisualArchitectureAgent:
    """
    Streamlit-adapted version of ArchitectureMapperAgent with visual logging
    """
    
    def __init__(self):
        self.architecture_agent = ArchitectureMapperAgent()
        self.workflow_generator = WorkflowGenerator()
        self.logger = StreamlitLogger()
        self._initialized = False
    
    async def initialize(self):
        """Initialize the underlying agents"""
        if not self._initialized:
            self.logger.info("Initializing ArchitectureMapperAgent...")
            await self.architecture_agent.initialize()
            self._initialized = True
            self.logger.success("Agent initialization complete")
    
    async def generate_workflow(self, user_input: str) -> Optional[WorkflowDefinition]:
        """
        Generate a complete visual workflow from natural language input
        
        Args:
            user_input: Natural language description of DeFi requirements
            
        Returns:
            WorkflowDefinition object for visual display
        """
        try:
            # Ensure agent is initialized
            if not self._initialized:
                await self.initialize()
            
            # Step 1: Analyze user requirements
            self.logger.info(f"ArchitectureMapper analyzing: \"{user_input[:50]}...\"")
            requirements = await self.architecture_agent.analyze_request(user_input)
            
            if not requirements:
                self.logger.error("Failed to analyze user requirements")
                return None
            
            # Log detected requirements
            pattern = requirements.get('pattern', 'Unknown')
            tokens = requirements.get('tokens', [])
            features = requirements.get('features', [])
            
            self.logger.success(f"Detected DeFi pattern: {pattern}")
            if tokens:
                self.logger.info(f"Required tokens: {', '.join(tokens)}")
            if features:
                self.logger.info(f"Required features: {', '.join(features)}")
            
            # Step 2: Generate backend workflow definition
            self.logger.info("Generating workflow nodes...")
            backend_workflow = await self.workflow_generator.generate_workflow(requirements)
            
            if not backend_workflow:
                self.logger.error("Failed to generate workflow definition")
                return None
            
            # Step 3: Convert to visual workflow
            self.logger.info("Converting to visual workflow...")
            visual_workflow = WorkflowDefinition.from_backend_workflow(backend_workflow)
            
            # Log node generation
            node_count = len(visual_workflow.nodes)
            connection_count = len(visual_workflow.connections)
            
            for node in visual_workflow.nodes:
                self.logger.info(f"Generated node: {node.label} ({node.type.value})")
            
            self.logger.success(f"Generated {node_count} nodes with {connection_count} connections")
            
            # Set workflow metadata
            visual_workflow.name = f"{pattern} Workflow"
            visual_workflow.description = requirements.get('user_intent', user_input)
            visual_workflow.metadata = {
                'pattern': pattern,
                'tokens': tokens,
                'features': features,
                'user_input': user_input,
                'requirements': requirements
            }
            
            self.logger.success("Workflow ready for visualization")
            return visual_workflow
            
        except Exception as e:
            self.logger.error(f"Error generating workflow: {str(e)}")
            return None
    
    def get_supported_patterns(self) -> Dict[str, str]:
        """Get list of supported DeFi patterns"""
        return {
            "DEX Aggregator": "Token swapping with optimal routing and slippage protection",
            "Cross-Chain Bridge": "Transfer assets between different blockchain networks",
            "Yield Farming": "Automated liquidity provision and reward claiming",
            "Portfolio Management": "Track and analyze DeFi portfolio performance",
            "Limit Orders": "Conditional trading with custom price targets",
            "Gasless Swaps": "MEV-protected swaps using Fusion technology"
        }
    
    def get_supported_tokens(self) -> Dict[str, str]:
        """Get list of commonly supported tokens"""
        return {
            "ETH": "Ethereum",
            "USDC": "USD Coin",
            "USDT": "Tether USD",
            "WBTC": "Wrapped Bitcoin",
            "DAI": "Dai Stablecoin",
            "MATIC": "Polygon",
            "BNB": "Binance Coin",
            "LINK": "Chainlink",
            "UNI": "Uniswap"
        }
    
    def get_supported_features(self) -> Dict[str, str]:
        """Get list of supported DeFi features"""
        return {
            "slippage_protection": "Automatic slippage calculation and protection",
            "price_impact": "Real-time price impact analysis",
            "mev_protection": "Protection against Maximum Extractable Value",
            "gas_optimization": "Optimized gas usage for transactions",
            "multi_chain": "Support for multiple blockchain networks",
            "limit_orders": "Conditional trading with price targets",
            "portfolio_tracking": "Real-time portfolio analytics",
            "transaction_monitoring": "Live transaction status updates"
        }