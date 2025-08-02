"""
Data structures for visual workflow representation
"""

from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional
from enum import Enum
import uuid

class NodeType(Enum):
    """Types of nodes available in DeFi workflows"""
    WALLET_CONNECTION = "walletConnection"
    TOKEN_SELECTOR = "tokenSelector"
    ONEINCH_QUOTE = "oneInchQuote"
    PRICE_IMPACT_CALCULATOR = "priceImpactCalculator"
    SWAP_EXECUTION = "swapExecution"
    TRANSACTION_MONITOR = "transactionMonitor"
    FUSION_PLUS = "fusionPlus"
    PORTFOLIO_API = "portfolioAPI"
    CHAIN_SELECTOR = "chainSelector"
    LIMIT_ORDER = "limitOrder"
    FUSION_SWAP = "fusionSwap"
    ERC20_TOKEN = "erc20Token"
    DEFI_DASHBOARD = "defiDashboard"

@dataclass
class NodeConnection:
    """Represents a connection between two nodes"""
    source_node_id: str
    target_node_id: str
    source_output: str = "output"
    target_input: str = "input"

@dataclass
class FlowNode:
    """Represents a single node in the workflow"""
    id: str
    type: NodeType
    label: str
    description: str
    config: Dict[str, Any] = field(default_factory=dict)
    position: Dict[str, float] = field(default_factory=lambda: {"x": 0, "y": 0})
    
    # Visual properties
    color: str = "#1f77b4"
    icon: str = "🔧"
    
    def __post_init__(self):
        """Set default visual properties based on node type"""
        node_styles = {
            NodeType.WALLET_CONNECTION: {"color": "#007bff", "icon": "💳"},
            NodeType.TOKEN_SELECTOR: {"color": "#ffc107", "icon": "🪙"},
            NodeType.ONEINCH_QUOTE: {"color": "#28a745", "icon": "📈"},
            NodeType.PRICE_IMPACT_CALCULATOR: {"color": "#6f42c1", "icon": "📊"},
            NodeType.SWAP_EXECUTION: {"color": "#dc3545", "icon": "⚡"},
            NodeType.TRANSACTION_MONITOR: {"color": "#fd7e14", "icon": "📋"},
            NodeType.FUSION_PLUS: {"color": "#20c997", "icon": "🔄"},
            NodeType.PORTFOLIO_API: {"color": "#6c757d", "icon": "💼"},
            NodeType.CHAIN_SELECTOR: {"color": "#17a2b8", "icon": "🔗"},
            NodeType.LIMIT_ORDER: {"color": "#e83e8c", "icon": "📝"},
            NodeType.FUSION_SWAP: {"color": "#20c997", "icon": "🔀"},
            NodeType.ERC20_TOKEN: {"color": "#ffc107", "icon": "🎯"},
            NodeType.DEFI_DASHBOARD: {"color": "#6f42c1", "icon": "📊"}
        }
        
        if self.type in node_styles:
            self.color = node_styles[self.type]["color"]
            self.icon = node_styles[self.type]["icon"]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert node to dictionary representation"""
        return {
            "id": self.id,
            "type": self.type.value,
            "label": self.label,
            "description": self.description,
            "config": self.config,
            "position": self.position,
            "color": self.color,
            "icon": self.icon
        }

@dataclass
class WorkflowDefinition:
    """Complete workflow definition with nodes and connections"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = "DeFi Workflow"
    description: str = ""
    nodes: List[FlowNode] = field(default_factory=list)
    connections: List[NodeConnection] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def add_node(self, node: FlowNode) -> None:
        """Add a node to the workflow"""
        self.nodes.append(node)
    
    def add_connection(self, connection: NodeConnection) -> None:
        """Add a connection between nodes"""
        self.connections.append(connection)
    
    def get_node_by_id(self, node_id: str) -> Optional[FlowNode]:
        """Get a node by its ID"""
        for node in self.nodes:
            if node.id == node_id:
                return node
        return None
    
    def calculate_layout(self) -> None:
        """Calculate automatic layout for nodes"""
        if not self.nodes:
            return
        
        # Simple grid layout for now
        nodes_per_row = 3
        x_spacing = 250
        y_spacing = 150
        start_x = 100
        start_y = 100
        
        for i, node in enumerate(self.nodes):
            row = i // nodes_per_row
            col = i % nodes_per_row
            node.position = {
                "x": start_x + (col * x_spacing),
                "y": start_y + (row * y_spacing)
            }
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert workflow to dictionary representation"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "nodes": [node.to_dict() for node in self.nodes],
            "connections": [
                {
                    "source": conn.source_node_id,
                    "target": conn.target_node_id,
                    "sourceOutput": conn.source_output,
                    "targetInput": conn.target_input
                } for conn in self.connections
            ],
            "metadata": self.metadata
        }
    
    @classmethod
    def from_backend_workflow(cls, backend_workflow: Dict[str, Any]) -> 'WorkflowDefinition':
        """Create WorkflowDefinition from backend workflow format"""
        workflow = cls(
            id=backend_workflow.get('id', str(uuid.uuid4())),
            name=backend_workflow.get('name', 'DeFi Workflow'),
            description=backend_workflow.get('description', '')
        )
        
        # Convert backend nodes to FlowNodes
        backend_nodes = backend_workflow.get('nodes', [])
        for backend_node in backend_nodes:
            try:
                node_type = NodeType(backend_node['type'])
            except ValueError:
                # Skip unknown node types
                continue
                
            node = FlowNode(
                id=backend_node['id'],
                type=node_type,
                label=backend_node.get('label', backend_node['type']),
                description=backend_node.get('description', ''),
                config=backend_node.get('config', {})
            )
            workflow.add_node(node)
        
        # Convert backend edges to connections
        backend_edges = backend_workflow.get('edges', [])
        for edge in backend_edges:
            connection = NodeConnection(
                source_node_id=edge['source'],
                target_node_id=edge['target'],
                source_output=edge.get('sourceHandle', 'output'),
                target_input=edge.get('targetHandle', 'input')
            )
            workflow.add_connection(connection)
        
        # Calculate layout
        workflow.calculate_layout()
        
        return workflow