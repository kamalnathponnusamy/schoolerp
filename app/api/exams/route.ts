import { neon } from "@neondatabase/serverless"
import { type NextRequest, NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const exams = await sql`
      SELECT 
        e.*,
        CONCAT('EX', LPAD(e.id::text, 4, '0')) as exam_code,
        CONCAT(c.class_name, ' - ', c.section) as class_name,
        c.section,
        s.subject_name,
        COUNT(er.id) as results_entered
      FROM exams e
      LEFT JOIN classes c ON e.class_id = c.id
      LEFT JOIN subjects s ON e.subject_id = s.id
      LEFT JOIN exam_results er ON e.id = er.exam_id
      GROUP BY e.id, c.class_name, c.section, s.subject_name
      ORDER BY e.exam_date ASC
    `

    return NextResponse.json({ exams })
  } catch (error) {
    console.error("Error fetching exams:", error)
    return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      exam_name,
      exam_type,
      class_id,
      subject_id,
      exam_date,
      start_time,
      end_time,
      total_marks,
      passing_marks,
      syllabus,
    } = body

    // Validate required fields
    if (
      !exam_name ||
      !exam_type ||
      !class_id ||
      !subject_id ||
      !exam_date ||
      !start_time ||
      !end_time ||
      !total_marks ||
      !passing_marks
    ) {
      return NextResponse.json({ error: "All required fields must be provided" }, { status: 400 })
    }

    // Validate numeric fields
    const totalMarks = Number(total_marks)
    const passingMarks = Number(passing_marks)

    if (isNaN(totalMarks) || isNaN(passingMarks) || totalMarks <= 0 || passingMarks <= 0 || passingMarks > totalMarks) {
      return NextResponse.json({ error: "Invalid marks values" }, { status: 400 })
    }

    // Check for exam conflicts
    const conflicts = await sql`
      SELECT id FROM exams 
      WHERE class_id = ${class_id}
      AND exam_date = ${exam_date}
      AND (
        (start_time <= ${start_time} AND end_time > ${start_time}) OR
        (start_time < ${end_time} AND end_time >= ${end_time}) OR
        (start_time >= ${start_time} AND end_time <= ${end_time})
      )
    `

    if (conflicts.length > 0) {
      return NextResponse.json(
        { error: "There is already an exam scheduled for this class at this time" },
        { status: 400 },
      )
    }

    const result = await sql`
      INSERT INTO exams (
        exam_name, exam_type, class_id, subject_id, exam_date,
        start_time, end_time, total_marks, passing_marks, syllabus, status
      ) VALUES (
        ${exam_name}, ${exam_type}, ${class_id}, ${subject_id}, ${exam_date},
        ${start_time}, ${end_time}, ${totalMarks}, ${passingMarks}, ${syllabus || ""}, 'scheduled'
      ) RETURNING *
    `

    return NextResponse.json({
      exam: result[0],
      message: "Exam scheduled successfully",
    })
  } catch (error) {
    console.error("Error creating exam:", error)
    return NextResponse.json({ error: "Failed to create exam" }, { status: 500 })
  }
}
