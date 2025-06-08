import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

interface TimetableEntry {
  id: number
  class_id: number
  class_name: string
  section: string
  subject_id: number
  subject_name: string
  teacher_id: number
  teacher_name: string
  day_of_week: string
  start_time: string
  end_time: string
  room_number: string
  created_at: string
}

export async function GET() {
  try {
    const timetable = await sql<TimetableEntry>(`
      SELECT 
        t.id, t.class_id, c.class_name, c.section,
        t.subject_id, s.subject_name,
        t.teacher_id, u.full_name as teacher_name,
        t.day_of_week, t.start_time, t.end_time, t.room_number,
        t.created_at
      FROM timetable t
      JOIN classes c ON t.class_id = c.id
      JOIN subjects s ON t.subject_id = s.id
      JOIN users u ON t.teacher_id = u.id
      ORDER BY 
        FIELD(t.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
        t.start_time
    `)

    return NextResponse.json(timetable)
  } catch (error) {
    console.error("Error fetching timetable:", error)
    return NextResponse.json(
      { error: "Failed to fetch timetable" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      class_id,
      subject_id,
      teacher_id,
      day_of_week,
      start_time,
      end_time,
      room_number
    } = body

    const result = await sql(`
      INSERT INTO timetable (
        class_id, subject_id, teacher_id,
        day_of_week, start_time, end_time, room_number
      )
      VALUES (
        :class_id, :subject_id, :teacher_id,
        :day_of_week, :start_time, :end_time, :room_number
      )
    `, {
      class_id,
      subject_id,
      teacher_id,
      day_of_week,
      start_time,
      end_time,
      room_number
    })

    return NextResponse.json({ message: "Timetable entry created successfully" })
  } catch (error) {
    console.error("Error creating timetable entry:", error)
    return NextResponse.json(
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
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    await sql`DELETE FROM timetable WHERE id = ${id}`
    return NextResponse.json({ message: "Timetable entry deleted successfully" })
  } catch (error) {
    console.error("Error deleting timetable entry:", error)
    return NextResponse.json({ error: "Failed to delete timetable entry" }, { status: 500 })
  }
}
