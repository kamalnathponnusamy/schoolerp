import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

interface Attendance {
  id: number;
  student_id: number;
  student_name: string;
  class_name: string;
  section: string;
  status: 'present' | 'absent' | 'late' | 'half_day';
  date: string;
  marked_by: number;
  marked_by_name: string;
  remarks: string | null;
  created_at: string;
}

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const attendance = await sql<Attendance>(`
      SELECT 
        a.id, a.student_id, 
        us.full_name as student_name,
        c.class_name, c.section,
        a.status, a.date, a.marked_by,
        um.full_name as marked_by_name,
        a.remarks, a.created_at
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN users us ON s.user_id = us.id
      JOIN classes c ON s.class_id = c.id
      JOIN users um ON a.marked_by = um.id
      WHERE a.date = ?
      ORDER BY c.class_name, c.section, us.full_name
    `, [today]);

    // Transform the data to match the frontend's expected format
    const formattedAttendance = attendance.map(record => ({
      id: record.id,
      student_id: record.student_id.toString(),
      student_name: record.student_name,
      class_name: record.class_name,
      section: record.section,
      status: record.status,
      date: record.date,
      marked_by_teacher: record.marked_by_name
    }));

    return NextResponse.json({ attendance: formattedAttendance });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { student_id, status, date, marked_by, remarks } = body;

    // Validate status
    if (!['present', 'absent', 'late', 'half_day'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Check if attendance already exists for this student and date
    const existing = await sql(`
      SELECT id FROM attendance 
      WHERE student_id = ? AND date = ?
    `, [student_id, date]);

    if (existing.length > 0) {
      // Update existing attendance
      await sql(`
        UPDATE attendance 
        SET status = ?, marked_by = ?, remarks = ?
        WHERE id = ?
      `, [status, marked_by, remarks, existing[0].id]);
    } else {
      // Insert new attendance
      await sql(`
        INSERT INTO attendance (student_id, status, date, marked_by, remarks)
        VALUES (?, ?, ?, ?, ?)
      `, [student_id, status, date, marked_by, remarks]);
    }

    return NextResponse.json({ message: "Attendance recorded successfully" });
  } catch (error) {
    console.error("Error recording attendance:", error);
    return NextResponse.json(
      { error: "Failed to record attendance" },
      { status: 500 }
    );
  }
}
