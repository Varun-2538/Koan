# 🧪 **Testing Live Dashboard Preview Feature**

## 🎯 **Test Overview**

This guide will help you test the new **Live Dashboard Preview** feature that allows users to interact with their generated DeFi applications in real-time.

## 🚀 **Prerequisites**

### **1. Required API Keys**
- **1inch API Key**: Get from [1inch Developer Portal](https://portal.1inch.dev/)
- **RPC Endpoint**: Use Alchemy, Infura, or your own RPC

### **2. Running Services**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Preview Server: `http://localhost:3002` (auto-starts with backend)

### **3. Wallet Setup**
- MetaMask or other Web3 wallet
- Some test tokens on the selected network

## 🧪 **Test Steps**

### **Step 1: Start All Services**

```bash
# Terminal 1 - Backend (includes preview server)
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### **Step 2: Create a DeFi Flow**

1. **Open**: http://localhost:3000
2. **Select Template**: Choose "1inch-Powered DeFi Suite"
3. **Verify Nodes**: Should see pre-configured nodes:
   - Wallet Connector
   - Token Selector
   - 1inch Quote
   - Fusion Swap
   - Limit Order
   - Portfolio API
   - DeFi Dashboard

### **Step 3: Execute the Flow**

1. **Click "Execute Flow"** button
2. **Monitor Status**: Watch execution status panel
3. **Verify Success**: Should see "Execution completed successfully!"

### **Step 4: Generate Code**

1. **Click "Deploy to GitHub"** button
2. **Wait**: Code generation takes a few seconds
3. **Verify**: Code preview modal opens with generated files

### **Step 5: Test Live Preview**

1. **Click "Live Preview"** button
2. **Configure API Settings**:
   - **1inch API Key**: Enter your actual API key
   - **Chain ID**: `1` (Ethereum Mainnet)
   - **RPC URL**: Your preferred RPC endpoint
3. **Click "Start Live Preview"**

### **Step 6: Monitor Preview Startup**

1. **Watch Logs Tab**: Monitor server startup process
2. **Expected Logs**:
   ```
   [timestamp] INFO: Starting preview server...
   [timestamp] INFO: Installing dependencies...
   [timestamp] SUCCESS: Preview server started at http://localhost:3001
   [timestamp] SUCCESS: Dashboard is ready for interaction!
   ```

### **Step 7: Test Interactive Dashboard**

1. **Switch to "Live Preview" Tab**
2. **Wait**: Dashboard loads in iframe (2-3 minutes)
3. **Connect Wallet**: Use MetaMask or other wallet
4. **Test Features**:
   - **Token Selection**: Choose from/to tokens
   - **Quote**: Get swap quotes from 1inch
   - **Swap**: Execute real token swaps
   - **Portfolio**: View wallet portfolio
   - **Limit Orders**: Place limit orders

### **Step 8: Verify Real Transactions**

1. **Check Wallet**: Verify transactions appear in wallet
2. **Monitor Logs**: Watch for transaction confirmations
3. **Test Limits**: Try different amounts and tokens

### **Step 9: Stop Preview**

1. **Click "Stop Preview"** button
2. **Verify Cleanup**: Check logs for cleanup messages
3. **Confirm**: Preview server stops and resources cleaned

## 🔍 **Expected Results**

### **✅ Success Indicators**

- **Preview Server**: Starts successfully on port 3001+
- **Dashboard Loads**: Full DeFi interface appears in iframe
- **Wallet Connection**: MetaMask connects without errors
- **Real Quotes**: 1inch API returns actual swap quotes
- **Live Swaps**: Transactions execute on blockchain
- **Portfolio Data**: Real wallet data displays
- **Clean Shutdown**: Server stops and cleans up properly

### **❌ Common Issues**

- **API Key Error**: "1inch API key is required"
  - **Fix**: Enter valid 1inch API key
- **Port Conflict**: "Port already in use"
  - **Fix**: Preview server automatically finds next available port
- **Dependency Error**: "npm install failed"
  - **Fix**: Check internet connection and try again
- **Wallet Connection**: "Failed to connect wallet"
  - **Fix**: Ensure MetaMask is installed and unlocked

## 🎯 **Test Scenarios**

### **Scenario 1: Basic Swap**
1. Connect wallet
2. Select ETH → USDC
3. Enter amount (0.01 ETH)
4. Get quote
5. Execute swap
6. Verify transaction in wallet

### **Scenario 2: Portfolio Tracking**
1. Connect wallet with multiple tokens
2. View portfolio dashboard
3. Check token balances
4. Monitor transaction history

### **Scenario 3: Limit Orders**
1. Place limit order for ETH/USDC
2. Set price and amount
3. Monitor order status
4. Cancel or modify order

### **Scenario 4: Multi-chain Testing**
1. Test on Ethereum Mainnet
2. Switch to Polygon
3. Verify different RPC endpoints
4. Test cross-chain functionality

## 📊 **Performance Testing**

### **Load Testing**
- **Multiple Previews**: Start 3-5 preview instances
- **Concurrent Users**: Test with multiple browser tabs
- **Memory Usage**: Monitor system resources
- **Cleanup**: Verify all instances stop properly

### **Network Testing**
- **Slow RPC**: Test with slow RPC endpoints
- **API Limits**: Test 1inch API rate limits
- **Network Errors**: Test with network interruptions

## 🔒 **Security Testing**

### **API Key Security**
- **Temporary Usage**: Verify keys only used in preview
- **No Storage**: Confirm keys not stored permanently
- **Cleanup**: Ensure keys removed after preview stops

### **Network Isolation**
- **Port Isolation**: Verify previews use different ports
- **File Isolation**: Confirm temporary directories are separate
- **Process Isolation**: Check preview processes are independent

## 🐛 **Debugging**

### **Preview Server Issues**
```bash
# Check preview server logs
tail -f backend/logs/preview-server.log

# Check preview server status
curl http://localhost:3002/api/preview/status/[instance-id]

# Restart preview server
# Stop backend and restart
```

### **Frontend Issues**
```bash
# Check browser console for errors
# Verify API calls to preview server
# Check iframe loading issues
```

### **Backend Issues**
```bash
# Check backend logs
tail -f backend/logs/app.log

# Verify preview server import
# Check file permissions for temp directories
```

## 🎉 **Success Criteria**

### **Functional Requirements**
- ✅ Preview server starts successfully
- ✅ Dashboard loads and functions properly
- ✅ Real wallet connections work
- ✅ Live swaps execute on blockchain
- ✅ Portfolio data displays correctly
- ✅ Preview server stops and cleans up

### **Performance Requirements**
- ✅ Preview startup < 3 minutes
- ✅ Dashboard loads < 30 seconds
- ✅ API responses < 5 seconds
- ✅ Memory usage < 500MB per preview
- ✅ Clean shutdown < 10 seconds

### **Security Requirements**
- ✅ API keys not stored permanently
- ✅ Temporary files cleaned up
- ✅ Network isolation maintained
- ✅ No sensitive data leaked

---

**The Live Dashboard Preview feature should provide a seamless, secure, and fully functional testing environment for DeFi applications!** 🚀 