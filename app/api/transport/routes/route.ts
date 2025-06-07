import { sql } from "@/lib/mysql"; // ✅ Fixed import
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const routes = await sql(
      `
      SELECT 
        tr.id,
        tr.route_name,
        tr.route_code,
        tr.driver_name,
        tr.driver_phone,
        tr.vehicle_number,
        tr.capacity,
        tr.pickup_points,
        tr.monthly_fee,
        COUNT(s.id) as student_count
      FROM transport_routes tr
      LEFT JOIN students s ON tr.id = s.transport_route_id AND s.transport_opted = true
      GROUP BY tr.id, tr.route_name, tr.route_code, tr.driver_name, tr.driver_phone, 
               tr.vehicle_number, tr.capacity, tr.pickup_points, tr.monthly_fee
      ORDER BY tr.route_name
    `
    );

    return NextResponse.json(routes);
  } catch (error) {
    console.error("Error fetching transport routes:", error);
    return NextResponse.json({ error: "Failed to fetch transport routes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      route_name,
      route_code,
      pickup_points,
      driver_name,
      driver_phone,
      vehicle_number,
      capacity,
      monthly_fee,
    } = body;

    const result = await sql(
      `
      INSERT INTO transport_routes (
        route_name, route_code, pickup_points, driver_name, 
        driver_phone, vehicle_number, capacity, monthly_fee
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        route_name,
        route_code,
        pickup_points,
        driver_name,
        driver_phone,
        vehicle_number,
        capacity,
        monthly_fee,
      ]
    );

    return NextResponse.json({
      message: "Route created successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating transport route:", error);
    return NextResponse.json({ error: "Failed to create transport route" }, { status: 500 });
  }
}
