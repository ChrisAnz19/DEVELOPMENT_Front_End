# Frontend Integration with Prismatic HubSpot Integration

## 🎯 Overview

The frontend has been updated to use the new Prismatic HubSpot integration instead of Integry. This provides a more robust, scalable, and OAuth-enabled integration.

## 🔄 Changes Made

### ✅ **New Files Created:**
- **`src/hooks/usePrismatic.ts`** - New hook for Prismatic integration
- **`src/config/prismatic.ts`** - Configuration file for webhook URL

### ✅ **Updated Files:**
- **`src/components/SearchResults.tsx`** - Updated to use Prismatic hook
- **`src/components/IntegrationsModal.tsx`** - Updated to use Prismatic hook

### ✅ **Key Features:**
- **Proper Payload Structure** - Matches Prismatic flow expectations
- **Configuration Management** - Centralized webhook URL configuration
- **Error Handling** - Clear setup instructions and validation
- **Testing Support** - Built-in test functionality with sample data

## 🚀 Setup Instructions

### **Step 1: Deploy Prismatic Integration**
1. Complete the HubSpot OAuth setup (follow `HUBSPOT_OAUTH_SETUP.md`)
2. Deploy your integration instance in Prismatic
3. Get the webhook URL from the "Create HubSpot Contacts" flow

### **Step 2: Configure Frontend**
1. Open `src/config/prismatic.ts`
2. Replace `YOUR_PRISMATIC_WEBHOOK_URL_HERE` with your actual webhook URL:

```typescript
export const PRISMATIC_CONFIG = {
  WEBHOOK_URL: 'https://hooks.prismatic.io/trigger/YOUR_ACTUAL_WEBHOOK_ID',
  // ... rest of config
};
```

### **Step 3: Test Integration**
1. Run your app: `npm run dev`
2. Go to Integrations modal
3. Click "Test Now" for HubSpot integration
4. Verify contacts appear in HubSpot with behavioral analytics

## 📊 Payload Structure

The frontend now sends the correct payload structure that matches your Prismatic flow:

```json
{
  "candidates": [
    {
      "name": "John Smith",
      "title": "Chief Technology Officer",
      "company": "TechFlow Solutions", 
      "email": "john.smith@techflow.com",
      "accuracy": 94,
      "reasons": [
        "Currently CTO at a fast-growing SaaS company...",
        "Recently posted about cybersecurity challenges..."
      ],
      "linkedin_url": "https://linkedin.com/in/johnsmith-cto",
      "profile_photo_url": "https://media.licdn.com/profile/john-smith.jpg",
      "location": "San Francisco, CA",
      "behavioral_data": {
        "behavioral_insight": "High-intent buyer actively researching solutions...",
        "scores": {
          "cmi": {
            "score": 87,
            "explanation": "Strong forward momentum - actively engaging..."
          },
          "rbfs": {
            "score": 72, 
            "explanation": "Moderately risk-aware - balances security needs..."
          },
          "ias": {
            "score": 91,
            "explanation": "High identity alignment - sees cybersecurity as core..."
          }
        }
      }
    }
  ]
}
```

## 🔧 Integration Flow

### **User Experience:**
1. **User runs search** in Knowledge GPT
2. **Results appear** with behavioral analytics
3. **User clicks "Push to HubSpot"**
4. **Frontend sends payload** to Prismatic webhook
5. **Prismatic processes** candidates and creates HubSpot contacts
6. **User sees success message** and contacts appear in HubSpot

### **Technical Flow:**
```
Knowledge GPT Frontend
        ↓ (HTTP POST)
Prismatic Webhook Trigger
        ↓ (processes payload)
HubSpot Contact Creation
        ↓ (OAuth authenticated)
HubSpot CRM with Behavioral Analytics
```

## 🧪 Testing

### **Built-in Test Function:**
The integration includes a test function with your exact sample data:

```typescript
// In usePrismatic.ts
const testHubSpotIntegration = async () => {
  const sampleData = [/* John Smith & Sarah Johnson data */];
  return await pushContactsToHubSpot(sampleData);
};
```

### **Manual Testing:**
1. Use the Integrations modal test button
2. Check console logs for detailed execution info
3. Verify contacts in HubSpot dashboard
4. Check behavioral analytics custom properties

## 🔍 Debugging

### **Configuration Issues:**
- Check `src/config/prismatic.ts` for correct webhook URL
- Verify Prismatic integration is deployed and active
- Ensure HubSpot OAuth is properly configured

### **Payload Issues:**
- Check browser console for payload logs
- Verify candidate data structure matches expected format
- Test with sample data first

### **HubSpot Issues:**
- Check Prismatic execution logs in dashboard
- Verify OAuth token is valid and has proper scopes
- Check HubSpot for custom properties creation

## 📋 Migration Checklist

- [x] Created new Prismatic hook (`usePrismatic.ts`)
- [x] Updated SearchResults component
- [x] Updated IntegrationsModal component  
- [x] Created configuration file (`prismatic.ts`)
- [x] Verified payload structure matches Prismatic flow
- [x] Added proper error handling and validation
- [x] Included test functionality with sample data
- [ ] **Configure webhook URL** (after Prismatic deployment)
- [ ] **Test end-to-end integration**
- [ ] **Verify HubSpot contact creation with behavioral analytics**

## 🎯 Next Steps

1. **Deploy Prismatic Integration** (if not already done)
2. **Configure webhook URL** in `src/config/prismatic.ts`
3. **Test the integration** end-to-end
4. **Remove old Integry code** (optional cleanup)

## 💡 Benefits of Prismatic Integration

- ✅ **OAuth Support** - Customers can connect their own HubSpot
- ✅ **Professional Architecture** - Enterprise-grade integration platform
- ✅ **Better Error Handling** - Comprehensive logging and debugging
- ✅ **Scalability** - Supports unlimited customer accounts
- ✅ **Monitoring** - Built-in execution logs and metrics
- ✅ **Maintenance** - Automatic token refresh and error recovery

---

**Your frontend is now ready for the Prismatic HubSpot integration! 🚀**

Just configure the webhook URL and test the integration to complete the setup.
