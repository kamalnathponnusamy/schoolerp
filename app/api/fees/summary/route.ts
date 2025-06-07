import { NextResponse } from "next/server";
import pool from "@/lib/mysql";

export async function GET() {
  try {
    const [feesSummary] = await pool.query(`
      SELECT 
        f.id,
        f.academic_year,
        f.term,
        f.total_amount,
        f.paid_amount,
        f.due_date,
        f.status,
        u.full_name AS student_name,
        s.student_id,
        c.class_name,
        c.section
      FROM fees f
      JOIN students s ON f.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      ORDER BY f.due_date DESC
    `);

    return NextResponse.json({ fees: feesSummary });
  } catch (error) {
    console.error("Error fetching fees:", error);
    return NextResponse.json({ error: "Failed to fetch fees" }, { status: 500 });
  }
}
