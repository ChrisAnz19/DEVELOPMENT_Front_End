# 🔐 HubSpot OAuth Setup Instructions

## 📋 Quick Setup (5 minutes)

### 1. **Get HubSpot OAuth Credentials**
1. **Go to**: https://developers.hubspot.com/
2. **Find your app**: App ID `15225474`
3. **Navigate to**: Auth tab
4. **Copy**:
   - Client ID
   - Client Secret

### 2. **Configure Environment Variables**

#### **Frontend (.env):**
```bash
REACT_APP_HUBSPOT_CLIENT_ID=your_client_id_here
```

#### **Backend (.env or environment):**
```bash
HUBSPOT_CLIENT_ID=your_client_id_here
HUBSPOT_CLIENT_SECRET=your_client_secret_here
```

### 3. **Update HubSpot App Redirect URIs**
In your HubSpot app settings, add these redirect URIs:
- `http://localhost:5173/oauth/hubspot/callback` (development)
- `https://yourdomain.com/oauth/hubspot/callback` (production)

### 4. **Test OAuth Flow**
1. **Start your servers**:
   ```bash
   npm run dev        # Frontend (port 5173)
   node server.js     # Backend (port 3001)
   ```
2. **Open app**: http://localhost:5173
3. **Click**: "Connect HubSpot" in Integrations
4. **Authorize**: Complete OAuth in popup
5. **Verify**: Integration shows as "Connected"

## 🎯 **How It Works**

### **OAuth Flow:**
1. **User clicks "Connect HubSpot"** → Opens OAuth popup
2. **Popup redirects to HubSpot** → User authorizes
3. **HubSpot redirects back** → With authorization code
4. **Backend exchanges code** → For access token
5. **Token stored in localStorage** → Integration connected!

### **Contact Sync:**
1. **User searches candidates** → Gets results with behavioral data
2. **Clicks "Push to HubSpot"** → Sends to Prismatic webhook
3. **Prismatic processes** → Creates contacts with analytics
4. **Real OAuth tokens used** → No more test user!

## 🔍 **Verification**

### **Check OAuth Status:**
```javascript
// In browser console
console.log('Access token:', localStorage.getItem('hubspot_access_token'));
```

### **Check Prismatic Logs:**
- Go to Prismatic dashboard
- Check instance logs
- Should see real user tokens (not test user)

### **Test Contact Creation:**
- Use the "Test Integration" button
- Check your HubSpot CRM for new contacts
- Verify behavioral analytics are included

## 🚨 **Troubleshooting**

### **"Client ID not configured" Error:**
- Ensure `REACT_APP_HUBSPOT_CLIENT_ID` is set in frontend
- Restart your dev server after adding environment variables

### **"Failed to exchange code for token" Error:**
- Check `HUBSPOT_CLIENT_ID` and `HUBSPOT_CLIENT_SECRET` on backend
- Verify credentials are correct in HubSpot app
- Ensure redirect URI is added to HubSpot app

### **"Popup blocked" Error:**
- Allow popups for your domain
- Try clicking directly on the "Connect HubSpot" button

### **Still seeing "test user" in Prismatic:**
- Clear localStorage: `localStorage.clear()`
- Complete OAuth flow again
- Check that real tokens are being sent to Prismatic

## 🎉 **Success Indicators**

✅ **OAuth popup opens and redirects to HubSpot**  
✅ **User can authorize the app**  
✅ **Popup closes automatically after auth**  
✅ **Integration shows "Connected" status**  
✅ **Real tokens visible in Prismatic logs**  
✅ **Contacts created with user's HubSpot account**  

**Your direct OAuth flow is now working!** 🚀
