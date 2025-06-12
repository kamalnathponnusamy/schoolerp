import { sql } from "@/lib/db"
import ClassDetailsClient from "./ClassDetailsClient"

export const dynamic = "force-static"

export async function generateStaticParams() {
  const classes = await sql("SELECT id FROM classes")
  return classes.map((cls: { id: string }) => ({
    id: cls.id.toString(),
  }))
}

export default function Page({ params }: { params: { id: string } }) {
  return <ClassDetailsClient id={params.id} />
}
