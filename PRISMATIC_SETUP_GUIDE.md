# 🚀 Prismatic HubSpot OAuth Setup Guide

## Current Status
- ✅ **Integration Created**: Knowledge GPT HubSpot Integration (v1.0.1)
- ✅ **Customer Created**: Knowledge GPT
- ❌ **Instance Missing**: Need to create and configure instance
- ❌ **OAuth Not Configured**: Need HubSpot credentials

## 📋 Step-by-Step Setup

### 1. **Go to Prismatic Dashboard**
Visit: https://app.prismatic.io

### 2. **Create Integration Instance**
1. Navigate to **Integrations** → **Knowledge GPT HubSpot Integration**
2. Click **"Create Instance"**
3. Fill out:
   - **Customer**: Knowledge GPT
   - **Name**: Production HubSpot Integration
   - **Description**: Production instance for HubSpot contact sync

### 3. **Configure HubSpot OAuth Connection**
In the instance configuration:

#### **HubSpot Connection Settings:**
- **HubSpot App ID**: `15225474` *(pre-filled)*
- **HubSpot Client ID**: *[Get from Step 4]*
- **HubSpot Client Secret**: *[Get from Step 4]*
- **Authorization URL**: `https://app.hubspot.com/oauth/authorize` *(pre-filled)*
- **Token URL**: `https://api.hubapi.com/oauth/v1/token` *(pre-filled)*
- **Scopes**: `crm.objects.contacts.read crm.objects.contacts.write crm.lists.read crm.lists.write` *(pre-filled)*

### 4. **Get HubSpot OAuth Credentials**
1. Go to **HubSpot Developer Portal**: https://developers.hubspot.com/
2. Find your app with **App ID: 15225474**
3. Navigate to **Auth** tab
4. Copy:
   - **Client ID** → Paste into Prismatic
   - **Client Secret** → Paste into Prismatic

### 5. **Deploy the Instance**
1. Click **"Save & Deploy"** in Prismatic
2. Wait for deployment to complete
3. Note the instance status should show **"Active"**

### 6. **Get OAuth URL**
After deployment:
1. Go to the deployed instance
2. Find the **OAuth Authorization URL**
3. Copy the full URL (should look like: `https://app.prismatic.io/oauth/authorize?instance=...`)

### 7. **Configure Frontend**
In your browser console, run:
```javascript
localStorage.setItem('prismatic_instance_oauth_url', 'YOUR_OAUTH_URL_FROM_STEP_6');
```

### 8. **Test OAuth Flow**
1. Click **"Connect HubSpot"** in your app
2. You should be redirected to HubSpot OAuth
3. After authorization, you'll be redirected back
4. The integration should show as **"Connected"**

## 🔍 **Troubleshooting**

### **"Prismatic instance not configured" Error**
- Complete steps 1-7 above
- Ensure OAuth URL is stored in localStorage

### **"Still logged in as test user" in Prismatic Logs**
- This happens when OAuth URL is not configured
- The app falls back to simulated connection
- Follow steps 6-7 to fix

### **OAuth Redirect Issues**
- Verify HubSpot app redirect URIs include your domain
- Check that Client ID/Secret are correct
- Ensure instance is deployed and active

## 📊 **Verification Steps**

### **Check Integration Status:**
```javascript
// In browser console
console.log('OAuth URL:', localStorage.getItem('prismatic_instance_oauth_url'));
```

### **Check HubSpot Connection:**
- Go to Prismatic instance logs
- Look for successful OAuth token exchange
- Verify API calls are authenticated with real tokens

### **Test Contact Creation:**
Use the test button in the integrations modal to verify end-to-end functionality.

---

## 🎯 **Next Steps After Setup**
1. **Production Deployment**: Move instance to production environment
2. **Webhook Configuration**: Update webhook URL in frontend config
3. **User Management**: Set up proper customer/user mapping
4. **Monitoring**: Configure alerts and logging

**Your OAuth flow will work properly once these steps are completed!** 🚀
