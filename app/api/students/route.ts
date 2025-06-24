import { type NextRequest } from "next/server"
import { sql } from "@/lib/db"

interface Student {
  id: number
  student_id: string
  user_id: number | null
  class_id: number | null
  admission_number: string
  admission_date: string
  father_name: string | null
  mother_name: string | null
  guardian_phone: string | null
  blood_group: string | null
  transport_opted: boolean
  transport_route_id: number | null
  fee_structure: any | null
  status: 'active' | 'inactive' | 'graduated'
  created_at: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("class_id")
    const searchTerm = searchParams.get("search")
    const classFilter = searchParams.get("class")

    let students: Student[] = []
    let query = `
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
        s.fee_structure,
        s.status,
        s.created_at,
        u.full_name,
        u.email,
        u.phone,
        c.class_name,
        c.section,
        tr.route_name as transport_route
      FROM students s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN transport_routes tr ON s.transport_route_id = tr.id
      WHERE s.status = 'active'
    `
    
    const params: any[] = []
    
    if (classId) {
      query += ` AND s.class_id = ?`
      params.push(classId)
    }
    
    if (searchTerm) {
      query += ` AND (u.full_name LIKE ? OR s.student_id LIKE ? OR s.admission_number LIKE ?)`
      params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`)
    }
    
    if (classFilter) {
      query += ` AND c.class_name = ?`
      params.push(classFilter)
    }
    
    query += ` ORDER BY s.admission_number`
    
    students = await sql<Student>(query, params)

    return Response.json(students)
  } catch (error) {
    console.error("Error fetching students:", error)
    return Response.json(
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
      user_id,
      class_id,
      admission_number,
      admission_date,
      father_name,
      mother_name,
      guardian_phone,
      blood_group,
      transport_opted,
      transport_route_id,
      fee_structure
    } = body

    // Validate required fields
    if (!student_id || !admission_number || !admission_date) {
      return Response.json(
        { error: "Missing required fields: student_id, admission_number, admission_date" },
        { status: 400 }
      )
    }

    // Create the student record
    const studentResult = await sql<{ insertId: number }>(`
      INSERT INTO students (
        student_id, user_id, class_id, admission_number, admission_date,
        father_name, mother_name, guardian_phone, blood_group,
        transport_opted, transport_route_id, fee_structure, status
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, 'active'
      )
    `, [
      student_id, user_id, class_id, admission_number, admission_date,
      father_name, mother_name, guardian_phone, blood_group,
      transport_opted || false, transport_route_id, fee_structure
    ])

    return Response.json({
      message: "Student created successfully",
      id: studentResult[0].insertId
    })
  } catch (error) {
    console.error("Error creating student:", error)
    return Response.json(
      { error: "Failed to create student" },
      { status: 500 }
    )
  }
}