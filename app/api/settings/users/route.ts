import { type NextRequest } from "next/server"
import { sql } from "@/lib/db"
import { NextResponse } from 'next/server'


interface User {
  id: number
  full_name: string
  email: string
  role: string
  created_at: string
}

export async function GET() {
  try {
    const users = await sql<User>(
      `SELECT id, full_name, email, role, created_at
      FROM users
      ORDER BY full_name`
    )

    return Response.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return Response.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { full_name, email, role } = body

    const result = await sql(`
      INSERT INTO users (full_name, email, role)
      VALUES (:full_name, :email, :role)
    `, {
      full_name,
      email,
      role
    })

    return NextResponse.json({ message: "User created successfully" })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
}
