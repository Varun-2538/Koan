# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Unite DeFi is a no-code DeFi platform that enables users to create and execute DeFi workflows through a visual interface. The platform consists of three main components:

- **Frontend**: React/Next.js visual workflow builder with React Flow canvas
- **Backend**: TypeScript execution engine for running DeFi workflows
- **Agents**: Python-based AI agent system for generating workflows from natural language

## Development Commands

### Frontend (Next.js)
```bash
cd frontend
npm install                # Install dependencies
npm run dev                # Start development server (http://localhost:3000)
npm run build              # Build for production
npm run start              # Start production server
npm run lint               # Run ESLint
```

### Backend (Node.js/TypeScript)
```bash
cd backend
npm install                # Install dependencies
npm run dev                # Start development server with tsx watch (http://localhost:3001)
npm run build              # Compile TypeScript to JavaScript
npm run start              # Start production server
npm run test               # Run Jest tests
npm run lint               # Run ESLint
```

### Agents (Python)
```bash
cd agents

# Setup with UV (recommended)
uv venv                    # Create virtual environment
source .venv/bin/activate  # Activate virtual environment (Linux/Mac)
.venv\Scripts\activate     # Activate virtual environment (Windows)
uv sync                    # Install dependencies from pyproject.toml

# Alternative setup with pip
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows
pip install -r requirements.txt

# Run the agent service
cd src
python main.py             # Start FastAPI server (http://localhost:8000)

# Or with uvicorn
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

## Architecture Overview

### Frontend Architecture
The frontend uses React Flow to create a visual node-based editor where users can:

- Drag and drop DeFi components from a component palette
- Connect nodes to create workflows (token selector → swap → transaction monitor)
- Configure node parameters through dynamic config panels
- Execute workflows in real-time with live feedback
- Generate and preview application code
- Deploy to GitHub with one click

**Key Files**:
- `frontend/components/flow-canvas.tsx`: Main React Flow canvas component
- `frontend/components/custom-nodes.tsx`: Node type definitions
- `frontend/lib/execution-client.ts`: WebSocket client for backend communication
- `frontend/lib/workflow-execution-client.ts`: Workflow execution management

### Backend Architecture
The backend provides a DeFi execution engine that transforms visual workflows into actual blockchain operations:

- **DeFiExecutionEngine**: Main orchestrator for workflow execution
- **NodeExecutors**: Individual implementations for each node type (1inch swap, fusion, etc.)
- **WebSocket Server**: Real-time communication with frontend
- **REST API**: HTTP endpoints for workflow management

**Key Files**:
- `backend/src/engine/execution-engine.ts`: Core execution engine
- `backend/src/nodes/`: Individual node executor implementations
- `backend/src/index.ts`: Main server entry point

### Agent Architecture
Python-based AI system using FastAPI that processes natural language and generates DeFi workflows:

- **Architecture Mapping Agent**: Understands user requirements using agno-agi
- **Workflow Generation**: Converts requirements to executable node definitions
- **Backend Integration**: Communicates with TypeScript execution engine

**Key Files**:
- `agents/src/main.py`: FastAPI server entry point
- `agents/src/agents/architecture_mapper.py`: Main AI agent
- `agents/src/workflow/generator.py`: Workflow generation logic

## Node Types and Executors

The platform supports various DeFi node types, each with corresponding executors:

### Trading and Swapping
- `oneInchSwap`: Execute token swaps via 1inch API
- `oneInchQuote`: Get swap quotes and estimates
- `fusionPlus`: Cross-chain swaps with MEV protection
- `fusionSwap`: Gasless swaps using Fusion protocol
- `limitOrder`: Create and manage limit orders

### Infrastructure
- `walletConnector`: Connect and manage wallet connections
- `chainSelector`: Select blockchain networks
- `tokenSelector`: Choose tokens for operations
- `transactionMonitor`: Track transaction status
- `transactionStatus`: Display transaction results

### Data and Analysis
- `portfolioAPI`: Track portfolio performance
- `priceImpactCalculator`: Calculate swap price impact
- `defiDashboard`: Display DeFi metrics and data

### UI Components
- `swapInterface`: Token swap user interface
- `dashboard`: General dashboard components

## Development Workflow

### Adding New Node Types

1. **Frontend**: Add node definition in `frontend/components/custom-nodes.tsx`
2. **Backend**: Create executor class in `backend/src/nodes/new-node-executor.ts`
3. **Register**: Add executor to main engine in `backend/src/index.ts`

Example node executor structure:
```typescript
export class NewNodeExecutor implements NodeExecutor {
  readonly type = 'newNode'
  readonly name = 'New Node'
  readonly description = 'Description of what this node does'

  async validate(inputs: Record<string, any>): Promise<{ valid: boolean; errors: string[] }> {
    // Validate inputs
  }

  async execute(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult> {
    // Execute the node logic
  }
}
```

### Testing DeFi Workflows

1. **Start all services**: Frontend (3000), Backend (3001), Agents (8000)
2. **Create workflow**: Use visual editor or AI agent to generate nodes
3. **Execute**: Run workflow to test actual DeFi operations
4. **Generate code**: Create deployable application from workflow

### 1inch API Integration

The platform heavily integrates with 1inch API for DeFi operations. Key considerations:

- API keys are required for production use
- Template mode works without API keys for demos
- All swap operations use 1inch Pathfinder for optimal routing
- Fusion mode provides MEV protection and gasless swaps

## Configuration

### Environment Variables

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_AGENT_URL=http://localhost:8000
```

**Backend** (`.env`):
```env
NODE_ENV=development
PORT=3001
ONEINCH_API_KEY=your_api_key_here
FRONTEND_URL=http://localhost:3000
```

**Agents** (`.env`):
```env
ANTHROPIC_API_KEY=your_api_key_here
ETH_RPC_URL=your_ethereum_rpc_url
POLYGON_RPC_URL=your_polygon_rpc_url
```

## Template System

The platform includes pre-built templates for common DeFi applications:

- **Basic Swap**: Simple token swap interface
- **DEX Aggregator**: Multi-protocol swap routing
- **Cross-Chain Bridge**: Bridge tokens between networks
- **Portfolio Tracker**: Track DeFi positions
- **Limit Order**: Advanced order management

Templates are defined in `frontend/lib/templates.ts` and automatically generate complete applications.

## Deployment

### Local Development
1. Start all three services in separate terminals
2. Navigate to http://localhost:3000 for the frontend
3. Use the visual editor or AI chat to create workflows

### Production Deployment
- **Frontend**: Deploy to Vercel/Netlify
- **Backend**: Deploy to Railway/Render with Docker
- **Agents**: Deploy Python service to cloud platform

### GitHub Integration
The platform includes automated GitHub deployment:
- Generate code from workflows
- Create new repositories
- Deploy with GitHub Pages/Actions
- Full CI/CD pipeline setup

## Code Generation

The platform can generate complete full-stack applications from visual workflows:

- **Frontend**: React components with DeFi integrations
- **Backend**: API endpoints and blockchain interactions
- **Smart Contracts**: Solidity contracts for custom logic
- **Documentation**: README and deployment guides

Generated applications are production-ready and include:
- Wallet connection
- Multi-chain support
- Responsive design
- Error handling
- Gas optimization

## Common Issues

### Missing API Keys
- 1inch operations require valid API keys
- Template mode works without keys for development
- Check environment variables are properly set

### Node Connection Issues
- Ensure proper data flow between nodes
- Validate input/output types match
- Check node configuration parameters

### Execution Failures
- Verify wallet connections
- Check network selections match token addresses
- Ensure sufficient gas and token balances

## Testing

### Backend Tests
```bash
cd backend
npm run test                # Run all tests
npm run test:watch         # Watch mode for development
```

### Frontend Tests
```bash
cd frontend
npm run test               # Run component tests
npm run test:e2e          # Run end-to-end tests (if configured)
```

### Agent Tests
```bash
cd agents
python -m pytest          # Run Python tests
python -m pytest -v       # Verbose output
```

## Development Guidelines

### Code Style
- **TypeScript**: Use strict mode, proper typing
- **React**: Functional components with hooks
- **Python**: Type annotations, clean architecture
- **Error Handling**: Comprehensive error handling throughout

### Git Workflow
- Feature branches for new functionality
- Descriptive commit messages
- Test before merging to main
- Use conventional commit format

### Security
- Never commit API keys or secrets
- Validate all user inputs
- Use environment variables for configuration
- Implement proper CORS and security headers

## AI Agent Integration

The agents system uses cursor rules defined in `agents/.cursorrules` for AI-powered workflow generation. Key principles:

- Use agno-agi for multi-agent orchestration
- Process natural language to DeFi requirements
- Generate executable node flows
- Integrate with backend execution engine

The system supports commands like:
```
"Create a swap application for ETH, USDC, WBTC with slippage protection"
```

Which generates appropriate node workflows automatically.
