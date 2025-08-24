// src/hooks/useSearchAnalytics.ts
import { useState } from 'react';
import { getAuthenticatedHeaders } from '../lib/userApi';

import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.USER_API_URL;

interface SearchActivity {
  id: string;
  user_id: string;
  search_query: string;
  search_type?: string;
  filters?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  description?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export const useSearchAnalytics = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logSearchActivity = async (searchData: {
    search_query: string;
    search_type?: string;
    filters?: any;
  }): Promise<SearchActivity> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/search-activities`, {
        method: 'POST',
        headers: getAuthenticatedHeaders(),
        body: JSON.stringify({
          ...searchData,
          ip_address: await getClientIP(),
          user_agent: navigator.userAgent,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to log search activity');
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

  const logUserActivity = async (activityData: {
    activity_type: string;
    description?: string;
  }): Promise<UserActivity> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user-activities`, {
        method: 'POST',
        headers: getAuthenticatedHeaders(),
        body: JSON.stringify({
          ...activityData,
          ip_address: await getClientIP(),
          user_agent: navigator.userAgent,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to log user activity');
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

  const getSearchActivities = async (): Promise<SearchActivity[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/search-activities`, {
        headers: getAuthenticatedHeaders(),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch search activities');
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

  return {
    logSearchActivity,
    logUserActivity,
    getSearchActivities,
    isLoading,
    error,
  };
};

// Helper function to get client IP (simplified)
const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
};