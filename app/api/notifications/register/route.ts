import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, role, push_token } = body;

    if (!user_id || !role || !push_token) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    await sql(
      `INSERT INTO push_tokens (user_id, role, token)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE token = ?, updated_at = NOW()`,
      [user_id, role, push_token, push_token]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving push token:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
