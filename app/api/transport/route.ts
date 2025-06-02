import { neon } from "@neondatabase/serverless"
import { type NextRequest, NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const routes = await sql`
      SELECT 
        tr.*,
        COUNT(st.student_id) as student_count,
        (COUNT(st.student_id) * tr.monthly_fee) as total_monthly_revenue
      FROM transport_routes tr
      LEFT JOIN students st ON tr.id = st.transport_route_id AND st.transport_opted = true
      GROUP BY tr.id
      ORDER BY tr.route_name
    `

    return NextResponse.json({ routes })
  } catch (error) {
    console.error("Error fetching transport routes:", error)
    return NextResponse.json({ error: "Failed to fetch transport routes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { route_name, pickup_points, driver_name, driver_phone, vehicle_number, capacity, monthly_fee } = body

    // Generate route code
    const routeCode = route_name.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 1000)

    const result = await sql`
      INSERT INTO transport_routes (
        route_name, route_code, pickup_points, driver_name, 
        driver_phone, vehicle_number, capacity, monthly_fee
      ) VALUES (
        ${route_name}, ${routeCode}, ${pickup_points}, ${driver_name},
        ${driver_phone}, ${vehicle_number}, ${capacity}, ${monthly_fee}
      ) RETURNING *
    `

    return NextResponse.json({ route: result[0], message: "Transport route created successfully" })
  } catch (error) {
    console.error("Error creating transport route:", error)
    return NextResponse.json({ error: "Failed to create transport route" }, { status: 500 })
  }
}
