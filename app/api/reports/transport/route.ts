import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const transportData = await sql`
      SELECT 
        tr.route_name,
        tr.route_code,
        tr.monthly_fee,
        COUNT(s.id) as student_count,
        SUM(tr.monthly_fee) as total_revenue
      FROM transport_routes tr
      LEFT JOIN students s ON s.transport_route_id = tr.id AND s.transport_opted = true
      GROUP BY tr.id, tr.route_name, tr.route_code, tr.monthly_fee
      ORDER BY student_count DESC
    `

    return NextResponse.json({ data: transportData })
  } catch (error) {
    console.error("Error fetching transport report:", error)
    return NextResponse.json({ error: "Failed to fetch transport report" }, { status: 500 })
  }
}
