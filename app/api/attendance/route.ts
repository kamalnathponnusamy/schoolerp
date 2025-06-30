import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/db'
import { sendPushNotification } from '@/lib/notifications'

function getSessionUser() {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('session-token')?.value
    if (!sessionToken) return null
    const data = JSON.parse(Buffer.from(sessionToken, 'base64').toString('utf8'))
    return data // { userId, username, role, full_name }
  } catch {
    return null
  }
}

// GET handler - return attendance for a class on a given date
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const classId = searchParams.get('class_id')
  const date = searchParams.get('date')

  if (!classId || !date) {
    return NextResponse.json({ error: 'Missing class_id or date' }, { status: 400 })
  }

  try {
    const result = await sql(
      `SELECT student_id, status FROM attendance WHERE class_id = ? AND date = ?`,
      [classId, date]
    )

    return NextResponse.json({ attendance: result })
  } catch (error) {
    console.error('GET attendance error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST handler - mark attendance
export async function POST(request: NextRequest) {
  const user = getSessionUser()
  if (!user || user.role !== 'teacher') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { class_id, date, attendance } = await request.json()

    if (!class_id || !date || !Array.isArray(attendance)) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Save or update attendance
    await Promise.all(
      attendance.map((entry: { student_id: number; status: string }) =>
        sql(
          `INSERT INTO attendance (class_id, student_id, date, status, updated_at)
           VALUES (?, ?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE status = ?, updated_at = NOW()`,
          [class_id, entry.student_id, date, entry.status, entry.status]
        )
      )
    )

    // Get class name
    const [classInfo] = await sql(
      `SELECT class_name, section FROM classes WHERE id = ? LIMIT 1`,
      [class_id]
    )
    const className = classInfo
      ? `${classInfo.class_name}-${classInfo.section}`
      : 'your class'

    // Handle absent students
    const absentList = attendance.filter((a) => a.status === 'absent')
    if (absentList.length > 0) {
      const absentTokens = await Promise.all(
        absentList.map(async (entry) => {
          const [studentRow] = await sql(
            `SELECT u.full_name, s.user_id
             FROM students s
             JOIN users u ON s.user_id = u.id
             WHERE s.id = ? LIMIT 1`,
            [entry.student_id]
          )

          if (!studentRow?.user_id) return null

          const [tokenRow] = await sql(
            `SELECT token FROM push_tokens WHERE user_id = ? AND role = 'student' LIMIT 1`,
            [studentRow.user_id]
          )

          return {
            full_name: studentRow.full_name,
            token: tokenRow?.token || null,
          }
        })
      )

      // Notify students
      await Promise.all(
        absentTokens
          .filter((s) => s?.token)
          .map((s) =>
            sendPushNotification({
              to: s!.token!,
              title: 'Absent Notice',
              body: `${s!.full_name}, you were marked absent on ${date} in ${className}.`,
            })
          )
      )

      // Notify teacher(s)
      const teacherRows = await sql(
        `SELECT pt.token
         FROM class_teachers ct
         JOIN push_tokens pt ON ct.teacher_id = pt.user_id
         WHERE ct.class_id = ? AND pt.role = 'teacher'`,
        [class_id]
      )

      const absentNames = absentTokens.map((s) => s?.full_name).filter(Boolean).join(', ')
      const notice = `Absent on ${date} in ${className}: ${absentNames}`

      await Promise.all(
        teacherRows
          .filter((row) => row.token)
          .map((row) =>
            sendPushNotification({
              to: row.token,
              title: 'Attendance Update',
              body: notice,
            })
          )
      )
    }

    return NextResponse.json({ success: true, message: 'Attendance submitted successfully' })
  } catch (error) {
    console.error('POST attendance error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
