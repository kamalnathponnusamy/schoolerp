import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId")

    if (!classId) {
      return NextResponse.json({ error: "Class ID is required" }, { status: 400 })
    }

    const students = await sql`
      SELECT 
        s.id, s.student_id, u.full_name
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.class_id = ${classId} AND s.status = 'active'
      ORDER BY u.full_name
    `

    return NextResponse.json({ students })
  } catch (error) {
    console.error("Error fetching students by class:", error)
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}
