import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    // Query the database for the user by username
    const users = await sql<{
      id: number
      username: string
      email: string
      password_hash: string
      role: string
      full_name: string
    }>(
      "SELECT id, username, email, password_hash, role, full_name FROM users WHERE username = ?",
      [username]
    )

    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
    }

    const user = users[0]

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
    }

    // Create a simple session token (in production, use proper JWT)
    const sessionToken = Buffer.from(
      JSON.stringify({
        userId: user.id,
        username: user.username,
        role: user.role,
        name: user.full_name,
        timestamp: Date.now(),
      }),
    ).toString("base64")

    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
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
