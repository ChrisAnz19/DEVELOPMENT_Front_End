import { useState } from 'react';

// TypeScript interfaces based on API documentation
export interface SearchRequest {
  prompt: string;
  max_candidates?: number;
  include_linkedin?: boolean;
  include_posts?: boolean;
}

export interface Candidate {
  name: string;
  title: string;
  company: string;
  email?: string;
  accuracy: number; // 0-100
  reasons: string[];
  linkedin_url?: string;
  profile_photo_url?: string;
  location?: string;
  linkedin_profile?: {
    summary?: string;
    experience?: any[];
    education?: any[];
  };
  behavioral_data?: BehavioralData;
}

export interface BehavioralData {
  behavioral_insight: string;
  scores: {
    cmi: {
      score: number;
      explanation: string;
    };
    rbfs: {
      score: number;
      explanation: string;
    };
    ias: {
      score: number;
      explanation: string;
    };
  };
}

export interface SearchResponse {
  request_id: string;
  status: "processing" | "completed" | "failed";
  prompt: string;
  filters?: {
    person_filters: {
      person_titles?: string[];
      include_similar_titles?: boolean;
      person_seniorities?: string[];
      person_locations?: string[];
    };
    organization_filters: {
      q_organization_keyword_tags?: string[];
    };
    reasoning: string;
  };
  candidates?: Candidate[];
  estimated_count?: number;
  error?: string;
  created_at: string;
  completed_at?: string;
}

export interface UseKnowledgeGPT {
  createSearch: (prompt: string, maxCandidates?: number) => Promise<string>;
  getSearchResult: (requestId: string) => Promise<SearchResponse>;
  pollSearchResult: (requestId: string) => Promise<SearchResponse>;
  isLoading: boolean;
  error: string | null;
}

export const useKnowledgeGPT = (): UseKnowledgeGPT => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use the live API
  const API_BASE = 'https://knowledge-gpt-siuq.onrender.com';

  const createSearch = async (prompt: string, maxCandidates: number = 2): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          max_candidates: maxCandidates,
          include_linkedin: true,
          include_posts: false
        })
      });
      
      if (!response.ok) {
        // Try to get the response text first
        const responseText = await response.text();
        console.error('API Error Response Text:', responseText);
        
        // Try to parse as JSON
        let errorData = {};
        try {
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse error response as JSON:', parseError);
          errorData = { error: responseText || `HTTP error! status: ${response.status}` };
        }
        
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData,
          url: response.url,
          responseText: responseText
        });
        throw new Error(errorData.detail || errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.request_id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getSearchResult = async (requestId: string): Promise<SearchResponse> => {
    try {
      const response = await fetch(`${API_BASE}/api/search/${requestId}`);
      
      if (!response.ok) {
        // Try to get the response text first
        const responseText = await response.text();
        console.error('API Error Response Text:', responseText);
        
        // Try to parse as JSON
        let errorData = {};
        try {
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse error response as JSON:', parseError);
          errorData = { error: responseText || `HTTP error! status: ${response.status}` };
        }
        
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData,
          url: response.url,
          responseText: responseText
        });
        throw new Error(errorData.detail || errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get search result';
      setError(errorMessage);
      throw err;
    }
  };

  const pollSearchResult = async (requestId: string): Promise<SearchResponse> => {
    return new Promise((resolve, reject) => {
      let pollCount = 0;
      const maxPolls = 60; // Maximum 2 minutes of polling (60 * 2 seconds)
      
      const poll = async () => {
        try {
          pollCount++;
          
          if (pollCount > maxPolls) {
            reject(new Error('Search timeout - please try again'));
            return;
          }
          
          const result = await getSearchResult(requestId);
          
          if (result.status === 'completed') {
            resolve(result);
          } else if (result.status === 'failed') {
            reject(new Error(result.error || 'Search failed'));
          } else {
            // Still processing, poll again in 2 seconds
            setTimeout(poll, 2000);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      poll();
    });
  };

  return { createSearch, getSearchResult, pollSearchResult, isLoading, error };
};