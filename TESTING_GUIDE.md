# 🧪 **Complete Testing Guide for DeFi Executable Nodes**

## **Quick Testing Checklist**

Follow these steps to verify your DeFi execution engine is working correctly:

## **Step 1: Start Backend Execution Engine**

```bash
# Navigate to backend directory
cd backend

# Start development server
npm run dev
```

**Expected Output:**
```
info: Registered node executor: oneInchSwap
info: 🚀 DeFi Execution Engine started on port 3001
info: 📊 WebSocket endpoint: ws://localhost:3001
info: 🔗 REST API: http://localhost:3001/api
info: 🎯 Frontend origin: http://localhost:3000
warn: ⚠️  No 1inch API key found - add ONEINCH_API_KEY to environment
```

## **Step 2: Test Backend API (New Terminal)**

Open a **new terminal** and test the health endpoint:

```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Or using PowerShell
Invoke-WebRequest -Uri "http://localhost:3001/api/health" -Method GET
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-29T14:22:12.608Z",
  "version": "1.0.0",
  "uptime": 23.456
}
```

## **Step 3: Test Node Executors**

```bash
# Test available node types
curl http://localhost:3001/api/nodes

# Test 1inch connection (without API key)
curl -X POST http://localhost:3001/api/test/oneinch \
  -H "Content-Type: application/json" \
  -d '{
    "chainId": "1",
    "fromToken": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    "toToken": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    "amount": "1000000000000000000"
  }'
```

**Expected Response (without API key):**
```json
{
  "success": false,
  "error": "1inch API key is required",
  "apiConnected": false
}
```

## **Step 4: Start Frontend (New Terminal)**

```bash
# Navigate to frontend directory
cd frontend

# Start development server
npm run dev
```

**Expected Output:**
```
✓ Ready in 2.3s
● Local:        http://localhost:3000
● Experiments:  ● WebSocket:     ws://localhost:3000
```

## **Step 5: Test Visual Workflow Execution**

1. **Open browser:** Go to `http://localhost:3000`
2. **Open browser DevTools:** Press F12 → Console tab
3. **Drag nodes:** Add a **1inch Swap Node** to the canvas
4. **Configure node:** Click the node and set:
   - Chain ID: `1` (Ethereum)
   - From Token: `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE` (ETH)
   - To Token: `0x6B175474E89094C44Da98b954EedeAC495271d0F` (DAI)
   - Amount: `1000000000000000000` (1 ETH in wei)
   - From Address: `0x742d35Cc6354C88532f3Bf5fDeEb94B16D1B8d36`

5. **Right-click node:** Look for "Execute" or "Test" option
6. **Check console:** You should see WebSocket connection logs

## **Step 6: Test WebSocket Connection**

Add this test code to your browser console:

```javascript
// Test WebSocket connection
const socket = new WebSocket('ws://localhost:3001');

socket.onopen = () => {
  console.log('✅ WebSocket connected to execution engine');
  
  // Test workflow execution
  const testWorkflow = {
    id: 'test-workflow-' + Date.now(),
    name: 'Test 1inch Swap',
    nodes: [
      {
        id: 'swap-1',
        type: 'oneInchSwap',
        position: { x: 100, y: 100 },
        data: {
          label: '1inch Swap',
          config: {
            chain_id: '1',
            from_token: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
            to_token: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
            amount: '1000000000000000000',
            from_address: '0x742d35Cc6354C88532f3Bf5fDeEb94B16D1B8d36',
            slippage: 1
          }
        }
      }
    ],
    edges: []
  };
  
  // Send execution request
  socket.send(JSON.stringify({
    type: 'execute-workflow',
    data: { workflow: testWorkflow }
  }));
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('📊 Execution update:', data);
};

socket.onerror = (error) => {
  console.error('❌ WebSocket error:', error);
};
```

## **Step 7: Expected Test Results**

### **✅ Success Indicators:**

1. **Backend logs show:**
   ```
   info: Received workflow execution request: test-workflow-123
   info: Starting workflow execution: abc-123-def
   info: Executing step: swap-1 (oneInchSwap)
   ```

2. **Frontend console shows:**
   ```
   ✅ WebSocket connected to execution engine
   📊 Execution update: { type: 'execution.started', ... }
   📊 Execution update: { type: 'node.started', ... }
   ```

3. **Without API key, expect validation error:**
   ```json
   {
     "type": "node.failed",
     "data": {
       "error": "Input validation failed: 1inch API key is required"
     }
   }
   ```

### **❌ Troubleshooting:**

**Backend won't start:**
```bash
# Check if port 3001 is in use
netstat -ano | findstr :3001

# Install dependencies
npm install

# Check Node.js version
node --version  # Should be 18+
```

**Frontend won't connect:**
- Check CORS settings in `backend/src/index.ts`
- Verify frontend URL: `http://localhost:3000`
- Check browser DevTools Network tab for WebSocket connection

**Execution fails:**
- Check backend logs for detailed error messages
- Verify node configuration matches expected inputs
- Test individual API endpoints first

## **Step 8: Add 1inch API Key (Optional)**

For full testing:

```bash
# Create .env file in backend directory
cd backend
echo "ONEINCH_API_KEY=your_api_key_here" > .env

# Restart backend
# Ctrl+C to stop, then npm run dev
```

With API key, the test should succeed and return:
```json
{
  "success": true,
  "outputs": {
    "quote": { ... },
    "transaction_data": { ... },
    "estimated_gas": "150000"
  }
}
```

## **Step 9: Integration Test Workflow**

Create a complete workflow:
1. **Token Input Node** → **1inch Swap Node** → **Transaction Status Node**  
2. Connect the nodes with edges
3. Execute the complete flow
4. Monitor each step in backend logs
5. Verify data flows between nodes correctly

## **🎯 Success Criteria**

Your executable nodes are working if you see:

- ✅ Backend server starts without errors
- ✅ Health endpoint returns 200 OK
- ✅ WebSocket connection established
- ✅ Node executors registered successfully
- ✅ Workflow execution starts (even if it fails validation)
- ✅ Real-time events received in frontend
- ✅ Detailed logs in backend console
- ✅ Error handling works (validation failures, etc.)

## **🚀 Ready for Hackathon!**

Once all tests pass, your DeFi platform has:
- **Real execution engine** (not just visual mockup)
- **Live 1inch integration** 
- **WebSocket real-time updates**
- **Production-ready API services**
- **Hackathon demo potential** 🏆

---

**Need help?** Check the `backend/README.md` for detailed API documentation!