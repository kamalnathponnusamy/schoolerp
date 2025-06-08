import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

interface Class {
  id: number
  class_name: string
  section: string
  class_teacher_id: number | null
  teacher_name: string | null
  created_at: string
}

export async function GET() {
  try {
    const classes = await sql<Class>(`
      SELECT 
        c.id, c.class_name, c.section,
        c.class_teacher_id, u.full_name as teacher_name,
        c.created_at
      FROM classes c
      LEFT JOIN users u ON c.class_teacher_id = u.id
      ORDER BY c.class_name, c.section
    `)

    return NextResponse.json(classes)
  } catch (error) {
    console.error("Error fetching classes:", error)
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { class_name, section, class_teacher_id } = body

    const result = await sql(`
      INSERT INTO classes (class_name, section, class_teacher_id)
      VALUES (:class_name, :section, :class_teacher_id)
    `, {
      class_name,
      section,
      class_teacher_id
    })

    return NextResponse.json({ message: "Class created successfully" })
  } catch (error) {
    console.error("Error creating class:", error)
    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 }
    )
  }
}
