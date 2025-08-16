/**
 * Configuration wizard for the Knowledge GPT HubSpot Integration.
 * This wizard prompts customers to connect their HubSpot account via OAuth
 * and configure settings for behavioral analytics data sync.
 */

import {
  configPage,
  connectionConfigVar,
  configVar,
} from "@prismatic-io/spectral";

export const configPages = {
  "HubSpot Connection": configPage({
    elements: {
      "HubSpot OAuth Connection": connectionConfigVar({
        stableKey: "hubspot-oauth-connection",
        dataType: "connection",
        inputs: {
          appId: {
            label: "HubSpot App ID",
            placeholder: "15225474",
            type: "string",
            required: true,
            default: "15225474",
            comments: "Your HubSpot App ID (15225474). This identifies your specific HubSpot application.",
          },
          clientId: {
            label: "HubSpot Client ID",
            placeholder: "Enter your HubSpot public app client ID",
            type: "string",
            required: true,
            comments: "Client ID from your HubSpot public app. Get this from the Auth tab in your HubSpot app settings.",
          },
          clientSecret: {
            label: "HubSpot Client Secret",
            placeholder: "Enter your HubSpot public app client secret",
            type: "password",
            required: true,
            comments: "Client secret from your HubSpot public app settings. Keep this secure!",
          },
          authorizationUrl: {
            label: "Authorization URL",
            type: "string",
            required: true,
            default: "https://app.hubspot.com/oauth/authorize",
            comments: "HubSpot OAuth authorization endpoint.",
          },
          tokenUrl: {
            label: "Token URL", 
            type: "string",
            required: true,
            default: "https://api.hubapi.com/oauth/v1/token",
            comments: "HubSpot OAuth token endpoint.",
          },
          scopes: {
            label: "OAuth Scopes",
            type: "string",
            required: true,
            default: "crm.objects.contacts.read crm.objects.contacts.write crm.lists.read crm.lists.write",
            comments: "Space-separated list of HubSpot OAuth scopes.",
          },
        },
      }),
    },
  }),
  "Integration Settings": configPage({
    elements: {
      "Contact List ID": configVar({
        stableKey: "hubspot-contact-list-id",
        dataType: "string",
        required: false,
        defaultValue: "",
        description: "Optional: HubSpot contact list ID to add new contacts to",
        comments: "Leave empty to create contacts without adding to a specific list.",
      }),
      "Lead Source": configVar({
        stableKey: "default-lead-source",
        dataType: "string",
        required: false,
        defaultValue: "Knowledge GPT Search",
        description: "Default lead source for created contacts",
        comments: "This value will be set as the lead source for all contacts created via this integration.",
      }),
      "Enable Behavioral Analytics": configVar({
        stableKey: "enable-behavioral-analytics",
        dataType: "boolean",
        defaultValue: true,
        description: "Include behavioral analytics scores (CMI, RBFS, IAS) in HubSpot contacts",
      }),
      "Debug Mode": configVar({
        stableKey: "debug-mode",
        dataType: "boolean", 
        defaultValue: false,
        description: "Enable detailed logging for troubleshooting",
      }),
    },
  }),
};
