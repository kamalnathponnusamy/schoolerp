import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { sendPushNotification } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teacher_id, class_id, date, attendance } = body;

    if (!teacher_id || !class_id || !date || !attendance || !Array.isArray(attendance)) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    }

    // Delete existing attendance records (for resubmission)
    await sql('DELETE FROM attendance WHERE class_id = ? AND date = ?', [class_id, date]);

    for (const student of attendance) {
      await sql(
        'INSERT INTO attendance (class_id, student_id, date, status) VALUES (?, ?, ?, ?)',
        [class_id, student.student_id, date, student.status]
      );

      if (student.status === 'absent') {
        const [tokenRow] = await sql(
          'SELECT token FROM push_tokens WHERE user_id = ? AND role = ? LIMIT 1',
          [student.student_id, 'student']
        );

        const token = tokenRow?.token;
        if (token) {
          console.log(`Sending absent notification to student ${student.student_id}`);
          await sendPushNotification({
            to: token,
            title: 'Absence Alert',
            body: 'You have been marked absent today.',
          });
        }
      }
    }

    const [teacherRow] = await sql(
      'SELECT token FROM push_tokens WHERE user_id = ? AND role = ? LIMIT 1',
      [teacher_id, 'teacher']
    );

    const teacherToken = teacherRow?.token;
    if (teacherToken) {
      console.log(`Sending success notification to teacher ${teacher_id}`);
      await sendPushNotification({
        to: teacherToken,
        title: 'Attendance',
        body: 'Attendance marked successfully!',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in attendance POST route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const class_id = searchParams.get('class_id');
  const date = searchParams.get('date');

  if (!class_id || !date) {
    return NextResponse.json({ error: 'Missing class_id or date' }, { status: 400 });
  }

  try {
    const [results] = await sql(
      'SELECT student_id, status FROM attendance WHERE class_id = ? AND date = ?',
      [class_id, date]
    );

    return NextResponse.json({ attendance: results || [] });
  } catch (error) {
    console.error('Error in attendance GET route:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}
