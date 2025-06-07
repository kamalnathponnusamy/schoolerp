import { type NextRequest, NextResponse } from "next/server";
import pool from "@/lib/mysql";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classFilter = searchParams.get("class");
    const searchTerm = searchParams.get("search");

    let query = `
      SELECT 
        s.id,
        s.student_id,
        s.user_id,
        s.class_id,
        s.admission_number,
        s.admission_date,
        s.father_name,
        s.mother_name,
        s.guardian_phone,
        s.blood_group,
        s.transport_opted,
        s.transport_route_id,
        s.status,
        u.full_name as name,
        u.email,
        u.phone,
        u.date_of_birth,
        u.address,
        c.class_name,
        c.section,
        tr.route_name as transport_route
      FROM students s 
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN classes c ON s.class_id = c.id 
      LEFT JOIN transport_routes tr ON s.transport_route_id = tr.id
      WHERE s.status = 'active'
    `;

    const params: any[] = [];

    if (classFilter) {
      query += ` AND c.class_name = ?`;
      params.push(classFilter);
    }

    if (searchTerm) {
      query += ` AND (
        u.full_name LIKE ? OR
        s.student_id LIKE ? OR
        s.admission_number LIKE ?
      )`;
      const searchPattern = `%${searchTerm}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ` ORDER BY u.full_name`;

    const [students] = await pool.query(query, params);

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      student_id,
      full_name,
      email,
      phone,
      date_of_birth,
      address,
      class_id,
      admission_number,
      admission_date,
      father_name,
      mother_name,
      guardian_phone,
      blood_group,
      transport_opted,
      transport_route_id,
    } = body;

    const username = student_id.toLowerCase();

    // Insert user
    const [userResult]: any = await pool.query(
      `
      INSERT INTO users (
        username, email, password_hash, role, full_name, phone, date_of_birth, address
      ) VALUES (?, ?, ?, 'student', ?, ?, ?, ?)
    `,
      [
        username,
        email,
        '$2b$10$defaulthash',
        full_name,
        phone,
        date_of_birth,
        address,
      ]
    );

    const userId = userResult.insertId;

    // Insert student
    const [studentResult]: any = await pool.query(
      `
      INSERT INTO students (
        student_id, user_id, class_id, admission_number, admission_date,
        father_name, mother_name, guardian_phone, blood_group,
        transport_opted, transport_route_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `,
      [
        student_id,
        userId,
        class_id,
        admission_number,
        admission_date,
        father_name,
        mother_name,
        guardian_phone,
        blood_group,
        transport_opted || false,
        transport_route_id,
      ]
    );

    // Fetch inserted student record (optional)
    const [result]: any = await pool.query(
      `
      SELECT 
        s.id, s.student_id, s.admission_number, s.admission_date,
        s.father_name, s.mother_name, s.guardian_phone, s.blood_group,
        s.transport_opted, s.status,
        u.full_name, u.email, u.phone, u.date_of_birth, u.address,
        c.class_name, c.section,
        tr.route_name
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      LEFT JOIN transport_routes tr ON s.transport_route_id = tr.id
      WHERE s.id = ?
    `,
      [studentResult.insertId]
    );

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}
