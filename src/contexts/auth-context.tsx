"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  plan: string;
  credits_remaining: number;
  status: string;
  email_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loggingOut: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token is still valid
      const response = await authApi.profile();
      setUser(response.data);
    } catch (error) {
      console.error('Auth check failed:', error);
      // Token is invalid, clear it
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    sessionStorage.clear();
    setUser(null);
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      const { access_token, user: userData } = response.data;
      
      // Store token and user data
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      throw error; // Let the login form handle the error
    }
  };

  const logout = () => {
    setLoggingOut(true);
    
    // Clear all auth data
    clearAuthData();
    
    // Force immediate redirect with page reload
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    try {
      const response = await authApi.profile();
      setUser(response.data);
      localStorage.setItem('user_data', JSON.stringify(response.data));
    } catch (error) {
      console.error('Failed to refresh user:', error);
      clearAuthData();
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      loggingOut,
      login,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
