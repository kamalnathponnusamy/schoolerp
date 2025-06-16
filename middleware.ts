import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

type UserRole = 'student' | 'teacher' | 'admin'
type ProtectedRoutes = {
  [key: string]: UserRole[]
}

// Define protected routes and their allowed roles
const protectedRoutes: ProtectedRoutes = {
  '/student/dashboard': ['student'],
  '/teacher/dashboard': ['teacher'],
  '/admin/dashboard': ['admin'],
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Skip middleware for API routes and static files
  if (path.startsWith('/api/') || path.includes('.')) {
    return NextResponse.next()
  }

  // Check if the path is a protected route
  const isProtectedRoute = Object.keys(protectedRoutes).some(route => path.startsWith(route))
  
  if (isProtectedRoute) {
    // Get user from cookie
    const userCookie = request.cookies.get('user')
    
    // If no user cookie exists, redirect to login
    if (!userCookie?.value) {
      const loginUrl = new URL('/', request.url)
      loginUrl.searchParams.set('redirect', path)
      return NextResponse.redirect(loginUrl)
    }

    try {
      const userData = JSON.parse(userCookie.value)
      const userRole = userData.role as UserRole

      // Check if user has access to the requested route
      const route = Object.keys(protectedRoutes).find(route => path.startsWith(route))
      if (route && !protectedRoutes[route].includes(userRole)) {
        // Redirect to appropriate dashboard based on role
        switch (userRole) {
          case 'student':
            return NextResponse.redirect(new URL('/student/dashboard', request.url))
          case 'teacher':
            return NextResponse.redirect(new URL('/teacher/dashboard', request.url))
          case 'admin':
            return NextResponse.redirect(new URL('/admin/dashboard', request.url))
          default:
            return NextResponse.redirect(new URL('/', request.url))
        }
      }

      // User is authenticated and authorized, proceed with the request
      return NextResponse.next()
    } catch (error) {
      // If there's an error parsing user data, redirect to login
      const loginUrl = new URL('/', request.url)
      loginUrl.searchParams.set('redirect', path)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/student/dashboard/:path*',
    '/teacher/dashboard/:path*',
    '/admin/dashboard/:path*',
  ],
}
