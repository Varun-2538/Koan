"""
ASCII art generator for visualizing DeFi node flows in terminal.
Creates beautiful text-based diagrams showing node connections and data flow.
"""

from typing import List, Tuple, Dict, Any
from dummy_nodes import DummyNode


class ASCIIFlowVisualizer:
    """Generates ASCII art representations of node flows."""
    
    def __init__(self, node_width: int = 17, spacing: int = 4):
        self.node_width = node_width
        self.spacing = spacing
        self.horizontal_connector = "───▶"
        self.vertical_connector = "│"
        self.down_arrow = "▼"
    
    def _wrap_text(self, text: str, width: int) -> List[str]:
        """Wrap text to fit within specified width."""
        if len(text) <= width:
            return [text]
        
        words = text.split()
        lines = []
        current_line = ""
        
        for word in words:
            if len(current_line + " " + word) <= width:
                if current_line:
                    current_line += " " + word
                else:
                    current_line = word
            else:
                if current_line:
                    lines.append(current_line)
                current_line = word
        
        if current_line:
            lines.append(current_line)
        
        return lines
    
    def _create_node_box(self, node: DummyNode) -> List[str]:
        """Create a text box representation of a node."""
        # Extract the key information for display
        if hasattr(node, 'params') and 'supported_tokens' in node.params:
            tokens = node.params['supported_tokens']
            if len(tokens) <= 3:
                display_text = f"{node.name}\n({','.join(tokens)})"
            else:
                display_text = f"{node.name}\n({','.join(tokens[:3])}...)"
        elif "slippage" in node.description.lower():
            display_text = f"{node.name}\n(w/ slippage)"
        else:
            # Wrap the node name
            wrapped_lines = self._wrap_text(node.name, self.node_width - 2)
            display_text = "\n".join(wrapped_lines)
        
        lines = display_text.split('\n')
        
        # Create the box
        box_lines = []
        box_lines.append("┌" + "─" * (self.node_width - 2) + "┐")
        
        for line in lines:
            padding = self.node_width - 2 - len(line)
            left_pad = padding // 2
            right_pad = padding - left_pad
            box_lines.append("│" + " " * left_pad + line + " " * right_pad + "│")
        
        # Add extra padding if needed
        if len(lines) == 1:
            padding = self.node_width - 2
            box_lines.append("│" + " " * padding + "│")
        
        box_lines.append("└" + "─" * (self.node_width - 2) + "┘")
        
        return box_lines
    
    def generate_flow_ascii(self, nodes: List[DummyNode], connections: List[Tuple[int, int]] = None) -> str:
        """Generate ASCII art representation of the node flow."""
        if not nodes:
            return "No nodes to display"
        
        if connections is None:
            # Default to linear flow
            connections = [(i, i + 1) for i in range(len(nodes) - 1)]
        
        # For the specific 6-node DeFi flow, create the expected layout
        if len(nodes) == 6:
            return self._create_defi_flow_ascii(nodes)
        else:
            return self._create_linear_flow_ascii(nodes)
    
    def _create_defi_flow_ascii(self, nodes: List[DummyNode]) -> str:
        """Create the specific DeFi flow ASCII as shown in the plan."""
        # Create node boxes
        node_boxes = [self._create_node_box(node) for node in nodes]
        
        # Build the specific layout from the plan
        lines = []
        
        # Top row: Wallet -> Token Selector -> 1inch Quote
        top_row = []
        for i in [0, 1, 2]:  # wallet, token_selector, 1inch_quote
            top_row.append(node_boxes[i])
        
        # Add top row with connectors
        max_height = max(len(box) for box in top_row)
        for line_idx in range(max_height):
            line_parts = []
            for i, box in enumerate(top_row):
                if line_idx < len(box):
                    line_parts.append(box[line_idx])
                else:
                    line_parts.append(" " * self.node_width)
                
                # Add connector between boxes (except after last)
                if i < len(top_row) - 1:
                    if line_idx == max_height // 2:  # Middle line for arrow
                        line_parts.append(self.horizontal_connector)
                    else:
                        line_parts.append(" " * len(self.horizontal_connector))
            
            lines.append("".join(line_parts))
        
        # Add vertical connectors down from each top node
        connector_line = ""
        for i in range(3):
            # Position connector in middle of each node
            pos = i * (self.node_width + len(self.horizontal_connector)) + self.node_width // 2
            while len(connector_line) < pos:
                connector_line += " "
            connector_line += self.vertical_connector
            
            # Add spacing to next connector
            if i < 2:
                while len(connector_line) < (i + 1) * (self.node_width + len(self.horizontal_connector)):
                    connector_line += " "
        
        lines.append(connector_line)
        
        # Add down arrows
        arrow_line = ""
        for i in range(3):
            pos = i * (self.node_width + len(self.horizontal_connector)) + self.node_width // 2
            while len(arrow_line) < pos:
                arrow_line += " "
            arrow_line += self.down_arrow
            
            if i < 2:
                while len(arrow_line) < (i + 1) * (self.node_width + len(self.horizontal_connector)):
                    arrow_line += " "
        
        lines.append(arrow_line)
        
        # Bottom row: Price Impact -> Swap Execution -> Transaction Monitor
        bottom_row = []
        for i in [3, 4, 5]:  # price_calculator, execution, monitor
            bottom_row.append(node_boxes[i])
        
        # Add bottom row with connectors
        max_height = max(len(box) for box in bottom_row)
        for line_idx in range(max_height):
            line_parts = []
            for i, box in enumerate(bottom_row):
                if line_idx < len(box):
                    line_parts.append(box[line_idx])
                else:
                    line_parts.append(" " * self.node_width)
                
                # Add connector between boxes (except after last)
                if i < len(bottom_row) - 1:
                    if line_idx == max_height // 2:  # Middle line for arrow
                        line_parts.append(self.horizontal_connector)
                    else:
                        line_parts.append(" " * len(self.horizontal_connector))
            
            lines.append("".join(line_parts))
        
        return "\n".join(lines)
    
    def _create_linear_flow_ascii(self, nodes: List[DummyNode]) -> str:
        """Create a simple linear flow for any number of nodes."""
        if not nodes:
            return ""
        
        node_boxes = [self._create_node_box(node) for node in nodes]
        max_height = max(len(box) for box in node_boxes)
        
        lines = []
        for line_idx in range(max_height):
            line_parts = []
            for i, box in enumerate(node_boxes):
                if line_idx < len(box):
                    line_parts.append(box[line_idx])
                else:
                    line_parts.append(" " * self.node_width)
                
                # Add connector between boxes (except after last)
                if i < len(node_boxes) - 1:
                    if line_idx == max_height // 2:  # Middle line for arrow
                        line_parts.append(self.horizontal_connector)
                    else:
                        line_parts.append(" " * len(self.horizontal_connector))
            
            lines.append("".join(line_parts))
        
        return "\n".join(lines)
    
    def generate_complete_output(self, nodes: List[DummyNode], metadata: Dict[str, Any], 
                               connections: List[Tuple[int, int]] = None) -> str:
        """Generate the complete ASCII output including flow diagram and metadata."""
        output_lines = []
        
        # Add the main flow diagram
        output_lines.append("Generated Flow:")
        flow_ascii = self.generate_flow_ascii(nodes, connections)
        output_lines.append(flow_ascii)
        output_lines.append("")
        
        # Add metadata
        if "template" in metadata:
            output_lines.append(f"Architecture: {metadata['template']}")
        
        if "additional_features" in metadata:
            features = ", ".join(metadata["additional_features"])
            output_lines.append(f"Additional Features: {features}")
        
        if "tokens" in metadata:
            tokens = ", ".join(metadata["tokens"])
            output_lines.append(f"Supported Tokens: {tokens}")
        
        return "\n".join(output_lines)


# Global instance for easy access
visualizer = ASCIIFlowVisualizer()


def visualize_flow(nodes: List[DummyNode], metadata: Dict[str, Any] = None, 
                  connections: List[Tuple[int, int]] = None) -> str:
    """Main function to visualize a node flow with ASCII art."""
    if metadata is None:
        metadata = {}
    
    return visualizer.generate_complete_output(nodes, metadata, connections) 