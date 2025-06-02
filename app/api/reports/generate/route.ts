import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const format = searchParams.get("format")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const classFilter = searchParams.get("class")

    if (!type || !format) {
      return NextResponse.json({ error: "Type and format are required" }, { status: 400 })
    }

    let reportData: any[] = []
    let reportTitle = ""

    // Fetch actual data based on report type
    switch (type) {
      case "attendance":
        reportTitle = "Attendance Report"
        reportData = await sql`
          SELECT 
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
          ${dateFrom ? sql`AND a.date >= ${dateFrom}` : sql``}
          ${dateTo ? sql`AND a.date <= ${dateTo}` : sql``}
          GROUP BY a.date, c.class_name, c.section
          ORDER BY a.date DESC
          LIMIT 100
        `
        break

      case "fees":
        reportTitle = "Fee Collection Report"
        reportData = await sql`
          SELECT 
            CONCAT(u.full_name) as student_name,
            CONCAT(c.class_name, ' - ', c.section) as class,
            f.amount,
            f.due_date,
            f.payment_date,
            f.status,
            f.payment_method
          FROM fees f
          LEFT JOIN students s ON f.student_id = s.id
          LEFT JOIN users u ON s.user_id = u.id
          LEFT JOIN classes c ON s.class_id = c.id
          WHERE 1=1
          ${dateFrom ? sql`AND f.due_date >= ${dateFrom}` : sql``}
          ${dateTo ? sql`AND f.due_date <= ${dateTo}` : sql``}
          ORDER BY f.due_date DESC
          LIMIT 100
        `
        break

      case "academic":
        reportTitle = "Academic Performance Report"
        reportData = await sql`
          SELECT 
            CONCAT(u.full_name) as student_name,
            CONCAT(c.class_name, ' - ', c.section) as class,
            s.subject_name,
            e.exam_name,
            er.marks_obtained,
            e.total_marks,
            ROUND((er.marks_obtained * 100.0 / e.total_marks), 2) as percentage
          FROM exam_results er
          LEFT JOIN students st ON er.student_id = st.id
          LEFT JOIN users u ON st.user_id = u.id
          LEFT JOIN classes c ON st.class_id = c.id
          LEFT JOIN exams e ON er.exam_id = e.id
          LEFT JOIN subjects s ON e.subject_id = s.id
          WHERE er.marks_obtained IS NOT NULL
          ORDER BY er.created_at DESC
          LIMIT 100
        `
        break

      case "transport":
        reportTitle = "Transport Usage Report"
        reportData = await sql`
          SELECT 
            tr.route_name,
            tr.vehicle_number,
            tr.driver_name,
            tr.capacity,
            COUNT(s.id) as students_count,
            tr.monthly_fee,
            (COUNT(s.id) * tr.monthly_fee) as monthly_revenue
          FROM transport_routes tr
          LEFT JOIN students s ON s.transport_route_id = tr.id
          GROUP BY tr.id, tr.route_name, tr.vehicle_number, tr.driver_name, tr.capacity, tr.monthly_fee
          ORDER BY students_count DESC
        `
        break

      case "inventory":
        reportTitle = "Inventory Report"
        reportData = await sql`
          SELECT 
            i.item_code,
            i.item_name,
            i.category,
            i.available_quantity,
            i.issued_quantity,
            i.unit_price,
            i.supplier,
            i.min_stock_level,
            CASE 
              WHEN i.available_quantity <= i.min_stock_level THEN 'Low Stock'
              WHEN i.available_quantity = 0 THEN 'Out of Stock'
              ELSE 'In Stock'
            END as status
          FROM inventory i
          ORDER BY i.category, i.item_name
        `
        break

      case "demographics":
        reportTitle = "Student Demographics Report"
        reportData = await sql`
          SELECT 
            CONCAT(c.class_name, ' - ', c.section) as class,
            COUNT(CASE WHEN s.gender = 'male' THEN 1 END) as boys,
            COUNT(CASE WHEN s.gender = 'female' THEN 1 END) as girls,
            COUNT(*) as total_students,
            AVG(EXTRACT(YEAR FROM AGE(s.date_of_birth))) as average_age
          FROM students s
          LEFT JOIN classes c ON s.class_id = c.id
          GROUP BY c.class_name, c.section
          ORDER BY c.class_name, c.section
        `
        break

      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
    }

    // Generate report content
    const content = generateReportContent(reportTitle, reportData, format, {
      dateFrom,
      dateTo,
      classFilter,
    })

    const headers: Record<string, string> = {
      "Content-Disposition": `attachment; filename="${type}_report_${new Date().toISOString().split("T")[0]}.${format === "pdf" ? "pdf" : "csv"}"`,
    }

    if (format === "pdf") {
      headers["Content-Type"] = "application/pdf"
      // For demo purposes, we'll return a text file that can be opened
      // In production, you'd use a PDF library like jsPDF or Puppeteer
      return new NextResponse(content, { headers })
    } else {
      headers["Content-Type"] = "text/csv"
      return new NextResponse(content, { headers })
    }
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
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
