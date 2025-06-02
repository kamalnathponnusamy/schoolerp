import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "json"

    const students = await sql`
      SELECT 
        s.student_id,
        s.admission_number,
        u.full_name as name,
        u.email,
        u.phone,
        u.date_of_birth,
        u.address,
        c.class_name,
        c.section,
        s.father_name,
        s.mother_name,
        s.guardian_phone,
        s.blood_group,
        s.transport_opted,
        tr.route_name as transport_route,
        s.admission_date,
        s.status
      FROM students s 
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN classes c ON s.class_id = c.id 
      LEFT JOIN transport_routes tr ON s.transport_route_id = tr.id
      WHERE s.status = 'active'
      ORDER BY u.full_name
    `

    if (format === "csv") {
      const headers = [
        "Student ID",
        "Admission Number",
        "Name",
        "Email",
        "Phone",
        "Date of Birth",
        "Address",
        "Class",
        "Section",
        "Father's Name",
        "Mother's Name",
        "Guardian Phone",
        "Blood Group",
        "Transport Opted",
        "Transport Route",
        "Admission Date",
        "Status",
      ]

      const csvContent = [
        headers.join(","),
        ...students.map((student) =>
          [
            student.student_id,
            student.admission_number,
            `"${student.name}"`,
            student.email,
            student.phone,
            student.date_of_birth,
            `"${student.address}"`,
            student.class_name,
            student.section,
            `"${student.father_name || ""}"`,
            `"${student.mother_name || ""}"`,
            student.guardian_phone || "",
            student.blood_group || "",
            student.transport_opted ? "Yes" : "No",
            `"${student.transport_route || ""}"`,
            student.admission_date,
            student.status,
          ].join(","),
        ),
      ].join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=students.csv",
        },
      })
    }

    return NextResponse.json(students)
  } catch (error) {
    console.error("Error exporting students:", error)
    return NextResponse.json({ error: "Failed to export students" }, { status: 500 })
  }
}
