import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

interface Exam {
  id: number
  exam_name: string
  exam_type: string
  class_id: number
  subject_id: number
  exam_date: string
  start_time: string
  end_time: string
  total_marks: number
  passing_marks: number
  syllabus: string | null
  status: string
  exam_code: string
  class_name: string
  section: string
  subject_name: string
  results_entered: number
}

export async function GET() {
  try {
    const exams = await sql<Exam>(`
      SELECT 
        e.*,
        CONCAT('EX', LPAD(e.id, 4, '0')) as exam_code,
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
    `)

    return NextResponse.json({ exams })
  } catch (error) {
    console.error("Error fetching exams:", error)
    return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received exam data:', JSON.stringify(body, null, 2))

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

    // Validate required fields with detailed error messages
    const missingFields = []
    if (!exam_name) missingFields.push('exam_name')
    if (!exam_type) missingFields.push('exam_type')
    if (!class_id) missingFields.push('class_id')
    if (!subject_id) missingFields.push('subject_id')
    if (!exam_date) missingFields.push('exam_date')
    if (!start_time) missingFields.push('start_time')
    if (!end_time) missingFields.push('end_time')
    if (!total_marks) missingFields.push('total_marks')
    if (!passing_marks) missingFields.push('passing_marks')

    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields)
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate exam_type
    const validExamTypes = ['unit_test', 'quarterly', 'half_yearly', 'annual']
    console.log('Exam type validation:', {
      received: exam_type,
      type: typeof exam_type,
      validTypes: validExamTypes,
      isValid: validExamTypes.includes(exam_type)
    })
    
    if (!validExamTypes.includes(exam_type)) {
      console.log('Invalid exam type:', exam_type)
      return NextResponse.json(
        { error: `Invalid exam type. Must be one of: ${validExamTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate numeric fields
    const totalMarks = Number(total_marks)
    const passingMarks = Number(passing_marks)

    if (isNaN(totalMarks) || isNaN(passingMarks)) {
      console.log('Invalid marks values:', { total_marks, passing_marks })
      return NextResponse.json(
        { error: "Marks must be valid numbers" },
        { status: 400 }
      )
    }

    if (totalMarks <= 0 || passingMarks <= 0) {
      console.log('Marks must be positive:', { totalMarks, passingMarks })
      return NextResponse.json(
        { error: "Marks must be positive numbers" },
        { status: 400 }
      )
    }

    if (passingMarks > totalMarks) {
      console.log('Passing marks cannot be greater than total marks:', { totalMarks, passingMarks })
      return NextResponse.json(
        { error: "Passing marks cannot be greater than total marks" },
        { status: 400 }
      )
    }

    // First, ensure the table has the required columns
    const columns = await sql(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'exams' 
      AND TABLE_SCHEMA = DATABASE()
    `)

    const existingColumns = columns.map((col: any) => col.COLUMN_NAME)

    // Add missing columns one by one
    if (!existingColumns.includes('start_time')) {
      await sql('ALTER TABLE exams ADD COLUMN start_time TIME')
    }
    if (!existingColumns.includes('end_time')) {
      await sql('ALTER TABLE exams ADD COLUMN end_time TIME')
    }
    if (!existingColumns.includes('passing_marks')) {
      await sql('ALTER TABLE exams ADD COLUMN passing_marks INTEGER')
    }
    if (!existingColumns.includes('syllabus')) {
      await sql('ALTER TABLE exams ADD COLUMN syllabus TEXT')
    }
    if (!existingColumns.includes('status')) {
      await sql("ALTER TABLE exams ADD COLUMN status VARCHAR(20) DEFAULT 'scheduled'")
    }

    // Then insert the exam
    await sql(`
      INSERT INTO exams (
        exam_name, exam_type, class_id, subject_id, exam_date,
        start_time, end_time, max_marks, passing_marks, syllabus, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')
    `, [
      exam_name,
      exam_type,
      class_id,
      subject_id,
      exam_date,
      start_time,
      end_time,
      totalMarks,
      passingMarks,
      syllabus || null
    ])

    // Fetch the inserted exam using LAST_INSERT_ID()
    const [insertedExam] = await sql<Exam>(`
      SELECT 
        e.*,
        CONCAT('EX', LPAD(e.id, 4, '0')) as exam_code,
        CONCAT(c.class_name, ' - ', c.section) as class_name,
        c.section,
        s.subject_name,
        0 as results_entered
      FROM exams e
      LEFT JOIN classes c ON e.class_id = c.id
      LEFT JOIN subjects s ON e.subject_id = s.id
      WHERE e.id = LAST_INSERT_ID()
    `)

    return NextResponse.json({
      exam: insertedExam,
      message: "Exam scheduled successfully",
    })
  } catch (error) {
    console.error("Error creating exam:", error)
    return NextResponse.json({ error: "Failed to create exam" }, { status: 500 })
  }
}
