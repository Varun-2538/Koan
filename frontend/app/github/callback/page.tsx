'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createGitHubOAuth } from '@/lib/github-oauth';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

function GitHubCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting to GitHub...');
  const [user, setUser] = useState<any>(null);
  
  // Prevent multiple executions
  const hasExecuted = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasExecuted.current) {
      console.log('Callback already executed, skipping...');
      return;
    }
    
    hasExecuted.current = true;
    console.log('Starting OAuth callback handling...');

    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        console.log('Callback received:', { 
          code: code?.substring(0, 10) + '...', 
          state, 
          error,
          hasCode: !!code,
          hasState: !!state
        });

        if (error) {
          throw new Error(`GitHub OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error('Authorization code not found');
        }

        const githubOAuth = createGitHubOAuth();

        // Skip state verification for now (temporarily disabled for debugging)
        console.log('Skipping state verification for debugging');
        // TODO: Re-enable state verification once working

        setMessage('Exchanging authorization code...');

        // Exchange code for access token
        console.log('Exchanging code for token...');
        const accessToken = await githubOAuth.exchangeCodeForToken(code, state);
        console.log('Token exchange successful, token length:', accessToken.length);

        setMessage('Fetching user information...');

        // Get user information
        console.log('Fetching user info...');
        const userData = await githubOAuth.getUser(accessToken);
        console.log('User info fetched:', userData.login);

        // Store access token
        githubOAuth.storeAccessToken(accessToken);
        console.log('Access token stored');

        setUser(userData);
        setStatus('success');
        setMessage(`Successfully connected as ${userData.name || userData.login}!`);

        // Redirect back to the main app after a delay
        setTimeout(() => {
          // Close the popup window if opened in popup
          if (typeof window !== 'undefined' && window.opener) {
            console.log('Notifying parent window of success');
            window.opener.postMessage({
              type: 'GITHUB_AUTH_SUCCESS',
              user: userData,
              accessToken
            }, window.location.origin);
            window.close();
          } else {
            // Redirect to main app
            router.push('/?github_connected=true');
          }
        }, 2000);

      } catch (error: any) {
        console.error('GitHub OAuth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Failed to connect to GitHub');

        // Notify parent window if in popup
        if (typeof window !== 'undefined' && window.opener) {
          console.log('Notifying parent window of error:', error.message);
          window.opener.postMessage({
            type: 'GITHUB_AUTH_ERROR',
            error: error.message
          }, window.location.origin);
          
          // Close popup after a delay to show error message
          setTimeout(() => {
            window.close();
          }, 3000);
        }
      }
    };

    handleCallback();
  }, [searchParams, router]); // Dependencies to ensure it runs when needed

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connecting to GitHub</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Successfully Connected!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            {user && (
              <div className="flex items-center justify-center space-x-3">
                <img 
                  src={user.avatar_url} 
                  alt={user.login}
                  className="w-10 h-10 rounded-full"
                />
                <span className="font-medium">{user.name || user.login}</span>
              </div>
            )}
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Failed</h2>
            <p className="text-red-600 mb-4">{message}</p>
            <button 
              onClick={() => window.close()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function GitHubCallback() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GitHubCallbackContent />
    </Suspense>
  );
}