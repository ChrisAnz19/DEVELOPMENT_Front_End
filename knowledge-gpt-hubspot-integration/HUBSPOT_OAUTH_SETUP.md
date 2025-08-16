# HubSpot Public App Setup for OAuth Integration

## 🎯 Overview

Your Prismatic integration now supports OAuth for HubSpot public apps, allowing customers to securely connect their HubSpot accounts. This guide walks you through creating and configuring the HubSpot public app.

## 🚀 Step 1: Create HubSpot Public App

### Navigate to HubSpot Developer Portal
1. Go to **https://developers.hubspot.com/**
2. Sign in with your HubSpot account
3. Click **"Create app"** or go to **"Manage apps"** → **"Create app"**

### App Basic Information
- **App Name**: `Knowledge GPT Integration`
- **Description**: `AI-powered candidate search with behavioral analytics integration for HubSpot`
- **Logo**: Upload your Knowledge GPT logo
- **App URL**: Your Knowledge GPT website URL

## 🔐 Step 2: Configure OAuth Settings

### Auth Tab Configuration
1. **App URL**: `https://your-knowledge-gpt-domain.com`
2. **Redirect URLs**: 
   ```
   https://oauth.prismatic.io/callback
   ```
   ⚠️ **Important**: Use Prismatic's OAuth callback URL exactly as shown

### Required Scopes
Select these scopes for your app:
- ✅ `crm.objects.contacts.read` - Read contact data
- ✅ `crm.objects.contacts.write` - Create and update contacts
- ✅ `crm.lists.read` - Read contact lists (optional)
- ✅ `crm.lists.write` - Add contacts to lists (optional)
- ✅ `crm.schemas.contacts.read` - Read contact properties schema

### Optional Scopes (for future features)
- `crm.objects.companies.read` - Read company data
- `crm.objects.companies.write` - Create/update companies
- `crm.objects.deals.read` - Read deal data
- `crm.objects.deals.write` - Create/update deals

## 📋 Step 3: Get App Credentials

After creating your app:
1. Go to **"Auth"** tab
2. Copy the **Client ID**
3. Copy the **Client Secret**
4. **App ID** (also needed for some API calls)

## ⚙️ Step 4: Configure Prismatic Integration

### In Prismatic Dashboard:
1. Go to your **"Knowledge GPT HubSpot Integration"**
2. **Create/Edit Instance**
3. **HubSpot Connection** page:
   - **HubSpot Client ID**: Paste your app's Client ID
   - **HubSpot Client Secret**: Paste your app's Client Secret
   - **Authorization URL**: `https://app.hubspot.com/oauth/authorize` (default)
   - **Token URL**: `https://api.hubapi.com/oauth/v1/token` (default)
   - **Scopes**: `crm.objects.contacts.read crm.objects.contacts.write crm.lists.read crm.lists.write` (default)

### Integration Settings:
- **Contact List ID**: (Optional) Leave empty
- **Lead Source**: `Knowledge GPT Search`
- **Enable Behavioral Analytics**: ✅ True
- **Debug Mode**: ✅ True (for testing)

## 🧪 Step 5: Test OAuth Flow

### Test the Integration:
1. **Deploy the instance** in Prismatic
2. **Test the OAuth connection**:
   - Click "Test Connection" in Prismatic
   - You'll be redirected to HubSpot for authorization
   - Authorize the app for your HubSpot account
   - You should be redirected back to Prismatic with success

### Verify Webhook URL:
1. Go to **"Create HubSpot Contacts"** flow
2. Copy the **webhook URL**: `https://hooks.prismatic.io/trigger/[your-id]`
3. This is what you'll use in your frontend

## 🔧 Step 6: Update Your Frontend

Replace your current webhook URL with the new Prismatic URL:

```typescript
// In your React app (src/hooks/useIntegry.ts or equivalent)
const PRISMATIC_WEBHOOK_URL = 'https://hooks.prismatic.io/trigger/YOUR_WEBHOOK_ID_HERE';

const pushContactsToHubSpot = async (candidates: CandidateData[]) => {
  const response = await fetch(PRISMATIC_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ candidates }),
  });
  
  return await response.json();
};
```

## 📊 Step 7: HubSpot Custom Properties

The integration will automatically create these custom properties in HubSpot:

### Behavioral Analytics Properties:
- `cmi_score` (Number) - Current Market Intent score
- `cmi_explanation` (Text) - CMI score explanation
- `rbfs_score` (Number) - Risk-Based Fit Score
- `rbfs_explanation` (Text) - RBFS score explanation  
- `ias_score` (Number) - Identity Alignment Score
- `ias_explanation` (Text) - IAS score explanation

### Search & Match Properties:
- `match_accuracy` (Number) - AI match accuracy percentage
- `search_reasons` (Text) - Reasons for the match
- `behavioral_insight` (Text) - Overall behavioral insight

### Standard Properties:
- `firstname`, `lastname`, `email`, `company`, `jobtitle`
- `website` (LinkedIn URL)
- `city`, `state` (parsed from location)
- `lifecyclestage` = "lead"
- `hs_lead_status` = "NEW"
- `lead_source` = "Knowledge GPT Search"

## 🎯 Step 8: Customer Onboarding Flow

### For Your Customers:
1. **Customer signs up** for Knowledge GPT
2. **Customer goes to integrations** in your app
3. **Customer clicks "Connect HubSpot"**
4. **Customer is redirected** to HubSpot OAuth
5. **Customer authorizes** your app
6. **Customer is redirected back** to your app
7. **Integration is now active** for that customer

### OAuth URLs:
- **Authorization URL**: `https://app.hubspot.com/oauth/authorize?client_id=YOUR_CLIENT_ID&scope=crm.objects.contacts.read%20crm.objects.contacts.write&redirect_uri=https://oauth.prismatic.io/callback`

## 🔍 Step 9: Testing & Monitoring

### Test with Sample Data:
```bash
# Update webhook URL in test-webhook.js
node test-webhook.js
```

### Monitor in Prismatic:
- **Execution Logs**: View detailed logs of each webhook call
- **Error Tracking**: Monitor failed contact creations
- **Performance Metrics**: Track success rates and response times

### Monitor in HubSpot:
- **Contacts**: Filter by Lead Source = "Knowledge GPT Search"
- **Activity Timeline**: See when contacts were created
- **Custom Properties**: Verify behavioral analytics data

## 🚨 Troubleshooting

### Common OAuth Issues:

1. **"Invalid redirect_uri"**
   - Ensure redirect URI in HubSpot app matches: `https://oauth.prismatic.io/callback`

2. **"Invalid scope"**
   - Verify scopes in Prismatic match those configured in HubSpot app

3. **"Token expired"**
   - Prismatic automatically handles token refresh
   - Check OAuth connection status in Prismatic

4. **"Insufficient permissions"**
   - Ensure all required scopes are granted in HubSpot app

### Integration Issues:

1. **Contacts not appearing in HubSpot**
   - Check Prismatic execution logs
   - Verify OAuth connection is active
   - Check for API rate limiting

2. **Missing behavioral analytics data**
   - Verify custom properties were created in HubSpot
   - Check payload structure in logs

## 📞 Support Resources

- **HubSpot Developer Docs**: https://developers.hubspot.com/docs/api/overview
- **Prismatic Documentation**: https://prismatic.io/docs/
- **OAuth 2.0 Specification**: https://oauth.net/2/

---

## ✅ Checklist

- [ ] HubSpot public app created
- [ ] OAuth redirect URI configured
- [ ] Required scopes selected
- [ ] Client ID and Secret obtained
- [ ] Prismatic integration configured
- [ ] OAuth flow tested
- [ ] Webhook URL obtained
- [ ] Frontend updated with new webhook URL
- [ ] End-to-end testing completed

**Your OAuth-enabled HubSpot integration is now ready for production! 🎉**
