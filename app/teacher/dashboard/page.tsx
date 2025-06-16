'use client';

import { TeacherDashboard } from '@/components/TeacherDashboard';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TeacherDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is logged in
        const userCookie = document.cookie.split('; ').find(row => row.startsWith('user='));
        if (!userCookie) {
          router.replace('/login');
          return;
        }

        const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
        if (userData.role !== 'teacher') {
          // Redirect to their respective dashboard
          switch (userData.role) {
            case 'student':
              router.replace('/student/dashboard');
              break;
            case 'admin':
              router.replace('/admin/dashboard');
              break;
            default:
              router.replace('/');
          }
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Authentication error:', error);
        setError('Failed to authenticate. Please try logging in again.');
        router.replace('/login');
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => router.replace('/login')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TeacherDashboard />
    </div>
  );
} 