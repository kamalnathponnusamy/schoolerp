import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const events = await sql`
      SELECT 
        e.id, e.event_name, e.description, e.event_date, e.event_time,
        u.full_name as created_by_name
      FROM events e
      JOIN users u ON e.created_by = u.id
      ORDER BY e.event_date DESC
    `

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { event_name, description, event_date, event_time } = await request.json()

    // For demo, use admin user ID 1
    const createdBy = 1

    const result = await sql`
      INSERT INTO events (event_name, description, event_date, event_time, created_by)
      VALUES (${event_name}, ${description}, ${event_date}, ${event_time}, ${createdBy})
      RETURNING id
    `

    return NextResponse.json({ message: "Event created successfully", id: result[0].id })
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
