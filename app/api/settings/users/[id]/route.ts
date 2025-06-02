import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(params.id)

    await sql`
      DELETE FROM users WHERE id = ${userId}
    `

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
