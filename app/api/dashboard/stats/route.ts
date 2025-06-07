import pool from '@/lib/mysql';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [studentsResult] = await pool.query(`
      SELECT COUNT(*) as count FROM students WHERE status = 'active'
    `);
    const totalStudents = parseInt(studentsResult[0]?.count || "0");

    const [teachersResult] = await pool.query(`
      SELECT COUNT(*) as count FROM users WHERE role = 'teacher'
    `);
    const totalTeachers = parseInt(teachersResult[0]?.count || "0");

    const [classesResult] = await pool.query(`SELECT COUNT(*) as count FROM classes`);
    const totalClasses = parseInt(classesResult[0]?.count || "0");

    const [pendingFeesResult] = await pool.query(`
      SELECT 
        COALESCE(SUM(total_amount - paid_amount), 0) as total_pending,
        COUNT(*) as pending_count
      FROM fees 
      WHERE status = 'pending'
    `);
    const pendingFees = parseFloat(pendingFeesResult[0]?.total_pending || "0");

    const [attendanceResult] = await pool.query(`
      SELECT 
        COUNT(*) as total_marked,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count
      FROM attendance 
      WHERE date = CURDATE()
    `);
    const totalMarked = parseInt(attendanceResult[0]?.total_marked || "0");
    const presentCount = parseInt(attendanceResult[0]?.present_count || "0");
    const attendancePercentage = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0;

    const [upcomingExamsResult] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM exams 
      WHERE exam_date >= CURDATE() 
        AND exam_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
    `);
    const upcomingExams = parseInt(upcomingExamsResult[0]?.count || "0");

    const [recentActivities] = await pool.query(`
      SELECT 
        'Student Admission' as type,
        u.full_name as description,
        s.created_at as timestamp
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      ORDER BY s.created_at DESC
      LIMIT 5
    `);

    const [feeStatsResult] = await pool.query(`
      SELECT 
        SUM(total_amount) as total_fees,
        SUM(paid_amount) as collected_fees,
        COUNT(*) as total_records
      FROM fees
    `);
    const totalFees = parseFloat(feeStatsResult[0]?.total_fees || "0");
    const collectedFees = parseFloat(feeStatsResult[0]?.collected_fees || "0");
    const collectionPercentage = totalFees > 0 ? Math.round((collectedFees / totalFees) * 100) : 0;

    const stats = {
      totalStudents,
      totalTeachers,
      totalClasses,
      pendingFees,
      todayAttendance: attendancePercentage,
      upcomingExams,
      collectionPercentage,
      recentActivities: recentActivities || [],
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
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
    });
  }
}
