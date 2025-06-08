import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

interface Student {
  id: number
  student_id: string
  full_name: string
  email: string
  phone: string
  class_name: string
  section: string
  admission_number: string
  admission_date: string
  father_name?: string
  mother_name?: string
  guardian_phone?: string
  blood_group?: string
  transport_opted: boolean
  transport_route?: string
  status: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("class_id")
    const searchTerm = searchParams.get("search")
    const classFilter = searchParams.get("class")

    let students: Student[]

    if (classId) {
      // Fetch students for a specific class
      students = await sql<Student>(`
        SELECT 
          s.id,
          s.student_id,
          u.full_name,
          u.email,
          u.phone,
          c.class_name,
          c.section,
          s.admission_number,
          s.admission_date,
          s.father_name,
          s.mother_name,
          s.guardian_phone,
          s.blood_group,
          s.transport_opted,
          tr.route_name as transport_route,
          s.status
        FROM students s
        JOIN users u ON s.user_id = u.id
        JOIN classes c ON s.class_id = c.id
        LEFT JOIN transport_routes tr ON s.transport_route_id = tr.id
        WHERE s.class_id = ? AND s.status = 'active'
        ORDER BY u.full_name
      `, [classId])
    } else if (searchTerm || classFilter) {
      // Search with filters
      let query = `
        SELECT 
          s.id,
          s.student_id,
          u.full_name,
          u.email,
          u.phone,
          c.class_name,
          c.section,
          s.admission_number,
          s.admission_date,
          s.father_name,
          s.mother_name,
          s.guardian_phone,
          s.blood_group,
          s.transport_opted,
          tr.route_name as transport_route,
          s.status
        FROM students s
        JOIN users u ON s.user_id = u.id
        JOIN classes c ON s.class_id = c.id
        LEFT JOIN transport_routes tr ON s.transport_route_id = tr.id
        WHERE s.status = 'active'
      `
      
      const params: any[] = []
      
      if (searchTerm) {
        query += ` AND (u.full_name LIKE ? OR s.student_id LIKE ? OR s.admission_number LIKE ?)`
        params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`)
      }
      
      if (classFilter) {
        query += ` AND c.class_name = ?`
        params.push(classFilter)
      }
      
      query += ` ORDER BY u.full_name`
      
      students = await sql<Student>(query, params)
    } else {
      // Fetch all students
      students = await sql<Student>(`
        SELECT 
          s.id,
          s.student_id,
          u.full_name,
          u.email,
          u.phone,
          c.class_name,
          c.section,
          s.admission_number,
          s.admission_date,
          s.father_name,
          s.mother_name,
          s.guardian_phone,
          s.blood_group,
          s.transport_opted,
          tr.route_name as transport_route,
          s.status
        FROM students s
        JOIN users u ON s.user_id = u.id
        JOIN classes c ON s.class_id = c.id
        LEFT JOIN transport_routes tr ON s.transport_route_id = tr.id
        WHERE s.status = 'active'
        ORDER BY u.full_name
      `)
    }

    return NextResponse.json({ students })
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      student_id,
      full_name,
      email,
      phone,
      date_of_birth,
      address,
      class_id,
      admission_number,
      admission_date,
      father_name,
      mother_name,
      guardian_phone,
      blood_group,
      transport_opted,
      transport_route_id,
    } = body

    // Validate required fields
    if (!student_id || !full_name || !class_id || !admission_number || !admission_date) {
      return NextResponse.json(
        { error: "Missing required fields: student_id, full_name, class_id, admission_number, admission_date" },
        { status: 400 }
      )
    }

    // Generate username from student_id
    const username = student_id.toLowerCase()

    // First create the user
    const userResult = await sql(`
      INSERT INTO users (
        username, email, password_hash, role, full_name, phone, date_of_birth, address
      ) VALUES (
        ?, ?, '$2b$10$defaulthash', 'student', ?, ?, ?, ?
      )
    `, [username, email, full_name, phone, date_of_birth, address])

    if (!userResult || userResult.length === 0) {
      throw new Error("Failed to create user")
    }

    // Get the inserted user ID (MySQL returns insertId in result)
    const userId = (userResult as any).insertId

    // Then create the student record
    const studentResult = await sql(`
      INSERT INTO students (
        student_id, user_id, class_id, admission_number, admission_date,
        father_name, mother_name, guardian_phone, blood_group,
        transport_opted, transport_route_id, status
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, 'active'
      )
    `, [
      student_id, userId, class_id, admission_number, admission_date,
      father_name, mother_name, guardian_phone, blood_group,
      transport_opted || false, transport_route_id
    ])

    return NextResponse.json({
      message: "Student created successfully",
      student_id: student_id,
      user_id: userId
    })
  } catch (error) {
    console.error("Error creating student:", error)
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    )
  }
}