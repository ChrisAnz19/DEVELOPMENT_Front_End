import { useState, useEffect } from 'react';

interface DemoSearchResponse {
  success: boolean;
  data: {
    search_query: string;
    category?: string;
    industry?: string;
    location?: string;
    writing_style?: string;
  };
  message: string;
}

import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.KNOWLEDGE_GPT_URL;

export const useDemoSearches = () => {
  const [currentSearch, setCurrentSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDemoSearch = async () => {
    try {
      setError(null);
      const url = `${API_BASE_URL}/api/demo/search-example`;
      console.log('Fetching from:', url);
      const response = await fetch(url);
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: DemoSearchResponse = await response.json();
      console.log('Received data:', data);
      
      if (data.success && data.data?.search_query) {
        console.log('Setting search to:', data.data.search_query);
        setCurrentSearch(data.data.search_query);
      } else {
        console.warn('Invalid data structure:', data);
        setCurrentSearch('Manufacturing CIOs researching cloud ERP solutions');
      }
      setIsLoading(false);
    } catch (err) {
      console.error('❌ Error fetching demo search:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch demo search');
      // Fallback to a default search example
      setCurrentSearch('Manufacturing CIOs researching cloud ERP solutions');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchDemoSearch();

    // Set up interval to fetch new search every 5 seconds
    const interval = setInterval(fetchDemoSearch, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  return {
    currentSearch,
    isLoading,
    error
  };
};
