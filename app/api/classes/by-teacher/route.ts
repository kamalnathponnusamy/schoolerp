import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { decode } from "jsonwebtoken"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded: any = decode(token)

    if (!decoded?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const userId = decoded.id

    const classes = await sql({
      sql: `
        SELECT DISTINCT 
          c.id, 
          c.class_name, 
          c.section,
          c.class_teacher_id,
          u.full_name as teacher_name,
          c.academic_year,
          (
            SELECT COUNT(DISTINCT s.id)
            FROM students s
            WHERE s.class_id = c.id 
            AND s.status = 'active'
          ) as student_count
        FROM classes c
        LEFT JOIN users u ON c.class_teacher_id = u.id
        WHERE c.class_teacher_id = (
          SELECT teacher_id 
          FROM teachers 
          WHERE user_id = ?
        )
        ORDER BY c.class_name, c.section
      `,
      values: [userId]
    })

    return NextResponse.json(classes) // remove `{ classes }` to match frontend expectation

  } catch (error) {
    console.error("Error fetching teacher's classes:", error)
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    )
  }
}
