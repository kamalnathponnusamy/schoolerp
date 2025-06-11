export const dynamic = "force-dynamic"

import { type NextRequest } from "next/server"
import { sql } from "@/lib/db"

interface FeeSummary {
  total_fees: number
  paid_fees: number
  pending_fees: number
  total_students: number
  paid_students: number
  pending_students: number
}

export async function GET() {
  try {
    const summary = await sql<FeeSummary>(
      `SELECT 
        SUM(total_amount) as total_fees,
        SUM(paid_amount) as paid_fees,
        SUM(total_amount - paid_amount) as pending_fees,
        COUNT(DISTINCT student_id) as total_students,
        COUNT(DISTINCT CASE WHEN status = 'paid' THEN student_id END) as paid_students,
        COUNT(DISTINCT CASE WHEN status = 'pending' THEN student_id END) as pending_students
      FROM fees
      WHERE academic_year = '2024-25' AND term = 'Q1'`
    )

    return Response.json(summary[0])
  } catch (error) {
    console.error("Error fetching fee summary:", error)
    return Response.json(
      { error: "Failed to fetch fee summary" },
      { status: 500 }
    )
  }
}
