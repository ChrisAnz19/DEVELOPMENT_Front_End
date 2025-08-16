import React, { useEffect, useState } from 'react';

const HubSpotOAuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing OAuth callback...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        // Check for OAuth errors
        if (error) {
          throw new Error(errorDescription || error);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Verify state parameter
        const storedState = sessionStorage.getItem('hubspot_oauth_state');
        if (!storedState || state !== storedState) {
          throw new Error('Invalid state parameter - possible CSRF attack');
        }

        setMessage('Exchanging authorization code for access token...');

        // Exchange code for access token
        const tokenResponse = await fetch('/api/hubspot/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            redirect_uri: `${window.location.origin}/oauth/hubspot/callback`,
          }),
        });

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          throw new Error(errorData.error || 'Failed to exchange code for token');
        }

        const tokenData = await tokenResponse.json();
        
        console.log('✅ Token exchange successful:', tokenData);
        setStatus('success');
        setMessage('Successfully connected to HubSpot!');

        // Send success message to parent window
        if (window.opener) {
          window.opener.postMessage({
            type: 'HUBSPOT_OAUTH_SUCCESS',
            tokenData
          }, window.location.origin);
        }

        // Close popup after a brief delay
        setTimeout(() => {
          window.close();
        }, 2000);

      } catch (error) {
        console.error('❌ OAuth callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'OAuth authentication failed');

        // Send error message to parent window
        if (window.opener) {
          window.opener.postMessage({
            type: 'HUBSPOT_OAUTH_ERROR',
            error: error instanceof Error ? error.message : 'OAuth authentication failed'
          }, window.location.origin);
        }

        // Close popup after a delay
        setTimeout(() => {
          window.close();
        }, 3000);
      } finally {
        // Clean up stored state
        sessionStorage.removeItem('hubspot_oauth_state');
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {status === 'processing' && (
          <>
            <div className="animate-spin mx-auto w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Connecting to HubSpot
            </h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Connection Successful!
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">This window will close automatically...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Connection Failed
            </h2>
            <p className="text-red-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">This window will close automatically...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default HubSpotOAuthCallback;
