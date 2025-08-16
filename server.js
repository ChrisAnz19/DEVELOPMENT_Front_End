import express from 'express';
import crypto from 'crypto';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Integry credentials
const INTEGRY_APP_SECRET = 'ed47c9db-aa29-41b5-ad97-93e1f57b5ba0';

app.use(cors());
app.use(express.json());

// HubSpot OAuth token exchange endpoint
app.post('/api/hubspot/oauth/token', async (req, res) => {
  try {
    const { code, redirect_uri } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    const CLIENT_ID = process.env.HUBSPOT_CLIENT_ID;
    const CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET;

    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.error('❌ HubSpot OAuth credentials not configured');
      return res.status(500).json({ 
        error: 'HubSpot OAuth not configured on server. Please set HUBSPOT_CLIENT_ID and HUBSPOT_CLIENT_SECRET environment variables.' 
      });
    }

    console.log('🔄 Exchanging OAuth code for access token...');

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: redirect_uri,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('❌ HubSpot token exchange failed:', errorData);
      return res.status(400).json({ 
        error: 'Failed to exchange code for token',
        details: errorData 
      });
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ HubSpot OAuth token exchange successful');

    // Return token data to frontend
    res.json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
    });

  } catch (error) {
    console.error('❌ OAuth token exchange error:', error);
    res.status(500).json({ 
      error: 'Internal server error during token exchange',
      details: error.message 
    });
  }
});

// Generate HMAC hash for Integry authentication
app.post('/api/integry/hash', (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Generate HMAC SHA256 hash
    const hash = crypto
      .createHmac('sha256', INTEGRY_APP_SECRET)
      .update(userId)
      .digest('hex');

    res.json({ hash });
  } catch (error) {
    console.error('Error generating hash:', error);
    res.status(500).json({ error: 'Failed to generate hash' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
