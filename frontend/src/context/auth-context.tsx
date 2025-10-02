'use client';


import type { User } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

type AuthContextType = {
  user: User | null;
  loginStudent: (studentId: number) => Promise<boolean>;
  registerStudent: (name: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  loginTeacher: () => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('shikshak-user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
       if (pathname === '/login') {
         router.replace('/dashboard');
       }
    } else {
       if (pathname !== '/login') {
         router.replace('/login');
       }
    }
    setLoading(false);
  }, []);


  // Real backend login/register logic
  const loginStudent = async (studentId: number) => {
    try {
      const res = await axios.post('http://localhost:8000/login/student', null, { params: { student_id: studentId } });
      const backendUser = res.data;
      const user: User = {
        id: backendUser.id,
        email: '',
        full_name: backendUser.name,
        role: 'student',
      };
      localStorage.setItem('shikshak-user', JSON.stringify(user));
      setUser(user);
      router.push('/dashboard');
      return true;
    } catch (err) {
      return false;
    }
  };

  const registerStudent = async (name: string) => {
    try {
      const res = await axios.post('http://localhost:8000/students', null, { params: { name } });
      const backendUser = res.data;
      const user: User = {
        id: backendUser.id,
        email: '',
        full_name: backendUser.name,
        role: 'student',
      };
      localStorage.setItem('shikshak-user', JSON.stringify(user));
      setUser(user);
      router.push('/dashboard');
      return { success: true, user };
    } catch (err: any) {
      let errorMsg = 'Registration failed.';
      if (err.response && err.response.data && err.response.data.detail) {
        errorMsg = err.response.data.detail;
      }
      return { success: false, error: errorMsg };
    }
  };

  const loginTeacher = async () => {
    try {
      const res = await axios.post('http://localhost:8000/login/teacher');
      const backendUser = res.data;
      const user: User = {
        id: backendUser.id,
        email: '',
        full_name: backendUser.name,
        role: 'teacher',
      };
      localStorage.setItem('shikshak-user', JSON.stringify(user));
      setUser(user);
      router.push('/dashboard');
      return true;
    } catch (err) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('shikshak-user');
    setUser(null);
    router.push('/login');
  };

  if (loading && (pathname !== '/login')) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
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
    <AuthContext.Provider value={{ user, loginStudent, registerStudent, loginTeacher, logout }}>
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
