import { type NextRequest } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const demographicsData = await sql(
      `SELECT 
        c.class_name,
        c.section,
        COUNT(s.id) as total_students,
        COUNT(CASE WHEN s.gender = 'male' THEN 1 END) as male_count,
        COUNT(CASE WHEN s.gender = 'female' THEN 1 END) as female_count,
        COUNT(CASE WHEN s.gender = 'other' THEN 1 END) as other_count,
        COUNT(CASE WHEN s.transport_route_id IS NOT NULL THEN 1 END) as transport_users,
        COUNT(CASE WHEN s.transport_route_id IS NULL THEN 1 END) as non_transport_users
      FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE s.status = 'active'
      GROUP BY c.class_name, c.section
      ORDER BY c.class_name, c.section`
    )

    return Response.json(demographicsData)
  } catch (error) {
    console.error("Error fetching demographics reports:", error)
    return Response.json(
      { error: "Failed to fetch demographics reports" },
      { status: 500 }
    )
  }
}
