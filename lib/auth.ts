import { cookies } from 'next/headers';

export async function getSessionUser() {
  const cookieStore = await cookies(); // ✅ now awaited
  const sessionToken = cookieStore.get('session-token');
  if (!sessionToken) return null;

  try {
    const sessionData = JSON.parse(
      Buffer.from(sessionToken.value, 'base64').toString('utf-8')
    );
    return sessionData; // e.g., { userId, username, role, ... }
  } catch {
    return null;
  }
}
