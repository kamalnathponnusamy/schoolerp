import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

interface Student {
  id: number
  student_id: string
  user_id: number
  class_id: number
  admission_number: string
  admission_date: string
  father_name: string | null
  mother_name: string | null
  guardian_phone: string | null
  blood_group: string | null
  transport_opted: boolean
  transport_route_id: number | null
  status: string
  name: string
  email: string
  phone: string | null
  date_of_birth: string | null
  address: string | null
  class_name: string
  section: string
  transport_route: string | null
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const classFilter = searchParams.get("class")
    const searchTerm = searchParams.get("search")

    let students: Student[]

    if (classFilter && searchTerm) {
      // Both filters applied
      students = await sql<Student>(
        `SELECT 
          s.id,
          s.student_id,
          s.user_id,
          s.class_id,
          s.admission_number,
          s.admission_date,
          s.father_name,
          s.mother_name,
          s.guardian_phone,
          s.blood_group,
          s.transport_opted,
          s.transport_route_id,
          s.status,
          u.full_name as name,
          u.email,
          u.phone,
          u.date_of_birth,
          u.address,
          c.class_name,
          c.section,
          tr.route_name as transport_route
        FROM students s 
        LEFT JOIN users u ON s.user_id = u.id
        LEFT JOIN classes c ON s.class_id = c.id 
        LEFT JOIN transport_routes tr ON s.transport_route_id = tr.id
        WHERE s.status = 'active'
          AND c.class_name = ?
          AND (u.full_name LIKE ? 
               OR s.student_id LIKE ? 
               OR s.admission_number LIKE ?)
        ORDER BY u.full_name`,
        [classFilter, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
      )
    } else if (classFilter) {
      // Only class filter
      students = await sql<Student>(
        `SELECT 
          s.id,
          s.student_id,
          s.user_id,
          s.class_id,
          s.admission_number,
          s.admission_date,
          s.father_name,
          s.mother_name,
          s.guardian_phone,
          s.blood_group,
          s.transport_opted,
          s.transport_route_id,
          s.status,
          u.full_name as name,
          u.email,
          u.phone,
          u.date_of_birth,
          u.address,
          c.class_name,
          c.section,
          tr.route_name as transport_route
        FROM students s 
        LEFT JOIN users u ON s.user_id = u.id
        LEFT JOIN classes c ON s.class_id = c.id 
        LEFT JOIN transport_routes tr ON s.transport_route_id = tr.id
        WHERE s.status = 'active'
          AND c.class_name = ?
        ORDER BY u.full_name`,
        [classFilter]
      )
    } else if (searchTerm) {
      // Only search term
      students = await sql<Student>(
        `SELECT 
          s.id,
          s.student_id,
          s.user_id,
          s.class_id,
          s.admission_number,
          s.admission_date,
          s.father_name,
          s.mother_name,
          s.guardian_phone,
          s.blood_group,
          s.transport_opted,
          s.transport_route_id,
          s.status,
          u.full_name as name,
          u.email,
          u.phone,
          u.date_of_birth,
          u.address,
          c.class_name,
          c.section,
          tr.route_name as transport_route
        FROM students s 
        LEFT JOIN users u ON s.user_id = u.id
        LEFT JOIN classes c ON s.class_id = c.id 
        LEFT JOIN transport_routes tr ON s.transport_route_id = tr.id
        WHERE s.status = 'active'
          AND (u.full_name LIKE ? 
               OR s.student_id LIKE ? 
               OR s.admission_number LIKE ?)
        ORDER BY u.full_name`,
        [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
      )
    } else {
      // No filters
      students = await sql<Student>(
        `SELECT 
          s.id,
          s.student_id,
          s.user_id,
          s.class_id,
          s.admission_number,
          s.admission_date,
          s.father_name,
          s.mother_name,
          s.guardian_phone,
          s.blood_group,
          s.transport_opted,
          s.transport_route_id,
          s.status,
          u.full_name as name,
          u.email,
          u.phone,
          u.date_of_birth,
          u.address,
          c.class_name,
          c.section,
          tr.route_name as transport_route
        FROM students s 
        LEFT JOIN users u ON s.user_id = u.id
        LEFT JOIN classes c ON s.class_id = c.id 
        LEFT JOIN transport_routes tr ON s.transport_route_id = tr.id
        WHERE s.status = 'active'
        ORDER BY u.full_name`
      )
    }

    return NextResponse.json(students)
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    // Generate username from student_id
    const username = student_id.toLowerCase()

    // First create the user
    const userResult = await sql(
      `INSERT INTO users (
        username, email, password_hash, role, full_name, phone, date_of_birth, address
      ) VALUES (
        ?, ?, '$2b$10$defaulthash', 'student', ?, ?, ?, ?
      ) RETURNING id`,
      [username, email, date_of_birth, address, phone]
    )

    const userId = userResult[0].id

    // Then create the student record
    const studentResult = await sql(
      `INSERT INTO students (
        student_id, user_id, class_id, admission_number, admission_date,
        father_name, mother_name, guardian_phone, blood_group,
        transport_opted, transport_route_id, status
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, 'active'
      ) RETURNING *`,
      [student_id, userId, class_id, admission_number, admission_date,
        father_name, mother_name, guardian_phone, blood_group,
        transport_opted || false, transport_route_id]
    )

    return NextResponse.json(studentResult[0])
  } catch (error) {
    console.error("Error creating student:", error)
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 })
  }
}
