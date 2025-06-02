import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const subjects = await sql`
      SELECT 
        s.id,
        s.subject_name,
        s.subject_code,
        s.class_id,
        c.class_name,
        c.section
      FROM subjects s
      LEFT JOIN classes c ON s.class_id = c.id
      ORDER BY s.subject_name
    `

    return NextResponse.json(subjects)
  } catch (error) {
    console.error("Error fetching subjects:", error)
    return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { subject_name, subject_code, class_id } = await request.json()

    if (!subject_name) {
      return NextResponse.json({ error: "Subject name is required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO subjects (subject_name, subject_code, class_id)
      VALUES (${subject_name}, ${subject_code || null}, ${class_id || null})
      RETURNING id
    `

    return NextResponse.json({
      message: "Subject created successfully",
      id: result[0].id,
    })
  } catch (error) {
    console.error("Error creating subject:", error)
    return NextResponse.json({ error: "Failed to create subject" }, { status: 500 })
  }
}
