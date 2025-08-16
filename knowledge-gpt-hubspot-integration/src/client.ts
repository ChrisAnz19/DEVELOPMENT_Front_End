/**
 * HubSpot API client for creating and managing contacts with behavioral analytics data.
 * This client handles OAuth authentication and provides methods for contact operations.
 */

import { type Connection, util } from "@prismatic-io/spectral";
import { createClient } from "@prismatic-io/spectral/dist/clients/http";

export interface HubSpotContact {
  email: string;
  firstname: string;
  lastname: string;
  company?: string;
  jobtitle?: string;
  website?: string;
  city?: string;
  state?: string;
  lifecyclestage?: string;
  hs_lead_status?: string;
  lead_source?: string;
  hs_analytics_source?: string;
  // Behavioral Analytics Custom Properties
  cmi_score?: number;
  cmi_explanation?: string;
  rbfs_score?: number;
  rbfs_explanation?: string;
  ias_score?: number;
  ias_explanation?: string;
  match_accuracy?: number;
  search_reasons?: string;
  behavioral_insight?: string;
  notes_last_contacted?: string;
  notes_last_activity?: string;
}

export interface CandidateData {
  name: string;
  title: string;
  company: string;
  email: string;
  accuracy: number;
  reasons: string[];
  linkedin_url?: string;
  profile_photo_url?: string;
  location?: string;
  behavioral_data?: {
    behavioral_insight: string;
    scores: {
      cmi: { score: number; explanation: string };
      rbfs: { score: number; explanation: string };
      ias: { score: number; explanation: string };
    };
  };
}

export function createHubSpotClient(hubspotConnection: Connection) {
  // For OAuth connections, Prismatic automatically handles token refresh
  // and provides the current access token via the token field
  const accessToken = hubspotConnection.token?.access_token || hubspotConnection.fields.accessToken;
  const appId = hubspotConnection.fields.appId || "15225474";

  if (!accessToken) {
    throw new Error("No HubSpot access token available. Please ensure the OAuth connection is properly configured.");
  }

  return createClient({
    baseUrl: "https://api.hubapi.com",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${util.types.toString(accessToken)}`,
      "X-HubSpot-App-Id": util.types.toString(appId),
    },
  });
}

export function transformCandidateToHubSpotContact(candidate: CandidateData): HubSpotContact {
  const nameParts = candidate.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  const locationParts = candidate.location?.split(',') || [];
  const city = locationParts[0]?.trim() || '';
  const state = locationParts[1]?.trim() || '';

  const contact: HubSpotContact = {
    email: candidate.email,
    firstname: firstName,
    lastname: lastName,
    company: candidate.company,
    jobtitle: candidate.title,
    website: candidate.linkedin_url,
    city,
    state,
    lifecyclestage: 'lead',
    hs_lead_status: 'NEW',
    lead_source: 'Knowledge GPT Search',
    hs_analytics_source: 'Knowledge GPT Search',
    match_accuracy: candidate.accuracy,
    search_reasons: candidate.reasons?.join(' | ') || '',
    behavioral_insight: candidate.behavioral_data?.behavioral_insight || '',
    notes_last_contacted: `AI Match: ${candidate.accuracy}% | Source: Knowledge GPT Search`,
    notes_last_activity: `Reasons: ${candidate.reasons?.slice(0, 2).join('; ') || 'None'}`,
  };

  // Add behavioral scores if available
  if (candidate.behavioral_data?.scores) {
    const { cmi, rbfs, ias } = candidate.behavioral_data.scores;
    
    contact.cmi_score = cmi?.score;
    contact.cmi_explanation = cmi?.explanation;
    contact.rbfs_score = rbfs?.score;
    contact.rbfs_explanation = rbfs?.explanation;
    contact.ias_score = ias?.score;
    contact.ias_explanation = ias?.explanation;
  }

  return contact;
}
