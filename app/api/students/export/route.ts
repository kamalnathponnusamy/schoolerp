import { type NextRequest } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "json"

    const students = await sql(
      `SELECT 
        s.student_id,
        s.admission_number,
        u.full_name,
        u.email,
        u.phone,
        u.date_of_birth,
        u.gender,
        u.address,
        c.class_name,
        c.section,
        COALESCE(tr.route_name, 'No Transport') as transport_route,
        CASE 
          WHEN f.status = 'paid' THEN 'Paid'
          WHEN f.status = 'pending' THEN 'Pending'
          ELSE 'Not Set'
        END as fee_status,
        s.status,
        s.created_at,
        s.updated_at
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      LEFT JOIN transport_routes tr ON s.transport_route_id = tr.id
      LEFT JOIN fees f ON s.id = f.student_id AND f.academic_year = '2024-25' AND f.term = 'Q1'
      WHERE s.status = 'active'
      ORDER BY u.full_name`
    )

    if (format === "csv") {
      const headers = [
        "Student ID",
        "Admission Number",
        "Full Name",
        "Email",
        "Phone",
        "Date of Birth",
        "Gender",
        "Address",
        "Class",
        "Section",
        "Transport Route",
        "Fee Status",
        "Status",
        "Created At",
        "Updated At"
      ]

      const csvContent = [
        headers.join(","),
        ...students.map(student => [
          student.student_id,
          student.admission_number,
          student.full_name,
          student.email,
          student.phone,
          student.date_of_birth,
          student.gender,
          student.address,
          student.class_name,
          student.section,
          student.transport_route,
          student.fee_status,
          student.status,
          student.created_at,
          student.updated_at
        ].join(","))
      ].join("\n")

      return new Response(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=students.csv"
        }
      })
    }

    return Response.json(students)
  } catch (error) {
    console.error("Error exporting students:", error)
    return Response.json(
      { error: "Failed to export students" },
      { status: 500 }
    )
  }
}
