"""
DeFi Flow Generator - Streamlit Visual Interface
Converts natural language DeFi requirements into visual workflows using AI agents
"""

import streamlit as st
import asyncio
import json
from typing import Dict, Any, Optional
import sys
import os

# Add src to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from agents.visual_architecture_agent import VisualArchitectureAgent
from visualization.flow_renderer import FlowRenderer
from models.workflow_models import WorkflowDefinition
from utils.logger import StreamlitLogger

# Page configuration
st.set_page_config(
    page_title="DeFi Flow Generator",
    page_icon="🔄",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
<style>
    .main-header {
        text-align: center;
        color: #1f77b4;
        margin-bottom: 2rem;
    }
    .agent-log {
        background-color: #f0f2f6;
        padding: 10px;
        border-radius: 5px;
        margin: 5px 0;
        font-family: monospace;
        font-size: 12px;
    }
    .success-log {
        background-color: #d4edda;
        border-left: 4px solid #28a745;
    }
    .info-log {
        background-color: #d1ecf1;
        border-left: 4px solid #17a2b8;
    }
    .error-log {
        background-color: #f8d7da;
        border-left: 4px solid #dc3545;
    }
</style>
""", unsafe_allow_html=True)

def initialize_session_state():
    """Initialize Streamlit session state variables"""
    if 'workflow' not in st.session_state:
        st.session_state.workflow = None
    if 'agent_logs' not in st.session_state:
        st.session_state.agent_logs = []
    if 'processing' not in st.session_state:
        st.session_state.processing = False

def add_agent_log(message: str, log_type: str = "info"):
    """Add a log message to the agent logs"""
    log_entry = {
        "message": message,
        "type": log_type,
        "timestamp": st.session_state.get('log_counter', 0)
    }
    st.session_state.agent_logs.append(log_entry)
    st.session_state.log_counter = st.session_state.get('log_counter', 0) + 1

def display_agent_logs():
    """Display agent logs in the sidebar"""
    st.sidebar.header("🤖 Agent Calls")
    
    if not st.session_state.agent_logs:
        st.sidebar.info("No agent activity yet. Submit a request to see the AI in action!")
        return
    
    # Display logs in reverse order (newest first)
    for log_entry in reversed(st.session_state.agent_logs[-10:]):  # Show last 10 logs
        log_type = log_entry["type"]
        message = log_entry["message"]
        
        if log_type == "success":
            st.sidebar.markdown(f'<div class="agent-log success-log">✅ {message}</div>', unsafe_allow_html=True)
        elif log_type == "error":
            st.sidebar.markdown(f'<div class="agent-log error-log">❌ {message}</div>', unsafe_allow_html=True)
        else:
            st.sidebar.markdown(f'<div class="agent-log info-log">🔄 {message}</div>', unsafe_allow_html=True)

async def process_user_input(user_input: str) -> Optional[WorkflowDefinition]:
    """Process user input with AI agents and return workflow definition"""
    try:
        # Initialize the visual architecture agent
        add_agent_log("Initializing VisualArchitectureAgent...")
        agent = VisualArchitectureAgent()
        
        # Process the input
        add_agent_log(f"ArchitectureMapper analyzing: \"{user_input[:50]}...\"")
        workflow = await agent.generate_workflow(user_input)
        
        if workflow:
            add_agent_log(f"Generated workflow with {len(workflow.nodes)} nodes", "success")
            return workflow
        else:
            add_agent_log("Failed to generate workflow", "error")
            return None
            
    except Exception as e:
        add_agent_log(f"Error processing request: {str(e)}", "error")
        return None

def main():
    """Main Streamlit application"""
    initialize_session_state()
    
    # Header
    st.markdown('<h1 class="main-header">🔄 DeFi Flow Generator</h1>', unsafe_allow_html=True)
    st.markdown('<p style="text-align: center; color: #666; font-size: 1.1em;">Convert natural language to visual DeFi workflows using AI agents</p>', unsafe_allow_html=True)
    
    # Main input section
    st.header("📝 Enter Your DeFi Requirements")
    
    user_input = st.text_area(
        "Describe what you want to build:",
        placeholder="I want to create a swap application for my DeFi protocol that supports ETH, USDC, and WBTC with slippage protection",
        height=120,
        help="Describe your DeFi application in natural language. The AI will analyze your requirements and generate a visual workflow."
    )
    
    # Generate button
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        generate_clicked = st.button("🚀 Generate Flow", use_container_width=True, type="primary")
    
    # Process input when button is clicked
    if generate_clicked and user_input.strip():
        st.session_state.processing = True
        st.session_state.agent_logs = []  # Clear previous logs
        
        with st.spinner("🤖 Processing with AI agents..."):
            # Run async function in sync context
            workflow = asyncio.run(process_user_input(user_input.strip()))
        
        st.session_state.workflow = workflow
        st.session_state.processing = False
        st.rerun()  # Refresh to show results
    
    # Display workflow if available
    if st.session_state.workflow:
        st.header("📊 Generated Workflow")
        
        # Create renderer and display flow
        renderer = FlowRenderer()
        renderer.display_flow(st.session_state.workflow)
        
        # Workflow details in expandable section
        with st.expander("📋 Workflow Details", expanded=False):
            st.json(st.session_state.workflow.to_dict())
            
        # Export options
        st.header("💾 Export Options")
        col1, col2 = st.columns(2)
        
        with col1:
            if st.button("📥 Download JSON"):
                workflow_json = json.dumps(st.session_state.workflow.to_dict(), indent=2)
                st.download_button(
                    label="Download Workflow JSON",
                    data=workflow_json,
                    file_name="defi_workflow.json",
                    mime="application/json"
                )
        
        with col2:
            if st.button("🔄 Clear Workflow"):
                st.session_state.workflow = None
                st.session_state.agent_logs = []
                st.rerun()
    
    elif generate_clicked and not user_input.strip():
        st.warning("⚠️ Please enter your DeFi requirements before generating a workflow.")
    
    # Sidebar with agent logs
    display_agent_logs()
    
    # Footer
    st.markdown("---")
    st.markdown(
        '<p style="text-align: center; color: #666; font-size: 0.9em;">'
        'Powered by agno-agi, Langflow patterns, and Streamlit | '
        'Built for DeFi protocol developers'
        '</p>', 
        unsafe_allow_html=True
    )

if __name__ == "__main__":
    main()