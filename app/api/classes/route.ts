import { type NextRequest, NextResponse } from "next/server";
import pool from "@/lib/mysql";

export async function GET() {
  try {
    const [classes] = await pool.query(`
      SELECT 
        c.id,
        c.class_name,
        c.section,
        c.academic_year,
        t.name as teacher_name,  -- ✅ Changed from t.full_name
        COUNT(s.id) as student_count
      FROM classes c
      LEFT JOIN teachers t ON c.class_teacher_id = t.id
      LEFT JOIN students s ON c.id = s.class_id
      GROUP BY c.id, c.class_name, c.section, c.academic_year, t.name
      ORDER BY 
        CASE 
          WHEN c.class_name = 'LKG' THEN 0
          WHEN c.class_name = 'UKG' THEN 1
          WHEN c.class_name REGEXP '^Class [0-9]+$' THEN CAST(SUBSTRING_INDEX(c.class_name, ' ', -1) AS UNSIGNED) + 1
          ELSE 999
        END,
        c.section
    `);

    const [[{ count: totalClasses }]] = await pool.query(`
      SELECT COUNT(*) as count FROM classes
    `);
    const [[{ count: totalSections }]] = await pool.query(`
      SELECT COUNT(DISTINCT CONCAT(class_name, section)) as count FROM classes
    `);
    const [[{ count: totalStudents }]] = await pool.query(`
      SELECT COUNT(*) as count FROM students WHERE status = 'active'
    `);

    return NextResponse.json({
      classes,
      summary: {
        totalClasses,
        totalSections,
        totalStudents,
      },
    });
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { class_name, section, class_teacher_id, academic_year } = await request.json();

    if (!class_name || !section || !academic_year) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [existingClass] = await pool.query(
      `SELECT id FROM classes WHERE class_name = ? AND section = ? AND academic_year = ?`,
      [class_name, section, academic_year]
    );

    if (existingClass.length > 0) {
      return NextResponse.json({ error: "Class with this name and section already exists" }, { status: 400 });
    }

    const [result] = await pool.query(
      `INSERT INTO classes (class_name, section, class_teacher_id, academic_year) VALUES (?, ?, ?, ?)`,
      [class_name, section, class_teacher_id || null, academic_year]
    );

    return NextResponse.json({
      message: "Class created successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating class:", error);
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
  }
}
