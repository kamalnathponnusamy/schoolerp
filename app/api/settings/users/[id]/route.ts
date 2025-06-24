import { type NextRequest } from "next/server"
import { sql } from "@/lib/db"

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    if (!id) {
      return Response.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // First check if user exists
    const user = await sql(
      "SELECT * FROM users WHERE id = ?",
      [id]
    )

    if (!user || user.length === 0) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Delete the user
    await sql(
      "DELETE FROM users WHERE id = ?",
      [id]
    )

    return Response.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return Response.json(
      { error: "Failed to delete user" },
      { status: 500 }
    )
  }
}
