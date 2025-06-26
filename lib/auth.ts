import { cookies } from "next/headers";

export async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session-token");
  if (!sessionToken) return null;
  try {
    const sessionData = JSON.parse(Buffer.from(sessionToken.value, "base64").toString());
    // Optionally: check expiry here
    return sessionData; // { userId, username, role, ... }
  } catch {
    return null;
  }
} 