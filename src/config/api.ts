// API Configuration
export const API_CONFIG = {
  // Main backend API
  BACKEND_URL: 'https://development-knowledge-gpt.onrender.com',
  
  // User database API (if different from main backend)
  USER_API_URL: 'https://development-knowledge-gpt.onrender.com',
  
  // Knowledge GPT API (if different from main backend)
  KNOWLEDGE_GPT_URL: 'https://development-knowledge-gpt.onrender.com',
  
  // Local development fallback
  LOCAL_BACKEND_URL: 'http://localhost:3001',
} as const;

// Helper function to get the appropriate API URL based on environment
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BACKEND_URL;
  return `${baseUrl}${endpoint}`;
};
