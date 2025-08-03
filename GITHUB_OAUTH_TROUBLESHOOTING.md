# 🔧 GitHub OAuth Troubleshooting Guide

## ❌ "OAuth token exchange failed: Bad Request"

This error occurs during the token exchange step and typically indicates a configuration mismatch between your GitHub OAuth app and your application settings.

### 🔍 **Step-by-Step Diagnosis:**

#### **1. Check Your GitHub OAuth App Configuration**

Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers) and verify your app has **EXACTLY** these settings:

```
Application name: Unite DeFi Platform (or your preferred name)
Homepage URL: http://localhost:3000
Authorization callback URL: http://localhost:3000/github/callback
```

⚠️ **Critical Notes:**
- **NO trailing slash** in the callback URL
- **Exact protocol match** (http for localhost, https for production)
- **Exact port match** (3000 for default Next.js dev server)
- **Case sensitive** - must be exactly `/github/callback`

#### **2. Verify Environment Variables**

Check your `frontend/.env.local` file:

```bash
# ✅ Correct format:
NEXT_PUBLIC_GITHUB_CLIENT_ID=Iv1.a1b2c3d4e5f6g7h8
GITHUB_CLIENT_SECRET=1234567890abcdef1234567890abcdef12345678

# ❌ Wrong - missing values:
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

#### **3. Get Fresh Credentials**

If you're still having issues:

1. **Regenerate Client Secret:**
   - Go to your GitHub OAuth app settings
   - Click "Generate a new client secret"
   - Copy the new secret to your `.env.local`

2. **Double-check Client ID:**
   - Copy the Client ID from GitHub (starts with "Iv1.")
   - Paste into `NEXT_PUBLIC_GITHUB_CLIENT_ID`

#### **4. Restart Development Server**

After any configuration changes:
```bash
cd frontend
npm run dev
```

### 🐛 **Debugging Tools Added:**

The app now includes detailed logging. Check your **browser console** and **terminal** for:

```
GitHub OAuth Debug Info: {
  state: "abc123...",
  authUrl: "https://github.com/login/oauth/authorize?...",
  clientId: "Iv1.abc1...",
  redirectUri: "http://localhost:3000/github/callback"
}
```

And server-side logs:
```
GitHub OAuth token exchange request: {
  code: "1234567890...",
  client_id: "Iv1.abc1...",
  redirect_uri: "http://localhost:3000/github/callback",
  client_secret_set: true
}
```

### 🏥 **Common Error Messages & Solutions:**

| Error | Cause | Solution |
|-------|--------|----------|
| `Bad Request` | Redirect URI mismatch | Check callback URL in GitHub app settings |
| `incorrect_client_credentials` | Wrong client secret | Regenerate client secret in GitHub |
| `redirect_uri_mismatch` | URL doesn't match exactly | Update GitHub app settings |
| `Server configuration error` | Missing client secret | Set GITHUB_CLIENT_SECRET in .env.local |

### 🎯 **Quick Test:**

1. Open browser console (F12)
2. Try connecting to GitHub
3. Look for detailed debug logs
4. Check terminal for server-side logs
5. If you see specific GitHub error codes, fix the corresponding issue above

### 📝 **Still Having Issues?**

If the problem persists:

1. **Check the debug logs** in browser console and terminal
2. **Verify your URLs match exactly** - including protocol and port
3. **Try creating a new GitHub OAuth app** with fresh credentials
4. **Ensure your development server is running on the correct port**

The enhanced logging will show you exactly what's being sent to GitHub and what error is coming back, making it much easier to identify the specific configuration issue.