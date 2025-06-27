import { type NextRequest } from "next/server"
import { sql } from "@/lib/db"
import { getSessionUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  const user = await getSessionUser()
  if (!user || user.role !== "teacher") {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const records = await request.json()

  // Fetch teacher's allowed classes
  const teacher = await sql(`SELECT assigned_classes FROM teachers WHERE user_id = ?`, [user.userId])
  const allowedClasses = teacher[0]?.assigned_classes?.split(",") ?? []

  // Check all students are in allowed classes
  for (const record of records) {
    const [student] = await sql(`SELECT class_id FROM students WHERE id = ?`, [record.student_id])
    if (!allowedClasses.includes(String(student.class_id))) {
      return Response.json({ error: "Forbidden: Not your class" }, { status: 403 })
    }
  }

  try {
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
