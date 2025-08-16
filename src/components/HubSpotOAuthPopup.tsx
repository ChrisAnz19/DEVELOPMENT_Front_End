import React, { useState, useEffect } from 'react';

interface HubSpotOAuthPopupProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: (tokenData: any) => void;
  onError: (error: string) => void;
}

const HubSpotOAuthPopup: React.FC<HubSpotOAuthPopupProps> = ({
  isVisible,
  onClose,
  onSuccess,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'auth' | 'connecting'>('auth');

  const HUBSPOT_CONFIG = {
    CLIENT_ID: import.meta.env.VITE_HUBSPOT_CLIENT_ID || '',
    REDIRECT_URI: `${window.location.origin}/oauth/hubspot/callback`,
    SCOPES: 'crm.objects.contacts.read crm.objects.contacts.write crm.lists.read crm.lists.write',
    APP_ID: '15225474'
  };

  const handleOAuthFlow = async () => {
    if (!HUBSPOT_CONFIG.CLIENT_ID) {
      onError('HubSpot Client ID not configured. Please set VITE_HUBSPOT_CLIENT_ID environment variable.');
      return;
    }

    setIsLoading(true);
    setStep('connecting');

    try {
      // Generate state for security
      const state = Math.random().toString(36).substring(7);
      localStorage.setItem('hubspot_oauth_state', state);

      // Build HubSpot OAuth URL
      const authUrl = new URL('https://app.hubspot.com/oauth/authorize');
      authUrl.searchParams.set('client_id', HUBSPOT_CONFIG.CLIENT_ID);
      authUrl.searchParams.set('scope', HUBSPOT_CONFIG.SCOPES);
      authUrl.searchParams.set('redirect_uri', HUBSPOT_CONFIG.REDIRECT_URI);
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('response_type', 'code');

      console.log('🚀 Opening HubSpot OAuth popup:', authUrl.toString());

      // Open popup window
      const popup = window.open(
        authUrl.toString(),
        'hubspot-oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Failed to open popup. Please allow popups for this site.');
      }

      // Listen for popup messages
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'HUBSPOT_OAUTH_SUCCESS') {
          console.log('✅ OAuth success received:', event.data);
          
          // Clean up
          window.removeEventListener('message', handleMessage);
          popup.close();
          
          // Store tokens
          const tokenData = event.data.tokenData;
          localStorage.setItem('hubspot_access_token', tokenData.access_token);
          if (tokenData.refresh_token) {
            localStorage.setItem('hubspot_refresh_token', tokenData.refresh_token);
          }
          
          setIsLoading(false);
          onSuccess(tokenData);
          onClose();
        } else if (event.data.type === 'HUBSPOT_OAUTH_ERROR') {
          console.error('❌ OAuth error received:', event.data);
          
          // Clean up
          window.removeEventListener('message', handleMessage);
          popup.close();
          
          setIsLoading(false);
          onError(event.data.error || 'OAuth authentication failed');
        }
      };

      window.addEventListener('message', handleMessage);

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          setIsLoading(false);
          setStep('auth');
        }
      }, 1000);

    } catch (error) {
      console.error('❌ OAuth flow error:', error);
      setIsLoading(false);
      setStep('auth');
      onError(error instanceof Error ? error.message : 'Failed to start OAuth flow');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl max-w-md w-full p-8 relative" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors duration-200"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Connect HubSpot
          </h2>
        </div>

        {step === 'auth' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <img 
                src="/hubspot.png" 
                alt="HubSpot" 
                className="w-10 h-10 rounded object-contain"
              />
              <div>
                <h3 className="font-semibold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  HubSpot CRM
                </h3>
                <p className="text-sm text-white/70" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Securely sync contacts and analytics
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-white mb-2">This integration will:</h4>
              <ul className="text-sm text-white/70 space-y-1">
                <li>• Create contacts in your HubSpot CRM</li>
                <li>• Add behavioral analytics data</li>
                <li>• Sync candidate search results</li>
                <li>• Update contact properties</li>
              </ul>
            </div>

            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-400">Secure OAuth Authentication</p>
                <p className="text-sm text-white/70">
                  You'll be redirected to HubSpot to securely authorize this connection.
                </p>
              </div>
            </div>

            <button
              onClick={handleOAuthFlow}
              disabled={isLoading}
              className="w-full bg-[#fb4b76] hover:bg-pink-600 disabled:bg-white/10 text-white font-semibold py-2 px-4 rounded-full transition-colors text-lg shadow-md"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Connect to HubSpot
            </button>
          </div>
        )}

        {step === 'connecting' && (
          <div className="space-y-4 text-center">
            <div className="mx-auto w-8 h-8 border-4 border-[#fb4b76] border-t-transparent rounded-full animate-spin mb-2"></div>
            <h3 className="font-semibold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Connecting to HubSpot...
            </h3>
            <p className="text-sm text-white/70 mt-1">
              Please complete the authorization in the popup window
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HubSpotOAuthPopup;
