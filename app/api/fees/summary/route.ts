import { NextResponse } from "next/server"
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
    const summary = await sql<FeeSummary>(`
      SELECT 
        SUM(total_amount) as total_fees,
        SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END) as paid_fees,
        SUM(CASE WHEN status = 'pending' THEN total_amount ELSE 0 END) as pending_fees,
        COUNT(DISTINCT student_id) as total_students,
        COUNT(DISTINCT CASE WHEN status = 'paid' THEN student_id END) as paid_students,
        COUNT(DISTINCT CASE WHEN status = 'pending' THEN student_id END) as pending_students
      FROM fees
      WHERE academic_year = :academic_year
    `, {
      academic_year: new Date().getFullYear().toString()
    })

    return NextResponse.json(summary[0])
  } catch (error) {
    console.error("Error fetching fees:", error)
    return NextResponse.json({ error: "Failed to fetch fees summary" }, { status: 500 })
  }
}
