import { useState, useCallback, useEffect } from 'react';
import { PRISMATIC_CONFIG, isPrismaticConfigured, SETUP_INSTRUCTIONS } from '../config/prismatic';
import { HUBSPOT_CONFIG, isHubSpotConfigured } from '../config/hubspot';

export interface PrismaticIntegrationStatus {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface CandidateData {
  name: string;
  title: string;
  company: string;
  email: string;
  accuracy: number;
  reasons: string[];
  linkedin_url?: string;
  profile_photo_url?: string;
  location?: string;
  behavioral_data?: {
    behavioral_insight: string;
    scores: {
      cmi: { score: number; explanation: string };
      rbfs: { score: number; explanation: string };
      ias: { score: number; explanation: string };
    };
  };
}

export const usePrismatic = () => {
  // Check for actual OAuth tokens to determine connection status
  const checkOAuthConnection = () => {
    const accessToken = localStorage.getItem('hubspot_access_token');
    return !!(accessToken && isPrismaticConfigured());
  };

  const [hubspotStatus, setHubspotStatus] = useState<PrismaticIntegrationStatus>({
    isConnected: checkOAuthConnection(),
    isLoading: false,
    error: isPrismaticConfigured() ? null : 'Prismatic webhook URL not configured',
  });

  const [isPushingToHubSpot, setIsPushingToHubSpot] = useState(false);
  const [hubspotPushResult, setHubspotPushResult] = useState<string>('');

  // Check for OAuth tokens on mount and storage changes
  useEffect(() => {
    const updateConnectionStatus = () => {
      const isConnected = checkOAuthConnection();
      setHubspotStatus(prev => ({
        ...prev,
        isConnected,
        isLoading: false,
        error: isPrismaticConfigured() 
          ? (isConnected ? null : 'HubSpot not connected - click Connect to authorize')
          : 'Prismatic webhook URL not configured'
      }));
    };

    updateConnectionStatus();

    // Listen for storage changes (OAuth token updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'hubspot_access_token') {
        updateConnectionStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for localStorage changes in the same tab (for popup completion)
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key: string, value: string) {
      const result = originalSetItem.call(this, key, value);
      if (key === 'hubspot_access_token') {
        setTimeout(updateConnectionStatus, 100); // Small delay to ensure state updates
      }
      return result;
    };
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      localStorage.setItem = originalSetItem;
    };
  }, []);

  const pushContactsToHubSpot = useCallback(async (candidates: CandidateData[]) => {
    if (!isPrismaticConfigured()) {
      console.error(SETUP_INSTRUCTIONS);
      throw new Error('Prismatic webhook URL not configured. Check console for setup instructions.');
    }

    setIsPushingToHubSpot(true);
    setHubspotPushResult('');

    try {
      console.log('🚀 Pushing contacts to HubSpot via Prismatic:', candidates.length);
      console.log('📋 Full candidate data:', JSON.stringify(candidates, null, 2));

      // Create the payload structure that matches our Prismatic flow expectations
      const payload = {
        candidates: candidates.map(candidate => ({
          name: candidate.name,
          title: candidate.title,
          company: candidate.company,
          email: candidate.email,
          accuracy: candidate.accuracy,
          reasons: candidate.reasons || [],
          linkedin_url: candidate.linkedin_url,
          profile_photo_url: candidate.profile_photo_url,
          location: candidate.location,
          behavioral_data: candidate.behavioral_data ? {
            behavioral_insight: candidate.behavioral_data.behavioral_insight,
            scores: {
              cmi: {
                score: candidate.behavioral_data.scores?.cmi?.score || 0,
                explanation: candidate.behavioral_data.scores?.cmi?.explanation || ''
              },
              rbfs: {
                score: candidate.behavioral_data.scores?.rbfs?.score || 0,
                explanation: candidate.behavioral_data.scores?.rbfs?.explanation || ''
              },
              ias: {
                score: candidate.behavioral_data.scores?.ias?.score || 0,
                explanation: candidate.behavioral_data.scores?.ias?.explanation || ''
              }
            }
          } : undefined
        }))
      };

      console.log('📝 Prismatic webhook payload:', JSON.stringify(payload, null, 2));

      // Send to Prismatic webhook
      const response = await fetch(PRISMATIC_CONFIG.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 Prismatic webhook response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Prismatic webhook error:', errorText);
        throw new Error(`Webhook failed: ${response.status} - ${errorText}`);
      }

      // Handle response
      let result;
      const responseText = await response.text();
      console.log('📄 Raw Prismatic response:', responseText);

      if (responseText.trim()) {
        try {
          result = JSON.parse(responseText);
          console.log('✅ Parsed Prismatic response:', result);
        } catch (parseError) {
          console.log('✅ Non-JSON response (likely success):', responseText);
          result = { success: true, message: responseText };
        }
      } else {
        console.log('✅ Empty response - webhook executed successfully');
        result = { success: true, message: 'Contacts sent to HubSpot processing' };
      }

      const successMessage = `✅ Successfully pushed ${candidates.length} contact${candidates.length > 1 ? 's' : ''} to HubSpot!`;
      setHubspotPushResult(successMessage);
      
      console.log('🎯 Prismatic integration completed successfully');
      
      return {
        success: true,
        message: result.message || 'Contacts processed successfully',
        count: candidates.length,
        result
      };

    } catch (error) {
      console.error('❌ Failed to push contacts via Prismatic:', error);
      const errorMessage = `❌ Failed to push contacts: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setHubspotPushResult(errorMessage);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        count: 0
      };
    } finally {
      setIsPushingToHubSpot(false);
    }
  }, []);

  const testHubSpotIntegration = useCallback(async () => {
    const sampleData: CandidateData[] = [
      {
        name: "John Smith",
        title: "Chief Technology Officer",
        company: "TechFlow Solutions",
        email: "john.smith@techflow.com",
        accuracy: 94,
        reasons: [
          "Currently CTO at a fast-growing SaaS company with 500+ employees",
          "Recently posted about cybersecurity challenges on LinkedIn",
          "Company experienced a security incident 6 months ago according to news reports",
          "Has budget authority for technology infrastructure decisions",
          "Previously implemented security solutions at two other companies"
        ],
        linkedin_url: "https://linkedin.com/in/johnsmith-cto",
        profile_photo_url: "https://media.licdn.com/profile/john-smith.jpg",
        location: "San Francisco, CA",
        behavioral_data: {
          behavioral_insight: "High-intent buyer actively researching solutions with decision-making authority",
          scores: {
            cmi: {
              score: 87,
              explanation: "Strong forward momentum - actively engaging with security vendors and has allocated Q2 budget for cybersecurity improvements"
            },
            rbfs: {
              score: 72,
              explanation: "Moderately risk-aware - balances security needs with operational efficiency, prefers proven solutions over cutting-edge"
            },
            ias: {
              score: 91,
              explanation: "High identity alignment - sees cybersecurity as core to his role as technology leader and company protector"
            }
          }
        }
      },
      {
        name: "Sarah Johnson",
        title: "VP of Engineering",
        company: "CloudScale Inc",
        email: "sarah.johnson@cloudscale.com",
        accuracy: 89,
        reasons: [
          "VP Engineering at 200-person SaaS startup in high-growth phase",
          "Actively researching zero-trust security architectures based on recent blog posts",
          "Company just raised Series B funding with security compliance requirements",
          "Has technical decision-making authority for infrastructure choices",
          "Frequently speaks at conferences about secure development practices"
        ],
        linkedin_url: "https://linkedin.com/in/sarah-johnson-engineering",
        profile_photo_url: "https://media.licdn.com/profile/sarah-johnson.jpg",
        location: "Austin, TX",
        behavioral_data: {
          behavioral_insight: "Technical decision-maker with strong influence on security architecture choices",
          scores: {
            cmi: {
              score: 82,
              explanation: "Good momentum - has been researching solutions for 3 months and company has budget allocated for security initiatives"
            },
            rbfs: {
              score: 65,
              explanation: "Moderate risk sensitivity - focused on technical implementation challenges rather than business risks"
            },
            ias: {
              score: 88,
              explanation: "Strong alignment - views security as fundamental to engineering excellence and personal technical reputation"
            }
          }
        }
      }
    ];

    console.log('🧪 Starting Prismatic HubSpot integration test with sample data...');
    return await pushContactsToHubSpot(sampleData);
  }, [pushContactsToHubSpot]);

  return {
    hubspot: {
      ...hubspotStatus,
      connect: async () => {
        // Direct HubSpot OAuth flow - no Prismatic redirect needed
        console.log('🔗 Initiating direct HubSpot OAuth...');
        setHubspotStatus(prev => ({ ...prev, isLoading: true }));
        
        // This will be handled by the HubSpotOAuthPopup component
        // The connect function will be called from the IntegrationsModal
        // which will show the OAuth popup
        
        // For now, just set loading state - the popup will handle the actual OAuth
        return new Promise((resolve, reject) => {
          // This promise will be resolved by the popup's onSuccess/onError callbacks
          window.hubspotOAuthResolve = resolve;
          window.hubspotOAuthReject = reject;
        });
      },
      disconnect: async () => {
        // Real OAuth disconnection - remove stored tokens
        console.log('🔗 Disconnecting HubSpot OAuth...');
        setHubspotStatus(prev => ({ ...prev, isLoading: true }));
        
        // Remove stored OAuth tokens
        localStorage.removeItem('hubspot_access_token');
        localStorage.removeItem('hubspot_refresh_token');
        sessionStorage.removeItem('hubspot_oauth_state');
        
        setHubspotStatus(prev => ({ 
          ...prev, 
          isConnected: false, 
          isLoading: false,
          error: null 
        }));
        
        console.log('✅ HubSpot OAuth disconnected - tokens removed');
      },
    },
    pushContactsToHubSpot,
    testHubSpotIntegration,
    isPushingToHubSpot,
    hubspotPushResult,
  };
};
