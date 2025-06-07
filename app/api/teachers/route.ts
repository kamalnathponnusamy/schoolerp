import { type NextRequest, NextResponse } from "next/server";
import pool from "@/lib/mysql";

export async function GET() {
  try {
    const [teachers] = await pool.query(`
      SELECT 
        t.id,
        t.teacher_id,
        u.full_name,
        u.email,
        u.phone,
        t.subject,
        t.qualification,
        t.experience_years,
        t.salary,
        t.status
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      ORDER BY u.full_name
    `);

    return NextResponse.json({ teachers });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json({ error: "Failed to fetch teachers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      teacher_id,
      full_name,
      email,
      phone,
      subject,
      qualification,
      experience_years,
      salary,
    } = body;

    const username = teacher_id.toLowerCase();

    const [userResult]: any = await pool.query(
      `
      INSERT INTO users (
        username, email, password_hash, role, full_name, phone
      ) VALUES (?, ?, ?, 'teacher', ?, ?)
    `,
      [username, email, '$2b$10$defaulthash', full_name, phone]
    );

    const userId = userResult.insertId;

    const [teacherResult]: any = await pool.query(
      `
      INSERT INTO teachers (
        teacher_id, user_id, subject, qualification, experience_years, salary, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'active')
    `,
      [teacher_id, userId, subject, qualification, experience_years, salary]
    );

    return NextResponse.json({ message: "Teacher added successfully", id: teacherResult.insertId });
  } catch (error) {
    console.error("Error creating teacher:", error);
    return NextResponse.json({ error: "Failed to create teacher" }, { status: 500 });
  }
}
