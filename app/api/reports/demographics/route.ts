import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const demographicsData = await sql`
      SELECT 
        c.class_name || ' - ' || c.section as class,
        COUNT(s.id) as total_students,
        COUNT(CASE WHEN s.transport_opted = true THEN 1 END) as transport_users,
        AVG(EXTRACT(YEAR FROM AGE(u.date_of_birth))) as average_age
      FROM classes c
      LEFT JOIN students s ON c.id = s.class_id AND s.status = 'active'
      LEFT JOIN users u ON s.user_id = u.id
      GROUP BY c.id, c.class_name, c.section
      ORDER BY c.class_name, c.section
    `

    return NextResponse.json({ data: demographicsData })
  } catch (error) {
    console.error("Error fetching demographics report:", error)
    return NextResponse.json({ error: "Failed to fetch demographics report" }, { status: 500 })
  }
}
