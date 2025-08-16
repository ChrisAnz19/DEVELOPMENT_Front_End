# Knowledge GPT HubSpot Integration - Deployment Guide

## 🚀 Integration Overview

This Prismatic code-native integration receives candidate data from your Knowledge GPT app and creates corresponding HubSpot contacts with full behavioral analytics data.

### Features:
- ✅ Webhook-triggered contact creation
- ✅ Behavioral analytics (CMI, RBFS, IAS scores)
- ✅ Duplicate handling
- ✅ Comprehensive error handling
- ✅ Built-in testing capabilities

## 📋 Prerequisites

1. **Prismatic Account** - Sign up at https://prismatic.io
2. **HubSpot Account** - With API access
3. **HubSpot Private App** - For OAuth authentication

## 🔧 Deployment Steps

### Step 1: Set up Prismatic Account
```bash
# Install Prismatic CLI
npm install -g @prismatic-io/prism

# Login to Prismatic
prism login
```

### Step 2: Import the Integration
```bash
# From the integration directory
prism integrations:import --open
```

This will:
- Upload the integration to your Prismatic org
- Open the integration designer in your browser
- Allow you to configure and test the integration

### Step 3: Configure HubSpot App

#### Create HubSpot Private App:
1. Go to HubSpot Settings → Integrations → Private Apps
2. Create new private app: "Knowledge GPT Integration"
3. **Scopes needed:**
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`
   - `crm.lists.read` (optional)
   - `crm.lists.write` (optional)
4. Copy the **Access Token**

### Step 4: Deploy Integration Instance

In Prismatic designer:

#### Configuration Page 1: HubSpot Connection
- **HubSpot Access Token**: Paste your private app access token
- **HubSpot Refresh Token**: (Optional) Leave empty for private apps
- **HubSpot Hub ID**: (Optional) Your portal ID for debugging

#### Configuration Page 2: Integration Settings
- **Contact List ID**: (Optional) HubSpot list ID to add contacts to
- **Lead Source**: "Knowledge GPT Search" (default)
- **Enable Behavioral Analytics**: ✅ Yes
- **Debug Mode**: ✅ Yes (for initial testing)

### Step 5: Get Webhook URL

After deploying the instance:
1. Navigate to the "Create HubSpot Contacts" flow
2. Copy the **Webhook URL** (looks like: `https://hooks.prismatic.io/...`)
3. This is what you'll use in your frontend

## 🔗 Frontend Integration

Update your React app to use the new Prismatic webhook:

```typescript
// In src/hooks/useIntegry.ts or equivalent
const PRISMATIC_WEBHOOK_URL = 'https://hooks.prismatic.io/YOUR_WEBHOOK_URL_HERE';

const pushContactsToHubSpot = async (candidates: CandidateData[]) => {
  const response = await fetch(PRISMATIC_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ candidates }),
  });
  
  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.status}`);
  }
  
  return await response.json();
};
```

## 🧪 Testing

### Test with Sample Data
The integration includes a built-in test flow with your sample data:

1. In Prismatic designer, go to "Test HubSpot Integration" flow
2. Click "Test Flow" 
3. Check the logs for success/failure
4. Verify contacts appear in HubSpot

### Test with Live Data
1. Use the main webhook URL from your frontend
2. Send POST request with candidate data:

```json
{
  "candidates": [
    {
      "name": "John Smith",
      "title": "Chief Technology Officer",
      "company": "TechFlow Solutions",
      "email": "john.smith@techflow.com",
      "accuracy": 94,
      "reasons": ["Currently CTO at fast-growing SaaS company..."],
      "linkedin_url": "https://linkedin.com/in/johnsmith-cto",
      "location": "San Francisco, CA",
      "behavioral_data": {
        "behavioral_insight": "High-intent buyer actively researching solutions...",
        "scores": {
          "cmi": { "score": 87, "explanation": "Strong forward momentum..." },
          "rbfs": { "score": 72, "explanation": "Moderately risk-aware..." },
          "ias": { "score": 91, "explanation": "High identity alignment..." }
        }
      }
    }
  ]
}
```

## 📊 HubSpot Custom Properties

The integration will create these custom properties in HubSpot:

### Behavioral Analytics:
- `cmi_score` (Number)
- `cmi_explanation` (Text)
- `rbfs_score` (Number) 
- `rbfs_explanation` (Text)
- `ias_score` (Number)
- `ias_explanation` (Text)

### Search Data:
- `match_accuracy` (Number)
- `search_reasons` (Text)
- `behavioral_insight` (Text)

### Standard Fields:
- `firstname`, `lastname`, `email`, `company`, `jobtitle`
- `website` (LinkedIn URL)
- `city`, `state`
- `lifecyclestage` (lead)
- `hs_lead_status` (NEW)
- `lead_source` (Knowledge GPT Search)

## 🔍 Monitoring & Logs

### Prismatic Logs:
- View execution logs in Prismatic dashboard
- Monitor webhook calls and responses
- Track success/failure rates

### HubSpot Verification:
- Check Contacts → All Contacts
- Filter by Lead Source: "Knowledge GPT Search"
- Verify behavioral analytics data in contact properties

## 🚨 Troubleshooting

### Common Issues:

1. **401 Unauthorized**
   - Check HubSpot access token
   - Verify private app scopes

2. **Contact Already Exists**
   - Integration handles duplicates gracefully
   - Updates existing contacts with new data

3. **Custom Properties Missing**
   - HubSpot creates custom properties automatically
   - May take a few minutes to appear in UI

4. **Webhook Timeout**
   - Check Prismatic execution logs
   - Verify payload format matches expected structure

### Debug Mode:
Enable debug mode in integration settings for detailed logging.

## 📞 Support

- **Prismatic Documentation**: https://prismatic.io/docs/
- **HubSpot API Documentation**: https://developers.hubspot.com/docs/api/overview
- **Integration Logs**: Available in Prismatic dashboard

---

## 🎯 Next Steps After Deployment

1. **Deploy the integration instance** in Prismatic
2. **Copy the webhook URL** from the deployed flow
3. **Update your React frontend** to use the new webhook URL
4. **Test with sample data** to verify everything works
5. **Monitor the integration** through Prismatic dashboard

The integration is production-ready and will handle all your behavioral analytics data seamlessly! 🚀
