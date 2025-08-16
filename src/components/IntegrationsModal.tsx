import React, { useState } from 'react';
import { X, Settings, Check, ExternalLink } from 'lucide-react';

interface IntegrationsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  isConnected: boolean;
  logo: string;
  connectUrl?: string;
}

const IntegrationsModal: React.FC<IntegrationsModalProps> = ({ isVisible, onClose }) => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'Sync contacts and leads automatically to your HubSpot CRM',
      isConnected: false,
      logo: '🔶', // Using emoji for now, can be replaced with actual logos
      connectUrl: 'https://app.hubspot.com/oauth/authorize'
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Get notifications and updates directly in your Slack workspace',
      isConnected: false,
      logo: '💬',
      connectUrl: 'https://slack.com/oauth/v2/authorize'
    }
  ]);

  const toggleIntegration = (id: string) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === id 
          ? { ...integration, isConnected: !integration.isConnected }
          : integration
      )
    );
  };

  const handleConnect = (integration: Integration) => {
    if (integration.isConnected) {
      // Disconnect
      toggleIntegration(integration.id);
    } else {
      // Connect - in a real app, this would redirect to OAuth
      console.log(`Connecting to ${integration.name}...`);
      // For demo purposes, just toggle the connection
      toggleIntegration(integration.id);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl max-w-md w-full shadow-2xl">
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

          <div className="space-y-4">
            {integrations.map((integration) => (
              <div 
                key={integration.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="text-2xl">{integration.logo}</div>
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
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleConnect(integration)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      integration.isConnected
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                    }`}
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {integration.isConnected ? (
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

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-white/50 text-xs text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
              More integrations coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsModal;
