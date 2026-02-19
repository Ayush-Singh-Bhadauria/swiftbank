'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, RegisterRequest } from '@/lib/types';
import { apiClient } from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  loginWithCustomerId: (customerId: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await apiClient.getProfile();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            // Token invalid, clear it
            localStorage.removeItem('authToken');
          }
        } catch (err) {
          localStorage.removeItem('authToken');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Try customer ID login first if identifier doesn't look like an email
      const isEmail = identifier.includes('@');
      const response = isEmail
        ? await apiClient.login(identifier, password)
        : await apiClient.loginWithCustomerId(identifier, password);

      if (!response.success) {
        throw new Error(response.error || 'Login failed');
      }

      const { token, user } = response.data;
      localStorage.setItem('authToken', token);
      setUser(user);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'An error occurred during login';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithCustomerId = async (customerId: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.loginWithCustomerId(customerId, password);

      if (!response.success) {
        throw new Error(response.error || 'Login failed');
      }

      const { token, user } = response.data;
      localStorage.setItem('authToken', token);
      setUser(user);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'An error occurred during login';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.register({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });

      if (!response.success) {
        throw new Error(response.error || 'Registration failed');
      }

      const { token, user } = response.data;
      localStorage.setItem('authToken', token);
      setUser(user);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'An error occurred during registration';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiClient.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('authToken');
      setUser(null);
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        loginWithCustomerId,
        register,
        logout,
        clearError,
      }}
    >
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
