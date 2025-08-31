import { useState, useEffect } from 'react';
import { API_CONFIG } from '../config/api';

export interface EvidenceStats {
  finder_status: 'available' | 'unavailable' | 'degraded';
  diversity_metrics: {
    total_domains: number;
    unique_sources: number;
    domain_coverage: number;
  };
  performance_metrics: {
    average_processing_time: number;
    success_rate: number;
    total_evidence_found: number;
    evidence_types_distribution: Record<string, number>;
  };
  last_updated: string;
}

export interface UseEvidenceStats {
  stats: EvidenceStats | null;
  isLoading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

export const useEvidenceStats = (): UseEvidenceStats => {
  const [stats, setStats] = useState<EvidenceStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching evidence stats from:', `${API_CONFIG.KNOWLEDGE_GPT_URL}/api/evidence/stats`);
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_CONFIG.KNOWLEDGE_GPT_URL}/api/evidence/stats`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const responseText = await response.text();
        let errorData = {};
        try {
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          errorData = { error: responseText || `HTTP error! status: ${response.status}` };
        }
        
        console.error('Evidence Stats API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData,
          url: response.url
        });
        throw new Error(errorData.detail || errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Evidence stats received:', data);
      setStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch evidence stats';
      console.error('❌ Error fetching evidence stats:', err);
      setError(errorMessage);
      
      // Set default stats to prevent crashes
      setStats({
        finder_status: 'unavailable',
        diversity_metrics: {
          total_domains: 0,
          unique_sources: 0,
          domain_coverage: 0
        },
        performance_metrics: {
          average_processing_time: 0,
          success_rate: 0,
          total_evidence_found: 0,
          evidence_types_distribution: {}
        },
        last_updated: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStats = async (): Promise<void> => {
    await fetchStats();
  };

  // Fetch stats on mount
  useEffect(() => {
    try {
      console.log('🚀 useEvidenceStats hook initializing...');
      fetchStats();
    } catch (error) {
      console.error('❌ Error initializing useEvidenceStats:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize evidence stats');
    }
  }, []);

  return {
    stats,
    isLoading,
    error,
    refreshStats
  };
};
