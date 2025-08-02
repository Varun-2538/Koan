# DeFi Flow Generator - Streamlit Visual Interface

## Goal
Create a **Streamlit web application** that takes natural language DeFi requirements, generates workflows using agno-agi agents, and displays interactive visual node flows with connections.

## Visual Interface Requirements

### 1. Main Streamlit App (`app.py`)
Create a web interface with:
- **Text input box** for DeFi requirements
- **Submit button** to process the input
- **Live agent call logging** in a sidebar
- **Interactive flow visualization** as the main content
- **Workflow details panel** showing generated nodes and connections

### 2. Test Input
Default placeholder text in the input box:
```
"I want to create a swap application for my DeFi protocol that supports ETH, USDC, and WBTC with slippage protection"
```

### 3. Agent Integration (`agents/visual_architecture_agent.py`)
Using agno-agi framework to:
- **Parse natural language** input for DeFi requirements
- **Generate workflow definition** with nodes and connections
- **Log each agent decision** visibly in the Streamlit sidebar
- **Return structured flow data** for visualization

Expected agent call flow:
```
[AGENT CALL] ArchitectureMapper analyzing: "swap application for ETH, USDC, WBTC with slippage protection"
[AGENT CALL] Detected DeFi pattern: DEX Aggregator Template
[AGENT CALL] Required tokens: ETH, USDC, WBTC
[AGENT CALL] Required feature: slippage protection
[AGENT CALL] Generating node: WalletConnection
[AGENT CALL] Generating node: TokenSelector (ETH, USDC, WBTC)
[AGENT CALL] Generating node: OneInchQuote (with slippage)
[AGENT CALL] Generating node: PriceImpactCalculator
[AGENT CALL] Generating node: SwapExecution
[AGENT CALL] Generating node: TransactionMonitor
[AGENT CALL] Building connections: wallet → tokens → quote → calculate → execute → monitor
```

### 4. Visual Flow Display (`visualization/flow_renderer.py`)
Create interactive node flow visualization using one of:
- **Streamlit-Agraph** for network graphs
- **Plotly** for interactive diagrams
- **Graphviz** for structured layouts
- **Custom HTML/CSS** with streamlit components

Requirements:
- **Nodes** displayed as boxes with names and descriptions
- **Connections** shown as arrows between nodes
- **Interactive elements** - hover for details, click for configuration
- **Color coding** by node type (wallet=blue, DEX=green, monitor=orange, etc.)
- **Layout** that clearly shows the flow direction

### 5. Expected Visual Output
```
Streamlit Interface:
┌─────────────────────────────────────────────────────────────────┐
│ 🔄 DeFi Flow Generator                                          │
├─────────────────────────────────────────────────────────────────┤
│ Enter your DeFi requirements:                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ I want to create a swap application for my DeFi protocol   │ │
│ │ that supports ETH, USDC, and WBTC with slippage protection │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                               [Generate Flow] 🚀               │
├─────────────────────────────────────────────────────────────────┤
│                          Visual Flow:                          │
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Wallet    │───▶│   Token     │───▶│  1inch      │         │
│  │ Connection  │    │  Selector   │    │  Quote      │         │
│  │    💳       │    │ (ETH,USDC,  │    │ (slippage)  │         │
│  └─────────────┘    │    WBTC)    │    └─────────────┘         │
│                     └─────────────┘           │                │
│                            │                  │                │
│                            ▼                  ▼                │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │Transaction  │◀───│    Swap     │◀───│   Price     │         │
│  │  Monitor    │    │ Execution   │    │   Impact    │         │
│  │     📊      │    │     ⚡      │    │ Calculator  │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Sidebar: Agent Calls Log                                        │
│ ✅ ArchitectureMapper analyzing request...                      │
│ ✅ Detected: DEX Aggregator Template                            │
│ ✅ Tokens: ETH, USDC, WBTC                                      │
│ ✅ Feature: slippage protection                                 │
│ ✅ Generated 6 nodes with dependencies                          │
│ ✅ Workflow ready for execution                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6. File Structure
```
streamlit_defi_flows/
├── app.py                              # Main Streamlit application
├── agents/
│   ├── __init__.py
│   └── visual_architecture_agent.py    # agno-agi integration
├── visualization/
│   ├── __init__.py
│   ├── flow_renderer.py               # Visual flow display logic
│   └── node_styles.py                 # Color schemes and styling
├── models/
│   ├── __init__.py
│   └── workflow_models.py             # Data structures for flows
├── utils/
│   ├── __init__.py
│   └── logger.py                      # Streamlit logging utilities
└── requirements.txt                   # streamlit, agno, anthropic, plotly/agraph
```

### 7. Streamlit App Layout (`app.py`)
```python
import streamlit as st
from agents.visual_architecture_agent import VisualArchitectureAgent
from visualization.flow_renderer import FlowRenderer

st.title("🔄 DeFi Flow Generator")
st.subheader("Convert natural language to visual DeFi workflows")

# Input section
user_input = st.text_area(
    "Enter your DeFi requirements:",
    placeholder="I want to create a swap application for my DeFi protocol that supports ETH, USDC, and WBTC with slippage protection",
    height=100
)

# Sidebar for agent logs
with st.sidebar:
    st.header("🤖 Agent Calls")
    log_container = st.container()

# Generate button
if st.button("Generate Flow 🚀"):
    if user_input:
        # Process with agents
        agent = VisualArchitectureAgent()
        with st.spinner("Processing with AI agents..."):
            workflow = agent.generate_workflow(user_input, log_container)
        
        # Display visual flow
        st.header("📊 Generated Workflow")
        renderer = FlowRenderer()
        renderer.display_flow(workflow)
        
        # Show workflow details
        with st.expander("📋 Workflow Details"):
            st.json(workflow.to_dict())
```

### 8. Node Types to Generate
Based on the test input, create these 6 node types:
- **WalletConnection** (💳) - Blue color
- **TokenSelector** (🪙) - Yellow color  
- **OneInchQuote** (📈) - Green color
- **PriceImpactCalculator** (📊) - Purple color
- **SwapExecution** (⚡) - Red color
- **TransactionMonitor** (📋) - Orange color

### 9. Interactive Features
- **Hover effects** on nodes showing detailed information
- **Click handlers** for node configuration (future feature)
- **Zoom and pan** capabilities for large workflows
- **Export options** for workflow definitions
- **Real-time agent logging** in sidebar during generation

### 10. Success Criteria
- ✅ **Visual workflow generation** from natural language
- ✅ **Interactive node display** with clear connections
- ✅ **Real-time agent logging** visible in sidebar
- ✅ **Responsive layout** that works on different screen sizes
- ✅ **Clear flow direction** from input to output
- ✅ **Professional visual design** suitable for demos

## Dependencies
```
streamlit>=1.28.0
agno>=latest
anthropic>=latest
plotly>=5.17.0
streamlit-agraph>=0.0.45
graphviz>=0.20.1
```

This Streamlit app will provide a visual proof-of-concept for the AI agent workflow generation system, making it easy to test and demonstrate the flow creation capabilities.