import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const settings = await sql(`
      SELECT * FROM system_settings
      ORDER BY id DESC
      LIMIT 1
    `);

    if (settings.length === 0) {
      // Return default settings if none exist
      return NextResponse.json({
        school_name: "Tamil Nadu Model School",
        logo_url: "/placeholder.svg?height=40&width=40&text=TN",
        academic_year: "2024-25",
        contact_email: "admin@tnmodelschool.edu",
        contact_phone: "+91-9876543210",
        address: "No. 123, Anna Salai, Chennai, Tamil Nadu 600002",
        transport_base_fee: 1500,
        enable_homework_tracking: true,
        enable_sms_alerts: true,
        enable_parent_portal: true,
        primary_color: "#3b82f6",
        secondary_color: "#1e40af",
        dark_mode_enabled: false
      });
    }

    return NextResponse.json(settings[0]);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      school_name,
      logo_url,
      academic_year,
      contact_email,
      contact_phone,
      address,
      transport_base_fee,
      enable_homework_tracking,
      enable_sms_alerts,
      enable_parent_portal,
      primary_color,
      secondary_color,
      dark_mode_enabled
    } = body;

    // Check if settings exist
    const existing = await sql(`
      SELECT id FROM system_settings LIMIT 1
    `);

    if (existing.length > 0) {
      // Update existing settings
      await sql(`
        UPDATE system_settings SET
          school_name = ?,
          logo_url = ?,
          academic_year = ?,
          contact_email = ?,
          contact_phone = ?,
          address = ?,
          transport_base_fee = ?,
          enable_homework_tracking = ?,
          enable_sms_alerts = ?,
          enable_parent_portal = ?,
          primary_color = ?,
          secondary_color = ?,
          dark_mode_enabled = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        school_name,
        logo_url,
        academic_year,
        contact_email,
        contact_phone,
        address,
        transport_base_fee,
        enable_homework_tracking,
        enable_sms_alerts,
        enable_parent_portal,
        primary_color,
        secondary_color,
        dark_mode_enabled,
        existing[0].id
      ]);
    } else {
      // Insert new settings
      await sql(`
        INSERT INTO system_settings (
          school_name, logo_url, academic_year, contact_email,
          contact_phone, address, transport_base_fee,
          enable_homework_tracking, enable_sms_alerts,
          enable_parent_portal, primary_color, secondary_color,
          dark_mode_enabled
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        school_name,
        logo_url,
        academic_year,
        contact_email,
        contact_phone,
        address,
        transport_base_fee,
        enable_homework_tracking,
        enable_sms_alerts,
        enable_parent_portal,
        primary_color,
        secondary_color,
        dark_mode_enabled
      ]);
    }

    return NextResponse.json({ message: "Settings saved successfully" });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}