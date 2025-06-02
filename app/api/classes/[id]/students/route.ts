import { neon } from "@neondatabase/serverless"
import { type NextRequest, NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const classId = params.id

    const students = await sql`
      SELECT 
        s.*,
        COALESCE(tr.route_name, 'No Transport') as transport_route,
        CASE 
          WHEN f.status = 'paid' THEN 'Paid'
          WHEN f.status = 'pending' THEN 'Pending'
          ELSE 'Not Set'
        END as fee_status
      FROM students s
      LEFT JOIN student_transport st ON s.id = st.student_id
      LEFT JOIN transport_routes tr ON st.route_id = tr.id
      LEFT JOIN fees f ON s.id = f.student_id AND f.academic_year = '2024-25' AND f.term = 'Q1'
      WHERE s.class_id = ${classId} AND s.status = 'active'
      ORDER BY s.name
    `

    return NextResponse.json(students)
  } catch (error) {
    console.error("Error fetching class students:", error)
    return NextResponse.json({ error: "Failed to fetch class students" }, { status: 500 })
  }
}
