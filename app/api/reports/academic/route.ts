import { type NextRequest } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const academicData = await sql(
      `SELECT 
        e.exam_name,
        s.subject_name,
        c.class_name,
        c.section,
        COUNT(DISTINCT r.student_id) as total_students,
        AVG(r.marks_obtained) as average_marks,
        MAX(r.marks_obtained) as highest_marks,
        MIN(r.marks_obtained) as lowest_marks
      FROM exam_results r
      JOIN exams e ON r.exam_id = e.id
      JOIN subjects s ON r.subject_id = s.id
      JOIN classes c ON r.class_id = c.id
      GROUP BY e.exam_name, s.subject_name, c.class_name, c.section
      ORDER BY e.exam_name, s.subject_name, c.class_name, c.section`
    )

    return Response.json(academicData)
  } catch (error) {
    console.error("Error fetching academic reports:", error)
    return Response.json(
      { error: "Failed to fetch academic reports" },
      { status: 500 }
    )
  }
}
