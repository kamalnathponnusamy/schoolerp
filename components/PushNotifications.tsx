import { useEffect } from 'react';
import { messaging } from '@/lib/firebase';
import { getToken } from 'firebase/messaging';


export default function PushNotifications({ userId, role }: { userId: number, role: string }) {
  useEffect(() => {
    async function requestPermission() {
      if (!('Notification' in window)) return;

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission not granted');
        return;
      }

      try {
        const token = await getToken(messaging, {
          vapidKey: 'BoO1OSms4DOEfNkcHcvyqFpaAON12rEzc_5w-e4-Cjc'
        });

        if (token) {
          const savedToken = localStorage.getItem('fcm_token');
          if (token !== savedToken) {
            await fetch('/api/save-push-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, role, token })
            });
            localStorage.setItem('fcm_token', token);
          }
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
