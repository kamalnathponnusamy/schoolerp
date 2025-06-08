import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Get total students
    const totalStudentsResult = await sql`
      SELECT COUNT(*) as count FROM students WHERE status = 'active'
    `
    const totalStudents = Number.parseInt(totalStudentsResult[0]?.count || "0")

    // Get total teachers
    const totalTeachersResult = await sql`
      SELECT COUNT(*) as count FROM users WHERE role = 'teacher'
    `
    const totalTeachers = Number.parseInt(totalTeachersResult[0]?.count || "0")

    // Get total classes
    const totalClassesResult = await sql`
      SELECT COUNT(*) as count FROM classes
    `
    const totalClasses = Number.parseInt(totalClassesResult[0]?.count || "0")

    // Get pending fees with correct column names
    const pendingFeesResult = await sql`
      SELECT 
        COALESCE(SUM(total_amount - paid_amount), 0) as total_pending,
        COUNT(*) as pending_count
      FROM fees 
      WHERE status = 'pending'
    `
    const pendingFees = Number.parseFloat(pendingFeesResult[0]?.total_pending || "0")

    // Get today's attendance with safe percentage calculation
    const todayAttendanceResult = await sql`
      SELECT 
        COUNT(*) as total_marked,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count
      FROM attendance 
      WHERE date = CURRENT_DATE
    `

    const totalMarked = Number.parseInt(todayAttendanceResult[0]?.total_marked || "0")
    const presentCount = Number.parseInt(todayAttendanceResult[0]?.present_count || "0")

    // Safe attendance percentage calculation
    const attendancePercentage = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0

    // Get upcoming exams
    const upcomingExamsResult = await sql`
      SELECT COUNT(*) as count 
      FROM exams 
      WHERE exam_date >= CURRENT_DATE 
      AND exam_date <= CURRENT_DATE + INTERVAL '7 days'
    `
    const upcomingExams = Number.parseInt(upcomingExamsResult[0]?.count || "0")

    // Get recent activities with proper joins
    const recentActivities = await sql`
      SELECT 
        'Student Admission' as type,
        u.full_name as description,
        s.created_at as timestamp
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.created_at >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY s.created_at DESC
      LIMIT 5
    `

    // Get fee collection stats
    const feeStatsResult = await sql`
      SELECT 
        SUM(total_amount) as total_fees,
        SUM(paid_amount) as collected_fees,
        COUNT(*) as total_records
      FROM fees
    `

    const totalFees = Number.parseFloat(feeStatsResult[0]?.total_fees || "0")
    const collectedFees = Number.parseFloat(feeStatsResult[0]?.collected_fees || "0")
    const collectionPercentage = totalFees > 0 ? Math.round((collectedFees / totalFees) * 100) : 0

    const stats = {
      totalStudents,
      totalTeachers,
      totalClasses,
      pendingFees,
      todayAttendance: attendancePercentage,
      upcomingExams,
      collectionPercentage,
      recentActivities: recentActivities || [],
    }

    console.log("Dashboard stats calculated successfully:", stats)

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)

    // Return safe defaults with error info
    return NextResponse.json({
      totalStudents: 0,
      totalTeachers: 0,
      totalClasses: 0,
      pendingFees: 0,
      todayAttendance: 0,
      upcomingExams: 0,
      collectionPercentage: 0,
      recentActivities: [],
      error: "Failed to fetch statistics",
    })
  }
}
