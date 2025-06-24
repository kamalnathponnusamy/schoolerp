import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(
  req: NextRequest,
  context: { params: { classId: string } }
) {
  const { classId } = context.params;

  try {
    const homework = await sql({
      sql: `
        SELECT 
          h.id,
          h.title,
          h.description,
          h.subject_id,
          s.subject_name,
          h.due_date,
          h.status,
          h.assigned_by,
          h.attachment_path,
          h.created_at
        FROM homework h
        LEFT JOIN subjects s ON h.subject_id = s.id
        WHERE h.class_id = ?
        ORDER BY h.created_at DESC
      `,
      values: [classId]
    });

    return NextResponse.json({ homework });
  } catch (error) {
    console.error("Error fetching homework:", error);
    return NextResponse.json(
      { error: "Failed to fetch homework" },
      { status: 500 }
    );
  }
}
