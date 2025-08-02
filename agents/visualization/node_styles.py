"""
Node styling and color schemes for workflow visualization
"""

from typing import Dict, Any
from models.workflow_models import NodeType

class NodeStyleManager:
    """Manages visual styling for different node types"""
    
    def __init__(self):
        self.node_styles = {
            NodeType.WALLET_CONNECTION: {
                "color": "#007bff",
                "icon": "💳",
                "category": "Input",
                "description": "Connect cryptocurrency wallets"
            },
            NodeType.TOKEN_SELECTOR: {
                "color": "#ffc107", 
                "icon": "🪙",
                "category": "Configuration",
                "description": "Select tokens for operations"
            },
            NodeType.ONEINCH_QUOTE: {
                "color": "#28a745",
                "icon": "📈", 
                "category": "DeFi",
                "description": "Get optimal swap quotes"
            },
            NodeType.PRICE_IMPACT_CALCULATOR: {
                "color": "#6f42c1",
                "icon": "📊",
                "category": "Analysis", 
                "description": "Calculate price impact"
            },
            NodeType.SWAP_EXECUTION: {
                "color": "#dc3545",
                "icon": "⚡",
                "category": "Execution",
                "description": "Execute token swaps"
            },
            NodeType.TRANSACTION_MONITOR: {
                "color": "#fd7e14",
                "icon": "📋",
                "category": "Monitoring",
                "description": "Monitor transaction status"
            },
            NodeType.FUSION_PLUS: {
                "color": "#20c997",
                "icon": "🔄",
                "category": "DeFi",
                "description": "Cross-chain operations"
            },
            NodeType.PORTFOLIO_API: {
                "color": "#6c757d",
                "icon": "💼",
                "category": "Analytics",
                "description": "Portfolio tracking"
            },
            NodeType.CHAIN_SELECTOR: {
                "color": "#17a2b8",
                "icon": "🔗",
                "category": "Configuration",
                "description": "Select blockchain networks"
            },
            NodeType.LIMIT_ORDER: {
                "color": "#e83e8c",
                "icon": "📝",
                "category": "Trading",
                "description": "Create limit orders"
            },
            NodeType.FUSION_SWAP: {
                "color": "#20c997",
                "icon": "🔀",
                "category": "DeFi",
                "description": "Gasless MEV-protected swaps"
            },
            NodeType.ERC20_TOKEN: {
                "color": "#ffc107",
                "icon": "🎯",
                "category": "Token",
                "description": "ERC20 token operations"
            },
            NodeType.DEFI_DASHBOARD: {
                "color": "#6f42c1",
                "icon": "📊",
                "category": "UI",
                "description": "DeFi dashboard interface"
            }
        }
        
        self.category_colors = {
            "Input": "#007bff",
            "Configuration": "#ffc107",
            "DeFi": "#28a745", 
            "Analysis": "#6f42c1",
            "Execution": "#dc3545",
            "Monitoring": "#fd7e14",
            "Analytics": "#6c757d",
            "Trading": "#e83e8c",
            "Token": "#ffc107",
            "UI": "#6f42c1"
        }
    
    def get_node_style(self, node_type: NodeType) -> Dict[str, Any]:
        """Get styling information for a node type"""
        return self.node_styles.get(node_type, {
            "color": "#6c757d",
            "icon": "🔧",
            "category": "Unknown",
            "description": "Unknown node type"
        })
    
    def get_category_color(self, category: str) -> str:
        """Get color for a node category"""
        return self.category_colors.get(category, "#6c757d")
    
    def get_all_categories(self) -> Dict[str, str]:
        """Get all available categories with their colors"""
        return self.category_colors.copy()