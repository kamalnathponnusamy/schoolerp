'use client';

import { StudentDashboard } from '@/components/StudentDashboard';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userCookie = document.cookie.split('; ').find(row => row.startsWith('user='));
    if (!userCookie) {
      router.replace('/login');
      return;
    }
    try {
      const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
      if (userData.role !== 'student') {
        // Redirect to their respective dashboard
        switch (userData.role) {
          case 'teacher':
            router.replace('/teacher/dashboard');
            break;
          case 'admin':
            router.replace('/admin/dashboard');
            break;
          default:
            router.replace('/');
        }
      }
    } catch (error) {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      <StudentDashboard />
    </div>
  );
} 