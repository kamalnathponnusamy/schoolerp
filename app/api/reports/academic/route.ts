import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const academicData = await sql`
      SELECT 
        e.exam_name,
        s.subject_name,
        c.class_name || ' - ' || c.section as class,
        AVG(er.marks_obtained) as average_marks,
        COUNT(er.id) as total_students
      FROM exam_results er
      JOIN exams e ON er.exam_id = e.id
      JOIN subjects s ON e.subject_id = s.id
      JOIN classes c ON e.class_id = c.id
      GROUP BY e.exam_name, s.subject_name, c.class_name, c.section
      ORDER BY e.exam_name DESC
    `

    return NextResponse.json({ data: academicData })
  } catch (error) {
    console.error("Error fetching academic report:", error)
    return NextResponse.json({ error: "Failed to fetch academic report" }, { status: 500 })
  }
}
