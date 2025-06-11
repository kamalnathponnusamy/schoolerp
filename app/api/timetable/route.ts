import { type NextRequest } from "next/server"
import { sql } from "@/lib/db"

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

interface SqlResult {
  insertId: number
  affectedRows: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId")

    const timetable = await sql(
      `SELECT 
        t.id,
        t.day,
        t.time_slot,
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
      WHERE t.class_id = ?
      ORDER BY 
        CASE t.day
          WHEN 'Monday' THEN 1
          WHEN 'Tuesday' THEN 2
          WHEN 'Wednesday' THEN 3
          WHEN 'Thursday' THEN 4
          WHEN 'Friday' THEN 5
          WHEN 'Saturday' THEN 6
          WHEN 'Sunday' THEN 7
        END,
        t.time_slot`,
      [classId]
    )

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
    const { day, time_slot, subject_id, teacher_id, class_id, room_number } = await request.json()

    if (!day || !time_slot || !subject_id || !teacher_id || !class_id) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const [result] = await sql<SqlResult[]>(
      `INSERT INTO timetable (day, time_slot, subject_id, teacher_id, class_id, room_number)
       VALUES (?, ?, ?, ?, ?, ?)
       RETURNING id`,
      [day, time_slot, subject_id, teacher_id, class_id, room_number]
    )

    return Response.json({ message: "Timetable entry created successfully", id: result.insertId })
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
