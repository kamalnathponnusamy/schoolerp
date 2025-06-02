import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST() {
  try {
    // Create Events table
    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        event_name VARCHAR(200) NOT NULL,
        description TEXT,
        event_date DATE NOT NULL,
        event_time TIME,
        image_url TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create Assignments table
    await sql`
      CREATE TABLE IF NOT EXISTS assignments (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        subject_id INTEGER REFERENCES subjects(id),
        class_id INTEGER REFERENCES classes(id),
        teacher_id INTEGER REFERENCES users(id),
        due_date DATE NOT NULL,
        assigned_date DATE DEFAULT CURRENT_DATE,
        attachment_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    return NextResponse.json({ message: "Additional tables created successfully" })
  } catch (error) {
    console.error("Error creating tables:", error)
    return NextResponse.json({ error: "Failed to create tables" }, { status: 500 })
  }
}
