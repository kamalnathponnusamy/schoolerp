import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const assignments = await sql(`
      SELECT 
        a.id, a.title, a.description, a.due_date, a.assigned_date,
        s.subject_name,
        c.class_name, c.section,
        t.name as teacher_name
      FROM assignments a
      JOIN subjects s ON a.subject_id = s.id
      JOIN classes c ON a.class_id = c.id
      JOIN teachers t ON a.teacher_id = t.id
      ORDER BY a.due_date DESC
    `)

    return NextResponse.json({ assignments })
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { title, description, subject_id, class_id, due_date } = await request.json()

    // For demo, use teacher ID 3
    const teacherId = 3

    await sql(`
      INSERT INTO assignments (title, description, subject_id, class_id, teacher_id, due_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [title, description, subject_id, class_id, teacherId, due_date])

    // Get the last inserted ID
    const [result] = await sql('SELECT LAST_INSERT_ID() as id')

    return NextResponse.json({ 
      message: "Assignment created successfully", 
      id: result.id 
    })
  } catch (error) {
    console.error("Error creating assignment:", error)
    return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 })
  }
}
