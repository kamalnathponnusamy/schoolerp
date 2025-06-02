import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const users = await sql`
      SELECT id, username, email, role, full_name, 
             CASE WHEN id IS NOT NULL THEN 'active' ELSE 'inactive' END as status,
             created_at
      FROM users
      WHERE role IN ('admin', 'teacher', 'staff')
      ORDER BY created_at DESC
    `

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { username, email, password, role, full_name } = await request.json()

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE username = ${username} OR email = ${email}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Create new user
    const result = await sql`
      INSERT INTO users (username, email, password_hash, role, full_name)
      VALUES (${username}, ${email}, ${password}, ${role}, ${full_name})
      RETURNING id
    `

    return NextResponse.json({
      message: "User created successfully",
      userId: result[0].id,
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
