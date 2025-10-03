'use client';

import type { User } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as authService from '@/services/authService';
import { AxiosError } from 'axios';
import Cookies from 'js-cookie';

type AuthContextType = {
  user: User | null;
  login: (name: string, password: string) => Promise<boolean>;
  register: (name: string, password: string, isTeacher: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('shikshak-user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (pathname === '/login' || pathname === '/register') {
        router.replace('/dashboard');
      }
    } else {
      if (pathname !== '/login' && pathname !== '/register') {
        router.replace('/login');
      }
    }
    setLoading(false);
  }, [pathname, router]);

  const handleLoginSuccess = (backendResponse: any) => {
    const { user, access_token } = backendResponse;
    const userToStore: User = {
      id: user.id,
      email: user.email || `${user.name.replace(/\s+/g, '.').toLowerCase()}@shikshak.edu`,
      full_name: user.name,
      role: user.is_teacher ? 'teacher' : 'student',
    };
    sessionStorage.setItem('shikshak-user', JSON.stringify(userToStore));
    Cookies.set('token', access_token, { expires: 1 });
    setUser(userToStore);
    router.push('/dashboard');
  };

  const login = async (name: string, password: string) => {
    try {
      const response = await authService.login(name, password);
      handleLoginSuccess(response);
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };

  const register = async (name: string, password: string, isTeacher: boolean) => {
    try {
      await authService.register(name, password, isTeacher);
      // After successful registration, automatically log the user in
      const loginResponse = await authService.login(name, password);
      handleLoginSuccess(loginResponse);
      return { success: true };
    } catch (err: any) {
      let errorMsg = 'Registration failed.';
      if (err instanceof AxiosError && err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      }
      console.error("Registration failed:", err);
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('shikshak-user');
    Cookies.remove('token');
    setUser(null);
    router.push('/login');
  };

  if (loading && !['/login', '/register'].includes(pathname)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
            <svg
            className="mr-2 h-5 w-5 animate-spin text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            ></circle>
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
            </svg>
            Loading...
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
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