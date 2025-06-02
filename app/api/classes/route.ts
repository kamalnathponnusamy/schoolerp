import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Get classes with student counts and teacher information
    const classes = await sql`
      SELECT 
        c.id,
        c.class_name,
        c.section,
        c.academic_year,
        t.full_name as teacher_name,
        COUNT(s.id) as student_count
      FROM classes c
      LEFT JOIN teachers t ON c.class_teacher_id = t.id
      LEFT JOIN students s ON c.id = s.class_id
      GROUP BY c.id, c.class_name, c.section, c.academic_year, t.full_name
      ORDER BY 
        CASE 
          WHEN c.class_name = 'LKG' THEN 0
          WHEN c.class_name = 'UKG' THEN 1
          ELSE CAST(SUBSTRING(c.class_name FROM 'Class ([0-9]+)') AS INTEGER) + 1
        END,
        c.section
    `

    // Get summary statistics
    const totalClasses = await sql`SELECT COUNT(*) as count FROM classes`
    const totalSections = await sql`SELECT COUNT(DISTINCT CONCAT(class_name, section)) as count FROM classes`
    const totalStudents = await sql`SELECT COUNT(*) as count FROM students WHERE status = 'active'`

    return NextResponse.json({
      classes,
      summary: {
        totalClasses: totalClasses[0].count,
        totalSections: totalSections[0].count,
        totalStudents: totalStudents[0].count,
      },
    })
  } catch (error) {
    console.error("Error fetching classes:", error)
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { class_name, section, class_teacher_id, academic_year } = await request.json()

    // Validate required fields
    if (!class_name || !section || !academic_year) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if class already exists
    const existingClass = await sql`
      SELECT id FROM classes 
      WHERE class_name = ${class_name} AND section = ${section} AND academic_year = ${academic_year}
    `

    if (existingClass.length > 0) {
      return NextResponse.json({ error: "Class with this name and section already exists" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO classes (class_name, section, class_teacher_id, academic_year)
      VALUES (${class_name}, ${section}, ${class_teacher_id || null}, ${academic_year})
      RETURNING id
    `

    return NextResponse.json({
      message: "Class created successfully",
      id: result[0].id,
    })
  } catch (error) {
    console.error("Error creating class:", error)
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 })
  }
}
