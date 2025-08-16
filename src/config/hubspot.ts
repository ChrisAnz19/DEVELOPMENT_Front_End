// HubSpot OAuth Configuration
// Replace these with your actual HubSpot public app credentials

export const HUBSPOT_CONFIG = {
  // HubSpot Public App (App ID: 15225474)
  // TODO: Replace with your actual credentials from HubSpot app Auth tab
  CLIENT_ID: import.meta.env.VITE_HUBSPOT_CLIENT_ID || 'YOUR_CLIENT_ID_HERE',
  CLIENT_SECRET: import.meta.env.VITE_HUBSPOT_CLIENT_SECRET || 'YOUR_CLIENT_SECRET_HERE', // WARNING: In production, this should be server-side only!
  
  // OAuth URLs
  AUTHORIZATION_URL: 'https://app.hubspot.com/oauth/authorize',
  TOKEN_URL: 'https://api.hubapi.com/oauth/v1/token',
  
  // OAuth Scopes
  SCOPES: [
    'crm.objects.contacts.read',
    'crm.objects.contacts.write',
    'crm.lists.read',
    'crm.lists.write',
  ].join(' '),
  
  // Redirect URI (automatically set based on current domain)
  get REDIRECT_URI() {
    return window.location.origin + '/oauth/hubspot/callback';
  },
};

// Validation helper
export const isHubSpotConfigured = (): boolean => {
  return HUBSPOT_CONFIG.CLIENT_ID !== 'YOUR_HUBSPOT_CLIENT_ID' &&
         HUBSPOT_CONFIG.CLIENT_SECRET !== 'YOUR_HUBSPOT_CLIENT_SECRET';
};

// Setup instructions
export const HUBSPOT_SETUP_INSTRUCTIONS = `
🔧 HubSpot OAuth Setup Instructions:

1. Create HubSpot Public App:
   - Go to https://developers.hubspot.com/
   - Create new public app: "Knowledge GPT Integration"
   
2. Configure OAuth:
   - Redirect URL: ${typeof window !== 'undefined' ? window.location.origin + '/oauth/hubspot/callback' : 'http://localhost:5175/oauth/hubspot/callback'}
   - Scopes: ${HUBSPOT_CONFIG.SCOPES}
   
3. Get Credentials:
   - Copy Client ID and Client Secret
   - Update src/config/hubspot.ts
   
4. Security Note:
   - In production, move CLIENT_SECRET to server-side
   - Use server-side token exchange for security

Current status: ${isHubSpotConfigured() ? '✅ Configured' : '❌ Not configured'}
`;

console.log(HUBSPOT_SETUP_INSTRUCTIONS);
