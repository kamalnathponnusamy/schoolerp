import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // First check if inventory table exists and has required columns
    const tableCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'inventory' 
      AND table_schema = 'public'
    `

    if (tableCheck.length === 0) {
      // Create inventory table if it doesn't exist
      await sql`
        CREATE TABLE IF NOT EXISTS inventory (
          id SERIAL PRIMARY KEY,
          item_code VARCHAR(50) UNIQUE NOT NULL,
          item_name VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          description TEXT,
          available_quantity INTEGER DEFAULT 0,
          issued_quantity INTEGER DEFAULT 0,
          unit_price DECIMAL(10,2) DEFAULT 0,
          supplier VARCHAR(255),
          purchase_date DATE DEFAULT CURRENT_DATE,
          min_stock_level INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `

      // Insert sample data
      await sql`
        INSERT INTO inventory (item_code, item_name, category, description, available_quantity, issued_quantity, unit_price, supplier, min_stock_level)
        VALUES 
          ('BK001', 'Mathematics Textbook Grade 10', 'Books', 'NCERT Mathematics textbook for class 10', 150, 50, 250.00, 'Educational Publishers Ltd', 20),
          ('ST001', 'Blue Ballpoint Pens', 'Stationery', 'Pack of 10 blue ballpoint pens', 500, 100, 50.00, 'Office Supplies Co', 50),
          ('LB001', 'Chemistry Lab Equipment Set', 'Laboratory', 'Basic chemistry lab equipment for experiments', 25, 5, 2500.00, 'Scientific Instruments Inc', 5),
          ('SP001', 'Football', 'Sports', 'Standard size football for sports activities', 20, 8, 800.00, 'Sports Equipment Ltd', 5),
          ('UN001', 'School Uniform Shirt', 'Uniform', 'White cotton shirt with school logo', 200, 80, 350.00, 'Uniform Manufacturers', 30)
        ON CONFLICT (item_code) DO NOTHING
      `
    }

    const inventory = await sql`
      SELECT 
        i.*,
        CASE 
          WHEN i.available_quantity <= i.min_stock_level AND i.available_quantity > 0 THEN 'low_stock'
          WHEN i.available_quantity = 0 THEN 'out_of_stock'
          ELSE 'in_stock'
        END as stock_status,
        (COALESCE(i.available_quantity, 0) + COALESCE(i.issued_quantity, 0)) as total_quantity
      FROM inventory i
      ORDER BY i.category, i.item_name
    `

    return NextResponse.json({ inventory })
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch inventory",
        details: error.message,
        inventory: [],
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { item_name, category, description, total_quantity, unit_price, supplier, min_stock_level } = body

    // Validate required fields
    if (!item_name || !category || !total_quantity || !unit_price || !supplier || !min_stock_level) {
      return NextResponse.json({ error: "All required fields must be provided" }, { status: 400 })
    }

    // Validate numeric fields
    const qty = Number(total_quantity)
    const price = Number(unit_price)
    const minStock = Number(min_stock_level)

    if (isNaN(qty) || isNaN(price) || isNaN(minStock) || qty < 0 || price < 0 || minStock < 0) {
      return NextResponse.json({ error: "Invalid numeric values provided" }, { status: 400 })
    }

    // Generate item code
    const categoryCode = category.substring(0, 3).toUpperCase()
    const randomNum = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")
    const itemCode = `${categoryCode}${randomNum}`

    const result = await sql`
      INSERT INTO inventory (
        item_code, item_name, category, description, 
        available_quantity, issued_quantity, unit_price, 
        supplier, purchase_date, min_stock_level
      ) VALUES (
        ${itemCode}, ${item_name}, ${category}, ${description || ""}, 
        ${qty}, 0, ${price}, 
        ${supplier}, CURRENT_DATE, ${minStock}
      )
      RETURNING *
    `

    return NextResponse.json({
      item: result[0],
      message: "Inventory item created successfully",
    })
  } catch (error) {
    console.error("Error creating inventory item:", error)
    return NextResponse.json({ error: "Failed to create inventory item" }, { status: 500 })
  }
}
