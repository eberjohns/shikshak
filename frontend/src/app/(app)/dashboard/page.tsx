'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardRedirect() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user.role === 'teacher') {
        router.replace('/dashboard/teacher/1'); // Default to first course for demo
      } else {
        router.replace('/dashboard/student');
      }
    }
  }, [user, router]);

  return (
    <div className="flex h-full w-full items-center justify-center">
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
        Redirecting to your dashboard...
      </div>
    </div>
  );
}
