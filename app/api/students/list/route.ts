export const dynamic = "force-dynamic"

import { type NextRequest } from "next/server"
import { sql } from "@/lib/db"

interface Student {
  id: number
  student_id: string
  admission_number: string
  admission_date: string
  father_name: string
  mother_name: string
  guardian_phone: string
  blood_group: string
  transport_opted: boolean
  status: string
  full_name: string
  email: string
  phone: string
  date_of_birth: string
  address: string
  class_name: string
  section: string
  route_name: string | null
  transport_fee: number | null
}

export async function GET() {
  try {
    const students = await sql<Student>(
      `SELECT 
        s.id, s.student_id, s.admission_number, s.admission_date,
        s.father_name, s.mother_name, s.guardian_phone, s.blood_group,
        s.transport_opted, s.status,
        u.full_name, u.email, u.phone, u.date_of_birth, u.address,
        c.class_name, c.section,
        tr.route_name, tr.monthly_fee as transport_fee
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      LEFT JOIN transport_routes tr ON s.transport_route_id = tr.id
      WHERE s.status = 'active'
      ORDER BY u.full_name`
    )

    return Response.json(students)
  } catch (error) {
    console.error("Error fetching students:", error)
    return Response.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}
