import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const settings = await sql`
      SELECT * FROM system_settings
      ORDER BY id DESC
      LIMIT 1
    `

    if (settings.length === 0) {
      // Return default settings if none exist
      return NextResponse.json({
        settings: {
          school_name: "Bright Future School",
          logo_url: "/placeholder.svg?height=40&width=40&text=School",
          academic_year: "2024-25",
          contact_email: "admin@brightfuture.edu",
          contact_phone: "+91-9876543210",
          address: "Chennai, Tamil Nadu, India",
          transport_base_fee: 1500,
          enable_homework_tracking: true,
          enable_sms_alerts: false,
          enable_parent_portal: true,
          primary_color: "#3b82f6",
          secondary_color: "#1e40af",
          dark_mode_enabled: false,
        },
      })
    }

    // Convert the flat settings to structured object
    const settingsObj = settings[0]

    return NextResponse.json({ settings: settingsObj })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const settingsData = await request.json()

    // Check if settings exist
    const existingSettings = await sql`
      SELECT id FROM system_settings LIMIT 1
    `

    if (existingSettings.length > 0) {
      // Update existing settings
      await sql`
        UPDATE system_settings SET
          school_name = ${settingsData.school_name},
          logo_url = ${settingsData.logo_url},
          academic_year = ${settingsData.academic_year},
          contact_email = ${settingsData.contact_email},
          contact_phone = ${settingsData.contact_phone},
          address = ${settingsData.address},
          transport_base_fee = ${settingsData.transport_base_fee},
          enable_homework_tracking = ${settingsData.enable_homework_tracking},
          enable_sms_alerts = ${settingsData.enable_sms_alerts},
          enable_parent_portal = ${settingsData.enable_parent_portal},
          primary_color = ${settingsData.primary_color},
          secondary_color = ${settingsData.secondary_color},
          dark_mode_enabled = ${settingsData.dark_mode_enabled},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existingSettings[0].id}
      `
    } else {
      // Insert new settings
      await sql`
        INSERT INTO system_settings (
          school_name, logo_url, academic_year, contact_email, contact_phone,
          address, transport_base_fee, enable_homework_tracking, enable_sms_alerts,
          enable_parent_portal, primary_color, secondary_color, dark_mode_enabled
        ) VALUES (
          ${settingsData.school_name}, ${settingsData.logo_url}, ${settingsData.academic_year},
          ${settingsData.contact_email}, ${settingsData.contact_phone}, ${settingsData.address},
          ${settingsData.transport_base_fee}, ${settingsData.enable_homework_tracking},
          ${settingsData.enable_sms_alerts}, ${settingsData.enable_parent_portal},
          ${settingsData.primary_color}, ${settingsData.secondary_color}, ${settingsData.dark_mode_enabled}
        )
      `
    }

    return NextResponse.json({ message: "Settings saved successfully" })
  } catch (error) {
    console.error("Error saving settings:", error)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}
