import { type NextRequest } from "next/server"
import { sql } from "@/lib/db"

interface SqlResult {
  insertId: number
  affectedRows: number
}

interface TimetableEntry {
  id: number
  class_id: number
  subject_id: number
  teacher_id: number
  day_of_week: number
  start_time: string
  end_time: string
  room_number: string
  created_at: string
  class_name: string
  section: string
  subject_name: string
  teacher_name: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId") || searchParams.get("class_id")
    const teacherId = searchParams.get("teacher_id")

    console.log('Timetable API called with params:', { classId, teacherId })

    let query = `
      SELECT 
        t.id,
        t.day_of_week,
        t.start_time,
        t.end_time,
        t.subject_id,
        s.subject_name,
        t.teacher_id,
        u.full_name as teacher_name,
        t.class_id,
        c.class_name,
        c.section,
        t.room_number
      FROM timetable t
      JOIN subjects s ON t.subject_id = s.id
      JOIN users u ON t.teacher_id = u.id
      JOIN classes c ON t.class_id = c.id
      WHERE 1=1
    `
    const params: any[] = []

    if (classId) {
      query += " AND t.class_id = ?"
      params.push(classId)
    }

    if (teacherId) {
      query += " AND t.teacher_id = ?"
      params.push(teacherId)
    }

    query += " ORDER BY t.day_of_week, t.start_time"

    console.log('Executing query:', query, 'with params:', params)

    const timetable = await sql<TimetableEntry[]>(query, params)
    console.log('Query result:', timetable)

    return Response.json(timetable)
  } catch (error) {
    console.error("Error fetching timetable:", error)
    return Response.json(
      { error: "Failed to fetch timetable" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { day_of_week, start_time, end_time, subject_id, teacher_id, class_id, room_number } = await request.json()

    if (!day_of_week || !start_time || !end_time || !subject_id || !teacher_id || !class_id) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const result = await sql(
      `INSERT INTO timetable (day_of_week, start_time, end_time, subject_id, teacher_id, class_id, room_number)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [day_of_week, start_time, end_time, subject_id, teacher_id, class_id, room_number]
    )

    const insertId = (result as any).insertId

    return Response.json({ message: "Timetable entry created successfully", id: insertId })
  } catch (error) {
    console.error("Error creating timetable entry:", error)
    return Response.json(
      { error: "Failed to create timetable entry" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return Response.json(
        { error: "Timetable entry ID is required" },
        { status: 400 }
      )
    }

    await sql(
      "DELETE FROM timetable WHERE id = ?",
      [id]
    )

    return Response.json({ message: "Timetable entry deleted successfully" })
  } catch (error) {
    console.error("Error deleting timetable entry:", error)
    return Response.json(
      { error: "Failed to delete timetable entry" },
      { status: 500 }
    )
  }
}
