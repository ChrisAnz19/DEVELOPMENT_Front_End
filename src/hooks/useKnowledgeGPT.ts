import { useState } from 'react';
import { API_CONFIG } from '../config/api';

// TypeScript interfaces based on API documentation
export interface SearchRequest {
  prompt: string;
  max_candidates?: number;
  include_linkedin?: boolean;
  include_posts?: boolean;
  // Evidence integration parameters
  include_evidence?: boolean;
  evidence_diversity_threshold?: number;
  evidence_confidence_threshold?: number;
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
  phone?: string;
  mobile?: string;
  linkedin_profile?: {
    summary?: string;
    experience?: any[];
    education?: any[];
    profile_picture?: string;
  };
  behavioral_data?: BehavioralData;
  validation_urls?: string[];
  
  // NEW EVIDENCE FIELDS
  evidence_urls?: EvidenceUrl[];
  evidence_summary?: string;
  evidence_confidence?: number;
  evidence_processing_time?: number;
}

export interface EvidenceUrl {
  url: string;
  title: string;
  description: string;
  evidence_type: string;
  relevance_score: number;
  confidence_level: 'high' | 'medium' | 'low';
  supporting_explanation: string;
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
  const API_BASE = API_CONFIG.KNOWLEDGE_GPT_URL;

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
          include_posts: false,
          // Evidence integration - enable by default
          include_evidence: true,
          evidence_diversity_threshold: 0.7, // Ensure diverse evidence sources
          evidence_confidence_threshold: 0.6  // Minimum confidence for evidence
        })
      });
      
      if (!response.ok) {
        // Try to get the response text first
        const responseText = await response.text();
        console.error('API Error Response Text:', responseText);
        
        // Try to parse as JSON
        let errorData: any = {};
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
        let errorData: any = {};
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
      
      // Debug logging for evidence data
      console.log('🔍 API Response Data:', {
        request_id: data.request_id,
        status: data.status,
        candidates_count: data.candidates?.length || 0,
        has_candidates: !!data.candidates
      });
      
      if (data.candidates && data.candidates.length > 0) {
        data.candidates.forEach((candidate: any, index: number) => {
          console.log(`🔍 Candidate ${index + 1} evidence data:`, {
            name: candidate.name,
            evidence_urls: candidate.evidence_urls,
            evidence_urls_count: candidate.evidence_urls?.length || 0,
            evidence_summary: candidate.evidence_summary,
            evidence_confidence: candidate.evidence_confidence,
            evidence_processing_time: candidate.evidence_processing_time
          });
        });
      }
      
      // Log the complete API response structure
      console.log('🔍 Complete API Response Structure:', {
        top_level_keys: Object.keys(data),
        has_evidence_field: 'evidence' in data,
        has_evidence_data: 'evidence_data' in data,
        has_evidence_urls: 'evidence_urls' in data,
        full_response: data
      });
      
      // Check if evidence data is stored separately and needs to be merged
      if (data.evidence && data.candidates) {
        console.log('🔍 Found separate evidence data, attempting to merge...');
        data.candidates.forEach((candidate: any, index: number) => {
          if (data.evidence[candidate.name] || data.evidence[candidate.email]) {
            const evidenceKey = data.evidence[candidate.name] || data.evidence[candidate.email];
            console.log(`🔍 Merging evidence for candidate ${index + 1}:`, evidenceKey);
            candidate.evidence_urls = evidenceKey.urls || evidenceKey.evidence_urls || [];
            candidate.evidence_summary = evidenceKey.summary || evidenceKey.evidence_summary;
            candidate.evidence_confidence = evidenceKey.confidence || evidenceKey.evidence_confidence;
          }
        });
      }

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