import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const feesData = await sql`
      SELECT 
        f.id,
        u.full_name as student_name,
        s.student_id,
        c.class_name || ' - ' || c.section as class,
        f.total_amount,
        f.paid_amount,
        f.status,
        f.due_date
      FROM fees f
      JOIN students s ON f.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      ORDER BY f.due_date DESC
    `

    return NextResponse.json({ data: feesData })
  } catch (error) {
    console.error("Error fetching fees report:", error)
    return NextResponse.json({ error: "Failed to fetch fees report" }, { status: 500 })
  }
}
