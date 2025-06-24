import { type NextRequest } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const transportData = await sql(
      `SELECT 
        tr.route_name,
        tr.route_code,
        tr.vehicle_number,
        tr.driver_name,
        tr.driver_phone,
        tr.capacity,
        COUNT(s.id) as current_students,
        tr.fare_amount,
        tr.pickup_time,
        tr.dropoff_time,
        tr.status,
        GROUP_CONCAT(DISTINCT c.class_name || ' - ' || c.section) as classes_served
      FROM transport_routes tr
      LEFT JOIN students s ON tr.id = s.transport_route_id AND s.status = 'active'
      LEFT JOIN classes c ON s.class_id = c.id
      GROUP BY tr.id, tr.route_name, tr.route_code, tr.vehicle_number, 
               tr.driver_name, tr.driver_phone, tr.capacity, tr.fare_amount,
               tr.pickup_time, tr.dropoff_time, tr.status
      ORDER BY tr.route_name`
    )

    return Response.json(transportData)
  } catch (error) {
    console.error("Error fetching transport reports:", error)
    return Response.json(
      { error: "Failed to fetch transport reports" },
      { status: 500 }
    )
  }
}
