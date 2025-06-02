import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    // For demo purposes, use simple credential checking
    const validCredentials = [
      { username: "admin@school.edu", password: "password123", role: "admin", name: "Admin User" },
      { username: "teacher@school.edu", password: "password123", role: "teacher", name: "Teacher User" },
      { username: "student@school.edu", password: "password123", role: "student", name: "Student User" },
    ]

    const user = validCredentials.find(
      (cred) => (cred.username === username || cred.username === username) && cred.password === password,
    )

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create a simple session token (in production, use proper JWT)
    const sessionToken = Buffer.from(
      JSON.stringify({
        userId: Math.floor(Math.random() * 1000),
        username: user.username,
        role: user.role,
        name: user.name,
        timestamp: Date.now(),
      }),
    ).toString("base64")

    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: Math.floor(Math.random() * 1000),
        username: user.username,
        role: user.role,
        full_name: user.name,
      },
    })

    // Set session cookie
    response.cookies.set("session-token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400, // 24 hours
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
