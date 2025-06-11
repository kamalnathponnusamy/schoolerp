import { type NextRequest } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const inventoryData = await sql(
      `SELECT 
        i.item_name,
        i.item_code,
        i.category,
        i.quantity,
        i.unit_price,
        i.total_value,
        i.minimum_stock,
        i.location,
        i.last_restocked_date,
        i.supplier_name,
        i.remarks,
        CASE 
          WHEN i.quantity <= i.minimum_stock THEN 'Low Stock'
          WHEN i.quantity = 0 THEN 'Out of Stock'
          ELSE 'In Stock'
        END as stock_status
      FROM inventory i
      ORDER BY i.category, i.item_name`
    )

    return Response.json(inventoryData)
  } catch (error) {
    console.error("Error fetching inventory reports:", error)
    return Response.json(
      { error: "Failed to fetch inventory reports" },
      { status: 500 }
    )
  }
}
