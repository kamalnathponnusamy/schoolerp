import { cookies } from "next/headers";

export function getSessionUser() {
  const cookieStore = cookies();
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