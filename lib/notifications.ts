// lib/notifications.ts

export async function sendPushNotification({
  to,
  title,
  body,
}: {
  to: string;
  title: string;
  body: string;
}) {
  try {
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        title,
        body,
        sound: 'default',
      }),
    });

    const data = await res.json();
    console.log('📲 Push notification sent:', data);
  } catch (error) {
    console.error('❌ Failed to send push notification:', error);
  }
}
