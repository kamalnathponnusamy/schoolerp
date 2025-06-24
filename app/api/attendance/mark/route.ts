import { type NextRequest } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const records = await request.json()

    if (!Array.isArray(records)) {
      return Response.json(
        { error: "Invalid request format" },
        { status: 400 }
      )
    }

    for (const record of records) {
      // Delete existing attendance record for the same date
      await sql(
        "DELETE FROM attendance WHERE student_id = ? AND date = ?",
        [record.student_id, record.date]
      )

      // Insert new attendance record
      await sql(
        "INSERT INTO attendance (student_id, date, status, remarks) VALUES (?, ?, ?, ?)",
        [record.student_id, record.date, record.status, record.remarks || null]
      )
    }

    return Response.json({ message: "Attendance marked successfully" })
  } catch (error) {
    console.error("Error marking attendance:", error)
    return Response.json(
      { error: "Failed to mark attendance" },
      { status: 500 }
    )
  }
}
