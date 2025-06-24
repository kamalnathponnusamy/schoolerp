import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Check if user is accessing protected routes
  const protectedPaths = ["/dashboard", "/admissions", "/students", "/teachers", "/admin"]
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath) {
    const sessionToken = request.cookies.get("session-token")

    if (!sessionToken) {
      // Redirect to login if no session
      return NextResponse.redirect(new URL("/", request.url))
    }

    try {
      // Validate the session token
      const sessionData = JSON.parse(Buffer.from(sessionToken.value, "base64").toString())

      // Check if session is not expired (24 hours)
      const sessionAge = Date.now() - sessionData.timestamp
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

      if (sessionAge > maxAge) {
        // Session expired, redirect to login
        const response = NextResponse.redirect(new URL("/", request.url))
        response.cookies.delete("session-token")
        return response
      }
    } catch (error) {
      // Invalid session token, redirect to login
      const response = NextResponse.redirect(new URL("/", request.url))
      response.cookies.delete("session-token")
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admissions/:path*", "/students/:path*", "/teachers/:path*", "/admin/:path*"],
}
