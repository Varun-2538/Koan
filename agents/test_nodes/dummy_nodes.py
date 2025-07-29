"""
Dummy node class definitions for DeFi flow testing.
"""

from dataclasses import dataclass
from typing import List, Dict, Any, Optional


@dataclass
class DummyNode:
    """Base class for dummy nodes representing DeFi components."""
    
    def __init__(self, name: str, description: str, inputs: Optional[List[str]] = None, outputs: Optional[List[str]] = None):
        self.name = name
        self.description = description
        self.inputs = inputs or []
        self.outputs = outputs or []
        self.node_type = self.__class__.__name__.lower().replace('node', '')
        self.params = {}
    
    def __repr__(self):
        return f"{self.__class__.__name__}(name='{self.name}', inputs={len(self.inputs)}, outputs={len(self.outputs)})"


class WalletConnectionNode(DummyNode):
    """Node for wallet connection functionality."""
    
    def __init__(self):
        super().__init__(
            name="Wallet Connection",
            description="Connects to user's Web3 wallet (MetaMask, WalletConnect)",
            inputs=[],
            outputs=["wallet_address", "wallet_provider", "network_id"]
        )
        self.params = {
            "supported_wallets": ["MetaMask", "WalletConnect", "Coinbase Wallet"],
            "auto_connect": True,
            "network_validation": True
        }


class TokenSelectorNode(DummyNode):
    """Node for token selection with supported tokens."""
    
    def __init__(self, supported_tokens: List[str] = None):
        if supported_tokens is None:
            supported_tokens = ["ETH", "USDC", "WBTC"]
        
        super().__init__(
            name="Token Selector",
            description=f"Token selection interface for {', '.join(supported_tokens)}",
            inputs=["wallet_address"],
            outputs=["from_token", "to_token", "amount"]
        )
        self.params = {
            "supported_tokens": supported_tokens,
            "balance_check": True,
            "token_validation": True
        }


class OneinchQuoteNode(DummyNode):
    """Node for 1inch DEX aggregator quotes with slippage protection."""
    
    def __init__(self):
        super().__init__(
            name="1inch Quote",
            description="Gets optimal swap quotes from 1inch with slippage limits",
            inputs=["from_token", "to_token", "amount"],
            outputs=["quote_data", "estimated_gas", "route_info"]
        )
        self.params = {
            "max_slippage": "1%",
            "slippage_protection": True,
            "route_optimization": True,
            "gas_estimation": True
        }


class PriceImpactCalculatorNode(DummyNode):
    """Node for calculating price impact and market conditions."""
    
    def __init__(self):
        super().__init__(
            name="Price Impact Calculator",
            description="Calculates price impact and validates market conditions",
            inputs=["quote_data", "amount"],
            outputs=["price_impact", "market_warnings", "optimal_timing"]
        )
        self.params = {
            "max_price_impact": "3%",
            "market_depth_check": True,
            "liquidity_analysis": True
        }


class SwapExecutionNode(DummyNode):
    """Node for executing the actual swap transaction."""
    
    def __init__(self):
        super().__init__(
            name="Swap Execution",
            description="Executes the swap transaction with safety checks",
            inputs=["quote_data", "price_impact", "wallet_address"],
            outputs=["transaction_hash", "execution_status"]
        )
        self.params = {
            "safety_checks": True,
            "transaction_simulation": True,
            "gas_optimization": True,
            "retry_logic": True
        }


class TransactionMonitorNode(DummyNode):
    """Node for monitoring transaction status and completion."""
    
    def __init__(self):
        super().__init__(
            name="Transaction Monitor",
            description="Monitors transaction status and provides updates",
            inputs=["transaction_hash"],
            outputs=["confirmation_status", "final_balances", "transaction_receipt"]
        )
        self.params = {
            "confirmation_blocks": 3,
            "timeout_minutes": 10,
            "status_updates": True,
            "failure_recovery": True
        }


# Node registry for easy access
NODE_REGISTRY = {
    "wallet_connection": WalletConnectionNode,
    "token_selector": TokenSelectorNode,
    "oneinch_quote": OneinchQuoteNode,
    "price_impact_calculator": PriceImpactCalculatorNode,
    "swap_execution": SwapExecutionNode,
    "transaction_monitor": TransactionMonitorNode
}


def create_defi_swap_flow(tokens: List[str] = None) -> List[DummyNode]:
    """Create a complete DeFi swap flow with the specified tokens."""
    if tokens is None:
        tokens = ["ETH", "USDC", "WBTC"]
    
    return [
        WalletConnectionNode(),
        TokenSelectorNode(tokens),
        OneinchQuoteNode(),
        PriceImpactCalculatorNode(),
        SwapExecutionNode(),
        TransactionMonitorNode()
    ] 