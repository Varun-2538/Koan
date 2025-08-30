# 🔧 Environment Setup Guide

This guide will help you set up the required environment variables for the Unite DeFi platform.

## 📋 Overview

The Unite DeFi platform consists of three main components, each requiring its own environment configuration:

1. **Backend** - Execution engine and API server
2. **Frontend** - Next.js web application  
3. **Agents** - AI-powered workflow generation

## 🚀 Quick Setup

### 1. Backend Configuration

```bash
cd backend
cp env.example .env
```

Edit `.env` with your actual values:

**Critical for Production:**
- `ONEINCH_API_KEY` - Get from [1inch Developer Portal](https://portal.1inch.dev/)
- RPC URLs - Get from [Infura](https://infura.io/) or [Alchemy](https://www.alchemy.com/)

### 2. Frontend Configuration

```bash
cd frontend
cp env.local.example .env.local
```

Edit `.env.local` with your actual values:

**Optional but Recommended:**
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET` - For code deployment features
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - For wallet connections

### 3. Agents Configuration

```bash
cd agents
cp env.example .env
```

Edit `.env` with your actual values:

**Required for AI Features:**
- `OPENAI_API_KEY` - Get from [OpenAI Platform](https://platform.openai.com/)
- OR `ANTHROPIC_API_KEY` - Get from [Anthropic Console](https://console.anthropic.com/)

## 🔑 Required API Keys

### 🚨 Critical (System won't work without these):

| Service | Purpose | Get From | Required For |
|---------|---------|----------|--------------|
| 1inch API | Real DeFi operations | [portal.1inch.dev](https://portal.1inch.dev/) | Production swaps, quotes |
| OpenAI API | AI workflow generation | [platform.openai.com](https://platform.openai.com/) | Agent functionality |

### ⚡ Recommended (Improves performance):

| Service | Purpose | Get From | Benefits |
|---------|---------|----------|----------|
| Infura/Alchemy | Blockchain RPC | [infura.io](https://infura.io/) | Reliable blockchain access |
| WalletConnect | Wallet connections | [cloud.walletconnect.com](https://cloud.walletconnect.com/) | Better wallet support |

### 🎯 Optional (Enhanced features):

| Service | Purpose | Get From | Features |
|---------|---------|----------|----------|
| GitHub OAuth | Code deployment | [github.com/settings/applications](https://github.com/settings/applications/new) | Deploy generated code |
| Supabase | Data storage | [supabase.com](https://supabase.com/) | Analytics, persistence |

## 🔐 Security Best Practices

1. **Never commit `.env` files** - They're already in `.gitignore`
2. **Use different keys for different environments** (dev/staging/prod)
3. **Rotate API keys regularly**
4. **Limit API key permissions** where possible

## 🧪 Development vs Production

### Development Mode
- System works without API keys (uses mock data)
- Fallback RPC endpoints are provided
- Debug logging enabled

### Production Mode
- **Requires real API keys** for functionality
- Enhanced security settings
- Performance monitoring enabled

## 📝 Environment Variables Reference

### Backend (`backend/.env`)

**Essential:**
```env
ONEINCH_API_KEY=your_1inch_api_key_here
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
```

**Optional:**
```env
PORT=3001
NODE_ENV=development
LOG_LEVEL=info
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)

**Essential:**
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_AGENT_URL=http://localhost:8000
```

**Optional:**
```env
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### Agents (`agents/.env`)

**Essential:**
```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here
```

**Optional:**
```env
BACKEND_URL=http://localhost:3001
LOG_LEVEL=info
MAX_TOKENS=2000
```

## 🔍 Troubleshooting

### "No API key" errors
- Check that your `.env` files exist and have the correct variable names
- Restart the development servers after adding new environment variables

### RPC connection issues
- Verify your RPC URLs are correct and have sufficient rate limits
- Check that your Infura/Alchemy project has the required networks enabled

### AI agent not working
- Ensure `OPENAI_API_KEY` is set correctly
- Check your OpenAI account has sufficient credits

## ✅ Verification

To verify your setup is working:

1. **Backend**: Visit `http://localhost:3001/api/health`
2. **Frontend**: Visit `http://localhost:3000`
3. **Agents**: Visit `http://localhost:8000/docs`

## 🆘 Need Help?

If you encounter issues:
1. Check the console logs for specific error messages
2. Verify all required environment variables are set
3. Ensure API keys have the correct permissions
4. Check that services are running on the expected ports

---

**Note**: The system is designed to work in "demo mode" without API keys for development, but production deployment requires proper configuration.
