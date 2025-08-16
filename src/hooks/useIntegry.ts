import { useState, useEffect, useCallback } from 'react';
import { integryService } from '../lib/integryService';

export interface IntegrationStatus {
  isConnected: boolean;
  connectedAccounts: any[];
  isLoading: boolean;
  error: string | null;
}

export const useIntegry = (userId: string | null) => {
  // Temporarily hardcode the user ID for testing
  const effectiveUserId = userId || 'chris@knowledge.com';
  const [isInitialized, setIsInitialized] = useState(false);
  const [hubspotStatus, setHubspotStatus] = useState<IntegrationStatus>({
    isConnected: false,
    connectedAccounts: [],
    isLoading: false,
    error: null,
  });
  const [slackStatus, setSlackStatus] = useState<IntegrationStatus>({
    isConnected: false,
    connectedAccounts: [],
    isLoading: false,
    error: null,
  });

  // Initialize Integry SDK
  useEffect(() => {
    const initializeIntegry = async () => {
      console.log('🔧 Integry initialization attempt:', { userId, effectiveUserId, isInitialized });
      
      if (!effectiveUserId) {
        console.log('❌ No userId provided, skipping Integry initialization');
        return;
      }
      
      if (isInitialized) {
        console.log('✅ Integry already initialized');
        return;
      }

      try {
        console.log('🚀 Initializing Integry SDK...');
        await integryService.initialize(effectiveUserId);
        console.log('✅ Integry SDK initialized successfully');
        setIsInitialized(true);
        
        // Check initial connection status
        console.log('🔍 Checking initial connection status...');
        await checkConnectionStatus();
        
        // Set up event listeners
        integryService.onAppConnected(handleAppConnected);
        integryService.onAppDisconnected(handleAppDisconnected);
      } catch (error) {
        console.error('❌ Failed to initialize Integry:', error);
        // Set initialized to true anyway to stop the loading spinner
        setIsInitialized(true);
      }
    };

    initializeIntegry();
  }, [effectiveUserId, isInitialized]);

  const handleAppConnected = (data: any) => {
    if (data.name === 'hubspot') {
      setHubspotStatus(prev => ({
        ...prev,
        isConnected: true,
        connectedAccounts: data.connected_accounts || [],
        error: null,
      }));
    } else if (data.name === 'slack') {
      setSlackStatus(prev => ({
        ...prev,
        isConnected: true,
        connectedAccounts: data.connected_accounts || [],
        error: null,
      }));
    }
  };

  const handleAppDisconnected = (data: any) => {
    if (data.name === 'hubspot') {
      setHubspotStatus(prev => ({
        ...prev,
        isConnected: false,
        connectedAccounts: data.connected_accounts || [],
        error: null,
      }));
    } else if (data.name === 'slack') {
      setSlackStatus(prev => ({
        ...prev,
        isConnected: false,
        connectedAccounts: data.connected_accounts || [],
        error: null,
      }));
    }
  };

  const checkConnectionStatus = async () => {
    try {
      // Check HubSpot
      const hubspotConnected = await integryService.isAppConnected('hubspot');
      const hubspotAccounts = hubspotConnected ? await integryService.getConnectedAccounts('hubspot') : [];
      
      setHubspotStatus(prev => ({
        ...prev,
        isConnected: hubspotConnected,
        connectedAccounts: hubspotAccounts,
      }));

      // Check Slack
      const slackConnected = await integryService.isAppConnected('slack');
      const slackAccounts = slackConnected ? await integryService.getConnectedAccounts('slack') : [];
      
      setSlackStatus(prev => ({
        ...prev,
        isConnected: slackConnected,
        connectedAccounts: slackAccounts,
      }));
    } catch (error) {
      console.error('Failed to check connection status:', error);
    }
  };

  const connectHubSpot = useCallback(async () => {
    if (!isInitialized) return;

    setHubspotStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const connectedAccountId = await integryService.connectApp('hubspot');
      console.log('HubSpot connected with account ID:', connectedAccountId);
    } catch (error) {
      console.error('Failed to connect HubSpot:', error);
      setHubspotStatus(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      }));
    } finally {
      setHubspotStatus(prev => ({ ...prev, isLoading: false }));
    }
  }, [isInitialized]);

  const disconnectHubSpot = useCallback(async (connectedAccountId?: string) => {
    if (!isInitialized) return;

    setHubspotStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await integryService.disconnectApp('hubspot', connectedAccountId);
      console.log('HubSpot disconnected');
    } catch (error) {
      console.error('Failed to disconnect HubSpot:', error);
      setHubspotStatus(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Disconnection failed' 
      }));
    } finally {
      setHubspotStatus(prev => ({ ...prev, isLoading: false }));
    }
  }, [isInitialized]);

  const connectSlack = useCallback(async () => {
    if (!isInitialized) return;

    setSlackStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const connectedAccountId = await integryService.connectApp('slack');
      console.log('Slack connected with account ID:', connectedAccountId);
    } catch (error) {
      console.error('Failed to connect Slack:', error);
      setSlackStatus(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      }));
    } finally {
      setSlackStatus(prev => ({ ...prev, isLoading: false }));
    }
  }, [isInitialized]);

  const disconnectSlack = useCallback(async (connectedAccountId?: string) => {
    if (!isInitialized) return;

    setSlackStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await integryService.disconnectApp('slack', connectedAccountId);
      console.log('Slack disconnected');
    } catch (error) {
      console.error('Failed to disconnect Slack:', error);
      setSlackStatus(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Disconnection failed' 
      }));
    } finally {
      setSlackStatus(prev => ({ ...prev, isLoading: false }));
    }
  }, [isInitialized]);

  const pushContactsToHubSpot = useCallback(async (candidates: any[]) => {
    const results = [];
    const webhookUrl = 'https://us-central1-integry-app.cloudfunctions.net/webhook_entry/call/eac6a1ec-b23b-4968-a6e6-4e2f3eb2f4e9/int/233fc248-42ef-4c32-b1c1-b72b655cdb32/step/89f8bfa5-535b-46e2-8684-406d3bf453b0';
    
    for (const candidate of candidates) {
      try {
        console.log('🚀 Pushing contact to HubSpot via webhook:', candidate.name);
        console.log('📋 Full candidate data:', JSON.stringify(candidate, null, 2));
        
        // Extract behavioral scores safely
        const cmiScore = candidate.behavioral_data?.scores?.cmi?.score;
        const cmiExplanation = candidate.behavioral_data?.scores?.cmi?.explanation;
        const rbfsScore = candidate.behavioral_data?.scores?.rbfs?.score;
        const rbfsExplanation = candidate.behavioral_data?.scores?.rbfs?.explanation;
        const iasScore = candidate.behavioral_data?.scores?.ias?.score;
        const iasExplanation = candidate.behavioral_data?.scores?.ias?.explanation;
        const behavioralInsight = candidate.behavioral_data?.behavioral_insight;
        
        console.log('📊 Extracted behavioral data:', {
          cmiScore, cmiExplanation, rbfsScore, rbfsExplanation, 
          iasScore, iasExplanation, behavioralInsight
        });
        
        // Create optimized payload for HubSpot webhook
        const contactData = {
          email: candidate.email || '',
          first_name: candidate.name?.split(' ')[0] || '',
          last_name: candidate.name?.split(' ').slice(1).join(' ') || '',
          company: candidate.company || '',
          jobtitle: candidate.title || '',
          website: candidate.linkedin_url || '',
          city: candidate.location?.split(',')[0]?.trim() || '',
          state: candidate.location?.split(',')[1]?.trim() || '',
          
          // Behavioral Analytics - Core Scores
          cmi_score: cmiScore || 0,
          cmi_explanation: cmiExplanation || '',
          rbfs_score: rbfsScore || 0,
          rbfs_explanation: rbfsExplanation || '',
          ias_score: iasScore || 0,
          ias_explanation: iasExplanation || '',
          
          // Match and Search Data
          match_accuracy: candidate.accuracy || 0,
          search_reasons: candidate.reasons?.join(' | ') || '',
          behavioral_insight: behavioralInsight || '',
          
          // HubSpot Lifecycle Properties
          lifecyclestage: 'lead',
          hs_lead_status: 'NEW',
          lead_source: 'Knowledge GPT Search',
          hs_analytics_source: 'Knowledge GPT Search',
          
          // Additional Context
          profile_photo_url: candidate.profile_photo_url || '',
          linkedin_profile_url: candidate.linkedin_url || '',
          
          // Combined summary for notes
          notes_last_contacted: `AI Match: ${candidate.accuracy}% | CMI: ${cmiScore} | RBFS: ${rbfsScore} | IAS: ${iasScore}`,
          notes_last_activity: `Reasons: ${candidate.reasons?.slice(0, 2).join('; ') || 'None'}`,
        };
        
        console.log('📝 Optimized HubSpot payload:', JSON.stringify(contactData, null, 2));
        
        // Send to webhook
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(contactData),
        });
        
        console.log('📡 Webhook response status:', response.status);
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Webhook error response:', errorText);
          throw new Error(`Webhook failed: ${response.status} - ${errorText}`);
        }
        
        // Handle response
        let result;
        const responseText = await response.text();
        console.log('📄 Raw webhook response:', responseText);
        
        if (responseText.trim()) {
          try {
            result = JSON.parse(responseText);
            console.log('✅ Parsed HubSpot response:', result);
          } catch (parseError) {
            console.log('✅ Non-JSON response (likely success):', responseText);
            result = { success: true, message: responseText };
          }
        } else {
          console.log('✅ Empty response - webhook executed successfully');
          result = { success: true, message: 'Contact created in HubSpot' };
        }
        
        results.push({ 
          candidate: candidate.name, 
          email: candidate.email,
          result, 
          success: true 
        });
        
      } catch (error) {
        console.error(`❌ Failed to create contact for ${candidate.name}:`, error);
        results.push({ 
          candidate: candidate.name, 
          email: candidate.email,
          error: error instanceof Error ? error.message : String(error), 
          success: false 
        });
      }
    }
    
    console.log('🎯 Final HubSpot push results:', results);
    return results;
  }, []);

  // Test function using the provided sample data
  const testHubSpotIntegration = useCallback(async () => {
    const sampleData = [
      {
        "name": "John Smith",
        "title": "Chief Technology Officer",
        "company": "TechFlow Solutions",
        "email": "john.smith@techflow.com",
        "accuracy": 94,
        "reasons": [
          "Currently CTO at a fast-growing SaaS company with 500+ employees",
          "Recently posted about cybersecurity challenges on LinkedIn",
          "Company experienced a security incident 6 months ago according to news reports",
          "Has budget authority for technology infrastructure decisions",
          "Previously implemented security solutions at two other companies"
        ],
        "linkedin_url": "https://linkedin.com/in/johnsmith-cto",
        "profile_photo_url": "https://media.licdn.com/profile/john-smith.jpg",
        "location": "San Francisco, CA",
        "behavioral_data": {
          "behavioral_insight": "High-intent buyer actively researching solutions with decision-making authority",
          "scores": {
            "cmi": {
              "score": 87,
              "explanation": "Strong forward momentum - actively engaging with security vendors and has allocated Q2 budget for cybersecurity improvements"
            },
            "rbfs": {
              "score": 72,
              "explanation": "Moderately risk-aware - balances security needs with operational efficiency, prefers proven solutions over cutting-edge"
            },
            "ias": {
              "score": 91,
              "explanation": "High identity alignment - sees cybersecurity as core to his role as technology leader and company protector"
            }
          }
        }
      },
      {
        "name": "Sarah Johnson",
        "title": "VP of Engineering",
        "company": "CloudScale Inc",
        "email": "sarah.johnson@cloudscale.com",
        "accuracy": 89,
        "reasons": [
          "VP Engineering at 200-person SaaS startup in high-growth phase",
          "Actively researching zero-trust security architectures based on recent blog posts",
          "Company just raised Series B funding with security compliance requirements",
          "Has technical decision-making authority for infrastructure choices",
          "Frequently speaks at conferences about secure development practices"
        ],
        "linkedin_url": "https://linkedin.com/in/sarah-johnson-engineering",
        "profile_photo_url": "https://media.licdn.com/profile/sarah-johnson.jpg",
        "location": "Austin, TX",
        "behavioral_data": {
          "behavioral_insight": "Technical decision-maker with strong influence on security architecture choices",
          "scores": {
            "cmi": {
              "score": 82,
              "explanation": "Good momentum - has been researching solutions for 3 months and company has budget allocated for security initiatives"
            },
            "rbfs": {
              "score": 65,
              "explanation": "Moderate risk sensitivity - focused on technical implementation challenges rather than business risks"
            },
            "ias": {
              "score": 88,
              "explanation": "Strong alignment - views security as fundamental to engineering excellence and personal technical reputation"
            }
          }
        }
      }
    ];
    
    console.log('🧪 Starting HubSpot integration test with sample data...');
    return await pushContactsToHubSpot(sampleData);
  }, [pushContactsToHubSpot]);

  return {
    isInitialized,
    hubspot: {
      ...hubspotStatus,
      connect: connectHubSpot,
      disconnect: disconnectHubSpot,
    },
    slack: {
      ...slackStatus,
      connect: connectSlack,
      disconnect: disconnectSlack,
    },
    pushContactsToHubSpot,
    testHubSpotIntegration,
    checkConnectionStatus,
  };
};
