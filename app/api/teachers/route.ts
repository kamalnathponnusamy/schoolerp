import { type NextRequest } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const teachers = await sql(
      `SELECT 
        t.id,
        t.teacher_id,
        t.name,
        t.subject,
        t.phone,
        t.email,
        t.assigned_classes,
        t.qualification,
        t.experience_years,
        t.salary,
        t.joining_date,
        t.photo_url,
        t.qr_code,
        t.status,
        t.created_at
      FROM teachers t
      WHERE t.status = 'active'
      ORDER BY t.name`
    )

    return Response.json(teachers)
  } catch (error) {
    console.error("Error fetching teachers:", error)
    return Response.json(
      { error: "Failed to fetch teachers" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      teacher_id,
      name,
      subject,
      phone,
      email,
      assigned_classes,
      qualification,
      experience_years,
      salary,
      joining_date,
      photo_url,
      qr_code
    } = await request.json()

    if (!teacher_id || !name || !email) {
      return Response.json(
        { error: "Teacher ID, name, and email are required" },
        { status: 400 }
      )
    }

    // Create the teacher record
    const teacherResponse = await sql(
      `INSERT INTO teachers (
        teacher_id, name, subject, phone, email,
        assigned_classes, qualification, experience_years,
        salary, joining_date, photo_url, qr_code, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        teacher_id, name, subject, phone, email,
        assigned_classes, qualification, experience_years,
        salary, joining_date, photo_url, qr_code
      ]
    )
    console.log("Teacher SQL Response:", teacherResponse)

    // Assuming teacherResponse is an array where the first element contains insertId for INSERT operations
    const teacherResult = Array.isArray(teacherResponse) ? teacherResponse[0] : teacherResponse;

    return Response.json({
      message: "Teacher created successfully",
      id: teacherResult.insertId
    })
  } catch (error) {
    console.error("Error creating teacher:", error)
    return Response.json(
      { error: "Failed to create teacher" },
      { status: 500 }
    )
  }
}
