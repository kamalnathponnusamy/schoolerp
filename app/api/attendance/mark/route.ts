import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { attendance } = await request.json()

    // Get current user (teacher) from session - for demo, use teacher ID 3
    const teacherId = 3

    // Delete existing attendance for the same date and students
    for (const record of attendance) {
      await sql`
        DELETE FROM attendance 
        WHERE student_id = ${record.student_id} AND date = ${record.date}
      `

      // Insert new attendance record
      await sql`
        INSERT INTO attendance (student_id, date, status, marked_by)
        VALUES (${record.student_id}, ${record.date}, ${record.status}, ${teacherId})
      `
    }

    return NextResponse.json({ message: "Attendance saved successfully" })
  } catch (error) {
    console.error("Error saving attendance:", error)
    return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 })
  }
}
