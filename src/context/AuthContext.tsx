import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { register, login, getCurrentUser, signOut as apiSignOut, AuthResponse } from '../lib/userApi';

// Define types based on the new API's user response
interface AuthUser extends AuthResponse {}

interface UserProfile extends AuthUser {}

interface AuthContextType {
  user: AuthUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: {
    first_name: string;
    last_name: string;
    company: string;
    company_website: string;
  }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      try {
        // Temporarily disable API call to test if this is causing the blank screen
        // const currentUser = await getCurrentUser();
        const currentUser = null; // Temporary fix
        setUser(currentUser);
        if (currentUser) {
          setUserProfile(currentUser);
        } else {
          setUserProfile(null);
        }
      } catch (err) {
        console.error('Error loading user:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleSignUp = async (email: string, password: string, userData: {
    first_name: string;
    last_name: string;
    company: string;
    company_website: string;
  }) => {
    setError(null);
    try {
      const newUser = await register({
        email,
        username: email,
        password,
        first_name: userData.first_name,
        last_name: userData.last_name,
      });
      setUser(newUser);
      setUserProfile(newUser);
      console.log('User signed up successfully:', newUser);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed';
      setError(errorMessage);
      throw err;
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    setError(null);
    try {
      const loggedInUser = await login({ email, password });
      setUser(loggedInUser);
      setUserProfile(loggedInUser);
      console.log('User signed in successfully:', loggedInUser);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed';
      setError(errorMessage);
      throw err;
    }
  };

  const handleSignOut = async () => {
    setError(null);
    try {
      apiSignOut();
      setUser(null);
      setUserProfile(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign out failed';
      setError(errorMessage);
      throw err;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};