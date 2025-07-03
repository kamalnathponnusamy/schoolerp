import { type NextRequest } from "next/server"
import { sql } from "@/lib/db"
import { NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // First check if user exists
    const user = await sql(
      "SELECT * FROM users WHERE id = ?",
      [id]
    )

    if (!user || user.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Delete the user
    await sql(
      "DELETE FROM users WHERE id = ?",
      [id]
    )

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const teacherId = request.nextUrl.searchParams.get("teacherId");
  if (!teacherId) return NextResponse.json({ error: "Missing teacherId" }, { status: 400 });

  // Assigned Classes
  const classes = await sql(
    `SELECT c.* FROM classes c
     JOIN teacher_classes tc ON c.id = tc.class_id
     WHERE tc.teacher_id = ?`,
    [teacherId]
  );

  // Schedule logic removed: No schedule table exists.

  // Homework / Assignments
  const homework = await sql(
    `SELECT h.*, c.class_name, s.subject_name
     FROM homework h
     JOIN classes c ON h.class_id = c.id
     JOIN subjects s ON h.subject_id = s.id
     WHERE h.teacher_id = ? ORDER BY h.due_date DESC LIMIT 5`,
    [teacherId]
  );

  // Notices / Announcements
  const notices = await sql(
    `SELECT * FROM notifications
     WHERE role = 'teacher' OR user_id = ?
     ORDER BY sent_at DESC LIMIT 5`,
    [teacherId]
  );

  return NextResponse.json({
    classes,
    homework,
    notices,
  });
}
