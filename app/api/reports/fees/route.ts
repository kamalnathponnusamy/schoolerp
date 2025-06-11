import { type NextRequest } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const feesData = await sql(
      `SELECT 
        f.id,
        u.full_name as student_name,
        c.class_name,
        c.section,
        f.amount,
        f.due_date,
        f.status,
        f.payment_date,
        f.payment_method,
        f.receipt_number,
        f.transaction_id,
        f.remarks
      FROM fees f
      JOIN students s ON f.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      WHERE f.academic_year = '2024-25'
      ORDER BY f.due_date DESC, u.full_name`
    )

    return Response.json(feesData)
  } catch (error) {
    console.error("Error fetching fees reports:", error)
    return Response.json(
      { error: "Failed to fetch fees reports" },
      { status: 500 }
    )
  }
}
