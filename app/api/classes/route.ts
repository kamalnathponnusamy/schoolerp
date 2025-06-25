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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const grade = searchParams.get("grade")        // e.g., 6 (filters sections like 6A, 6B)
  const year = searchParams.get("academic_year") // e.g., 2023-2024
  const className = searchParams.get("class_name") // e.g., Mathematics
  const teacherId = searchParams.get("teacher_id") // e.g., 5

  const conditions: string[] = []
  const values: any[] = []

  if (grade) {
    conditions.push("c.class_name LIKE ?")
    values.push(`%${grade}%`)
  }
  if (year) {
    conditions.push("c.academic_year = ?")
    values.push(year)
  }
  if (className) {
    conditions.push("c.class_name = ?")
    values.push(className)
  }
  if (teacherId) {
    conditions.push("c.class_teacher_id = ?")
    values.push(Number(teacherId))
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

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
      ${whereClause}
      GROUP BY c.id, c.class_name, c.section, c.class_teacher_id, u.full_name, c.academic_year, c.created_at
      ORDER BY c.class_name, c.section
    `, values)

    const summary = {
      totalClasses: classes.length,
      totalSections: new Set(classes.map(c => c.class_name)).size,
      totalStudents: classes.reduce((sum, c) => sum + c.student_count, 0)
    }

    return NextResponse.json({ classes, summary })
  } catch (error) {
    console.error("Error fetching classes:", error)
    return NextResponse.json(
      { classes: [], summary: { totalClasses: 0, totalSections: 0, totalStudents: 0 } },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { class_name, section, class_teacher_id, academic_year } = body

    if (!class_name || !section || !academic_year) {
      return NextResponse.json(
        { error: "Missing required fields: class_name, section, academic_year" },
        { status: 400 }
      )
    }

    const existingClass = await sql(
      `SELECT id FROM classes WHERE class_name = ? AND section = ? AND academic_year = ?`,
      [class_name, section, academic_year]
    )

    if (existingClass.length > 0) {
      return NextResponse.json(
        { error: "Class with this name and section already exists for this academic year" },
        { status: 400 }
      )
    }

    const result = await sql(
      `INSERT INTO classes (class_name, section, class_teacher_id, academic_year)
       VALUES (?, ?, ?, ?)`,
      [class_name, section, class_teacher_id || null, academic_year]
    )

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
