// src/hooks/useExclusions.ts
import { useState } from 'react';
import { getAuthenticatedHeaders } from '../lib/userApi';

const API_BASE_URL = 'https://user-database-api.onrender.com';

interface Exclusion {
  id: number;
  linkedin_url: string;
  created_at: string;
}

export const useExclusions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addExclusion = async (linkedinUrl: string): Promise<Exclusion> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/exclusions`, {
        method: 'POST',
        headers: getAuthenticatedHeaders(),
        body: JSON.stringify({ linkedin_url: linkedinUrl }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add exclusion');
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

  const removeExclusion = async (linkedinUrl: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/exclusions`, {
        method: 'DELETE',
        headers: getAuthenticatedHeaders(),
        body: JSON.stringify({ linkedin_url: linkedinUrl }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove exclusion');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getExclusions = async (): Promise<Exclusion[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/exclusions`, {
        headers: getAuthenticatedHeaders(),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch exclusions');
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
    addExclusion,
    removeExclusion,
    getExclusions,
    isLoading,
    error,
  };
};