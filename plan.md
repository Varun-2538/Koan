# DeFi Flow Generator - Canvas-Based Visual Interface

## Goal
Create an **AI-powered canvas interface** with a chatbot toggle panel that generates, visualizes, and executes DeFi workflows while automatically creating complete full-stack applications.

## Architecture Understanding
- **`agents/`** - AI agents that understand user intent and route to appropriate backend nodes
- **`backend/`** - Contains node executors and execution engine (TypeScript)
- **`frontend/`** - React components and UI elements for the interface
- **`contracts/`** - Smart contract templates
- **`node_modules/`** - Available dependencies
- **`scripts/`** - Deployment and build scripts

## Core Requirements

### 1. AI Chatbot Toggle Panel
Create a **Cursor-style AI chatbot interface** within the frontend that:
- Toggles open/closed from the side or bottom of the screen
- Takes natural language DeFi requirements from user
- Sends requests to agents in `agents/` directory for intent understanding
- Shows real-time agent processing with visible decision logs
- Requires **user approval** before proceeding to canvas drawing
- Maintains conversation history and context

### 2. Agent Routing System
The agents in `agents/` directory should:
- **Analyze user intent** from natural language input
- **Determine which backend nodes** are needed for the workflow
- **Route API calls** to appropriate node executors in `backend/`
- **Return structured workflow definitions** with node specifications
- **Handle multi-turn conversations** for workflow refinement
- **Provide explanations** for routing decisions to frontend

### 3. Canvas-Based Flow Visualization
Implement an **interactive canvas system** in the frontend that:
- Receives workflow definitions from agents
- Draws workflow nodes and connections visually based on agent routing
- Shows nodes that correspond to actual backend node executors
- Displays connections as arrows showing execution flow
- Supports zoom, pan, and node manipulation
- Updates in real-time as agents determine workflow structure

### 4. User Approval Workflow
Implement **approval gates** where:
- AI agent analyzes user input and determines backend node routing
- Frontend displays the proposed workflow with backend node specifications
- User reviews the proposed backend API calls and node execution plan
- User can request modifications or approve the routing strategy
- Only approved workflows get drawn on canvas and executed
- Changes require agent re-analysis and new backend routing

### 5. Backend Node Execution
Make canvas nodes **execute actual backend logic** by:
- Agents routing to specific node executors in `backend/` directory
- Frontend canvas triggering execution through agent API routing
- Using actual TypeScript node executors and execution engine
- Showing real-time execution status from backend on canvas nodes
- Displaying execution results and logs from backend APIs
- Handling node failures and error states from backend execution

### 6. Agent-to-Backend API Routing
The agents should handle **API orchestration** by:
- Mapping user intent to specific backend node types
- Constructing proper API calls to backend execution endpoints
- Managing workflow execution through backend DeFiExecutionEngine
- Handling backend responses and status updates
- Providing frontend with execution results and node states
- Managing error handling between frontend requests and backend execution

### 7. Frontend Canvas Integration
The frontend canvas should:
- Display nodes that represent actual backend executors
- Show real-time status from backend execution via agent routing
- Allow user interaction with workflow before backend execution
- Provide controls for workflow execution through agent APIs
- Display execution results returned from backend via agents
- Handle loading states during backend execution

### 8. Automatic Code Generation
After successful workflow execution, the system should:
- Analyze executed backend workflow to determine application requirements
- Generate **backend API endpoints** based on successful node execution patterns
- Create **frontend dashboard components** that match the workflow results
- Generate **configuration files** for the specific DeFi application
- Use templates from existing `contracts/`, `frontend/`, `backend/` code
- Create deployment-ready applications based on proven workflow execution

### 9. Agent Responsibility Clarification
Agents in `agents/` directory are responsible for:
- **Intent Understanding**: Parse natural language requirements
- **Backend Routing**: Determine which backend nodes to call
- **API Orchestration**: Manage calls to backend execution engine
- **Response Handling**: Process backend results for frontend display
- **Workflow Management**: Coordinate multi-node execution through backend
- **NOT UI Logic**: Frontend handles all visual and interaction elements

### 10. Backend Integration Points
The backend `backend/` directory provides:
- **Node Executors**: Actual DeFi logic implementation
- **Execution Engine**: Workflow execution and dependency management
- **API Endpoints**: For agents to trigger node execution
- **Result Processing**: Return execution results to agents
- **Status Updates**: Provide real-time execution status

### 11. Frontend Responsibilities
The frontend `frontend/` directory handles:
- **Canvas Interface**: Visual workflow representation
- **User Interaction**: Chatbot, approval workflows, node manipulation
- **Status Display**: Show backend execution status via agent updates
- **Result Visualization**: Display workflow execution results
- **Code Generation UI**: Interface for viewing and downloading generated code

### 12. Execution Flow
The complete flow should be:
1. **User Input** → Frontend chatbot
2. **Intent Analysis** → Agents analyze and determine backend routing
3. **Workflow Proposal** → Frontend displays proposed backend execution plan
4. **User Approval** → User approves backend node execution strategy
5. **Canvas Drawing** → Frontend draws nodes representing backend executors
6. **Execution Trigger** → Frontend requests execution via agents
7. **Backend Routing** → Agents orchestrate backend node execution
8. **Status Updates** → Backend status flows through agents to frontend canvas
9. **Result Display** → Execution results shown on frontend canvas
10. **Code Generation** → Generate applications based on successful execution

### 13. Success Criteria
- Agents successfully route user intent to appropriate backend nodes
- Frontend canvas displays and controls backend node execution
- User approval system works for backend execution strategies
- Real-time status updates flow from backend through agents to frontend
- Generated applications are based on actual backend execution patterns
- System maintains clear separation: agents for routing, backend for execution, frontend for UI

## Technical Implementation Notes
- Agents should analyze existing backend node executors to understand routing options
- Frontend should integrate with existing React components and UI patterns
- Backend execution engine should remain unchanged, accessed via agent routing
- Generated code should follow patterns from successful backend executions
- All inter-system communication should go through agent API routing layer

The system creates a seamless experience where agents understand intent and manage backend execution, while frontend provides visual interface and user interaction, maintaining clear architectural boundaries.