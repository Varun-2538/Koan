# 🚀 DeFi Execution Engine

A powerful backend execution engine for the Unite DeFi no-code platform. This engine transforms visual React Flow workflows into executable DeFi operations, handling 1inch API integrations, blockchain transactions, and real-time execution feedback.

## 🎯 **What This Solves**

React Flow is excellent for visual workflow creation, but it's **only a UI library**. Users create beautiful visual flows, but nothing actually **executes**. This engine bridges that gap by:

- ✅ **Actually executing** the workflows users create in the frontend
- ✅ **Real-time communication** with frontend via WebSocket
- ✅ **1inch API integration** for live swap execution
- ✅ **Dependency management** - nodes execute in correct order
- ✅ **Error handling & retry logic** for blockchain operations
- ✅ **Gas estimation & optimization** for cost transparency
- ✅ **Parallel execution** for independent nodes

## 🏗 **Architecture**

```
Frontend (React Flow) → WebSocket/REST API → Execution Engine → 1inch API → Blockchain
     Visual Editor      ↔  Real-time Updates  ↔  Smart Execution  ↔  Live Data  ↔  On-chain
```

### **Core Components**

1. **DeFiExecutionEngine** - Main orchestrator that manages workflow execution
2. **NodeExecutors** - Individual node implementations (1inch Swap, Fusion+, etc.)
3. **WebSocket Server** - Real-time communication with frontend
4. **REST API** - HTTP endpoints for workflow execution and status
5. **Dependency Graph** - Smart execution order with circular dependency detection

## 🚀 **Quick Start**

### **1. Installation**
```bash
cd backend
npm install
```

### **2. Configuration**
```bash
# Copy environment template
cp .env.example .env

# Add your 1inch API key
ONEINCH_API_KEY=your_api_key_here
```

### **3. Start Development Server**
```bash
npm run dev
```

The engine will start on `http://localhost:3001` with WebSocket support.

### **4. Test Connection**
```bash
curl http://localhost:3001/api/health
```

## 📡 **API Endpoints**

### **REST API**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/config` | Engine configuration |
| `POST` | `/api/workflows/execute` | Execute workflow |
| `GET` | `/api/executions/:id` | Get execution status |
| `GET` | `/api/executions/:id/logs` | Get execution logs |
| `POST` | `/api/executions/:id/cancel` | Cancel execution |
| `POST` | `/api/test/oneinch` | Test 1inch API connection |
| `GET` | `/api/nodes` | List supported node types |

### **WebSocket Events**

| Event | Direction | Description |
|-------|-----------|-------------|
| `execute-workflow` | Client → Server | Start workflow execution |
| `cancel-execution` | Client → Server | Cancel running execution |
| `get-execution-status` | Client → Server | Get execution status |
| `execution-started` | Server → Client | Execution has started |
| `execution-event` | Server → Client | Real-time execution updates |
| `execution-error` | Server → Client | Execution error occurred |

## 🔧 **Node Executors**

### **1inch Swap Executor**

Executes token swaps using 1inch Pathfinder algorithm:

```typescript
// Input from frontend node configuration
{
  "api_key": "your_1inch_api_key",
  "chain_id": "1",
  "from_token": "0xA0b86a33E6c...", // ETH
  "to_token": "0x6B175474E89...",   // DAI  
  "amount": "1000000000000000000",  // 1 ETH in wei
  "from_address": "0x742d35Cc...",
  "slippage": 1,
  "enable_fusion": true
}

// Output to next nodes
{
  "quote": { ... },
  "transaction_data": { ... },
  "estimated_gas": "150000",
  "price_impact": "0.1",
  "protocols_used": ["Uniswap V3", "Curve"],
  "savings": { ... }
}
```

### **Adding New Node Executors**

1. **Create executor class**:
```typescript
export class MyCustomExecutor implements NodeExecutor {
  readonly type = 'myCustomNode'
  readonly name = 'My Custom Node'
  readonly description = 'Does something awesome'

  async validate(inputs: Record<string, any>): Promise<{ valid: boolean; errors: string[] }> {
    // Validate inputs
  }

  async execute(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult> {
    // Execute the node logic
  }
}
```

2. **Register in main server**:
```typescript
executionEngine.registerNodeExecutor(new MyCustomExecutor(logger))
```

## 🔄 **Workflow Execution Flow**

1. **Frontend** creates visual workflow with React Flow
2. **User clicks "Execute"** - workflow sent via WebSocket
3. **Engine parses** nodes and edges into execution plan
4. **Dependency analysis** determines execution order
5. **Parallel execution** of independent nodes
6. **Real-time updates** sent back to frontend
7. **Results displayed** in the UI with gas costs, transaction hashes

### **Example Execution Sequence**

```
Workflow: Token Input → 1inch Swap → Transaction Status

1. Token Input Node executes instantly (no blockchain calls)
   Output: { tokenAddress: "0x...", amount: "1000..." }

2. 1inch Swap Node receives Token Input output
   - Validates inputs
   - Calls 1inch API for quote  
   - Builds transaction data
   - Output: { transactionData: {...}, estimatedGas: "150000" }

3. Transaction Status Node receives Swap output
   - Displays transaction ready for signing
   - Shows gas estimate and costs
```

## 🔐 **Security Features**

- ✅ **Input validation** on all node executors
- ✅ **Rate limiting** for API calls
- ✅ **CORS protection** for cross-origin requests
- ✅ **Helmet.js** security headers
- ✅ **Environment variable** protection
- ✅ **Error sanitization** to prevent info leakage

## 🧪 **Testing 1inch Integration**

Test the 1inch API connection:

```bash
curl -X POST http://localhost:3001/api/test/oneinch \
  -H "Content-Type: application/json" \
  -d '{
    "chainId": "1",
    "fromToken": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    "toToken": "0x6B175474E89094C44Da98b954EedeAC495271d0F", 
    "amount": "1000000000000000000"
  }'
```

Expected response:
```json
{
  "success": true,
  "chainId": "1",
  "fromToken": "0xEeee...",
  "toToken": "0x6B17...",
  "amount": "1000000000000000000",
  "estimatedGas": "150000",
  "apiConnected": true
}
```

## 📊 **Monitoring & Debugging**

### **Real-time Logs**
```bash
# Watch execution logs
npm run dev

# Check specific execution
curl http://localhost:3001/api/executions/{executionId}/logs
```

### **Execution Statistics**
```bash
curl http://localhost:3001/api/executions/{executionId}
```

Returns:
```json
{
  "execution": {
    "id": "uuid",
    "status": "completed",
    "startTime": 1234567890,
    "endTime": 1234567891
  },
  "stats": {
    "totalSteps": 3,
    "completedSteps": 3,
    "totalGasUsed": "180000",
    "duration": 1500
  }
}
```

## 🎯 **Hackathon Integration**

This execution engine is specifically designed for the **Unite DeFi Hackathon** with:

### **1inch Bounty Alignment**
- ✅ **Pathfinder integration** for optimal routing
- ✅ **Fusion mode support** for MEV protection  
- ✅ **Multi-chain compatibility** (Ethereum, Polygon, Arbitrum, etc.)
- ✅ **Gas optimization** and savings calculation
- ✅ **Real-time quotes** with sub-400ms response times

### **Template Support**
- **Swap Dashboard** - Complete 1inch swap interface
- **Cross-chain Bridge** - Fusion+ powered bridging
- **Limit Orders** - 1inch Limit Order Protocol
- **Yield Farming** - Multi-protocol aggregation
- **DAO Governance** - Token-based voting with treasury swaps

## 🚀 **Production Deployment**

### **Environment Variables**
```bash
NODE_ENV=production
PORT=3001
ONEINCH_API_KEY=prod_api_key
FRONTEND_URL=https://your-frontend-domain.com
```

### **PM2 Deployment**
```bash
npm run build
pm2 start dist/index.js --name "defi-execution-engine"
```

### **Docker Deployment**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

## 🤝 **Contributing**

1. **Add new node executors** in `src/nodes/`
2. **Extend API endpoints** in `src/index.ts`
3. **Add blockchain integrations** (Uniswap, Aave, etc.)
4. **Implement queue system** with Redis/BullMQ
5. **Add monitoring** with metrics and alerting

## 📄 **License**

MIT License - See LICENSE file for details

---

## 🎉 **Ready for Hackathon!**

This execution engine transforms your no-code DeFi platform from **visual mockup** to **production-ready application**. Users can now:

1. **Design workflows** visually in React Flow
2. **Execute them** with real blockchain transactions  
3. **Monitor progress** with real-time updates
4. **View results** with gas costs and transaction hashes
5. **Deploy APIs** generated from their visual flows

**Perfect for winning hackathon prizes** with actual working DeFi applications! 🏆