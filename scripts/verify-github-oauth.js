#!/usr/bin/env node

/**
 * GitHub OAuth Configuration Verification Script
 * Run this to verify your GitHub OAuth setup is correct
 * 
 * Usage: node scripts/verify-github-oauth.js
 */

const fs = require('fs');
const path = require('path');

function checkEnvironmentFile() {
  const envPath = path.join(__dirname, '../frontend/.env.local');
  const envExamplePath = path.join(__dirname, '../frontend/.env.local.example');
  
  console.log('🔍 Checking environment configuration...\n');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local file not found!');
    console.log('📝 Please copy .env.local.example to .env.local:');
    console.log('   cp frontend/.env.local.example frontend/.env.local\n');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  let clientId = '';
  let clientSecret = '';
  
  for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_GITHUB_CLIENT_ID=')) {
      clientId = line.split('=')[1];
    }
    if (line.startsWith('GITHUB_CLIENT_SECRET=')) {
      clientSecret = line.split('=')[1];
    }
  }
  
  console.log('📄 Environment file found');
  
  // Check Client ID
  if (!clientId || clientId === 'your_github_client_id_here') {
    console.log('❌ NEXT_PUBLIC_GITHUB_CLIENT_ID is not set or using placeholder');
    console.log('   Should start with "Iv1." and be about 20 characters\n');
    return false;
  } else if (!clientId.startsWith('Iv1.')) {
    console.log('⚠️  NEXT_PUBLIC_GITHUB_CLIENT_ID might be incorrect');
    console.log('   GitHub Client IDs usually start with "Iv1."\n');
  } else {
    console.log(`✅ Client ID set: ${clientId.substring(0, 8)}...`);
  }
  
  // Check Client Secret
  if (!clientSecret || clientSecret === 'your_github_client_secret_here') {
    console.log('❌ GITHUB_CLIENT_SECRET is not set or using placeholder');
    console.log('   Should be a 40-character hex string\n');
    return false;
  } else if (clientSecret.length !== 40) {
    console.log('⚠️  GITHUB_CLIENT_SECRET might be incorrect');
    console.log(`   Expected 40 characters, got ${clientSecret.length}\n`);
  } else {
    console.log(`✅ Client Secret set: ${clientSecret.substring(0, 8)}...`);
  }
  
  return true;
}

function checkGitHubAppConfiguration() {
  console.log('\n🔗 GitHub OAuth App Configuration Checklist:');
  console.log('');
  console.log('1. Go to: https://github.com/settings/developers');
  console.log('2. Find your OAuth App and verify these settings:');
  console.log('');
  console.log('   📝 Application name: Unite DeFi Platform (or your choice)');
  console.log('   🏠 Homepage URL: http://localhost:3000');
  console.log('   🔄 Authorization callback URL: http://localhost:3000/github/callback');
  console.log('');
  console.log('⚠️  CRITICAL: The callback URL must match EXACTLY:');
  console.log('   - No trailing slash (/)');
  console.log('   - Correct protocol (http for localhost)');
  console.log('   - Correct port (3000 for default dev server)');
  console.log('   - Case sensitive path (/github/callback)');
  console.log('');
}

function checkCommonIssues() {
  console.log('🔧 Common Issues & Solutions:');
  console.log('');
  console.log('❌ "Bad Request" Error:');
  console.log('   → Check redirect URI matches exactly');
  console.log('   → Regenerate client secret');
  console.log('   → Verify client ID is correct');
  console.log('');
  console.log('❌ "Server configuration error":');
  console.log('   → GITHUB_CLIENT_SECRET not set in .env.local');
  console.log('');
  console.log('❌ "Popup blocked" Error:');
  console.log('   → Allow popups for localhost in browser');
  console.log('');
  console.log('💡 Debugging:');
  console.log('   → Check browser console for detailed logs');
  console.log('   → Check terminal for server-side logs');
  console.log('   → Look for "GitHub OAuth Debug Info" messages');
  console.log('');
}

function main() {
  console.log('🚀 GitHub OAuth Configuration Verifier\n');
  console.log('=====================================\n');
  
  const envValid = checkEnvironmentFile();
  
  checkGitHubAppConfiguration();
  checkCommonIssues();
  
  if (envValid) {
    console.log('🎉 Environment configuration looks good!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Verify your GitHub OAuth app settings match the requirements above');
    console.log('2. Restart your development server: npm run dev');
    console.log('3. Try connecting to GitHub and check console for debug logs');
    console.log('');
  } else {
    console.log('🔧 Please fix the environment configuration issues above');
    console.log('');
  }
  
  console.log('📚 For detailed troubleshooting, see: GITHUB_OAUTH_TROUBLESHOOTING.md');
}

main();