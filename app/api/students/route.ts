import { neon } from "@neondatabase/serverless"
import { type NextRequest, NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const classFilter = searchParams.get("class")
    const searchTerm = searchParams.get("search")

    let students

    if (classFilter && searchTerm) {
      // Both filters applied
      students = await sql`
        SELECT 
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
          AND c.class_name = ${classFilter}
          AND (u.full_name ILIKE ${`%${searchTerm}%`} 
               OR s.student_id ILIKE ${`%${searchTerm}%`} 
               OR s.admission_number ILIKE ${`%${searchTerm}%`})
        ORDER BY u.full_name
      `
    } else if (classFilter) {
      // Only class filter
      students = await sql`
        SELECT 
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
          AND c.class_name = ${classFilter}
        ORDER BY u.full_name
      `
    } else if (searchTerm) {
      // Only search term
      students = await sql`
        SELECT 
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
          AND (u.full_name ILIKE ${`%${searchTerm}%`} 
               OR s.student_id ILIKE ${`%${searchTerm}%`} 
               OR s.admission_number ILIKE ${`%${searchTerm}%`})
        ORDER BY u.full_name
      `
    } else {
      // No filters
      students = await sql`
        SELECT 
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
        ORDER BY u.full_name
      `
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
    const userResult = await sql`
      INSERT INTO users (
        username, email, password_hash, role, full_name, phone, date_of_birth, address
      ) VALUES (
        ${username}, ${email}, '$2b$10$defaulthash', 'student', ${full_name}, ${phone}, ${date_of_birth}, ${address}
      ) RETURNING id
    `

    const userId = userResult[0].id

    // Then create the student record
    const studentResult = await sql`
      INSERT INTO students (
        student_id, user_id, class_id, admission_number, admission_date,
        father_name, mother_name, guardian_phone, blood_group,
        transport_opted, transport_route_id, status
      ) VALUES (
        ${student_id}, ${userId}, ${class_id}, ${admission_number}, ${admission_date},
        ${father_name}, ${mother_name}, ${guardian_phone}, ${blood_group},
        ${transport_opted || false}, ${transport_route_id}, 'active'
      ) RETURNING *
    `

    return NextResponse.json(studentResult[0])
  } catch (error) {
    console.error("Error creating student:", error)
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 })
  }
}
