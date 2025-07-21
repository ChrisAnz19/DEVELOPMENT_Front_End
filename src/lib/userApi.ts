// src/lib/userApi.ts
const API_BASE_URL = 'https://user-database-api.onrender.com';

interface UserData {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  id: string; // UUID string
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  // Add company and company_website if the API returns them on login/register
  company?: string;
  company_website?: string;
}

const getAuthHeaders = (userId: string | null): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (userId) {
    headers['X-User-ID'] = userId;
  }
  return headers;
};

export const register = async (userData: UserData): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Registration failed');
  }
  const data: AuthResponse = await response.json();
  localStorage.setItem('user_id', data.id); // Store user ID
  return data;
};

export const login = async (credentials: Pick<UserData, 'email' | 'password'>): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Login failed');
  }
  const data: AuthResponse = await response.json();
  localStorage.setItem('user_id', data.id); // Store user ID
  // TODO: Implement proper session management using user_sessions table
  // Store session_token instead of just user_id for better security
  return data;
};

export const getCurrentUser = async (): Promise<AuthResponse | null> => {
  const userId = localStorage.getItem('user_id');
  if (!userId) return null;

  const response = await fetch(`${API_BASE_URL}/api/users/me`, {
    headers: getAuthHeaders(userId),
  });
  if (!response.ok) {
    // If unauthorized or not found, clear stored user ID
    if (response.status === 401 || response.status === 404) {
      localStorage.removeItem('user_id');
      return null; // Return null silently for unauthenticated users
    }
    try {
      const errorData = await response.json();
      console.error('Error fetching current user:', errorData.error);
    } catch (jsonError) {
      console.error('Error fetching current user: Non-JSON response');
    }
    return null; // Return null for other errors
  }
  return await response.json();
};

export const signOut = (): void => {
  localStorage.removeItem('user_id');
  // No API call for sign out, just clear local storage
};

export const getUserId = (): string | null => {
  return localStorage.getItem('user_id');
};

export const getAuthenticatedHeaders = (): HeadersInit => {
  const userId = getUserId();
  if (!userId) {
    // This should ideally not happen if routes are protected by auth check
    console.warn('Attempted to get authenticated headers without a user ID.');
    return { 'Content-Type': 'application/json' };
  }
  return getAuthHeaders(userId);
};