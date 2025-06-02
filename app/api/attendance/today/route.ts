import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const attendance = await sql`
      SELECT 
        a.id, a.date, a.status, a.remarks,
        u.full_name as student_name,
        s.student_id,
        c.class_name, c.section,
        t.full_name as marked_by_teacher
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      JOIN users t ON a.marked_by = t.id
      WHERE a.date = CURRENT_DATE
      ORDER BY c.class_name, c.section, u.full_name
    `

    return NextResponse.json({ attendance })
  } catch (error) {
    console.error("Error fetching attendance:", error)
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 })
  }
}
