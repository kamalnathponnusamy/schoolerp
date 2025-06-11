import { type NextRequest } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    // Create Events table
    await sql(
      `CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_name VARCHAR(200) NOT NULL,
        description TEXT,
        event_date DATE NOT NULL,
        event_time TIME,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )`
    )

    // Create Inventory table
    await sql(
      `CREATE TABLE IF NOT EXISTS inventory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item_name VARCHAR(200) NOT NULL,
        item_code VARCHAR(50) UNIQUE,
        category VARCHAR(100),
        quantity INT DEFAULT 0,
        unit_price DECIMAL(10,2),
        total_value DECIMAL(10,2),
        minimum_stock INT DEFAULT 0,
        location VARCHAR(200),
        last_restocked_date DATE,
        supplier_name VARCHAR(200),
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`
    )

    // Create Transport Routes table
    await sql(
      `CREATE TABLE IF NOT EXISTS transport_routes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        route_name VARCHAR(200) NOT NULL,
        route_code VARCHAR(50) UNIQUE,
        vehicle_number VARCHAR(20),
        driver_name VARCHAR(200),
        driver_phone VARCHAR(20),
        capacity INT,
        fare_amount DECIMAL(10,2),
        pickup_time TIME,
        dropoff_time TIME,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`
    )

    return Response.json({ message: "Additional tables created successfully" })
  } catch (error) {
    console.error("Error creating additional tables:", error)
    return Response.json(
      { error: "Failed to create additional tables" },
      { status: 500 }
    )
  }
}
