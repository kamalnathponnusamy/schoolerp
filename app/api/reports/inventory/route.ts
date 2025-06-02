import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const inventoryData = await sql`
      SELECT 
        i.item_name,
        i.item_code,
        i.category,
        i.quantity_available,
        i.unit_price,
        COALESCE(SUM(iu.quantity_used), 0) as total_used,
        i.status
      FROM inventory i
      LEFT JOIN inventory_usage iu ON i.id = iu.inventory_id
      GROUP BY i.id, i.item_name, i.item_code, i.category, i.quantity_available, i.unit_price, i.status
      ORDER BY i.category, i.item_name
    `

    return NextResponse.json({ data: inventoryData })
  } catch (error) {
    console.error("Error fetching inventory report:", error)
    return NextResponse.json({ error: "Failed to fetch inventory report" }, { status: 500 })
  }
}
