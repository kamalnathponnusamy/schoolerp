import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split("\n")
    const headers = lines[0].split(",").map((h) => h.trim())

    let successCount = 0
    const errors: string[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))

      try {
        // Generate unique student ID
        const studentIdResult = await sql(
          `SELECT COALESCE(MAX(CAST(SUBSTRING(student_id, 4) AS UNSIGNED)), 0) + 1 as next_id
           FROM students 
           WHERE student_id LIKE 'STU%'`
        )

        const nextId = studentIdResult[0].next_id
        const studentId = `STU${nextId.toString().padStart(4, "0")}`

        // Validate class_id
        const classId = parseInt(values[5])
        if (isNaN(classId)) {
          throw new Error(`Invalid class_id: ${values[5]}. Class ID must be a number.`)
        }

        // Verify class exists
        const classExists = await sql(
          `SELECT id FROM classes WHERE id = ?`,
          [classId]
        )
        if (classExists.length === 0) {
          throw new Error(`Class with ID ${classId} does not exist.`)
        }

        // Create user first
        await sql(
          `INSERT INTO users (username, email, password_hash, role, full_name, phone, date_of_birth, address)
           VALUES (?, ?, '$2a$10$defaulthash', 'student', ?, ?, ?, ?)`,
          [
            values[1] || `student${nextId}@school.edu`,
            values[1] || `student${nextId}@school.edu`,
            values[0],
            values[2],
            values[3],
            values[4]
          ]
        )

        // Get the inserted user's ID
        const userIdResult = await sql(`SELECT LAST_INSERT_ID() as id`)
        const userId = userIdResult[0].id

        // Create student record
        await sql(
          `INSERT INTO students (
            student_id, user_id, class_id, admission_number, admission_date,
            father_name, mother_name, guardian_phone, blood_group, transport_opted
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            studentId,
            userId,
            classId,
            values[6] || `ADM2024${nextId.toString().padStart(3, "0")}`,
            new Date().toISOString().split("T")[0],
            values[7],
            values[8],
            values[9],
            values[10],
            values[11] === "true"
          ]
        )

        successCount++
      } catch (error) {
        console.error(`Error processing line ${i + 1}:`, error)
        errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      message: `Successfully uploaded ${successCount} students`,
      count: successCount,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error("Error in bulk upload:", error)
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    )
  }
}
