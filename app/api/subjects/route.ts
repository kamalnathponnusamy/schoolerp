import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

interface Subject {
  id: number
  subject_name: string
  subject_code: string
  description: string
  created_at: string
  updated_at: string
}

export async function GET() {
  try {
    const subjects = await sql<Subject>(`
      SELECT 
        id, subject_name, subject_code,
        description, created_at, updated_at
      FROM subjects
      ORDER BY subject_name
    `)

    return NextResponse.json(subjects)
  } catch (error) {
    console.error("Error fetching subjects:", error)
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { subject_name, subject_code, description } = body

    const result = await sql(`
      INSERT INTO subjects (subject_name, subject_code, description)
      VALUES (:subject_name, :subject_code, :description)
    `, {
      subject_name,
      subject_code,
      description
    })

    return NextResponse.json({ message: "Subject created successfully" })
  } catch (error) {
    console.error("Error creating subject:", error)
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 }
    )
  }
}
