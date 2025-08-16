import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { HUBSPOT_CONFIG } from '../config/hubspot';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing OAuth callback...');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Check for OAuth errors
        if (error) {
          console.error('OAuth error:', error, errorDescription);
          setStatus('error');
          setMessage(`OAuth error: ${errorDescription || error}`);
          return;
        }

        // Validate state parameter
        const storedState = sessionStorage.getItem('hubspot_oauth_state');
        if (!state || state !== storedState) {
          console.error('Invalid state parameter');
          setStatus('error');
          setMessage('Invalid state parameter - possible CSRF attack');
          return;
        }

        // Validate authorization code
        if (!code) {
          console.error('No authorization code received');
          setStatus('error');
          setMessage('No authorization code received from HubSpot');
          return;
        }

        console.log('✅ OAuth callback received with code:', code);
        setMessage('Exchanging authorization code for access token...');

        // Exchange authorization code for access token
        // Note: In production, this should be done server-side for security
        const tokenResponse = await exchangeCodeForToken(code);
        
        if (tokenResponse.access_token) {
          // Store tokens securely
          localStorage.setItem('hubspot_access_token', tokenResponse.access_token);
          if (tokenResponse.refresh_token) {
            localStorage.setItem('hubspot_refresh_token', tokenResponse.refresh_token);
          }
          
          console.log('✅ OAuth tokens stored successfully');
          setStatus('success');
          setMessage('Successfully connected to HubSpot! Redirecting...');
          
          // Clean up
          sessionStorage.removeItem('hubspot_oauth_state');
          
          // Redirect back to integrations page after a short delay
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          throw new Error('No access token received');
        }

      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(`Failed to complete OAuth flow: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  const exchangeCodeForToken = async (code: string) => {
    // WARNING: In production, this should be done server-side!
    // This is just for development/testing purposes
    const CLIENT_ID = HUBSPOT_CONFIG.CLIENT_ID;
    const CLIENT_SECRET = HUBSPOT_CONFIG.CLIENT_SECRET;
    const REDIRECT_URI = HUBSPOT_CONFIG.REDIRECT_URI;

    const tokenUrl = HUBSPOT_CONFIG.TOKEN_URL;
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code: code,
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Token exchange failed: ${errorData.error_description || errorData.error}`);
    }

    return await response.json();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          {status === 'loading' && (
            <Loader2 size={48} className="animate-spin text-blue-400 mx-auto mb-4" />
          )}
          {status === 'success' && (
            <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
          )}
          {status === 'error' && (
            <XCircle size={48} className="text-red-400 mx-auto mb-4" />
          )}
        </div>

        <h2 className="text-white text-xl font-semibold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          {status === 'loading' && 'Connecting to HubSpot...'}
          {status === 'success' && 'Successfully Connected!'}
          {status === 'error' && 'Connection Failed'}
        </h2>

        <p className="text-white/70 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {message}
        </p>

        {status === 'error' && (
          <button
            onClick={() => navigate('/')}
            className="mt-6 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm hover:bg-blue-500/30 transition-colors"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Return to App
          </button>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
