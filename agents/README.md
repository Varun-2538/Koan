# 🤖 Unite DeFi Agents

## Overview

This folder contains the agentic workflow components for Unite DeFi - an intelligent system designed to automate and optimize DeFi interactions. 

**🎯 Current Implementation**: A FastAPI-based Python service that takes natural language input, generates DeFi workflows using **agno-agi**, and executes them by calling the existing TypeScript backend APIs.

### Features
- ✅ **Natural Language Processing**: "Create a swap application for ETH, USDC, WBTC with slippage protection"
- ✅ **AI-Powered Architecture Mapping**: Uses agno-agi to understand DeFi requirements
- ✅ **Workflow Generation**: Converts requirements to executable workflow definitions
- ✅ **Backend Integration**: Communicates with TypeScript DeFi Execution Engine
- ✅ **Real-time Monitoring**: Live progress updates and execution feedback

### Agent Capabilities
- Smart contract interactions and monitoring
- DeFi protocol analysis and strategy execution  
- Automated portfolio management
- Risk assessment and mitigation
- Cross-chain operations coordination

## Prerequisites

- Python 3.12 or higher
- Git
- Either `uv` (recommended) or `pip` package manager

## Setup Instructions

### Option 1: Using UV (Recommended)

[UV](https://github.com/astral-sh/uv) is a fast Python package installer and resolver written in Rust. It's significantly faster than pip and provides better dependency resolution.

#### 1. Install UV

```bash
# On macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# On Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# Or using pip
pip install uv
```

#### 2. Create and activate virtual environment

```bash
# Create virtual environment
uv venv

# Activate virtual environment
# On macOS/Linux
source .venv/bin/activate

# On Windows
.venv\Scripts\activate
```

#### 3. Install dependencies

```bash
# This will install all dependencies from pyproject.toml
uv sync
```

#### 4. Add new dependencies (when needed)

```bash
# Add a new package
uv add package-name

# Add multiple packages
uv add pandas numpy requests

# Add with version constraints
uv add "fastapi>=0.100.0"
```

### Option 2: Using pip (Traditional Method)

#### 1. Create and activate virtual environment

```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On macOS/Linux
source .venv/bin/activate

# On Windows
.venv\Scripts\activate
```

#### 2. Upgrade pip

```bash
python -m pip install --upgrade pip
```

#### 3. Install dependencies

```bash
# Install from requirements.txt
pip install -r requirements.txt

# Or install from pyproject.toml (requires pip >= 21.3)
pip install -e .
```

#### 4. Add new dependencies (when needed)

```bash
# Add a new package
pip install package-name

# Don't forget to update requirements.txt
pip freeze > requirements.txt
```

## Project Structure

```
agents/
├── .venv/              # Virtual environment (not committed to git)
├── src/                # Source code for agents
│   ├── main.py         # FastAPI application entry point
│   ├── agents/         # AI agent modules
│   ├── api/            # Backend API client
│   ├── workflow/       # Workflow generation
│   └── __init__.py
├── pyproject.toml      # Project configuration and dependencies (uv/pip)
├── requirements.txt    # Traditional pip dependencies file
├── uv.lock            # Lock file for uv (ensures reproducible installs)
└── README.md          # This file
```

## Running the Agents

The agent system now provides a FastAPI-based REST API for the frontend to interact with.

```bash
# Ensure virtual environment is activated first!

# Run the FastAPI server
cd src
python main.py

# Or use uvicorn directly
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000` with interactive docs at `http://localhost:8000/docs`.

## 🚀 Quick Start

### 1. Start the FastAPI Service

Start the agent API service:

```bash
cd src
python main.py
```

This will start the FastAPI server on `http://localhost:8000` with endpoints:
- `POST /process` - Process natural language DeFi requests
- `GET /executions/{execution_id}` - Get workflow execution status

### 2. Start TypeScript Backend

In a separate terminal, start the DeFi Execution Engine:

```bash
cd ../backend
npm run dev
```

The backend should be running on `http://localhost:3001`

### 3. Test the API

You can test the API using curl or the interactive docs at `http://localhost:8000/docs`:

```bash
# Test with curl
curl -X POST "http://localhost:8000/process" \
     -H "Content-Type: application/json" \
     -d '{"request": "I want to create a swap application for my DeFi protocol that supports ETH, USDC, and WBTC with slippage protection"}'

# Example response:
{
  "message": "Workflow execution started",
  "executionId": "exec_12345",
  "requirements": {
    "pattern": "DEX Aggregator",
    "tokens": ["ETH", "USDC", "WBTC"],
    "features": ["slippage protection"]
  },
  "workflow": { ... }
}

# Check execution status
curl "http://localhost:8000/executions/exec_12345"
```

### 4. Supported Patterns

The AI agent recognizes these DeFi patterns:

- **"swap application"** → DEX Aggregator workflow
- **"cross-chain bridge"** → Bridge workflow with Fusion+
- **"portfolio dashboard"** → Portfolio tracking workflow
- **"yield farming"** → Automated yield strategies
- **"governance"** → DAO voting and proposals

### 5. Expected Backend APIs

The system expects these endpoints on your TypeScript backend:

```
POST /api/workflows/execute     # Execute workflow
GET  /api/executions/{id}       # Get execution status
GET  /api/executions/{id}/logs  # Get execution logs
POST /api/executions/{id}/cancel # Cancel execution
GET  /api/health                # Health check
```

## Current Dependencies

- **agno**: Multi-agent orchestration framework
- **anthropic**: AI/LLM integration for intelligent decision making
- **fastapi**: REST API framework for agent endpoints
- **uvicorn**: ASGI server for FastAPI
- **pandas**: Data manipulation and analysis
- **numpy**: Numerical computing
- **gitpython**: Git repository interaction

## Environment Variables

Create a `.env` file in the agents directory (not committed to git):

```env
# API Keys
ANTHROPIC_API_KEY=your_api_key_here

# DeFi Protocol Endpoints
ETH_RPC_URL=your_ethereum_rpc_url
POLYGON_RPC_URL=your_polygon_rpc_url

# Agent Configuration
AGENT_MODE=development
LOG_LEVEL=INFO
```

## Troubleshooting

### Virtual Environment Issues

```bash
# If virtual environment is corrupted
rm -rf .venv
# Then recreate using the setup instructions above
```

## License

See the main project LICENSE file.
