// components/PushNotifications.tsx
import { useEffect } from 'react';
import { messaging, getToken } from '@/lib/firebase';

export default function PushNotifications({ userId, role }: { userId: number, role: string }) {
  useEffect(() => {
    async function requestPermission() {
      try {
        const token = await getToken(messaging, {
          vapidKey: 'BoO1OSms4DOEfNkcHcvyqFpaAON12rEzc_5w-e4-Cjc' // Generate from Firebase Project Settings > Cloud Messaging
        });

        if (token) {
          console.log('FCM token:', token);
          // Save token to your backend
          await fetch('/api/save-push-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, role, token })
          });
        } else {
          console.log('No token received. Request permission first.');
        }
      } catch (err) {
        console.error('Token error:', err);
      }
    }

    requestPermission();
  }, [userId, role]);

  return null;
}
