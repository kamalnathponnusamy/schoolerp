import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';
import { sendPushNotification } from '@/lib/notifications';

type AttendanceEntry = {
  student_id: number;
  status: 'present' | 'absent';
};

// ✅ Correct non-async cookie reader for app/api
function getSessionUser(req: NextRequest) {
  try {
    const cookieStore = cookies(); // cookies() is synchronous here
    const sessionToken = cookieStore.get('session-token')?.value;
    if (!sessionToken) return null;

    const data = JSON.parse(
      Buffer.from(sessionToken, 'base64').toString('utf8')
    );
    return data; // e.g., { userId, role, username }
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user || user.role !== 'teacher') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { class_id, date, attendance } = body as {
    class_id: number;
    date: string;
    attendance: AttendanceEntry[];
  };

  if (!class_id || !date || !Array.isArray(attendance)) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  try {
    // 1. Save attendance
    await Promise.all(
      attendance.map((entry) =>
        sql(
          `INSERT INTO attendance (class_id, student_id, date, status, updated_at)
           VALUES (?, ?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE status = ?, updated_at = NOW()`,
          [class_id, entry.student_id, date, entry.status, entry.status]
        )
      )
    );

    // 2. Get class name
    const [classResult] = await sql(
      `SELECT class_name, section FROM classes WHERE id = ? LIMIT 1`,
      [class_id]
    );
    const classInfo = classResult
      ? `${classResult.class_name}-${classResult.section}`
      : 'your class';

    // 3. Filter absentees
    const absentList = attendance.filter((a) => a.status === 'absent');
    if (absentList.length === 0) {
      return NextResponse.json({ success: true, message: 'No absentees today' });
    }

    // 4. Get absent student names and tokens
    const absentTokens = await Promise.all(
      absentList.map(async (entry) => {
        const [studentRow] = await sql(
          `SELECT u.full_name, s.user_id
           FROM students s
           JOIN users u ON s.user_id = u.id
           WHERE s.id = ? LIMIT 1`,
          [entry.student_id]
        );

        const [tokenRow] = await sql(
          `SELECT token FROM push_tokens WHERE user_id = ? AND role = 'student' LIMIT 1`,
          [studentRow?.user_id]
        );

        return {
          full_name: studentRow?.full_name || 'Student',
          token: tokenRow?.token || null,
        };
      })
    );

    // 5. Notify absent students
    await Promise.all(
      absentTokens.map(({ token, full_name }) => {
        if (!token) return;
        return sendPushNotification({
          to: token,
          title: 'Absent Notice',
          body: `${full_name}, you were marked absent on ${date} for ${classInfo}.`,
        });
      })
    );

    // 6. Get teacher tokens for this class
    const teacherRows = await sql(
      `SELECT DISTINCT pt.token
       FROM class_teachers ct
       JOIN push_tokens pt ON ct.teacher_id = pt.user_id
       WHERE ct.class_id = ? AND pt.role = 'teacher'`,
      [class_id]
    );

    // 7. Notify teachers about absentees
    const absentNames = absentTokens.map((s) => s.full_name).join(', ');
    const teacherNotice = `Absent on ${date} in ${classInfo}: ${absentNames}`;

    await Promise.all(
      teacherRows
        .filter((row: any) => !!row.token)
        .map((row: any) =>
          sendPushNotification({
            to: row.token,
            title: 'Attendance Update',
            body: teacherNotice,
          })
        )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error in POST /api/attendance:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
