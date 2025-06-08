import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

interface Teacher {
  id: number
  teacher_id: string
  name: string
  subject: string
  phone: string
  email: string
  qualification: string
  experience_years: number
  salary: number
  status: string
  assigned_classes: string | null
}

export async function GET() {
  try {
    const teachers = await sql<Teacher>(
      `SELECT 
        id,
        teacher_id,
        name,
        subject,
        phone,
        email,
        qualification,
        experience_years,
        salary,
        status,
        assigned_classes
      FROM teachers 
      ORDER BY name ASC`
    )

    // Ensure we always return an array
    return NextResponse.json(Array.isArray(teachers) ? teachers : [])
  } catch (error) {
    console.error("Error fetching teachers:", error)
    // Return empty array on error instead of error response
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const sql = neon(process.env.DATABASE_URL!)

    const { teacher_id, name, subject, phone, email, qualification, experience_years, salary } = body

    // Validate required fields
    if (!teacher_id || !name || !subject || !phone || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO teachers (teacher_id, name, subject, phone, email, qualification, experience_years, salary, status, assigned_classes)
      VALUES (${teacher_id}, ${name}, ${subject}, ${phone}, ${email}, ${qualification}, ${experience_years || 0}, ${salary || 0}, 'active', 'Not Assigned')
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating teacher:", error)
    return NextResponse.json({ error: "Failed to create teacher" }, { status: 500 })
  }
}
