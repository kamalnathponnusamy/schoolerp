import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

interface AttendancePayload {
  class_id: string
  date: string
  attendance: {
    student_id: string
    status: "present" | "absent"
  }[]
}

interface AttendanceRecord {
  id: number
  student_id: string
  student_name: string
  class_name: string
  section: string
  status: "present" | "absent"
  date: string
  marked_by_teacher: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("class_id")
    const date = searchParams.get("date")

    if (!classId || !date) {
      return NextResponse.json(
        { error: "class_id and date parameters are required" },
        { status: 400 }
      )
    }

    const attendance = await sql<AttendanceRecord>(`
      SELECT 
        a.id,
        s.student_id,
        u.full_name as student_name,
        c.class_name,
        c.section,
        a.status,
        a.date,
        um.full_name as marked_by_teacher
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      LEFT JOIN users um ON a.marked_by = um.id
      WHERE s.class_id = ? AND a.date = ?
      ORDER BY u.full_name
    `, [classId, date])

    return NextResponse.json({ attendance })
  } catch (error) {
    console.error("Error fetching attendance:", error)
    return NextResponse.json(
      { error: "Failed to fetch attendance records" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body: AttendancePayload = await request.json()
    const { class_id, date, attendance } = body

    // Validate required fields
    if (!class_id || !date || !attendance || !Array.isArray(attendance)) {
      return NextResponse.json(
        { error: "class_id, date, and attendance array are required" },
        { status: 400 }
      )
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      )
    }

    // Validate attendance records
    for (const record of attendance) {
      if (!record.student_id || !record.status) {
        return NextResponse.json(
          { error: "Each attendance record must have student_id and status" },
          { status: 400 }
        )
      }
      
      if (!["present", "absent"].includes(record.status)) {
        return NextResponse.json(
          { error: "Status must be either 'present' or 'absent'" },
          { status: 400 }
        )
      }
    }

    // Get current user (teacher) from session - for demo, use teacher ID 1
    const teacherId = 1

    // Begin transaction by processing each attendance record
    const results = []
    
    for (const record of attendance) {
      try {
        // Check if attendance already exists for this student and date
        const existing = await sql(`
          SELECT id FROM attendance 
          WHERE student_id = ? AND date = ?
        `, [record.student_id, date])

        if (existing.length > 0) {
          // Update existing attendance
          await sql(`
            UPDATE attendance 
            SET status = ?, marked_by = ?
            WHERE student_id = ? AND date = ?
          `, [record.status, teacherId, record.student_id, date])
          
          results.push({ student_id: record.student_id, action: "updated" })
        } else {
          // Insert new attendance record
          await sql(`
            INSERT INTO attendance (student_id, date, status, marked_by)
            VALUES (?, ?, ?, ?)
          `, [record.student_id, date, record.status, teacherId])
          
          results.push({ student_id: record.student_id, action: "created" })
        }
      } catch (recordError) {
        console.error(`Error processing attendance for student ${record.student_id}:`, recordError)
        results.push({ 
          student_id: record.student_id, 
          action: "error", 
          error: "Failed to process attendance" 
        })
      }
    }

    const successCount = results.filter(r => r.action === "created" || r.action === "updated").length
    const errorCount = results.filter(r => r.action === "error").length

    return NextResponse.json({
      message: `Attendance processed successfully. ${successCount} records saved${errorCount > 0 ? `, ${errorCount} errors` : ""}`,
      results,
      summary: {
        total: attendance.length,
        success: successCount,
        errors: errorCount
      }
    })
  } catch (error) {
    console.error("Error saving attendance:", error)
    return NextResponse.json(
      { error: "Failed to save attendance records" },
      { status: 500 }
    )
  }
}