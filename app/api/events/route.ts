import { type NextRequest } from "next/server"
import { sql } from "@/lib/db"

interface SqlResult {
  insertId: number
  affectedRows: number
}

export async function GET(request: NextRequest) {
  try {
    const events = await sql(
      `SELECT 
        e.id, e.event_name, e.description, e.event_date, e.event_time,
        u.full_name as created_by_name
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      ORDER BY e.event_date DESC, e.event_time DESC`
    )

    return Response.json(events)
  } catch (error) {
    console.error("Error fetching events:", error)
    return Response.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { event_name, description, event_date, event_time } = await request.json()

    if (!event_name || !event_date) {
      return Response.json(
        { error: "Event name and date are required" },
        { status: 400 }
      )
    }

    // For demo, use user ID 1 as the creator
    const created_by = 1

    const result = await sql(
      `INSERT INTO events (event_name, description, event_date, event_time, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [event_name, description, event_date, event_time, created_by]
    )

    // Get the last inserted ID
    const [lastInsert] = await sql(
      "SELECT LAST_INSERT_ID() as id"
    )

    return Response.json({ message: "Event created successfully", id: lastInsert.id })
  } catch (error) {
    console.error("Error creating event:", error)
    return Response.json(
      { error: "Failed to create event" },
      { status: 500 }
    )
  }
}
