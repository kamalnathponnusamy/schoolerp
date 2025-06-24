import { type NextRequest } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId")

    if (!classId) {
      return Response.json(
        { error: "Class ID is required" },
        { status: 400 }
      )
    }

    const students = await sql(
      `SELECT 
        s.id,
        s.student_id,
        u.full_name,
        u.email,
        u.phone,
        c.class_name,
        c.section,
        COALESCE(tr.route_name, 'No Transport') as transport_route,
        CASE 
          WHEN f.status = 'paid' THEN 'Paid'
          WHEN f.status = 'pending' THEN 'Pending'
          ELSE 'Not Set'
        END as fee_status
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      LEFT JOIN transport_routes tr ON s.transport_route_id = tr.id
      LEFT JOIN fees f ON s.id = f.student_id AND f.academic_year = '2024-25' AND f.term = 'Q1'
      WHERE s.class_id = ? AND s.status = 'active'
      ORDER BY u.full_name`,
      [classId]
    )

    return Response.json(students)
  } catch (error) {
    console.error("Error fetching students by class:", error)
    return Response.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    )
  }
}
