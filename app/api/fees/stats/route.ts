import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Get total collected
    const collectedResult = await sql(
      `SELECT COALESCE(SUM(paid_amount), 0) as total_collected
      FROM fees`
    )

    // Get total pending
    const pendingResult = await sql(
      `SELECT COALESCE(SUM(total_amount - paid_amount), 0) as total_pending
      FROM fees
      WHERE status = 'pending'`
    )

    // Get total students
    const studentsResult = await sql(
      `SELECT COUNT(*) as total_students
      FROM students
      WHERE status = 'active'`
    )

    // Calculate collection rate
    const totalCollected = Number.parseFloat(collectedResult[0].total_collected || 0)
    const totalPending = Number.parseFloat(pendingResult[0].total_pending || 0)
    const totalAmount = totalCollected + totalPending
    const collectionRate = totalAmount > 0 ? Math.round((totalCollected / totalAmount) * 100) : 0

    return NextResponse.json({
      totalCollected,
      totalPending,
      totalStudents: Number.parseInt(studentsResult[0].total_students),
      collectionRate,
    })
  } catch (error) {
    console.error("Error fetching fee stats:", error)
    return NextResponse.json({ error: "Failed to fetch fee stats" }, { status: 500 })
  }
}
