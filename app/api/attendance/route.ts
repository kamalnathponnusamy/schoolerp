import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { sendPushNotification } from "@/lib/notifications";

// Utility to decode session
function getSessionUser(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("session-token")?.value;
    if (!sessionToken) return null;
    const data = JSON.parse(Buffer.from(sessionToken, "base64").toString("utf8"));
    return data; // e.g., { userId, role, username }
  } catch {
    return null;
  }
}

// === GET Handler ===
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const class_id = searchParams.get("class_id");
  const date = searchParams.get("date");

  if (!class_id || !date) {
    return NextResponse.json({ error: "Missing class_id or date" }, { status: 400 });
  }

  try {
    const records = await sql<any>(
      `SELECT student_id, status FROM attendance WHERE class_id = ? AND date = ?`,
      [class_id, date]
    );

    return NextResponse.json({ attendance: records });
  } catch (err) {
    console.error("GET attendance error:", err);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

// === POST Handler ===
export async function POST(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user || user.role !== "teacher") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { class_id, date, attendance } = await req.json();

    if (!class_id || !date || !Array.isArray(attendance)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Save or update attendance
    await Promise.all(
      attendance.map((entry: { student_id: string; status: "present" | "absent" }) =>
        sql(
          `INSERT INTO attendance (class_id, student_id, date, status, updated_at)
           VALUES (?, ?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE status = ?, updated_at = NOW()`,
          [class_id, entry.student_id, date, entry.status, entry.status]
        )
      )
    );

    // Get class info
    const [classInfo] = await sql<{ class_name: string; section: string }>(
      `SELECT class_name, section FROM classes WHERE id = ? LIMIT 1`,
      [class_id]
    );
    const className = classInfo ? `${classInfo.class_name}-${classInfo.section}` : "class";

    // Notify absent students
    const absentees = attendance.filter((s) => s.status === "absent");

    if (absentees.length > 0) {
      for (const entry of absentees) {
        const [student] = await sql<{ full_name: string; user_id: number }>(
          `SELECT u.full_name, s.user_id
           FROM students s
           JOIN users u ON s.user_id = u.id
           WHERE s.id = ? LIMIT 1`,
          [entry.student_id]
        );

        const [tokenRow] = await sql<{ token: string }>(
          `SELECT token FROM push_tokens WHERE user_id = ? AND role = 'student' LIMIT 1`,
          [student?.user_id]
        );

        if (tokenRow?.token) {
          await sendPushNotification({
            to: tokenRow.token,
            title: "Absent Notice",
            body: `${student?.full_name} marked absent on ${date} for ${className}`,
          });
        }
      }

      // Notify teacher
      const absentNames = absentees.map(async (entry) => {
        const [s] = await sql<{ full_name: string; user_id: number }>(
          `SELECT u.full_name, s.user_id
           FROM students s
           JOIN users u ON s.user_id = u.id
           WHERE s.id = ? LIMIT 1`,
          [entry.student_id]
        );
        return s?.full_name;
      });

      const resolvedNames = (await Promise.all(absentNames)).filter(Boolean).join(", ");

      const teacherTokens = await sql<{ token: string }>(
        `SELECT DISTINCT pt.token
         FROM class_teachers ct
         JOIN push_tokens pt ON ct.teacher_id = pt.user_id
         WHERE ct.class_id = ? AND pt.role = 'teacher'`,
        [class_id]
      );

      await Promise.all(
        teacherTokens.map((t) =>
          sendPushNotification({
            to: t.token,
            title: "Attendance Update",
            body: `Absent on ${date} in ${className}: ${resolvedNames}`,
          })
        )
      );
    }

    return NextResponse.json({ success: true, message: "Attendance saved" });
  } catch (err) {
    console.error("POST attendance error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
