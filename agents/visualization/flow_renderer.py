"""
Flow visualization component using Plotly for interactive diagrams
"""

import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import networkx as nx
from typing import Dict, List, Tuple, Any
import math

from models.workflow_models import WorkflowDefinition, FlowNode, NodeConnection
from .node_styles import NodeStyleManager

class FlowRenderer:
    """Renders interactive workflow visualizations using Plotly"""
    
    def __init__(self):
        self.style_manager = NodeStyleManager()
    
    def display_flow(self, workflow: WorkflowDefinition):
        """Display the complete workflow with interactive visualization"""
        if not workflow or not workflow.nodes:
            st.warning("No workflow to display")
            return
        
        # Create the main visualization
        fig = self._create_flow_graph(workflow)
        
        # Display the graph
        st.plotly_chart(fig, use_container_width=True, key="workflow_graph")
        
        # Display workflow summary
        self._display_workflow_summary(workflow)
        
        # Display node details
        self._display_node_details(workflow)
    
    def _create_flow_graph(self, workflow: WorkflowDefinition) -> go.Figure:
        """Create the main flow graph using Plotly"""
        # Create network graph for layout calculation
        G = nx.DiGraph()
        
        # Add nodes
        for node in workflow.nodes:
            G.add_node(node.id, **node.to_dict())
        
        # Add edges  
        for conn in workflow.connections:
            G.add_edge(conn.source_node_id, conn.target_node_id)
        
        # Calculate layout using networkx
        if len(workflow.nodes) > 1:
            pos = nx.spring_layout(G, k=3, iterations=50, seed=42)
        else:
            pos = {workflow.nodes[0].id: (0, 0)}
        
        # Create plotly figure
        fig = go.Figure()
        
        # Add edges first (so they appear behind nodes)
        self._add_edges_to_figure(fig, workflow, pos)
        
        # Add nodes
        self._add_nodes_to_figure(fig, workflow, pos)
        
        # Update layout
        fig.update_layout(
            title={
                'text': f"<b>{workflow.name}</b>",
                'x': 0.5,
                'xanchor': 'center',
                'font': {'size': 20, 'color': '#1f77b4'}
            },
            showlegend=True,
            hovermode='closest',
            margin=dict(b=20, l=5, r=5, t=80),
            annotations=[
                dict(
                    text=workflow.description,
                    showarrow=False,
                    xref="paper", yref="paper",
                    x=0.005, y=-0.002,
                    xanchor='left', yanchor='bottom',
                    font=dict(size=12, color='#666')
                )
            ],
            xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
            yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
            plot_bgcolor='white',
            width=800,
            height=600
        )
        
        return fig
    
    def _add_nodes_to_figure(self, fig: go.Figure, workflow: WorkflowDefinition, pos: Dict[str, Tuple[float, float]]):
        """Add nodes to the plotly figure"""
        # Group nodes by category for legend
        categories = {}
        
        for node in workflow.nodes:
            style = self.style_manager.get_node_style(node.type)
            category = style['category']
            
            if category not in categories:
                categories[category] = []
            categories[category].append((node, pos[node.id]))
        
        # Add nodes by category
        for category, nodes_and_pos in categories.items():
            x_coords = []
            y_coords = []
            text_labels = []
            hover_texts = []
            
            for node, (x, y) in nodes_and_pos:
                x_coords.append(x)
                y_coords.append(y)
                
                style = self.style_manager.get_node_style(node.type)
                text_labels.append(f"{style['icon']}<br>{node.label}")
                
                hover_text = f"<b>{node.label}</b><br>"
                hover_text += f"Type: {node.type.value}<br>"
                hover_text += f"Category: {style['category']}<br>"
                hover_text += f"Description: {style['description']}"
                
                if node.config:
                    hover_text += "<br><br><b>Configuration:</b><br>"
                    for key, value in node.config.items():
                        if len(str(value)) < 50:  # Only show short config values
                            hover_text += f"• {key}: {value}<br>"
                
                hover_texts.append(hover_text)
            
            category_color = self.style_manager.get_category_color(category)
            
            fig.add_trace(go.Scatter(
                x=x_coords,
                y=y_coords,
                mode='markers+text',
                marker=dict(
                    size=60,
                    color=category_color,
                    line=dict(width=2, color='white'),
                    symbol='circle'
                ),
                text=text_labels,
                textposition="middle center",
                textfont=dict(size=10, color='white'),
                hovertemplate='%{hovertext}<extra></extra>',
                hovertext=hover_texts,
                name=category,
                legendgroup=category
            ))
    
    def _add_edges_to_figure(self, fig: go.Figure, workflow: WorkflowDefinition, pos: Dict[str, Tuple[float, float]]):
        """Add edges (connections) to the plotly figure"""
        edge_x = []
        edge_y = []
        
        for conn in workflow.connections:
            if conn.source_node_id in pos and conn.target_node_id in pos:
                x0, y0 = pos[conn.source_node_id]
                x1, y1 = pos[conn.target_node_id]
                
                edge_x.extend([x0, x1, None])
                edge_y.extend([y0, y1, None])
        
        fig.add_trace(go.Scatter(
            x=edge_x,
            y=edge_y,
            line=dict(width=2, color='#888'),
            hoverinfo='none',
            mode='lines',
            showlegend=False
        ))
        
        # Add arrow annotations for direction
        for conn in workflow.connections:
            if conn.source_node_id in pos and conn.target_node_id in pos:
                x0, y0 = pos[conn.source_node_id]
                x1, y1 = pos[conn.target_node_id]
                
                # Calculate arrow position (80% of the way from source to target)
                arrow_x = x0 + 0.8 * (x1 - x0)
                arrow_y = y0 + 0.8 * (y1 - y0)
                
                # Calculate arrow direction
                dx = x1 - x0
                dy = y1 - y0
                length = math.sqrt(dx**2 + dy**2)
                
                if length > 0:
                    # Normalize direction
                    dx /= length
                    dy /= length
                    
                    fig.add_annotation(
                        x=arrow_x,
                        y=arrow_y,
                        ax=arrow_x - dx * 0.1,
                        ay=arrow_y - dy * 0.1,
                        xref='x',
                        yref='y',
                        axref='x',
                        ayref='y',
                        arrowhead=3,
                        arrowsize=1,
                        arrowwidth=2,
                        arrowcolor='#888',
                        showarrow=True
                    )
    
    def _display_workflow_summary(self, workflow: WorkflowDefinition):
        """Display a summary of the workflow"""
        st.subheader("📋 Workflow Summary")
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.metric("Total Nodes", len(workflow.nodes))
        
        with col2:
            st.metric("Connections", len(workflow.connections))
        
        with col3:
            # Count unique categories
            categories = set()
            for node in workflow.nodes:
                style = self.style_manager.get_node_style(node.type)
                categories.add(style['category'])
            st.metric("Categories", len(categories))
        
        # Display metadata if available
        if workflow.metadata:
            with st.expander("🔍 Workflow Metadata"):
                for key, value in workflow.metadata.items():
                    if key not in ['requirements']:  # Skip complex objects
                        st.write(f"**{key.replace('_', ' ').title()}:** {value}")
    
    def _display_node_details(self, workflow: WorkflowDefinition):
        """Display detailed information about each node"""
        st.subheader("🔧 Node Details")
        
        # Group nodes by category
        categories = {}
        for node in workflow.nodes:
            style = self.style_manager.get_node_style(node.type)
            category = style['category']
            if category not in categories:
                categories[category] = []
            categories[category].append(node)
        
        # Display nodes by category
        for category, nodes in categories.items():
            with st.expander(f"{category} Nodes ({len(nodes)})"):
                for node in nodes:
                    style = self.style_manager.get_node_style(node.type)
                    
                    col1, col2 = st.columns([1, 3])
                    
                    with col1:
                        st.markdown(f"### {style['icon']} {node.label}")
                        st.write(f"**Type:** `{node.type.value}`")
                    
                    with col2:
                        st.write(f"**Description:** {style['description']}")
                        
                        if node.config:
                            st.write("**Configuration:**")
                            config_str = ""
                            for key, value in node.config.items():
                                config_str += f"• **{key}:** {value}\n"
                            st.markdown(config_str)
                    
                    st.divider()