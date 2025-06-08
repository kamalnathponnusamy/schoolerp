import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

interface CountResult {
  count: string
}

interface PendingFeesResult {
  total_pending: string
  pending_count: string
}

interface AttendanceResult {
  total_marked: string
  present_count: string
}

interface RecentActivity {
  type: string
  description: string
  date: string
  class?: string
}

interface FeeStatsResult {
  total_fees: string
  collected_fees: string
  total_records: string
}

export async function GET() {
  try {
    // Get total students
    const totalStudentsResult = await sql<CountResult>(
      "SELECT COUNT(*) as count FROM students WHERE status = 'active'"
    )
    const totalStudents = Number.parseInt(totalStudentsResult[0]?.count || "0")

    // Get total teachers
    const totalTeachersResult = await sql<CountResult>(
      "SELECT COUNT(*) as count FROM users WHERE role = 'teacher'"
    )
    const totalTeachers = Number.parseInt(totalTeachersResult[0]?.count || "0")

    // Get total classes
    const totalClassesResult = await sql<CountResult>(
      "SELECT COUNT(*) as count FROM classes"
    )
    const totalClasses = Number.parseInt(totalClassesResult[0]?.count || "0")

    // Get pending fees with correct column names
    const pendingFeesResult = await sql<PendingFeesResult>(
      `SELECT 
        COALESCE(SUM(total_amount - paid_amount), 0) as total_pending,
        COUNT(*) as pending_count
      FROM fees 
      WHERE status = 'pending'`
    )
    const pendingFees = Number.parseFloat(pendingFeesResult[0]?.total_pending || "0")

    // Get today's attendance with safe percentage calculation
    const todayAttendanceResult = await sql<AttendanceResult>(
      `SELECT 
        COUNT(*) as total_marked,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count
      FROM attendance 
      WHERE date = CURRENT_DATE`
    )

    const totalMarked = Number.parseInt(todayAttendanceResult[0]?.total_marked || "0")
    const presentCount = Number.parseInt(todayAttendanceResult[0]?.present_count || "0")

    // Safe attendance percentage calculation
    const attendancePercentage = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0

    // Get upcoming exams
    const upcomingExamsResult = await sql<CountResult>(
      `SELECT COUNT(*) as count 
      FROM exams 
      WHERE exam_date >= CURRENT_DATE 
      AND exam_date <= DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY)`
    )
    const upcomingExams = Number.parseInt(upcomingExamsResult[0]?.count || "0")

    // Get recent activities with proper joins
    const recentActivities = await sql<RecentActivity>(
      `SELECT 
        'Student Admission' as type,
        u.full_name as description,
        s.created_at as date,
        CONCAT(c.class_name, ' - ', c.section) as class
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      WHERE s.created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)
      ORDER BY s.created_at DESC
      LIMIT 5`
    )

    // Get fee collection stats
    const feeStatsResult = await sql<FeeStatsResult>(
      `SELECT 
        SUM(total_amount) as total_fees,
        SUM(paid_amount) as collected_fees,
        COUNT(*) as total_records
      FROM fees`
    )

    const totalFees = Number.parseFloat(feeStatsResult[0]?.total_fees || "0")
    const collectedFees = Number.parseFloat(feeStatsResult[0]?.collected_fees || "0")
    const totalRecords = Number.parseInt(feeStatsResult[0]?.total_records || "0")

    return NextResponse.json({
      stats: {
        totalStudents,
        totalTeachers,
        totalClasses,
        pendingFees,
        attendancePercentage,
        upcomingExams,
        recentActivities,
        feeCollection: {
          totalFees,
          collectedFees,
          totalRecords,
          collectionRate: totalFees > 0 ? Math.round((collectedFees / totalFees) * 100) : 0
        }
      }
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
