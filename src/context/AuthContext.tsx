'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  role?: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  emailVerified: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, options?: { adminOnly?: boolean }) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json() as { user: { id: string; email: string; role?: string; phone?: string | null; emailVerified: boolean; profile?: { firstName?: string | null; lastName?: string | null } } | null };
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          role: data.user.role ?? 'CUSTOMER',
          phone: data.user.phone ?? null,
          emailVerified: data.user.emailVerified,
          firstName: data.user.profile?.firstName ?? null,
          lastName: data.user.profile?.lastName ?? null,
        });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = async (email: string, password: string, options?: { adminOnly?: boolean }) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, ...options }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (data.success) {
        await refreshUser();
        return { success: true };
      }
      return { success: false, error: data.error ?? 'Login failed' };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const register = async (formData: RegisterData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (data.success) {
        await refreshUser();
        return { success: true };
      }
      return { success: false, error: data.error ?? 'Registration failed' };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
