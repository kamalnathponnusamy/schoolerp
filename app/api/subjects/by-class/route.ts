import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId")

    if (!classId) {
      return NextResponse.json({ error: "Class ID is required" }, { status: 400 })
    }

    const subjects = await sql`
      SELECT id, subject_name, class_id
      FROM subjects
      WHERE class_id = ${classId}
      ORDER BY subject_name
    `

    return NextResponse.json({ subjects })
  } catch (error) {
    console.error("Error fetching subjects by class:", error)
    return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 })
  }
}
