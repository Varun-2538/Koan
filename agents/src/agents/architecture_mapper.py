from __future__ import annotations

import json
import re
import asyncio
from dataclasses import dataclass, asdict
from typing import Any, Dict, List

from agno.agent import Agent
from agno.models.anthropic import Claude

# NOTE: If your agno installation names or import paths differ, adjust accordingly.

@dataclass
class NodeSpec:
    """Represents a single node in the generated flow graph."""

    id: str
    type: str
    params: Dict[str, Any]


@dataclass
class NodeFlow:
    """High-level representation of the full node flow returned by the agent."""

    description: str
    nodes: List[NodeSpec]
    edges: List[Dict[str, str]]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "description": self.description,
            "nodes": [asdict(n) for n in self.nodes],
            "edges": self.edges,
        }


class ArchitectureMapperAgent:
    """Agent that converts natural-language DeFi requirements into a structured node-flow JSON.

    Example usage
    -------------
    >>> agent = ArchitectureMapperAgent()
    >>> await agent.initialize()
    >>> requirements = await agent.analyze_request(
    ...     "Create a swap application for ETH, USDC, WBTC with slippage protection"
    ... )
    >>> print(requirements)
    """

    def __init__(
        self,
        model_id: str = "claude-sonnet-4-20250514",
        temperature: float = 0.0,
    ) -> None:
        self.model_id = model_id
        self.temperature = temperature
        self._agent = None
        
    async def initialize(self) -> None:
        """Initialize the agno agent - required before use"""
        # Initialize underlying LLM via agno-agi.
        claude = Claude(id=self.model_id, temperature=self.temperature)

        self._agent = Agent(
            model=claude,
            instructions=self._system_prompt(),
            name="ArchitectureMapperAgent",
            markdown=False,
            stream=False,
        )

    @staticmethod
    def _system_prompt() -> str:
        """Detailed prompt sent as system instructions to the LLM."""
        return (
            "You are an expert DeFi architecture mapper. "
            "Given a user's natural-language request, analyze it and provide structured information.\n\n"
            
            "Available backend node types:\n"
            "- walletConnector: Connect cryptocurrency wallets (MetaMask, WalletConnect)\n" 
            "- tokenSelector: Select and configure tokens for operations (ETH, USDC, WBTC, etc.)\n"
            "- oneInchQuote: Get optimal swap quotes using 1inch aggregator\n"
            "- oneInchSwap: Execute token swaps using 1inch aggregator\n"
            "- limitOrder: Create and manage limit orders using 1inch Limit Order Protocol\n"
            "- priceImpactCalculator: Calculate price impact with risk assessment\n"
            "- transactionMonitor: Monitor transaction status and confirmations\n"
            "- transactionStatus: Track transaction confirmations and results\n"
            "- fusionPlus: Cross-chain swaps using Fusion+ bridge\n"
            "- fusionSwap: Gasless MEV-protected swaps using Fusion\n"
            "- portfolioAPI: Portfolio tracking and analytics\n"
            "- chainSelector: Select blockchain networks (Ethereum, Polygon, etc.)\n"
            "- erc20Token: ERC20 token operations and management\n"
            "- defiDashboard: DeFi dashboard with analytics and monitoring\n\n"
            
            "Node selection guidelines:\n"
            "- For LIMIT ORDERS: Use limitOrder + tokenSelector + walletConnector\n"
            "- For SWAPS: Use oneInchQuote + oneInchSwap + tokenSelector + walletConnector\n"
            "- For PORTFOLIO: Use portfolioAPI + walletConnector\n"
            "- For CROSS-CHAIN: Use fusionPlus + chainSelector + tokenSelector\n\n"
            
            "Respond with a JSON object containing:\n"
            "{\n"
            "  \"pattern\": \"type of DeFi application (e.g., 'DEX Aggregator', 'Cross-Chain Bridge')\",\n"
            "  \"tokens\": [\"list\", \"of\", \"tokens\", \"mentioned\"],\n"
            "  \"features\": [\"list\", \"of\", \"features\", \"like\", \"slippage protection\"],\n"
            "  \"chains\": [\"ethereum\", \"polygon\"],\n"
            "  \"user_intent\": \"summary of what user wants\",\n"
            "  \"suggested_nodes\": [\"list\", \"of\", \"recommended\", \"node\", \"types\"]\n"
            "}\n\n"
            "Respond ONLY with valid JSON (no markdown)."
        )

    async def analyze_request(self, user_input: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Analyze user's natural language request and extract DeFi requirements
        
        Args:
            user_input: Natural language description of DeFi requirements
            context: Optional conversation context for multi-turn interactions
            
        Returns:
            Structured requirements dictionary
        """
        if not self._agent:
            raise RuntimeError("Agent not initialized. Call initialize() first.")
        
        # Prepare input with context if available
        enhanced_input = user_input
        if context and context.get("history"):
            # Add conversation history for context
            history_context = "\n\nConversation history:\n"
            for msg in context["history"][-3:]:  # Last 3 messages for context
                role = msg.get("role", "unknown")
                content = msg.get("content", "")
                history_context += f"{role}: {content}\n"
            enhanced_input = f"{user_input}{history_context}"
        
        # Run the agent - this might be sync or async depending on agno version
        try:
            if hasattr(self._agent, 'arun'):
                # Async version
                messages = await self._agent.arun(enhanced_input)
            else:
                # Sync version - run in executor to avoid blocking
                messages = await asyncio.to_thread(self._agent.run, enhanced_input)
        except Exception as e:
            # Fallback to mock analysis if agno fails
            return self._fallback_analysis(user_input, context)

        content = "".join([m.content for m in messages]) if isinstance(messages, list) else str(messages)

        try:
            data = self._extract_json(content)
            return self._normalize_requirements(data)
        except (json.JSONDecodeError, ValueError) as e:
            # Fallback if JSON parsing fails
            return self._fallback_analysis(user_input, context)

    async def map_user_idea(self, user_input: str) -> NodeFlow:
        """Legacy method for backward compatibility - converts to new format"""
        requirements = await self.analyze_request(user_input)
        
        # Convert to NodeFlow format
        nodes = []
        edges = []
        
        suggested_nodes = requirements.get('suggested_nodes', [])
        for i, node_type in enumerate(suggested_nodes):
            nodes.append(NodeSpec(
                id=f"{node_type}-{i+1}",
                type=node_type,
                params=self._generate_node_params(node_type, requirements)
            ))
            
            # Create simple chain of edges
            if i > 0:
                edges.append({
                    "from": f"{suggested_nodes[i-1]}-{i}",
                    "to": f"{node_type}-{i+1}"
                })
        
        return NodeFlow(
            description=requirements.get('user_intent', 'DeFi workflow'),
            nodes=nodes,
            edges=edges
        )

    def _generate_node_params(self, node_type: str, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Generate appropriate parameters for each node type"""
        base_params = {}
        
        if node_type == 'tokenSelector':
            base_params['tokens'] = requirements.get('tokens', ['ETH', 'USDC'])
            
        elif node_type == 'chainSelector':
            base_params['chains'] = requirements.get('chains', ['ethereum'])
            
        elif node_type in ['oneInchQuote', 'oneInchSwap']:
            if 'slippage protection' in requirements.get('features', []):
                base_params['slippageProtection'] = True
                
        elif node_type == 'priceImpactCalculator':
            base_params['warningThreshold'] = 3.0
            base_params['detailedAnalysis'] = True
            
        return base_params
        
    def _fallback_analysis(self, user_input: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Fallback analysis when agno is not available"""
        input_lower = user_input.lower()
        
        # Simple pattern detection
        if any(word in input_lower for word in ['limit order', 'limit-order', 'limitorder', 'order']):
            pattern = "Limit Order Application"
            suggested_nodes = ['walletConnector', 'tokenSelector', 'limitOrder', 'transactionMonitor']
        elif any(word in input_lower for word in ['swap', 'exchange', 'trade']):
            pattern = "DEX Aggregator"
            suggested_nodes = ['walletConnector', 'tokenSelector', 'oneInchQuote', 'priceImpactCalculator', 'oneInchSwap', 'transactionMonitor']
        elif any(word in input_lower for word in ['bridge', 'cross-chain']):
            pattern = "Cross-Chain Bridge"
            suggested_nodes = ['walletConnector', 'chainSelector', 'tokenSelector', 'fusionPlus', 'transactionMonitor']
        elif any(word in input_lower for word in ['portfolio', 'dashboard']):
            pattern = "Portfolio Dashboard"
            suggested_nodes = ['walletConnector', 'portfolioAPI']
        else:
            pattern = "Custom DeFi Application"
            suggested_nodes = ['walletConnector', 'tokenSelector']
            
        # Extract tokens
        tokens = []
        token_patterns = ['eth', 'usdc', 'usdt', 'wbtc', 'dai', 'uni', 'link']
        for token in token_patterns:
            if token in input_lower:
                tokens.append(token.upper())
                
        # Extract features
        features = []
        if 'slippage' in input_lower:
            features.append('slippage protection')
        if 'mev' in input_lower:
            features.append('MEV protection')
        if 'gas' in input_lower:
            features.append('gas optimization')
        if any(word in input_lower for word in ['limit', 'order']):
            features.append('limit orders')
        if 'monitor' in input_lower:
            features.append('transaction monitoring')
            
        return {
            'pattern': pattern,
            'tokens': tokens or ['ETH', 'USDC'],
            'features': features,
            'chains': ['ethereum'],
            'user_intent': user_input,
            'suggested_nodes': suggested_nodes
        }

    def _normalize_requirements(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize parsed requirements to expected format"""
        return {
            'pattern': data.get('pattern', 'Custom DeFi Application'),
            'tokens': data.get('tokens', []),
            'features': data.get('features', []),
            'chains': data.get('chains', ['ethereum']),
            'user_intent': data.get('user_intent', ''),
            'suggested_nodes': data.get('suggested_nodes', [])
        }

    @staticmethod
    def _extract_json(text: str) -> Dict[str, Any]:
        """Extract the first JSON object found in *text* and return it as a dict."""
        match = re.search(r"\{[\s\S]*\}", text)
        if not match:
            raise ValueError("ArchitectureMapperAgent did not return JSON-formatted output. Got: " + text[:200])
        return json.loads(match.group(0))