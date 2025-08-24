// src/hooks/useSearchApi.ts
import { useState } from 'react';
import { getAuthenticatedHeaders } from '../lib/userApi'; // Import auth helpers

import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.USER_API_URL;

interface SearchRecordRequest {
  request_id: string; // This will be the requestId from useKnowledgeGPT
  prompt: string;
  filters?: any; // Can be more specific if needed
}

export interface SearchRecordResponse {
  id: number; // The new API's search ID
  request_id: string;
  status: "processing" | "completed" | "failed";
  prompt: string;
  filters?: any;
  created_at: string;
  completed_at?: string;
}

interface PersonRecordRequest {
  name: string;
  title: string;
  company: string;
  email?: string;
  linkedin_url?: string;
  profile_photo_url?: string;
  location?: string;
  accuracy?: number;
  reasons?: string[];
  linkedin_profile?: any;
  linkedin_posts?: any; // Not directly available in Candidate, will be omitted if not provided
  behavioral_data?: any;
}

export interface PersonRecordResponse {
  id: number;
  search_id: number;
  name: string;
  title: string;
  company: string;
  email?: string;
  created_at: string;
  // ... other fields from the API response
}

export const useSearchApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSearchRecord = async (searchData: SearchRecordRequest): Promise<SearchRecordResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/search/create`, {
        method: 'POST',
        headers: getAuthenticatedHeaders(),
        body: JSON.stringify(searchData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create search record');
      }
      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const addPersonToSearchRecord = async (searchId: number, personData: PersonRecordRequest): Promise<PersonRecordResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/search/${searchId}/people`, {
        method: 'POST',
        headers: getAuthenticatedHeaders(),
        body: JSON.stringify(personData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add person to search record');
      }
      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { createSearchRecord, addPersonToSearchRecord, isLoading, error };
};