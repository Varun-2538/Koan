'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createGitHubOAuth } from '@/lib/github-oauth';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

function GitHubCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting to GitHub...');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`GitHub OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error('Authorization code not found');
        }

        const githubOAuth = createGitHubOAuth();

        // Verify state for security
        if (state) {
          if (!githubOAuth.verifyState(state)) {
            throw new Error('Invalid OAuth state parameter');
          }
        }

        setMessage('Exchanging authorization code...');

        // Exchange code for access token
        const accessToken = await githubOAuth.exchangeCodeForToken(code, state);

        setMessage('Fetching user information...');

        // Get user information
        const userData = await githubOAuth.getUser(accessToken);

        // Store access token
        githubOAuth.storeAccessToken(accessToken);

        setUser(userData);
        setStatus('success');
        setMessage(`Successfully connected as ${userData.name || userData.login}!`);

        // Redirect back to the main app after a delay
        setTimeout(() => {
          // Close the popup window if opened in popup
          if (typeof window !== 'undefined' && window.opener) {
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
          window.opener.postMessage({
            type: 'GITHUB_AUTH_ERROR',
            error: error.message
          }, window.location.origin);
          
          setTimeout(() => {
            window.close();
          }, 3000);
        }
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="flex justify-center mb-4">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Connecting to GitHub
              </h1>
              <p className="text-gray-600 mb-4">{message}</p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  Please wait while we set up your GitHub integration...
                </p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-green-700 mb-2">
                Successfully Connected!
              </h1>
              <p className="text-gray-600 mb-4">{message}</p>
              {user && (
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-center mb-2">
                    <img
                      src={user.avatar_url}
                      alt={user.login}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <div className="font-medium">{user.name || user.login}</div>
                      <div className="text-sm text-gray-500">@{user.login}</div>
                    </div>
                  </div>
                  <p className="text-sm text-green-700">
                    You can now create repositories directly from Unite DeFi!
                  </p>
                </div>
              )}
              <p className="text-sm text-gray-500">
                Redirecting you back to the application...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center mb-4">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-red-700 mb-2">
                Connection Failed
              </h1>
              <p className="text-gray-600 mb-4">{message}</p>
              <div className="bg-red-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-red-700">
                  Please try connecting to GitHub again. If the problem persists, 
                  check your internet connection and GitHub permissions.
                </p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Return to App
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GitHubCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Loading...
            </h1>
          </div>
        </div>
      </div>
    }>
      <GitHubCallbackContent />
    </Suspense>
  );
}