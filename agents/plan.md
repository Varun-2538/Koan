# DeFi Agent System - API Integration Testing

## Goal
Create a **Python agent system** that takes natural language input, generates DeFi workflows using agno-agi, and executes them by calling the existing TypeScript backend APIs.

## Architecture Overview
- **Python Frontend**: AI agents for natural language processing and workflow generation
- **TypeScript Backend**: Existing DeFiExecutionEngine and NodeExecutors (already implemented)
- **API Communication**: Python makes HTTP calls to TypeScript backend APIs

## Implementation Requirements

### 1. Python Agent System (`main.py`)
Create the conversational interface:
- Takes user input: `"I want to create a swap application for my DeFi protocol that supports ETH, USDC, and WBTC with slippage protection"`
- Uses agno-agi to parse requirements and generate workflow definitions
- Calls TypeScript backend APIs to execute the workflow

### 2. AI Agent Implementation (`agents/defi_architecture_agent.py`)
Using agno-agi framework:
- **Parse natural language** to extract DeFi requirements
- **Generate WorkflowDefinition** with proper nodes and dependencies
- **Map to existing node types** from your TypeScript backend:
  - `walletConnection`
  - `tokenSelector` 
  - `oneInchQuote`
  - `priceImpactCalculator`
  - `swapExecution`
  - `transactionMonitor`

### 3. Backend API Client (`api/backend_client.py`)
HTTP client to communicate with your TypeScript backend:
```python
class DeFiBackendClient:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
    
    async def execute_workflow(self, workflow_definition: Dict) -> Dict:
        """Call the TypeScript backend to execute workflow"""
        response = await httpx.post(
            f"{self.base_url}/api/workflows/execute",
            json=workflow_definition
        )
        return response.json()
    
    async def get_execution_status(self, execution_id: str) -> Dict:
        """Get workflow execution status"""
        response = await httpx.get(
            f"{self.base_url}/api/executions/{execution_id}"
        )
        return response.json()
```

### 4. Workflow Generation (`workflow/generator.py`)
Convert agent output to WorkflowDefinition format:
```python
def generate_swap_workflow(tokens: List[str], features: List[str]) -> Dict:
    """Generate workflow definition for TypeScript backend"""
    return {
        "id": str(uuid.uuid4()),
        "name": "DEX Swap Application",
        "nodes": [
            {
                "id": "wallet-1",
                "type": "walletConnection",
                "data": {"config": {"networks": ["ethereum"]}}
            },
            {
                "id": "tokens-1", 
                "type": "tokenSelector",
                "data": {"config": {"tokens": tokens}}
            },
            {
                "id": "quote-1",
                "type": "oneInchQuote", 
                "data": {"config": {"slippageProtection": True}}
            },
            # ... other nodes
        ],
        "edges": [
            {"source": "wallet-1", "target": "tokens-1"},
            {"source": "tokens-1", "target": "quote-1"},
            # ... connections
        ]
    }
```

### 5. **CRITICAL: Agent-Based Workflow Generation**
The key test - visible agent decision making:
```python
[AGENT CALL] ArchitectureMapper analyzing: "swap application for ETH, USDC, WBTC with slippage protection"
[AGENT CALL] Detected DeFi pattern: DEX Aggregator Template
[AGENT CALL] Required tokens: ETH, USDC, WBTC
[AGENT CALL] Required feature: slippage protection  
[AGENT CALL] Mapping to backend nodes:
[AGENT CALL] → walletConnection (for wallet integration)
[AGENT CALL] → tokenSelector (ETH, USDC, WBTC)
[AGENT CALL] → oneInchQuote (with slippage protection)
[AGENT CALL] → priceImpactCalculator
[AGENT CALL] → swapExecution
[AGENT CALL] → transactionMonitor
[AGENT CALL] Building workflow definition...
[API CALL] Sending workflow to TypeScript backend: http://localhost:3000/api/workflows/execute
```

### 6. Expected Terminal Output
```bash
$ python main.py

> Enter your DeFi request: I want to create a swap application for my DeFi protocol that supports ETH, USDC, and WBTC with slippage protection

🤖 Processing with AI agents...
[AGENT CALL] ArchitectureMapper analyzing request...
[AGENT CALL] Detected pattern: Basic DEX Aggregator Template
[AGENT CALL] Tokens identified: ETH, USDC, WBTC
[AGENT CALL] Feature required: slippage protection
[AGENT CALL] Generating workflow definition...

📡 Calling TypeScript backend APIs...
[API CALL] POST /api/workflows/execute
[API RESPONSE] Execution started: exec_12345

🚀 Workflow executing on backend...
[API CALL] GET /api/executions/exec_12345/status
[BACKEND] ⏳ Executing: walletConnection
[BACKEND] ✅ Wallet connected (0.2s)
[BACKEND] ⏳ Executing: tokenSelector
[BACKEND] ✅ Tokens selected: ETH, USDC, WBTC (0.1s)
[BACKEND] ⏳ Executing: oneInchQuote
[BACKEND] ✅ Quote received with slippage protection (0.8s)
[BACKEND] ⏳ Executing: priceImpactCalculator
[BACKEND] ✅ Price impact calculated: 0.12% (0.1s)
[BACKEND] ⏳ Executing: swapExecution
[BACKEND] ✅ Swap executed successfully (2.1s)
[BACKEND] ⏳ Executing: transactionMonitor
[BACKEND] ✅ Transaction confirmed (3.2s)

🎉 Workflow completed successfully!
Architecture: Basic DEX Aggregator Template
Total execution time: 6.5s
Gas used: 180,000
Generated code available at: http://localhost:3000/api/executions/exec_12345/code
```

### 7. File Structure
```
python_agents/
├── main.py                          # Entry point
├── agents/
│   ├── __init__.py
│   └── defi_architecture_agent.py   # agno-agi integration
├── api/
│   ├── __init__.py
│   └── backend_client.py            # HTTP client for TS backend
├── workflow/
│   ├── __init__.py
│   └── generator.py                 # Workflow definition builder
└── requirements.txt                 # httpx, agno, anthropic
```

### 8. Backend API Assumptions
Your TypeScript backend should have these endpoints:
- `POST /api/workflows/execute` - Execute a workflow
- `GET /api/executions/{id}` - Get execution status
- `GET /api/executions/{id}/code` - Get generated code

## Success Criteria
- ✅ **Agent-based workflow generation** using agno-agi
- ✅ **API communication** with existing TypeScript backend
- ✅ **Real execution** using your existing node executors
- ✅ **Live status monitoring** via API polling
- ✅ **No code duplication** - reuse existing TypeScript implementation
- ✅ **Clean separation** - Python for AI, TypeScript for execution

This approach leverages your existing backend while adding the AI agent layer in Python!