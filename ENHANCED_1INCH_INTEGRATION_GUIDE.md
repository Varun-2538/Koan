# Enhanced 1inch API Integration Guide

This guide will help you set up and test the enhanced 1inch API integration with real swap functionality, token approvals, and MEV protection.

## 🚀 Quick Start

### 1. Get Your 1inch API Key

1. Go to [https://portal.1inch.dev/](https://portal.1inch.dev/)
2. Sign up for a free account
3. Get your API key (100,000 requests per month free)
4. Copy the API key for use in the next steps

### 2. Test Your API Integration

Run the test script to verify your API key works:

```bash
# Set your API key as an environment variable
export ONEINCH_API_KEY=your_actual_api_key_here

# Run the test script
node scripts/test-1inch-api.js
```

Expected output:
```
🔍 Testing 1inch API Integration...

1️⃣ Testing API key validity...
✅ API key is valid
📊 Found 1234 tokens on Ethereum

2️⃣ Testing quote endpoint...
✅ Quote retrieved successfully
💱 1 ETH = 1850.25 USDC
⛽ Estimated gas: 150,000
🔗 Protocols: 15 DEXs

3️⃣ Testing swap endpoint...
✅ Swap data retrieved successfully
🎯 To address: 0x1111111254EEB25477B68fb85Ed929f73A960582
💰 Value: 0 wei
⛽ Gas limit: 200,000

4️⃣ Testing protocols endpoint...
✅ Protocols retrieved successfully
🔗 Available protocols: 50
📋 Popular protocols: Uniswap V3, SushiSwap, 1inch, Balancer, Curve

5️⃣ Testing backend API...
✅ Backend is running
📊 Backend status: healthy
✅ Backend 1inch integration working
💱 Backend quote: 1 ETH = 1850.25 USDC

🎉 All tests completed! Your 1inch API integration is working.
```

## 🔧 Backend Setup

### 1. Update Environment Variables

Add your API key to the backend `.env` file:

```bash
# backend/.env
ONEINCH_API_KEY=your_actual_api_key_here
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### 2. Install Dependencies

```bash
cd backend
npm install axios express cors helmet winston socket.io
```

### 3. Start the Backend Server

```bash
cd backend
npm run dev
```

The backend will start on port 3001 with the following endpoints:
- `GET /health` - Health check
- `GET /api/1inch/quote` - Get swap quotes
- `POST /api/1inch/swap` - Execute swaps
- `GET /api/1inch/tokens` - Get supported tokens
- `GET /api/1inch/protocols` - Get supported protocols
- `GET /api/1inch/health` - 1inch API health check

## 🎨 Frontend Setup

### 1. Install Required Dependencies

```bash
cd frontend
npm install wagmi viem @tanstack/react-query axios react-hot-toast
```

### 2. Configure Wagmi

Create `frontend/src/config/wagmi.ts`:

```typescript
import { configureChains, createConfig } from 'wagmi';
import { mainnet, polygon, arbitrum, optimism, goerli } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { infuraProvider } from 'wagmi/providers/infura';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { InjectedConnector } from 'wagmi/connectors/injected';

// Configure chains with multiple providers for reliability
export const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    mainnet,
    ...(process.env.NODE_ENV === 'development' ? [goerli] : []),
    polygon,
    arbitrum,
    optimism,
  ],
  [
    // Add Alchemy provider if API key is available
    ...(process.env.NEXT_PUBLIC_ALCHEMY_API_KEY 
      ? [alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY })] 
      : []
    ),
    // Add Infura provider if API key is available
    ...(process.env.NEXT_PUBLIC_INFURA_API_KEY 
      ? [infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_API_KEY })] 
      : []
    ),
    // Always include public provider as fallback
    publicProvider(),
  ]
);

// Create connectors with proper configuration
const connectors = [
  new MetaMaskConnector({
    chains,
    options: {
      shimDisconnect: true,
      UNSTABLE_shimOnConnectSelectAccount: true,
    },
  }),
  new WalletConnectConnector({
    chains,
    options: {
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'c4f79cc821944d9680842e34466bfbd9',
      metadata: {
        name: '1inch DeFi Suite',
        description: 'Complete DeFi application with 1inch protocol integration',
        url: 'http://localhost:3000',
        icons: ['https://walletconnect.com/walletconnect-logo.png'],
      },
    },
  }),
  new CoinbaseWalletConnector({
    chains,
    options: {
      appName: '1inch DeFi Suite',
      appLogoUrl: 'https://1inch.io/img/logo.svg',
    },
  }),
  new InjectedConnector({
    chains,
    options: {
      name: 'Injected',
      shimDisconnect: true,
    },
  }),
];

// Create wagmi config
export const wagmiConfig = createConfig({
  autoConnect: false, // Disable autoConnect to prevent hydration issues
  publicClient,
  webSocketPublicClient,
  connectors,
});

// Export individual chains for easy access
export { mainnet, polygon, arbitrum, optimism, goerli };
```

### 3. Environment Variables

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_ONEINCH_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key_here
NEXT_PUBLIC_INFURA_API_KEY=your_infura_key_here
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
```

## 🧪 Testing the Integration

### 1. Manual API Testing

Test the backend API directly:

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test quote endpoint
curl "http://localhost:3001/api/1inch/quote?chainId=1&src=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE&dst=0xA0b86a33E6441203206448619dd91e2df9dd2abF&amount=1000000000000000000"

# Test tokens endpoint
curl "http://localhost:3001/api/1inch/tokens?chainId=1"
```

### 2. Frontend Testing

1. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Open your browser to `http://localhost:3000`

3. Connect your wallet (MetaMask recommended)

4. Try getting a quote for ETH to USDC

5. Test the swap functionality with a small amount

## 🔍 Troubleshooting

### Common Issues

#### 1. "API key test failed"
- **Solution**: Make sure your API key is valid and properly set in environment variables
- **Check**: Run `echo $ONEINCH_API_KEY` to verify it's set

#### 2. "Failed to get quote"
- **Solution**: Check your backend logs for detailed error messages
- **Check**: Verify the backend is running on port 3001

#### 3. "Wallet not connecting"
- **Solution**: Make sure MetaMask is installed and unlocked
- **Check**: Verify the wagmi configuration is correct

#### 4. "Transaction failed"
- **Solution**: Check if you have sufficient balance and gas fees
- **Check**: Verify token approvals are working correctly

#### 5. "Backend test failed"
- **Solution**: Make sure the backend server is running
- **Check**: Verify the backend is accessible at `http://localhost:3001`

### Debug Information

The enhanced swap interface includes debug information in development mode:

1. Open the browser console
2. Look for debug information in the UI
3. Check network requests in the Network tab
4. Monitor backend logs for API calls

## 🚀 Production Deployment

### 1. Environment Variables

Set up production environment variables:

```bash
# Production environment variables
NODE_ENV=production
ONEINCH_API_KEY=your_production_api_key
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com
NEXT_PUBLIC_ALCHEMY_API_KEY=your_production_alchemy_key
NEXT_PUBLIC_INFURA_API_KEY=your_production_infura_key
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_production_wallet_connect_id
```

### 2. Security Considerations

- ⚠️ **Never expose API keys in frontend code**
- ✅ Always keep API keys on the backend only
- ✅ Use environment variables for sensitive data
- ✅ Implement proper rate limiting
- ✅ Add request validation
- ✅ Monitor API usage

### 3. Performance Optimization

- Cache quotes briefly to improve UX
- Implement proper error handling
- Add loading states for better user experience
- Monitor gas prices and optimize transactions

## 📊 Monitoring and Analytics

### 1. API Usage Monitoring

Monitor your 1inch API usage:
- Check the 1inch portal dashboard
- Monitor request logs in your backend
- Set up alerts for rate limits

### 2. Transaction Monitoring

Track swap transactions:
- Monitor transaction success rates
- Track gas costs
- Monitor user behavior

### 3. Error Tracking

Set up error tracking:
- Log API errors
- Track user-facing errors
- Monitor wallet connection issues

## 🔗 Additional Resources

- [1inch API Documentation](https://docs.1inch.dev/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)
- [1inch Portal](https://portal.1inch.dev/)

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the backend logs for detailed error messages
3. Test your API key with the provided test script
4. Verify all environment variables are set correctly
5. Check that all dependencies are installed

## 🎯 Next Steps

Once your basic integration is working:

1. Add support for more chains
2. Implement Fusion mode for MEV protection
3. Add limit orders functionality
4. Implement portfolio tracking
5. Add advanced gas optimization
6. Create a mobile-responsive interface

---

**Happy swapping! 🚀** 