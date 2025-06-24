import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400 }
      );
    }

    const subjects = await sql(
      `SELECT 
        s.id,
        s.subject_name,
        s.subject_code,
        s.description,
        s.created_at
      FROM school_erp.subjects s
      WHERE s.class_id = ?
      ORDER BY s.subject_name`,
      [classId]
    );

    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects by class:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    );
  }
}
