import React, { useState, useEffect } from 'react';
import { X, Settings, Check, ExternalLink, Loader2 } from 'lucide-react';
import { usePrismatic } from '../hooks/usePrismatic';
import { useAuth } from '../context/AuthContext';
import HubSpotOAuthPopup from './HubSpotOAuthPopup';

interface IntegrationsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const IntegrationsModal: React.FC<IntegrationsModalProps> = ({ isVisible, onClose }) => {
  const { currentUser } = useAuth();
  const {
    hubspot,
    testHubSpotIntegration,
  } = usePrismatic();
  
  const [testResult, setTestResult] = useState<string>('');
  const [showOAuthPopup, setShowOAuthPopup] = useState(false);

  const integrations = [
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'Sync contacts and leads automatically to your HubSpot CRM',
      isConnected: hubspot.isConnected,
      isLoading: hubspot.isLoading,
      logo: '/hubspot.png',
      connect: hubspot.connect,
      disconnect: hubspot.disconnect,
      error: hubspot.error,
    }
  ];

  const handleConnect = async (integration: any) => {
    if (integration.isConnected) {
      // Disconnect
      await integration.disconnect();
    } else {
      // Show OAuth popup for HubSpot
      if (integration.id === 'hubspot') {
        setShowOAuthPopup(true);
      } else {
        // For other integrations, use the original connect method
        await integration.connect();
      }
    }
  };

  const handleOAuthSuccess = (tokenData: any) => {
    console.log('✅ OAuth success in modal:', tokenData);
    setShowOAuthPopup(false);
    
    // Update hubspot status to connected
    // This will be handled by the usePrismatic hook automatically
    // when it detects the stored access token
  };

  const handleOAuthError = (error: string) => {
    console.error('❌ OAuth error in modal:', error);
    setShowOAuthPopup(false);
    // Error handling is managed by the usePrismatic hook
  };

  const handleTestHubSpot = async () => {
    try {
      setTestResult('Testing Prismatic HubSpot integration...');
      const result = await testHubSpotIntegration();
      
      if (result.success) {
        setTestResult(`✅ Success! Pushed ${result.count} test contacts via Prismatic. Check your HubSpot dashboard!`);
      } else {
        setTestResult(`❌ Test failed: ${result.error || 'Unknown error'}`);
      }
      
      console.log('🎯 Prismatic test result:', result);
    } catch (error) {
      console.error('❌ Prismatic test failed:', error);
      setTestResult(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl max-w-3xl w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <Settings size={24} className="text-white" />
            <h2 className="text-white text-xl font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Integrations
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-white/70 text-sm mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Connect your favorite tools to streamline your workflow
          </p>

          {/* Prismatic integration ready box removed */}


          <div className="space-y-4">
            {integrations.map((integration) => (
              <div 
                key={integration.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-3 flex-1 mr-4">
                    <div className="w-16 h-16 flex items-center justify-center">
                      <img 
                        src={integration.logo} 
                        alt={`${integration.name} logo`} 
                        className={`object-contain ${
                          integration.id === 'hubspot' ? 'w-9 h-9' : 'w-14 h-14'
                        }`} 
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-white font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {integration.name}
                        </h3>
                        {integration.isConnected && (
                          <div className="flex items-center space-x-1 bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                            <Check size={12} />
                            <span className="text-xs font-medium">Connected</span>
                          </div>
                        )}
                      </div>
                      <p className="text-white/60 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {integration.description}
                      </p>
                      {integration.error && (
                        <p className="text-red-400 text-xs mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {integration.error}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleConnect(integration)}
                    disabled={integration.isLoading}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      integration.isConnected
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                    }`}
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {integration.isLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>{integration.isConnected ? 'Disconnecting...' : 'Connecting...'}</span>
                      </>
                    ) : integration.isConnected ? (
                      <span>Disconnect</span>
                    ) : (
                      <>
                        <span>Connect</span>
                        <ExternalLink size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Test Section */}
          {hubspot.isConnected && (
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-blue-400 font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Test HubSpot Integration
                </h4>
                <button
                  onClick={handleTestHubSpot}
                  className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm hover:bg-blue-500/30 transition-colors"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Test Now
                </button>
              </div>
              <p className="text-blue-400/70 text-xs mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Push sample contacts with behavioral analytics to verify the integration
              </p>
              {testResult && (
                <div className="mt-2 p-2 bg-white/5 rounded text-xs text-white/90" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {testResult}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-white/50 text-xs text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
              More integrations coming soon
            </p>
          </div>
        </div>
      </div>

      {/* HubSpot OAuth Popup */}
      <HubSpotOAuthPopup
        isVisible={showOAuthPopup}
        onClose={() => setShowOAuthPopup(false)}
        onSuccess={handleOAuthSuccess}
        onError={handleOAuthError}
      />
    </div>
  );
};

export default IntegrationsModal;
