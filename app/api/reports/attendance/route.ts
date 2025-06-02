import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const attendanceData = await sql`
      SELECT 
        a.date,
        c.class_name || ' - ' || c.section as class,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent,
        ROUND(COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(*), 1) as percentage
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN classes c ON s.class_id = c.id
      GROUP BY a.date, c.class_name, c.section
      ORDER BY a.date DESC
      LIMIT 50
    `

    return NextResponse.json({ data: attendanceData })
  } catch (error) {
    console.error("Error fetching attendance report:", error)
    return NextResponse.json({ error: "Failed to fetch attendance report" }, { status: 500 })
  }
}
