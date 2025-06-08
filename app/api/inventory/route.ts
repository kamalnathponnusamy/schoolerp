import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// Typescript interface aligned with DB schema
interface InventoryItem {
  id: number;
  item_name: string;
  item_code: string;
  category: string;
  description?: string;
  quantity_available: number;
  unit_price?: number;
  supplier_name?: string;
  purchase_date?: string;
  expiry_date?: string;
  location?: string;
  status: string;
  created_at: string;
  stock_status: string;
  total_quantity: number;
}

export async function GET() {
  try {
    const inventory = await sql<InventoryItem>(`
      SELECT 
        i.*,
        CASE 
          WHEN i.quantity_available = 0 THEN 'out'
          WHEN i.quantity_available <= 5 THEN 'low'
          ELSE 'in_stock'
        END as stock_status,
        i.quantity_available as total_quantity
      FROM inventory i
      ORDER BY i.category, i.item_name
    `);

    return NextResponse.json(inventory);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received inventory data:', JSON.stringify(body, null, 2));

    const {
      item_name,
      item_code,
      category,
      description,
      total_quantity,
      unit_price,
      supplier,
      purchase_date,
      expiry_date,
      location,
      status
    } = body;

    // Validate required fields
    if (!item_name || !item_code || !category) {
      return NextResponse.json(
        { error: "Item name, code, and category are required" },
        { status: 400 }
      );
    }

    // Check if item_code already exists
    const existingItems = await sql(
      "SELECT id FROM inventory WHERE item_code = ?",
      [item_code]
    );

    if (existingItems.length > 0) {
      return NextResponse.json(
        { error: "Item code already exists" },
        { status: 400 }
      );
    }

    await sql(
      `INSERT INTO inventory (
        item_name, item_code, category, description,
        quantity_available, unit_price, supplier_name,
        purchase_date, expiry_date, location, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item_name,
        item_code,
        category,
        description || null,
        total_quantity || 0,
        unit_price || null,
        supplier || null,
        purchase_date || null,
        expiry_date || null,
        location || null,
        status || "active"
      ]
    );

    return NextResponse.json({ message: "Inventory item created successfully" });
  } catch (error) {
    console.error("Error creating inventory item:", error);
    return NextResponse.json({ error: "Failed to create inventory item" }, { status: 500 });
  }
}
