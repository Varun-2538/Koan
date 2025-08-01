# DEX Aggregator Swap Application Template

## Overview

This template provides a complete DEX aggregator solution for creating professional swap applications using 1inch Protocol integration. It follows the Langflow-style node-based approach where users can create DeFi applications through visual workflow design.

## Architecture

The template consists of 6 core nodes connected in chronological order:

```
Wallet Connection → Token Selector → 1inch Quote → Price Impact → Swap Execution → Transaction Monitor
                           ↓
                    Swap Dashboard (Connected to all nodes)
```

## Node Descriptions

### 1. Wallet Connection Node (`wallet-connector-1`)
- **Purpose**: Connect to user's Web3 wallet
- **Features**: 
  - Multi-wallet support (MetaMask, WalletConnect, Coinbase Wallet)
  - Auto-connection capability
  - Network validation
  - Balance checking
- **Outputs**: Wallet address, chain ID, balance, provider info

### 2. Token Selector Node (`token-selector-1`)
- **Purpose**: Advanced token selection with metadata
- **Features**:
  - Support for ETH, USDC, WBTC, USDT, DAI, 1INCH
  - Real-time price data integration
  - Token metadata enrichment
  - Verification status checking
- **Outputs**: From/to token details, available tokens list, price information

### 3. 1inch Quote Node (`oneinch-quote-1`)
- **Purpose**: Get optimal swap quotes using 1inch Pathfinder
- **Features**:
  - Sub-400ms quote response times
  - Multi-protocol aggregation
  - Gas estimation
  - Pathfinder algorithm optimization
  - Slippage configuration
- **Outputs**: Quote data, expected return, gas estimates, protocol routing

### 4. Price Impact Calculator Node (`price-impact-1`)
- **Purpose**: Analyze trade impact on market price
- **Features**:
  - Real-time price impact calculation
  - Risk level assessment (low/medium/high/critical)
  - Liquidity depth analysis
  - Alternative route suggestions
  - Warning thresholds configuration
- **Outputs**: Price impact percentage, risk assessment, recommendations

### 5. 1inch Swap Executor Node (`oneinch-swap-1`)
- **Purpose**: Execute the token swap
- **Features**:
  - MEV protection integration
  - Fusion mode support
  - Gas optimization
  - Transaction submission
  - Error handling and retries
- **Outputs**: Transaction hash, status, gas details

### 6. Transaction Monitor Node (`transaction-monitor-1`)
- **Purpose**: Real-time transaction monitoring
- **Features**:
  - Live transaction tracking
  - Confirmation counting
  - MEV detection
  - Gas efficiency analysis
  - Alert system
  - Timeout handling
- **Outputs**: Final status, confirmation count, performance metrics

### 7. Swap Dashboard Interface (`swap-interface-1`)
- **Purpose**: User interface for the swap application
- **Features**:
  - Modern professional design
  - Real-time price charts
  - Transaction history
  - Advanced settings panel
  - Responsive design

## Configuration Options

### Required Inputs
- **1inch API Key**: Your 1inch API key for protocol access
- **Supported Chains**: Choose from Ethereum, Multi-chain, or All chains
- **Advanced Features**: Enable MEV protection and detailed analytics
- **Max Price Impact**: Set maximum allowed price impact (default: 15%)

### Optional Configurations
- **Gas Optimization**: Choose between speed, balanced, or cost optimization
- **Slippage Tolerance**: Configure acceptable slippage (default: 1%)
- **MEV Protection**: Enable/disable MEV protection
- **Confirmation Requirements**: Set required confirmations (default: 1)

## File Structure

```
backend/src/nodes/
├── token-selector-executor.ts          # Token selection logic
├── price-impact-calculator-executor.ts # Price impact analysis
├── transaction-monitor-executor.ts     # Transaction monitoring
├── oneinch-swap-executor.ts           # Existing 1inch integration
├── wallet-connector-executor.ts       # Existing wallet connection
└── chain-selector-executor.ts         # Existing chain selection

frontend/
├── lib/templates.ts                   # Template definitions
├── components/component-palette.tsx   # Node palette
├── app/demo/swap-aggregator/         # Demo implementation
└── components/flow-canvas.tsx        # Visual flow editor
```

## Getting Started

### 1. Backend Setup
1. Install dependencies: `npm install`
2. Set environment variables:
   ```env
   ONEINCH_API_KEY=your_1inch_api_key
   ETHEREUM_RPC_URL=your_ethereum_rpc
   POLYGON_RPC_URL=your_polygon_rpc
   ```
3. Start the server: `npm run dev`

### 2. Frontend Setup
1. Install dependencies: `npm install`
2. Configure API endpoints in environment
3. Start the development server: `npm run dev`

### 3. Using the Template
1. Navigate to the project creator
2. Select "DEX Aggregator Swap Application" template
3. Configure your API keys and preferences
4. Generate and download your complete application code

## Demo

Visit `/demo/swap-aggregator` to see the template in action with:
- Simulated wallet connection
- Real-time node execution
- Interactive flow visualization
- Complete transaction lifecycle

## Features Highlights

### Professional Trading Interface
- Real-time price updates
- Advanced slippage controls
- MEV protection indicators
- Transaction history tracking

### Comprehensive Analytics
- Price impact visualization
- Gas efficiency metrics
- Protocol routing details
- Performance benchmarking

### Production Ready
- Error handling and recovery
- Rate limiting compliance
- Security best practices
- Scalable architecture

## API Integration

The template integrates with:
- **1inch Protocol**: Primary DEX aggregation
- **CoinGecko**: Price data enrichment
- **Ethereum/Polygon RPCs**: On-chain data
- **WebSocket**: Real-time updates

## Customization

### Adding New Tokens
Edit `backend/src/nodes/token-selector-executor.ts`:
```typescript
private defaultTokens: Record<string, TokenMetadata> = {
  'YOUR_TOKEN': {
    address: '0x...',
    symbol: 'YOUR_TOKEN',
    name: 'Your Token Name',
    decimals: 18,
    // ... other metadata
  }
}
```

### Modifying Price Impact Thresholds
Update `price-impact-calculator-executor.ts`:
```typescript
const config: PriceImpactConfig = {
  warningThreshold: 3,      // 3% warning
  maxImpactThreshold: 15,   // 15% maximum
  // ... other settings
}
```

### Custom Alert Configurations
Modify `transaction-monitor-executor.ts`:
```typescript
const config: TransactionMonitorConfig = {
  confirmationsRequired: 1,
  timeoutMinutes: 30,
  enableAlerts: true,
  // ... webhook and notification settings
}
```

## Production Deployment

### Environment Variables
```env
# Required
ONEINCH_API_KEY=your_api_key
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your_key
POLYGON_RPC_URL=https://polygon-rpc.com

# Optional
REDIS_HOST=localhost
REDIS_PORT=6379
WEBHOOK_URL=https://your-webhook-endpoint.com
LOG_LEVEL=info
```

### Docker Deployment
```dockerfile
# Use provided Dockerfile
docker build -t swap-aggregator .
docker run -p 3000:3000 -p 3001:3001 swap-aggregator
```

## Security Considerations

- API keys are server-side only
- Input validation on all parameters
- Rate limiting on API calls
- MEV protection enabled by default
- Slippage protection mechanisms

## Support & Documentation

- **1inch Integration**: [1inch Developer Portal](https://portal.1inch.dev/)
- **Template Issues**: Check project GitHub issues
- **Customization Help**: Review node executor implementations
- **Production Support**: Contact development team

## License

This template is part of the Unite DeFi project and follows the project's licensing terms.