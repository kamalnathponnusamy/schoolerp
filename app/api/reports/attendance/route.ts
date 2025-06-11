import { type NextRequest } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const attendanceData = await sql(
      `SELECT 
        a.date,
        c.class_name,
        c.section,
        COUNT(DISTINCT a.student_id) as total_students,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
        SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_count
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN classes c ON s.class_id = c.id
      GROUP BY a.date, c.class_name, c.section
      ORDER BY a.date DESC, c.class_name, c.section`
    )

    return Response.json(attendanceData)
  } catch (error) {
    console.error("Error fetching attendance reports:", error)
    return Response.json(
      { error: "Failed to fetch attendance reports" },
      { status: 500 }
    )
  }
}
