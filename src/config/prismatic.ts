// Prismatic Integration Configuration
// Replace this URL with your actual Prismatic webhook URL after deployment

export const PRISMATIC_CONFIG = {
  // Prismatic webhook URL for HubSpot integration
  WEBHOOK_URL: 'https://hooks.prismatic.io/trigger/SW5zdGFuY2VGbG93Q29uZmlnOjFhYWEyYWJkLWFkNTktNDI3Yi05MjM3LWQzMDE2MGVjMzUzNA==',
  
  // Integration settings
  INTEGRATION_NAME: 'Knowledge GPT HubSpot Integration',
  VERSION: '1.0.0',
  
  // For development/testing
  DEBUG_MODE: import.meta.env.MODE === 'development',
};

// Validation helper
export const isPrismaticConfigured = (): boolean => {
  return PRISMATIC_CONFIG.WEBHOOK_URL !== 'YOUR_PRISMATIC_WEBHOOK_URL_HERE';
};

// Instructions for setup
export const SETUP_INSTRUCTIONS = `
🚀 Prismatic Setup Instructions:

1. Deploy your integration instance in Prismatic dashboard
2. Go to "Create HubSpot Contacts" flow
3. Copy the webhook URL (looks like: https://hooks.prismatic.io/trigger/...)
4. Update WEBHOOK_URL in src/config/prismatic.ts
5. Test the integration!

Current status: ${isPrismaticConfigured() ? '✅ Configured' : '❌ Not configured'}
`;
