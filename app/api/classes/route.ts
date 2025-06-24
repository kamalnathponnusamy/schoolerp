import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

interface Class {
  id: number
  class_name: string
  section: string
  class_teacher_id: number | null
  teacher_name: string | null
  academic_year: string
  student_count: number
  created_at: string
}

export async function GET() {
  try {
    const classes = await sql<Class>(`
      SELECT 
        c.id, 
        c.class_name, 
        c.section,
        c.class_teacher_id, 
        u.full_name as teacher_name,
        c.academic_year,
        COUNT(s.id) as student_count,
        c.created_at
      FROM classes c
      LEFT JOIN users u ON c.class_teacher_id = u.id
      LEFT JOIN students s ON c.id = s.class_id AND s.status = 'active'
      GROUP BY c.id, c.class_name, c.section, c.class_teacher_id, u.full_name, c.academic_year, c.created_at
      ORDER BY c.class_name, c.section
    `)

    // Calculate summary statistics
    const summary = {
      totalClasses: classes.length,
      totalSections: new Set(classes.map(c => c.class_name)).size,
      totalStudents: classes.reduce((sum, c) => sum + c.student_count, 0)
    }

    return NextResponse.json({ classes, summary })
  } catch (error) {
    console.error("Error fetching classes:", error)
    return NextResponse.json({ classes: [], summary: { totalClasses: 0, totalSections: 0, totalStudents: 0 } })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { class_name, section, class_teacher_id, academic_year } = body

    // Validate required fields
    if (!class_name || !section || !academic_year) {
      return NextResponse.json(
        { error: "Missing required fields: class_name, section, academic_year" },
        { status: 400 }
      )
    }

    // Check if class with same name and section already exists
    const existingClass = await sql(`
      SELECT id FROM classes 
      WHERE class_name = ? AND section = ? AND academic_year = ?
    `, [class_name, section, academic_year])

    if (existingClass.length > 0) {
      return NextResponse.json(
        { error: "Class with this name and section already exists for this academic year" },
        { status: 400 }
      )
    }

    const result = await sql(`
      INSERT INTO classes (class_name, section, class_teacher_id, academic_year)
      VALUES (?, ?, ?, ?)
    `, [class_name, section, class_teacher_id || null, academic_year])

    return NextResponse.json({ 
      message: "Class created successfully",
      class_id: (result as any).insertId
    })
  } catch (error) {
    console.error("Error creating class:", error)
    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 }
    )
  }
}