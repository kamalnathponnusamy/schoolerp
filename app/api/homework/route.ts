import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { writeFile } from "fs/promises"
import { join } from "path"

export async function GET() {
  try {
    const homework = await sql(`
      SELECT h.*, u.full_name as assigned_by
      FROM homework h
      LEFT JOIN users u ON h.teacher_id = u.id
      ORDER BY h.due_date DESC
    `)
    return NextResponse.json(homework)
  } catch (error) {
    console.error("Error fetching homework:", error)
    return NextResponse.json(
      { error: "Failed to fetch homework" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const subject_id = formData.get('subject_id') as string
    const class_id = formData.get('class_id') as string
    const due_date = formData.get('due_date') as string
    const attachment = formData.get('attachment') as File

    // Get user ID from the session
    const userData = await fetch('/api/auth/me', {
      credentials: 'include',
    }).then(res => res.json())

    if (!userData || !userData.id) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      )
    }

    // Get teacher's name
    const teacherResult = await sql({
      sql: `
        SELECT u.full_name
        FROM teachers t
        JOIN users u ON t.user_id = u.id
        WHERE t.user_id = ?
      `,
      values: [userData.id]
    })

    if (!teacherResult || teacherResult.length === 0) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      )
    }

    const teacherName = teacherResult[0].full_name

    // Handle file upload if present
    let attachmentPath = null
    if (attachment) {
      const bytes = await attachment.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'homework')
      await writeFile(join(uploadsDir, attachment.name), buffer)
      attachmentPath = `/uploads/homework/${attachment.name}`
    }

    // Insert homework record
    const result = await sql({
      sql: `
        INSERT INTO homework (
          title,
          description,
          subject_id,
          class_id,
          due_date,
          assigned_by,
          attachment_path,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        RETURNING id
      `,
      values: [
        title,
        description,
        subject_id,
        class_id,
        due_date,
        teacherName,
        attachmentPath
      ]
    })

    return NextResponse.json({
      message: "Homework assigned successfully",
      homework_id: result[0].id
    })
  } catch (error) {
    console.error("Error creating homework:", error)
    return NextResponse.json(
      { error: "Failed to create homework" },
      { status: 500 }
    )
  }
} 