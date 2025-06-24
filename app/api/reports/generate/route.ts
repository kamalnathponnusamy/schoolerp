import { type NextRequest } from "next/server"
import { sql } from "@/lib/db"

interface AttendanceReport {
  date: string
  class: string
  present: number
  absent: number
  percentage: number
}

interface FeeReport {
  student_id: string
  student_name: string
  class: string
  total_amount: number
  paid_amount: number
  pending_amount: number
  due_date: string
  status: string
}

interface ExamReport {
  exam_name: string
  class: string
  subject: string
  total_students: number
  passed: number
  failed: number
  average_score: number
  highest_score: number
  lowest_score: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const format = searchParams.get("format")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const classFilter = searchParams.get("class")

    if (!type || !format) {
      return Response.json({ error: "Type and format are required" }, { status: 400 })
    }

    let reportData: any[] = []
    let reportTitle = ""

    // Fetch actual data based on report type
    switch (type) {
      case "attendance":
        reportTitle = "Attendance Report"
        reportData = await sql<AttendanceReport>(
          `SELECT 
            a.date,
            CONCAT(c.class_name, ' - ', c.section) as class,
            COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present,
            COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent,
            ROUND(
              (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(*)), 2
            ) as percentage
          FROM attendance a
          LEFT JOIN students s ON a.student_id = s.id
          LEFT JOIN classes c ON s.class_id = c.id
          WHERE 1=1
          ${dateFrom ? 'AND a.date >= ?' : ''}
          ${dateTo ? 'AND a.date <= ?' : ''}
          GROUP BY a.date, c.class_name, c.section
          ORDER BY a.date DESC
          LIMIT 100`,
          [dateFrom, dateTo].filter(Boolean)
        )
        break

      case "fees":
        reportTitle = "Fee Collection Report"
        reportData = await sql<FeeReport>(
          `SELECT 
            s.student_id,
            u.full_name as student_name,
            CONCAT(c.class_name, ' - ', c.section) as class,
            f.total_amount,
            f.paid_amount,
            (f.total_amount - f.paid_amount) as pending_amount,
            f.due_date,
            f.status
          FROM fees f
          JOIN students s ON f.student_id = s.id
          JOIN users u ON s.user_id = u.id
          JOIN classes c ON s.class_id = c.id
          WHERE 1=1
          ${dateFrom ? 'AND f.due_date >= ?' : ''}
          ${dateTo ? 'AND f.due_date <= ?' : ''}
          ${classFilter ? 'AND c.class_name = ?' : ''}
          ORDER BY f.due_date DESC`,
          [dateFrom, dateTo, classFilter].filter(Boolean)
        )
        break

      case "exams":
        reportTitle = "Exam Results Report"
        reportData = await sql<ExamReport>(
          `SELECT 
            e.exam_name,
            CONCAT(c.class_name, ' - ', c.section) as class,
            s.subject_name as subject,
            COUNT(DISTINCT er.student_id) as total_students,
            COUNT(CASE WHEN er.marks_obtained >= e.passing_marks THEN 1 END) as passed,
            COUNT(CASE WHEN er.marks_obtained < e.passing_marks THEN 1 END) as failed,
            ROUND(AVG(er.marks_obtained), 2) as average_score,
            MAX(er.marks_obtained) as highest_score,
            MIN(er.marks_obtained) as lowest_score
          FROM exams e
          JOIN classes c ON e.class_id = c.id
          JOIN subjects s ON e.subject_id = s.id
          LEFT JOIN exam_results er ON e.id = er.exam_id
          WHERE 1=1
          ${dateFrom ? 'AND e.exam_date >= ?' : ''}
          ${dateTo ? 'AND e.exam_date <= ?' : ''}
          ${classFilter ? 'AND c.class_name = ?' : ''}
          GROUP BY e.id, c.class_name, c.section, s.subject_name
          ORDER BY e.exam_date DESC`,
          [dateFrom, dateTo, classFilter].filter(Boolean)
        )
        break

      default:
        return Response.json({ error: "Invalid report type" }, { status: 400 })
    }

    return Response.json({
      title: reportTitle,
      type,
      format,
      data: reportData,
      generated_at: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error generating report:", error)
    return Response.json({ error: "Failed to generate report" }, { status: 500 })
  }
}

function generateReportContent(title: string, data: any[], format: string, filters: any) {
  const timestamp = new Date().toLocaleString()

  if (format === "pdf") {
    // Generate PDF-like content (in production, use proper PDF library)
    let content = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length ${title.length + 200}
>>
stream
BT
/F1 12 Tf
50 750 Td
(${title}) Tj
0 -20 Td
(Generated: ${timestamp}) Tj
0 -30 Td
(Total Records: ${data.length}) Tj
`

    if (data.length > 0) {
      content += `
0 -20 Td
(Data Summary:) Tj
`
      data.slice(0, 10).forEach((row, index) => {
        const rowText = Object.values(row).join(" | ")
        content += `
0 -15 Td
(${index + 1}. ${rowText.substring(0, 80)}...) Tj`
      })
    }

    content += `
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
${content.length - 100}
%%EOF`

    return content
  } else {
    // Generate CSV content
    if (data.length === 0) {
      return `${title}\nGenerated: ${timestamp}\nNo data available for the selected criteria.`
    }

    const headers = Object.keys(data[0])
    let csvContent = `${title}\n`
    csvContent += `Generated: ${timestamp}\n`
    csvContent += `Total Records: ${data.length}\n\n`
    csvContent += headers.join(",") + "\n"

    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header]
        // Escape commas and quotes in CSV
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value || ""
      })
      csvContent += values.join(",") + "\n"
    })

    return csvContent
  }
}
