import { type NextRequest } from "next/server"
import { sql } from "@/lib/db"

interface TransportRoute {
  id: number
  route_name: string
  route_code: string
  pickup_points: string[]
  monthly_fee: number
  driver_name: string | null
  driver_phone: string | null
  vehicle_number: string | null
  capacity: number | null
  created_at: string
}

export async function GET() {
  try {
    const routes = await sql<TransportRoute>(
      `SELECT 
        id, route_name, route_code, pickup_points,
        driver_name, driver_phone, vehicle_number,
        capacity, monthly_fee, created_at
      FROM transport_routes
      ORDER BY route_name`
    )

    return Response.json(routes)
  } catch (error) {
    console.error("Error fetching transport routes:", error)
    return Response.json(
      { error: "Failed to fetch transport routes" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      route_name,
      route_code,
      pickup_points,
      monthly_fee,
      driver_name,
      driver_phone,
      vehicle_number,
      capacity
    } = body

    const result = await sql(
      `INSERT INTO transport_routes (
        route_name, route_code, pickup_points,
        monthly_fee, driver_name, driver_phone,
        vehicle_number, capacity
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        route_name,
        route_code,
        pickup_points,
        monthly_fee,
        driver_name || null,
        driver_phone || null,
        vehicle_number || null,
        capacity || null
      ]
    )

    return Response.json({ message: "Transport route created successfully" })
  } catch (error) {
    console.error("Error creating transport route:", error)
    return Response.json(
      { error: "Failed to create transport route" },
      { status: 500 }
    )
  }
}