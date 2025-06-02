import { neon } from "@neondatabase/serverless"
import { type NextRequest, NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get("teacher_id")
    const classId = searchParams.get("class_id")

    let query = `
      SELECT 
        t.id,
        t.class_id,
        t.subject_id,
        t.teacher_id,
        t.day_of_week,
        t.start_time,
        t.end_time,
        t.room_number,
        CONCAT(c.class_name, ' - ', c.section) as class_name,
        c.section,
        s.subject_name,
        u.full_name as teacher_name
      FROM timetable t
      LEFT JOIN classes c ON t.class_id = c.id
      LEFT JOIN subjects s ON t.subject_id = s.id
      LEFT JOIN teachers te ON t.teacher_id = te.id
      LEFT JOIN users u ON te.user_id = u.id
      WHERE 1=1
    `

    const params: any[] = []

    if (teacherId) {
      query += ` AND t.teacher_id = $${params.length + 1}`
      params.push(teacherId)
    }

    if (classId) {
      query += ` AND t.class_id = $${params.length + 1}`
      params.push(classId)
    }

    query += " ORDER BY t.day_of_week, t.start_time"

    const timetable = await sql(query, params)
    return NextResponse.json(timetable)
  } catch (error) {
    console.error("Error fetching timetable:", error)
    return NextResponse.json({ error: "Failed to fetch timetable" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room_number } = body

    // Validate required fields
    if (!class_id || !subject_id || !teacher_id || !day_of_week || !start_time || !end_time || !room_number) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check for teacher conflicts
    const conflicts = await sql`
      SELECT id FROM timetable 
      WHERE teacher_id = ${teacher_id} 
      AND day_of_week = ${day_of_week}
      AND (
        (start_time <= ${start_time} AND end_time > ${start_time}) OR
        (start_time < ${end_time} AND end_time >= ${end_time}) OR
        (start_time >= ${start_time} AND end_time <= ${end_time})
      )
    `

    if (conflicts.length > 0) {
      return NextResponse.json({ error: "Teacher has a conflicting schedule at this time" }, { status: 400 })
    }

    // Check for classroom conflicts
    const roomConflicts = await sql`
      SELECT id FROM timetable 
      WHERE room_number = ${room_number}
      AND day_of_week = ${day_of_week}
      AND (
        (start_time <= ${start_time} AND end_time > ${start_time}) OR
        (start_time < ${end_time} AND end_time >= ${end_time}) OR
        (start_time >= ${start_time} AND end_time <= ${end_time})
      )
    `

    if (roomConflicts.length > 0) {
      return NextResponse.json({ error: "Room is already booked at this time" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO timetable (
        class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room_number
      ) VALUES (
        ${class_id}, ${subject_id}, ${teacher_id}, ${day_of_week}, ${start_time}, ${end_time}, ${room_number}
      ) RETURNING *
    `

    return NextResponse.json({
      timetable: result[0],
      message: "Timetable entry created successfully",
    })
  } catch (error) {
    console.error("Error creating timetable entry:", error)
    return NextResponse.json({ error: "Failed to create timetable entry" }, { status: 500 })
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
